"use client";

import { useSyncExternalStore } from "react";
import { toEnglish } from "@/translations";

// the page's own lang attribute holds the choice, so screen readers and line breaking follow it too
const subscribe = (changed: () => void) => {
  window.addEventListener("lang-change", changed);
  return () => window.removeEventListener("lang-change", changed);
};
export const isEnglish = () => document.documentElement.lang === "en";

export function setEnglish(english: boolean) {
  document.documentElement.lang = english ? "en" : "th";
  localStorage.setItem("lang", english ? "en" : "th");
  window.dispatchEvent(new Event("lang-change"));
}

/** whether English is chosen, and `t` to put a Thai text into the chosen language */
export function useLang() {
  const english = useSyncExternalStore(subscribe, isEnglish, () => false);
  return { english, t: (text: string) => (english ? toEnglish(text) : text) };
}
