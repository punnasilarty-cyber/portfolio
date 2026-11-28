"use client";

import { useState } from "react";
import { useLang } from "@/i18n";
import { uniqueNames, zip } from "@/zip";

/** fetches every file of a section and hands them over as one ZIP */
export function DownloadAll({ files, name }: { files: { name: string; url: string }[]; /** of the ZIP itself */ name: string }) {
  const { english } = useLang();
  const [done, setDone] = useState<number | "failed" | null>(null);
  const busy = typeof done === "number";

  async function download() {
    if (busy) return;
    setDone(0);
    try {
      const names = uniqueNames(files.map((file) => file.name));
      const packed: { name: string; data: Uint8Array }[] = [];
      // one at a time, so the count means something and a phone is not swamped
      for (const [i, file] of files.entries()) {
        const response = await fetch(file.url);
        if (!response.ok) throw new Error(`${response.status}`);
        packed.push({ name: names[i], data: new Uint8Array(await response.arrayBuffer()) });
        setDone(i + 1);
      }
      const address = URL.createObjectURL(new Blob([zip(packed)], { type: "application/zip" }));
      const link = document.createElement("a");
      link.href = address;
      link.download = name;
      link.click();
      // the browser needs the address a moment longer than the press
      setTimeout(() => URL.revokeObjectURL(address), 60000);
      setDone(null);
    } catch {
      setDone("failed");
    }
  }

  const label = busy
    ? english
      ? `Collecting files ${done}/${files.length}…`
      : `กำลังรวมไฟล์ ${done}/${files.length}…`
    : english
      ? `Download all ${files.length} files (ZIP)`
      : `ดาวน์โหลดทั้งชุด ${files.length} ไฟล์ (ZIP)`;
  return (
    <div className="download-all">
      <button type="button" onClick={download} aria-disabled={busy} className="solx-btn-ghost px-5 py-2 text-sm">
        <span aria-hidden="true">↓ </span>
        <span aria-live="polite">{label}</span>
      </button>
      {done === "failed" && <p role="alert">{english ? "Download failed. Please try again" : "ดาวน์โหลดไม่สำเร็จ ลองใหม่อีกครั้ง"}</p>}
    </div>
  );
}
