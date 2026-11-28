"use client";

import { useEffect, useRef, useState } from "react";
import { foundSecret, onFeature, openFeature, readFound, SECRETS, WORDS, wordTyped, type SecretId } from "@/features";
import { useLang } from "@/i18n";

const KEY = "secrets";

/** listens for the secret words, keeps the list of what was found, and shows it as a book from the feature menu */
export function Secrets() {
  const { english } = useLang();
  const language = english ? "en" : "th";
  const dialog = useRef<HTMLDialogElement>(null);
  const [found, setFound] = useState<SecretId[]>([]);
  const [news, setNews] = useState<SecretId | null>(null);

  useEffect(() => {
    // read after the page is drawn, which the server could not have known
    const start = requestAnimationFrame(() => setFound(readFound(localStorage.getItem(KEY))));
    const heard = (event: Event) => {
      const id = (event as CustomEvent<SecretId>).detail;
      const before = readFound(localStorage.getItem(KEY));
      if (before.includes(id)) return;
      const after = readFound(JSON.stringify([...before, id]));
      localStorage.setItem(KEY, JSON.stringify(after));
      setFound(after);
      setNews(id);
    };
    let typed = "";
    let presses: number[] = [];
    const key = (event: KeyboardEvent) => {
      // not while writing somewhere, or inside another window
      if (event.ctrlKey || event.metaKey || event.altKey || (event.target as Element).closest("input, textarea, select, dialog")) return;
      typed = (typed + event.code.replace("Key", "").toLowerCase()).slice(-12);
      const word = wordTyped(typed);
      if (!word) return;
      typed = "";
      openFeature(WORDS[word]);
    };
    // five quick presses on the name in the menu bar
    const pressed = (event: MouseEvent) => {
      if (!(event.target as Element).closest("header a[href='#top']:not(nav a)")) return;
      const now = performance.now();
      presses = [...presses.filter((at) => now - at < 2500), now];
      if (presses.length >= 5) foundSecret("name");
    };
    window.addEventListener("secret", heard);
    window.addEventListener("keydown", key);
    document.addEventListener("click", pressed);
    const stop = onFeature("secrets", () => !dialog.current!.open && dialog.current!.showModal());
    return () => {
      cancelAnimationFrame(start);
      window.removeEventListener("secret", heard);
      window.removeEventListener("keydown", key);
      document.removeEventListener("click", pressed);
      stop();
    };
  }, []);

  useEffect(() => {
    if (!news) return;
    // windows cover the note, so its 4.5 seconds are counted only while none is open
    let seen = 0;
    const timer = setInterval(() => {
      if (!document.querySelector("dialog[open]") && ++seen >= 9) setNews(null);
    }, 500);
    return () => clearInterval(timer);
  }, [news]);

  const all = found.length === SECRETS.length;
  const title = english ? "Secret book" : "สมุดความลับ";

  return (
    <>
      <p role="status" className={news ? "secret-news is-on" : "secret-news"}>
        {news && `${english ? "Secret found" : "พบความลับ"}: ${SECRETS.find((secret) => secret.id === news)!.name[language]} (${found.length}/${SECRETS.length})`}
      </p>
      <dialog ref={dialog} aria-label={title} className="sheet">
        <header>
          <h3>
            {title} {found.length}/{SECRETS.length}
          </h3>
          <button type="button" onClick={() => dialog.current!.close()} className="solx-btn-primary px-4 py-1.5 text-xs">
            {english ? "Close" : "ปิด"}
          </button>
        </header>
        <ol className="secret-list">
          {SECRETS.map((secret) => {
            const done = found.includes(secret.id);
            return (
              <li key={secret.id} className={done ? "is-found" : ""}>
                <b>{done ? secret.name[language] : "???"}</b>
                <span>{done ? (english ? "Found" : "พบแล้ว") : secret.hint[language]}</span>
              </li>
            );
          })}
        </ol>
        {all && (
          <div className="secret-prize">
            <span aria-hidden="true">🏆</span>
            <p>{english ? "Master explorer: every secret found!" : "สุดยอดนักสำรวจ คุณพบครบทุกความลับแล้ว!"}</p>
          </div>
        )}
      </dialog>
    </>
  );
}
