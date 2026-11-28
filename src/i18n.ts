"use client";

import { useSyncExternalStore } from "react";
import { toEnglish } from "@/translations";

// the owner's own translations, saved from the editor; they win over the built-in ones
let own: Record<string, string> = {};
let edition = 0;

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

export function setOwnEnglish(translations: Record<string, string>) {
  own = translations;
  edition++;
  window.dispatchEvent(new Event("lang-change"));
}

/** the English for a text whatever language is showing, or the text itself */
export const englishOf = (text: string) => toEnglish(text, own);

/** whether English is chosen, and `t` to put a Thai text into the chosen language */
export function useLang() {
  // one value that changes with the language or the translations, so both redraw the text
  const state = useSyncExternalStore(subscribe, () => `${isEnglish() ? "en" : "th"} ${edition}`, () => "th 0");
  const english = state.startsWith("en");
  return { english, t: (text: string) => (english ? englishOf(text) : text) };
}
