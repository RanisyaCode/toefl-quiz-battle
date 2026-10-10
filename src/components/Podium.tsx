import React, { useEffect } from 'react';
import { Trophy, Medal, Star, Clock, Target, Award } from 'lucide-react';
import { LeaderboardEntry } from '../types/quiz';
import { firePodiumConfetti } from './ConfettiEffect';

interface PodiumProps {
  entries: LeaderboardEntry[];
  currentParticipantId?: string;
}

export const Podium: React.FC<PodiumProps> = ({ entries, currentParticipantId }) => {
  useEffect(() => {
    // Fire festive celebration confetti
    firePodiumConfetti();
  }, []);

  const first = entries.find(e => e.rank === 1);
  const second = entries.find(e => e.rank === 2) || (entries[1] && entries[1].rank === 1 ? entries[1] : undefined);
  const third = entries.find(e => e.rank === 3) || entries[2];

  return (
    <div className="w-full">
      {/* 3-Step Podium Display */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-8 pb-4 max-w-lg mx-auto">
        {/* 2nd Place (Silver) */}
        <div className="flex flex-col items-center">
          {second ? (
            <div className={`w-full flex flex-col items-center text-center p-2 rounded-2xl transition-all ${
              second.id === currentParticipantId ? 'ring-2 ring-purple-400 bg-purple-50/80' : ''
            }`}>
              <div className="relative mb-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-100 border-3 border-slate-300 shadow-md flex items-center justify-center text-2xl sm:text-3xl">
                  {second.avatar}
                </div>
                <span className="absolute -top-2 -right-1 bg-slate-300 text-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
                  <Medal className="w-3 h-3 text-slate-600" />
                  #2
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[90px] sm:max-w-[120px]">
                {second.name}
              </p>
              <p className="text-xs font-black text-purple-700 tabular-nums">
                {second.totalScore} pts
              </p>
              <div className="w-full mt-2 bg-gradient-to-t from-slate-300 to-slate-200 h-20 sm:h-24 rounded-t-xl flex flex-col items-center justify-center text-slate-700 shadow-sm">
                <span className="text-xs font-bold">2nd</span>
                <span className="text-[10px] text-slate-500 tabular-nums">{second.accuracy}% acc</span>
              </div>
            </div>
          ) : (
            <div className="w-full bg-slate-100/60 h-20 sm:h-24 rounded-t-xl flex items-center justify-center text-xs text-slate-400">
              Kosong
            </div>
          )}
        </div>

        {/* 1st Place (Gold Winner - Tallest) */}
        <div className="flex flex-col items-center -mt-6">
          {first ? (
            <div className={`w-full flex flex-col items-center text-center p-2 rounded-2xl transition-all ${
              first.id === currentParticipantId ? 'ring-2 ring-amber-400 bg-amber-50/80' : ''
            }`}>
              <div className="relative mb-2">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                  <Trophy className="w-7 h-7 sm:w-8 sm:h-8 fill-amber-400" />
                </div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-100 border-4 border-amber-400 shadow-lg flex items-center justify-center text-3xl sm:text-4xl ring-4 ring-amber-200">
                  {first.avatar}
                </div>
                <span className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 text-xs font-black px-2 py-0.5 rounded-full shadow flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-950" />
                  #1
                </span>
              </div>
              <p className="text-sm sm:text-base font-extrabold text-slate-900 truncate max-w-[100px] sm:max-w-[130px]">
                {first.name}
              </p>
              <p className="text-sm font-black text-amber-600 tabular-nums">
                {first.totalScore} pts
              </p>
              <div className="w-full mt-2 bg-gradient-to-t from-amber-400 to-amber-300 h-28 sm:h-34 rounded-t-xl flex flex-col items-center justify-center text-amber-950 shadow-md">
                <span className="text-sm font-black">1st CHAMPION</span>
                <span className="text-xs font-bold tabular-nums">{first.accuracy}% akurat</span>
                <span className="text-[10px] opacity-80 tabular-nums">{(first.totalResponseTimeMs / 1000).toFixed(1)}s</span>
              </div>
            </div>
          ) : (
            <div className="w-full bg-amber-100/60 h-28 sm:h-34 rounded-t-xl flex items-center justify-center text-xs text-amber-600">
              Kosong
            </div>
          )}
        </div>

        {/* 3rd Place (Bronze) */}
        <div className="flex flex-col items-center">
          {third ? (
            <div className={`w-full flex flex-col items-center text-center p-2 rounded-2xl transition-all ${
              third.id === currentParticipantId ? 'ring-2 ring-purple-400 bg-purple-50/80' : ''
            }`}>
              <div className="relative mb-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-50 border-3 border-amber-600 shadow-md flex items-center justify-center text-2xl sm:text-3xl">
                  {third.avatar}
                </div>
                <span className="absolute -top-2 -right-1 bg-amber-700 text-amber-100 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
                  <Award className="w-3 h-3" />
                  #3
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[90px] sm:max-w-[120px]">
                {third.name}
              </p>
              <p className="text-xs font-black text-purple-700 tabular-nums">
                {third.totalScore} pts
              </p>
              <div className="w-full mt-2 bg-gradient-to-t from-amber-600/80 to-amber-500/70 h-16 sm:h-20 rounded-t-xl flex flex-col items-center justify-center text-white shadow-sm">
                <span className="text-xs font-bold">3rd</span>
                <span className="text-[10px] text-amber-100 tabular-nums">{third.accuracy}% acc</span>
              </div>
            </div>
          ) : (
            <div className="w-full bg-slate-100/60 h-16 sm:h-20 rounded-t-xl flex items-center justify-center text-xs text-slate-400">
              Kosong
            </div>
          )}
        </div>
      </div>

      {/* Complete Leaderboard Roster Table */}
      <div className="mt-6 bg-white border border-purple-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-purple-50/60 border-b border-purple-100 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-purple-600" />
            Klasemen Akhir Peserta
          </h3>
          <span className="text-xs text-slate-500">
            {entries.length} Peserta
          </span>
        </div>

        <div className="divide-y divide-purple-50 max-h-72 overflow-y-auto">
          {entries.map((entry) => {
            const isMe = entry.id === currentParticipantId;
            return (
              <div
                key={entry.id}
                className={`px-4 py-3 flex items-center justify-between text-sm transition-colors ${
                  isMe ? 'bg-purple-100/60 font-semibold text-purple-950' : 'hover:bg-slate-50/80 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank indicator with tied badge */}
                  <div className="w-8 flex items-center justify-center">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black tabular-nums ${
                      entry.rank === 1
                        ? 'bg-amber-400 text-amber-950'
                        : entry.rank === 2
                        ? 'bg-slate-300 text-slate-800'
                        : entry.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {entry.rank}
                    </span>
                  </div>

                  <span className="text-xl" aria-hidden="true">{entry.avatar}</span>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800">
                        {entry.name}
                      </span>
                      {isMe && (
                        <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded font-bold">
                          Kamu
                        </span>
                      )}
                      {entry.isTied && (
                        <span className="text-[10px] text-amber-700 bg-amber-100 px-1 py-0.2 rounded font-medium">
                          Seri
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3 text-emerald-500" />
                        {entry.correctCount}/{entry.totalQuestions} Benar ({entry.accuracy}%)
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {(entry.totalResponseTimeMs / 1000).toFixed(1)}s
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-extrabold text-purple-700 tabular-nums">
                    {entry.totalScore}
                  </span>
                  <span className="text-[11px] text-purple-400 ml-1 font-medium">pts</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
