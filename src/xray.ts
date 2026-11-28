// ข้อมูลของแว่น X-ray: แต่ละส่วนของหน้าเว็บสร้างด้วยอะไร ทำงานอย่างไร การหาว่าตอนนี้ส่องอยู่ที่ส่วนไหน
// และการเขียนรายละเอียดของชิ้นที่ชี้ให้อ่านง่าย

/** one part of the page: where it is found, its name, and how it is made */
export interface Part {
  find: string;
  th: [name: string, how: string];
  en: [name: string, how: string];
  /** the source file it is made in, what with, and how it works, step by step */
  file: string;
  tech: string[];
  steps: { th: string[]; en: string[] };
}

export const PARTS: Part[] = [
  {
    find: "body > header nav, header nav[aria-label]:not(.dots)",
    th: ["เมนูหลัก", "แถบไฮไลต์เลื่อนตามหัวข้อ ใช้ MutationObserver จับว่าอ่านถึงไหน"],
    en: ["Main menu", "A marker slides to the section being read, watched by a MutationObserver"],
    file: "NavSlide.tsx",
    tech: ["React", "MutationObserver", "ResizeObserver"],
    steps: {
      th: ["GSAP ใส่ class ให้ลิงก์ของหัวข้อที่กำลังอ่าน", "แถบไฮไลต์วัดความกว้างและตำแหน่งของลิงก์นั้น แล้วเลื่อนด้วย CSS transform", "จอแคบ เมนูเลื่อนข้างตามเพื่อให้เห็นแถบเสมอ"],
      en: ["GSAP marks the link of the section being read", "The marker measures that link and slides there with a CSS transform", "On narrow screens the menu scrolls sideways to keep it in view"],
    },
  },
  {
    find: ".menu-open",
    th: ["ปุ่มเมนูฟีเจอร์", "เปิดหน้าต่าง dialog ของเบราว์เซอร์ ส่งคำสั่งด้วย CustomEvent"],
    en: ["Feature menu button", "Opens a native dialog and sends a CustomEvent"],
    file: "Menu.tsx",
    tech: ["dialog", "CustomEvent"],
    steps: {
      th: ["กดแล้วส่งเหตุการณ์ชื่อ feature ออกไปทั้งหน้า", "ส่วนเมนูรับเหตุการณ์แล้วเปิดด้วย showModal()", "เลือกฟีเจอร์ เมนูปิดก่อน แล้วค่อยส่งคำสั่งเปิดฟีเจอร์นั้น"],
      en: ["A press sends a page-wide feature event", "The menu hears it and opens with showModal()", "Choosing one closes the menu, then asks for that feature"],
    },
  },
  {
    find: ".palette-open",
    th: ["ปุ่มค้นหา", "กล่องคำสั่ง Ctrl+K ค้นผลงานและฟีเจอร์"],
    en: ["Search button", "A Ctrl+K command box over work and features"],
    file: "Palette.tsx",
    tech: ["Ctrl+K", "ARIA combobox"],
    steps: {
      th: ["รวมหัวข้อ ผลงานที่แสดงอยู่ และคำสั่ง เป็นรายการเดียว", "รายการจะแสดงเมื่อมีทุกคำที่พิมพ์", "เลื่อนเลือกด้วยลูกศรแล้วกด Enter"],
      en: ["Sections, the cards on show and commands form one list", "An item shows when it holds every word typed", "Arrows choose, Enter runs"],
    },
  },
  {
    find: "#top > section:first-child > canvas",
    th: ["ผนังโค้ด", "วาดทีละตัวอักษรบน Canvas 2D ราว 30 ภาพต่อวินาที"],
    en: ["Code wall", "Drawn letter by letter on a 2D canvas, about 30 frames a second"],
    file: "HeroMotion.tsx",
    tech: ["Canvas 2D", "requestAnimationFrame"],
    steps: {
      th: ["แบ่งจอเป็นช่องตัวอักษร แล้ววาดรูป </> ไว้เบื้องหลังเพื่อดูว่าช่องไหนอยู่ในรูป", "ช่องในรูปสว่างขึ้นทีละช่อง มีแถบแสงกวาดผ่าน", "เล่นหนึ่งรอบแล้วหยุด และพักเมื่ออยู่นอกจอ"],
      en: ["The screen is cut into letter cells; a hidden </> picks the cells inside it", "Those cells light one by one under a sweeping band", "Plays one round, then rests; pauses off screen"],
    },
  },
  {
    find: ".hero-content h1",
    th: ["ชื่อหน้าแรก", "ตัวอักษรถอดรหัสทีละตัว ทำด้วย React กับ CSS animation"],
    en: ["Front title", "Letters decode one by one with React and CSS animation"],
    file: "StaggerText.tsx",
    tech: ["Intl.Segmenter", "CSS"],
    steps: {
      th: ["แยกข้อความเป็นอักษรโดยสระและวรรณยุกต์ไทยไม่หลุดจากพยัญชนะ", "สัญลักษณ์สุ่มเปลี่ยนทุก 60 มิลลิวินาที แล้วเฉลยทีละตัว", "สีไล่ระดับถูกตัดแบ่งให้แต่ละตัวอักษร"],
      en: ["Split into letters, Thai marks staying on their consonants", "Symbols change every 60 ms and resolve one by one", "Each letter shows its own slice of the gradient"],
    },
  },
  {
    find: ".about > div:last-child",
    th: ["เกี่ยวกับฉัน", "ตัดคำภาษาไทยด้วย Intl.Segmenter แล้วสว่างตามการเลื่อนด้วย GSAP ScrollTrigger"],
    en: ["About me", "Split by Intl.Segmenter, lit on scroll by GSAP ScrollTrigger"],
    file: "AboutText.tsx",
    tech: ["Intl.Segmenter", "GSAP ScrollTrigger"],
    steps: {
      th: ["ภาษาไทยไม่เว้นวรรคระหว่างคำ จึงให้เบราว์เซอร์ตัดคำให้", "ทุกคำถูกห่อด้วย span แล้วตั้งให้จาง", "ระยะที่เลื่อนจอกำหนดว่าสว่างถึงคำไหน"],
      en: ["Thai has no spaces, so the browser breaks the words", "Each word is wrapped in a span and dimmed", "How far you scroll decides how many are lit"],
    },
  },
  {
    find: ".fx-band",
    th: ["แถบชื่อหัวข้อวิ่ง", "CSS animation ล้วน หยุดวาดเองเมื่ออยู่นอกจอ"],
    en: ["Running names", "Pure CSS animation, skipped while out of sight"],
    file: "src/app/globals.css",
    tech: ["CSS animation", "content-visibility"],
    steps: {
      th: ["พิมพ์รายชื่อหัวข้อไว้สองชุดต่อกัน", "เลื่อนไปครึ่งเดียวแล้วเริ่มใหม่ จึงดูต่อเนื่องไม่มีรอยต่อ", "ขยับด้วย transform และเบราว์เซอร์ข้ามการวาดเมื่ออยู่นอกจอ"],
      en: ["The names are written twice in a row", "It moves half way and starts again, so no seam shows", "Moved by transform; skipped when off screen"],
    },
  },
  {
    find: "main section[id] h2",
    th: ["หัวข้อส่วน", "ขยายเข้ามาตามการเลื่อนด้วย GSAP"],
    en: ["Section heading", "Grows in with the scroll, by GSAP"],
    file: "src/motion.ts",
    tech: ["GSAP", "scrub"],
    steps: {
      th: ["หัวข้อเริ่มจากเล็ก จาง และอยู่ต่ำ", "การเลื่อนจอคือแถบเวลาของอนิเมชัน เลื่อนกลับก็ย้อนกลับ", "ปิดได้ด้วยช่องหยุดแอนิเมชัน"],
      en: ["It starts small, faint and low", "The scroll is the timeline: scroll back and it reverses", "The stop-animation box turns it off"],
    },
  },
  {
    find: ".edu-stage",
    th: ["โมเดลโรงเรียน", "ภาพสามมิติแบบไอโซเมตริก เขียนเป็น SVG ด้วยโค้ดทั้งหมด"],
    en: ["School model", "An isometric drawing, all SVG written in code"],
    file: "SchoolScene.tsx",
    tech: ["SVG", "isometric", "GSAP"],
    steps: {
      th: ["คำนวณจุดสามมิติลงเป็นพิกัดสองมิติแบบไอโซเมตริก", "อาคารแต่ละชั้นเป็นรูปหลายเหลี่ยมใน SVG", "ก่อตัวทีละชั้นเมื่อเลื่อนถึง"],
      en: ["3D points are projected to 2D, isometrically", "Each floor is a set of SVG polygons", "It builds floor by floor as you arrive"],
    },
  },
  {
    find: ".edu-route-view",
    th: ["เส้นทางการเรียนรู้", "แต่ละช่วงต่อกัน ทักษะกดไปดูผลงานที่ยืนยันได้"],
    en: ["Learning route", "Stages that lead on, skills that open their proof"],
    file: "LearningRoute.tsx",
    tech: ["React", "CSS", "SVG"],
    steps: {
      th: ["ตำแหน่งการ์ดบนจอบอกว่าอยู่ปีการศึกษาไหน", "เส้นระหว่างตราโรงเรียนเติมตามปี และตัวละครเดินตอนที่หน้าเลื่อน", "กดทักษะแล้วพาไปที่ผลงานที่ยืนยันทักษะนั้น"],
      en: ["Where the cards sit on screen picks the school year", "The line between the crests fills by year; the character walks as the page moves", "Pressing a skill goes to the work that shows it"],
    },
  },
  {
    find: ".solx-spotlight",
    th: ["การ์ดผลงาน", "เอียงตามเมาส์ด้วย CSS 3D ข้อมูลโหลดจากไฟล์ works.json"],
    en: ["Work card", "Tilts with CSS 3D; its words come from works.json"],
    file: "SpotlightCard.tsx",
    tech: ["CSS 3D", "React"],
    steps: {
      th: ["อ่านตำแหน่งเมาส์บนการ์ด", "เอียงสูงสุด 6 องศาด้วย rotateX และ rotateY", "แสงนุ่มวางตามเมาส์ด้วยตัวแปร CSS"],
      en: ["Reads where the pointer is on the card", "Leans up to 6 degrees with rotateX and rotateY", "A soft light follows through CSS variables"],
    },
  },
  {
    find: ".work-picture",
    th: ["รูปผลงาน", "กดแล้วรูปบินไปเต็มจอด้วย Web Animations API"],
    en: ["Work picture", "Flies to full screen with the Web Animations API"],
    file: "src/grow.ts",
    tech: ["Web Animations API"],
    steps: {
      th: ["วัดตำแหน่งรูปบนการ์ดและตำแหน่งปลายทางในหน้าต่าง", "สร้างรูปสำเนาบินจากจุดหนึ่งไปอีกจุด", "ปิดหน้าต่างแล้วบินกลับทางเดิม"],
      en: ["Measures the picture on the card and where it will end", "A copy flies from one to the other", "Closing flies it home again"],
    },
  },
  {
    find: ".work-file",
    th: ["ปกเอกสาร", "หน้าแรกของ PDF วาดสดด้วย pdf.js"],
    en: ["File cover", "The PDF's first page, drawn live by pdf.js"],
    file: "PdfPages.tsx",
    tech: ["pdf.js", "IntersectionObserver", "localStorage"],
    steps: {
      th: ["โหลด pdf.js เมื่อการ์ดใกล้เข้าจอ", "วาดหน้าแรกตอนที่ผู้อ่านหยุดเลื่อน เพื่อไม่ให้กระตุก", "เก็บภาพที่วาดไว้ ครั้งหน้าแสดงได้ทันที"],
      en: ["pdf.js is fetched as the card nears the screen", "The page is drawn while the reader is still", "The picture is kept for next time"],
    },
  },
  {
    find: ".flip-tab",
    th: ["มุมพลิกการ์ด", "พลิกด้วย CSS rotateY"],
    en: ["Turn-over tab", "Flips the card with CSS rotateY"],
    file: "WorkCard.tsx",
    tech: ["CSS rotateY"],
    steps: {
      th: ["เมาส์ชี้หรือนิ้วแตะที่มุม", "หมุนการ์ดครึ่งรอบ หน้าและหลังสลับกันกลางทาง", "ด้านที่ซ่อนอยู่กดไม่ได้ (inert)"],
      en: ["Point or tap at the corner", "The card turns half way round, faces swapping midway", "The hidden face cannot be pressed (inert)"],
    },
  },
  {
    find: ".contact-card",
    th: ["ช่องทางติดต่อ", "ไอคอน SVG และคัดลอกด้วย Clipboard API"],
    en: ["Contact", "SVG icons; copies with the Clipboard API"],
    file: "CopyButton.tsx",
    tech: ["SVG", "Clipboard API"],
    steps: {
      th: ["ช่องทางที่มีลิงก์ กดแล้วเปิดได้เลย", "ช่องทางที่ไม่มีลิงก์ มีปุ่มคัดลอก", "คัดลอกสำเร็จจะมีเครื่องหมายถูกวาดขึ้น"],
      en: ["Channels with a link open directly", "The others offer a copy button", "A tick draws itself when copied"],
    },
  },
  {
    find: ".site-qr",
    th: ["QR Code", "ไฟล์ SVG ของที่อยู่เว็บนี้"],
    en: ["QR code", "An SVG file of this site's address"],
    file: "public/qr.svg",
    tech: ["SVG", "QR Code"],
    steps: {
      th: ["ภาพเป็นสี่เหลี่ยมเล็กๆ เขียนด้วย SVG จึงคมทุกขนาด", "สแกนแล้วเปิดเว็บนี้", "ดาวน์โหลดไปใส่โปสเตอร์ได้"],
      en: ["Little squares in SVG, sharp at any size", "Scanning opens this site", "Can be downloaded for a poster"],
    },
  },
  {
    find: ".dots",
    th: ["จุดบอกตำแหน่ง", "บอกว่าอยู่หัวข้อไหน"],
    en: ["Position dots", "Shows which section is on screen"],
    file: "SectionDots.tsx",
    tech: ["React", "anchor"],
    steps: {
      th: ["หนึ่งจุดต่อหนึ่งหัวข้อ", "จุดของหัวข้อที่อ่านอยู่ถูกทำเครื่องหมาย", "กดเพื่อกระโดดไปหัวข้อนั้น"],
      en: ["One dot for each section", "The one being read is marked", "Press to jump there"],
    },
  },
  {
    find: ".robot-body",
    th: ["หุ่นยนต์ผู้ช่วย", "ตัวการ์ตูน SVG พาไปหัวข้อถัดไป"],
    en: ["Helper robot", "An SVG character that leads to the next section"],
    file: "Robot.tsx",
    tech: ["SVG", "CSS animation"],
    steps: {
      th: ["พูดข้อความประจำหัวข้อที่อ่านอยู่", "กดแล้วพาไปหัวข้อถัดไป", "ซ่อนได้ด้วยปุ่มกากบาท"],
      en: ["Says a line for the section being read", "A press takes you to the next one", "The cross sends it away"],
    },
  },
  {
    find: ".to-top",
    th: ["ปุ่มขึ้นบนสุด", "โผล่เมื่อเลื่อนลงมาไกล"],
    en: ["Back to top", "Appears once you are far down"],
    file: "ToTop.tsx",
    tech: ["scroll event"],
    steps: {
      th: ["ซ่อนอยู่ตอนอยู่ใกล้บนสุด", "โผล่เมื่อเลื่อนเกิน 600 พิกเซล", "กดแล้วเลื่อนกลับอย่างนุ่มนวล"],
      en: ["Hidden near the top", "Appears past 600 pixels", "Glides back up"],
    },
  },
  {
    find: ".theme-toggle",
    th: ["ปุ่มเปลี่ยนสี","สีใหม่ขยายเป็นวงกลมออกจากปุ่ม"],
    en: ["Colour button","The new colour spreads from the button"],
    file: "ThemeToggle.tsx",
    tech: ["View Transitions","localStorage"],
    steps: {
      th: ["กดแล้วเลือกสีถัดไปในวง","เบราว์เซอร์ที่รองรับจะขยายสีใหม่เป็นวงกลม","จำสีไว้ใช้ครั้งต่อไป"],
      en: ["A press takes the next colour","Where supported, it spreads as a circle","The choice is remembered"],
    },
  },
  {
    find: ".lang-toggle",
    th: ["ปุ่มเปลี่ยนภาษา","สลับไทยและอังกฤษ"],
    en: ["Language button","Switches Thai and English"],
    file: "LangToggle.tsx",
    tech: ["React","localStorage"],
    steps: {
      th: ["กดแล้วสลับภาษาทั้งหน้า","อนิเมชันตามการเลื่อนวัดตำแหน่งใหม่","จำภาษาไว้ใช้ครั้งต่อไป"],
      en: ["A press switches the whole page","Scroll motion is measured again","The choice is remembered"],
    },
  },
  {
    find: ".download-all",
    th: ["ดาวน์โหลดทั้งชุด","รวมทุกไฟล์เป็น ZIP ในเบราว์เซอร์"],
    en: ["Download all","Packs every file into a ZIP in the browser"],
    file: "DownloadAll.tsx",
    tech: ["Fetch API","ZIP","Blob"],
    steps: {
      th: ["ดึงไฟล์ทีละไฟล์และนับให้เห็น","เขียนไฟล์ ZIP ด้วยโค้ดของเว็บเอง","ส่งให้เบราว์เซอร์บันทึกลงเครื่อง"],
      en: ["Fetches the files one by one","Writes the ZIP with the site's own code","Hands it to the browser to save"],
    },
  },
  {
    find: ".edu-tabs",
    th: ["สลับมุมมอง","เลือกเส้นทางการเรียนรู้หรือโมเดลโรงเรียน"],
    en: ["View switch","The learning path or the school models"],
    file: "Education.tsx",
    tech: ["React"],
    steps: {
      th: ["กดเลือกมุมมอง","อนิเมชันถูกสร้างใหม่ให้ตรงมุมมอง","มุมมองที่ไม่ได้เลือกถูกซ่อน"],
      en: ["Pick a view","Motion is rebuilt for it","The other view is hidden"],
    },
  },
  {
    find: ".edu-path",
    th: ["เส้นระหว่างช่วงการเรียน","ตราโรงเรียนต่อกันจนถึงเป้าหมาย"],
    en: ["The path","Crests linked on to the goal"],
    file: "LearningRoute.tsx",
    tech: ["CSS","React"],
    steps: {
      th: ["หนึ่งตราต่อหนึ่งช่วง และดาวคือเป้าหมาย","ความยาวเส้นสีคิดจากปีที่อ่านถึง","กดตราเพื่อเลื่อนไปช่วงนั้น"],
      en: ["A crest per stage, a star for the goal","The coloured length follows the year read","Press a crest to go there"],
    },
  },
  {
    find: ".edu-skills",
    th: ["ทักษะและหลักฐาน","กดทักษะเพื่อไปดูผลงานที่ยืนยัน"],
    en: ["Skills and proof","Each skill opens its proof"],
    file: "LearningRoute.tsx",
    tech: ["React"],
    steps: {
      th: ["แต่ละทักษะผูกกับชื่อผลงาน","กดแล้วหน้าเลื่อนไปหาการ์ดนั้น","การ์ดเรืองแสงสั้นๆ ให้เห็นว่าคือใบไหน"],
      en: ["Each skill is tied to a work's title","A press scrolls to its card","The card glows briefly"],
    },
  },
  {
    find: ".edu-card",
    th: ["การ์ดช่วงการศึกษา","ข้อมูลโรงเรียนและสีประจำโรงเรียน"],
    en: ["School stage card","A stage in its school's colours"],
    file: "Education.tsx",
    tech: ["React","CSS variables"],
    steps: {
      th: ["ข้อมูลมาจากรายการประวัติการศึกษา","สีประจำโรงเรียนส่งเป็นตัวแปร CSS","ใบที่กำลังอ่านถูกเน้น"],
      en: ["Filled from the schooling list","School colours travel as CSS variables","The one being read is highlighted"],
    },
  },
  {
    find: "footer",
    th: ["ท้ายเว็บ", "Service worker เก็บหน้าเว็บไว้ให้เปิดได้ตอนไม่มีเน็ต"],
    en: ["Footer", "A service worker keeps the site working offline"],
    file: "public/sw.js",
    tech: ["Service worker", "Cache API"],
    steps: {
      th: ["ตอนติดตั้ง เก็บไฟล์ของเว็บและผลงานไว้ในเครื่อง", "มีเน็ตจะดึงของใหม่ก่อน เน็ตช้าหรือหลุดใช้ของที่เก็บไว้", "ไฟล์กุญแจของระบบแก้ไขไม่ถูกเก็บ"],
      en: ["On install, the site and works are kept on the device", "Fresh from the network first; the kept copy when slow or offline", "The editor's key file is never kept"],
    },
  },
];

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** the smallest box holding the point, so a part inside another is the one named; -1 when over none */
export function under(boxes: Box[], x: number, y: number): number {
  let best = -1;
  boxes.forEach((box, i) => {
    if (x < box.x || y < box.y || x > box.x + box.width || y > box.y + box.height) return;
    if (best < 0 || box.width * box.height < boxes[best].width * boxes[best].height) best = i;
  });
  return best;
}

