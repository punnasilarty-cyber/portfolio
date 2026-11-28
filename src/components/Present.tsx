"use client";

import { useEffect, useState } from "react";
import { onFeature, slideAfter } from "@/features";
import { useLang } from "@/i18n";

// the stops of a talk, from the opening to the contact details; each card of the project is a stop of its own
const STOPS = "#top > section:first-child, .about, #education, #is2, #is2 .deck > li, #activities, #certificates, #contact";

const slides = () => Array.from(document.querySelectorAll<HTMLElement>(STOPS));

/** steps through the page like slides: arrow keys, space, a clicker's page keys, or the buttons */
export function Present() {
  const [on, setOn] = useState(false);
  useEffect(
    () =>
      onFeature("present", () => {
        setOn(true);
        // the whole screen when the browser allows it; the talk works either way
        document.documentElement.requestFullscreen?.().catch(() => {});
      }),
    [],
  );
  return on ? <Talk onDone={() => setOn(false)} /> : null;
}

function Talk({ onDone }: { onDone: () => void }) {
  const { english } = useLang();
  const [at, setAt] = useState(0);
  const [count] = useState(() => slides().length);

  useEffect(() => {
    document.body.classList.add("is-presenting");
    return () => {
      document.body.classList.remove("is-presenting");
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);

  useEffect(() => {
    const slide = slides()[at];
    if (!slide) return;
    const calm = !!document.querySelector("#calm:checked");
    if (at === 0) window.scrollTo({ top: 0, behavior: calm ? "instant" : "smooth" });
    else slide.scrollIntoView({ behavior: calm ? "instant" : "smooth", block: slide.matches("li") ? "center" : "start" });
  }, [at]);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      // a window opened during the talk keeps its own keys
      if (document.querySelector("dialog[open]")) return;
      const step = ["ArrowRight", "ArrowDown", "PageDown", " "].includes(event.key) ? 1 : ["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key) ? -1 : 0;
      if (event.key === "Escape") return onDone();
      if (!step || (event.key === " " && (event.target as Element).closest("button, a"))) return;
      event.preventDefault();
      setAt((now) => slideAfter(now, step, count));
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [count, onDone]);

  return (
    <div role="toolbar" aria-label={english ? "Presentation" : "การนำเสนอ"} className="present">
      <button type="button" onClick={() => setAt(slideAfter(at, -1, count))} disabled={at === 0} aria-label={english ? "Previous" : "ก่อนหน้า"}>
        ‹
      </button>
      <span aria-live="polite">
        {at + 1} / {count}
      </span>
      <button type="button" onClick={() => setAt(slideAfter(at, 1, count))} disabled={at === count - 1} aria-label={english ? "Next" : "ถัดไป"}>
        ›
      </button>
      <button type="button" onClick={onDone} aria-label={english ? "End the presentation" : "จบการนำเสนอ"}>
        ✕
      </button>
      <i style={{ transform: `scaleX(${(at + 1) / count})` }} />
    </div>
  );
}
