// สิ่งที่เปิดจากหลายที่ได้ (ปุ่ม กล่องคำสั่ง เทอร์มินัล คำลับ) และความลับที่ให้คนดูตามหา

export type Feature = "palette" | "card" | "present" | "secrets" | "timestop" | "matrix" | "blackhole" | "menu" | "terminal" | "ai" | "psychic";

export const openFeature = (name: Feature) => window.dispatchEvent(new CustomEvent("feature", { detail: name }));

/** calls `run` whenever the feature is asked for; returns the way to stop listening */
export function onFeature(name: Feature, run: () => void) {
  const heard = (event: Event) => (event as CustomEvent<Feature>).detail === name && run();
  window.addEventListener("feature", heard);
  return () => window.removeEventListener("feature", heard);
}

/** words typed anywhere on the page; read by the keys' places, so any keyboard language works */
export const WORDS: Record<string, "timestop" | "matrix" | "blackhole" | "psychic"> = { timestop: "timestop", matrix: "matrix", blackhole: "blackhole", psychic: "psychic" };

/** the word these latest keys end with, if any */
export const wordTyped = (keys: string) => Object.keys(WORDS).find((word) => keys.endsWith(word));

export const SECRETS = [
  { id: "terminal", name: { th: "หน้าต่างคำสั่ง", en: "The command window" }, hint: { th: "ท้ายหน้ามีปุ่มเล็กๆ หน้าตาแบบโปรแกรมเมอร์", en: "A small programmer-looking button hides at the end of the page" } },
  { id: "heaven", name: { th: "Made in Heaven", en: "Made in Heaven" }, hint: { th: "มีดาวดวงหนึ่งรอให้กด", en: "A star is waiting to be pressed" } },
  { id: "timestop", name: { th: "หยุดเวลา", en: "Time stop" }, hint: { th: "พิมพ์คำว่าหยุดเวลาเป็นภาษาอังกฤษ ติดกันไม่เว้นวรรค", en: "Type the two words for stopping time, with no space" } },
  { id: "matrix", name: { th: "ฝนรหัส", en: "Code rain" }, hint: { th: "พิมพ์ชื่อหนังที่มีตัวอักษรสีเขียวไหลลงมา", en: "Type the name of the film with falling green letters" } },
  { id: "name", name: { th: "เจ้าของชื่อ", en: "The name's owner" }, hint: { th: "ชื่อบนแถบเมนู ลองกดซ้ำหลายๆ ครั้ง", en: "Try pressing the name on the menu bar again and again" } },
] as const;
export type SecretId = (typeof SECRETS)[number]["id"];

/** the found list as stored, without repeats or names that no longer exist */
export function readFound(stored: string | null): SecretId[] {
  try {
    const list: unknown = JSON.parse(stored ?? "[]");
    return Array.isArray(list) ? SECRETS.map((secret) => secret.id).filter((id) => list.includes(id)) : [];
  } catch {
    return [];
  }
}

export const foundSecret = (id: SecretId) => window.dispatchEvent(new CustomEvent("secret", { detail: id }));

/** items whose words contain every word typed, in any order */
export function search<T extends { words: string }>(items: T[], query: string): T[] {
  const parts = query.toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter((item) => parts.every((part) => item.words.toLowerCase().includes(part)));
}

/** the next slide, stopping at the first and the last */
export const slideAfter = (at: number, step: number, count: number) => Math.max(0, Math.min(count - 1, at + step));

const TURNS = 1.25;

/** where a pulled piece is, k of the way (0 to 1) along a winding path from home to a hole at (dx, dy) from it */
export function spiral(k: number, dx: number, dy: number): [number, number] {
  // the line from the hole back to the piece, turning and shortening
  const turn = k * TURNS * Math.PI * 2;
  const left = (1 - k) ** 1.5;
  return [dx - (dx * Math.cos(turn) - dy * Math.sin(turn)) * left, dy - (dx * Math.sin(turn) + dy * Math.cos(turn)) * left];
}
