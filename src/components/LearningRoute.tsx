import { useEffect, useState } from "react";
import { Student } from "@/components/Student";
import { education, type Work } from "@/content";
import { useLang } from "@/i18n";
import { yearAt, yearsOf } from "@/journey";
import { MAP_HEIGHT, MAP_WIDTH, PINS, PROVINCE, ROAD, ROAD_KM } from "@/map-data";
import { englishGrade } from "@/translations";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const years = yearsOf(education);
const STATUS = { past: "เรียนจบแล้ว", now: "กำลังเรียน", ahead: "ยังมาไม่ถึง (คาดว่า)" };

/** the learning journey: a made-up student moves through the school years along the real road between the schools */
export function LearningRoute({ project }: { project?: Work }) {
  // one pin per school, in the order first reached
  const pins = education.filter((stop, i) => education.findIndex((other) => other.school === stop.school) === i);
  const { english, t } = useLang();
  const [step, setStep] = useState(0);
  // the student walks only while the page is moving
  const [walking, setWalking] = useState(false);
  const entry = years[step];
  const stage = education[entry.stage];
  const color = stage.schoolColors?.[1]?.hex ?? "#f87171";
  const atSecondSchool = stage.school !== education[0].school;
  const year = english ? entry.year - 543 : entry.year;
  const grade = english ? englishGrade(entry.grade) : entry.grade;

  // the journey follows the reader down the stage cards
  useEffect(() => {
    let frame = 0;
    let rest: ReturnType<typeof setTimeout> | undefined;
    const read = () => {
      frame = 0;
      const cards = Array.from(document.querySelectorAll(".edu-stop"), (card) => card.getBoundingClientRect());
      // lower on narrow screens, where the panel itself covers the upper half
      const line = window.innerHeight * (window.innerWidth < 900 ? 0.8 : 0.6);
      setStep(yearAt(cards, line, years));
    };
    const moved = () => {
      frame ||= requestAnimationFrame(read);
      setWalking(true);
      clearTimeout(rest);
      rest = setTimeout(() => setWalking(false), 250);
    };
    read();
    window.addEventListener("scroll", moved, { passive: true });
    return () => {
      window.removeEventListener("scroll", moved);
      cancelAnimationFrame(frame);
      clearTimeout(rest);
    };
  }, []);

  return (
    <div className="edu-route-view">
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        role="img"
        aria-label={english ? `Map of Surin Province: the ${ROAD_KM} km road from ${pins.map((pin) => t(pin.school)).join(" to ")}` : `แผนที่จังหวัดสุรินทร์ เส้นทางจาก${pins.map((pin) => pin.school).join(" ไป")} ${ROAD_KM} กิโลเมตร`}
        className="edu-map-art"
      >
        <path d={PROVINCE} className="edu-province" />
        <text x={MAP_WIDTH / 2} y="110" textAnchor="middle" className="edu-map-label">
          {t("จังหวัดสุรินทร์")}
        </text>
        <path d={ROAD} className="edu-road-under" />
        {/* the road lights up once the journey has moved to the second school */}
        <path d={ROAD} className="edu-road" pathLength={1} style={{ strokeDashoffset: atSecondSchool ? 0 : 1 }} />
        {pins.map((pin) => {
          const [x, y] = PINS[pin.school];
          const ring = pin.schoolColors?.[1]?.hex ?? "#f87171";
          const id = `edu-clip-${x}`;
          return (
            <g key={pin.school} transform={`translate(${x} ${y})`}>
              {pin.school === stage.school && <circle r="23" fill={ring} opacity="0.3" />}
              <circle r="15" fill="#fff" stroke={ring} strokeWidth="3" />
              <clipPath id={id}>
                <circle r="13.5" />
              </clipPath>
              <image href={base + pin.logo} x="-13.5" y="-13.5" width="27" height="27" clipPath={`url(#${id})`} />
              <text y="-24" textAnchor="middle" className="edu-pin-label">
                {t(pin.school).replace("โรงเรียน", "").replace(" School", "")}
              </text>
            </g>
          );
        })}
        {/* the traveller rides the road from the first school to the second */}
        <g className="edu-traveller" style={{ offsetPath: `path("${ROAD}")`, offsetDistance: atSecondSchool ? "100%" : "0%" }}>
          <circle cy="22" r="9" fill="#fff" stroke="#dc2626" strokeWidth="2.5" />
          <text y="26" textAnchor="middle" fontSize="11" fontWeight="800" fill="#7f1d1d">
            {english ? `${grade[0]}${grade.slice(-1)}` : grade.replace(".", "")}
          </text>
        </g>
      </svg>
      <p className="text-center text-xs text-[var(--muted)]">{english ? `About ${ROAD_KM.toFixed(1)} km by road between the two schools` : `ระยะทางตามถนนระหว่างสองโรงเรียนราว ${ROAD_KM.toFixed(1)} กม.`}</p>

      <div className="edu-journey" style={{ "--a": color } as React.CSSProperties}>
        <Student step={step} stage={entry.stage} color={color} walking={walking} cheer={atSecondSchool} />
        <div className="min-w-0">
          <p className="edu-year">
            {year} <span>{grade}</span>
          </p>
          <p className={`edu-status is-${entry.when}`}>{t(STATUS[entry.when])}</p>
          <p className="font-bold">{t(stage.school)}</p>
          <p className="text-xs text-[var(--muted)]">
            {english ? `Year ${step + 1} of ${years.length} on the learning journey` : `ปีที่ ${step + 1} จาก ${years.length} บนเส้นทางการเรียน`}
          </p>
          {stage.program && <p className="text-sm text-[#e4e4e7]">{t(stage.program)}</p>}
          {/* the owner keeps the คำขวัญ on the stage card only */}
          {stage.mottos.filter((motto) => motto.label !== "คำขวัญ").map((motto) => (
            <p key={motto.text} className="text-xs text-[#d4d4d8]">
              {motto.label && t(motto.label)} {t(motto.text)}
            </p>
          ))}
        </div>
      </div>

      {/* the IS project belongs to the stage being studied now */}
      {stage.current && project && (
        <a href="#is2" className="edu-project">
          {/* eslint-disable-next-line @next/next/no-img-element -- a static export serves images as they are */}
          <img src={base + project.image} alt="" />
          <span>
            <b>{t("ผลงาน IS ในช่วง ม.4")}</b>
            <small>{t(project.title)}</small>
            <em>{t("ดูผลงานและรายงานในหมวด IS2 →")}</em>
          </span>
        </a>
      )}

      <div className="edu-progress" role="progressbar" aria-label={t("ความคืบหน้าบนเส้นทางการเรียน")} aria-valuemin={1} aria-valuemax={years.length} aria-valuenow={step + 1} aria-valuetext={`${year} ${grade}`}>
        {years.map((item, i) => (
          <span key={item.year} className={i <= step ? "is-done" : ""} />
        ))}
      </div>
      <p className="text-center text-xs text-[#e4e4e7]">{t("เลื่อนหน้าจอเพื่อเดินทางตามปีการศึกษา")}</p>
      <p className="text-center text-[11px] text-[var(--muted)]">{t("ตัวละครสมมติ ไม่ใช่ภาพบุคคลจริง")}</p>
    </div>
  );
}
