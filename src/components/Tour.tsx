"use client";

import { useEffect, useRef, useState } from "react";
import { RobotArt } from "@/components/RobotArt";
import { TOUR } from "@/assist";
import { onFeature } from "@/features";
import { useLang } from "@/i18n";

/** the robot walks the visitor through the page, stop by stop, about a minute in all */
export function Tour() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    // the other helpers use the same place at the foot of the screen
    const stops = [onFeature("tour", () => setOn(true)), onFeature("read", () => setOn(false)), onFeature("voice", () => setOn(false))];
    return () => stops.forEach((stop) => stop());
  }, []);
  return on ? <Guide onDone={() => setOn(false)} /> : null;
}

function Guide({ onDone }: { onDone: () => void }) {
  const { english } = useLang();
  const say = (th: string, en: string) => (english ? en : th);
  const [at, setAt] = useState(0);
  const [paused, setPaused] = useState(false);
  // how much of this stop is left when paused
  const left = useRef(TOUR[0].seconds * 1000);
  const stop = TOUR[at];

  const go = (to: number) => {
    if (to >= TOUR.length) return onDone();
    const next = Math.max(0, to);
    left.current = TOUR[next].seconds * 1000;
    setAt(next);
  };

  useEffect(() => {
    const place = document.querySelector<HTMLElement>(TOUR[at].find);
    if (!place) return;
    const calm = !!document.querySelector<HTMLInputElement>("#calm")?.checked;
    // tall parts are shown from their top, small ones in the middle
    const tall = place.getBoundingClientRect().height > innerHeight * 0.7;
    place.scrollIntoView({ behavior: calm ? "instant" : "smooth", block: tall ? "start" : "center" });
    place.classList.add("is-toured");
    return () => place.classList.remove("is-toured");
  }, [at]);

  useEffect(() => {
    if (paused) return;
    const began = performance.now();
    const wait = left.current;
    const timer = setTimeout(() => go(at + 1), wait);
    return () => {
      clearTimeout(timer);
      left.current = Math.max(500, wait - (performance.now() - began));
    };
  });

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (document.querySelector("dialog[open]")) return;
      if (event.key === "Escape") onDone();
      if (event.key === "ArrowRight") go(at + 1);
      if (event.key === "ArrowLeft") go(at - 1);
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  });

  return (
    <aside className="helper" aria-label={say("ทัวร์พาชม", "Guided tour")}>
      <div className="helper-robot" aria-hidden="true">
        <RobotArt up={false} />
      </div>
      <p role="status">{stop[english ? "en" : "th"]}</p>
      <span key={`${at} ${paused}`} className={paused ? "helper-bar is-paused" : "helper-bar"} style={{ animationDuration: `${stop.seconds}s` }} aria-hidden="true" />
      <div>
        <small>
          {at + 1} / {TOUR.length}
        </small>
        <button type="button" onClick={() => go(at - 1)} disabled={at === 0}>
          ← {say("ก่อนหน้า", "Back")}
        </button>
        <button type="button" onClick={() => setPaused(!paused)}>
          {paused ? say("เล่นต่อ", "Resume") : say("พัก", "Pause")}
        </button>
        <button type="button" onClick={() => go(at + 1)}>
          {at === TOUR.length - 1 ? say("จบ", "Finish") : say("ถัดไป", "Next")} →
        </button>
        <button type="button" onClick={onDone}>
          {say("ปิด", "Close")}
        </button>
      </div>
    </aside>
  );
}
