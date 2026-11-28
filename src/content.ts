// ชื่อ คำแนะนำตัว และหมวดของเว็บแก้ที่ไฟล์นี้ ส่วนรายการในแต่ละหมวดแก้จากหน้าเว็บ

/** Thai line breaking splits names mid-word, so these stay on one line */
export const aboutWhole = /(นามวัฒน์ \(ตี้\)|ปุณณศิลป์|วิทย์–เทคโนโลยี|สุรวิทยาคาร)/;

export const profile = {
  name: "Punnasin Namwat",
  intro: "นักเรียนชั้นมัธยมศึกษาปีที่ 4 สายการเรียนวิทย์–เทคโนโลยี โรงเรียนสุรวิทยาคาร",
  /** ข้อความ "เกี่ยวกับฉัน" ในหน้าแรก ย่อหน้าละหนึ่งรายการ */
  about: [
    "สวัสดีครับ ผมชื่อปุณณศิลป์ นามวัฒน์ (ตี้) ปัจจุบันเรียนอยู่ชั้นมัธยมศึกษาปีที่ 4 สายการเรียนวิทย์–เทคโนโลยี โรงเรียนสุรวิทยาคาร",
    "ผมสนใจคอมพิวเตอร์ เทคโนโลยี และคณิตศาสตร์ โดยเฉพาะการนำเทคโนโลยีมาใช้ให้เกิดประโยชน์ ผมจึงฝึกคิดอย่างเป็นขั้นตอนและแก้ปัญหาให้ตรงจุด เพื่อสร้างผลงานหรือเครื่องมือที่ช่วยอำนวยความสะดวกได้จริง",
    "เว็บนี้รวบรวมผลงานและสิ่งที่ผมได้ลองลงมือทำ ขอบคุณที่เข้ามาเยี่ยมชมครับ",
  ],
};

/** ที่อยู่จริงของเว็บ ใช้ตอนแชร์ลิงก์ */
export const siteUrl = "https://punnasilarty-cyber.github.io/portfolio/";

/** ช่องทางติดต่อท้ายหน้า เจ้าของเว็บเลือกให้เปิดสาธารณะ ไม่มีลิงก์ก็แสดงเป็นข้อความให้คัดลอก */
export const contacts: { name: string; value: string; href?: string }[] = [
  { name: "อีเมล", value: "punnasilarty@gmail.com", href: "mailto:punnasilarty@gmail.com" },
  { name: "Facebook", value: "Punnasin Namwat", href: "https://www.facebook.com/hopecore.or.real" },
  { name: "Instagram", value: "@justwannabe_7", href: "https://www.instagram.com/justwannabe_7/" },
  { name: "Discord", value: "csx.z" },
];

/** ผลแบบสอบถามของโครงงาน IS ตามตารางในรายงาน คะแนนเต็ม 5 */
export const survey = {
  title: "ผลแบบสอบถาม: ปัญหาสระน้ำเน่าเสีย",
  note: "ค่าเฉลี่ยตามตารางในรายงาน คะแนนเต็ม 5 ระดับ 3.50 – 4.49 แปลว่า “มาก”",
  items: [
    { label: "การทิ้งขยะไม่ลงถัง", mean: 4.04 },
    { label: "จำเป็นต้องมีมาตรการบำบัดน้ำเสียเร่งด่วน", mean: 4.02 },
    { label: "กลิ่นเหม็นและยุงหรือแมลงรบกวน", mean: 3.94 },
    { label: "กระทบทัศนียภาพและความเป็นระเบียบ", mean: 3.92 },
    { label: "น้ำเสียจากอาคารหรือร้านค้าไหลลงสระ", mean: 3.86 },
    { label: "ขาดการดูแลและทำความสะอาดสม่ำเสมอ", mean: 3.74 },
    { label: "กังวลว่าเป็นแหล่งสะสมเชื้อโรค", mean: 3.7 },
  ],
};

/** หมวดของหน้าเว็บ เรียงตามนี้ ต่อจากหน้าแรก */
export const sections = [
  { id: "education", title: "ประวัติการศึกษา" },
  { id: "is2", title: "การสื่อสารและการนำเสนอ (IS2)" },
  { id: "activities", title: "กิจกรรม" },
  { id: "certificates", title: "เกียรติบัตร" },
] as const;

