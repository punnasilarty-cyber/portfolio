// จังหวะของฟีเจอร์ลับ "Made in Heaven" ยาว 1 นาที: กลางวันสงบ ฤดูกาลไหลผ่าน เมืองอนาคต ซากเมืองและยุคน้ำแข็ง
// ภาพขาวดำแบบมังงะ มือประคองโลก ระบบสุริยะ กาแล็กซีชนกัน ดวงอาทิตย์เป็นดาวยักษ์แดง ดาวคู่กลายเป็นหลุมดำ
// สว่างขาวครั้งเดียว บิ๊กแบง ดาวดวงแรก แล้วเป็นเช้าวันแรกของจักรวาลใหม่ ตัวเลขปีเพิ่มขึ้นตลอดไม่หยุด
// ได้แรงบันดาลใจจากการ์ตูน JoJo ภาพและเสียงทั้งหมดสร้างเอง ไม่ใช้ภาพ เสียง หรือตัวละครของเรื่อง

export const RUSH_END = 18; // seconds: time has run away
export const WHITE_FULL = 52.8; // the screen is fully white, and the page is changed unseen
export const WHITE_HOLD = 53.4;
/** the white has gone and the newborn universe shows */
export const DAWN_FULL = 54.8;
/** the newborn universe gives way to its first morning */
export const MORNING = 56.6;
export const END = 60;

/** the great blasts of the story, felt in the picture and heard: when, and how mighty */
export const BOOMS = [
  { at: 20.4, power: 0.45 }, // time breaks loose
  { at: 37.4, power: 0.6 }, // the two galaxies strike
  { at: 40.9, power: 0.5 }, // the sun begins to swell
  { at: 43.4, power: 0.85 }, // it throws off its shell
  { at: 49, power: 0.95 }, // the two stars become one
  { at: WHITE_FULL, power: 1.4 }, // the big bang
];

/** nothing may repeat faster than this: quick flashing can set off seizures */
export const MAX_CYCLES_PER_SECOND = 0.9;

const between = (from: number, to: number, t: number) => Math.min(1, Math.max(0, (t - from) / (to - from)));
const ease = (x: number) => x * x * (3 - 2 * x);
const ramp = (from: number, to: number, t: number) => ease(between(from, to, t));

/** years gone by at chosen moments; between them the count grows evenly in powers of ten */
const AGES: [number, number][] = [
  [0, 0], [4, 1], [9, 40], [12, 400], [14.5, 6_000], [18, 250_000], [22.5, 40_000_000], [28, 600_000_000],
  [34, 3_000_000_000], [39.5, 4_600_000_000], [45.5, 8_000_000_000], [48, 1e12], [WHITE_FULL, 1e18], [END, 1e21],
];

/** how many years have passed by time t: it only ever grows */
export function yearsAt(t: number) {
  if (t >= END) return AGES.at(-1)![1] * 10 ** ((t - END) / 3);
  let i = 1;
  while (i < AGES.length - 1 && t > AGES[i][0]) i++;
  const [[from, low], [to, high]] = [AGES[i - 1], AGES[i]];
  const k = between(from, to, t);
  return 10 ** (Math.log10(1 + low) + (Math.log10(1 + high) - Math.log10(1 + low)) * k) - 1;
}

const UNITS: [number, string, string][] = [[1e12, "ล้านล้าน", "trillion"], [1e9, "พันล้าน", "billion"], [1e6, "ล้าน", "million"]];

/** the counter's words: the year itself while it can still be read, then ever larger units */
export function yearLabel(t: number, english: boolean) {
  const year = (english ? 2026 : 2569) + yearsAt(t);
  const era = english ? "Year" : "พ.ศ.";
  if (year < 1e6) return `${era} ${Math.floor(year).toLocaleString("en-US")}`;
  if (year >= 1e15) {
    const power = Math.floor(Math.log10(year));
    return `${era} ${(year / 10 ** power).toFixed(3)} × 10${[...String(power)].map((d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(d)]).join("")}`;
  }
  const [size, th, en] = UNITS.find(([size]) => year >= size)!;
  return `${era} ${(year / size).toFixed(3)} ${english ? en : th}`;
}

