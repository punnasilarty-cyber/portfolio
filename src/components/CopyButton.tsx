"use client";

import { useEffect, useState } from "react";

/** copies a handle that has no web address of its own */
export function CopyButton({ value }: { value: string }) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!message) return;
    const reset = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(reset);
  }, [message]);

  return (
    <button
      type="button"
      onClick={() =>
        navigator.clipboard.writeText(value).then(
          () => setMessage("คัดลอกแล้ว"),
          () => setMessage("คัดลอกไม่ได้ กดค้างที่ชื่อแทน"),
        )
      }
      className="solx-btn-ghost mt-2 justify-self-center px-4 py-1.5 text-xs"
    >
      <span aria-live="polite">{message || "คัดลอก"}</span>
    </button>
  );
}
