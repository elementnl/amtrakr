interface LogoProps {
  variant?: 'mark' | 'full'
  markSize?: number
  color?: string
  accentColor?: string
  className?: string
}

export function Logo({
  variant = 'full',
  markSize = 52,
  color = 'oklch(14% 0.008 72)',
  accentColor = 'oklch(54% 0.13 20)',
  className = '',
}: LogoProps) {
  const h = markSize
  const w = Math.round(markSize * 1.12)

  return (
    <div
      className={`flex flex-col items-center ${className}`}
      style={{ gap: Math.round(markSize * 0.22) }}
      role="img"
      aria-label="Amtrakr"
    >
      <svg
        width={w}
        height={h}
        viewBox="0 0 112 100"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M18 92C28.5 66 39 48 49 34"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M94 92C83.5 66 73 48 63 34"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M31 74H81"
          stroke={color}
          strokeWidth="5.5"
          strokeLinecap="round"
          opacity="0.22"
        />
        <path
          d="M39.5 55H72.5"
          stroke={color}
          strokeWidth="4.5"
          strokeLinecap="round"
          opacity="0.18"
        />
        <path
          d="M47 39H65"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.15"
        />
        <path
          d="M56 8C47.7 8 41.25 14.35 41.25 22.4C41.25 32.9 56 48 56 48C56 48 70.75 32.9 70.75 22.4C70.75 14.35 64.3 8 56 8Z"
          fill={accentColor}
        />
        <circle cx="56" cy="22.5" r="5.75" fill="oklch(97.5% 0.007 72)" />
        <path
          d="M45.25 36.25C49.5 42.65 56 49.25 56 49.25C56 49.25 62.5 42.65 66.75 36.25"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.12"
        />
      </svg>

      {variant === 'full' && (
        <span
          aria-hidden="true"
          style={{
            fontFamily: '"Fraunces", "Cormorant Garamond", Georgia, serif',
            fontSize: Math.round(markSize * 0.46),
            fontWeight: 700,
            letterSpacing: 0,
            color,
            lineHeight: 1,
          }}
        >
          Amtrak<span style={{ color: accentColor }}>r</span>
        </span>
      )}
    </div>
  )
}
