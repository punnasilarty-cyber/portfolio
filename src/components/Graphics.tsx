// a small line drawing for a section that has nothing in it yet
const pen = { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function EmptyArt({ section }: { section: string }) {
  return (
    <svg viewBox="0 0 200 120" width="200" height="120" strokeWidth="2" aria-hidden="true" className="empty-art" {...pen}>
      <ellipse cx="100" cy="110" rx="62" ry="5" stroke="none" fill="rgba(255,255,255,0.06)" />
      {section === "certificates" ? (
        <g className="empty-float">
          <rect x="48" y="20" width="104" height="74" rx="6" />
          <rect x="56" y="28" width="88" height="58" rx="3" opacity="0.35" />
          <path d="M72 44h56M80 56h40M80 66h24" opacity="0.7" />
          <g stroke="#f87171">
            <circle cx="132" cy="76" r="13" fill="#1b1013" />
            <path d="M132 69l2.200 4.500 5 .7-3.600 3.500.9 5-4.500-2.400-4.500 2.400.9-5-3.600-3.500 5-.7zM124 87l-4 17 8-5 4 7M140 87l4 17-8-5-4 7" />
          </g>
        </g>
      ) : (
        <g className="empty-float">
          <rect x="52" y="26" width="96" height="76" rx="8" />
          <path d="M52 46h96M74 18v16M126 18v16" />
          <path d="M68 60h8M96 60h8M124 60h8M68 74h8M124 74h8M68 88h8M96 88h8" opacity="0.5" />
          <path d="M100 66l3.500 7.500 8 1-6 5.500 1.600 8-7.100-4-7.100 4 1.600-8-6-5.500 8-1z" stroke="#f87171" />
        </g>
      )}
      <path d="M30 30v10M25 35h10M172 52v8M168 56h8M166 18v6M163 21h6" stroke="#fca5a5" className="empty-spark" />
    </svg>
  );
}
