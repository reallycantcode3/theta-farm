// Tomo the Theta Farmer — a cheerful green sprout in a straw hat
// harvesting dollar-shaped wheat. Pure inline SVG, no assets.
export default function Mascot({ size = 220 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Tomo, the Theta Farm mascot"
      className="drop-shadow-[0_0_30px_rgba(16,185,129,0.25)]"
    >
      <defs>
        <radialGradient id="bgGlow" cx="50%" cy="55%" r="60%">
          <stop offset="0%" stopColor="#064e3b" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#0a0a0b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bodyGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="hatGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>

      <circle cx="120" cy="125" r="110" fill="url(#bgGlow)" />

      {/* sun rays / theta halo */}
      <g stroke="#10b981" strokeWidth="1.5" opacity="0.4">
        <line x1="120" y1="14" x2="120" y2="30" />
        <line x1="50" y1="40" x2="62" y2="52" />
        <line x1="190" y1="40" x2="178" y2="52" />
        <line x1="20" y1="120" x2="36" y2="120" />
        <line x1="220" y1="120" x2="204" y2="120" />
      </g>

      {/* dollar wheat stalks behind */}
      <g opacity="0.85">
        <line x1="58" y1="200" x2="48" y2="120" stroke="#065f46" strokeWidth="3" strokeLinecap="round" />
        <text x="38" y="118" fontSize="22" fontWeight="bold" fill="#10b981" fontFamily="serif">$</text>
        <line x1="200" y1="200" x2="206" y2="115" stroke="#065f46" strokeWidth="3" strokeLinecap="round" />
        <text x="198" y="112" fontSize="22" fontWeight="bold" fill="#10b981" fontFamily="serif">$</text>
        <line x1="180" y1="205" x2="188" y2="135" stroke="#065f46" strokeWidth="2.5" strokeLinecap="round" />
        <text x="180" y="132" fontSize="16" fontWeight="bold" fill="#34d399" fontFamily="serif">$</text>
      </g>

      {/* body */}
      <ellipse cx="120" cy="175" rx="52" ry="42" fill="url(#bodyGrad)" />

      {/* belly theta symbol */}
      <ellipse cx="120" cy="180" rx="22" ry="14" fill="none" stroke="#022c22" strokeWidth="2.5" />
      <line x1="100" y1="180" x2="140" y2="180" stroke="#022c22" strokeWidth="2.5" strokeLinecap="round" />

      {/* arms */}
      <path d="M75 165 Q55 155 60 135" fill="none" stroke="#059669" strokeWidth="10" strokeLinecap="round" />
      <path d="M165 165 Q188 158 188 130" fill="none" stroke="#059669" strokeWidth="10" strokeLinecap="round" />
      {/* sickle in right hand */}
      <path d="M188 128 Q210 120 215 100" fill="none" stroke="#e5e7eb" strokeWidth="4" strokeLinecap="round" />
      <line x1="188" y1="128" x2="186" y2="138" stroke="#92400e" strokeWidth="5" strokeLinecap="round" />

      {/* head */}
      <circle cx="120" cy="115" r="42" fill="url(#bodyGrad)" />

      {/* cheeks */}
      <circle cx="98" cy="123" r="6" fill="#f87171" opacity="0.55" />
      <circle cx="142" cy="123" r="6" fill="#f87171" opacity="0.55" />

      {/* eyes */}
      <circle cx="106" cy="112" r="5" fill="#022c22" />
      <circle cx="134" cy="112" r="5" fill="#022c22" />
      <circle cx="107.5" cy="110.5" r="1.6" fill="#fff" />
      <circle cx="135.5" cy="110.5" r="1.6" fill="#fff" />

      {/* smile */}
      <path d="M108 130 Q120 140 132 130" fill="none" stroke="#022c22" strokeWidth="2.5" strokeLinecap="round" />

      {/* straw hat */}
      <ellipse cx="120" cy="80" rx="62" ry="10" fill="url(#hatGrad)" />
      <path d="M92 80 Q120 40 148 80 Z" fill="url(#hatGrad)" />
      <path d="M92 80 Q120 60 148 80" fill="none" stroke="#92400e" strokeWidth="2" />
      <rect x="100" y="74" width="40" height="5" fill="#065f46" rx="1" />

      {/* tiny leaf on top of hat */}
      <path d="M120 38 Q115 28 122 22 Q126 30 120 38 Z" fill="#10b981" />
    </svg>
  );
}
