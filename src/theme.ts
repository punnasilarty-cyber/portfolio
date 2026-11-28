// สีธีมของเว็บ ค่าสีของแต่ละธีมอยู่ใน globals.css
export const THEMES = ["red", "school", "blue"] as const;
/** "neon" is the prize of the hacker game: not in the round the colour button goes through */
export type Theme = (typeof THEMES)[number] | "neon";

export const THEME_NAMES: Record<Theme, { th: string; en: string }> = {
  red: { th: "สีแดง", en: "Red" },
  school: { th: "สีโรงเรียนเขียว–เหลือง", en: "School green and yellow" },
  blue: { th: "สีฟ้า", en: "Blue" },
  neon: { th: "นีออน (ธีมลับ)", en: "Neon (secret)" },
};

export const isTheme = (value: unknown): value is Theme => typeof value === "string" && Object.hasOwn(THEME_NAMES, value);
export const nextTheme = (theme: Theme) => THEMES[(THEMES.indexOf(theme as (typeof THEMES)[number]) + 1) % THEMES.length];

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("theme", theme);
  window.dispatchEvent(new Event("theme-change"));
}
