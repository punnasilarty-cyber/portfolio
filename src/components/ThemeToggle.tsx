"use client";

import { useEffect, useSyncExternalStore, type MouseEvent } from "react";
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

/** the new colour spreads in a circle from the button, where the browser can and animation is not stopped */
function spread(theme: Theme, from: Element) {
  const calm = document.querySelector<HTMLInputElement>("#calm")?.checked;
  if (calm || !document.startViewTransition) return setTheme(theme);
  const box = from.getBoundingClientRect();
  const [x, y] = [box.x + box.width / 2, box.y + box.height / 2];
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  document
    .startViewTransition(() => setTheme(theme))
    .ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" },
      );
    })
    // a skipped transition has already changed the colour
    .catch(() => {});
}

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
    <button type="button" onClick={(event: MouseEvent<HTMLButtonElement>) => spread(nextTheme(theme), event.currentTarget)} aria-label={label} title={label} className="theme-toggle">
      <span aria-hidden="true" />
    </button>
  );
}
