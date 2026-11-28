"use client";

import { useEffect } from "react";
import { setEnglish, useLang } from "@/i18n";

/** switches the page between Thai and English, and remembers the choice */
export function LangToggle() {
  const { english } = useLang();

  useEffect(() => {
    if (localStorage.getItem("lang") === "en") setEnglish(true);
  }, []);

  // text of another length moves everything below it, so the scroll animations are measured again
  useEffect(() => {
    window.dispatchEvent(new Event("view-change"));
  }, [english]);

  return (
    <button type="button" onClick={() => setEnglish(!english)} lang={english ? "th" : "en"} aria-label={english ? "เปลี่ยนเป็นภาษาไทย" : "Switch to English"} className="lang-toggle">
      {english ? "ไทย" : "EN"}
    </button>
  );
}
