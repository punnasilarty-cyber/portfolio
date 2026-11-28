"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useLang } from "@/i18n";
import { isTheme, nextTheme, setTheme, THEME_NAMES, type Theme } from "@/theme";

const subscribe = (changed: () => void) => {
  window.addEventListener("theme-change", changed);
  return () => window.removeEventListener("theme-change", changed);
};
const current = (): Theme => {
  const chosen = document.documentElement.dataset.theme;
  return isTheme(chosen) ? chosen : "red";
};

/** each press takes the next accent colour, and the choice is remembered */
export function ThemeToggle() {
  const { english } = useLang();
  const theme = useSyncExternalStore(subscribe, current, (): Theme => "red");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (isTheme(saved)) setTheme(saved);
  }, []);

  const name = THEME_NAMES[theme][english ? "en" : "th"];
  const label = english ? `Theme colour: ${name}. Press to change` : `สีธีม: ${name} กดเพื่อเปลี่ยน`;
  return (
    <button type="button" onClick={() => setTheme(nextTheme(theme))} aria-label={label} title={label} className="theme-toggle">
      <span aria-hidden="true" />
    </button>
  );
}