/** an element written the way a style sheet would name it: tag, id, and its first classes */
export const nameOf = (tag: string, id: string, classes: string[]) =>
  tag +
  (id ? `#${id}` : "") +
  classes
    .slice(0, 2)
    .map((name) => `.${name}`)
    .join("");

/** a computed colour as #rrggbb, with how solid it is when not fully; "" when invisible. Other forms stay as written */
export function hex(color: string): string {
  const found = /^rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)$/.exec(color);
  if (!found) return color;
  const solid = found[4] === undefined ? 1 : Number(found[4]);
  if (!solid) return "";
  const code = "#" + found.slice(1, 4).map((value) => Number(value).toString(16).padStart(2, "0")).join("");
  return solid < 1 ? `${code} ${Math.round(solid * 100)}%` : code;
}

/** a computed colour as numbers: red, green, blue and how solid; null for forms other than rgb */
export function rgba(color: string): [number, number, number, number] | null {
  const found = /^rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)$/.exec(color);
  return found ? [Number(found[1]), Number(found[2]), Number(found[3]), found[4] === undefined ? 1 : Number(found[4])] : null;
}

/** how far apart two colours are in lightness, from 1 (the same) to 21 (black on white), as WCAG counts it */
export function contrast(a: number[], b: number[]): number {
  const light = (color: number[]) =>
    color.slice(0, 3).reduce((sum, value, i) => {
      const part = value / 255;
      return sum + [0.2126, 0.7152, 0.0722][i] * (part <= 0.04045 ? part / 12.92 : ((part + 0.055) / 1.055) ** 2.4);
    }, 0.05);
  const [x, y] = [light(a), light(b)];
  return Math.max(x, y) / Math.min(x, y);
}

