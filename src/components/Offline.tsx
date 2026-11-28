"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useLang } from "@/i18n";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const watch = (changed: () => void) => {
  window.addEventListener("online", changed);
  window.addEventListener("offline", changed);
  return () => {
    window.removeEventListener("online", changed);
    window.removeEventListener("offline", changed);
  };
};

/** keeps a copy of the site on this device, and says at the foot of the page when it is ready */
export function Offline() {
  const { english } = useLang();
  const [ready, setReady] = useState(false);
  const online = useSyncExternalStore(watch, () => navigator.onLine, () => true);

  useEffect(() => {
    // the development server changes its files all the time, so it keeps no copy
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register(`${base}/sw.js`, { updateViaCache: "none" })
      .then(() => navigator.serviceWorker.ready)
      .then(() => setReady(true))
      .catch(() => {});
  }, []);

  return (
    <p role="status" className="mt-3">
      {!online
        ? english
          ? "No internet: showing the copy kept on this device"
          : "ไม่มีอินเทอร์เน็ต กำลังแสดงสำเนาที่เก็บไว้ในเครื่อง"
        : ready &&
          (english ? "✓ Works without internet on this device (except reading Word files)" : "✓ เครื่องนี้เปิดเว็บได้แม้ไม่มีเน็ต (ยกเว้นเปิดอ่านไฟล์ Word)")}
    </p>
  );
}
