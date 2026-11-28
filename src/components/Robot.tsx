"use client";

import { useEffect, useState } from "react";
import { useSection } from "@/components/useSection";
import { useLang } from "@/i18n";

const SAY: Record<string, { th: string; en: string }> = {
  top: { th: "สวัสดีครับ กดผมเพื่อไปต่อ", en: "Hello! Press me to move on" },
  education: { th: "เส้นทางการเรียน ลองกดหมุดบนแผนที่", en: "My schools. Try the map pins" },
  is2: { th: "โครงงาน IS กด “รายละเอียด” ได้", en: "The IS project. Press “Details”" },
  activities: { th: "กิจกรรมของผม", en: "My activities" },
  certificates: { th: "เกียรติบัตร", en: "Certificates" },
  contact: { th: "ติดต่อผมได้ทางนี้ครับ", en: "You can reach me here" },
};
const IDS = Object.keys(SAY);
const SPEAK_MS = 4500;

/** a small robot in the corner: names the section being read, and takes the reader to the next one */
export function Robot() {
  const { english } = useLang();
  const at = useSection(IDS);
  const [away, setAway] = useState(false);
  // the section it has finished speaking about; the bubble shows again at a new one
  const [said, setSaid] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setSaid(at), SPEAK_MS);
    return () => clearTimeout(timer);
  }, [at]);

  if (away) return null;
  const next = IDS[(IDS.indexOf(at) + 1) % IDS.length];

  function go() {
    const calm = document.querySelector<HTMLInputElement>("#calm")?.checked;
    document.getElementById(next)?.scrollIntoView({ behavior: calm ? "instant" : "smooth" });
  }

  return (
    <div className={said === at ? "robot" : "robot is-speaking"} data-at={at}>
      <p aria-live="polite">{SAY[at][english ? "en" : "th"]}</p>
      <button type="button" onClick={() => setAway(true)} aria-label={english ? "Hide the helper" : "ซ่อนหุ่นยนต์ผู้ช่วย"} className="robot-close">
        ×
      </button>
      <button type="button" onClick={go} aria-label={english ? "Go to the next section" : "ไปหมวดถัดไป"} className="robot-body">
        {/* the arm points down the page, or back up from the last section */}
        <svg viewBox="0 0 64 72" aria-hidden="true" className={at === "contact" ? "is-up" : ""}>
          <path d="M32 12V5" stroke="#a1a1aa" strokeWidth="2.5" />
          <circle cx="32" cy="5" r="3.5" className="robot-lamp" />
          <rect x="12" y="12" width="40" height="29" rx="11" fill="#e4e4e7" />
          <rect x="17" y="18" width="30" height="17" rx="7" fill="#111318" />
          <g className="robot-eyes">
            <circle cx="25" cy="26.500" r="3.2" />
            <circle cx="39" cy="26.500" r="3.2" />
          </g>
          <rect x="19" y="44" width="26" height="19" rx="7" fill="#c9cad1" />
          <circle cx="32" cy="53.500" r="3.5" className="robot-lamp" />
          <path d="M45 48q8 1 9 9" fill="none" stroke="#c9cad1" strokeWidth="5" strokeLinecap="round" />
          <g className="robot-arm">
            <path d="M19 48Q9 52 9 63" fill="none" stroke="#c9cad1" strokeWidth="5" strokeLinecap="round" />
            <path d="M4.500 61 9 69l4.500-8z" className="robot-lamp" />
          </g>
          <path d="M25 63v6M39 63v6" stroke="#9a9ca6" strokeWidth="5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
