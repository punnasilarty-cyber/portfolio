import { useEffect, useMemo, useState } from "react";
import { Student } from "@/components/Student";
import { openFeature } from "@/features";
import { useLang } from "@/i18n";
import { reach, yearAt, yearsOf } from "@/journey";
import { useSite } from "@/site-store";
import { englishGrade } from "@/translations";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const STATUS = { past: "เรียนจบแล้ว", now: "กำลังเรียน", ahead: "ยังมาไม่ถึง (คาดว่า)" };
const calm = () => !!document.querySelector<HTMLInputElement>("#calm")?.checked;

/** how far down the window a stage card has to come to count as being read; lower on narrow screens, where the panel itself covers the upper half */
const readingLine = () => window.innerHeight * (window.innerWidth < 900 ? 0.8 : 0.6);

/** brings a stage's card to the reading line, so the journey shows its first year */
function goToStage(stage: number) {
  const card = document.querySelectorAll(".edu-stop")[stage]?.getBoundingClientRect();
  if (!card) return;
  window.scrollBy({ top: card.top - readingLine() + card.height * 0.12, behavior: calm() ? "instant" : "smooth" });
}

/** brings the work that shows a skill into view and lights it for a moment; its section when the card was renamed */
function goToWork(title: string) {
  const heading = Array.from(document.querySelectorAll("#is2 li h3")).find((each) => each.textContent === title);
  const card = heading?.closest("li");
  const behavior = calm() ? "instant" : "smooth";
  if (!card) return document.getElementById("is2")?.scrollIntoView({ behavior });
  card.scrollIntoView({ behavior, block: "center" });
  card.classList.add("is-sought");
  setTimeout(() => card.classList.remove("is-sought"), 3000);
}

/** the learning journey: each stage hands on to the next, down to the skills of today, their proof, and the goal */
export function LearningRoute({ onStage }: { /** told which stage card the journey is at */ onStage: (stage: number) => void }) {
  const { education, learning } = useSite();
  const years = useMemo(() => yearsOf(education), [education]);
  const { english, t } = useLang();
  const [at, setStep] = useState(0);
  // the student walks only while the page is moving
  const [walking, setWalking] = useState(false);
  // the list may have become shorter in the editor
  const step = Math.min(at, years.length - 1);
  const entry = years[step];
  const stage = education[entry.stage];
  const next = education[entry.stage + 1];
  const color = stage.schoolColors?.[1]?.hex ?? "#f87171";
  const year = english ? entry.year - 543 : entry.year;
  const gradeOf = (grade: string) => (english ? englishGrade(grade) : grade);
  const grade = gradeOf(entry.grade);
  const school = (name: string) => t(name).replace("โรงเรียน", "").replace(" School", "");

  useEffect(() => onStage(entry.stage), [entry.stage, onStage]);

  // the journey follows the reader down the stage cards
  useEffect(() => {
    let frame = 0;
    let rest: ReturnType<typeof setTimeout> | undefined;
    const read = () => {
      frame = 0;
      const cards = Array.from(document.querySelectorAll(".edu-stop"), (card) => card.getBoundingClientRect());
      setStep(yearAt(cards, readingLine(), years));
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
  }, [years]);

  const nextGrade = next && gradeOf(years.find((item) => item.stage === entry.stage + 1)!.grade);

  return (
    <div className="edu-route-view" style={{ "--a": color } as React.CSSProperties}>
      <ol className="edu-path" aria-label={english ? "The learning path" : "เส้นทางการเรียนรู้"} style={{ "--reach": reach(years, step, education.length), "--stops": education.length + 1 } as React.CSSProperties}>
        {education.map((item, i) => {
          const grades = years.filter((each) => each.stage === i);
          return (
            <li key={`${i} ${item.level}`} className={i === entry.stage ? "is-here" : i < entry.stage ? "is-done" : ""}>
              <button type="button" aria-current={i === entry.stage ? "step" : undefined} onClick={() => goToStage(i)}>
                <span>
                  {/* eslint-disable-next-line @next/next/no-img-element -- a static export serves images as they are */}
                  {item.logo && <img src={base + item.logo} alt="" />}
                </span>
                <b>
                  {gradeOf(grades[0].grade)}–{gradeOf(grades.at(-1)!.grade)}
                </b>
                <small>{school(item.school)}</small>
              </button>
            </li>
          );
        })}
        <li className="edu-goal-stop">
          <div>
            <span aria-hidden="true">★</span>
            <b>{english ? "Goal" : "เป้าหมาย"}</b>
          </div>
        </li>
      </ol>

      <div className="edu-journey">
        <Student step={step} stage={entry.stage} color={color} walking={walking} cheer={stage.school !== education[0].school} />
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

      {/* what this stage leads to: the next one, or, today, the skills with their proof */}
      {stage.current ? (
        <div className="edu-skills">
          {learning.interests && (
            <p>
              <b>{english ? "Interested in" : "สนใจ"}</b> {t(learning.interests)}
            </p>
          )}
          <ul>
            {learning.skills.map((skill, i) => {
              const { work } = skill;
              return (
                <li key={`${i} ${skill.name}`}>
                  <button type="button" disabled={!work} onClick={() => (work === "xray" ? openFeature("xray") : goToWork(t(work!)))}>
                    <b>{t(skill.name)}</b>
                    <small>
                      {t(skill.proof)} {work && <span aria-hidden="true">→</span>}
                    </small>
                  </button>
                </li>
              );
            })}
          </ul>
          {learning.goal && (
            <p className="edu-aim">
              <b>★ {english ? "Heading for" : "มุ่งสู่"}</b> {t(learning.goal)}
            </p>
          )}
        </div>
      ) : (
        next && (
          <button type="button" className="edu-next" onClick={() => goToStage(entry.stage + 1)}>
            <b>{english ? "Next step" : "ก้าวต่อไป"}</b>
            <span>
              {nextGrade} · {next.school === stage.school ? (english ? "same school" : "เรียนต่อที่เดิม") : english ? `move to ${t(next.school)}` : `ย้ายมา${next.school}`}
              {next.program && ` · ${t(next.program)}`}
              {next.why && ` · ${english ? "because " : "เพราะ"}${t(next.why)}`}
            </span>
            <span aria-hidden="true">↓</span>
          </button>
        )
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
