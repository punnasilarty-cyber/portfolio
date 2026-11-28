"use client";

import { useState, type CSSProperties } from "react";

/** the cover opening out like a three-panel leaflet, over the window it belongs to */
export function Unfold({ src, onDone }: { src: string; onDone: () => void }) {
  const [shape, setShape] = useState(0); // width over height, known once the picture has loaded
  return (
    // a press skips it
    <div aria-hidden="true" className="fold" onClick={onDone} onAnimationEnd={(event) => event.target === event.currentTarget && onDone()}>
      {/* eslint-disable-next-line @next/next/no-img-element -- only read for its size */}
      <img src={src} alt="" hidden onLoad={(event) => setShape(event.currentTarget.naturalWidth / event.currentTarget.naturalHeight)} onError={onDone} />
      {shape > 0 && (
        <div className="fold-sheet" style={{ "--shape": shape, "--cover": `url("${src}")` } as CSSProperties}>
          {["left", "middle", "right"].map((side) => (
            <i key={side} className={`fold-${side}`}>
              <b />
              <b />
            </i>
          ))}
        </div>
      )}
    </div>
  );
}
