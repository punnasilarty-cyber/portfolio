"use client";

import { useEffect, useState } from "react";
import { placeOf, READINGS } from "@/assist";
import { onFeature } from "@/features";
import { useLang } from "@/i18n";
import { words } from "@/words";

const SPEEDS = [0.8, 1, 1.25];
// marks the word being spoken without touching the page's elements, where the browser can
const highlights = () => (typeof CSS !== "undefined" ? (CSS as unknown as { highlights?: Map<string, unknown> }).highlights : undefined);

/** the page read aloud by the device's own voice, the block lit and, where the voice says, the word */
export function ReadAloud() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const stops = [onFeature("read", () => setOn(true)), onFeature("tour", () => setOn(false)), onFeature("voice", () => setOn(false))];
    return () => stops.forEach((stop) => stop());
  }, []);
  return on ? <Reader onDone={() => setOn(false)} /> : null;
}

/** the blocks on the page now, each with the text nodes to be spoken */
function blocksNow() {
  return READINGS.flatMap(({ find, parts }) =>
    Array.from(document.querySelectorAll<HTMLElement>(find), (block) => {
      let text = "";
      const nodes: Text[] = [];
      const starts: number[] = [];
      for (const part of parts ? Array.from(block.querySelectorAll(parts)) : [block]) {
        const walker = document.createTreeWalker(part, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          starts.push(text.length);
          nodes.push(node as Text);
          text += node.textContent;
        }
        // a breath between the pieces
        text += " . ";
      }
      return { block, text, nodes, starts };
    }),
  ).filter((each) => each.nodes.length);
}

function Reader({ onDone }: { onDone: () => void }) {
  const { english } = useLang();
  const say = (th: string, en: string) => (english ? en : th);
  const [blocks] = useState(blocksNow);
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[] | null>(null);
  const able = typeof speechSynthesis !== "undefined";
  const lang = english ? "en" : "th";
  const voice = voices?.find((each) => each.lang.toLowerCase().startsWith(lang));

  useEffect(() => {
    if (!able) return;
    const list = () => speechSynthesis.getVoices().length && setVoices(speechSynthesis.getVoices());
    list();
    speechSynthesis.addEventListener("voiceschanged", list);
    // some browsers never announce their voices: then speak with whatever is the default
    const give = setTimeout(() => setVoices((known) => known ?? []), 1500);
    return () => {
      clearTimeout(give);
      speechSynthesis.removeEventListener("voiceschanged", list);
    };
  }, [able]);

  useEffect(() => {
    const here = blocks[at];
    if (!here) return;
    const calm = !!document.querySelector<HTMLInputElement>("#calm")?.checked;
    here.block.scrollIntoView({ behavior: calm ? "instant" : "smooth", block: "center" });
    here.block.classList.add("is-read");
    return () => here.block.classList.remove("is-read");
  }, [at, blocks]);

  useEffect(() => {
    if (!able || !playing || voices === null) return;
    const here = blocks[at];
    if (!here) return;
    let current = true;
    const speech = new SpeechSynthesisUtterance(here.text);
    speech.lang = english ? "en-US" : "th-TH";
    if (voice) speech.voice = voice;
    speech.rate = speed;
    speech.onboundary = (event) => {
      const marks = highlights();
      if (!current || !marks || typeof Highlight === "undefined") return;
      const length = event.charLength || words(here.text.slice(event.charIndex))[0]?.trim().length || 1;
      const [piece, offset] = placeOf(here.starts, event.charIndex);
      const node = here.nodes[piece];
      if (offset >= node.length) return;
      const range = new Range();
      range.setStart(node, offset);
      range.setEnd(node, Math.min(node.length, offset + length));
      marks.set("reading", new Highlight(range));
    };
    speech.onend = () => {
      if (!current) return;
      if (at + 1 < blocks.length) setAt(at + 1);
      else setPlaying(false);
    };
    speechSynthesis.cancel();
    speechSynthesis.speak(speech);
    return () => {
      current = false;
      speechSynthesis.cancel();
      highlights()?.delete("reading");
    };
  }, [able, playing, voices, voice, at, speed, english, blocks]);

  const status = !able
    ? say("เบราว์เซอร์นี้อ่านออกเสียงไม่ได้", "This browser cannot read aloud")
    : voices?.length && !voice
      ? say("เครื่องนี้ไม่มีเสียงภาษาไทย อาจเงียบหรืออ่านเพี้ยน ลองเพิ่มเสียงภาษาไทยในการตั้งค่าเครื่อง หรือเปลี่ยนเว็บเป็นภาษาอังกฤษ", "This device has no English voice; it may stay silent or sound wrong")
      : playing
        ? say("กำลังอ่านหน้าเว็บ", "Reading the page")
        : say("หยุดอยู่ กดอ่านต่อ", "Stopped. Press to go on");

  return (
    <aside className="helper" aria-label={say("อ่านออกเสียง", "Read aloud")}>
      <p role="status">{status}</p>
      <div>
        <small>
          {Math.min(at + 1, blocks.length)} / {blocks.length}
        </small>
        <button type="button" disabled={!able || at === 0} onClick={() => setAt(at - 1)}>
          ← {say("ก่อนหน้า", "Back")}
        </button>
        <button type="button" disabled={!able} onClick={() => setPlaying(!playing)}>
          {playing ? say("หยุด", "Stop") : say("อ่านต่อ", "Go on")}
        </button>
        <button type="button" disabled={!able || at >= blocks.length - 1} onClick={() => setAt(at + 1)}>
          {say("ถัดไป", "Next")} →
        </button>
        <button type="button" disabled={!able} onClick={() => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])}>
          {say("ความเร็ว", "Speed")} {speed}×
        </button>
        <button type="button" onClick={onDone}>
          {say("ปิด", "Close")}
        </button>
      </div>
    </aside>
  );
}
