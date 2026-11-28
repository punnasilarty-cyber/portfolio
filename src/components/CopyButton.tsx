"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/i18n";

/** copies a handle that has no web address of its own */
export function CopyButton({ value }: { value: string }) {
  const { t } = useLang();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!message) return;
    const reset = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(reset);
  }, [message]);

  const copied = message === "คัดลอกแล้ว";

  return (
    <button
      type="button"
      onClick={() =>
        navigator.clipboard.writeText(value).then(
          () => setMessage("คัดลอกแล้ว"),
          () => setMessage("คัดลอกไม่ได้ กดค้างที่ชื่อแทน"),
        )
      }
      className={`solx-btn-ghost mt-2 justify-self-center px-4 py-1.5 text-xs ${copied ? "is-copied" : ""}`}
    >
      {copied && (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="copy-tick">
          <path d="m4 12.5 5 5L20 6.5" pathLength="1" />
        </svg>
      )}
      <span aria-live="polite">{t(message || "คัดลอก")}</span>
    </button>
  );
}
