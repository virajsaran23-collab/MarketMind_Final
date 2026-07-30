'use client'

/**
 * AI Finance Buddy "Prof. Algo" — animated SVG portrait.
 * A friendly turquoise‑blue robot mentor inspired by Pokémon professor aesthetics.
 */
export function AIBuddyPortrait({ size = 120, speaking = false }: { size?: number; speaking?: boolean }) {
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 rounded-full bg-[#00B4D8]/20 blur-2xl animate-pulse" />

      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-lg"
        style={{ width: size, height: size }}
      >
        {/* Body / Torso — White coat with turquoise lines */}
        <rect x="28" y="72" width="64" height="42" rx="14" fill="#f8fafc" stroke="#00B4D8" strokeWidth="2" />
        <rect x="36" y="80" width="48" height="3" rx="1.5" fill="#00B4D8" opacity="0.35" />
        <rect x="40" y="87" width="40" height="2" rx="1" fill="#00B4D8" opacity="0.2" />
        {/* Coat lapels */}
        <path d="M52 72 L60 82 L68 72" stroke="#00B4D8" strokeWidth="1.5" fill="none" opacity="0.5" />

        {/* Head — metallic silver rounded */}
        <ellipse cx="60" cy="44" rx="28" ry="30" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
        {/* Head inner shine */}
        <ellipse cx="54" cy="34" rx="14" ry="10" fill="white" opacity="0.35" />

        {/* Visor / Forehead band */}
        <rect x="34" y="30" width="52" height="8" rx="4" fill="#00B4D8" opacity="0.9" />
        {/* Visor center light */}
        <rect x="56" y="32" width="10" height="4" rx="2" fill="white" opacity="0.6" />

        {/* Eyes — glowing cyan LEDs */}
        <g>
          <ellipse cx="47" cy="44" rx="6" ry="6.5" fill="#0f172a" />
          <ellipse cx="47" cy="43" rx="4" ry="4.5" fill="#00B4D8">
            {speaking && <animate attributeName="ry" values="4.5;2;4.5" dur="0.3s" repeatCount="indefinite" />}
          </ellipse>
          <ellipse cx="45.5" cy="42" rx="1.5" ry="1.5" fill="white" opacity="0.8" />
        </g>
        <g>
          <ellipse cx="73" cy="44" rx="6" ry="6.5" fill="#0f172a" />
          <ellipse cx="73" cy="43" rx="4" ry="4.5" fill="#00B4D8">
            {speaking && <animate attributeName="ry" values="4.5;2;4.5" dur="0.3s" repeatCount="indefinite" />}
          </ellipse>
          <ellipse cx="71.5" cy="42" rx="1.5" ry="1.5" fill="white" opacity="0.8" />
        </g>

        {/* Mouth — friendly curve, animates when speaking */}
        <path
          d="M50 56 Q60 63 70 56"
          stroke="#00B4D8"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        >
          {speaking && (
            <animate
              attributeName="d"
              values="M50 56 Q60 63 70 56;M50 58 Q60 55 70 58;M50 56 Q60 63 70 56"
              dur="0.5s"
              repeatCount="indefinite"
            />
          )}
        </path>

        {/* Antenna */}
        <line x1="60" y1="14" x2="60" y2="6" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        <circle cx="60" cy="5" r="3" fill="#00B4D8">
          <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Ears — small turquoise discs */}
        <circle cx="30" cy="44" r="5" fill="#00B4D8" opacity="0.7" />
        <circle cx="90" cy="44" r="5" fill="#00B4D8" opacity="0.7" />

        {/* Holographic chart — floating mini chart near right shoulder */}
        <g transform="translate(82, 62)" opacity="0.8">
          <rect x="0" y="0" width="24" height="16" rx="3" fill="#00B4D8" opacity="0.15" stroke="#00B4D8" strokeWidth="0.7" />
          <polyline
            points="3,12 7,8 11,10 15,4 19,6 22,3"
            fill="none"
            stroke="#00B4D8"
            strokeWidth="1.2"
            strokeLinecap="round"
          >
            <animate
              attributeName="points"
              values="3,12 7,8 11,10 15,4 19,6 22,3;3,10 7,12 11,6 15,8 19,4 22,7;3,12 7,8 11,10 15,4 19,6 22,3"
              dur="3s"
              repeatCount="indefinite"
            />
          </polyline>
        </g>
      </svg>
    </div>
  )
}
