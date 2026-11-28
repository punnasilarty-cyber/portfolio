"use client";

import { useEffect, useRef, useState } from "react";
import { foundSecret, onFeature } from "@/features";
import { useLang } from "@/i18n";

const SECONDS = 5;

/** the whole page holds still for a moment: colours turn inside out, everything that moves stops */
export function TimeStop() {
  const [on, setOn] = useState(false);
  useEffect(() => onFeature("timestop", () => setOn(true)), []);
  return on ? <Frozen onDone={() => setOn(false)} /> : null;
}

function Frozen({ onDone }: { onDone: () => void }) {
  const { english } = useLang();
  const dialog = useRef<HTMLDialogElement>(null);
  const [left, setLeft] = useState(SECONDS);

  useEffect(() => {
    if (!dialog.current!.open) dialog.current!.showModal();
    foundSecret("timestop");
    // only what is moving now is held, and exactly that is let go afterwards
    const held = document.getAnimations().filter((animation) => animation.playState === "running" && !(animation.effect as KeyframeEffect).target?.closest(".stop"));
    held.forEach((animation) => animation.pause());
    return () => held.forEach((animation) => animation.play());
  }, []);

  useEffect(() => {
    if (left <= 0) return onDone();
    const timer = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(timer);
  }, [left, onDone]);

  return (
    <dialog ref={dialog} onClose={onDone} aria-label={english ? "Time stopped" : "หยุดเวลา"} className="stop">
      <div className="stop-veil">
        <p lang="en">TIME STOPPED</p>
        <b aria-live="polite">{left}</b>
        <span>{english ? "Nothing moves until it returns to zero" : "ทุกอย่างหยุดนิ่งจนกว่าจะนับถึงศูนย์"}</span>
        <button autoFocus type="button" onClick={() => dialog.current!.close()} className="solx-btn-ghost px-4 py-1.5 text-xs">
          {english ? "Let time flow" : "ให้เวลาเดินต่อ"} (Esc)
        </button>
      </div>
    </dialog>
  );
}
