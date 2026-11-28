/** the site's robot; `up` turns its pointing arm toward the top */
export function RobotArt({ up = false }: { up?: boolean }) {
  return (
    <svg viewBox="0 0 64 72" aria-hidden="true" className={up ? "is-up" : ""}>
      <path d="M32 12V5" stroke="#a1a1aa" strokeWidth="2.5" />
      <circle cx="32" cy="5" r="3.5" className="robot-lamp" />
      <rect x="12" y="12" width="40" height="29" rx="11" fill="#e4e4e7" />
      <rect x="17" y="18" width="30" height="17" rx="7" fill="#111318" />
      <g className="robot-eyes">
        <circle cx="25" cy="26.500" r="3.2" />
        <circle cx="39" cy="26.500" r="3.2" />
      </g>
      <rect x="19" y="44" width="26" height="19" rx="7" fill="#c9cad1" />
      <circle cx="32" cy="53.500" r="3.5" className="robot-lamp" />
      <path d="M45 48q8 1 9 9" fill="none" stroke="#c9cad1" strokeWidth="5" strokeLinecap="round" />
      <g className="robot-arm">
        <path d="M19 48Q9 52 9 63" fill="none" stroke="#c9cad1" strokeWidth="5" strokeLinecap="round" />
        <path d="M4.500 61 9 69l4.500-8z" className="robot-lamp" />
      </g>
      <path d="M25 63v6M39 63v6" stroke="#9a9ca6" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
