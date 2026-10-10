import React, { useState, useEffect } from 'react';
import { Trophy, Target, Clock, BookOpen, RotateCcw, Share2, CheckCircle, XCircle, Timer, AlertTriangle } from 'lucide-react';
import { Podium } from '../Podium';
import { LeaderboardEntry } from '../../types/quiz';

interface ResultViewProps {
  roomPin: string;
  token: string;
  onOpenReview: () => void;
  onPlayAgain: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  roomPin,
  token,
  onOpenReview,
  onPlayAgain
}) => {
  const [result, setResult] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/rooms/${roomPin}/results?token=${encodeURIComponent(token)}`).then(r => r.json()),
      fetch(`/api/rooms/${roomPin}/leaderboard`).then(r => r.json())
    ])
      .then(([resData, leadData]) => {
        setResult(resData);
        setLeaderboard(leadData.entries || []);
      })
      .catch(err => console.error('Error fetching results:', err))
      .finally(() => setIsLoading(false));
  }, [roomPin, token]);

  if (isLoading || !result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Mengkalkulasi podium dan skor akhir...</p>
      </div>
    );
  }

  const p = result.participant;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Final Celebration Banner Card */}
      <div className="bg-white border border-purple-200/80 rounded-3xl p-6 sm:p-8 shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300" />

        <div className="w-18 h-18 rounded-3xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-4xl mx-auto mb-3 shadow-md animate-bounce">
          {p.avatar}
        </div>

        <span className="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
          Hasil Kuis Resmi TOEFL Battle
        </span>

        <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight mt-2">
          Hebat, {p.name}! 🎉
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {result.quizTitle} · Room #{roomPin}
        </p>

        {/* Big Score Display */}
        <div className="mt-5 inline-block bg-gradient-to-b from-purple-50 to-pink-50/40 border border-purple-200 rounded-3xl px-8 py-4 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
            Skor Akhir Kamu
          </span>
          <span className="text-4xl sm:text-5xl font-black text-purple-700 tabular-nums">
            {p.totalScore}
          </span>
          <span className="text-sm font-bold text-purple-500 ml-1">pts</span>
        </div>

        {/* Rank & Accuracy Stat Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl">
            <span className="text-[11px] text-slate-400 font-bold block mb-1">Peringkat</span>
            <span className="text-xl font-black text-slate-900 tabular-nums flex items-center justify-center gap-1">
              #{p.rank} {p.isTied && <span className="text-[10px] text-amber-600 font-medium">(Seri)</span>}
            </span>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl">
            <span className="text-[11px] text-emerald-700 font-bold block mb-1">Akurasi</span>
            <span className="text-xl font-black text-emerald-800 tabular-nums">
              {p.accuracyPercentage}%
            </span>
          </div>

          <div className="bg-purple-50 border border-purple-100 p-3.5 rounded-2xl">
            <span className="text-[11px] text-purple-700 font-bold block mb-1">Benar / Salah</span>
            <span className="text-xl font-black text-purple-900 tabular-nums">
              {p.correctCount} / {p.wrongCount}
            </span>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-2xl">
            <span className="text-[11px] text-amber-700 font-bold block mb-1">Timeout</span>
            <span className="text-xl font-black text-amber-800 tabular-nums">
              {p.timeoutCount}
            </span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onOpenReview}
            className="w-full sm:w-auto px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            Pembahasan & Kunci Jawaban Lengkap
          </button>

          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Main Lagi / Cari Room Baru
          </button>
        </div>
      </div>

      {/* Podium & Final Leaderboard */}
      <Podium entries={leaderboard} currentParticipantId={p.id} />
    </div>
  );
};
