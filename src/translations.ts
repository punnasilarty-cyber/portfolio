// ข้อความภาษาอังกฤษ จับคู่ด้วยข้อความไทยตรงตัว ข้อความที่ไม่มีในนี้ (เช่น การ์ดที่เพิ่มใหม่) จะแสดงเป็นภาษาไทย
// ชื่อโรงเรียนสุรวิทยาคารสะกดตามป้ายหน้าโรงเรียน คติพจน์และคำขวัญแสดงตามต้นฉบับ เพราะไม่พบฉบับภาษาอังกฤษของโรงเรียน

const KIND = "IS2 · Semester 2, academic year 2026";

export const EN: Record<string, string> = {
  // เมนูและหน้าแรก
  หน้าแรก: "Home",
  ประวัติการศึกษา: "Education",
  "การสื่อสารและการนำเสนอ (IS2)": "Communication and Presentation (IS2)",
  กิจกรรม: "Activities",
  เกียรติบัตร: "Certificates",
  ติดต่อ: "Contact",
  เมนูหลัก: "Main menu",
  ตำแหน่งในหน้า: "Position on the page",
  กลับขึ้นบนสุด: "Back to top",
  ดูประวัติ: "My education",
  เกี่ยวกับฉัน: "About me",
  "นักเรียนชั้นมัธยมศึกษาปีที่ 4 สายการเรียนวิทย์–เทคโนโลยี โรงเรียนสุรวิทยาคาร": "Mattayom 4 student, Science–Technology programme, Surawittayakarn School",
  "สวัสดีครับ ผมชื่อปุณณศิลป์ นามวัฒน์ (ตี้) ปัจจุบันเรียนอยู่ชั้นมัธยมศึกษาปีที่ 4 สายการเรียนวิทย์–เทคโนโลยี โรงเรียนสุรวิทยาคาร":
    "Hello, my name is Punnasin Namwat (Tee). I am a Mattayom 4 student in the Science–Technology programme at Surawittayakarn School.",
  "ผมสนใจคอมพิวเตอร์ เทคโนโลยี และคณิตศาสตร์ โดยเฉพาะการนำเทคโนโลยีมาใช้ให้เกิดประโยชน์ ผมจึงฝึกคิดอย่างเป็นขั้นตอนและแก้ปัญหาให้ตรงจุด เพื่อสร้างผลงานหรือเครื่องมือที่ช่วยอำนวยความสะดวกได้จริง":
    "I am interested in computers, technology and mathematics, especially in putting technology to good use. I practise thinking step by step and solving the actual problem, so that I can build work and tools that are really helpful.",
  "เว็บนี้รวบรวมผลงานและสิ่งที่ผมได้ลองลงมือทำ ขอบคุณที่เข้ามาเยี่ยมชมครับ": "This site collects my work and the things I have tried to make. Thank you for visiting.",

  // ติดต่อและท้ายหน้า
  อีเมล: "Email",
  คัดลอก: "Copy",
  คัดลอกแล้ว: "Copied",
  "คัดลอกไม่ได้ กดค้างที่ชื่อแทน": "Cannot copy. Press and hold the name instead",
  สแกนเพื่อเปิดเว็บนี้: "Scan to open this site",
  "ดาวน์โหลด QR": "Download QR",
  สงวนลิขสิทธิ์: "All rights reserved",
  หยุดแอนิเมชัน: "Stop animations",

  // การศึกษา
  "ประถมศึกษาปีที่ 1–6": "Primary school, Prathom 1–6",
  "มัธยมศึกษาปีที่ 1–3": "Lower secondary, Mattayom 1–3",
  "มัธยมศึกษาปีที่ 4–6": "Upper secondary, Mattayom 4–6",
  โรงเรียนสังขะวิทยาคม: "Sangkha Witthayakhom School",
  โรงเรียนสุรวิทยาคาร: "Surawittayakarn School",
  "สายการเรียน วิทย์–เทคโนโลยี": "Science–Technology programme",
  คติพจน์: "Motto:",
  คำขวัญ: "Slogan:",
  กำลังศึกษา: "Studying now",
  เว็บไซต์โรงเรียน: "School website",
  เลือกมุมมอง: "Choose a view",
  เส้นทางการเรียนรู้: "Learning journey",
  โมเดลโรงเรียน: "School models",
  "แผนที่ © OpenStreetMap contributors · เส้นทาง OSRM": "Map © OpenStreetMap contributors · Route by OSRM",
  "ผังจำลองจากแผนผังโรงเรียน ภาพมุมสูง และภาพถ่ายดาวเทียม ย่อส่วนและมีบางจุดเป็นการประมาณ": "Modelled from school plans, aerial photos and satellite images; scaled down and partly estimated",
  จังหวัดสุรินทร์: "Surin Province",
  เรียนจบแล้ว: "Completed",
  กำลังเรียน: "In progress",
  "ยังมาไม่ถึง (คาดว่า)": "Not yet (expected)",
  "ผลงาน IS ในช่วง ม.4": "IS project in Mattayom 4",
  "ดูผลงานและรายงานในหมวด IS2 →": "See the work and report under IS2 →",
  เลื่อนหน้าจอเพื่อเดินทางตามปีการศึกษา: "Scroll to travel through the school years",
  "ตัวละครสมมติ ไม่ใช่ภาพบุคคลจริง": "A made-up character, not a real person",
  ความคืบหน้าบนเส้นทางการเรียน: "Progress along the learning journey",
  "ตัวละครชายสมมติ ผมหน้าม้าซอย เสื้อนักเรียนแขนสั้น กางเกง ถุงเท้า และรองเท้าสีน้ำตาล": "A made-up boy with a layered fringe, a short-sleeved school shirt, and brown shorts, socks and shoes",

  // การ์ดและหน้าต่างดูไฟล์
  ดูภาพเต็ม: "View full picture",
  กดเพื่อเปิดอ่าน: "Press to read",
  เปิดดู: "Open",
  รายละเอียด: "Details",
  วันที่: "Date",
  สถานที่: "Place",
  บทบาทของฉัน: "My role",
  สิ่งที่ได้เรียนรู้: "What I learned",
  รูปภาพ: "Pictures",
  ไฟล์เอกสาร: "Documents",
  เปิดลิงก์: "Open the link",
  แก้ไข: "Edit",
  เข้าสู่โหมดแก้ไข: "Enter edit mode",
  เปิดแท็บใหม่: "Open in new tab",
  ปิด: "Close",
  "← ก่อนหน้า": "← Previous",
  "ถัดไป →": "Next →",
  ย่อให้พอดีจอ: "Fit to screen",
  ขยายเท่าขนาดจริง: "Show at full size",
  "กำลังเปิดไฟล์…": "Opening the file…",
  "เปิดไฟล์ในหน้านี้ไม่ได้ ลองกด “เปิดแท็บใหม่”": "Cannot show the file here. Try “Open in new tab”",

  // ผลงานที่อยู่บนเว็บตอนนี้
  "IS2 · ภาคเรียนที่ 2 ปีการศึกษา 2569": KIND,
  "โครงงาน - ส่วนหน้า": "Project: front matter",
  "รายงานวิชา IS": "IS course report",
  "อินโฟกราฟิก: สระน้ำสะอาด เริ่มได้จากพวกเราทุกคน": "Infographic: A clean pond starts with all of us",
  "สรุปผลโครงงานกลุ่มเรื่องปัญหาการเน่าเสียของสระน้ำโรงเรียนสุรวิทยาคาร จากแบบสอบถามนักเรียน 30 คน ปัญหาที่ค่าเฉลี่ยสูงสุดคือการทิ้งขยะไม่ลงถัง (4.04)":
    "Results of our group project on water pollution in the Surawittayakarn School pond. In a questionnaire of 30 students, the problem with the highest mean score was litter not put in bins (4.04).",
  "แผ่นพับ: ร่วมกันดูแลแหล่งน้ำของเรา": "Leaflet: Caring for our water together",
  "สรุปผล อภิปรายผล และข้อเสนอแนะ เช่น มีถังขยะให้เพียงพอ จัดระบบบำบัดน้ำเสีย และให้ทุกคนช่วยกันดูแลสระน้ำ":
    "Findings, discussion and suggestions, such as enough rubbish bins, a wastewater treatment system, and everyone helping to look after the pond.",
  ส่วนหน้ารายงาน: "Report front matter",
  "ปก บทคัดย่อ กิตติกรรมประกาศ และสารบัญ": "Cover, abstract, acknowledgements and contents (in Thai)",
  "ไฟล์เอกสารส่วนหน้ารายงาน กดเปิดดูในหน้าเว็บได้": "The front matter as a document file, readable on this page (in Thai)",
  เนื้อหารายงาน: "Report body",
  "เนื้อหาบทที่ 1–5 อ้างอิง และประวัติผู้ศึกษา ฉบับแก้ 001": "Chapters 1–5, references and author profiles, revision 001 (in Thai)",
  "ไฟล์เอกสารเนื้อหารายงาน กดเปิดดูในหน้าเว็บได้": "The report body as a document file, readable on this page (in Thai)",
};

/** a Thai text in English, or unchanged when there is no translation */
export const toEnglish = (text: string, own: Record<string, string> = {}) => own[text.trim()] || EN[text.trim()] || text;

/** Buddhist-era years as Common Era ones, with the note on a year still to come */
export const englishPeriod = (period: string) => period.replace(/25\d\d/g, (year) => String(Number(year) - 543)).replace("คาดว่าจบ", "expected");

/** "ป.1" is Prathom 1 and "ม.4" is Mattayom 4, as Thai schools write them in English */
export const englishGrade = (grade: string) => `${grade.startsWith("ป") ? "Prathom" : "Mattayom"} ${grade.slice(2)}`;
