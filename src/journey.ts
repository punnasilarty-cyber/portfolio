export type Stage = { level: string; period: string; current?: boolean };

export type Year = {
  /** ปีการศึกษา พ.ศ. */
  year: number;
  /** เช่น "ป.1" หรือ "ม.4" */
  grade: string;
  /** index of the schooling stage this year belongs to */
  stage: number;
  when: "past" | "now" | "ahead";
};

/**
 * One entry per school year, read from each stage's level ("…ปีที่ 1–6") and period ("2560 – 2565").
 * The current stage starts this year: its first year is now and the rest are still ahead.
 */
export function yearsOf(stages: Stage[]): Year[] {
  let now = Infinity;
  return stages.flatMap((stage, index) => {
    const grades = stage.level.match(/(\d)–(\d)/);
    const years = stage.period.match(/(\d{4})\D+(\d{4})/);
    if (!grades || !years) throw new Error(`cannot read the stage: ${stage.level} ${stage.period}`);
    const prefix = stage.level.startsWith("ประถม") ? "ป." : "ม.";
    if (stage.current) now = Number(years[1]);
    return Array.from({ length: Number(years[2]) - Number(years[1]) + 1 }, (_, i): Year => {
      const year = Number(years[1]) + i;
      return { year, grade: `${prefix}${Number(grades[1]) + i}`, stage: index, when: year < now ? "past" : year === now ? "now" : "ahead" };
    });
  });
}

/**
 * Which year the reader has scrolled to. `cards` are the stages' on-screen boxes in order; the card crossing the
 * reading `line` picks the stage, and how far through it the line is picks the year within that stage.
 */
export function yearAt(cards: { top: number; height: number }[], line: number, years: Year[]): number {
  const stage = cards.findLastIndex((card) => card.top <= line);
  if (stage < 0) return 0;
  const first = years.findIndex((entry) => entry.stage === stage);
  const count = years.filter((entry) => entry.stage === stage).length;
  const through = Math.min(1, (line - cards[stage].top) / cards[stage].height);
  return first + Math.min(count - 1, Math.floor(through * count));
}
