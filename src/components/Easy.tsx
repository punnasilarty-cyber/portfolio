"use client";

import { useEffect, useState } from "react";
import { keptEasy, setEasy, toggleEasy } from "@/easy";
import { onFeature } from "@/features";
import { useLang } from "@/i18n";

/** turns the easy-reading mode on and off, remembers it, and shows the way out while it is on */
export function Easy() {
  const { english } = useLang();
  const [on, setOn] = useState(false);
  useEffect(() => {
    const watch = new MutationObserver(() => setOn(document.documentElement.dataset.easy === "on"));
    watch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-easy"] });
    const stop = onFeature("easy", toggleEasy);
    if (keptEasy()) setEasy(true);
    return () => {
      watch.disconnect();
      stop();
    };
  }, []);
  return on ? (
    <button type="button" onClick={() => setEasy(false)} className="easy-off">
      {english ? "Leave easy reading" : "ออกจากโหมดอ่านง่าย"}
    </button>
  ) : null;
}
