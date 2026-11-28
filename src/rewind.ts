// ลำดับเวลาของฉาก “ย้อนเวลา”: ถอยปีการศึกษาทีละช่วงจากปัจจุบันถึงปีแรก แล้วกรอกลับมา

export type Beat = {
  mode: "hold" | "back" | "forward" | "home";
  seconds: number;
  from: number;
  to: number;
  /** which stage of the schooling list is on show; null while the tape is rolling */
  stage: number | null;
};

const HOLD = 3;
const PER_YEAR = 0.22; // seconds of rolling for each year passed

/** `starts` are the first school years of the stages, in the order of the schooling list (oldest first) */
export function rewindBeats(starts: number[]): Beat[] {
  const beats: Beat[] = [];
  const last = starts.length - 1;
  if (last < 0) return beats;
  for (let i = last; i >= 0; i--) {
    if (i < last) beats.push({ mode: "back", seconds: Math.max(0.8, (starts[i + 1] - starts[i]) * PER_YEAR), from: starts[i + 1], to: starts[i], stage: null });
    beats.push({ mode: "hold", seconds: i === last ? 2 : HOLD, from: starts[i], to: starts[i], stage: i });
  }
  if (last > 0) beats.push({ mode: "forward", seconds: Math.max(1.2, (starts[last] - starts[0]) * PER_YEAR * 0.7), from: starts[0], to: starts[last], stage: null });
  beats.push({ mode: "home", seconds: 2.2, from: starts[last], to: starts[last], stage: last });
  return beats;
}

export const rewindLasts = (beats: Beat[]) => beats.reduce((sum, beat) => sum + beat.seconds, 0);

/** the beat playing at time t, and the year on the counter; the last beat stays when the time is up */
export function rewindAt(beats: Beat[], t: number) {
  let began = 0;
  let at = 0;
  while (at < beats.length - 1 && t >= began + beats[at].seconds) began += beats[at++].seconds;
  const beat = beats[at];
  const k = Math.min(1, Math.max(0, (t - began) / beat.seconds));
  // the tape speeds up and slows down
  const eased = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
  return { ...beat, year: Math.round(beat.from + (beat.to - beat.from) * eased) };
}
