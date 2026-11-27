// ชื่อ คำแนะนำตัว และหมวดของเว็บแก้ที่ไฟล์นี้ ส่วนรายการในแต่ละหมวดแก้จากหน้าเว็บ
// ข้อความที่ขึ้นต้นว่า "ตัวอย่าง" เป็นของสมมติ

export const profile = {
  name: "Punnasin Namwat",
  intro: "ตัวอย่างคำแนะนำตัว: ทำคลิป ออกแบบ และสร้างเว็บไซต์",
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
 * ประวัติการศึกษา แสดงเป็นแผนที่เส้นทางกับการ์ดแต่ละช่วง ไม่ได้แก้จากหน้าเว็บ
 * ปีการศึกษานับย้อนและไปข้างหน้าจาก ม.4 ปีการศึกษา 2569 โดยเรียนต่อเนื่องปีละชั้น
 */
export const education: {
  level: string;
  school: string;
  place: string;
  /** ปีการศึกษา */
  period: string;
  program?: string;
  current?: boolean;
  website: string;
  /** ตราโรงเรียนในโฟลเดอร์ public/schools */
  logo: string;
  /** ความหมายของตรา ถ้ารู้ */
  logoNote?: string;
  /** สีประจำโรงเรียน ใช้กับการ์ดและหมุดแผนที่ ถ้าไม่รู้ให้เว้นไว้ จะใช้สีแดงของเว็บ */
  schoolColors?: { name: string; hex: string }[];
  /** อำเภอที่ตั้ง แสดงบนหมุดแผนที่ */
  district: string;
  /** ละติจูด ลองจิจูด ของตัวอำเภอโดยประมาณ */
  at: [number, number];
  stat?: { value: number; label: string };
  facts: string[];
  source: string;
}[] = [
  {
    level: "ประถมศึกษาปีที่ 1–6",
    period: "2560 – 2565",
    school: "โรงเรียนสังขะวิทยาคม",
    place: "ตำบลสังขะ อำเภอสังขะ จังหวัดสุรินทร์",
    website: "https://skwsc.ac.th/2026/",
    logo: "/schools/sangkha.png",
    schoolColors: [
      { name: "ดำ", hex: "#1c1917" },
      { name: "เหลือง", hex: "#facc15" },
    ],
    district: "อ.สังขะ",
    at: [14.637, 103.842],
    facts: ["สังกัดสำนักงานเขตพื้นที่การศึกษาประถมศึกษาสุรินทร์ เขต 3", "เปิดสอนตั้งแต่อนุบาลถึงประถมศึกษาปีที่ 6"],
    source: "เว็บไซต์โรงเรียน skwsc.ac.th · สีจากเจ้าของเว็บ",
  },
  {
    level: "มัธยมศึกษาปีที่ 1–3",
    period: "2566 – 2568",
    school: "โรงเรียนสุรวิทยาคาร",
    place: "ถนนหลักเมือง อำเภอเมืองสุรินทร์ จังหวัดสุรินทร์",
    website: "https://sura.ac.th/",
    logo: "/schools/sura.png",
    logoNote: "พระพักตร์พระอินทร์ (สุระ = กล้าหาญ) · สามห่วง = พุทธิ จริย พลศึกษา",
    schoolColors: [
      { name: "เขียว", hex: "#16a34a" },
      { name: "เหลือง", hex: "#facc15" },
    ],
    district: "อ.เมืองสุรินทร์",
    at: [14.883, 103.494],
    stat: { value: 2452, label: "ปีที่ก่อตั้ง (พ.ศ.)" },
    facts: [
      "โรงเรียนประจำจังหวัดสุรินทร์ ก่อตั้ง 6 เมษายน 2452",
      "ต้นไม้ประจำโรงเรียน กันเกรา",
      "คติพจน์ นตฺถิ ปญฺญาสมา อาภา: แสงสว่างเสมอด้วยปัญญาไม่มี",
    ],
    source: "วิกิพีเดีย",
  },
  {
    level: "มัธยมศึกษาปีที่ 4–6",
    school: "โรงเรียนสุรวิทยาคาร",
    place: "ถนนหลักเมือง อำเภอเมืองสุรินทร์ จังหวัดสุรินทร์",
    period: "2569 – 2571 (คาดว่าจบ)",
    program: "สายวิทย์–เทคโนโลยี",
    current: true,
    website: "https://sura.ac.th/",
    logo: "/schools/sura.png",
    logoNote: "พระพักตร์พระอินทร์ (สุระ = กล้าหาญ) · สามห่วง = พุทธิ จริย พลศึกษา",
    schoolColors: [
      { name: "เขียว", hex: "#16a34a" },
      { name: "เหลือง", hex: "#facc15" },
    ],
    district: "อ.เมืองสุรินทร์",
    at: [14.883, 103.494],
    stat: { value: 3526, label: "นักเรียน (ปีการศึกษา 2569)" },
    facts: [
      "คำขวัญ ความประพฤตินำหน้า วิชาตามหลัง",
    ],
    source: "วิกิพีเดีย",
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
