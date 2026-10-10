import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, Clock, Volume2, BookOpen, Lock, Sparkles } from 'lucide-react';
import { ParticipantReviewCard } from '../../types/quiz';
import { speakDialogue } from '../../utils/audioGenerator';

interface ReviewViewProps {
  roomPin: string;
  token: string;
  onBack: () => void;
}

export const ReviewView: React.FC<ReviewViewProps> = ({ roomPin, token, onBack }) => {
  const [reviewCards, setReviewCards] = useState<ParticipantReviewCard[]>([]);
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lockedMessage, setLockedMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterTab, setFilterTab] = useState<'all' | 'correct' | 'wrong' | 'timeout'>('all');

  useEffect(() => {
    fetch(`/api/rooms/${roomPin}/review?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.status === 403 && data.locked) {
          setIsLocked(true);
          setLockedMessage(data.message || 'Pembahasan dikunci oleh host.');
        } else if (res.ok) {
          setQuizTitle(data.quizTitle);
          setReviewCards(data.reviewCards || []);
        }
      })
      .catch(err => console.error('Error loading review:', err))
      .finally(() => setIsLoading(false));
  }, [roomPin, token]);

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Memuat kunci jawaban dan transkrip dialog...</p>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-display font-extrabold text-slate-900">
          Pembahasan Sedang Dikunci Host
        </h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          {lockedMessage}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          Kembali ke Skor Akhir
        </button>
      </div>
    );
  }

  const correctCount = reviewCards.filter(c => c.isCorrect).length;
  const wrongCount = reviewCards.filter(c => !c.isCorrect && !c.isTimeout).length;
  const timeoutCount = reviewCards.filter(c => c.isTimeout).length;

  const filteredCards = reviewCards.filter(c => {
    if (filterTab === 'correct') return c.isCorrect;
    if (filterTab === 'wrong') return !c.isCorrect && !c.isTimeout;
    if (filterTab === 'timeout') return c.isTimeout;
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Header & Back Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-purple-200/60 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900">
              Pembahasan & Kunci Jawaban Lengkap
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {quizTitle} · Uraian Dwibahasa (ID 🇮🇩 / EN 🇬🇧) & Transkrip Audio
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
        <button
          type="button"
          onClick={() => setFilterTab('all')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            filterTab === 'all'
              ? 'bg-white text-purple-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Semua ({reviewCards.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('correct')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            filterTab === 'correct'
              ? 'bg-emerald-500 text-white shadow-xs'
              : 'text-emerald-700 hover:text-emerald-900'
          }`}
        >
          Benar ({correctCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('wrong')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            filterTab === 'wrong'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-rose-700 hover:text-rose-900'
          }`}
        >
          Salah ({wrongCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('timeout')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            filterTab === 'timeout'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-amber-700 hover:text-amber-900'
          }`}
        >
          Terlewat / Timeout ({timeoutCount})
        </button>
      </div>

      {/* Cards List */}
      <div className="space-y-6">
        {filteredCards.map((card) => {
          const isListening = card.category === 'listening';
          const isReading = card.category === 'reading';

          return (
            <div
              key={card.questionNumber}
              className={`bg-white border rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 ${
                card.isCorrect
                  ? 'border-emerald-200'
                  : card.isTimeout
                  ? 'border-amber-200'
                  : 'border-rose-200'
              }`}
            >
              {/* Question Top Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-900 font-bold text-xs flex items-center justify-center tabular-nums">
                    #{card.questionNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {card.categoryLabel}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500 font-medium">
                    {card.subtype}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tabular-nums text-purple-700">
                    +{card.earnedScore} Poin
                  </span>
                  {card.isCorrect ? (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Benar
                    </span>
                  ) : card.isTimeout ? (
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-xl flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Waktu Habis
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-1">
                      <X className="w-3.5 h-3.5" />
                      Salah
                    </span>
                  )}
                </div>
              </div>

              {/* Reading Passage if Reading */}
              {isReading && card.stimulusText && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed max-h-36 overflow-y-auto">
                  <p className="font-bold text-slate-800 mb-1">Passage Bacaan:</p>
                  <p>{card.stimulusText}</p>
                </div>
              )}

              {/* Listening Transcript Revealed */}
              {isListening && card.audioTranscript && (
                <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-purple-600" />
                      Transkrip Audio Listening (Sekarang Terbuka)
                    </span>
                    <button
                      type="button"
                      onClick={() => speakDialogue(card.audioTranscript!)}
                      className="px-2.5 py-1 bg-purple-600 text-white text-[11px] font-bold rounded-lg hover:bg-purple-700 cursor-pointer"
                    >
                      Putar Suara Percakapan
                    </button>
                  </div>
                  <pre className="text-xs font-sans text-purple-950 whitespace-pre-wrap bg-white/70 p-3 rounded-xl border border-purple-100 leading-relaxed">
                    {card.audioTranscript}
                  </pre>
                </div>
              )}

              {/* Question Prompt */}
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {card.promptText}
              </h3>

              {/* 4 Options with Student's Answer and Correct Key Marked */}
              <div className="space-y-2">
                {card.options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isCorrectAnswer = idx === card.correctAnswerIndex;
                  const isStudentAnswer = card.selectedOptionIndex === idx;

                  let optCardStyle = 'bg-slate-50 border-slate-200 text-slate-700';

                  if (isCorrectAnswer) {
                    optCardStyle = 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold ring-1 ring-emerald-300';
                  } else if (isStudentAnswer && !card.isCorrect) {
                    optCardStyle = 'bg-rose-50 border-rose-300 text-rose-950 font-bold';
                  }

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${optCardStyle}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                          isCorrectAnswer
                            ? 'bg-emerald-500 text-white'
                            : isStudentAnswer
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {letter}
                        </span>
                        <span className="leading-snug">{opt}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isStudentAnswer && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            card.isCorrect ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
                          }`}>
                            Jawaban Kamu
                          </span>
                        )}
                        {isCorrectAnswer && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-800 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Kunci Benar
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dual Language Explanation Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  <span>Pembahasan Mendalam Dwibahasa</span>
                </div>

                <div className="space-y-2">
                  <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs">
                    <span className="font-bold text-slate-900 block mb-1">
                      🇮🇩 Bahasa Indonesia:
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {card.explanationId}
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs">
                    <span className="font-bold text-slate-900 block mb-1">
                      🇬🇧 English:
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {card.explanationEn}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
