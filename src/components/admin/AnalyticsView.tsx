import React, { useState, useEffect } from 'react';
import { Download, BarChart3, Users, Clock, Target, AlertCircle, RefreshCw } from 'lucide-react';

interface AnalyticsViewProps {
  roomPin: string;
  adminToken: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ roomPin, adminToken }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/rooms/${roomPin}/analytics`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [roomPin]);

  if (isLoading) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-purple-100">
        <RefreshCw className="w-6 h-6 animate-spin text-purple-600 mx-auto mb-2" />
        <p className="text-xs text-slate-500">Memuat statistik kuis...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-purple-100">
        <p className="text-xs text-slate-500">Belum ada data statistik untuk room ini.</p>
      </div>
    );
  }

  const avgScore = data.leaderboard?.length > 0
    ? Math.round(data.leaderboard.reduce((acc: number, cur: any) => acc + cur.totalScore, 0) / data.leaderboard.length)
    : 0;

  const avgAccuracy = data.leaderboard?.length > 0
    ? Math.round(data.leaderboard.reduce((acc: number, cur: any) => acc + cur.accuracy, 0) / data.leaderboard.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header & Export CSV */}
      <div className="bg-white border border-purple-200/80 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-display font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Laporan & Analisis Room: {roomPin}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {data.quizTitle} · Mode {data.mode}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchAnalytics}
            className="p-2 text-slate-500 hover:text-purple-600 bg-slate-100 rounded-xl cursor-pointer"
            title="Segarkan Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <a
            href={`/api/admin/rooms/${roomPin}/export-csv`}
            download
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export Laporan CSV
          </a>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-purple-100 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Users className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-semibold">Total Peserta</span>
          </div>
          <p className="text-2xl font-black text-slate-900 tabular-nums">
            {data.totalParticipants}
          </p>
        </div>

        <div className="bg-white border border-purple-100 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Target className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold">Rata-rata Akurasi</span>
          </div>
          <p className="text-2xl font-black text-emerald-700 tabular-nums">
            {avgAccuracy}%
          </p>
        </div>

        <div className="bg-white border border-purple-100 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <BarChart3 className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold">Rata-rata Skor</span>
          </div>
          <p className="text-2xl font-black text-amber-600 tabular-nums">
            {avgScore} pts
          </p>
        </div>

        <div className="bg-white border border-purple-100 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-semibold">Batas Waktu</span>
          </div>
          <p className="text-2xl font-black text-blue-700 tabular-nums">
            30s / soal
          </p>
        </div>
      </div>

      {/* Per-Question Accuracy Breakdown */}
      <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-4">
          Tingkat Kesulitan & Akurasi per Soal
        </h4>

        <div className="space-y-3">
          {data.questionStats?.map((qs: any) => (
            <div key={qs.questionNumber} className="border border-slate-100 rounded-xl p-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-800">
                  Soal #{qs.questionNumber} ({qs.category} · {qs.subtype})
                </span>
                <span className="font-bold tabular-nums text-purple-700">
                  {qs.accuracy}% Benar
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${qs.accuracy}%` }}
                  title={`${qs.correct} Benar`}
                />
                <div
                  className="bg-rose-400 h-full"
                  style={{ width: `${data.totalParticipants > 0 ? (qs.wrong / data.totalParticipants) * 100 : 0}%` }}
                  title={`${qs.wrong} Salah`}
                />
                <div
                  className="bg-amber-300 h-full"
                  style={{ width: `${data.totalParticipants > 0 ? (qs.timeout / data.totalParticipants) * 100 : 0}%` }}
                  title={`${qs.timeout} Timeout / Kosong`}
                />
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-1.5">
                <span className="text-emerald-700">✓ {qs.correct} Benar</span>
                <span className="text-rose-600">✗ {qs.wrong} Salah</span>
                <span className="text-amber-700">⏱️ {qs.timeout} Kosong</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Participants Detail Table */}
      <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-xs overflow-hidden">
        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-4">
          Daftar Rinci Skor Peserta
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-purple-100 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 font-bold">Peringkat</th>
                <th className="pb-3 font-bold">Nama Peserta</th>
                <th className="pb-3 font-bold text-right">Skor Total</th>
                <th className="pb-3 font-bold text-right">Benar / Soal</th>
                <th className="pb-3 font-bold text-right">Akurasi</th>
                <th className="pb-3 font-bold text-right">Total Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.leaderboard?.map((entry: any) => (
                <tr key={entry.id} className="hover:bg-slate-50/60">
                  <td className="py-3 font-bold tabular-nums text-slate-700">
                    #{entry.rank} {entry.isTied && <span className="text-[10px] text-amber-600 font-normal">(Seri)</span>}
                  </td>
                  <td className="py-3 font-semibold text-slate-900 flex items-center gap-2">
                    <span>{entry.avatar}</span>
                    <span>{entry.name}</span>
                  </td>
                  <td className="py-3 text-right font-black text-purple-700 tabular-nums">
                    {entry.totalScore}
                  </td>
                  <td className="py-3 text-right tabular-nums text-slate-600">
                    {entry.correctCount} / {entry.totalQuestions}
                  </td>
                  <td className="py-3 text-right tabular-nums font-semibold text-emerald-700">
                    {entry.accuracy}%
                  </td>
                  <td className="py-3 text-right tabular-nums text-slate-500">
                    {(entry.totalResponseTimeMs / 1000).toFixed(1)}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
