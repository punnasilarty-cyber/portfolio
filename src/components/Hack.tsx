"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { onFeature } from "@/features";
import { opens, STAGES, TRIES_BEFORE_ANSWER } from "@/hack";
import { useLang } from "@/i18n";
import { setTheme } from "@/theme";

/** a make-believe break-in: three puzzles, and the secret colour theme for whoever solves them */
export function Hack() {
  const [on, setOn] = useState(false);
  useEffect(() => onFeature("hack", () => setOn(true)), []);
  return on ? <Mission onDone={() => setOn(false)} /> : null;
}

function Mission({ onDone }: { onDone: () => void }) {
  const { english } = useLang();
  const language = english ? "en" : "th";
  const dialog = useRef<HTMLDialogElement>(null);
  const [at, setAt] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [hinted, setHinted] = useState(false);
  const stage = STAGES[at];

  useEffect(() => {
    if (!dialog.current!.open) dialog.current!.showModal();
  }, []);

  function tryOpen(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const field = event.currentTarget.elements.namedItem("answer") as HTMLInputElement;
    if (!field.value.trim()) return;
    if (opens(stage, field.value)) {
      setAt(at + 1);
      setWrong(0);
      setHinted(false);
      if (at + 1 === STAGES.length) setTheme("neon");
    } else setWrong(wrong + 1);
    field.value = "";
    field.focus();
  }

  return (
    <dialog ref={dialog} onClose={onDone} aria-label={english ? "Hacker mode" : "โหมดแฮ็กเกอร์"} className="hack">
      <header>
        <p>
          {english ? "MISSION" : "ภารกิจ"} · {Math.min(at, STAGES.length)}/{STAGES.length}
        </p>
        <button type="button" onClick={() => dialog.current!.close()}>
          {english ? "Close" : "ปิด"} (Esc)
        </button>
      </header>
      <ol className="hack-bar" aria-hidden="true">
        {STAGES.map((each, i) => (
          <li key={each.answer} className={i < at ? "is-open" : ""} />
        ))}
      </ol>
      {stage ? (
        // a new gate starts with an empty form
        <form key={at} onSubmit={tryOpen}>
          <h3>{stage.title[language]}</h3>
          <p>{stage.task[language]}</p>
          <pre lang="en">{stage.code}</pre>
          <label>
            <span aria-hidden="true">&gt;</span>
            <input name="answer" autoFocus autoComplete="off" autoCapitalize="none" spellCheck={false} aria-label={english ? "Answer" : "คำตอบ"} placeholder={english ? "type the answer" : "พิมพ์คำตอบ"} />
            <button type="submit">{english ? "Unlock" : "ปลดล็อก"}</button>
          </label>
          <p role="status" className="hack-no">
            {wrong > 0 && (english ? `ACCESS DENIED (${wrong})` : `ปฏิเสธการเข้าถึง (${wrong})`)}
          </p>
          {hinted ? (
            <p className="hack-hint">{stage.hint[language]}</p>
          ) : (
            <button type="button" onClick={() => setHinted(true)}>
              {english ? "Hint" : "ขอคำใบ้"}
            </button>
          )}
          {wrong >= TRIES_BEFORE_ANSWER && (
            <p className="hack-hint">
              {english ? "Answer" : "เฉลย"}: {stage.answer.toUpperCase()}
            </p>
          )}
        </form>
      ) : (
        <div className="hack-won">
          <h3>ACCESS GRANTED</h3>
          <p>{english ? "All gates open. The secret neon theme is yours" : "ผ่านครบทุกด่าน ปลดล็อกธีมลับ “นีออน” แล้ว"}</p>
          <button autoFocus type="button" onClick={() => dialog.current!.close()}>
            {english ? "See the site" : "ดูเว็บในธีมใหม่"}
          </button>
        </div>
      )}
      <small>{english ? "A game: nothing is really being hacked" : "เกมจำลอง ไม่ได้เจาะระบบใดจริง"}</small>
    </dialog>
  );
}
