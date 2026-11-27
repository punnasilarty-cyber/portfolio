import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LearningRoute } from "@/components/LearningRoute";
import { SchoolScene } from "@/components/SchoolScene";
import { education } from "@/content";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const VIEWS = [
  { id: "model", label: "โมเดลโรงเรียน", note: "ผังจำลองจากแผนผังโรงเรียน ภาพมุมสูง และภาพถ่ายดาวเทียม ย่อส่วนและมีบางจุดเป็นการประมาณ" },
  { id: "route", label: "เส้นทางการเรียนรู้", note: "แผนที่ © OpenStreetMap contributors · เส้นทาง OSRM" },
] as const;

/** where the schooling happened: school models or the learning route, then a card per stage (see motion.ts) */
export function Education() {
  // one scene per school, in the order first reached
  const schools = education.filter((stop, i) => education.findIndex((other) => other.school === stop.school) === i);

  const [view, setView] = useState<(typeof VIEWS)[number]["id"]>("model");
  // the two views differ in height, so the scroll positions need measuring again
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [view]);

  return (
    <div className={view === "route" ? "edu edu--route" : "edu"}>
      <figure className="edu-stage-wrap">
        <div role="group" aria-label="เลือกมุมมอง" className="edu-tabs">
          {VIEWS.map(({ id, label }) => (
            <button key={id} type="button" aria-pressed={view === id} onClick={() => setView(id)}>
              {label}
            </button>
          ))}
        </div>
        <div className="edu-stage" hidden={view !== "model"}>
          {schools.map((stop) => (
            <div key={stop.school} className="edu-scene" data-school={stop.school}>
              <SchoolScene
                school={stop.school}
                logo={stop.logo}
                wall={stop.schoolColors?.[0]?.hex ?? "#7f1d1d"}
                trim={stop.schoolColors?.[1]?.hex ?? "#f87171"}
              />
              <p className="edu-scene-name">{stop.school}</p>
            </div>
          ))}
        </div>
        {/* unmounted while away, so its drawing plays again on every visit */}
        {view === "route" && <LearningRoute />}
        <figcaption className="mt-2 text-center text-[11px] text-[var(--muted)]">{VIEWS.find(({ id }) => id === view)!.note}</figcaption>
      </figure>

      <div className="edu-list">
        {education.map((stop, i) => (
          // the school's colours paint the card
          <article
            key={stop.level}
            className="edu-stop"
            data-school={stop.school}
            style={{ "--a": stop.schoolColors?.[1]?.hex ?? "#f87171", "--b": stop.schoolColors?.[0]?.hex ?? "#7f1d1d" } as React.CSSProperties}
          >
            <div className="edu-card solx-card">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="edu-step">{String(i + 1).padStart(2, "0")}</span>
                <span className="edu-level">{stop.level}</span>
                {stop.current && <span className="edu-now">กำลังศึกษา</span>}
              </p>
              {stop.program && <p className="edu-program">{stop.program}</p>}
              <p className="mt-1 text-sm text-[var(--muted)]">ปีการศึกษา {stop.period}</p>
              <div className="mt-4 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- a static export serves images as they are */}
                <img src={base + stop.logo} alt={`ตรา${stop.school}`} className="edu-logo" />
                <h3 className="text-xl font-bold sm:text-2xl">{stop.school}</h3>
              </div>
              <ul className="mt-4 space-y-1.5 text-sm">
                {stop.mottos.map((motto) => (
                  <li key={motto.text} className="edu-fact">
                    {motto.label} {motto.text}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <a href={stop.website} target="_blank" rel="noopener noreferrer" className="solx-btn-ghost px-4 py-2 text-sm">
                  เว็บไซต์โรงเรียน <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
