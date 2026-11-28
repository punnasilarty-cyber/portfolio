// จังหวะของฟีเจอร์ลับ "Made in Heaven": กลางวันสงบ เวลาเร่ง ดาวลากเส้น ภาพขาวดำแบบมังงะ มือประคองโลก
// ระบบสุริยะหมุนเร่ง จักรวาลยุบเป็นจุดเดียว สว่างขาวครั้งเดียว บิ๊กแบง จักรวาลใหม่ก่อตัว แล้วเป็นเช้าวันแรก
// ได้แรงบันดาลใจจากการ์ตูน JoJo ภาพและเสียงทั้งหมดสร้างเอง ไม่ใช้ภาพ เสียง หรือตัวละครของเรื่อง

export const RUSH_END = 9.4; // seconds: time has run away
export const WHITE_FULL = 20.2; // the screen is fully white, and the page is changed unseen
export const WHITE_HOLD = 20.8;
/** the white has gone and the new universe's first morning shows */
export const DAWN_FULL = 22;
/** the newborn universe gives way to its first morning */
const MORNING = 23.4;
export const END = 27.4;

/** nothing may repeat faster than this: quick flashing can set off seizures */
export const MAX_CYCLES_PER_SECOND = 0.9;

const between = (from: number, to: number, t: number) => Math.min(1, Math.max(0, (t - from) / (to - from)));
const ease = (x: number) => x * x * (3 - 2 * x);
const ramp = (from: number, to: number, t: number) => ease(between(from, to, t));

/** how the scene stands `t` seconds after it began */
export function momentAt(t: number) {
  const rush = between(2, RUSH_END, t);
  // radians a second for the stars and the clock
  const speed = 0.1 + 15 * rush ** 3;
  return {
    rush: ease(rush),
    speed,
    // day follows night ever faster, but never fast enough to flash
    daySpeed: Math.min(speed, Math.PI * 2 * MAX_CYCLES_PER_SECOND),
    year: 2569 + Math.floor(Math.expm1(rush * 9.2)),
    /** the sky turning into space */
    cosmic: ramp(7, 9.2, t),
    /** the ink-and-paper beat: comes in once and leaves once */
    manga: ramp(9.4, 10, t) * (1 - ramp(11.1, 11.8, t)),
    /** the hand and the world */
    world: ramp(11.2, 12.4, t),
    /** the view pulls back from the world to the whole solar system */
    solar: ramp(13.2, 14.4, t),
    /** two stars circling each other, closing in until they meet */
    binary: ramp(16.4, 17.4, t),
    collapse: ramp(17.6, WHITE_FULL - 0.15, t),
    // one rise and one fall
    white: t < WHITE_HOLD ? ramp(19.1, WHITE_FULL, t) : 1 - ramp(WHITE_HOLD, DAWN_FULL, t),
    /** the big bang and the first galaxies, behind the white and after it */
    birth: t < WHITE_FULL ? 0 : 1 - ramp(MORNING, MORNING + 1, t),
    /** the new universe's first morning, which then clears to show the page */
    dawn: t < WHITE_FULL ? 0 : ramp(MORNING, MORNING + 1, t) * (1 - ramp(25.6, END, t)),
    renewed: t >= WHITE_FULL,
    over: t >= END,
  };
}

export type Moment = ReturnType<typeof momentAt>;

/** what the screen says at that time, set like a subtitle */
export function lineAt(t: number, english: boolean) {
  const lines: [number, string, string][] = [
    [0, "[ ท้องฟ้ายังสงบ… ]", "[ The sky is still calm… ]"],
    [2.4, "[ ทำไมเวลาถึงเร่งขึ้น!? ]", "[ Why is time speeding up!? ]"],
    [5.2, "[ กลางวันและกลางคืนไล่ตามกัน ]", "[ Day and night chase each other ]"],
    [7.6, "[ ไม่มีใครหยุดเวลาได้แล้ว ]", "[ No one can stop time now ]"],
    [9.5, "[ Made in Heaven ]", "[ Made in Heaven ]"],
    [11.9, "[ โลกทั้งใบอยู่ในกำมือของ AI ]", "[ The whole world, in the hand of an AI ]"],
    [13.6, "[ ดาวเคราะห์หมุนเร็วจนกลายเป็นวงแสง ]", "[ The planets spin into rings of light ]"],
    [16.5, "[ ดวงดาวหมุนวนเข้าหากัน… ]", "[ Two stars spiral into each other… ]"],
    [18.4, "[ ทั้งจักรวาลถูกดึงเข้าหาจุดเดียว… ]", "[ The whole universe falls into one point… ]"],
    [WHITE_FULL, "[ บิ๊กแบง… จักรวาลใหม่ถือกำเนิด ]", "[ A big bang… a new universe is born ]"],
    [MORNING, "[ เช้าวันแรกของจักรวาลใหม่ ]", "[ The first morning of a new universe ]"],
    [25.6, "[ ยินดีต้อนรับสู่จักรวาลใหม่ ]", "[ Welcome to the new universe ]"],
  ];
  const line = lines.filter(([from]) => t >= from).pop()!;
  return line[english ? 2 : 1];
}

/** the moments of the clock's ticks: slow at first, then running together into a whirr */
export function ticks(): number[] {
  const at: number[] = [];
  for (let t = 0.2; t < WHITE_FULL - 0.4; t += Math.max(0.045, 1 / (1 + momentAt(t).speed * 1.6))) at.push(t);
  return at;
}