/** how the scene stands `t` seconds after it began */
export function momentAt(t: number) {
  const rush = between(4, RUSH_END, t);
  // radians a second for the stars and the clock
  const speed = 0.1 + 15 * rush ** 3;
  return {
    rush: ease(rush),
    speed,
    // day follows night ever faster, but never fast enough to flash
    daySpeed: Math.min(speed, Math.PI * 2 * MAX_CYCLES_PER_SECOND),
    /** petals, rain, leaves and snow passing by */
    seasons: ramp(5.5, 7, t) * (1 - ramp(10, 11.5, t)),
    /** towers of an age to come rise behind the school */
    future: ramp(9.5, 12.5, t) * (1 - ramp(13.8, 15.6, t)),
    /** the school left empty: wild growth, then ice */
    ruin: ramp(13.6, 16.2, t),
    /** the sky turning into space */
    cosmic: ramp(16.6, 19.4, t),
    /** the ink-and-paper beat: comes in once and leaves once */
    manga: ramp(20.2, 20.9, t) * (1 - ramp(22, 22.8, t)),
    /** the hand and the world */
    world: ramp(22.4, 23.8, t),
    /** the view pulls back from the world to the whole solar system */
    solar: ramp(27.8, 29.2, t),
    /** two galaxies drawing together */
    galaxy: ramp(33.4, 34.8, t),
    /** the old sun swelling into a red giant, then casting off its skin */
    giant: ramp(39.4, 40.8, t),
    /** how far through its old age the sun is */
    ageing: between(40.4, 45.8, t),
    /** two stars circling each other, closing in until they meet */
    binary: ramp(45.4, 46.6, t),
    collapse: ramp(47.4, WHITE_FULL - 0.15, t),
    // one rise and one fall
    white: t < WHITE_HOLD ? ramp(51.4, WHITE_FULL, t) : 1 - ramp(WHITE_HOLD, DAWN_FULL, t),
    /** the big bang and the first galaxies, behind the white and after it */
    birth: t < WHITE_FULL ? 0 : 1 - ramp(MORNING, MORNING + 1, t),
    /** the new universe's first morning, which then clears to show the page */
    dawn: t < WHITE_FULL ? 0 : ramp(MORNING, MORNING + 1, t) * (1 - ramp(END - 1.6, END, t)),
    renewed: t >= WHITE_FULL,
    over: t >= END,
  };
}

export type Moment = ReturnType<typeof momentAt>;

/** what the screen says at that time, set like a subtitle; the ages given are rough, as astronomers expect them */
export function lineAt(t: number, english: boolean) {
  const lines: [number, string, string][] = [
    [0, "[ เช้าธรรมดาวันหนึ่ง ที่โรงเรียนของเรา… ]", "[ An ordinary morning at our school… ]"],
    [4.4, "[ ทำไมเวลาถึงเร่งขึ้น!? ]", "[ Why is time speeding up!? ]"],
    [7, "[ ฤดูกาลผ่านไปในพริบตา ]", "[ Seasons pass in a blink ]"],
    [10.2, "[ หลายร้อยปี… รอบโรงเรียนกลายเป็นเมืองแห่งอนาคต ]", "[ Centuries… a city of the future surrounds the school ]"],
    [14.2, "[ หลายพันปี… ไม่เหลือใคร ป่าและน้ำแข็งกลืนทุกอย่าง ]", "[ Millennia… everyone gone, forest and ice take it all ]"],
    [17.4, "[ ท้องฟ้าฉีกออก ไม่มีใครหยุดเวลาได้แล้ว ]", "[ The sky tears open. No one can stop time now ]"],
    [20.4, "[ Made in Heaven ]", "[ Made in Heaven ]"],
    [23.2, "[ บ้านของเราทั้งใบ อยู่ในกำมือของ AI ]", "[ Our whole home, in the hand of an AI ]"],
    [25.8, "[ หลายล้านปี ทวีปเคลื่อนตัว มหาสมุทรเปลี่ยนรูป ]", "[ Millions of years: continents drift, oceans change ]"],
    [28.6, "[ โลกกลับสู่วงโคจร รอบดวงอาทิตย์ของเรา ]", "[ Earth returns to its path around our Sun ]"],
    [34.2, "[ ราว 4–5 พันล้านปี: ทางช้างเผือกของเราอาจชนกับแอนดรอเมดา ]", "[ Around 4–5 billion years: our Milky Way may collide with Andromeda ]"],
    [40.2, "[ ราว 5 พันล้านปีขึ้นไป: ดวงอาทิตย์พองเป็นดาวยักษ์แดง กลืนดาวชั้นใน ]", "[ 5 billion years on: the Sun swells red and swallows the inner worlds ]"],
    [43.4, "[ เปลือกระเบิดออกเป็นเนบิวลา เหลือหัวใจเป็นดาวแคระขาว ]", "[ Its shell blows away as a nebula, leaving a white dwarf heart ]"],
    [46.2, "[ หัวใจดวงนั้นพบคู่ของมัน แล้วหมุนเข้าหากัน… ]", "[ That heart finds a partner, and they spiral together… ]"],
    [49, "[ หลอมรวมเป็นหลุมดำ คลื่นความโน้มถ่วงสั่นทั้งจักรวาล ]", "[ They merge into a black hole; gravity waves shake the cosmos ]"],
    [WHITE_FULL, "[ บิ๊กแบง!! จักรวาลใหม่ถือกำเนิด ]", "[ BIG BANG!! A new universe is born ]"],
    [54.8, "[ ดาวดวงแรกค่อยๆ จุดแสง ]", "[ The first stars light up ]"],
    [MORNING, "[ และแล้ว… เช้าวันหนึ่ง ที่โรงเรียนของเรา ]", "[ And then… a morning, at our school ]"],
    [58.4, "[ ยินดีต้อนรับสู่จักรวาลใหม่ ]", "[ Welcome to the new universe ]"],
  ];
  const line = lines.filter(([from]) => t >= from).pop()!;
  return line[english ? 2 : 1];
}

/** the moments of the clock's ticks: slow at first, then running together into a whirr */
export function ticks(): number[] {
  const at: number[] = [];
  for (let t = 0.2; t < WHITE_FULL - 0.4; t += Math.max(0.05, 1 / (1 + momentAt(t).speed * 1.6))) at.push(t);
  return at;
}
