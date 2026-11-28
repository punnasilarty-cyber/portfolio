// คำอธิบายภาษาคนของชิ้นส่วนทุกชนิดและคำศัพท์ที่แว่น X-ray ใช้ เพื่อให้ชี้ตรงไหนก็มีคำอธิบาย

export type Kind = "press" | "text" | "media" | "draw" | "box";

/** each kind of piece: its colour in the lens and its name */
export const KINDS: Record<Kind, { colour: string; th: string; en: string }> = {
  press: { colour: "#46dc82", th: "กดได้", en: "Pressable" },
  text: { colour: "#ffd678", th: "ข้อความ", en: "Text" },
  media: { colour: "#ff6ad5", th: "รูปภาพ", en: "Picture" },
  draw: { colour: "#ff963c", th: "ภาพวาดด้วยโค้ด", en: "Drawn by code" },
  box: { colour: "#5adcff", th: "กล่องจัดกลุ่ม", en: "Grouping box" },
};

export function kindOf(tag: string, hasText: boolean): Kind {
  if (["a", "button", "input", "label", "select", "textarea", "summary"].includes(tag)) return "press";
  if (["img", "video", "picture"].includes(tag)) return "media";
  if (["canvas", "svg", "path", "polygon", "circle", "rect", "g", "image", "polyline", "line", "ellipse"].includes(tag)) return "draw";
  return hasText ? "text" : "box";
}

const TAGS: Record<string, [th: string, en: string]> = {
  div: ["กล่องทั่วไป ใช้จัดกลุ่มและจัดวางชิ้นอื่น", "A plain box for grouping and arranging"],
  span: ["ช่วงข้อความสั้นๆ ที่ต้องแต่งแยกจากรอบข้าง", "A short run of text styled on its own"],
  p: ["ย่อหน้าข้อความ", "A paragraph"],
  h1: ["หัวข้อใหญ่สุดของหน้า", "The page's main heading"],
  h2: ["หัวข้อของส่วน", "A section heading"],
  h3: ["หัวข้อย่อย เช่น ชื่อผลงาน", "A smaller heading, such as a work's title"],
  h4: ["หัวข้อย่อยระดับล่าง", "A minor heading"],
  a: ["ลิงก์ กดแล้วไปที่อื่น", "A link that takes you somewhere"],
  button: ["ปุ่ม กดแล้วเกิดการทำงาน", "A button that does something"],
  input: ["ช่องรับข้อมูลหรือช่องติ๊ก", "A field or tick box"],
  label: ["ป้ายของช่อง กดแล้วเหมือนกดช่อง", "A field's name; pressing it presses the field"],
  img: ["รูปภาพจากไฟล์", "A picture from a file"],
  canvas: ["ผืนผ้าใบที่โปรแกรมวาดจุดสีลงไปเอง", "A surface the program paints pixel by pixel"],
  svg: ["ภาพเวกเตอร์ เขียนเป็นรูปทรง ขยายแล้วไม่แตก", "A vector drawing: shapes that stay sharp at any size"],
  path: ["เส้นหรือรูปทรงหนึ่งในภาพ SVG", "One line or shape within an SVG"],
  ul: ["รายการที่ไม่มีเลขลำดับ", "An unnumbered list"],
  ol: ["รายการที่มีลำดับ", "A numbered list"],
  li: ["หนึ่งข้อในรายการ", "One item of a list"],
  nav: ["พื้นที่เมนูนำทาง", "An area of navigation"],
  main: ["เนื้อหาหลักของหน้า", "The page's main content"],
  header: ["ส่วนหัว", "A header"],
  footer: ["ส่วนท้าย", "A footer"],
  section: ["ส่วนหนึ่งของหน้าที่มีเรื่องเดียวกัน", "A section about one thing"],
  figure: ["รูปหรือแผนภาพพร้อมคำบรรยาย", "A picture with its caption"],
  figcaption: ["คำบรรยายใต้ภาพ", "A caption"],
  dialog: ["หน้าต่างซ้อนของเบราว์เซอร์", "The browser's pop-up window"],
  article: ["เนื้อหาที่อ่านแยกได้ในตัวเอง", "A piece that reads on its own"],
  b: ["ตัวอักษรเน้นให้หนา", "Bold text"],
  small: ["ตัวอักษรเล็ก", "Small print"],
};

/** what this kind of element is, in plain words */
export const plain = (tag: string): { th: string; en: string } => {
  const [th, en] = TAGS[tag] ?? [`ชิ้นส่วนชนิด ${tag}`, `A ${tag} element`];
  return { th, en };
};

export const GLOSSARY: { word: string; th: string; en: string }[] = [
  { word: "element", th: "ชิ้นส่วนหนึ่งของหน้าเว็บ เขียนเป็นแท็ก เช่น <p>", en: "One piece of a page, written as a tag such as <p>" },
  { word: "DOM", th: "โครงสร้างต้นไม้ของชิ้นส่วนทั้งหน้าที่เบราว์เซอร์สร้างขึ้น", en: "The tree of all elements the browser builds" },
  { word: "CSS", th: "ภาษากำหนดหน้าตา เช่น สี ขนาด ระยะ", en: "The language of looks: colour, size, spacing" },
  { word: "selector", th: "ข้อความระบุว่ากฎ CSS ใช้กับชิ้นไหน", en: "The words saying which elements a rule is for" },
  { word: "specificity", th: "น้ำหนักของ selector ใช้ตัดสินเมื่อหลายกฎขัดกัน", en: "A selector's weight, used when rules disagree" },
  { word: "margin", th: "ระยะว่างรอบนอกชิ้น ดันชิ้นอื่นออกไป", en: "Room outside an element, pushing others away" },
  { word: "border", th: "เส้นขอบ", en: "The edge line" },
  { word: "padding", th: "ระยะว่างด้านใน ระหว่างขอบกับเนื้อหา", en: "Room inside, between edge and content" },
  { word: "flex / grid", th: "วิธีจัดวางลูกในกล่องเป็นแถว หรือเป็นตาราง", en: "Ways to lay children out in a row or a grid" },
  { word: "React", th: "ไลบรารีที่สร้างหน้าเว็บจากชิ้นส่วนย่อย และอัปเดตเมื่อข้อมูลเปลี่ยน", en: "A library building pages from components that update with data" },
  { word: "canvas", th: "พื้นที่ให้โปรแกรมวาดภาพเองทีละจุด", en: "A surface the program draws on itself" },
  { word: "FPS", th: "จำนวนภาพต่อวินาที ยิ่งมากยิ่งลื่น", en: "Frames a second; more is smoother" },
];
