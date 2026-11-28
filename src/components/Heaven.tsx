"use client";

import { useEffect, useRef, useState } from "react";
import { lineAt, momentAt, WHITE_FULL } from "@/heaven";
import { foundSecret } from "@/features";
import { createScene } from "@/heaven-draw";
import { playHeaven } from "@/heaven-sound";
import { useLang } from "@/i18n";
import { isTheme, nextTheme, setTheme } from "@/theme";

const WORD = "heaven";
export const openHeaven = () => window.dispatchEvent(new Event("made-in-heaven"));

/** stopped by the page's own box; otherwise the scene waits to be asked, with or without sound */
const stillness = () => (document.querySelector("#calm:checked") ? "stopped" : "ask");

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
  const [mode, setMode] = useState<"stopped" | "ask" | "play">(stillness);
  const silence = useRef<() => void>(undefined);
  // the sound ends with the window, however it was closed
  useEffect(() => () => silence.current?.(), []);

  function begin(sound: boolean) {
    // made inside the press, which is when a browser allows sound to start
    if (sound) silence.current = playHeaven();
    foundSecret("heaven");
    setMode("play");
  }
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
    const timer = setTimeout(onDone, 5000);
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
              : english ? "A fast, spinning scene of about 27 seconds" : "ฉากหมุนเร็ว ยาวราว 27 วินาที"}
        </p>
        {mode === "ask" && (
          <div className="heaven-choice">
            <button type="button" onClick={() => begin(true)} className="solx-btn-primary px-5 py-2 text-sm">
              {english ? "Quicken time, with sound" : "เร่งเวลา พร้อมเสียง"}
            </button>
            <button type="button" onClick={() => begin(false)} className="solx-btn-ghost px-5 py-2 text-sm">
              {english ? "Silently" : "แบบไม่มีเสียง"}
            </button>
          </div>
        )}
        <button autoFocus type="button" onClick={() => dialog.current!.close()} className="solx-btn-ghost px-4 py-1.5 text-xs">
          {english ? "Skip" : "ข้าม"} (Esc)
        </button>
      </div>
    </dialog>
  );
}
