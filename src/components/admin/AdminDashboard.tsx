import React, { useState, useEffect } from 'react';
import {
  Layers,
  Radio,
  BarChart2,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Quiz, QuizRoom } from '../../types/quiz';
import { QuizEditor } from './QuizEditor';
import { LiveRoomController } from './LiveRoomController';
import { AnalyticsView } from './AnalyticsView';

interface AdminDashboardProps {
  adminToken: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminToken }) => {
  const [activeTab, setActiveTab] = useState<'quizzes' | 'rooms' | 'analytics'>('quizzes');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [activeRoomPin, setActiveRoomPin] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [newRoomMode, setNewRoomMode] = useState<'live' | 'self_paced'>('live');
  const [newRoomCustomPin, setNewRoomCustomPin] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [roomNotification, setRoomNotification] = useState<string | null>(null);

  const fetchQuizzes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/quizzes');
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data);
        if (data.length > 0 && !selectedQuizId) {
          setSelectedQuizId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load quizzes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentQuiz = async (id: string) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/quizzes/${id}`);
      if (res.ok) {
        const d = await res.json();
        setCurrentQuiz(d);
      }
    } catch (err) {
      console.error('Failed to load quiz details:', err);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (selectedQuizId) {
      fetchCurrentQuiz(selectedQuizId);
    }
  }, [selectedQuizId]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuizId) return;
    setIsCreatingRoom(true);
    setRoomNotification(null);

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          quizId: selectedQuizId,
          mode: newRoomMode,
          pin: newRoomCustomPin ? newRoomCustomPin.trim().toUpperCase() : undefined
        })
      });

      const d = await res.json();
      if (res.ok) {
        setActiveRoomPin(d.pin);
        setActiveTab('rooms');
        setRoomNotification(`Room PIN ${d.pin} berhasil dibuat (${newRoomMode === 'live' ? 'Mode Live Battle' : 'Mode Mandiri'})!`);
      }
    } catch {
      setRoomNotification('Gagal membuat room kuis.');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Navigation Tabs Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-purple-200/60 pb-4">
        <div>
          <h1 className="text-2xl font-display font-black text-slate-900 tracking-tight">
            Dashboard Pengajar & Administrator
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola materi TOEFL, validasi audio listening, kontrol live room battle, dan tinjau performa siswa.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('quizzes')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'quizzes'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Bank Soal & Audio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rooms')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'rooms'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-4 h-4" />
            Live Battle Room
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Statistik & Laporan
          </button>
        </div>
      </div>

      {roomNotification && (
        <div className="p-3 bg-purple-100 text-purple-900 rounded-2xl text-xs font-semibold flex items-center justify-between">
          <span>{roomNotification}</span>
          <button
            type="button"
            onClick={() => setRoomNotification(null)}
            className="text-purple-600 hover:text-purple-900 px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: BANK SOAL & AUDIO MANAGEMENT */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          {currentQuiz && (
            <QuizEditor
              quiz={currentQuiz}
              onUpdateQuiz={() => {
                fetchQuizzes();
                fetchCurrentQuiz(currentQuiz.id);
              }}
              adminToken={adminToken}
            />
          )}
        </div>
      )}

      {/* TAB 2: ROOM MANAGEMENT & LIVE CONTROLLER */}
      {activeTab === 'rooms' && (
        <div className="space-y-6">
          {/* Create Room Form Card */}
          <div className="bg-white border border-purple-200/80 rounded-3xl p-6 shadow-xs">
            <h3 className="text-base font-display font-extrabold text-slate-900 mb-2 flex items-center gap-2">
              <Radio className="w-5 h-5 text-purple-600" />
              Buat Sesi Room Kuis Baru
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Buka room untuk kompetisi kelas live serempak atau latihan mandiri dengan timer 30 detik.
            </p>

            <form onSubmit={handleCreateRoom} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Quiz
                </label>
                <select
                  value={selectedQuizId}
                  onChange={(e) => setSelectedQuizId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
                >
                  {quizzes.map(q => (
                    <option key={q.id} value={q.id}>
                      {q.title} ({q.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mode Sesi
                </label>
                <select
                  value={newRoomMode}
                  onChange={(e) => setNewRoomMode(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
                >
                  <option value="live">Mode Live Battle (Serempak + Host)</option>
                  <option value="self_paced">Mode Mandiri (Self-Paced Practice)</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Custom PIN (Opsional)
                  </label>
                  <input
                    type="text"
                    maxLength={8}
                    value={newRoomCustomPin}
                    onChange={(e) => setNewRoomCustomPin(e.target.value.toUpperCase())}
                    placeholder="Contoh: TOEFL1"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-mono tracking-wider focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCreatingRoom}
                  className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Buka Room
                </button>
              </div>
            </form>
          </div>

          {/* Active Live Room Controller */}
          {activeRoomPin ? (
            <LiveRoomController roomPin={activeRoomPin} adminToken={adminToken} />
          ) : (
            <div className="p-8 text-center bg-white border border-purple-100 rounded-3xl text-slate-500 text-xs">
              Belum ada room yang dipilih atau dibuat. Buat room baru di atas untuk memulai sesi.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STATISTIK & LAPORAN */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {activeRoomPin ? (
            <AnalyticsView roomPin={activeRoomPin} adminToken={adminToken} />
          ) : (
            <div className="p-8 text-center bg-white border border-purple-100 rounded-3xl text-slate-500 text-xs">
              Pilih atau buat room terlebih dahulu untuk melihat analisis dan mengunduh laporan CSV.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
