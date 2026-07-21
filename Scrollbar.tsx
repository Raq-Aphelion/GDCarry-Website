import { useId } from 'react';

/** The GD Carry mark: two golden dice (Grand Dice). */
export default function DiceLogo({ size = 40, className = '' }: { size?: number; className?: string }) {
  const gid = useId();
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="GD Carry — two golden dice"
    >
      <defs>
        <linearGradient id={`${gid}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe08a" />
          <stop offset="55%" stopColor="#eeb232" />
          <stop offset="100%" stopColor="#b97e10" />
        </linearGradient>
      </defs>
      {/* Back die — face of five */}
      <g transform="rotate(-14 22 25)">
        <rect
          x="8"
          y="11"
          width="28"
          height="28"
          rx="7"
          fill={`url(#${gid}-gold)`}
          stroke="#7c5a0c"
          strokeWidth="1.5"
        />
        <circle cx="15" cy="18" r="2.6" fill="#0a1228" />
        <circle cx="29" cy="18" r="2.6" fill="#0a1228" />
        <circle cx="22" cy="25" r="2.6" fill="#0a1228" />
        <circle cx="15" cy="32" r="2.6" fill="#0a1228" />
        <circle cx="29" cy="32" r="2.6" fill="#0a1228" />
      </g>
      {/* Front die — face of three */}
      <g transform="rotate(12 42 42)">
        <rect
          x="28"
          y="28"
          width="28"
          height="28"
          rx="7"
          fill={`url(#${gid}-gold)`}
          stroke="#7c5a0c"
          strokeWidth="1.5"
        />
        <circle cx="35" cy="35" r="2.6" fill="#0a1228" />
        <circle cx="42" cy="42" r="2.6" fill="#0a1228" />
        <circle cx="49" cy="49" r="2.6" fill="#0a1228" />
      </g>
    </svg>
  );
}
