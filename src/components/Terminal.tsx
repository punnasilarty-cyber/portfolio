"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { openHeaven } from "@/components/Heaven";
import { foundSecret, openFeature } from "@/features";
import { setEnglish, useLang } from "@/i18n";
import { useSite } from "@/site-store";
import { answer } from "@/terminal";
import { setTheme } from "@/theme";
import { englishPeriod } from "@/translations";

/** a hidden command window: the small button in the footer, or the key left of 1 */
export function Terminal() {
  const { english, t } = useLang();
  const { about, contacts, education } = useSite();
  const dialog = useRef<HTMLDialogElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<string[]>([]);

  const open = () => {
    if (dialog.current!.open) return;
    dialog.current!.showModal();
    foundSecret("terminal");
  };

  useEffect(() => {
    const pressed = (event: KeyboardEvent) => {
      // not while writing somewhere, and not over another window
      if (event.code !== "Backquote" || event.ctrlKey || event.metaKey) return;
      if ((event.target as Element).closest("input, textarea, select, dialog")) return;
      event.preventDefault();
      open();
    };
    window.addEventListener("keydown", pressed);
    return () => window.removeEventListener("keydown", pressed);
  }, []);

  // the newest answer stays in view
  useEffect(() => {
    log.current?.scrollTo(0, log.current.scrollHeight);
  }, [lines]);

  function run(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const field = event.currentTarget.elements.namedItem("command") as HTMLInputElement;
    const typed = field.value;
    field.value = "";
    const reply = answer(typed, {
      english,
      about: about.map(t),
      education: education.map((stage) => `${english ? englishPeriod(stage.period) : stage.period}  ${t(stage.level)} · ${t(stage.school)}`),
      // as listed on the page, which includes what was added in the editor
      projects: Array.from(new Set(Array.from(document.querySelectorAll("main section[id] > ul h3"), (title) => title.textContent!))),
      contacts: contacts.map((contact) => `${t(contact.name)}: ${contact.value}`),
    });
    if (reply.theme) setTheme(reply.theme);
    if (reply.english !== undefined) setEnglish(reply.english);
    setLines((before) => (reply.clear ? [] : [...before, `> ${typed}`, ...reply.lines]));
    if (reply.close) dialog.current!.close();
    if (reply.heaven) openHeaven();
    // after this window has gone
    if (reply.open) setTimeout(() => openFeature(reply.open!), 0);
    // after the window has gone, so the page is free to move
    if (reply.goto) requestAnimationFrame(() => document.getElementById(reply.goto!)?.scrollIntoView());
  }

  return (
    <>
      <button type="button" onClick={open} aria-label={english ? "Open the terminal" : "เปิดหน้าต่างเทอร์มินัล"} className="terminal-open">
        &gt;_
      </button>
      <dialog ref={dialog} aria-label={english ? "Terminal" : "เทอร์มินัล"} className="terminal">
        <header>
          <p>visitor@portfolio</p>
          <button type="button" onClick={() => dialog.current!.close()}>
            {t("ปิด")}
          </button>
        </header>
        <div ref={log} role="log" className="terminal-log">
          <p>{english ? "Type help to see the commands" : "พิมพ์ help เพื่อดูคำสั่ง"}</p>
          {lines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        <form onSubmit={run}>
          <span aria-hidden="true">&gt;</span>
          <input name="command" autoFocus autoComplete="off" autoCapitalize="none" spellCheck={false} aria-label={english ? "Command" : "คำสั่ง"} />
        </form>
      </dialog>
    </>
  );
}