/** an opening tag with its attributes one to a line, long values cut short */
export function openTag(tag: string, attributes: string[][], long = 90): string {
  const lines = attributes.map(([name, value]) => `  ${name}="${value.length > long ? `${value.slice(0, long)}…` : value}"`);
  return lines.length ? `<${tag}\n${lines.join("\n")}\n>` : `<${tag}>`;
}

/** the declarations of a rule one by one; a semicolon inside quotes or brackets does not end one */
export const declarations = (body: string): string[] => (body.match(/(?:"[^"]*"|\([^()]*(?:\([^()]*\))*[^()]*\)|[^;])+/g) ?? []).map((line) => line.trim()).filter(Boolean);

/** the selectors of a list, split at its own commas only */
export function branches(selector: string): string[] {
  const parts = [""];
  let depth = 0;
  let quote = "";
  for (let i = 0; i < selector.length; i++) {
    const char = selector[i];
    if (char === "\\") {
      parts[parts.length - 1] += char + (selector[++i] ?? "");
      continue;
    }
    if (quote) quote = char === quote ? "" : quote;
    else if (char === '"' || char === "'") quote = char;
    else if (char === "(" || char === "[") depth++;
    else if (char === ")" || char === "]") depth--;
    if (char === "," && !depth && !quote) parts.push("");
    else parts[parts.length - 1] += char;
  }
  return parts.map((part) => part.trim()).filter(Boolean);
}

/** how strongly one selector claims an element: [ids, classes and the like, tags], as CSS counts it */
export function specificity(selector: string): [number, number, number] {
  const total: [number, number, number] = [0, 0, 0];
  // escaped characters are part of a name, and quoted values say nothing
  let rest = selector.replace(/\\./g, "x").replace(/"[^"]*"|'[^']*'/g, "x");
  // :where() counts nothing; :not(), :is() and :has() count as their strongest argument
  for (let found; (found = /:(where|not|is|has)\(/.exec(rest)); ) {
    let end = found.index + found[0].length;
    for (let depth = 1; end < rest.length && depth; end++) depth += rest[end] === "(" ? 1 : rest[end] === ")" ? -1 : 0;
    if (found[1] !== "where") {
      const inner = branches(rest.slice(found.index + found[0].length, end - 1)).map(specificity);
      const best = inner.sort((a, b) => b[0] - a[0] || b[1] - a[1] || b[2] - a[2])[0];
      best?.forEach((value, i) => (total[i] += value));
    }
    rest = rest.slice(0, found.index) + " " + rest.slice(end);
  }
  const take = (pattern: RegExp, slot: number) => {
    rest = rest.replace(pattern, () => (total[slot]++, " "));
  };
  take(/::[\w-]+(\([^)]*\))?|:(before|after|first-line|first-letter)\b/g, 2);
  take(/\[[^\]]*\]/g, 1);
  take(/#[\w-]+/g, 0);
  take(/\.[\w-]+|:[\w-]+(\([^)]*\))?/g, 1);
  take(/(?<![\w-])[a-zA-Z][\w-]*/g, 2);
  return total;
}

/** the states a selector waits for, and the selector without them: ".a:hover" gives ".a" and ["hover"] */
export function stateless(selector: string): { plain: string; states: string[] } {
  const states: string[] = [];
  const plain = selector.replace(/(?<!\\):(hover|focus-visible|focus-within|focus|active|checked|disabled)\b/g, (_, state: string) => (states.push(state), "\0"));
  // a step that was nothing but states still stands for some element
  return { plain: plain.replace(/(^|[\s>+~])\0+(?=$|[\s>+~])/g, "$1*").replaceAll("\0", ""), states };
}

export interface Branch {
  tagName: string;
  children: ArrayLike<Branch>;
}

/** the inside of an element as an indented list of tags, neighbours alike written once with their number */
export function tree(root: Branch, depth = 3, most = 14): string[] {
  const lines: string[] = [];
  const walk = (node: Branch, level: number, times: number) => {
    lines.push(`${"  ".repeat(level)}<${node.tagName.toLowerCase()}>${times > 1 ? ` × ${times}` : ""}`);
    if (level >= depth) return;
    const children = Array.from(node.children);
    for (let i = 0; i < children.length && lines.length <= most; ) {
      let end = i + 1;
      while (end < children.length && children[end].tagName === children[i].tagName) end++;
      walk(children[i], level + 1, end - i);
      i = end;
    }
  };
  walk(root, 0, 1);
  return lines.length > most ? [...lines.slice(0, most), "…"] : lines;
}
