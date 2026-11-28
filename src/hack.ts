// ปริศนาของ “โหมดแฮ็กเกอร์” เป็นเกมจำลอง ไม่ได้เจาะระบบใดจริง

type Words = { th: string; en: string };
export type Stage = { title: Words; task: Words; code: string; hint: Words; answer: string };

export const STAGES: Stage[] = [
  {
    title: { th: "ด่าน 1: เลขฐานสอง", en: "Gate 1: binary" },
    task: { th: "แปลงเลขฐานสองแต่ละชุดเป็นตัวอักษร แล้วพิมพ์คำที่ได้", en: "Turn each group of bits into a letter and type the word" },
    code: "01000011 01001111 01000100 01000101",
    hint: { th: "รหัส ASCII: 01000001 คือ A และนับต่อไปทีละหนึ่ง", en: "ASCII: 01000001 is A, then count up one at a time" },
    answer: "code",
  },
  {
    title: { th: "ด่าน 2: รหัสเลื่อนอักษร", en: "Gate 2: shifted letters" },
    task: { th: "ตัวอักษรถูกเลื่อนไปข้างหน้า 3 ตำแหน่ง ถอดกลับมาเป็นคำเดิม", en: "Every letter was moved 3 places forward. Bring the word back" },
    code: "URERW",
    hint: { th: "ถอยกลับทีละ 3 ตัว: U → R", en: "Step each letter back by 3: U → R" },
    answer: "robot",
  },
  {
    title: { th: "ด่าน 3: ลำดับตัวเลข", en: "Gate 3: the sequence" },
    task: { th: "ตัวเลขถัดไปคืออะไร", en: "What number comes next?" },
    code: "2, 6, 12, 20, 30, ?",
    hint: { th: "ดูผลต่าง: 4, 6, 8, 10, …", en: "Look at the differences: 4, 6, 8, 10, …" },
    answer: "42",
  },
];

/** spaces and capitals do not matter */
export const opens = (stage: Stage, typed: string) => typed.replace(/\s+/g, "").toLowerCase() === stage.answer;

/** wrong tries before the answer itself is offered */
export const TRIES_BEFORE_ANSWER = 3;
