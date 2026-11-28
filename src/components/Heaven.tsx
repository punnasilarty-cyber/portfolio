"use client";

import { useEffect, useRef, useState } from "react";
import { END, lineAt, momentAt, WHITE_FULL } from "@/heaven";
import { createScene } from "@/heaven-draw";
import { useLang } from "@/i18n";
import { isTheme, nextTheme, setTheme } from "@/theme";

const WORD = "heaven";
export const openHeaven = () => window.dispatchEvent(new Event("made-in-heaven"));

/** stopped by the page's own box; or the device asks for less motion, and then the scene waits to be asked */
const stillness = () => (document.querySelector("#calm:checked") ? "stopped" : matchMedia("(prefers-reduced-motion: reduce)").matches ? "ask" : "play");

/** the secret: type "heaven", use the terminal, or find the small star in the footer */
export function Heaven() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    let typed = "";
    const key = (event: KeyboardEvent) => {
      // not while writing somewhere, or inside another window
      if (event.ctrlKey || event.metaKey || event.altKey || (event.target as Element).closest("input, textarea, select, dialog")) return;
      // by the key's place, so it also works with the Thai layout switched on
      typed = (typed + event.code.replace("Key", "").toLowerCase()).slice(-WORD.length);
      if (typed === WORD) setOn(true);
    };
    const asked = () => setOn(true);
    window.addEventListener("keydown", key);
    window.addEventListener("made-in-heaven", asked);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("made-in-heaven", asked);
    };
  }, []);

  return on ? <Scene onDone={() => setOn(false)} /> : null;
}

function Scene({ onDone }: { onDone: () => void }) {
  const { english } = useLang();
  const canvas = useRef<HTMLCanvasElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [line, setLine] = useState(() => lineAt(0, english));
  // decided once as it opens
  const [mode, setMode] = useState(stillness);
  const quiet = mode !== "play";

  useEffect(() => {
    if (!dialog.current!.open) dialog.current!.showModal();
  }, []);

  useEffect(() => {
    if (quiet) return;
    const sheet = canvas.current!;
    const pen = sheet.getContext("2d")!;
    const veil = sheet.parentElement!;
    const ratio = Math.min(1.5, window.devicePixelRatio || 1);
    const [w, h] = [window.innerWidth, window.innerHeight];
    sheet.width = w * ratio;
    sheet.height = h * ratio;
    pen.setTransform(ratio, 0, 0, ratio, 0, 0);
    const scene = createScene(pen, w, h, ratio);
    let frame = 0;
    let before = 0;
    let began = 0;
    let renewed = false;

    const tick = (now: number) => {
      began ||= now;
      const t = (now - began) / 1000;
      const step = Math.min(0.05, before ? (now - before) / 1000 : 0);
      before = now;
      const moment = momentAt(t);

      if (moment.renewed && !renewed) {
        renewed = true;
        // behind the white: back to the top, in the next colour
        const theme = document.documentElement.dataset.theme;
        setTheme(nextTheme(isTheme(theme) ? theme : "red"));
        window.scrollTo({ top: 0, behavior: "instant" });
        veil.classList.add("is-renewed");
      }
      if (renewed) scene.bang(t - WHITE_FULL);
      else scene.universe(t, step);
      veil.style.setProperty("--white", String(moment.white));
      setLine(lineAt(t, document.documentElement.lang === "en"));
      if (moment.over) return onDone();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // the scene runs once from start to end
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiet]);

  // with animation stopped it leaves by itself
  useEffect(() => {
    if (mode !== "stopped") return;
    const timer = setTimeout(onDone, END * 400);
    return () => clearTimeout(timer);
  }, [mode, onDone]);

  return (
    <dialog ref={dialog} onClose={onDone} aria-label="Made in Heaven" className="heaven">
      <div className={quiet ? "heaven-veil is-quiet" : "heaven-veil"}>
        <canvas ref={canvas} aria-hidden="true" />
        <i aria-hidden="true" />
        <h2 lang="en">MADE IN HEAVEN</h2>
        <p role="status">
          {mode === "play"
            ? line
            : mode === "stopped"
              ? english ? "The new universe waits. Turn animations on to see it" : "จักรวาลใหม่รออยู่ เปิดแอนิเมชันเพื่อชม"
              : english ? "A fast, spinning scene of about 12 seconds" : "ฉากหมุนเร็ว ยาวราว 12 วินาที"}
        </p>
        {mode === "ask" && (
          <button type="button" onClick={() => setMode("play")} className="solx-btn-primary px-5 py-2 text-sm">
            {english ? "Quicken time" : "เร่งเวลา"}
          </button>
        )}
        <button autoFocus type="button" onClick={() => dialog.current!.close()} className="solx-btn-ghost px-4 py-1.5 text-xs">
          {english ? "Skip" : "ข้าม"} (Esc)
        </button>
      </div>
    </dialog>
  );
}
