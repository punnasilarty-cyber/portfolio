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

/** items saved before categories existed, or with an unknown one, count as activities */
export const sectionOf = (work: Work): SectionId => sections.find((section) => section.id === work.section)?.id ?? "activities";

/** แสดงจนกว่าจะมีการบันทึกจากหน้าเว็บ */
export const works: Work[] = [
  { section: "education", title: "ตัวอย่าง: ชื่อโรงเรียน", kind: "ปีการศึกษา", summary: "ระดับชั้นและแผนการเรียน" },
  { section: "is2", title: "ตัวอย่าง: หัวข้อการนำเสนอ", kind: "IS2", summary: "สรุปเรื่องที่ศึกษาและวิธีนำเสนอ" },
  { section: "activities", title: "ตัวอย่าง: ชื่อกิจกรรม", kind: "ปีที่ทำ", summary: "บทบาทและสิ่งที่ได้เรียนรู้" },
  { section: "certificates", title: "ตัวอย่าง: ชื่อเกียรติบัตร", kind: "ปีที่ได้รับ", summary: "หน่วยงานที่มอบให้" },
];
