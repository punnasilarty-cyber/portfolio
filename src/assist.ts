// ตัวช่วยชมเว็บ: จุดแวะของทัวร์ สิ่งที่จะอ่านออกเสียง และการแปลคำพูดเป็นคำสั่ง

export interface Stop {
  find: string;
  seconds: number;
  th: string;
  en: string;
}

/** the guided tour, about a minute: a part of the page, how long to stay, and what is said there */
export const TOUR: Stop[] = [
  { find: "#top > section:first-child", seconds: 8, th: "ยินดีต้อนรับ นี่คือพอร์ตของปุณณศิลป์ นามวัฒน์ นักเรียนสายวิทย์–เทคโนโลยี", en: "Welcome. This is the portfolio of Punnasin Namwat, a science and technology student" },
  { find: ".about", seconds: 9, th: "เริ่มจากเรื่องของเขา สนใจคอมพิวเตอร์ เทคโนโลยี และคณิตศาสตร์", en: "First, about him: computers, technology and mathematics" },
  { find: ".edu-stage-wrap", seconds: 10, th: "เส้นทางการเรียน จากสังขะวิทยาคมสู่สุรวิทยาคาร กดตราโรงเรียนเพื่อข้ามไปแต่ละช่วงได้", en: "The learning path, from Sangkha to Sura. Press a crest to jump to a stage" },
  { find: "#is2 h2", seconds: 8, th: "โครงงาน IS เรื่องปัญหาการเน่าเสียของสระน้ำในโรงเรียน", en: "The IS project: the pond at school going foul" },
  { find: "#is2 li", seconds: 10, th: "กดรูปเพื่อดูเต็มจอ หรือกดรายละเอียดเพื่ออ่านรายงาน", en: "Press a picture to see it full, or Details to read the report" },
  { find: ".menu-open", seconds: 8, th: "ปุ่มนี้รวมลูกเล่นทั้งหมด เช่น แว่น X-ray และสอน AI", en: "This button holds everything else, such as the X-ray lens and teaching an AI" },
  { find: "#contact", seconds: 7, th: "จบทัวร์ ติดต่อได้ตามช่องทางนี้ ขอบคุณที่เข้าชม", en: "That is the tour. Here is how to get in touch. Thank you" },
];

/** what is read aloud, in the order of the page: each block found, and the pieces of it that are spoken */
export const READINGS: { find: string; parts: string }[] = [
  { find: ".about > div:last-child > p", parts: "" },
  { find: ".edu-card", parts: ".edu-level, h3, .edu-tried > b, .edu-tried li, p.edu-tried" },
  { find: "main section[id] li .flip-front", parts: "h3, h3 + p" },
];

export type Action = { go: string } | { open: "tour" | "read" | "xray" | "teach" | "menu" | "easy" } | { scroll: 1 | -1 } | { stop: true };

// the first whose words are heard wins, so the narrower ones come first
const COMMANDS: [words: string[], action: Action][] = [
  [["หยุด", "พอแล้ว", "เลิกฟัง", "stop"], { stop: true }],
  [["ทัวร์", "พาชม", "พาเที่ยว", "tour"], { open: "tour" }],
  [["อ่านง่าย", "ตัวใหญ่", "easy", "bigger"], { open: "easy" }],
  [["อ่าน", "read"], { open: "read" }],
  [["แว่น", "เอกซเรย์", "เอ็กซ์เรย์", "x-ray", "xray", "x ray"], { open: "xray" }],
  [["สอน", "teach"], { open: "teach" }],
  [["เมนู", "menu"], { open: "menu" }],
  [["ประวัติ", "การศึกษา", "โรงเรียน", "education", "school"], { go: "education" }],
  [["ไอเอส", "โครงงาน", "รายงาน", "การนำเสนอ", "ผลงาน", "project", "work", "i s"], { go: "is2" }],
  [["กิจกรรม", "activities", "activity"], { go: "activities" }],
  [["เกียรติบัตร", "certificate"], { go: "certificates" }],
  [["ติดต่อ", "contact"], { go: "contact" }],
  [["หน้าแรก", "บนสุด", "home", "top"], { go: "top" }],
  [["เลื่อนลง", "ลง", "down"], { scroll: 1 }],
  [["เลื่อนขึ้น", "ขึ้น", "up"], { scroll: -1 }],
];

/** what the words heard ask for; English words must stand whole, so "stop" is not heard in "top" or the reverse */
export function command(heard: string): Action | null {
  const said = heard.toLowerCase().trim();
  const holds = (word: string) => (/^[a-z -]+$/.test(word) ? new RegExp(`(^|[^a-z])${word}($|[^a-z])`).test(said) : said.includes(word));
  return COMMANDS.find(([words]) => words.some(holds))?.[1] ?? null;
}

/** where in a joined text each piece begins, so a place in the speech can be found on the page again */
export function placeOf(starts: number[], at: number): [piece: number, offset: number] {
  let piece = 0;
  while (piece + 1 < starts.length && starts[piece + 1] <= at) piece++;
  return [piece, at - (starts[piece] ?? 0)];
}
