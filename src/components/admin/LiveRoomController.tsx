import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  Flag,
  Lock,
  Unlock,
  Copy,
  Check,
  Users,
  Clock,
  Radio,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { QuizRoom } from '../../types/quiz';

interface LiveRoomControllerProps {
  roomPin: string;
  adminToken: string;
}

export const LiveRoomController: React.FC<LiveRoomControllerProps> = ({ roomPin, adminToken }) => {
  const [room, setRoom] = useState<QuizRoom | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRoomData = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomPin}`);
      if (res.ok) {
        const d = await res.json();
        setRoom(d);
      }
    } catch (err) {
      console.error('Error fetching room:', err);
    }
  };

  useEffect(() => {
    fetchRoomData();

    // Setup SSE live stream
    const sse = new EventSource(`/api/rooms/${roomPin}/live-stream`);
    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'ROOM_UPDATE') {
          fetchRoomData();
        }
      } catch {
        // Heartbeat or parse error
      }
    };

    return () => {
      sse.close();
    };
  }, [roomPin]);

  const handleAction = async (endpoint: string, body?: any) => {
    setIsLoading(true);
    try {
      await fetch(`/api/rooms/${roomPin}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: body ? JSON.stringify(body) : undefined
      });
      fetchRoomData();
    } catch (err) {
      console.error(`Error triggering ${endpoint}:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}?room=${roomPin}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!room) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-purple-100">
        <RefreshCw className="w-6 h-6 animate-spin text-purple-600 mx-auto mb-2" />
        <p className="text-xs text-slate-500">Memuat kendali room live...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-purple-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Room Header with Big PIN Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-purple-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-900">
              Live Battle Controller · {room.quizTitle}
            </h3>
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-mono font-black tracking-widest text-purple-700 bg-purple-50 px-4 py-1 rounded-2xl border border-purple-200">
              {room.pin}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Tersalin!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Salin Link Join
                </>
              )}
            </button>
          </div>
        </div>

        {/* Room State Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-900 font-bold flex items-center gap-1.5 border border-purple-100">
            <Users className="w-3.5 h-3.5 text-purple-600" />
            {room.participantCount} Siswa Bergabung
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold uppercase tracking-wide">
            Status: {room.state}
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 font-bold flex items-center gap-1.5 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            30 Detik / Soal
          </div>
        </div>
      </div>

      {/* Live Battle Control Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {room.state === 'waiting' ? (
          <button
            type="button"
            onClick={() => handleAction('start')}
            disabled={isLoading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            Mulai Live Battle!
          </button>
        ) : room.state === 'in_progress' ? (
          <button
            type="button"
            onClick={() => handleAction('pause')}
            disabled={isLoading}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Pause className="w-4 h-4 fill-current" />
            Jeda / Pause Sesi
          </button>
        ) : room.state === 'paused' ? (
          <button
            type="button"
            onClick={() => handleAction('resume')}
            disabled={isLoading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            Lanjutkan / Resume
          </button>
        ) : (
          <div className="py-3.5 px-4 bg-slate-100 text-slate-500 rounded-2xl font-bold text-xs text-center flex items-center justify-center">
            Sesi Kuis Selesai
          </div>
        )}

        <button
          type="button"
          onClick={() => handleAction('next-question')}
          disabled={isLoading || room.state === 'finished' || room.state === 'waiting'}
          className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <SkipForward className="w-4 h-4" />
          Soal Berikutnya ({room.currentQuestionIndex + 1}/{room.totalQuestions})
        </button>

        <button
          type="button"
          onClick={() => handleAction('finish')}
          disabled={isLoading || room.state === 'finished'}
          className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Flag className="w-4 h-4" />
          Akhiri & Tampilkan Podium
        </button>

        {/* Lock/Unlock Review Toggle */}
        <button
          type="button"
          onClick={() => handleAction('toggle-review', { isReviewUnlocked: !room.isReviewUnlocked })}
          disabled={isLoading}
          className={`w-full py-3.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border ${
            room.isReviewUnlocked
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
          }`}
        >
          {room.isReviewUnlocked ? (
            <>
              <Unlock className="w-4 h-4 text-emerald-600" />
              Pembahasan Terbuka
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 text-slate-600" />
              Pembahasan Terkunci
            </>
          )}
        </button>
      </div>

      {/* Host Monitoring Tips */}
      <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-4 text-xs text-purple-900 leading-relaxed">
        <p className="font-bold flex items-center gap-1.5 mb-1">
          <Radio className="w-4 h-4 text-purple-600" />
          Sinkronisasi Otoritatif Waktu Nyata
        </p>
        <p className="text-purple-800 text-[11px]">
          Semua peserta menerima pertanyaan secara serempak. Timer 30 detik dihitung oleh server
          sehingga manipulasi jam browser tidak memengaruhi hasil. Peserta yang reconnect akan
          langsung disinkronkan ke pertanyaan aktif.
        </p>
      </div>
    </div>
  );
};
