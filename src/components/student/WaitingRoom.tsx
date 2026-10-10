import React, { useState, useEffect } from 'react';
import { Users, Clock, Zap, Volume2, ShieldAlert, Sparkles } from 'lucide-react';
import { speakDialogue } from '../../utils/audioGenerator';

interface WaitingRoomProps {
  roomPin: string;
  participantName: string;
  avatar: string;
  onQuizStarted: () => void;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({
  roomPin,
  participantName,
  avatar,
  onQuizStarted
}) => {
  const [participants, setParticipants] = useState<any[]>([]);
  const [hasTestedAudio, setHasTestedAudio] = useState(false);
  const [roomInfo, setRoomInfo] = useState<any>(null);

  useEffect(() => {
    // Initial fetch
    fetch(`/api/rooms/${roomPin}`)
      .then(res => res.json())
      .then(d => {
        setRoomInfo(d);
        if (d.state === 'in_progress') {
          onQuizStarted();
        }
      });

    // Real-time SSE listener
    const sse = new EventSource(`/api/rooms/${roomPin}/live-stream`);
    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'ROOM_UPDATE') {
          setParticipants(data.participants || []);
          if (data.state === 'in_progress') {
            onQuizStarted();
          }
        }
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    return () => {
      sse.close();
    };
  }, [roomPin, onQuizStarted]);

  const handleTestAudio = () => {
    setHasTestedAudio(true);
    speakDialogue('Audio ready. Welcome to TOEFL Quiz Battle!');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      {/* Waiting Room Header */}
      <div className="bg-white border border-purple-200/80 rounded-3xl p-6 sm:p-8 shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300" />

        <div className="w-16 h-16 rounded-3xl bg-purple-100 border-2 border-purple-200 flex items-center justify-center text-4xl mx-auto mb-4 animate-float">
          {avatar}
        </div>

        <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
          Halo, {participantName}! 👋
        </h1>
        <p className="text-xs text-purple-700 font-semibold mt-1 flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          Kamu sudah masuk di Room PIN:
          <span className="font-mono font-black text-sm bg-purple-100 px-2.5 py-0.5 rounded-lg text-purple-900 border border-purple-200">
            {roomPin}
          </span>
        </p>

        <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 text-amber-900 px-4 py-2 rounded-2xl text-xs font-semibold border border-amber-200">
          <Clock className="w-4 h-4 text-amber-600 animate-spin" />
          <span>Menunggu Host / Guru memulai kuis battle...</span>
        </div>
      </div>

      {/* Audio Readiness Check (Mobile Autoplay Friendly) */}
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50/50 border border-purple-200/70 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              Uji Coba Suara (Listening Check)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Sentuh tombol ini agar browser HP kamu mengizinkan pemutaran audio Listening saat kuis dimulai.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTestAudio}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5 ${
            hasTestedAudio
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-purple-600 hover:bg-purple-700 text-white active:scale-95'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          {hasTestedAudio ? 'Audio Siap! 🔊' : 'Tes Suara Sekarang 🎵'}
        </button>
      </div>

      {/* Roster of joined classmates */}
      <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-purple-600" />
            Peserta yang Bergabung ({participants.length})
          </h2>
          <span className="text-[11px] text-slate-400">Live Sync</span>
        </div>

        {participants.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            Menghubungkan ke room...
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto">
            {participants.map((p) => (
              <div
                key={p.id}
                className={`p-2.5 rounded-2xl border flex items-center gap-2 text-xs transition-all ${
                  p.name === participantName
                    ? 'bg-purple-100/70 border-purple-300 font-bold text-purple-900 ring-2 ring-purple-200'
                    : 'bg-slate-50 border-slate-100 text-slate-700'
                }`}
              >
                <span className="text-xl" aria-hidden="true">{p.avatar}</span>
                <span className="truncate">{p.name}</span>
                {p.name === participantName && (
                  <span className="ml-auto text-[9px] bg-purple-600 text-white px-1.5 py-0.2 rounded font-black">
                    Kamu
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rules & Scoring System Callout */}
      <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          Aturan Main & Rumus Skor TOEFL Battle
        </h3>
        <ul className="text-xs text-slate-600 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-purple-600 font-bold">•</span>
            <span><strong>30 Detik per Soal:</strong> Server mengatur batas waktu secara otoritatif. Bila waktu habis tanpa submit, soal ditandai kosong (0 poin).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 font-bold">•</span>
            <span><strong>Bonus Kecepatan:</strong> Jawaban benar memperoleh <strong>100 Poin Dasar</strong> + bonus kecepatan hingga <strong>50 Poin</strong> (semakin cepat submit, semakin tinggi skor!).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 font-bold">•</span>
            <span><strong>Feedback 2 Detik:</strong> Kunci jawaban terbuka sejenak sebelum lanjut otomatis ke soal berikutnya tanpa memotong 30 detik soal baru.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
