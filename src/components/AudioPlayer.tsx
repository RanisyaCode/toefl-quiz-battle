import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Play, Pause, RotateCcw, VolumeX } from 'lucide-react';
import { speakDialogue } from '../utils/audioGenerator';

interface AudioPlayerProps {
  audioUrl?: string | null;
  audioTranscript?: string; // Hidden during test, but can be passed for browser TTS synthesis if no file audio
  onPlayStart?: () => void;
  autoPrompt?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  audioTranscript,
  onPlayStart
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Reset state on question change
    setIsPlaying(false);
    setProgress(0);
    setHasPlayedOnce(false);
    setIsSynthesizing(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [audioUrl, audioTranscript]);

  const handlePlay = () => {
    if (isPlaying) {
      handlePause();
      return;
    }

    onPlayStart?.();

    if (audioUrl) {
      // Play loaded audio file
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setHasPlayedOnce(true);
          })
          .catch(err => {
            console.warn('Audio play request failed or blocked:', err);
            // Fallback to speech synthesis if audioUrl fails
            fallbackSpeech();
          });
      }
    } else {
      fallbackSpeech();
    }
  };

  const fallbackSpeech = () => {
    if (audioTranscript) {
      setIsSynthesizing(true);
      setIsPlaying(true);
      setHasPlayedOnce(true);
      speakDialogue(audioTranscript, () => {
        setIsPlaying(false);
        setIsSynthesizing(false);
        setProgress(100);
      });
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSynthesizing(false);
  };

  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    setProgress(0);
    handlePlay();
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      const current = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(current);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(100);
  };

  const hasAudioSource = !!audioUrl || !!audioTranscript;

  return (
    <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50/40 border border-purple-200/80 rounded-2xl p-4 shadow-sm">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          preload="auto"
        />
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePlay}
            disabled={!hasAudioSource}
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-md transition-all transform active:scale-95 cursor-pointer ${
              isPlaying
                ? 'bg-rose-500 hover:bg-rose-600 ring-4 ring-rose-200'
                : 'bg-purple-600 hover:bg-purple-700 ring-4 ring-purple-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isPlaying ? 'Jeda Audio' : 'Putar Audio Soal'}
            aria-label={isPlaying ? 'Jeda Audio' : 'Putar Audio Soal'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={handleReplay}
            disabled={!hasAudioSource}
            className="w-10 h-10 rounded-full bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 flex items-center justify-center transition-colors shadow-sm disabled:opacity-40 cursor-pointer"
            title="Putar Ulang dari Awal"
            aria-label="Putar Ulang dari Awal"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-purple-600" />
                Listening Audio Track
              </span>
              {isPlaying && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-200 text-purple-800 animate-pulse">
                  Sedang Diputar
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isPlaying
                ? 'Dengarkan percakapan dengan cermat...'
                : hasPlayedOnce
                ? 'Klik putar ulang bila perlu mendengar kembali.'
                : 'Ketuk Play untuk mendengarkan percakapan dialog.'}
            </p>
          </div>
        </div>

        {/* Small sound equalizer effect animation */}
        {isPlaying && (
          <div className="hidden sm:flex items-end gap-1 h-6">
            <span className="w-1 bg-purple-500 rounded-full animate-bounce h-4" />
            <span className="w-1 bg-pink-500 rounded-full animate-bounce h-6 delay-75" />
            <span className="w-1 bg-purple-600 rounded-full animate-bounce h-3 delay-150" />
            <span className="w-1 bg-amber-500 rounded-full animate-bounce h-5 delay-100" />
          </div>
        )}
      </div>

      {/* Playback progress bar */}
      <div className="mt-3 w-full bg-purple-100/80 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-purple-600 h-full rounded-full transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Hidden Transcript Note during active test */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-purple-700/80 bg-purple-100/50 px-2.5 py-1 rounded-lg">
        <span className="flex items-center gap-1">
          🔒 Transkrip dialog disembunyikan selama ujian resmi
        </span>
        <span className="text-[10px] text-purple-600 font-medium">
          Terbuka di Pembahasan
        </span>
      </div>
    </div>
  );
};
