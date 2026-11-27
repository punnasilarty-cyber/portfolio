/** a made-up student who grows with the year (0 = ป.1, 11 = ม.6); not a likeness of anyone */
export function Student({ step, stage, color, walking }: { step: number; stage: number; color: string; walking: boolean }) {
  const size = 0.68 + (step / 11) * 0.32;

  return (
    <svg viewBox="0 0 100 150" role="img" aria-label="ตัวละครชายสมมติ ผมหน้าม้าซอย เสื้อนักเรียนแขนสั้น กางเกง ถุงเท้า และรองเท้าสีน้ำตาล" className={`edu-kid ${walking ? "is-walking" : ""}`}>
      <ellipse cx="50" cy="143" rx={26 * size} ry="4" fill="rgba(0,0,0,0.35)" />
      {/* grows from the feet up */}
      <g className="edu-kid-body" style={{ transform: `scale(${size})` }}>
        {[0, 1].map((leg) => (
          <g key={leg} className={`edu-kid-leg edu-kid-leg-${leg}`}>
            <rect x={39 + leg * 13} y="100" width="9" height="38" rx="4" fill="#e8b48c" />
            <path d={leg ? "M50.5 96H65l-1 27H51.5z" : "M35 96h14.5l-1 27H36z"} fill="#a5815a" />
            <path d={`M${42.5 + leg * 13} 100v22`} stroke="#8a6a47" strokeWidth="0.8" />
            {/* ribbed brown sock */}
            <rect x={39 + leg * 13} y="125" width="9" height="13" rx="1" fill="#5e2a17" />
            <path d={`M${41 + leg * 13} 125.5v6m2.5-6v6m2.5-6v6`} stroke="#82442c" strokeWidth="0.7" />
            {/* brown canvas shoe with a rubber toe cap and sole */}
            <g transform={`translate(${43.5 + leg * 13} 0)`}>
              <path d="M-5 135.5q5-2.5 10 0l1 7h-12z" fill="#8c2f12" />
              <path d="M-2.5 136l5 2m-5 0l5-2" stroke="#4f1a0a" strokeWidth="0.9" strokeLinecap="round" />
              <path d="M-5.5 142q0-3.5 5.5-3.5t5.5 3.5z" fill="#c4633f" />
              <rect x="-6.2" y="141.5" width="12.4" height="3.5" rx="1.5" fill="#b85432" />
            </g>
          </g>
        ))}
        {/* top of the shorts, over both legs */}
        <path d="M35 93h30v10l-13 1-2-4-2 4-13-1z" fill="#a5815a" />
        <path d="M50 97v5M40 98l-1 7M60 98l1 7" stroke="#8a6a47" strokeWidth="0.8" />
        {/* bare arms under short sleeves */}
        <path d="M36 70l-6 22M64 70l6 22" stroke="#e8b48c" strokeWidth="6" strokeLinecap="round" />
        {/* pale lavender shirt: sleeves, body, open collar, buttons and chest pocket */}
        <path d="M39 61l-11 18 9 4 5-12zM61 61l11 18-9 4-5-12z" fill="#dcd9f2" stroke="#b9b4dc" strokeWidth="0.6" />
        <path d="M38 61q12-6 24 0l3 33H35z" fill="#dcd9f2" />
        <path d="M45 59l5 12 5-12z" fill="#e8b48c" />
        <path d="M45 58l5 13-9-4zM55 58l-5 13 9-4z" fill="#ebe9fb" stroke="#b9b4dc" strokeWidth="0.6" />
        <path d="M50 71v23" stroke="#b9b4dc" strokeWidth="0.8" />
        <path d="M50 76h.01M50 82h.01M50 88h.01" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <path d="M55 72h8v8q-4 3-8 0z" fill="none" stroke="#b9b4dc" strokeWidth="0.8" />
        {/* the school's badge */}
        <circle cx="41.5" cy="74" r="2.8" fill={color} />
        {/* brown leather belt with a brass buckle */}
        <rect x="35" y="92" width="30" height="5" rx="1" fill="#8a3b1e" />
        <rect x="46.5" y="91.5" width="7" height="6" rx="1" fill="none" stroke="#d4a843" strokeWidth="1.5" />
        <circle cx="29.5" cy="93" r="4.2" fill="#e8b48c" />
        <circle cx="70.5" cy="93" r="4.2" fill="#e8b48c" />
        {/* a laptop joins in with the science and technology years */}
        {stage === 2 && (
          <g>
            <rect x="64" y="86" width="24" height="16" rx="2" fill="#334155" />
            <rect x="66" y="88" width="20" height="11" fill="#7dd3fc" />
          </g>
        )}
        {/* head, with a pointed chin */}
        <rect x="45" y="50" width="10" height="10" fill="#e8b48c" />
        <circle cx="33.5" cy="42" r="3.5" fill="#e8b48c" />
        <circle cx="66.5" cy="42" r="3.5" fill="#e8b48c" />
        <path d="M33 34q1-16 17-16t17 16q0 13-8 18l-9 5-9-5q-8-5-8-18z" fill="#f0c19a" />
        {/* layered, choppy fringe */}
        <path d="M31 45C26 20 36 10 50 10C67 10 75 21 69 45L65 38L63 33L59 36L57 31L52 35L48 30L43 35L41 31L36 37L35 38Z" fill="#1c1917" stroke="#44403c" strokeWidth="0.5" />
        <path d="M40 18Q51 12 62 19" fill="none" stroke="#57534e" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M39 38l8 .3M53 38l8-1" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx="43" cy="42" rx="2.3" ry="1.9" fill="#1c1917" />
        <ellipse cx="57" cy="42" rx="2.3" ry="1.9" fill="#1c1917" />
        <path d="M45 49q6 2 11-2" fill="none" stroke="#9a5b45" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}
