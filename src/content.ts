// ชื่อ คำแนะนำตัว และหมวดของเว็บแก้ที่ไฟล์นี้ ส่วนรายการในแต่ละหมวดแก้จากหน้าเว็บ
// ข้อความที่ขึ้นต้นว่า "ตัวอย่าง" เป็นของสมมติ

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
  title: string;
  kind: string;
  summary: string;
  /** รูปในโฟลเดอร์ works/ ของเว็บ */
  image?: string;
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

/** แสดงจนกว่าจะมีการบันทึกจากหน้าเว็บ */
export const works: Work[] = [
  { section: "is2", title: "ตัวอย่าง: หัวข้อการนำเสนอ", kind: "IS2", summary: "สรุปเรื่องที่ศึกษาและวิธีนำเสนอ" },
  { section: "activities", title: "ตัวอย่าง: ชื่อกิจกรรม", kind: "ปีที่ทำ", summary: "บทบาทและสิ่งที่ได้เรียนรู้" },
  { section: "certificates", title: "ตัวอย่าง: ชื่อเกียรติบัตร", kind: "ปีที่ได้รับ", summary: "หน่วยงานที่มอบให้" },
];