export type SectionId = (typeof sections)[number]["id"];

export type Work = {
  section?: SectionId;
  /** หัวข้อย่อยในหมวด รายการที่ชื่อเดียวกันอยู่ด้วยกัน */
  group?: string;
  title: string;
  kind: string;
  summary: string;
  /** รูปในโฟลเดอร์ works/ ของเว็บ */
  image?: string;
  /** รูปอื่นของรายการเดียวกัน ต่อจากรูปหลัก */
  more?: string[];
  /** ลิงก์ดูของจริง */
  link?: string;
};

/**
 * ประวัติการศึกษา แสดงเป็นฉากโรงเรียนจำลองกับการ์ดแต่ละช่วง ไม่ได้แก้จากหน้าเว็บ
 * ปีการศึกษานับย้อนและไปข้างหน้าจาก ม.4 ปีการศึกษา 2569 โดยเรียนต่อเนื่องปีละชั้น
 */
export const education: {
  level: string;
  school: string;
  /** ปีการศึกษา */
  period: string;
  program?: string;
  /** คติพจน์และคำขวัญ ตามที่เจ้าของเว็บให้มา */
  mottos: { label?: string; text: string }[];
  current?: boolean;
  website: string;
  /** ตราโรงเรียนในโฟลเดอร์ public/schools */
  logo: string;
  /** สีประจำโรงเรียน ใช้กับการ์ดและฉากจำลอง ถ้าไม่รู้ให้เว้นไว้ จะใช้สีแดงของเว็บ */
  schoolColors?: { name: string; hex: string }[];
}[] = [
  {
    level: "ประถมศึกษาปีที่ 1–6",
    period: "2560 – 2565",
    school: "โรงเรียนสังขะวิทยาคม",
    website: "https://skwsc.ac.th/2026/",
    logo: "/schools/sangkha.png",
    mottos: [{ text: "เลิศคุณธรรม ล้ำวิทยา พัฒนาสังคม" }],
    schoolColors: [
      { name: "ดำ", hex: "#1c1917" },
      { name: "เหลือง", hex: "#facc15" },
    ],
  },
  {
    level: "มัธยมศึกษาปีที่ 1–3",
    period: "2566 – 2568",
    school: "โรงเรียนสุรวิทยาคาร",
    website: "https://sura.ac.th/",
    logo: "/schools/sura.png",
    mottos: [
      { label: "คติพจน์", text: "นตฺถิ ปญฺญาสมา อาภา: แสงสว่างเสมอด้วยปัญญาไม่มี" },
    ],
    schoolColors: [
      { name: "เขียว", hex: "#16a34a" },
      { name: "เหลือง", hex: "#facc15" },
    ],
  },
  {
    level: "มัธยมศึกษาปีที่ 4–6",
    school: "โรงเรียนสุรวิทยาคาร",
    period: "2569 – 2571 (คาดว่าจบ)",
    program: "สายการเรียน วิทย์–เทคโนโลยี",
    current: true,
    website: "https://sura.ac.th/",
    logo: "/schools/sura.png",
    mottos: [
      { label: "คำขวัญ", text: "ความประพฤตินำหน้า วิชาตามหลัง" },
    ],
    schoolColors: [
      { name: "เขียว", hex: "#16a34a" },
      { name: "เหลือง", hex: "#facc15" },
    ],
  },
];

/** items saved before categories existed, or with an unknown one, count as activities */
export const sectionOf = (work: Work): SectionId => sections.find((section) => section.id === work.section)?.id ?? "activities";

/** a section's items under their sub-headings: the ones without a heading first, then each heading as first met */
export function groupsOf<T>(items: T[], nameOf: (item: T) => string | undefined): { name: string; items: T[] }[] {
  const groups = new Map<string, T[]>([["", []]]);
  for (const item of items) {
    const name = nameOf(item) ?? "";
    groups.set(name, [...(groups.get(name) ?? []), item]);
  }
  return Array.from(groups, ([name, list]) => ({ name, items: list })).filter((group) => group.items.length);
}

/** แสดงจนกว่าจะมีการบันทึกจากหน้าเว็บ เว้นว่างไว้เพื่อไม่ให้มีของสมมติขึ้นเว็บ */
export const works: Work[] = [];
