"use client";

import { useEffect, useRef, useState } from "react";
import { sections } from "@/content";
import { onFeature, openFeature, search } from "@/features";
import { setEnglish, useLang } from "@/i18n";
import { setTheme, THEME_NAMES, THEMES } from "@/theme";

type Item = { label: string; group: string; words: string; run: () => void };

const go = (target: Element | null) => target?.scrollIntoView({ behavior: document.querySelector("#calm:checked") ? "instant" : "smooth" });

/** one box for everything, opened with Ctrl+K or the glass in the menu bar */
export function Palette() {
  const { english, t } = useLang();
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [at, setAt] = useState(0);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const open = () => {
      if (dialog.current!.open) return;
      const say = (th: string, en: string) => (english ? en : th);
      const places = [{ id: "top", title: "หน้าแรก" }, ...sections, { id: "contact", title: "ติดต่อ" }].map((place) => ({
        label: t(place.title),
        group: say("ไปที่", "Go to"),
        words: `${place.title} ${t(place.title)} ${place.id}`,
        run: () => go(document.getElementById(place.id)),
      }));
      // the cards as the page shows them now, including anything added in the editor
      const works = Array.from(document.querySelectorAll("main section[id] > ul > li"), (card) => {
        const label = card.querySelector("h3")?.textContent ?? "";
        const kind = card.querySelector(".work-file b")?.textContent ?? "";
        return {
          label: kind ? `${label} (${kind})` : label,
          group: say("ผลงาน", "Work"),
          words: `${card.textContent}`,
          run: () => {
            go(card);
            card.querySelector<HTMLButtonElement>(".solx-card button[aria-label]")?.click();
          },
        };
      }).filter((item) => item.label);
      const actions = [
        { label: say("พลังจิต", "Psychic power"), words: "psychic throw พลังจิต โยน ยก", run: () => openFeature("psychic") },
        { label: say("AI ทำอะไรได้", "What AI can do"), words: "ai artificial intelligence เอไอ ปัญญาประดิษฐ์ หุ่นยนต์", run: () => openFeature("ai") },
        { label: say("เมนูฟีเจอร์ทั้งหมด", "All features"), words: "menu features เมนู ฟีเจอร์", run: () => openFeature("menu") },
        { label: say("โหมดนำเสนอ", "Presentation mode"), words: "present slide นำเสนอ สไลด์", run: () => openFeature("present") },
        { label: say("สมุดความลับ", "Secret book"), words: "secret ความลับ", run: () => openFeature("secrets") },
        ...THEMES.map((theme) => ({ label: `${say("สีธีม", "Theme")}: ${THEME_NAMES[theme][english ? "en" : "th"]}`, words: `theme color สี ธีม ${theme} ${THEME_NAMES[theme].th}`, run: () => setTheme(theme) })),
        { label: english ? "เปลี่ยนเป็นภาษาไทย" : "Switch to English", words: "language lang ภาษา english ไทย", run: () => setEnglish(!english) },
      ].map((item) => ({ ...item, group: say("คำสั่ง", "Action") }));
      setItems([...places, ...works, ...actions]);
      setQuery("");
      setAt(0);
      dialog.current!.showModal();
    };
    const key = (event: KeyboardEvent) => {
      if (event.code !== "KeyK" || !(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      if (!document.querySelector("dialog[open]")) open();
    };
    window.addEventListener("keydown", key);
    const stop = onFeature("palette", open);
    return () => {
      window.removeEventListener("keydown", key);
      stop();
    };
  }, [english, t]);

  const shown = search(items, query);
  const chosen = Math.min(at, shown.length - 1);

  useEffect(() => {
    dialog.current?.querySelector("[aria-selected='true']")?.scrollIntoView({ block: "nearest" });
  }, [chosen]);

  function choose(item: Item | undefined) {
    if (!item) return;
    dialog.current!.close();
    // after this window has gone, so another one or the page is free to move
    setTimeout(item.run, 0);
  }

  return (
    <dialog ref={dialog} aria-label={english ? "Search and commands" : "ค้นหาและคำสั่ง"} className="palette" onClick={(event) => event.target === event.currentTarget && event.currentTarget.close()}>
      <input
        autoFocus
        role="combobox"
        aria-expanded="true"
        aria-controls="palette-list"
        aria-activedescendant={chosen >= 0 ? `palette-${chosen}` : undefined}
        value={query}
        placeholder={english ? "Search work, sections or commands…" : "ค้นหาผลงาน หมวด หรือคำสั่ง…"}
        onChange={(event) => {
          setQuery(event.target.value);
          setAt(0);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (shown.length) setAt((chosen + (event.key === "ArrowDown" ? 1 : -1) + shown.length) % shown.length);
          } else if (event.key === "Enter") {
            event.preventDefault();
            choose(shown[chosen]);
          }
        }}
      />
      <ul id="palette-list" role="listbox">
        {shown.map((item, i) => (
          <li key={`${item.group} ${item.label} ${i}`} id={`palette-${i}`} role="option" aria-selected={i === chosen} onMouseMove={() => setAt(i)} onClick={() => choose(item)}>
            <span>{item.label}</span>
            <small>{item.group}</small>
          </li>
        ))}
        {!shown.length && <li className="is-empty">{english ? "Nothing found" : "ไม่พบรายการ"}</li>}
      </ul>
      <p aria-hidden="true">↑↓ {english ? "choose" : "เลือก"} · Enter {english ? "open" : "เปิด"} · Esc {english ? "close" : "ปิด"}</p>
    </dialog>
  );
}
