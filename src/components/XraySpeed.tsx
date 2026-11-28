"use client";

import { useEffect, useState } from "react";
import { GLOSSARY } from "@/xray-words";

const BEATS = 60; // half a second each: the last half minute

interface Live {
  frames: number[];
  longest: number;
  busy: number;
  shifts: number;
  changes: number;
  memory: number;
}

/** how the page is running right now, measured while this tab is open */
export function XraySpeed({ english }: { english: boolean }) {
  const say = (th: string, en: string) => (english ? en : th);
  const [live, setLive] = useState<Live>({ frames: [], longest: 0, busy: 0, shifts: 0, changes: 0, memory: 0 });
  // what loaded when, read once as the tab opens
  const [loads] = useState(() => {
    const files = (performance.getEntriesByType("resource") as PerformanceResourceTiming[]).sort((a, b) => a.startTime - b.startTime).slice(0, 24);
    const painted = performance.getEntriesByType("paint").find((entry) => entry.name === "first-contentful-paint")?.startTime ?? 0;
    return {
      painted,
      end: Math.max(1, ...files.map((file) => file.responseEnd)),
      files: files.map((file) => ({ name: decodeURIComponent(file.name.split("/").pop()!.split("?")[0]).slice(-30) || file.name, from: file.startTime, took: file.duration })),
    };
  });

  useEffect(() => {
    let frame = 0;
    let count = 0;
    let longest = 0;
    let last = performance.now();
    let since = last;
    let busy = 0;
    let shifts = 0;
    let changes = 0;
    const tick = (now: number) => {
      count++;
      longest = Math.max(longest, now - last);
      last = now;
      if (now - since >= 500) {
        const rate = Math.round((count * 1000) / (now - since));
        // only some browsers tell how much memory scripts hold
        const memory = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize ?? 0;
        const worst = Math.round(longest);
        const edits = Math.round((changes * 1000) / (now - since));
        setLive((before) => ({ frames: [...before.frames.slice(1 - BEATS), rate], longest: worst, busy, shifts, changes: edits, memory: Math.round(memory / 1048576) }));
        count = 0;
        longest = 0;
        changes = 0;
        since = now;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const watchers: { disconnect: () => void }[] = [];
    for (const [type, add] of [
      ["longtask", () => busy++],
      ["layout-shift", (entry: PerformanceEntry) => (shifts += (entry as unknown as { value: number }).value)],
    ] as const) {
      if (!PerformanceObserver.supportedEntryTypes?.includes(type)) continue;
      const watcher = new PerformanceObserver((list) => list.getEntries().forEach(add));
      watcher.observe({ type });
      watchers.push(watcher);
    }
    // the lens redraws itself constantly: its own changes are not the page's
    const edits = new MutationObserver((records) => {
      changes += records.filter((record) => !(record.target instanceof Element ? record.target : record.target.parentElement)?.closest(".xray")).length;
    });
    edits.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
    return () => {
      cancelAnimationFrame(frame);
      edits.disconnect();
      watchers.forEach((watcher) => watcher.disconnect());
    };
  }, []);

  const now = live.frames.at(-1) ?? 0;
  const top = Math.max(60, ...live.frames);
  const rows: [string, string | number][] = [
    [say("เฟรมที่ช้าที่สุดในครึ่งวินาทีนี้", "Slowest frame this half second"), `${live.longest} ms`],
    [say("งานที่ค้างนานเกิน 50 ms", "Tasks over 50 ms"), live.busy],
    [say("การเปลี่ยนแปลงของหน้า / วินาที", "Page changes a second"), live.changes],
    [say("ผังหน้าขยับเอง (CLS)", "Layout shift (CLS)"), live.shifts.toFixed(3)],
    [say("หน่วยความจำสคริปต์", "Script memory"), live.memory ? `${live.memory} MB` : say("เบราว์เซอร์นี้ไม่บอก", "not told by this browser")],
    [say("เนื้อหาแรกขึ้นจอใน", "First content painted at"), loads.painted ? `${Math.round(loads.painted)} ms` : "—"],
  ];
  return (
    <>
      <p className="xray-fps">
        <b>{now || "…"}</b> FPS
      </p>
      <svg viewBox={`0 0 ${BEATS} 40`} preserveAspectRatio="none" className="xray-graph" aria-hidden="true">
        <line x1="0" x2={BEATS} y1={40 - (60 / top) * 38} y2={40 - (60 / top) * 38} />
        <polyline points={live.frames.map((rate, i) => `${BEATS - live.frames.length + i + 0.5},${40 - (rate / top) * 38}`).join(" ")} />
      </svg>
      <p className="xray-file">{say("ครึ่งนาทีล่าสุด เส้นประคือ 60 FPS รวมภาระของแว่นเองด้วย", "The last half minute; the dashed line is 60 FPS. The lens's own work is included")}</p>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <h4>{say("ลำดับการโหลดไฟล์", "Order of loading")}</h4>
      <ul className="xray-fall">
        {loads.files.map((file, i) => (
          <li key={i}>
            <span>{file.name}</span>
            <i style={{ marginLeft: `${(file.from / loads.end) * 100}%`, width: `${Math.max(1, (file.took / loads.end) * 100)}%` }} />
            <b>{Math.round(file.took)} ms</b>
          </li>
        ))}
      </ul>
    </>
  );
}

export function XrayGlossary({ english }: { english: boolean }) {
  return (
    <details className="xray-glossary">
      <summary>{english ? "Words used here" : "คำศัพท์ที่ใช้ในแว่น"}</summary>
      <dl>
        {GLOSSARY.map((entry) => (
          <div key={entry.word}>
            <dt>{entry.word}</dt>
            <dd>{entry[english ? "en" : "th"]}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
