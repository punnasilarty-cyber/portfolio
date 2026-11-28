// คำอธิบายรายบรรทัดของโค้ดจริงที่แว่น X-ray นำมาแสดง แต่ละข้อผูกกับข้อความในบรรทัด (anchor)
// เทสต์จะตรวจว่าข้อความนั้นยังอยู่ในไฟล์จริง ถ้าแก้โค้ดจนหาไม่พบ เทสต์จะไม่ผ่าน

export type Note = [anchor: string, th: string, en: string];

export const NOTES: Record<string, Note[]> = {
  "NavSlide.tsx": [
    ['nav.querySelector<HTMLElement>("a.fx-active")', "หาลิงก์ของหัวข้อที่กำลังอ่าน ถ้าอยู่บนสุดใช้ลิงก์หน้าแรก", "Finds the link being read, or the home link at the top"],
    ["slide.style.transform", "เลื่อนแถบไปตำแหน่งของลิงก์นั้น", "Slides the marker to that link"],
    ["new MutationObserver(place)", "เมื่อ class ในเมนูเปลี่ยน ให้วางแถบใหม่", "Replaces the marker whenever a class changes"],
  ],
  "Menu.tsx": [
    ['onFeature("menu"', "รอฟังคำสั่งเปิดเมนู", "Listens for the request to open"],
    ["dialog.current!.showModal()", "เปิดเป็นหน้าต่างบังหน้าเว็บของเบราว์เซอร์เอง", "Opens as the browser's own modal window"],
    ["setTimeout(() => (open ===", "รอเมนูปิดก่อน แล้วเปิดฟีเจอร์ที่เลือก", "Waits for the menu to close, then opens the choice"],
  ],
  "Palette.tsx": [
    ['event.code !== "KeyK"', "รับปุ่ม Ctrl+K โดยดูตำแหน่งปุ่ม จึงใช้ได้แม้แป้นภาษาไทย", "Catches Ctrl+K by key position, so any keyboard language works"],
    ["const shown = search(items, query)", "กรองรายการให้เหลือที่ตรงกับคำที่พิมพ์", "Keeps the items matching what was typed"],
    ["setTimeout(item.run, 0)", "ปิดกล่องก่อน แล้วทำคำสั่ง", "Closes the box first, then runs the command"],
  ],
  "HeroMotion.tsx": [
    ["const SHAPE =", "รูปที่จะให้ปรากฏจากกำแพงตัวอักษร", "The shape lit out of the wall of letters"],
    ["getImageData(0, 0, width, height)", "อ่านจุดสีของรูปที่วาดลับๆ เพื่อรู้ว่าช่องไหนอยู่ในรูป", "Reads the hidden drawing to learn which cells are inside it"],
    ["requestAnimationFrame(tick)", "ขอให้เบราว์เซอร์เรียกวาดเฟรมถัดไป", "Asks the browser for the next frame"],
    ["now - last < 33", "วาดไม่เกินราว 30 ภาพต่อวินาที และไม่วาดเมื่อมองไม่เห็น", "No more than about 30 frames a second, none while unseen"],
  ],
  "StaggerText.tsx": [
    ['granularity: "grapheme"', "ตัดทีละอักษรโดยสระและวรรณยุกต์ไม่หลุด", "Splits letter by letter keeping Thai marks attached"],
    ["const done =", "แต่ละตัวมีเวลาเฉลยของตัวเอง ตัวซ้ายก่อน", "Each letter has its own moment, left first"],
    ["cell.dataset.glyph =", "สุ่มสัญลักษณ์ระหว่างรอ", "A random symbol while it waits"],
  ],
  "AboutText.tsx": [
    ["useSyncExternalStore(", "บอกว่าตอนนี้ทำงานในเบราว์เซอร์แล้ว จึงตัดคำได้", "Knows it is now in the browser, so words may be split"],
    ['gsap.fromTo(".fx-word"', "ให้ทุกคำสว่างจาก 0.18 ถึง 1 ตามระยะเลื่อน", "Lights every word from 0.18 to 1 along the scroll"],
    ['calm?.addEventListener("change", apply)', "เคารพช่องหยุดแอนิเมชัน", "Respects the stop-animation box"],
  ],
  "src/app/globals.css": [
    [".fx-track {", "แถวชื่อหัวข้อสองชุดที่ต่อกัน", "The row holding the names twice"],
    ["animation: fx-drift 40s linear infinite;", "เลื่อนครบรอบใน 40 วินาที วนไม่สิ้นสุด", "One round in 40 seconds, forever"],
    ["@keyframes fx-drift {", "ปลายทางคือเลื่อนไปครึ่งความกว้าง", "It ends half a width to the left"],
  ],
  "src/motion.ts": [
    ["gsap.registerPlugin(ScrollTrigger)", "เปิดใช้ส่วนเสริมที่ผูกอนิเมชันกับการเลื่อน", "Turns on the plug-in that ties motion to scroll"],
    ["gsap.from(heading, {", "หัวข้อเริ่มจากต่ำ เล็ก และจาง", "Headings start low, small and faint"],
    ['toggleClass: { targets: `nav a[href="#${section.id}"]`', "ใส่ class ให้ลิงก์เมนูของหัวข้อที่อยู่บนจอ", "Marks the menu link of the section on screen"],
  ],
  "SchoolScene.tsx": [
    ["const iso = ", "สูตรแปลงจุดสามมิติ (x, y, z) เป็นจุดบนจอ", "Turns a 3D point into a point on screen"],
    ["function Box(", "กล่องหนึ่งใบวาดสามด้านที่มองเห็น", "A box is its three visible sides"],
    ["const shade =", "ด้านที่หันจากแสงทำให้มืดลง", "Sides away from the light are darkened"],
  ],
  "LearningRoute.tsx": [
    ["setStep(yearAt(cards, readingLine(), years))", "ดูว่าการ์ดไหนอยู่ที่เส้นอ่าน แล้วเลือกปีการศึกษา", "Picks the year from the card at the reading line"],
    ["reach(years, step, education.length)", "คำนวณว่าเส้นควรเติมสีถึงไหน", "Works out how far to fill the line"],
    ["const card = heading?.closest(", "หาการ์ดผลงานที่ยืนยันทักษะ", "Finds the work card that shows the skill"],
  ],
  "SpotlightCard.tsx": [
    ["const MAX_TILT_DEG = 6;", "เอียงมากสุด 6 องศา", "Never leans more than 6 degrees"],
    ['el.style.setProperty("--spot-x"', "บอก CSS ว่าเมาส์อยู่ตรงไหน เพื่อวางแสง", "Tells the CSS where to put the light"],
    ["el.style.transform = `perspective(900px)", "หมุนการ์ดเป็นสามมิติตามเมาส์", "Turns the card in 3D toward the pointer"],
  ],
  "src/grow.ts": [
    ["export function contained(", "คำนวณกรอบของรูปเมื่อแสดงเต็มโดยไม่บิดสัดส่วน", "The box a picture takes when shown whole"],
    ['document.createElement("img")', "สร้างรูปสำเนาไว้บิน", "Makes the copy that will fly"],
    ["flyer.animate(", "สั่งให้บินจากกรอบเล็กไปกรอบใหญ่", "Flies it from the small box to the large"],
  ],
  "PdfPages.tsx": [
    ['await import("pdfjs-dist', "โหลดตัวอ่าน PDF เฉพาะเมื่อต้องใช้", "Fetches the PDF reader only when needed"],
    ["new IntersectionObserver(", "รอจนการ์ดใกล้เข้าจอ", "Waits until the card is nearly on screen"],
    ["localStorage.setItem(key", "เก็บภาพหน้าปกไว้ใช้ครั้งต่อไป", "Keeps the cover for next time"],
  ],
  "WorkCard.tsx": [
    ["const [flipped, setFlipped] = useState(false)", "จำว่าการ์ดพลิกอยู่หรือไม่", "Remembers whether the card is turned"],
    ["inert={flipped}", "ด้านหน้ากดไม่ได้ขณะพลิกไปด้านหลัง", "The front cannot be pressed while turned away"],
    ['onPointerEnter={(event) => event.pointerType === "mouse"', "เมาส์ชี้ที่มุมแล้วพลิก ส่วนนิ้วใช้การแตะ", "A mouse turns it by pointing; a finger presses"],
  ],
  "CopyButton.tsx": [
    ["navigator.clipboard.writeText(value)", "คัดลอกข้อความไปที่คลิปบอร์ด", "Copies the text to the clipboard"],
    ["setTimeout(() => setMessage(", "ข้อความแจ้งหายเองใน 3 วินาที", "The message leaves after 3 seconds"],
  ],
  "SectionDots.tsx": [
    ["const at = useSection(ids)", "ถามว่าตอนนี้อ่านหัวข้อไหน", "Asks which section is being read"],
    ['aria-current={at === id ? "location" : undefined}', "บอกทั้งสายตาและโปรแกรมอ่านจอว่าอยู่จุดนี้", "Says so to eyes and screen readers alike"],
  ],
  "Robot.tsx": [
    ["const SAY:", "คำพูดของหุ่นยนต์ในแต่ละหัวข้อ", "The robot's line for each section"],
    ["const next = IDS[(IDS.indexOf(at) + 1) % IDS.length]", "หัวข้อถัดไป ถ้าสุดแล้ววนกลับ", "The next section, round to the start"],
    ["scrollIntoView(", "เลื่อนหน้าไปหา", "Scrolls the page there"],
  ],
  "ToTop.tsx": [
    ["setShown(window.scrollY > 600)", "แสดงปุ่มเมื่อเลื่อนลงเกิน 600 พิกเซล", "Shows past 600 pixels down"],
    ["window.scrollTo({ top: 0", "เลื่อนกลับบนสุด", "Goes back to the top"],
  ],
  "public/sw.js": [
    ["async function install()", "ครั้งแรกเก็บไฟล์เว็บทั้งหมดไว้ในเครื่อง", "On first visit, keeps the whole site"],
    ['if (copy && key.startsWith(`${scope}_next/static/`)) return copy;', "ไฟล์ที่ชื่อไม่ซ้ำ ใช้ของในเครื่องได้เลย", "Files with unique names come straight from the device"],
    ["vault.txt`) return;", "ไฟล์กุญแจของระบบแก้ไขไม่ถูกเก็บ", "The editor's key file is left to the network"],
  ],
  "ThemeToggle.tsx": [
    ["document.startViewTransition", "ให้เบราว์เซอร์ถ่ายภาพก่อนและหลังเปลี่ยนสี", "Lets the browser picture before and after"],
    ["clipPath: [`circle(0 at", "สีใหม่ขยายเป็นวงกลมออกจากปุ่ม", "The new colour spreads as a circle from the button"],
    ['localStorage.getItem("theme")', "จำสีที่เลือกไว้", "Remembers the chosen colour"],
  ],
  "LangToggle.tsx": [
    ["setEnglish(!english)", "สลับภาษา", "Switches language"],
    ['window.dispatchEvent(new Event("view-change"))', "ความยาวข้อความเปลี่ยน จึงให้วัดอนิเมชันใหม่", "Text lengths changed, so scroll motion is measured again"],
  ],
  "DownloadAll.tsx": [
    ["for (const [i, file] of files.entries())", "ดึงไฟล์ทีละไฟล์ และนับให้เห็น", "Fetches the files one at a time, counting"],
    ["zip(packed)", "รวมเป็น ZIP ในเบราว์เซอร์เอง", "Packs the ZIP in the browser itself"],
    ["link.click()", "กดลิงก์ให้อัตโนมัติเพื่อบันทึกไฟล์", "Presses a link to save the file"],
  ],
  "Education.tsx": [
    ["const VIEWS = [", "มุมมองสองแบบ: เส้นทาง และโมเดลโรงเรียน", "Two views: the path and the models"],
    ["<LearningRoute onStage={setReading} />", "เส้นทางบอกกลับว่าอ่านถึงช่วงไหน", "The path reports which stage is read"],
    ['className={view === "route" && i === reading', "การ์ดที่กำลังอ่านเด่นกว่าใบอื่น", "The card being read stands out"],
  ],
};

export interface Line {
  number: number;
  text: string;
  note?: { th: string; en: string };
}

/** only the stretches of a file around its explained lines, joined where they touch; nothing when none is found */
export function excerpt(source: string, notes: Note[], around = 1): Line[][] {
  const lines = source.replaceAll("\r\n", "\n").split("\n");
  const found = new Map<number, Note>();
  for (const note of notes) {
    const at = lines.findIndex((line) => line.includes(note[0]));
    if (at >= 0) found.set(at, note);
  }
  const blocks: Line[][] = [];
  let reached = -1;
  for (const at of [...found.keys()].sort((a, b) => a - b)) {
    const from = Math.max(0, at - around, reached + 1);
    const to = Math.min(lines.length - 1, at + around);
    if (to < from) continue;
    const block = Array.from({ length: to - from + 1 }, (_, i): Line => {
      const note = found.get(from + i);
      return { number: from + i + 1, text: lines[from + i], ...(note && { note: { th: note[1], en: note[2] } }) };
    });
    if (blocks.length && from === reached + 1) blocks[blocks.length - 1].push(...block);
    else blocks.push(block);
    reached = to;
  }
  return blocks;
}
