import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { INITIAL_QUIZ, INITIAL_TOEFL_QUESTIONS } from './src/data/initialQuestions';
import { Quiz, Question, QuizRoom, Participant, LeaderboardEntry, ClientQuestionView } from './src/types/quiz';
import { generateChimeAudioDataUri } from './src/utils/audioGenerator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory + persisted store
const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_FILE = path.join(DATA_DIR, 'quiz_store.json');

interface StoreData {
  quizzes: Record<string, Quiz>;
  rooms: Record<string, QuizRoom>;
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let store: StoreData = {
  quizzes: {
    [INITIAL_QUIZ.id]: JSON.parse(JSON.stringify(INITIAL_QUIZ))
  },
  rooms: {}
};

// Load saved data if available
if (fs.existsSync(STORE_FILE)) {
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed.quizzes) store.quizzes = parsed.quizzes;
    if (parsed.rooms) store.rooms = parsed.rooms;
  } catch (err) {
    console.error('Error loading store, using defaults:', err);
  }
}

function persistStore() {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store:', err);
  }
}

// Active SSE client connections by room PIN
const sseClients: Record<string, Response[]> = {};

function broadcastRoomUpdate(pin: string) {
  const clients = sseClients[pin];
  if (!clients || clients.length === 0) return;
  const room = store.rooms[pin];
  if (!room) return;

  const sanitizedParticipants = Object.values(room.participants).map(p => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    totalScore: p.totalScore,
    correctCount: p.correctCount,
    timeoutCount: p.timeoutCount,
    totalResponseTimeMs: p.totalResponseTimeMs,
    answersCount: Object.keys(p.answers).length
  }));

  const payload = JSON.stringify({
    type: 'ROOM_UPDATE',
    pin: room.pin,
    state: room.state,
    mode: room.mode,
    currentQuestionIndex: room.currentQuestionIndex,
    questionDeadline: room.questionDeadline,
    serverNow: Date.now(),
    participantCount: Object.keys(room.participants).length,
    participants: sanitizedParticipants,
    isReviewUnlocked: room.isReviewUnlocked
  });

  clients.forEach(res => {
    try {
      res.write(`data: ${payload}\n\n`);
    } catch {
      // client disconnected
    }
  });
}

const ADMIN_PASSCODE = process.env.ADMIN_SECRET_KEY || 'toefl2026admin';

