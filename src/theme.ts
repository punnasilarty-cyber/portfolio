// สีธีมของเว็บ ค่าสีของแต่ละธีมอยู่ใน globals.css
export const THEMES = ["red", "school", "blue"] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_NAMES: Record<Theme, { th: string; en: string }> = {
  red: { th: "สีแดง", en: "Red" },
  school: { th: "สีโรงเรียนเขียว–เหลือง", en: "School green and yellow" },
  blue: { th: "สีฟ้า", en: "Blue" },
};

export const isTheme = (value: unknown): value is Theme => THEMES.includes(value as Theme);
export const nextTheme = (theme: Theme) => THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("theme", theme);
  window.dispatchEvent(new Event("theme-change"));
}
