// จังหวะของ “พลังทำลายล้าง”: คลื่นแผ่จากกลางจอ ของแตกเป็นผง ลอยค้าง แล้วรวมกลับ

export const WAVE = 0.55; // seconds for the wave to cross the screen
export const BURST = 1; // seconds a grain takes to fly out
export const RETURN_AT = 2.5; // when the grains turn for home
export const BACK = 1.2;
export const BLAST_LASTS = RETURN_AT + BACK;

const clamp = (v: number) => Math.min(1, Math.max(0, v));

/**
 * How far a grain is from home at time t after firing, 0 (home) to 1 (its farthest), for one that the wave
 * reaches after `delay` seconds.
 */
export function spread(t: number, delay: number) {
  if (t >= RETURN_AT) {
    const k = clamp((t - RETURN_AT) / BACK);
    const out = 1 - (1 - clamp((RETURN_AT - delay) / BURST)) ** 3;
    // gathers slowly, then snaps into place
    return out * (1 - k * k * (3 - 2 * k));
  }
  return 1 - (1 - clamp((t - delay) / BURST)) ** 3;
}

/** how long the charge takes to fill */
export const CHARGE = 1.5;
export const power = (held: number) => 0.35 + 0.65 * clamp(held / CHARGE);
