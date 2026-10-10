/**
 * TOEFL QUIZ BATTLE
 * Full-Stack Interactive Educational Quiz Game
 * Roles: ADMIN and SISWA
 */

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Zap,
  Volume2,
  BookOpen,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Flame,
  HelpCircle,
  Clock,
  Award
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { WaitingRoom } from './components/student/WaitingRoom';
import { QuizPlayer } from './components/student/QuizPlayer';
import { ResultView } from './components/student/ResultView';
import { ReviewView } from './components/student/ReviewView';

const AVATAR_OPTIONS = ['🎓', '🦊', '🦉', '🐱', '🚀', '🐼', '🌟', '🦁', '🐬', '🐨'];

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'join' | 'solo' | 'waiting' | 'playing' | 'results' | 'review' | 'admin'>('home');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminToken, setAdminToken] = useState<string>('');
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);

  // Student Session State
  const [roomPin, setRoomPin] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('🎓');
  const [studentToken, setStudentToken] = useState<string>('');
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Check URL query parameters for auto room join e.g. ?room=123456
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('room');
      if (urlRoom) {
        setRoomPin(urlRoom.trim().toUpperCase());
        setCurrentView('join');
      }

      // Restore admin session if available
      const savedAdminToken = localStorage.getItem('toefl_admin_token');
      if (savedAdminToken) {
        setAdminToken(savedAdminToken);
        setIsAdmin(true);
      }
    }
  }, []);

  const handleAdminLoginSuccess = () => {
    const token = localStorage.getItem('toefl_admin_token') || 'admin-authenticated-session-token';
    setAdminToken(token);
    setIsAdmin(true);
    setCurrentView('admin');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('toefl_admin_token');
    setAdminToken('');
    setIsAdmin(false);
    setCurrentView('home');
  };

  // Student Join Room
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomPin.trim() || !studentName.trim()) {
      setJoinError('Silakan masukkan PIN Room dan Nama Anda.');
      return;
    }

    setIsJoining(true);
    setJoinError(null);

    try {
      const pin = roomPin.trim().toUpperCase();
      const res = await fetch(`/api/rooms/${pin}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: studentName.trim(),
          avatar: selectedAvatar
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setJoinError(data.error || 'Room tidak ditemukan.');
        setIsJoining(false);
        return;
      }

      setStudentToken(data.token);
      setStudentName(data.uniqueName);
      setRoomPin(pin);

      if (data.mode === 'self_paced' || data.state === 'in_progress') {
        setCurrentView('playing');
      } else {
        setCurrentView('waiting');
      }
    } catch {
      setJoinError('Gagal terhubung ke server kuis.');
    } finally {
      setIsJoining(false);
    }
  };

  // Quick Solo Mode: Instantly creates a self-paced room and jumps in
  const handleStartSolo = async () => {
    setIsJoining(true);
    setJoinError(null);
    try {
      const qRes = await fetch('/api/quizzes');
      const qList = await qRes.json();
      const targetQuiz = qList[0];
      if (!targetQuiz) {
        setJoinError('Belum ada kuis yang tersedia.');
        setIsJoining(false);
        return;
      }

      const roomRes = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: targetQuiz.id,
          mode: 'self_paced'
        })
      });
      const roomData = await roomRes.json();

      const nameToUse = studentName.trim() || 'Peserta Mandiri';
      const joinRes = await fetch(`/api/rooms/${roomData.pin}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameToUse,
          avatar: selectedAvatar
        })
      });
      const joinData = await joinRes.json();

      setRoomPin(roomData.pin);
      setStudentName(joinData.uniqueName);
      setStudentToken(joinData.token);
      setCurrentView('playing');
    } catch {
      setJoinError('Gagal membuat room latihan mandiri.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF7ED] text-slate-800 flex flex-col font-sans">
      {/* Universal Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view as any)}
        isAdmin={isAdmin}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        onAdminLogout={handleAdminLogout}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1 pb-16">
        {/* VIEW 1: HOME & QUICK JOIN */}
        {(currentView === 'home' || currentView === 'join' || currentView === 'solo') && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 space-y-12">
            {/* Playful Hero Banner */}
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Kuis Edukasi TOEFL ITP Interaktif</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-display font-black text-slate-900 tracking-tight leading-tight">
                TOEFL <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">QUIZ BATTLE</span> ⚡
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
                Tantang teman sekelas dalam kuis TOEFL berkecepatan 30 detik!
                Kuasai materi <strong>Double Negatives</strong>, <strong>Locative Inversion</strong>, dan <strong>Unstated Details</strong> dengan timer otoritatif & pembahasan bilingual.
              </p>
            </div>

            {/* Quick Student Join Card */}
            <div className="max-w-md mx-auto bg-white border border-purple-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-display font-extrabold text-slate-900 mb-1 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                Gabung Room Kuis Siswa
              </h2>
              <p className="text-xs text-slate-500 mb-5">
                Masukkan PIN dari pengajar. Tanpa perlu registrasi akun!
              </p>

              {joinError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <span>{joinError}</span>
                </div>
              )}

              <form onSubmit={handleJoinRoom} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Room Code / PIN (6 Digit)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={roomPin}
                    onChange={(e) => setRoomPin(e.target.value.toUpperCase())}
                    placeholder="Contoh: 849201"
                    className="w-full px-4 py-3 bg-slate-50 border border-purple-200 rounded-2xl text-base font-mono font-black tracking-widest uppercase text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Kamu
                  </label>
                  <input
                    type="text"
                    maxLength={25}
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Masukkan nama panggilan..."
                    className="w-full px-4 py-3 bg-slate-50 border border-purple-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Nama kembar dalam room ditangani otomatis dengan nomor unik.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Pilih Avatar Kamu
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {AVATAR_OPTIONS.map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setSelectedAvatar(av)}
                        className={`h-11 rounded-2xl text-xl flex items-center justify-center transition-all cursor-pointer ${
                          selectedAvatar === av
                            ? 'bg-purple-200 ring-3 ring-purple-500 scale-105'
                            : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={isJoining}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-extrabold rounded-2xl transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 text-sm"
                  >
                    {isJoining ? 'Menghubungkan...' : 'Mulai Battle Sekarang ⚡'}
                  </button>

                  <div className="text-center pt-2">
                    <span className="text-xs text-slate-400">atau</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartSolo}
                    disabled={isJoining}
                    className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold rounded-2xl transition-colors cursor-pointer text-xs flex items-center justify-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5 text-purple-600" />
                    Latihan Mandiri 30s (Solo Mode Langsung)
                  </button>
                </div>
              </form>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Timer Otoritatif 30 Detik
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Batas waktu dihitung server-side secara adil. Dilengkapi bonus kecepatan hingga 50 poin tambahan untuk jawaban kilat.
                </p>
              </div>

              <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center">
                  <Volume2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Listening Dialog & Transkrip
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Audio player responsif dengan tombol play dan replay. Transkrip dialog tersembunyi selama ujian dan terbuka saat pembahasan.
                </p>
              </div>

              <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Pembahasan Dwibahasa
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Setiap soal dilengkapi kunci jawaban dan penjelasan mendalam dalam Bahasa Indonesia dan English untuk pemahaman konsep maksimal.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: STUDENT WAITING ROOM */}
        {currentView === 'waiting' && (
          <WaitingRoom
            roomPin={roomPin}
            participantName={studentName}
            avatar={selectedAvatar}
            onQuizStarted={() => setCurrentView('playing')}
          />
        )}

        {/* VIEW 3: IN-GAME QUIZ PLAYER */}
        {currentView === 'playing' && (
          <QuizPlayer
            roomPin={roomPin}
            token={studentToken}
            participantName={studentName}
            avatar={selectedAvatar}
            onFinished={() => setCurrentView('results')}
          />
        )}

        {/* VIEW 4: FINAL RESULTS & PODIUM */}
        {currentView === 'results' && (
          <ResultView
            roomPin={roomPin}
            token={studentToken}
            onOpenReview={() => setCurrentView('review')}
            onPlayAgain={() => setCurrentView('home')}
          />
        )}

        {/* VIEW 5: IN-DEPTH REVIEW VIEW */}
        {currentView === 'review' && (
          <ReviewView
            roomPin={roomPin}
            token={studentToken}
            onBack={() => setCurrentView('results')}
          />
        )}

        {/* VIEW 6: ADMIN DASHBOARD */}
        {currentView === 'admin' && (
          <AdminDashboard adminToken={adminToken} />
        )}
      </main>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
}