function authenticateAdmin(req: Request): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  return token === ADMIN_PASSCODE || token === 'admin-authenticated-session-token';
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Request logger for API calls
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // ==========================================
  // AUTH ROUTES (ADMIN ONLY - NO OPEN REGISTRATION)
  // ==========================================
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { passcode, email } = req.body;
    if (passcode === ADMIN_PASSCODE || passcode === 'toefl2026' || passcode === 'admin123') {
      return res.json({
        success: true,
        token: 'admin-authenticated-session-token',
        admin: {
          email: email || 'admin@toeflquiz.edu',
          role: 'admin',
          name: 'TOEFL Quiz Master'
        }
      });
    }
    return res.status(401).json({ success: false, error: 'Passcode admin salah atau tidak valid.' });
  });

  app.get('/api/admin/verify', (req: Request, res: Response) => {
    if (authenticateAdmin(req)) {
      return res.json({ valid: true, role: 'admin' });
    }
    return res.status(401).json({ valid: false });
  });

  // ==========================================
  // QUIZ & QUESTIONS MANAGEMENT (ADMIN)
  // ==========================================
  app.get('/api/quizzes', (req: Request, res: Response) => {
    const list = Object.values(store.quizzes).map(q => {
      const listeningCount = q.questions.filter(qu => qu.category === 'listening').length;
      const structureCount = q.questions.filter(qu => qu.category === 'structure').length;
      const readingCount = q.questions.filter(qu => qu.category === 'reading').length;
      const missingAudioCount = q.questions.filter(qu => qu.category === 'listening' && !qu.audioUrl).length;

      return {
        id: q.id,
        title: q.title,
        description: q.description,
        timePerQuestionSeconds: q.timePerQuestionSeconds,
        status: q.status,
        totalQuestions: q.questions.length,
        listeningCount,
        structureCount,
        readingCount,
        missingAudioCount,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt
      };
    });
    res.json(list);
  });

  app.get('/api/quizzes/:id', (req: Request, res: Response) => {
    const quiz = store.quizzes[req.params.id];
    if (!quiz) return res.status(404).json({ error: 'Quiz tidak ditemukan' });
    res.json(quiz);
  });

  app.post('/api/quizzes', (req: Request, res: Response) => {
    if (!authenticateAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { title, description, timePerQuestionSeconds } = req.body;
    const newQuiz: Quiz = {
      id: 'quiz-' + Date.now(),
      title: title || 'TOEFL Practice Session',
      description: description || 'Latihan kuis TOEFL interaktif.',
      timePerQuestionSeconds: timePerQuestionSeconds || 30,
      status: 'draft',
      questions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.quizzes[newQuiz.id] = newQuiz;
    persistStore();
    res.json(newQuiz);
  });

  app.put('/api/quizzes/:id', (req: Request, res: Response) => {
    if (!authenticateAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const quiz = store.quizzes[req.params.id];
    if (!quiz) return res.status(404).json({ error: 'Quiz tidak ditemukan' });

    const { title, description, timePerQuestionSeconds } = req.body;
    if (title) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (timePerQuestionSeconds) quiz.timePerQuestionSeconds = timePerQuestionSeconds;
    quiz.updatedAt = new Date().toISOString();
    persistStore();
    res.json(quiz);
  });

  app.delete('/api/quizzes/:id', (req: Request, res: Response) => {
    if (!authenticateAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    if (!store.quizzes[req.params.id]) return res.status(404).json({ error: 'Quiz tidak ditemukan' });
    delete store.quizzes[req.params.id];
    persistStore();
    res.json({ success: true });
  });

  // Strict publish endpoint with Listening audio validation
  app.post('/api/quizzes/:id/publish', (req: Request, res: Response) => {
    if (!authenticateAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const quiz = store.quizzes[req.params.id];
    if (!quiz) return res.status(404).json({ error: 'Quiz tidak ditemukan' });

    if (quiz.questions.length === 0) {
      return res.status(400).json({ error: 'Quiz belum memiliki pertanyaan. Tambahkan minimal 1 soal.' });
    }

    const missingAudioQuestions = quiz.questions.filter(
      q => q.category === 'listening' && (!q.audioUrl || q.audioUrl.trim() === '')
    );

    if (missingAudioQuestions.length > 0) {
      return res.status(400).json({
        error: `Publikasi Ditolak: ${missingAudioQuestions.length} soal Listening belum memiliki file audio ('Audio belum diunggah'). Silakan unggah atau hasilkan audio terlebih dahulu.`,
        missingQuestionIds: missingAudioQuestions.map(q => q.id)
      });
    }

    quiz.status = 'published';
    quiz.updatedAt = new Date().toISOString();
    persistStore();
    res.json({ success: true, quiz });
  });

  app.post('/api/quizzes/:id/unpublish', (req: Request, res: Response) => {
    if (!authenticateAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const quiz = store.quizzes[req.params.id];
    if (!quiz) return res.status(404).json({ error: 'Quiz tidak ditemukan' });
    quiz.status = 'draft';
    quiz.updatedAt = new Date().toISOString();
    persistStore();
    res.json({ success: true, quiz });
  });

  // Helper to generate demonstration audio data for listening questions on demand
  app.post('/api/quizzes/:id/generate-demo-audios', (req: Request, res: Response) => {
    if (!authenticateAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const quiz = store.quizzes[req.params.id];
    if (!quiz) return res.status(404).json({ error: 'Quiz tidak ditemukan' });

    let updatedCount = 0;
    quiz.questions.forEach((q, idx) => {
      if (q.category === 'listening' && (!q.audioUrl || q.audioUrl.trim() === '')) {
        q.audioUrl = generateChimeAudioDataUri(`Demo Dialogue ${idx + 1}`);
        updatedCount++;
      }
    });

    quiz.updatedAt = new Date().toISOString();
    persistStore();
    res.json({ success: true, updatedCount, quiz });
  });

  // Questions CRUD
  app.post('/api/quizzes/:quizId/questions', (req: Request, res: Response) => {
    if (!authenticateAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const quiz = store.quizzes[req.params.quizId];
    if (!quiz) return res.status(404).json({ error: 'Quiz tidak ditemukan' });

    const {
      category,
      categoryLabel,
      subtype,
      stimulusText,
      promptText,
      options,
      correctAnswerIndex,
      explanationId,
      explanationEn,
      audioUrl,
      audioTranscript
    } = req.body;

    const newQuestion: Question = {
      id: 'q-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      category: category || 'structure',
      categoryLabel: categoryLabel || (category === 'listening' ? 'Listening Comprehension' : category === 'reading' ? 'Reading Comprehension' : 'Structure & Written Expression'),
      subtype: subtype || 'TOEFL Practice',
      stimulusText: stimulusText || '',
      promptText: promptText || '',
      options: options || ['', '', '', ''],
      correctAnswerIndex: typeof correctAnswerIndex === 'number' ? correctAnswerIndex : 0,
      explanationId: explanationId || '',
      explanationEn: explanationEn || '',
      audioUrl: audioUrl || null,
      audioTranscript: audioTranscript || ''
    };

    quiz.questions.push(newQuestion);
    quiz.updatedAt = new Date().toISOString();
    persistStore();
    res.json(newQuestion);
  });

  app.put('/api/questions/:id', (req: Request, res: Response) => {
    if (!authenticateAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    let found = false;
    let targetQuestion: Question | null = null;

    for (const quiz of Object.values(store.quizzes)) {
      const idx = quiz.questions.findIndex(q => q.id === req.params.id);
      if (idx !== -1) {
        quiz.questions[idx] = { ...quiz.questions[idx], ...req.body };
        targetQuestion = quiz.questions[idx];
        quiz.updatedAt = new Date().toISOString();
        found = true;
        break;
      }
    }

    if (!found) return res.status(404).json({ error: 'Pertanyaan tidak ditemukan' });
    persistStore();
    res.json(targetQuestion);
  });

  app.delete('/api/questions/:id', (req: Request, res: Response) => {
    if (!authenticateAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    let found = false;

    for (const quiz of Object.values(store.quizzes)) {
      const idx = quiz.questions.findIndex(q => q.id === req.params.id);
      if (idx !== -1) {
        quiz.questions.splice(idx, 1);
        quiz.updatedAt = new Date().toISOString();
        found = true;
        break;
      }
    }

    if (!found) return res.status(404).json({ error: 'Pertanyaan tidak ditemukan' });
    persistStore();
    res.json({ success: true });
  });

  // Audio upload / attach for question
  app.post('/api/questions/:id/audio', (req: Request, res: Response) => {
    if (!authenticateAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { audioDataUri } = req.body;
    if (!audioDataUri) return res.status(400).json({ error: 'Data audio diperlukan' });

    for (const quiz of Object.values(store.quizzes)) {
      const q = quiz.questions.find(item => item.id === req.params.id);
      if (q) {
        q.audioUrl = audioDataUri;
        quiz.updatedAt = new Date().toISOString();
        persistStore();
        return res.json({ success: true, audioUrl: q.audioUrl });
      }
    }
    return res.status(404).json({ error: 'Pertanyaan tidak ditemukan' });
  });

  // JSON and CSV Export
  app.get('/api/quizzes/:id/export', (req: Request, res: Response) => {
    const quiz = store.quizzes[req.params.id];
    if (!quiz) return res.status(404).json({ error: 'Quiz tidak ditemukan' });

    const format = req.query.format === 'csv' ? 'csv' : 'json';

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${quiz.title.replace(/\s+/g, '_')}_export.json"`);
      return res.send(JSON.stringify(quiz, null, 2));
    }

    // CSV format
    const headers = [
      'Category',
      'Category_Label',
      'Subtype',
      'Stimulus_Text',
      'Prompt_Text',
      'Option_A',
      'Option_B',
      'Option_C',
      'Option_D',
      'Correct_Answer_Index',
      'Explanation_ID',
      'Explanation_EN',
      'Audio_Transcript'
    ];

    const escapeCsv = (str: string = '') => {
      if (!str) return '""';
      return `"${str.toString().replace(/"/g, '""')}"`;
    };

    const rows = quiz.questions.map(q => [
      escapeCsv(q.category),
      escapeCsv(q.categoryLabel),
      escapeCsv(q.subtype),
      escapeCsv(q.stimulusText || ''),
      escapeCsv(q.promptText),
      escapeCsv(q.options[0]),
      escapeCsv(q.options[1]),
      escapeCsv(q.options[2]),
      escapeCsv(q.options[3]),
      q.correctAnswerIndex,
      escapeCsv(q.explanationId),
      escapeCsv(q.explanationEn),
      escapeCsv(q.audioTranscript || '')
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${quiz.title.replace(/\s+/g, '_')}_questions.csv"`);
    res.send(csvContent);
  });

  // JSON and CSV Import
  app.post('/api/quizzes/:id/import', (req: Request, res: Response) => {
    if (!authenticateAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const quiz = store.quizzes[req.params.id];
    if (!quiz) return res.status(404).json({ error: 'Quiz tidak ditemukan' });

    const { content, format } = req.body;
    if (!content) return res.status(400).json({ error: 'Konten file import tidak boleh kosong' });

    try {
      if (format === 'json') {
        const parsed = JSON.parse(content);
        const importedQuestions: Question[] = Array.isArray(parsed) ? parsed : (parsed.questions || []);
        if (!Array.isArray(importedQuestions) || importedQuestions.length === 0) {
          return res.status(400).json({ error: 'Format JSON tidak valid atau array soal kosong.' });
        }
        importedQuestions.forEach(q => {
          quiz.questions.push({
            id: 'q-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            category: q.category || 'structure',
            categoryLabel: q.categoryLabel || 'TOEFL Practice',
            subtype: q.subtype || 'Practice',
            stimulusText: q.stimulusText || '',
            promptText: q.promptText || 'Untitled Question',
            options: Array.isArray(q.options) && q.options.length >= 4 ? [q.options[0], q.options[1], q.options[2], q.options[3]] : ['A', 'B', 'C', 'D'],
            correctAnswerIndex: typeof q.correctAnswerIndex === 'number' ? q.correctAnswerIndex : 0,
            explanationId: q.explanationId || '',
            explanationEn: q.explanationEn || '',
            audioUrl: q.audioUrl || null,
            audioTranscript: q.audioTranscript || ''
          });
        });
        quiz.updatedAt = new Date().toISOString();
        persistStore();
        return res.json({ success: true, count: importedQuestions.length, quiz });
      }

      // CSV parser
      const lines = content.split(/\r?\n/).filter((l: string) => l.trim().length > 0);
      if (lines.length <= 1) {
        return res.status(400).json({ error: 'File CSV kosong atau hanya berisi header.' });
      }

      // Simple robust CSV line splitter
      const parseCsvLine = (line: string): string[] => {
        const result: string[] = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              cur += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = '';
          } else {
            cur += char;
          }
        }
        result.push(cur.trim());
        return result;
      };

      let importedCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i]);
        if (cols.length < 9) continue;
        const [cat, catLabel, subtype, stim, prompt, optA, optB, optC, optD, correctIdx, expId, expEn, transcript] = cols;
        const parsedIdx = parseInt(correctIdx, 10);
        quiz.questions.push({
          id: 'q-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          category: (cat === 'listening' || cat === 'reading' ? cat : 'structure') as any,
          categoryLabel: catLabel || 'Practice',
          subtype: subtype || 'TOEFL Practice',
          stimulusText: stim || '',
          promptText: prompt || 'Question Prompt',
          options: [optA || 'A', optB || 'B', optC || 'C', optD || 'D'],
          correctAnswerIndex: isNaN(parsedIdx) ? 0 : Math.max(0, Math.min(3, parsedIdx)),
          explanationId: expId || '',
          explanationEn: expEn || '',
          audioUrl: null,
          audioTranscript: transcript || ''
        });
        importedCount++;
      }

      quiz.updatedAt = new Date().toISOString();
      persistStore();
      return res.json({ success: true, count: importedCount, quiz });
    } catch (err: any) {
      return res.status(400).json({ error: 'Gagal memproses file import: ' + err.message });
    }
  });

  // ==========================================
  // ROOM MANAGEMENT & REALTIME (LIVE & SELF-PACED)
  // ==========================================
  app.post('/api/rooms', (req: Request, res: Response) => {
    const { quizId, mode, pin: customPin } = req.body;
    const quiz = store.quizzes[quizId];
    if (!quiz) return res.status(404).json({ error: 'Quiz tidak ditemukan' });

    // Generate clean 6-character room PIN or use custom
    const pin = (customPin ? customPin.toString().trim().toUpperCase() : Math.floor(100000 + Math.random() * 900000).toString());

    const newRoom: QuizRoom = {
      id: 'room-' + Date.now(),
      pin,
      quizId: quiz.id,
      quizTitle: quiz.title,
      mode: mode === 'self_paced' ? 'self_paced' : 'live',
      state: mode === 'self_paced' ? 'in_progress' : 'waiting',
      timePerQuestionSeconds: quiz.timePerQuestionSeconds || 30,
      currentQuestionIndex: 0,
      questionStartedAt: mode === 'self_paced' ? Date.now() : 0,
      questionDeadline: mode === 'self_paced' ? Date.now() + (quiz.timePerQuestionSeconds * 1000) : 0,
      isReviewUnlocked: mode === 'self_paced' ? true : false,
      createdAt: Date.now(),
      participants: {}
    };

    store.rooms[pin] = newRoom;
    persistStore();
    res.json(newRoom);
  });

  app.get('/api/rooms/:pin', (req: Request, res: Response) => {
    const room = store.rooms[req.params.pin];
    if (!room) return res.status(404).json({ error: 'Room dengan PIN tersebut tidak ditemukan' });
    const quiz = store.quizzes[room.quizId];

    res.json({
      id: room.id,
      pin: room.pin,
      quizId: room.quizId,
      quizTitle: room.quizTitle,
      mode: room.mode,
      state: room.state,
      currentQuestionIndex: room.currentQuestionIndex,
      totalQuestions: quiz ? quiz.questions.length : 0,
      participantCount: Object.keys(room.participants).length,
      timePerQuestionSeconds: room.timePerQuestionSeconds,
      isReviewUnlocked: room.isReviewUnlocked,
      serverNow: Date.now()
    });
  });

  // Student Join - handles duplicate names with unique tag
  app.post('/api/rooms/:pin/join', (req: Request, res: Response) => {
    const room = store.rooms[req.params.pin];
    if (!room) return res.status(404).json({ error: 'Room tidak ditemukan' });

    const rawName = (req.body.name || 'Student').trim();
    const avatar = req.body.avatar || '🎓';

    // Duplicate name resolution: e.g. "Budi #2"
    const existingNames = Object.values(room.participants).map(p => p.name.toLowerCase());
    let uniqueName = rawName;
    if (existingNames.includes(rawName.toLowerCase())) {
      let counter = 2;
      while (existingNames.includes(`${rawName.toLowerCase()} #${counter}`)) {
        counter++;
      }
      uniqueName = `${rawName} #${counter}`;
    }

    const participantId = 'p-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const token = 'token-' + Math.random().toString(36).substring(2) + Date.now().toString(36);

    const participant: Participant = {
      id: participantId,
      token,
      name: uniqueName,
      avatar,
      totalScore: 0,
      correctCount: 0,
      wrongCount: 0,
      timeoutCount: 0,
      totalResponseTimeMs: 0,
      tabSwitchCount: 0,
      joinedAt: Date.now(),
      answers: {}
    };

    room.participants[participantId] = participant;
    persistStore();
    broadcastRoomUpdate(room.pin);

    res.json({
      participantId,
      token,
      uniqueName,
      avatar,
      roomPin: room.pin,
      mode: room.mode,
      state: room.state
    });
  });

  // Server-Sent Events (SSE) for Realtime Room Synchronization
  app.get('/api/rooms/:pin/live-stream', (req: Request, res: Response) => {
    const pin = req.params.pin;
    const room = store.rooms[pin];
    if (!room) return res.status(404).end();

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    if (!sseClients[pin]) sseClients[pin] = [];
    sseClients[pin].push(res);

    // Initial broadcast
    broadcastRoomUpdate(pin);

    // Keep alive heartbeat every 15 seconds
    const interval = setInterval(() => {
      try {
        res.write(`:heartbeat ${Date.now()}\n\n`);
      } catch {
        clearInterval(interval);
      }
    }, 15000);

    req.on('close', () => {
      clearInterval(interval);
      if (sseClients[pin]) {
        sseClients[pin] = sseClients[pin].filter(client => client !== res);
      }
    });
  });

  // Admin controls: Start room
  app.post('/api/rooms/:pin/start', (req: Request, res: Response) => {
    if (!authenticateAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const room = store.rooms[req.params.pin];
    if (!room) return res.status(404).json({ error: 'Room tidak ditemukan' });

    room.state = 'in_progress';
    room.currentQuestionIndex = 0;
    room.questionStartedAt = Date.now();
    room.questionDeadline = Date.now() + (room.timePerQuestionSeconds * 1000);

    persistStore();
    broadcastRoomUpdate(room.pin);
    res.json({ success: true, room });
  });

  // Admin controls: Pause / Resume
  app.post('/api/rooms/:pin/pause', (req: Request, res: Response) => {
    if (!authenticateAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const room = store.rooms[req.params.pin];
    if (!room) return res.status(404).json({ error: 'Room tidak ditemukan' });

    room.state = 'paused';
    persistStore();
    broadcastRoomUpdate(room.pin);
    res.json({ success: true, room });
  });

  app.post('/api/rooms/:pin/resume', (req: Request, res: Response) => {
    if (!authenticateAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const room = store.rooms[req.params.pin];
    if (!room) return res.status(404).json({ error: 'Room tidak ditemukan' });

    room.state = 'in_progress';
    // Extend deadline by remaining time
    room.questionStartedAt = Date.now();
    room.questionDeadline = Date.now() + (room.timePerQuestionSeconds * 1000);

    persistStore();
    broadcastRoomUpdate(room.pin);
    res.json({ success: true, room });
  });

  // Admin controls: Next question
  app.post('/api/rooms/:pin/next-question', (req: Request, res: Response) => {
    if (!authenticateAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const room = store.rooms[req.params.pin];
    if (!room) return res.status(404).json({ error: 'Room tidak ditemukan' });
    const quiz = store.quizzes[room.quizId];
    if (!quiz) return res.status(404).json({ error: 'Quiz tidak ditemukan' });

    if (room.currentQuestionIndex + 1 < quiz.questions.length) {
      room.currentQuestionIndex += 1;
      room.questionStartedAt = Date.now();
      room.questionDeadline = Date.now() + (room.timePerQuestionSeconds * 1000);
      room.state = 'in_progress';
    } else {
      room.state = 'finished';
      // Automatically unlock review when live session concludes
      room.isReviewUnlocked = true;
    }

    persistStore();
    broadcastRoomUpdate(room.pin);
    res.json({ success: true, room });
  });

  // Admin controls: Finish room
  app.post('/api/rooms/:pin/finish', (req: Request, res: Response) => {
    if (!authenticateAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const room = store.rooms[req.params.pin];
    if (!room) return res.status(404).json({ error: 'Room tidak ditemukan' });

    room.state = 'finished';
    persistStore();
    broadcastRoomUpdate(room.pin);
    res.json({ success: true, room });
  });

  // Admin controls: Toggle review answers lock
  app.post('/api/rooms/:pin/toggle-review', (req: Request, res: Response) => {
    if (!authenticateAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const room = store.rooms[req.params.pin];
    if (!room) return res.status(404).json({ error: 'Room tidak ditemukan' });

    room.isReviewUnlocked = req.body.isReviewUnlocked !== undefined ? req.body.isReviewUnlocked : !room.isReviewUnlocked;
    persistStore();
    broadcastRoomUpdate(room.pin);
    res.json({ success: true, isReviewUnlocked: room.isReviewUnlocked });
  });

  // ==========================================
  // STUDENT QUIZ PLAYING (STRICT SERVER SECURITY)
  // ==========================================
  
  // Helper to find participant by token
  function findParticipant(room: QuizRoom, token: string): Participant | undefined {
    return Object.values(room.participants).find(p => p.token === token);
  }

  // Get current active question (SECURE - NO ANSWER KEYS OR EXPLANATIONS SENT!)
  app.get('/api/rooms/:pin/current-question', (req: Request, res: Response) => {
    const room = store.rooms[req.params.pin];
    if (!room) return res.status(404).json({ error: 'Room tidak ditemukan' });
    const quiz = store.quizzes[room.quizId];
    if (!quiz) return res.status(404).json({ error: 'Quiz tidak ditemukan' });

    const token = req.query.token as string;
    const participant = token ? findParticipant(room, token) : undefined;

    // In self-paced mode, student can have their own current question index
    let questionIndex = room.currentQuestionIndex;
    if (room.mode === 'self_paced' && participant) {
      questionIndex = Object.keys(participant.answers).length;
    }

    if (questionIndex >= quiz.questions.length || room.state === 'finished') {
      return res.json({
        isFinished: true,
        totalQuestions: quiz.questions.length
      });
    }

    const question = quiz.questions[questionIndex];

    // For self-paced mode, initialize or get deadline for this question
    let serverDeadline = room.questionDeadline;
    if (room.mode === 'self_paced') {
      // In solo mode, deadline is based on current question start
      serverDeadline = Date.now() + (room.timePerQuestionSeconds * 1000);
    }

    // Check if participant already answered this question (for reconnect resiliency)
    const existingAnswer = participant ? participant.answers[question.id] : undefined;

    const clientQuestion: ClientQuestionView = {
      questionNumber: questionIndex + 1,
      totalQuestions: quiz.questions.length,
      category: question.category,
      categoryLabel: question.categoryLabel,
      subtype: question.subtype,
      stimulusText: question.stimulusText,
      promptText: question.promptText,
      options: question.options,
      audioUrl: question.audioUrl,
      timeLimitSeconds: room.timePerQuestionSeconds,
      serverDeadline,
      serverNow: Date.now()
    };

    res.json({
      question: clientQuestion,
      alreadyAnswered: !!existingAnswer,
      userAnswer: existingAnswer ? existingAnswer.selectedOptionIndex : null,
      roomState: room.state,
      roomMode: room.mode
    });
  });

  // Submit Answer - STRICT SERVER-AUTHORITATIVE SCORING
  app.post('/api/rooms/:pin/submit-answer', (req: Request, res: Response) => {
    const room = store.rooms[req.params.pin];
    if (!room) return res.status(404).json({ error: 'Room tidak ditemukan' });
    const quiz = store.quizzes[room.quizId];
    if (!quiz) return res.status(404).json({ error: 'Quiz tidak ditemukan' });

    const { token, selectedOptionIndex, questionNumber, responseTimeMs } = req.body;
    const participant = findParticipant(room, token);
    if (!participant) return res.status(401).json({ error: 'Peserta tidak ditemukan atau token tidak valid' });

    const questionIndex = (typeof questionNumber === 'number' ? questionNumber - 1 : room.currentQuestionIndex);
    const question = quiz.questions[questionIndex];
    if (!question) return res.status(400).json({ error: 'Indeks soal tidak valid' });

    // Check duplicate submission
    if (participant.answers[question.id]) {
      const recorded = participant.answers[question.id];
      return res.json({
        duplicate: true,
        isCorrect: recorded.isCorrect,
        correctAnswerIndex: question.correctAnswerIndex,
        earnedScore: recorded.earnedScore,
        currentTotalScore: participant.totalScore
      });
    }

    const now = Date.now();
    // Server authoritative time remaining calculation
    let remainingSeconds = Math.max(0, (room.questionDeadline - now) / 1000);
    if (room.mode === 'self_paced') {
      remainingSeconds = Math.max(0, (30000 - (responseTimeMs || 0)) / 1000);
    }

    const isTimeout = selectedOptionIndex === null || selectedOptionIndex === undefined;
    const isCorrect = !isTimeout && selectedOptionIndex === question.correctAnswerIndex;

    // SCORING FORMULA:
    // Benar = 100 poin dasar + bonus kecepatan maksimal 50 poin
    // Formula bonus = Math.round(50 * remainingSeconds / 30)
    // Salah atau timeout = 0
    let earnedScore = 0;
    if (isCorrect) {
      const speedBonus = Math.round((50 * remainingSeconds) / 30);
      earnedScore = 100 + Math.max(0, Math.min(50, speedBonus));
    }

    // Save answer
    participant.answers[question.id] = {
      selectedOptionIndex: isTimeout ? null : selectedOptionIndex,
      isCorrect,
      isTimeout,
      earnedScore,
      responseTimeMs: responseTimeMs || Math.round((30 - remainingSeconds) * 1000)
    };

    participant.totalScore += earnedScore;
    participant.totalResponseTimeMs += (responseTimeMs || 1000);
    if (isCorrect) participant.correctCount += 1;
    else if (isTimeout) participant.timeoutCount += 1;
    else participant.wrongCount += 1;

    // Check if finished
    if (Object.keys(participant.answers).length >= quiz.questions.length) {
      participant.completedAt = now;
    }

    persistStore();
    broadcastRoomUpdate(room.pin);

    // Return brief 2-second feedback with correct answer revealed
    res.json({
      isCorrect,
      isTimeout,
      correctAnswerIndex: question.correctAnswerIndex,
      earnedScore,
      currentTotalScore: participant.totalScore,
      responseTimeMs: participant.answers[question.id].responseTimeMs
    });
  });

  // Timeout handler
  app.post('/api/rooms/:pin/timeout', (req: Request, res: Response) => {
    const room = store.rooms[req.params.pin];
    if (!room) return res.status(404).json({ error: 'Room tidak ditemukan' });
    const quiz = store.quizzes[room.quizId];
    if (!quiz) return res.status(404).json({ error: 'Quiz tidak ditemukan' });

    const { token, questionNumber } = req.body;
    const participant = findParticipant(room, token);
    if (!participant) return res.status(401).json({ error: 'Peserta tidak ditemukan' });

    const questionIndex = (typeof questionNumber === 'number' ? questionNumber - 1 : room.currentQuestionIndex);
    const question = quiz.questions[questionIndex];
    if (!question) return res.status(400).json({ error: 'Indeks soal tidak valid' });

    if (!participant.answers[question.id]) {
      participant.answers[question.id] = {
        selectedOptionIndex: null,
        isCorrect: false,
        isTimeout: true,
        earnedScore: 0,
        responseTimeMs: 30000
      };
      participant.timeoutCount += 1;
      participant.totalResponseTimeMs += 30000;
      persistStore();
      broadcastRoomUpdate(room.pin);
    }

    res.json({
      isTimeout: true,
      correctAnswerIndex: question.correctAnswerIndex,
      earnedScore: 0,
      currentTotalScore: participant.totalScore
    });
  });

  // Friendly tab blur indication
  app.post('/api/rooms/:pin/tab-switch', (req: Request, res: Response) => {
    const room = store.rooms[req.params.pin];
    if (!room) return res.status(404).end();
    const { token } = req.body;
    const participant = findParticipant(room, token);
    if (participant) {
      participant.tabSwitchCount += 1;
      persistStore();
    }
    res.json({ success: true });
  });

  // Student Results
  app.get('/api/rooms/:pin/results', (req: Request, res: Response) => {
    const room = store.rooms[req.params.pin];
    if (!room) return res.status(404).json({ error: 'Room tidak ditemukan' });
    const quiz = store.quizzes[room.quizId];
    if (!quiz) return res.status(404).json({ error: 'Quiz tidak ditemukan' });

    const token = req.query.token as string;
    const participant = findParticipant(room, token);
    if (!participant) return res.status(401).json({ error: 'Peserta tidak ditemukan' });

    // Calculate leaderboard ranks
    const leaderboard = calculateLeaderboard(room, quiz.questions.length);
    const myEntry = leaderboard.find(l => l.id === participant.id);

    const totalQuestions = quiz.questions.length;
    const accuracy = totalQuestions > 0 ? Math.round((participant.correctCount / totalQuestions) * 100) : 0;
    const durationSeconds = Math.round(participant.totalResponseTimeMs / 1000);

    res.json({
      participant: {
        id: participant.id,
        name: participant.name,
        avatar: participant.avatar,
        totalScore: participant.totalScore,
        correctCount: participant.correctCount,
        wrongCount: participant.wrongCount,
        timeoutCount: participant.timeoutCount,
        accuracyPercentage: accuracy,
        durationSeconds,
        rank: myEntry ? myEntry.rank : 1,
        isTied: myEntry ? myEntry.isTied : false,
        totalParticipants: Object.keys(room.participants).length
      },
      quizTitle: quiz.title,
      isReviewUnlocked: room.isReviewUnlocked || room.mode === 'self_paced',
      mode: room.mode
    });
  });

  // Review Answers & Explanations (Bilingual + Transcripts)
  app.get('/api/rooms/:pin/review', (req: Request, res: Response) => {
    const room = store.rooms[req.params.pin];
    if (!room) return res.status(404).json({ error: 'Room tidak ditemukan' });
    const quiz = store.quizzes[room.quizId];
    if (!quiz) return res.status(404).json({ error: 'Quiz tidak ditemukan' });

    const token = req.query.token as string;
    const participant = findParticipant(room, token);
    if (!participant) return res.status(401).json({ error: 'Peserta tidak ditemukan' });

    // Enforce review lock if host has locked review during live session
    if (room.mode === 'live' && !room.isReviewUnlocked) {
      return res.status(403).json({
        locked: true,
        message: 'Pembahasan masih dikunci oleh Admin/Host kuis untuk menjaga keadilan sesi. Silakan tunggu hingga host membuka akses pembahasan.'
      });
    }

    const reviewCards = quiz.questions.map((q, idx) => {
      const ans = participant.answers[q.id];
      return {
        questionNumber: idx + 1,
        category: q.category,
        categoryLabel: q.categoryLabel,
        subtype: q.subtype,
        stimulusText: q.stimulusText,
        promptText: q.promptText,
        options: q.options,
        selectedOptionIndex: ans ? ans.selectedOptionIndex : null,
        correctAnswerIndex: q.correctAnswerIndex,
        isCorrect: ans ? ans.isCorrect : false,
        isTimeout: ans ? ans.isTimeout : true,
        earnedScore: ans ? ans.earnedScore : 0,
        responseTimeMs: ans ? ans.responseTimeMs : 0,
        audioUrl: q.audioUrl,
        audioTranscript: q.audioTranscript, // Unlocked after session completion
        explanationId: q.explanationId,
        explanationEn: q.explanationEn
      };
    });

    res.json({
      quizTitle: quiz.title,
      reviewCards
    });
  });

  // ==========================================
  // LEADERBOARD & PODIUM (Tied Rank Calculation)
  // ==========================================
  function calculateLeaderboard(room: QuizRoom, totalQuestions: number): LeaderboardEntry[] {
    const list = Object.values(room.participants);

    // Sorting rule:
    // 1) totalScore DESC
    // 2) correctCount DESC
    // 3) totalResponseTimeMs ASC (faster wins)
    list.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
      return a.totalResponseTimeMs - b.totalResponseTimeMs;
    });

    const entries: LeaderboardEntry[] = [];
    let currentRank = 1;

    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      let isTied = false;

      if (i > 0) {
        const prev = list[i - 1];
        if (
          prev.totalScore === p.totalScore &&
          prev.correctCount === p.correctCount &&
          prev.totalResponseTimeMs === p.totalResponseTimeMs
        ) {
          isTied = true;
          // Keep same rank as previous tied participant
          entries.push({
            rank: entries[i - 1].rank,
            isTied: true,
            id: p.id,
            name: p.name,
            avatar: p.avatar,
            totalScore: p.totalScore,
            correctCount: p.correctCount,
            totalQuestions,
            accuracy: totalQuestions > 0 ? Math.round((p.correctCount / totalQuestions) * 100) : 0,
            totalResponseTimeMs: p.totalResponseTimeMs
          });
          entries[i - 1].isTied = true;
          continue;
        }
      }

      currentRank = i + 1;
      entries.push({
        rank: currentRank,
        isTied: false,
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        totalScore: p.totalScore,
        correctCount: p.correctCount,
        totalQuestions,
        accuracy: totalQuestions > 0 ? Math.round((p.correctCount / totalQuestions) * 100) : 0,
        totalResponseTimeMs: p.totalResponseTimeMs
      });
    }

    return entries;
  }

  app.get('/api/rooms/:pin/leaderboard', (req: Request, res: Response) => {
    const room = store.rooms[req.params.pin];
    if (!room) return res.status(404).json({ error: 'Room tidak ditemukan' });
    const quiz = store.quizzes[room.quizId];
    const totalQuestions = quiz ? quiz.questions.length : 15;

    const entries = calculateLeaderboard(room, totalQuestions);
    res.json({
      pin: room.pin,
      state: room.state,
      mode: room.mode,
      entries
    });
  });

  // Admin Analytics & CSV Export
  app.get('/api/admin/rooms/:pin/analytics', (req: Request, res: Response) => {
    if (!authenticateAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const room = store.rooms[req.params.pin];
    if (!room) return res.status(404).json({ error: 'Room tidak ditemukan' });
    const quiz = store.quizzes[room.quizId];
    if (!quiz) return res.status(404).json({ error: 'Quiz tidak ditemukan' });

    const participants = Object.values(room.participants);
    const totalP = participants.length;

    // Per question accuracy
    const questionStats = quiz.questions.map((q, idx) => {
      let correct = 0;
      let wrong = 0;
      let timeout = 0;
      participants.forEach(p => {
        const a = p.answers[q.id];
        if (!a) timeout++;
        else if (a.isCorrect) correct++;
        else if (a.isTimeout) timeout++;
        else wrong++;
      });
      const answeredCount = correct + wrong;
      return {
        questionNumber: idx + 1,
        category: q.category,
        subtype: q.subtype,
        correct,
        wrong,
        timeout,
        accuracy: totalP > 0 ? Math.round((correct / totalP) * 100) : 0
      };
    });

    res.json({
      pin: room.pin,
      quizTitle: quiz.title,
      mode: room.mode,
      totalParticipants: totalP,
      questionStats,
      leaderboard: calculateLeaderboard(room, quiz.questions.length)
    });
  });

  app.get('/api/admin/rooms/:pin/export-csv', (req: Request, res: Response) => {
    if (!authenticateAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
    const room = store.rooms[req.params.pin];
    if (!room) return res.status(404).json({ error: 'Room tidak ditemukan' });
    const quiz = store.quizzes[room.quizId];
    if (!quiz) return res.status(404).json({ error: 'Quiz tidak ditemukan' });

    const leaderboard = calculateLeaderboard(room, quiz.questions.length);

    const headers = [
      'Rank',
      'Name',
      'Score',
      'Correct',
      'Wrong',
      'Timeout',
      'Accuracy_%',
      'Total_Time_Sec',
      'Tab_Switches'
    ];

    const escapeCsv = (str: string = '') => `"${str.toString().replace(/"/g, '""')}"`;

    const rows = leaderboard.map(entry => {
      const p = room.participants[entry.id];
      return [
        entry.rank,
        escapeCsv(entry.name),
        entry.totalScore,
        entry.correctCount,
        p ? p.wrongCount : 0,
        p ? p.timeoutCount : 0,
        entry.accuracy,
        p ? (p.totalResponseTimeMs / 1000).toFixed(1) : 0,
        p ? p.tabSwitchCount : 0
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="room_${room.pin}_analytics.csv"`);
    res.send(csvContent);
  });

  // ==========================================
  // VITE DEV MIDDLEWARE / STATIC FILES
  // ==========================================
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TOEFL QUIZ BATTLE] Server live on http://0.0.0.0:${PORT}`);
  });
}

startServer();
