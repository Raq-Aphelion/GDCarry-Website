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
          <stop offset="0%" style={{ stopColor: 'rgb(var(--cyan-300))' }} />
          <stop offset="55%" style={{ stopColor: 'rgb(var(--cyan-500))' }} />
          <stop offset="100%" style={{ stopColor: 'rgb(var(--cyan-700))' }} />
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
          stroke="rgb(var(--cyan-700))"
          strokeWidth="1.5"
        />
        {[ [15,18], [29,18], [22,25], [15,32], [29,32] ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.6" style={{ fill: 'rgb(var(--navy-850))' }} />
        ))}
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
          stroke="rgb(var(--cyan-700))"
          strokeWidth="1.5"
        />
        {[ [35,35], [42,42], [49,49] ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.6" style={{ fill: 'rgb(var(--navy-850))' }} />
        ))}
      </g>
    </svg>
  );
}
