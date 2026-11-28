"use client";

import { useEffect, useRef, useState } from "react";
import { command, type Action } from "@/assist";
import { toggleEasy } from "@/easy";
import { onFeature, openFeature } from "@/features";
import { useLang } from "@/i18n";

interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
  start: () => void;
  abort: () => void;
}

const maker = () => {
  const own = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return own.SpeechRecognition ?? own.webkitSpeechRecognition;
};

/** spoken commands: nothing is heard until the visitor presses to start */
export function Voice() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const stops = [onFeature("voice", () => setOn(true)), onFeature("tour", () => setOn(false)), onFeature("read", () => setOn(false))];
    return () => stops.forEach((stop) => stop());
  }, []);
  return on ? <Listener onDone={() => setOn(false)} /> : null;
}

function Listener({ onDone }: { onDone: () => void }) {
  const { english } = useLang();
  const say = (th: string, en: string) => (english ? en : th);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [problem, setProblem] = useState("");
  const [able] = useState(() => !!maker());
  const act = useRef<(action: Action) => void>(() => {});
  useEffect(() => {
    act.current = (action) => {
      const calm = !!document.querySelector<HTMLInputElement>("#calm")?.checked;
      const behavior = calm ? "instant" : "smooth";
      if ("go" in action) {
        if (action.go === "top") window.scrollTo({ top: 0, behavior });
        else document.getElementById(action.go)?.scrollIntoView({ behavior });
      } else if ("scroll" in action) window.scrollBy({ top: action.scroll * innerHeight * 0.75, behavior });
      else if ("stop" in action) setListening(false);
      else if (action.open === "easy") toggleEasy();
      else openFeature(action.open);
    };
  });

  useEffect(() => {
    const Make = maker();
    if (!listening || !Make) return;
    let current = true;
    const ear = new Make();
    ear.lang = english ? "en-US" : "th-TH";
    ear.continuous = true;
    ear.interimResults = false;
    ear.onresult = (event) => {
      const words = event.results[event.results.length - 1][0].transcript.trim();
      const action = command(words);
      setHeard(`${words}${action ? "" : english ? " (not a command)" : " (ไม่ตรงกับคำสั่ง)"}`);
      if (action) act.current(action);
    };
    ear.onerror = (event) => {
      if (event.error === "no-speech" || event.error === "aborted") return;
      current = false;
      setListening(false);
      setProblem(
        event.error === "not-allowed" || event.error === "service-not-allowed"
          ? english ? "The microphone is not allowed. Allow it in the browser to use this" : "ไม่ได้รับอนุญาตใช้ไมค์ ต้องกดอนุญาตในเบราว์เซอร์ก่อน"
          : english ? `Listening failed (${event.error})` : `ฟังไม่สำเร็จ (${event.error})`,
      );
    };
    // browsers stop listening after a pause: carry on while the button is still pressed
    ear.onend = () => current && ear.start();
    ear.start();
    return () => {
      current = false;
      ear.abort();
    };
  }, [listening, english]);

  return (
    <aside className="helper" aria-label={say("สั่งงานด้วยเสียง", "Voice commands")}>
      <p role="status">
        {!able
          ? say("เบราว์เซอร์นี้สั่งด้วยเสียงไม่ได้ ลองใช้ Chrome หรือ Edge", "This browser has no voice commands; try Chrome or Edge")
          : problem || (listening ? (heard ? `“${heard}”` : say("กำลังฟัง…", "Listening…")) : say("กดเริ่มฟัง แล้วพูดคำสั่ง", "Press to listen, then speak"))}
      </p>
      <p className="helper-note">
        {say("ลองพูด: ประวัติการศึกษา · โครงงาน · ติดต่อ · เลื่อนลง · พาชม · อ่านให้ฟัง · เปิดแว่น · ตัวใหญ่ · หยุด", "Try: education · project · contact · down · tour · read · x-ray · bigger · stop")}
        <br />
        {say("เบราว์เซอร์บางตัว เช่น Chrome ส่งเสียงไปแปลงเป็นข้อความที่บริการของผู้ผลิตเบราว์เซอร์ เว็บนี้ไม่เก็บเสียง", "Some browsers, Chrome among them, send the sound to their maker's service to turn it into text. This site keeps nothing")}
      </p>
      <div>
        <button
          type="button"
          disabled={!able}
          aria-pressed={listening}
          onClick={() => {
            setProblem("");
            setHeard("");
            setListening(!listening);
          }}
        >
          {listening ? say("หยุดฟัง", "Stop listening") : say("เริ่มฟัง", "Start listening")}
        </button>
        <button type="button" onClick={onDone}>
          {say("ปิด", "Close")}
        </button>
      </div>
    </aside>
  );
}
