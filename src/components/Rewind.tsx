"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { foundSecret, onFeature } from "@/features";
import { useLang } from "@/i18n";
import { rewindAt, rewindBeats, rewindLasts } from "@/rewind";
import { useSite } from "@/site-store";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SIGN = { hold: "▶", back: "◀◀", forward: "▶▶", home: "●" };

/** the tape runs backward through the school years, stopping at each school, then returns to today */
export function Rewind() {
  const [on, setOn] = useState(false);
  useEffect(() => onFeature("rewind", () => setOn(true)), []);
  return on ? <Tape onDone={() => setOn(false)} /> : null;
}

function Tape({ onDone }: { onDone: () => void }) {
  const { english, t } = useLang();
  const { education } = useSite();
  const dialog = useRef<HTMLDialogElement>(null);
  // the stages that give a year, oldest first
  const stages = useMemo(() => education.map((stage) => ({ ...stage, began: Number(stage.period.match(/\d{4}/)?.[0]) })).filter((stage) => stage.began), [education]);
  const beats = useMemo(() => rewindBeats(stages.map((stage) => stage.began)), [stages]);
  const lasts = rewindLasts(beats);
  // with animation stopped the schools are listed instead of played
  const [calm] = useState(() => !!document.querySelector("#calm:checked"));
  const [time, setTime] = useState(0);
  const now = beats.length ? rewindAt(beats, time) : null;
  const rolling = now?.mode === "back" || now?.mode === "forward";

  useEffect(() => {
    if (!dialog.current!.open) dialog.current!.showModal();
    foundSecret("rewind");
  }, []);

  useEffect(() => {
    if (calm) return;
    let frame = 0;
    let began = 0;
    const tick = (at: number) => {
      began ||= at;
      const elapsed = (at - began) / 1000;
      setTime(elapsed);
      if (elapsed < lasts) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [calm, lasts]);

  // the show closes by itself back in the present
  useEffect(() => {
    if (!calm && time >= lasts && lasts > 0) onDone();
  }, [calm, time, lasts, onDone]);

  const year = (value: number) => (english ? value - 543 : value);
  const card = (stage: (typeof stages)[number]) => (
    <article key={stage.level} style={{ "--school": stage.schoolColors?.[0]?.hex } as CSSProperties}>
      {stage.logo && (
        // eslint-disable-next-line @next/next/no-img-element -- a static export serves images as they are
        <img src={base + stage.logo} alt="" />
      )}
      <p>
        {english ? "School year" : "ปีการศึกษา"} {year(stage.began)}
      </p>
      <h3>{t(stage.level)}</h3>
      <p>{t(stage.school)}</p>
      {stage.program && <p>{t(stage.program)}</p>}
    </article>
  );

  return (
    <dialog ref={dialog} onClose={onDone} aria-label={english ? "Rewind time" : "ย้อนเวลา"} className={rolling ? "rewind is-rolling" : "rewind"}>
      <div className="rewind-room">
        <p lang="en" className="rewind-sign" aria-hidden="true">
          {now && SIGN[now.mode]} {now?.mode === "back" ? "REW" : now?.mode === "forward" ? "FF" : now?.mode === "home" ? "NOW" : "PLAY"}
        </p>
        {calm || !now ? (
          <div className="rewind-list">{[...stages].reverse().map(card)}</div>
        ) : (
          <>
            <b className="rewind-year">{year(now.year)}</b>
            <div className="rewind-card" aria-live="polite">
              {now.stage !== null && card(stages[now.stage])}
            </div>
            <p className="rewind-note">{now.mode === "home" ? (english ? "Back in the present" : "กลับสู่ปัจจุบัน") : ""}</p>
            <i style={{ transform: `scaleX(${Math.min(1, time / lasts)})` }} />
          </>
        )}
        <button autoFocus type="button" onClick={() => dialog.current!.close()} className="solx-btn-ghost px-4 py-1.5 text-xs">
          {english ? "Skip" : "ข้าม"} (Esc)
        </button>
      </div>
    </dialog>
  );
}
