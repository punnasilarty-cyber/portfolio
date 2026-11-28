"use client";

import { Fragment, useEffect, useState } from "react";
import type { Line } from "@/xray-code";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type Sources = Record<string, { length: number; blocks: Line[][] }>;
let kept: Promise<Sources> | null = null;
/** pieces of the parts' real source, cut at build time (scripts/sources.mjs) and fetched once */
const sources = () =>
  (kept ??= fetch(`${base}/xray-sources.json`).then((response) => {
    if (!response.ok) throw new Error(`${response.status}`);
    return response.json();
  })).catch((error) => {
    kept = null;
    throw error;
  });

/** a few of the lines that make a part, each explained beneath it; never the whole file */
export function XrayCode({ file, english }: { file: string; english: boolean }) {
  const say = (th: string, en: string) => (english ? en : th);
  const [all, setAll] = useState<Sources | "failed" | null>(null);

  useEffect(() => {
    sources().then(setAll, () => setAll("failed"));
  }, []);

  if (all === "failed") return <p className="xray-none">{say("โหลดโค้ดไม่สำเร็จ ลองเปิดแท็บนี้ใหม่", "The source could not be loaded")}</p>;
  const source = all?.[file];
  if (!source) return <p className="xray-none">{say("กำลังโหลดโค้ด…", "Loading the source…")}</p>;
  const { length, blocks } = source;
  if (!blocks.length) return <p className="xray-none">{say("ส่วนนี้ไม่มีโค้ดให้ดู", "No code is shown for this part")}</p>;
  const shown = blocks.reduce((sum, each) => sum + each.length, 0);
  return (
    <>
      <p className="xray-file">
        <code>{file}</code> · {say(`ตัวอย่าง ${shown} จาก ${length} บรรทัด`, `${shown} of ${length} lines, as a sample`)}
      </p>
      {blocks.map((block, i) => (
        <div key={`${file} ${i}`} className="xray-source">
          {block.map((line) => (
            <Fragment key={line.number}>
              <code className={line.note ? "is-noted" : ""}>
                <i>{line.number}</i>
                {line.text.slice(0, 400)}
              </code>
              {line.note && <p>↑ {line.note[english ? "en" : "th"]}</p>}
            </Fragment>
          ))}
        </div>
      ))}
    </>
  );
}
