import React from 'react';

interface CountdownRingProps {
  remainingSeconds: number;
  totalSeconds?: number;
  size?: number;
}

export const CountdownRing: React.FC<CountdownRingProps> = ({
  remainingSeconds,
  totalSeconds = 30,
  size = 72
}) => {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Fraction of time remaining
  const fraction = Math.max(0, Math.min(1, remainingSeconds / totalSeconds));
  const strokeDashoffset = circumference * (1 - fraction);

  // Dynamic color matching theme: lavender -> yellow -> urgent pink/red
  let strokeColor = '#A78BFA'; // Lavender default
  let textColor = 'text-purple-700';

  if (remainingSeconds <= 7) {
    strokeColor = '#F43F5E'; // Urgent rose
    textColor = 'text-rose-600 font-black animate-pulse';
  } else if (remainingSeconds <= 15) {
    strokeColor = '#F59E0B'; // Warning amber
    textColor = 'text-amber-600 font-bold';
  }

  return (
    <div className="relative inline-flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="-rotate-90 transform transition-all duration-300"
        aria-hidden="true"
      >
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F3E8FF"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated countdown circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: 'stroke-dashoffset 0.25s linear, stroke 0.3s ease' }}
        />
      </svg>
      {/* Center numerical display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-xl tabular-nums leading-none tracking-tight ${textColor}`}>
          {Math.ceil(remainingSeconds)}
        </span>
        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-medium -mt-0.5">
          detik
        </span>
      </div>
    </div>
  );
};
