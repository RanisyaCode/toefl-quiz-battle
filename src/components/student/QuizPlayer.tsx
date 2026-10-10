import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Clock, Check, X, Volume2, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import { ClientQuestionView, SubmitAnswerResult } from '../../types/quiz';
import { CountdownRing } from '../CountdownRing';
import { AudioPlayer } from '../AudioPlayer';
import { fireCorrectConfetti } from '../ConfettiEffect';

interface QuizPlayerProps {
  roomPin: string;
  token: string;
  participantName: string;
  avatar: string;
  onFinished: () => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  roomPin,
  token,
  participantName,
  avatar,
  onFinished
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<ClientQuestionView | null>(null);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<SubmitAnswerResult | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(30);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tabSwitches, setTabSwitches] = useState<number>(0);
  const [isTimeoutRevealed, setIsTimeoutRevealed] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());
  const hasSubmittedRef = useRef<boolean>(false);

  // Friendly tab blur tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => prev + 1);
        fetch(`/api/rooms/${roomPin}/tab-switch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        }).catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [roomPin, token]);

  // Fetch current authoritative question from server
  const fetchCurrentQuestion = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setFeedback(null);
    setIsLocked(false);
    setSelectedOption(null);
    setIsTimeoutRevealed(false);
    hasSubmittedRef.current = false;

    try {
      const res = await fetch(`/api/rooms/${roomPin}/current-question?token=${encodeURIComponent(token)}`);
      if (!res.ok) throw new Error('Gagal memuat pertanyaan.');

      const data = await res.json();
      if (data.isFinished) {
        onFinished();
        return;
      }

      if (data.question) {
        const q: ClientQuestionView = data.question;
        setCurrentQuestion(q);
        questionStartTimeRef.current = Date.now();

        // Calculate authoritative server time remaining
        const now = Date.now();
        const serverRemaining = Math.max(0, Math.min(30, (q.serverDeadline - now) / 1000));
        setRemainingSeconds(serverRemaining);

        // Resilient reconnect: if student already answered, restore state
        if (data.alreadyAnswered) {
          setIsLocked(true);
          setSelectedOption(data.userAnswer);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setIsLoading(false);
    }
  };

  // Authoritative countdown timer loop
  useEffect(() => {
    if (!currentQuestion || isLocked || feedback) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const left = Math.max(0, (currentQuestion.serverDeadline - now) / 1000);
      setRemainingSeconds(left);

      // Handle server authoritative timeout
      if (left <= 0 && !hasSubmittedRef.current) {
        handleTimeout();
      }
    }, 200);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestion, isLocked, feedback]);

  // Initial load
  useEffect(() => {
    fetchCurrentQuestion();
  }, [roomPin]);

  const handleTimeout = async () => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    setIsLocked(true);
    setIsTimeoutRevealed(true);

    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await fetch(`/api/rooms/${roomPin}/timeout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          questionNumber: currentQuestion?.questionNumber
        })
      });

      const data = await res.json();
      setFeedback({
        isCorrect: false,
        isTimeout: true,
        correctAnswerIndex: data.correctAnswerIndex,
        earnedScore: 0,
        currentTotalScore: data.currentTotalScore,
        responseTimeMs: 30000
      });
      setTotalScore(data.currentTotalScore);

      // 2-second feedback delay before advancing
      setTimeout(() => {
        fetchCurrentQuestion();
      }, 2000);
    } catch {
      fetchCurrentQuestion();
    }
  };

  const handleSelectOption = async (optionIndex: number) => {
    if (isLocked || hasSubmittedRef.current || !currentQuestion) return;

    hasSubmittedRef.current = true;
    setIsLocked(true);
    setSelectedOption(optionIndex);

    if (timerRef.current) clearInterval(timerRef.current);

    const responseTimeMs = Math.max(500, Date.now() - questionStartTimeRef.current);

    try {
      const res = await fetch(`/api/rooms/${roomPin}/submit-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          selectedOptionIndex: optionIndex,
          questionNumber: currentQuestion.questionNumber,
          responseTimeMs
        })
      });

      const data = await res.json();
      setFeedback(data);
      setTotalScore(data.currentTotalScore);

      if (data.isCorrect) {
        fireCorrectConfetti();
      }

      // Automatically advance to next question after 2-second feedback window
      // Note: Feedback time does NOT reduce next question's 30s timer
      setTimeout(() => {
        fetchCurrentQuestion();
      }, 2000);
    } catch (err: any) {
      setErrorMsg('Gagal mengirimkan jawaban. Memuat ulang...');
      setTimeout(() => fetchCurrentQuestion(), 1500);
    }
  };

  if (isLoading && !currentQuestion) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">
          Memuat pertanyaan berikutnya dari server...
        </p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-slate-800">{errorMsg}</p>
        <button
          type="button"
          onClick={fetchCurrentQuestion}
          className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const isListening = currentQuestion.category === 'listening';
  const isReading = currentQuestion.category === 'reading';

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6 space-y-4">
      {/* Top Header Bar: Progress, Category, Score & Authoritative Countdown Ring */}
      <div className="bg-white border border-purple-200/80 rounded-3xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-100 flex items-center justify-center text-2xl shrink-0">
            {avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-900">
                Soal {currentQuestion.questionNumber} / {currentQuestion.totalQuestions}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-[11px] font-bold text-purple-600">
                {currentQuestion.categoryLabel}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>{participantName}</span>
              <span>·</span>
              <span className="font-extrabold text-purple-700 tabular-nums">
                {totalScore} pts
              </span>
              {tabSwitches > 0 && (
                <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded font-medium">
                  {tabSwitches}× blur
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Server Authoritative 30-Second Countdown Ring */}
        <div className="shrink-0">
          <CountdownRing
            remainingSeconds={remainingSeconds}
            totalSeconds={30}
            size={68}
          />
        </div>
      </div>

      {/* Reading Stimulus Passage Box */}
      {isReading && currentQuestion.stimulusText && (
        <div className="bg-white border border-purple-100 rounded-3xl p-4 sm:p-5 shadow-xs max-h-48 sm:max-h-56 overflow-y-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 mb-2">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span>Bacaan TOEFL (Reading Passage)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-serif">
            {currentQuestion.stimulusText}
          </p>
        </div>
      )}

      {/* Listening Audio Track Player (Hidden Transcript) */}
      {isListening && (
        <AudioPlayer
          audioUrl={currentQuestion.audioUrl}
          audioTranscript={undefined} // Hidden during active quiz!
        />
      )}

      {/* Question Prompt Card */}
      <div className="bg-white border border-purple-200/80 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
          <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-lg text-[10px]">
            {currentQuestion.subtype}
          </span>
        </div>

        <h2 className="text-base sm:text-lg font-display font-extrabold text-slate-900 leading-snug">
          {currentQuestion.promptText}
        </h2>
      </div>

      {/* 4 Options Grid (A, B, C, D) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentQuestion.options.map((optionText, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isSelected = selectedOption === idx;

          let btnClass = 'bg-white border-purple-200/90 text-slate-800 hover:bg-purple-50/70 hover:border-purple-300';
          let badgeClass = 'bg-purple-100 text-purple-800';

          if (feedback) {
            const isCorrect = idx === feedback.correctAnswerIndex;
            if (isCorrect) {
              btnClass = 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-300';
              badgeClass = 'bg-emerald-500 text-white';
            } else if (isSelected && !feedback.isCorrect) {
              btnClass = 'bg-rose-50 border-rose-300 text-rose-950 ring-2 ring-rose-200';
              badgeClass = 'bg-rose-500 text-white';
            } else {
              btnClass = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
              badgeClass = 'bg-slate-200 text-slate-500';
            }
          } else if (isSelected) {
            btnClass = 'bg-purple-100 border-purple-400 text-purple-950 ring-2 ring-purple-300';
            badgeClass = 'bg-purple-600 text-white';
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={isLocked}
              onClick={() => handleSelectOption(idx)}
              className={`min-h-[56px] p-3.5 sm:p-4 rounded-2xl border text-left flex items-center gap-3 transition-all transform active:scale-98 shadow-xs cursor-pointer disabled:cursor-default ${btnClass}`}
            >
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${badgeClass}`}>
                {letter}
              </span>
              <span className="text-xs sm:text-sm font-semibold leading-snug flex-1">
                {optionText}
              </span>
              {feedback && idx === feedback.correctAnswerIndex && (
                <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              {feedback && isSelected && !feedback.isCorrect && (
                <X className="w-5 h-5 text-rose-500 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Instant 2-Second Server Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-3xl border shadow-md flex items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-200 ${
            feedback.isCorrect
              ? 'bg-emerald-500 text-white border-emerald-400'
              : feedback.isTimeout
              ? 'bg-amber-500 text-white border-amber-400'
              : 'bg-rose-500 text-white border-rose-400'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shrink-0">
              {feedback.isCorrect ? '🌟' : feedback.isTimeout ? '⏱️' : '💡'}
            </div>
            <div>
              <p className="font-extrabold text-sm">
                {feedback.isCorrect
                  ? 'Jawaban Tepat!'
                  : feedback.isTimeout
                  ? 'Waktu Habis!'
                  : 'Kurang Tepat!'}
              </p>
              <p className="text-xs text-white/90">
                {feedback.isCorrect
                  ? `+${feedback.earnedScore} Poin (Termasuk bonus kecepatan)`
                  : `Kunci Benar: Pilihan ${String.fromCharCode(65 + feedback.correctAnswerIndex)}`}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-white/80 block">
              Memuat Soal...
            </span>
            <span className="text-xs font-black tabular-nums">2 detik</span>
          </div>
        </div>
      )}
    </div>
  );
};
