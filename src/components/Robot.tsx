"use client";

import { useEffect, useState } from "react";
import { RobotArt } from "@/components/RobotArt";
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
        <RobotArt up={at === "contact"} />
      </button>
    </div>
  );
}
