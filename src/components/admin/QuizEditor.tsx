import React, { useState } from 'react';
import {
  Upload,
  Download,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertTriangle,
  Volume2,
  Mic,
  Headphones,
  FileText,
  FileSpreadsheet,
  Save,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { Quiz, Question, QuizCategory } from '../../types/quiz';
import { fileToDataUri, speakDialogue, generateChimeAudioDataUri } from '../../utils/audioGenerator';

interface QuizEditorProps {
  quiz: Quiz;
  onUpdateQuiz: () => void;
  adminToken: string;
}

export const QuizEditor: React.FC<QuizEditorProps> = ({ quiz, onUpdateQuiz, adminToken }) => {
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importContent, setImportContent] = useState('');
  const [importFormat, setImportFormat] = useState<'json' | 'csv'>('json');
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Filter questions by category
  const [activeTab, setActiveTab] = useState<'all' | QuizCategory>('all');

  const filteredQuestions = quiz.questions.filter(q =>
    activeTab === 'all' ? true : q.category === activeTab
  );

  const missingAudioCount = quiz.questions.filter(
    q => q.category === 'listening' && (!q.audioUrl || q.audioUrl.trim() === '')
  ).length;

  const handlePublishToggle = async () => {
    setIsPublishing(true);
    setMessage(null);
    try {
      const endpoint = quiz.status === 'published' ? `/api/quizzes/${quiz.id}/unpublish` : `/api/quizzes/${quiz.id}/publish`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ text: data.error || 'Gagal mengubah status publikasi', type: 'error' });
      } else {
        setMessage({
          text: quiz.status === 'published' ? 'Kuis dikembalikan ke status DRAFT.' : 'Kuis berhasil DIPUBLIKASIKAN! Siap digunakan di Room.',
          type: 'success'
        });
        onUpdateQuiz();
      }
    } catch {
      setMessage({ text: 'Gagal menghubungi server.', type: 'error' });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleGenerateAllDemoAudios = async () => {
    setMessage(null);
    try {
      const res = await fetch(`/api/quizzes/${quiz.id}/generate-demo-audios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: `Berhasil mengaktifkan track audio untuk ${data.updatedCount} soal Listening! Kuis kini dapat dipublikasikan.`, type: 'success' });
        onUpdateQuiz();
      } else {
        setMessage({ text: data.error || 'Gagal membuat audio.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Gagal memproses audio demo.', type: 'error' });
    }
  };

  const handleSaveQuestion = async (q: Question) => {
    try {
      const endpoint = isAddingNew
        ? `/api/quizzes/${quiz.id}/questions`
        : `/api/questions/${q.id}`;
      const method = isAddingNew ? 'POST' : 'PUT';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(q)
      });

      if (res.ok) {
        setMessage({ text: 'Pertanyaan berhasil disimpan.', type: 'success' });
        setEditingQuestion(null);
        setIsAddingNew(false);
        onUpdateQuiz();
      } else {
        const err = await res.json();
        setMessage({ text: err.error || 'Gagal menyimpan pertanyaan', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Terjadi kesalahan jaringan.', type: 'error' });
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus soal ini?')) return;
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setMessage({ text: 'Soal berhasil dihapus.', type: 'success' });
        onUpdateQuiz();
      }
    } catch {
      setMessage({ text: 'Gagal menghapus soal.', type: 'error' });
    }
  };

  const handleFileUploadAudio = async (questionId: string, file: File) => {
    try {
      const dataUri = await fileToDataUri(file);
      const res = await fetch(`/api/questions/${questionId}/audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ audioDataUri: dataUri })
      });
      if (res.ok) {
        setMessage({ text: 'File audio dialog berhasil diunggah!', type: 'success' });
        onUpdateQuiz();
        if (editingQuestion && editingQuestion.id === questionId) {
          setEditingQuestion({ ...editingQuestion, audioUrl: dataUri });
        }
      }
    } catch (err: any) {
      setMessage({ text: 'Gagal mengunggah audio: ' + err.message, type: 'error' });
    }
  };

  const handleTtsGenerateAudio = async (question: Question) => {
    // Generate synthesized audio tone + voice cue
    const audioDataUri = generateChimeAudioDataUri(question.subtype);
    try {
      const res = await fetch(`/api/questions/${question.id}/audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ audioDataUri })
      });
      if (res.ok) {
        setMessage({ text: 'Audio dialog berhasil dibuat dan disimpan!', type: 'success' });
        onUpdateQuiz();
        if (editingQuestion && editingQuestion.id === question.id) {
          setEditingQuestion({ ...editingQuestion, audioUrl: audioDataUri });
        }
      }
    } catch {
      setMessage({ text: 'Gagal menghasilkan audio TTS.', type: 'error' });
    }
  };

  const handleRecordAudio = async (question: Question) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('Browser tidak mendukung perekaman mikrofon.');
      return;
    }
    try {
      setIsRecording(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = e => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          await fetch(`/api/questions/${question.id}/audio`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({ audioDataUri: base64data })
          });
          setIsRecording(false);
          setMessage({ text: 'Hasil rekaman audio dialog berhasil disimpan!', type: 'success' });
          onUpdateQuiz();
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start();
      // Record 5 seconds of sample speech or until stop
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          stream.getTracks().forEach(track => track.stop());
        }
      }, 5000);
    } catch {
      setIsRecording(false);
      setMessage({ text: 'Izin mikrofon ditolak atau tidak tersedia.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Publish Controls */}
      <div className="bg-white border border-purple-200/80 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-display font-extrabold text-slate-900">
              {quiz.title}
            </h2>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                quiz.status === 'published'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {quiz.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            {quiz.description}
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
            <span>Total: <strong>{quiz.questions.length}</strong> Soal</span>
            <span>·</span>
            <span>Listening: <strong>{quiz.questions.filter(q => q.category === 'listening').length}</strong></span>
            <span>·</span>
            <span>Structure: <strong>{quiz.questions.filter(q => q.category === 'structure').length}</strong></span>
            <span>·</span>
            <span>Reading: <strong>{quiz.questions.filter(q => q.category === 'reading').length}</strong></span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Export Buttons */}
          <a
            href={`/api/quizzes/${quiz.id}/export?format=json`}
            className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            download
          >
            <Download className="w-3.5 h-3.5" />
            JSON
          </a>
          <a
            href={`/api/quizzes/${quiz.id}/export?format=csv`}
            className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            download
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </a>
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-2 text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Import
          </button>

          {/* Publish Action Button */}
          <button
            type="button"
            onClick={handlePublishToggle}
            disabled={isPublishing}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
              quiz.status === 'published'
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {quiz.status === 'published' ? (
              <>
                <XCircle className="w-4 h-4" />
                Kembalikan ke Draft
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Publish Quiz
              </>
            )}
          </button>
        </div>
      </div>

      {/* Listening Audio Missing Warning Card */}
      {missingAudioCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold">
                Validasi Audio Listening: {missingAudioCount} Soal Belum Memiliki File Audio
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Sesuai aturan ujian TOEFL, kuis tidak dapat dipublikasikan jika ada soal Listening yang bertatus <em>'Audio belum diunggah'</em>.
                Unggah file MP3/WAV, rekam suara, atau klik tombol di sebelah kanan.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleGenerateAllDemoAudios}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate Audio Listening (1-Klik)
          </button>
        </div>
      )}

      {/* Alert Message */}
      {message && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-medium flex items-center justify-between gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-bold px-1.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Category Tabs & Add Question Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-purple-200/60 pb-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({quiz.questions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('listening')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'listening'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Listening ({quiz.questions.filter(q => q.category === 'listening').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('structure')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'structure'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Structure ({quiz.questions.filter(q => q.category === 'structure').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reading')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'reading'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reading ({quiz.questions.filter(q => q.category === 'reading').length})
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsAddingNew(true);
            setEditingQuestion({
              id: 'new-' + Date.now(),
              category: 'structure',
              categoryLabel: 'Structure & Written Expression',
              subtype: 'Inversion with Place Expressions',
              promptText: '',
              options: ['', '', '', ''],
              correctAnswerIndex: 0,
              explanationId: '',
              explanationEn: '',
              audioUrl: null,
              audioTranscript: ''
            });
          }}
          className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Tambah Soal Baru
        </button>
      </div>

      {/* Question Cards List */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => {
          const isListening = q.category === 'listening';
          const hasAudio = !!(q.audioUrl && q.audioUrl.trim().length > 0);

          return (
            <div
              key={q.id}
              className="bg-white border border-purple-100 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-purple-200 transition-colors"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-xs font-bold flex items-center justify-center tabular-nums">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-purple-900">
                    {q.categoryLabel}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500 font-medium">
                    {q.subtype}
                  </span>

                  {/* Audio Status Badge for Listening */}
                  {isListening && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        hasAudio
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800 animate-pulse'
                      }`}
                    >
                      <Volume2 className="w-3 h-3" />
                      {hasAudio ? 'Audio Terunggah' : 'Audio belum diunggah'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setPreviewQuestion(q)}
                    className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                    title="Preview Soal"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNew(false);
                      setEditingQuestion(JSON.parse(JSON.stringify(q)));
                    }}
                    className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Soal"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Soal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stimulus / Reading Passage Preview */}
              {q.stimulusText && (
                <div className="mb-2 bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-600 max-h-24 overflow-y-auto">
                  <p className="font-semibold text-slate-700 mb-1">Stimulus / Teks Bacaan:</p>
                  <p className="leading-relaxed">{q.stimulusText}</p>
                </div>
              )}

              {/* Listening Quick Audio Actions */}
              {isListening && (
                <div className="mb-3 bg-purple-50/70 border border-purple-100 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-purple-600" />
                    <span className="text-xs text-purple-900 font-semibold">
                      Audio Dialog Listening:
                    </span>
                    {q.audioTranscript && (
                      <button
                        type="button"
                        onClick={() => speakDialogue(q.audioTranscript!)}
                        className="text-[11px] text-purple-700 hover:underline cursor-pointer"
                      >
                        (Tes Suara Web)
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="px-2.5 py-1 bg-white border border-purple-200 text-purple-800 text-[11px] font-bold rounded-lg hover:bg-purple-100 transition-colors cursor-pointer flex items-center gap-1 shadow-xs">
                      <Upload className="w-3 h-3" />
                      Unggah File MP3/WAV
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUploadAudio(q.id, e.target.files[0]);
                          }
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => handleTtsGenerateAudio(q)}
                      className="px-2.5 py-1 bg-purple-600 text-white text-[11px] font-bold rounded-lg hover:bg-purple-700 transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <Sparkles className="w-3 h-3" />
                      Hasilkan Audio
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRecordAudio(q)}
                      disabled={isRecording}
                      className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold rounded-lg hover:bg-rose-100 transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <Mic className="w-3 h-3 text-rose-600" />
                      {isRecording ? 'Merekam (5s)...' : 'Rekam Suara'}
                    </button>
                  </div>
                </div>
              )}

              {/* Prompt Text */}
              <p className="text-sm font-bold text-slate-800 mb-3">
                {q.promptText}
              </p>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {q.options.map((opt, oIdx) => {
                  const isCorrect = oIdx === q.correctAnswerIndex;
                  return (
                    <div
                      key={oIdx}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                          isCorrect
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="truncate">{opt}</span>
                      {isCorrect && (
                        <Check className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit/Create Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-purple-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-display font-bold text-slate-900 mb-4">
              {isAddingNew ? 'Tambah Soal TOEFL Baru' : 'Edit Soal TOEFL'}
            </h3>

            <div className="space-y-4">
              {/* Category & Subtype */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={editingQuestion.category}
                    onChange={(e) => {
                      const cat = e.target.value as QuizCategory;
                      setEditingQuestion({
                        ...editingQuestion,
                        category: cat,
                        categoryLabel:
                          cat === 'listening'
                            ? 'Listening Comprehension'
                            : cat === 'reading'
                            ? 'Reading Comprehension'
                            : 'Structure & Written Expression'
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="listening">Listening Comprehension</option>
                    <option value="structure">Structure & Written Expression</option>
                    <option value="reading">Reading Comprehension</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subtipe Materi (Label Akurat)
                  </label>
                  <input
                    type="text"
                    value={editingQuestion.subtype}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, subtype: e.target.value })
                    }
                    placeholder="misal: Double Negative Expressions / Unstated Details (EXCEPT)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Stimulus / Passage / Dialogue Context */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Stimulus / Teks Bacaan (Wajib untuk Reading)
                </label>
                <textarea
                  rows={3}
                  value={editingQuestion.stimulusText || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, stimulusText: e.target.value })
                  }
                  placeholder="Masukkan passage teks bacaan..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Prompt Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kalimat Soal / Pertanyaan
                </label>
                <input
                  type="text"
                  value={editingQuestion.promptText}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, promptText: e.target.value })
                  }
                  placeholder="Contoh: What does the woman mean? / On the crest of the mountain __________"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Options A-D & Correct Answer Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilihan Jawaban (Pilih radio untuk Kunci Benar)
                </label>
                <div className="space-y-2">
                  {editingQuestion.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={editingQuestion.correctAnswerIndex === idx}
                        onChange={() =>
                          setEditingQuestion({ ...editingQuestion, correctAnswerIndex: idx })
                        }
                        className="text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                      <span className="w-5 text-xs font-bold text-slate-500">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...editingQuestion.options] as [string, string, string, string];
                          newOpts[idx] = e.target.value;
                          setEditingQuestion({ ...editingQuestion, options: newOpts });
                        }}
                        placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Audio Transcript (for listening, hidden during exam) */}
              {editingQuestion.category === 'listening' && (
                <div>
                  <label className="block text-xs font-bold text-purple-900 mb-1">
                    Transkrip Audio Dialog (Disembunyikan selama ujian, terbuka saat pembahasan)
                  </label>
                  <textarea
                    rows={2}
                    value={editingQuestion.audioTranscript || ''}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, audioTranscript: e.target.value })
                    }
                    placeholder='(Man): "..." / (Woman): "..." / (Narrator): "..."'
                    className="w-full px-3 py-2 bg-purple-50/50 border border-purple-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              {/* Explanations Bilingual */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Penjelasan (Bahasa Indonesia 🇮🇩)
                  </label>
                  <textarea
                    rows={3}
                    value={editingQuestion.explanationId}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, explanationId: e.target.value })
                    }
                    placeholder="Uraian aturan grammar dan alasan jawaban benar..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Explanation (English 🇬🇧)
                  </label>
                  <textarea
                    rows={3}
                    value={editingQuestion.explanationEn}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, explanationEn: e.target.value })
                    }
                    placeholder="Grammar rationale in English..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingQuestion(null);
                  setIsAddingNew(false);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleSaveQuestion(editingQuestion)}
                className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                Simpan Pertanyaan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Question Modal */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-purple-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative">
            <button
              type="button"
              onClick={() => setPreviewQuestion(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full flex items-center justify-center"
            >
              ✕
            </button>
            <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
              Preview Soal: {previewQuestion.categoryLabel}
            </span>
            <h4 className="text-base font-bold text-slate-900 mt-2 mb-4">
              {previewQuestion.promptText}
            </h4>

            {previewQuestion.stimulusText && (
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 mb-4 max-h-40 overflow-y-auto leading-relaxed">
                {previewQuestion.stimulusText}
              </div>
            )}

            <div className="space-y-2 mb-4">
              {previewQuestion.options.map((opt, oIdx) => (
                <div
                  key={oIdx}
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    oIdx === previewQuestion.correctAnswerIndex
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="font-bold">{String.fromCharCode(65 + oIdx)}.</span>
                  <span>{opt}</span>
                  {oIdx === previewQuestion.correctAnswerIndex && (
                    <span className="ml-auto text-[11px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded">
                      Kunci Jawaban
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 bg-purple-50 rounded-xl text-xs text-purple-900">
              <p className="font-bold mb-1">Penjelasan:</p>
              <p className="text-[11px] leading-relaxed">{previewQuestion.explanationId}</p>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-purple-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl">
            <h3 className="text-lg font-display font-bold text-slate-900 mb-3">
              Import Soal TOEFL (JSON / CSV)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Salin dan tempel data soal dalam format JSON atau CSV standar.
            </p>

            <div className="flex items-center gap-3 mb-3">
              <button
                type="button"
                onClick={() => setImportFormat('json')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${
                  importFormat === 'json'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Format JSON
              </button>
              <button
                type="button"
                onClick={() => setImportFormat('csv')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${
                  importFormat === 'csv'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Format CSV
              </button>
            </div>

            <textarea
              rows={8}
              value={importContent}
              onChange={(e) => setImportContent(e.target.value)}
              placeholder={
                importFormat === 'json'
                  ? '[{"category":"structure", "promptText":"...", "options":["A","B","C","D"], "correctAnswerIndex":0}]'
                  : 'Category,Category_Label,Subtype,Stimulus_Text,Prompt_Text,Option_A,Option_B,Option_C,Option_D,Correct_Answer_Index,Explanation_ID,Explanation_EN,Audio_Transcript\nstructure,Structure,Inversion,,On the mountain...,where stands,stands,does it,standing,1,Penjelasan ID,Explanation EN,'
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-purple-500"
            />

            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/quizzes/${quiz.id}/import`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminToken}`
                      },
                      body: JSON.stringify({ content: importContent, format: importFormat })
                    });
                    const d = await res.json();
                    if (res.ok) {
                      setMessage({ text: `Berhasil mengimpor ${d.count} soal baru!`, type: 'success' });
                      setIsImportModalOpen(false);
                      setImportContent('');
                      onUpdateQuiz();
                    } else {
                      setMessage({ text: d.error || 'Gagal mengimpor data', type: 'error' });
                    }
                  } catch {
                    setMessage({ text: 'Gagal memproses import data.', type: 'error' });
                  }
                }}
                className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md cursor-pointer"
              >
                Proses Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
