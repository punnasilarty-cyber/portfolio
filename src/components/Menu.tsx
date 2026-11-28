"use client";

import { useEffect, useRef, useState } from "react";
import { openHeaven } from "@/components/Heaven";
import { onFeature, openFeature, type Feature } from "@/features";
import { setEnglish, useLang } from "@/i18n";
import { setTheme, THEME_NAMES, THEMES } from "@/theme";

type Entry = { icon: string; th: [name: string, what: string]; en: [name: string, what: string]; open: Feature | "heaven" };

const GROUPS: { th: string; en: string; entries: Entry[] }[] = [
  {
    th: "ฉากแนะนำ",
    en: "Showcase",
    entries: [{ icon: "🤖", th: ["AI ทำอะไรได้", "ความสามารถ และด้านน่ากลัวในอนาคต"], en: ["What AI can do", "Its abilities, and its darker future"], open: "ai" }],
  },
  {
    th: "เครื่องมือ",
    en: "Tools",
    entries: [
      { icon: "🔍", th: ["ค้นหา", "ผลงาน หมวด คำสั่ง (Ctrl+K)"], en: ["Search", "Work, sections, commands (Ctrl+K)"], open: "palette" },
      { icon: "🎤", th: ["โหมดนำเสนอ", "เลื่อนทีละหน้าด้วยลูกศร"], en: ["Presentation", "Step through with the arrow keys"], open: "present" },
      { icon: "📖", th: ["สมุดความลับ", "ดูว่าพบแล้วกี่อย่าง"], en: ["Secret book", "See what you have found"], open: "secrets" },
      { icon: "⌨️", th: ["หน้าต่างคำสั่ง", "พิมพ์ help เพื่อเริ่ม"], en: ["Terminal", "Type help to begin"], open: "terminal" },
    ],
  },
  {
    th: "ฉากลับ",
    en: "Secret shows",
    entries: [
      { icon: "✦", th: ["Made in Heaven", "เวลาเร่งจนจักรวาลเริ่มใหม่"], en: ["Made in Heaven", "Time races until the universe restarts"], open: "heaven" },
      { icon: "⏸", th: ["หยุดเวลา", "ทุกอย่างค้าง 5 วินาที"], en: ["Time stop", "Everything freezes for 5 seconds"], open: "timestop" },
      { icon: "🌧", th: ["ฝนรหัส", "ตัวอักษรไหลรวมเป็นชื่อ"], en: ["Code rain", "Falling letters gather into a name"], open: "matrix" },
      { icon: "🌀", th: ["หลุมดำ", "ดูดทั้งหน้าแล้วคายกลับ"], en: ["Black hole", "Swallows the page and throws it back"], open: "blackhole" },
      { icon: "🖐", th: ["พลังจิต", "จับของบนหน้าเว็บเหวี่ยงได้"], en: ["Psychic power", "Grab the page's pieces and throw them"], open: "psychic" },
    ],
  },
];

/** every feature of the site in one place */
export function Menu() {
  const { english } = useLang();
  const dialog = useRef<HTMLDialogElement>(null);
  const [calm, setCalm] = useState(false);
  const title = english ? "All features" : "เมนูฟีเจอร์ทั้งหมด";

  useEffect(
    () =>
      onFeature("menu", () => {
        if (dialog.current!.open) return;
        setCalm(!!document.querySelector("#calm:checked"));
        dialog.current!.showModal();
      }),
    [],
  );

  function launch(open: Entry["open"]) {
    dialog.current!.close();
    // after this window has gone; still counts as the same press, so full screen is allowed
    setTimeout(() => (open === "heaven" ? openHeaven() : openFeature(open)), 0);
  }

  return (
    <dialog ref={dialog} aria-label={title} className="sheet sheet--menu" onClick={(event) => event.target === event.currentTarget && event.currentTarget.close()}>
      <header>
        <h3>{title}</h3>
        <button type="button" onClick={() => dialog.current!.close()} className="solx-btn-primary px-4 py-1.5 text-xs">
          {english ? "Close" : "ปิด"}
        </button>
      </header>
      {GROUPS.map((group) => (
        <section key={group.en}>
          <h4>{english ? group.en : group.th}</h4>
          <div className="menu-grid">
            {group.entries.map((entry) => {
              const [name, what] = english ? entry.en : entry.th;
              return (
                <button key={entry.open} type="button" onClick={() => launch(entry.open)}>
                  <span aria-hidden="true">{entry.icon}</span>
                  <b>{name}</b>
                  <small>{what}</small>
                </button>
              );
            })}
          </div>
        </section>
      ))}
      <section>
        <h4>{english ? "Settings" : "ตั้งค่า"}</h4>
        <div className="menu-row">
          {THEMES.map((theme) => (
            <button key={theme} type="button" onClick={() => setTheme(theme)}>
              {THEME_NAMES[theme][english ? "en" : "th"]}
            </button>
          ))}
          <button type="button" onClick={() => setEnglish(!english)}>
            {english ? "ภาษาไทย" : "English"}
          </button>
          <button
            type="button"
            aria-pressed={calm}
            onClick={() => {
              document.querySelector<HTMLInputElement>("#calm")!.click();
              setCalm(!calm);
            }}
          >
            {calm ? "✓ " : ""}
            {english ? "Stop animation" : "หยุดแอนิเมชัน"}
          </button>
        </div>
      </section>
      <section>
        <h4>{english ? "Always working" : "ทำงานเองอัตโนมัติ"}</h4>
        <ul>
          <li>{english ? "Leaflet unfolding when a picture or document is opened" : "แผ่นพับคลี่: กดดูรูปหรือเปิดเอกสาร"}</li>
          <li>{english ? "Works offline and installs from the browser menu" : "เปิดได้ตอนไม่มีเน็ต และติดตั้งเป็นแอปจากเมนูเบราว์เซอร์"}</li>
        </ul>
      </section>
    </dialog>
  );
}
