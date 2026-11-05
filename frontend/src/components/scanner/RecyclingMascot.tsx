import { motion } from 'framer-motion';

/**
 * RecyclingMascot – Pixar-style cute green recycling dustbin character.
 * Pure CSS + Framer Motion animation. No external assets required.
 * Styled with claymation / 3D render aesthetic using CSS gradients and shadows.
 */
export default function RecyclingMascot({ size = 120 }: { size?: number }) {
  const s = size;
  const lid = s * 0.42;
  const body = s * 0.58;

  return (
    <motion.div
      className="relative select-none"
      style={{ width: s, height: s }}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Glow halo */}
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(34,197,94,0.6) 0%, transparent 70%)',
          transform: 'translateY(10%)',
        }}
      />

      <svg
        width={s}
        height={s}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Body gradient – glossy green plastic */}
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="45%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>

          {/* Lid gradient */}
          <linearGradient id="lidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>

          {/* Inner shadow overlay */}
          <radialGradient id="sheen" cx="30%" cy="25%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.35" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>

          {/* Ground shadow */}
          <radialGradient id="shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.3)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>

          <filter id="softBlur">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>

        {/* Ground shadow ellipse */}
        <ellipse cx="60" cy="115" rx="28" ry="5" fill="url(#shadow)" filter="url(#softBlur)" />

        {/* ── BODY ── */}
        {/* Main bin body — rounded trapezoid */}
        <path
          d="M32 60 Q30 108 36 112 Q60 118 84 112 Q90 108 88 60 Z"
          fill="url(#bodyGrad)"
        />
        {/* Body sheen */}
        <path
          d="M32 60 Q30 108 36 112 Q60 118 84 112 Q90 108 88 60 Z"
          fill="url(#sheen)"
        />
        {/* Body outline */}
        <path
          d="M32 60 Q30 108 36 112 Q60 118 84 112 Q90 108 88 60 Z"
          stroke="#166534"
          strokeWidth="1.5"
          fill="none"
        />

        {/* ── RECYCLING SYMBOL on body ── */}
        <g transform="translate(60,88) scale(0.28)">
          {/* Simplified ♻ arrows */}
          <path
            d="M0,-30 L8,-14 L-8,-14 Z"
            fill="white"
            fillOpacity="0.8"
            transform="rotate(0)"
          />
          <path
            d="M0,-30 L8,-14 L-8,-14 Z"
            fill="white"
            fillOpacity="0.8"
            transform="rotate(120)"
          />
          <path
            d="M0,-30 L8,-14 L-8,-14 Z"
            fill="white"
            fillOpacity="0.8"
            transform="rotate(240)"
          />
          <circle cx="0" cy="0" r="10" fill="white" fillOpacity="0.15" />
          <text
            x="0"
            y="5"
            textAnchor="middle"
            fontSize="28"
            fill="white"
            fillOpacity="0.75"
            fontWeight="bold"
          >
            ♻
          </text>
        </g>

        {/* ── EYES ── happy cartoon eyes */}
        {/* Left eye white */}
        <ellipse cx="47" cy="78" rx="6.5" ry="7" fill="white" />
        {/* Left pupil */}
        <motion.ellipse
          cx="48" cy="79" rx="3.5" ry="4"
          fill="#166534"
          animate={{ scaleY: [1, 0.15, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 1.5 }}
        />
        {/* Left eye shine */}
        <ellipse cx="50" cy="76.5" rx="1.5" ry="1.5" fill="white" />

        {/* Right eye white */}
        <ellipse cx="73" cy="78" rx="6.5" ry="7" fill="white" />
        {/* Right pupil */}
        <motion.ellipse
          cx="74" cy="79" rx="3.5" ry="4"
          fill="#166534"
          animate={{ scaleY: [1, 0.15, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 1.5 }}
        />
        {/* Right eye shine */}
        <ellipse cx="76" cy="76.5" rx="1.5" ry="1.5" fill="white" />

        {/* ── SMILE ── */}
        <path
          d="M50 95 Q60 103 70 95"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* ── CHEEK BLUSH ── */}
        <ellipse cx="41" cy="90" rx="5" ry="3" fill="#f9a8d4" fillOpacity="0.45" />
        <ellipse cx="79" cy="90" rx="5" ry="3" fill="#f9a8d4" fillOpacity="0.45" />

        {/* ── LID ── hinged open slightly */}
        <motion.g
          style={{ transformOrigin: '60px 58px' }}
          animate={{ rotate: [-4, 8, -4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Lid body */}
          <path
            d="M28 58 Q28 50 60 48 Q92 50 92 58 Q92 64 60 66 Q28 64 28 58 Z"
            fill="url(#lidGrad)"
          />
          <path
            d="M28 58 Q28 50 60 48 Q92 50 92 48 Q92 56 60 58 Q28 56 28 56 Z"
            fill="url(#sheen)"
          />
          <path
            d="M28 58 Q28 50 60 48 Q92 50 92 58 Q92 64 60 66 Q28 64 28 58 Z"
            stroke="#166534"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Lid handle */}
          <rect x="53" y="42" width="14" height="8" rx="4" fill="#4ade80" stroke="#15803d" strokeWidth="1" />
          <rect x="56" y="40" width="8" height="5" rx="2.5" fill="#86efac" stroke="#15803d" strokeWidth="1" />
        </motion.g>

        {/* ── ARMS / TINY HANDS ── waving */}
        {/* Left arm */}
        <motion.g
          animate={{ rotate: [0, -15, 0] }}
          style={{ transformOrigin: '30px 70px' }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path d="M32 70 Q18 65 14 55" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" fill="none" />
          {/* Left hand */}
          <circle cx="12" cy="52" r="5" fill="#4ade80" stroke="#15803d" strokeWidth="1.2" />
        </motion.g>

        {/* Right arm */}
        <motion.g
          animate={{ rotate: [0, 15, 0] }}
          style={{ transformOrigin: '90px 70px' }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        >
          <path d="M88 70 Q102 65 106 55" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" fill="none" />
          {/* Right hand */}
          <circle cx="108" cy="52" r="5" fill="#4ade80" stroke="#15803d" strokeWidth="1.2" />
        </motion.g>

        {/* ── LEGS / FEET ── */}
        {/* Left foot */}
        <ellipse cx="47" cy="113" rx="9" ry="5" fill="#16a34a" stroke="#15803d" strokeWidth="1" />
        {/* Right foot */}
        <ellipse cx="73" cy="113" rx="9" ry="5" fill="#16a34a" stroke="#15803d" strokeWidth="1" />
      </svg>
    </motion.div>
  );
}
