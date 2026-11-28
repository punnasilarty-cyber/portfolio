// จังหวะของฟีเจอร์ลับ "Made in Heaven": เวลาเร่งขึ้นเรื่อยๆ สว่างขาวครั้งเดียว แล้วเป็นจักรวาลใหม่
// ได้แรงบันดาลใจจากการ์ตูน JoJo ภาพทั้งหมดวาดเอง ไม่ใช้ภาพหรือเสียงของเรื่อง

export const RUSH_END = 8.5; // seconds: time has run away
export const WHITE_FULL = 9.8; // the screen is fully white, and the page is changed unseen
export const WHITE_HOLD = 10.4;
export const END = 12.2;

/** nothing may repeat faster than this: quick flashing can set off seizures */
export const MAX_CYCLES_PER_SECOND = 1.2;

const between = (from: number, to: number, t: number) => Math.min(1, Math.max(0, (t - from) / (to - from)));
const ease = (x: number) => x * x * (3 - 2 * x);

/** how the scene stands `t` seconds after it began */
export function momentAt(t: number) {
  const rush = between(1.2, RUSH_END, t);
  // radians a second for the stars and the clock
  const speed = 0.12 + 16 * rush ** 3;
  return {
    speed,
    // day follows night ever faster, but never fast enough to flash
    daySpeed: Math.min(speed, Math.PI * 2 * MAX_CYCLES_PER_SECOND),
    year: 2569 + Math.floor(Math.expm1(rush * 9)),
    // one rise and one fall
    white: t < WHITE_HOLD ? ease(between(RUSH_END - 0.8, WHITE_FULL, t)) : 1 - ease(between(WHITE_HOLD, END, t)),
    renewed: t >= WHITE_FULL,
    over: t >= END,
  };
}

/** what the screen says at that time */
export function lineAt(t: number, english: boolean) {
  const lines: [number, string, string][] = [
    [0, "เวลาเริ่มเร่งขึ้น…", "Time begins to quicken…"],
    [3.4, "กลางวันและกลางคืนไล่ตามกัน", "Day and night chase each other"],
    [6.2, "เร็วจนจักรวาลตามไม่ทัน", "Faster than the universe can follow"],
    [WHITE_FULL, "ยินดีต้อนรับสู่จักรวาลใหม่", "Welcome to the new universe"],
  ];
  const line = lines.filter(([from]) => t >= from).pop()!;
  return line[english ? 2 : 1];
}
