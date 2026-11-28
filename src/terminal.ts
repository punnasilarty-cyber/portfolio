// คำสั่งของหน้าต่างเทอร์มินัลลับ ตอบจากข้อมูลที่หน้าเว็บส่งมาเท่านั้น
import type { Feature } from "./features.ts";
import { isTheme, THEMES, type Theme } from "./theme.ts";

export const PLACES = ["top", "education", "is2", "activities", "certificates", "contact"];

export type Facts = { english: boolean; about: string[]; education: string[]; projects: string[]; contacts: string[] };
export type Answer = { lines: string[]; heaven?: boolean; open?: Feature; clear?: boolean; close?: boolean; theme?: Theme; english?: boolean; goto?: string };

export function answer(input: string, facts: Facts): Answer {
  const [command = "", value = ""] = input.trim().toLowerCase().split(/\s+/);
  const say = (th: string, en: string) => (facts.english ? en : th);
  const usage = (options: string[]) => ({ lines: [`${say("พิมพ์", "Type")}: ${command} <${options.join(" | ")}>`] });

  switch (command) {
    case "":
      return { lines: [] };
    case "help":
      return {
        lines: [
          `about        ${say("แนะนำตัว", "who I am")}`,
          `education    ${say("ประวัติการศึกษา", "my schools")}`,
          `projects     ${say("ผลงาน", "my work")}`,
          `contact      ${say("ช่องทางติดต่อ", "how to reach me")}`,
          `goto <${say("หมวด", "section")}>   ${say("ไปยังหมวด", "jump to a section")}`,
          `theme <${THEMES.join("|")}>  ${say("เปลี่ยนสี", "change colour")}`,
          `lang <th|en>  ${say("เปลี่ยนภาษา", "change language")}`,
          `present      ${say("โหมดนำเสนอ", "presentation mode")}`,
          `clear · exit`,
        ],
      };
    case "about":
      return { lines: facts.about };
    case "education":
      return { lines: facts.education };
    case "projects":
      return { lines: facts.projects.length ? facts.projects : [say("ยังไม่มีรายการ", "Nothing listed yet")] };
    case "contact":
      return { lines: facts.contacts };
    case "theme":
      return isTheme(value) ? { lines: [say("เปลี่ยนสีแล้ว", "Colour changed")], theme: value } : usage([...THEMES]);
    case "lang":
      return value === "th" || value === "en" ? { lines: [value === "en" ? "Language: English" : "ภาษาไทย"], english: value === "en" } : usage(["th", "en"]);
    case "goto":
      return PLACES.includes(value) ? { lines: [], goto: value, close: true } : usage(PLACES);
    case "present":
      return { lines: [], open: command, close: true };
    // not listed by help
    case "matrix":
    case "timestop":
    case "blackhole":
      return { lines: [], open: command, close: true };
    case "heaven":
      return { lines: [], heaven: true, close: true };
    case "clear":
      return { lines: [], clear: true };
    case "exit":
      return { lines: [], close: true };
    default:
      return { lines: [say(`ไม่รู้จักคำสั่ง “${command}” พิมพ์ help เพื่อดูคำสั่ง`, `Unknown command “${command}”. Type help`)] };
  }
}
