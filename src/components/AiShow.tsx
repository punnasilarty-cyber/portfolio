"use client";

import { useEffect, useRef, useState } from "react";
import { AI_STAGES } from "@/components/AiStages";
import { RobotArt } from "@/components/RobotArt";
import { AI_LASTS, AI_SCENES, sceneAt, sceneStart } from "@/aishow";
import { onFeature, slideAfter } from "@/features";
import { useLang } from "@/i18n";

/** a full-screen show of what AI can do, acted out by the robot */
export function AiShow() {
  const [on, setOn] = useState(false);
  useEffect(() => onFeature("ai", () => setOn(true)), []);
  return on ? <Show onDone={() => setOn(false)} /> : null;
}

function Show({ onDone }: { onDone: () => void }) {
  const { english } = useLang();
  const language = english ? "en" : "th";
  const dialog = useRef<HTMLDialogElement>(null);
  // with animation stopped nothing runs by itself: each scene is shown finished, and the reader steps through
  const [calm] = useState(() => !!document.querySelector("#calm:checked"));
  const [t, setT] = useState(calm ? AI_SCENES[0].seconds : 0);
  const [paused, setPaused] = useState(false);
  const { at, local } = sceneAt(calm ? t - 0.001 : t);
  const scene = AI_SCENES[at];
  const over = t >= AI_LASTS;
  const Stage = AI_STAGES[scene.id];

  useEffect(() => {
    if (!dialog.current!.open) dialog.current!.showModal();
  }, []);

  useEffect(() => {
    dialog.current!.scrollTop = 0;
  }, [scene.id]);

  useEffect(() => {
    if (calm || paused || over) return;
    let frame = 0;
    let before = 0;
    const tick = (now: number) => {
      // about thirty drawings a second is plenty here
      if (!before) before = now;
      else if (now - before >= 30) {
        const step = Math.min(0.1, (now - before) / 1000);
        before = now;
        setT((time) => Math.min(AI_LASTS, time + step));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [calm, paused, over]);

  const go = (to: number) => setT(calm ? sceneStart(to + 1) : sceneStart(to));
  const step = (by: number) => go(slideAfter(at, by, AI_SCENES.length));

  return (
    <dialog
      ref={dialog}
      onClose={onDone}
      aria-label={english ? "What AI can do" : "AI ทำอะไรได้"}
      className={scene.dark ? "ai is-dark" : "ai"}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") step(1);
        if (event.key === "ArrowLeft") step(-1);
      }}
    >
      <div className="ai-room">
        <ol className="ai-bar">
          {AI_SCENES.map((each, i) => (
            <li key={each.id} className={each.dark ? "is-dark" : undefined}>
              <button type="button" onClick={() => go(i)} aria-label={`${i + 1}. ${each.title[language]}`} aria-current={i === at ? "step" : undefined}>
                <i style={{ transform: `scaleX(${i < at ? 1 : i > at ? 0 : Math.min(1, local / each.seconds)})` }} />
              </button>
            </li>
          ))}
        </ol>
        <h2 aria-live="polite">{scene.title[language]}</h2>
        <div className="ai-floor">
          <div className="ai-robot" aria-hidden="true">
            <RobotArt />
          </div>
          {/* a new scene starts from a clean stage */}
          <div key={scene.id} className="ai-stage">
            <Stage t={local} english={english} />
          </div>
        </div>
        <p className="ai-caption">{scene.caption[language]}</p>
        {scene.more && (
          // each part arrives in turn, so there is time to read the one before
          <div key={`more-${scene.id}`} className="ai-more">
            <section>
              <h3>{scene.dark ? (english ? "How it could happen" : "เกิดขึ้นได้อย่างไร") : english ? "How it works" : "ทำงานอย่างไร"}</h3>
              <ol>
                {scene.more.how.map((line, i) => (
                  <li key={line.en} className={local >= 1 + i * 2.5 ? "ai-part is-in" : "ai-part"}>
                    {line[language]}
                  </li>
                ))}
              </ol>
            </section>
            <section className={local >= 8.5 ? "ai-part is-in" : "ai-part"}>
              <h3>{scene.dark ? (english ? "What it harms" : "ผลกระทบ") : english ? "Used for" : "ใช้จริงในงานแบบไหน"}</h3>
              <p>{scene.more.uses[language]}</p>
            </section>
            <section className={local >= 10.5 ? "ai-part is-in" : "ai-part"}>
              <h3>{scene.dark ? (english ? "How to guard against it" : "รับมืออย่างไร") : english ? "Where it fails" : "ข้อจำกัด"}</h3>
              <p>{scene.more.limit[language]}</p>
            </section>
          </div>
        )}
        <div className="ai-controls">
          <button type="button" onClick={() => step(-1)} disabled={at === 0} aria-label={english ? "Previous" : "ก่อนหน้า"}>
            ‹
          </button>
          {!calm && (
            <button
              type="button"
              onClick={() => {
                if (over) {
                  setT(0);
                  setPaused(false);
                } else setPaused(!paused);
              }}
            >
              {over ? (english ? "Again" : "ดูอีกรอบ") : paused ? (english ? "Play" : "เล่นต่อ") : english ? "Pause" : "หยุด"}
            </button>
          )}
          <button type="button" onClick={() => step(1)} disabled={at === AI_SCENES.length - 1} aria-label={english ? "Next" : "ถัดไป"}>
            ›
          </button>
          <button autoFocus type="button" onClick={() => dialog.current!.close()}>
            {english ? "Close" : "ปิด"} (Esc)
          </button>
        </div>
        <small>{english ? "Drawn for this page: no real AI is called, and the future scenes are imagined" : "ภาพจำลองที่วาดขึ้นสำหรับหน้านี้ ไม่ได้เรียก AI จริง ฉากอนาคตเป็นเรื่องสมมติ"}</small>
      </div>
    </dialog>
  );
}
