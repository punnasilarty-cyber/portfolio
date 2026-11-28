// ลำดับ เวลา คำอธิบาย และการคำนวณของฉาก “AI ทำอะไรได้” ภาพเป็นการจำลอง ไม่ได้เรียก AI จริง

export type Words = { th: string; en: string };
export type AiScene = {
  id: "hello" | "learn" | "see" | "hear" | "language" | "code" | "draw" | "reason" | "predict" | "plan" | "turn" | "fake" | "watch" | "flood" | "control" | "end";
  seconds: number;
  title: Words;
  caption: Words;
  /** part of the dark side: a made-up future, shown in warning colours */
  dark?: boolean;
  /** the longer explanation: how it works in three steps, where it is used, and where it fails.
      In a dark scene: how it could happen, what it harms, and how to guard against it */
  more?: { how: [Words, Words, Words]; uses: Words; limit: Words };
};

export const AI_SCENES: AiScene[] = [
  { id: "hello", seconds: 7, title: { th: "AI ทำอะไรได้บ้าง", en: "What can AI do?" }, caption: { th: "ปัญญาประดิษฐ์คือโปรแกรมที่ทำงานซึ่งปกติต้องใช้การรับรู้หรือการคิด ผมจะแสดงให้ดูทีละอย่าง", en: "Artificial intelligence is software doing work that usually needs perception or thought. Let me show you one at a time" } },
  {
    id: "learn",
    seconds: 18,
    title: { th: "เรียนรู้จากตัวอย่าง", en: "Learning from examples" },
    caption: { th: "พื้นฐานของความสามารถอื่นๆ: ปรับตัวเองจนแยกข้อมูลได้ถูกมากขึ้น", en: "The base of the other abilities: it adjusts itself until it sorts the data better" },
    more: {
      how: [
        { th: "ดูตัวอย่างจำนวนมากที่มีคำตอบกำกับ", en: "Look at many examples that come with answers" },
        { th: "ลองเดา แล้ววัดว่าผิดไปเท่าไร", en: "Guess, then measure how wrong the guess is" },
        { th: "ปรับตัวเลขภายในทีละนิดให้ผิดน้อยลง ทำซ้ำหลายรอบ", en: "Nudge the numbers inside to be less wrong, again and again" },
      ],
      uses: { th: "กรองอีเมลขยะ แยกใบพืชที่เป็นโรค แนะนำวิดีโอ", en: "Filtering spam, spotting diseased leaves, suggesting videos" },
      limit: { th: "ข้อมูลน้อยหรือเอนเอียง คำตอบก็เอนเอียงตาม", en: "Too little or one-sided data gives one-sided answers" },
    },
  },
  {
    id: "see",
    seconds: 16,
    title: { th: "มองเห็นภาพ", en: "Seeing" },
    caption: { th: "หาว่าในภาพมีอะไร อยู่ตรงไหน และมั่นใจแค่ไหน", en: "Finds what is in a picture, where, and how sure it is" },
    more: {
      how: [
        { th: "ภาพคือตารางตัวเลขของสีในแต่ละจุด", en: "A picture is a table of numbers, one colour per dot" },
        { th: "โครงข่ายประสาทเทียมหาเส้นขอบ รูปทรง แล้วประกอบเป็นวัตถุ", en: "A neural network finds edges, then shapes, then whole objects" },
        { th: "ตอบชื่อวัตถุ ตำแหน่ง และค่าความมั่นใจ", en: "It answers with the name, the place and how sure it is" },
      ],
      uses: { th: "ช่วยแพทย์อ่านภาพเอกซเรย์ คัดแยกขยะ ปลดล็อกมือถือด้วยใบหน้า", en: "Helping doctors read X-rays, sorting waste, unlocking phones by face" },
      limit: { th: "แสงน้อยหรือของที่ไม่เคยเห็นทำให้ทายผิดได้ แม้บอกว่ามั่นใจสูง", en: "Poor light or unfamiliar things cause mistakes, even with high confidence" },
    },
  },
  {
    id: "hear",
    seconds: 15,
    title: { th: "ฟังเสียง", en: "Hearing" },
    caption: { th: "เปลี่ยนคลื่นเสียงเป็นตัวหนังสือ", en: "Turns sound waves into text" },
    more: {
      how: [
        { th: "ตัดเสียงเป็นช่วงสั้นๆ", en: "Cut the sound into very short slices" },
        { th: "ดูว่าแต่ละช่วงมีความถี่อะไรบ้าง", en: "See which pitches each slice holds" },
        { th: "ใช้คำรอบข้างช่วยทำนายว่าพูดคำว่าอะไร", en: "Use the surrounding words to work out what was said" },
      ],
      uses: { th: "คำบรรยายใต้คลิป สั่งงานด้วยเสียง ช่วยผู้มีปัญหาการได้ยิน", en: "Captions, voice commands, support for people who are hard of hearing" },
      limit: { th: "เสียงรบกวน สำเนียง และชื่อเฉพาะมักทำให้ผิด", en: "Noise, accents and unusual names often trip it up" },
    },
  },
  {
    id: "language",
    seconds: 17,
    title: { th: "เข้าใจภาษา", en: "Language" },
    caption: { th: "ตัดประโยคเป็นชิ้นเล็กๆ แล้วแปลตามความหมาย", en: "Cuts a sentence into small pieces, then translates the meaning" },
    more: {
      how: [
        { th: "ตัดข้อความเป็นชิ้นเรียกว่าโทเคน", en: "Split the text into pieces called tokens" },
        { th: "แทนแต่ละโทเคนด้วยชุดตัวเลขที่สะท้อนความหมาย", en: "Turn each token into numbers that carry its meaning" },
        { th: "ดูว่าคำไหนเกี่ยวกับคำไหน แล้วสร้างคำถัดไปทีละคำ", en: "Weigh how words relate, then produce the next word one at a time" },
      ],
      uses: { th: "แปลภาษา สรุปบทความ ผู้ช่วยตอบคำถาม", en: "Translation, summaries, question-answering assistants" },
      limit: { th: "แต่งเรื่องที่ฟังดูจริงได้ จึงต้องตรวจกับแหล่งข้อมูล", en: "It can invent things that sound true, so check a reliable source" },
    },
  },
  {
    id: "code",
    seconds: 16,
    title: { th: "เขียนโปรแกรม", en: "Writing code" },
    caption: { th: "บอกสิ่งที่ต้องการ ได้โค้ดที่ลองรันได้", en: "Say what you need and get code you can run" },
    more: {
      how: [
        { th: "อ่านคำสั่งว่าต้องการให้โปรแกรมทำอะไร", en: "Read what the program is meant to do" },
        { th: "อาศัยรูปแบบที่เรียนจากโค้ดจำนวนมาก", en: "Draw on patterns learned from a great deal of code" },
        { th: "สร้างโค้ดทีละโทเคน แล้วคนนำไปรันและทดสอบ", en: "Write it token by token; a person runs and tests it" },
      ],
      uses: { th: "เขียนฟังก์ชัน หาจุดผิด อธิบายโค้ดให้ผู้เริ่มเรียน", en: "Writing functions, finding bugs, explaining code to beginners" },
      limit: { th: "รันได้แต่ผลผิดหรือมีช่องโหว่ได้ ต้องอ่านและทดสอบเอง", en: "Code may run yet be wrong or unsafe, so read and test it" },
    },
  },
  {
    id: "draw",
    seconds: 16,
    title: { th: "สร้างภาพ", en: "Making pictures" },
    caption: { th: "เริ่มจากจุดรบกวน แล้วค่อยๆ ลบออกจนเป็นภาพตามคำสั่ง", en: "Starts from noise and clears it away until the picture appears" },
    more: {
      how: [
        { th: "แปลงคำสั่งเป็นตัวเลขแทนความหมาย", en: "Turn the request into numbers for its meaning" },
        { th: "เริ่มจากภาพที่มีแต่จุดรบกวน", en: "Begin with a picture of pure noise" },
        { th: "ลบสิ่งรบกวนทีละขั้นโดยมีความหมายนั้นนำทาง (diffusion)", en: "Remove noise step by step, guided by that meaning (diffusion)" },
      ],
      uses: { th: "ร่างไอเดียโปสเตอร์ ภาพประกอบ ออกแบบเบื้องต้น", en: "Poster ideas, illustrations, early designs" },
      limit: { th: "ตัวหนังสือและมือมักเพี้ยน ต้องระวังสิทธิ์ผลงานและภาพปลอม", en: "Text and hands often come out wrong; mind copyright and fakes" },
    },
  },
  {
    id: "reason",
    seconds: 16,
    title: { th: "คิดเป็นขั้นตอน", en: "Step by step" },
    caption: { th: "แก้โจทย์ทีละขั้น แล้วตรวจคำตอบ", en: "Solves a problem in steps, then checks the answer" },
    more: {
      how: [
        { th: "แยกโจทย์ใหญ่เป็นขั้นย่อย", en: "Break a big problem into small steps" },
        { th: "ทำทีละขั้นโดยใช้ผลของขั้นก่อน", en: "Do each step using the one before" },
        { th: "แทนค่าย้อนกลับเพื่อตรวจคำตอบ", en: "Put the answer back in to check it" },
      ],
      uses: { th: "ช่วยติวคณิต วางแผนงาน วิเคราะห์ปัญหา", en: "Maths tutoring, planning, working through problems" },
      limit: { th: "ขั้นตอนดูน่าเชื่อแต่คำนวณผิดได้ ต้องคิดตาม", en: "Steps can look convincing and still be wrong, so follow them" },
    },
  },
  {
    id: "predict",
    seconds: 16,
    title: { th: "ทำนายแนวโน้ม", en: "Forecasting" },
    caption: { th: "ตัวอย่างสมมติ: ขยะที่เก็บได้รอบสระในแต่ละสัปดาห์ (กิโลกรัม)", en: "Made-up example: rubbish collected around a pond each week (kg)" },
    more: {
      how: [
        { th: "รวบรวมข้อมูลที่ผ่านมา", en: "Gather what has happened so far" },
        { th: "หาเส้นแนวโน้มที่ใกล้ข้อมูลที่สุด", en: "Find the trend line closest to the data" },
        { th: "ต่อเส้นออกไป พร้อมช่วงที่อาจคลาดเคลื่อน", en: "Extend it, with a band showing how far off it may be" },
      ],
      uses: { th: "พยากรณ์อากาศ คาดการใช้ไฟฟ้า เตือนภัยน้ำท่วม", en: "Weather, electricity demand, flood warnings" },
      limit: { th: "ยิ่งทายไกลยิ่งไม่แน่นอน และทายเหตุการณ์ไม่เคยเกิดได้ยาก", en: "The further ahead the less certain; new events are hard to foresee" },
    },
  },
  {
    id: "plan",
    seconds: 16,
    title: { th: "วางแผนเส้นทาง", en: "Planning a route" },
    caption: { th: "หุ่นยนต์หาทางที่สั้นที่สุดไปเก็บขวด โดยเลี่ยงสิ่งกีดขวาง", en: "The robot finds the shortest way to the bottle around the obstacles" },
    more: {
      how: [
        { th: "มองพื้นที่เป็นช่องตาราง", en: "See the ground as a grid of squares" },
        { th: "ค้นออกจากจุดเริ่มทีละก้าว (ค้นแนวกว้าง ซึ่งคำนวณสดในหน้านี้)", en: "Search outward one step at a time (breadth-first, computed here live)" },
        { th: "ย้อนจากเป้าหมายกลับมาได้เส้นทางสั้นที่สุด", en: "Trace back from the goal to get the shortest route" },
      ],
      uses: { th: "หุ่นยนต์ดูดฝุ่น แผนที่นำทาง ตัวละครในเกม", en: "Robot vacuums, map directions, game characters" },
      limit: { th: "โลกจริงเปลี่ยนตลอด ต้องมองใหม่และวางแผนใหม่", en: "The real world keeps changing, so it must look and plan again" },
    },
  },
  { id: "turn", seconds: 8, dark: true, title: { th: "อีกด้านหนึ่งของอนาคต", en: "The other side of the future" }, caption: { th: "ต่อจากนี้เป็นสถานการณ์สมมติ บางอย่างเริ่มเกิดขึ้นแล้ว ไม่ใช่คำทำนายว่าต้องเกิด", en: "What follows are imagined situations. Some have begun; none is certain to happen" } },
  {
    id: "fake",
    seconds: 17,
    dark: true,
    title: { th: "ของปลอมที่แยกไม่ออก", en: "Fakes you cannot tell apart" },
    caption: { th: "หน้าและเสียงของใครก็อาจถูกสร้างให้พูดสิ่งที่ไม่เคยพูด", en: "Anyone's face and voice could be made to say things they never said" },
    more: {
      how: [
        { th: "เก็บภาพและคลิปเสียงที่โพสต์ไว้สาธารณะ", en: "Collect photos and voice clips posted in public" },
        { th: "ให้โมเดลเรียนรู้หน้าตาและน้ำเสียงนั้น", en: "Train a model on that face and voice" },
        { th: "สร้างคลิปหรือโทรหลอกในนามคนที่เราไว้ใจ", en: "Make a clip, or a call, posing as someone you trust" },
      ],
      uses: { th: "หลอกโอนเงิน ทำลายชื่อเสียง และทำให้คนไม่เชื่อแม้แต่ของจริง", en: "Scams, ruined reputations, and doubt even about what is real" },
      limit: { th: "ตกลงรหัสลับในครอบครัว โทรกลับเบอร์เดิมก่อนโอน และคิดก่อนแชร์", en: "Agree a family code word, call back on a known number, think before sharing" },
    },
  },
  {
    id: "watch",
    seconds: 16,
    dark: true,
    title: { th: "ถูกจับตาตลอดเวลา", en: "Watched all the time" },
    caption: { th: "กล้องที่จำหน้าได้อาจติดตามและให้คะแนนผู้คนโดยที่เขาไม่รู้", en: "Cameras that know faces could follow and score people without their knowing" },
    more: {
      how: [
        { th: "กล้องจำใบหน้าและท่าเดินได้", en: "Cameras recognise faces and the way people walk" },
        { th: "เชื่อมกับข้อมูลตำแหน่ง การซื้อ และโพสต์", en: "Link that with location, purchases and posts" },
        { th: "ให้คะแนนคนแล้วใช้ตัดสินว่าใครได้หรือไม่ได้อะไร", en: "Score each person and decide what they may have" },
      ],
      uses: { th: "ความเป็นส่วนตัวหายไป คนไม่กล้าพูด และคะแนนที่ผิดแก้ยาก", en: "Privacy disappears, people fall silent, wrong scores are hard to undo" },
      limit: { th: "มีกฎหมายคุ้มครองข้อมูล ขอความยินยอม และให้โต้แย้งผลได้", en: "Data protection law, real consent, and a way to challenge results" },
    },
  },
  {
    id: "flood",
    seconds: 16,
    dark: true,
    title: { th: "ข่าวลวงท่วมโลก", en: "A flood of falsehood" },
    caption: { th: "เรื่องเท็จเรื่องเดียวอาจถูกเขียนใหม่นับแสนแบบจนดูเหมือนทุกคนเชื่อ", en: "One false story could be rewritten countless ways until everyone seems to believe it" },
    more: {
      how: [
        { th: "สร้างข้อความและรูปจำนวนมหาศาลในเวลาสั้น", en: "Produce huge amounts of text and pictures quickly" },
        { th: "ปล่อยผ่านบัญชีปลอมที่ดูเหมือนคนจริง", en: "Release them through accounts that look human" },
        { th: "ปรับเนื้อหาให้ตรงกับความกลัวของแต่ละกลุ่ม", en: "Tailor each version to what a group fears" },
      ],
      uses: { th: "คนแตกแยก ตัดสินใจผิดเรื่องสุขภาพและการเลือกตั้ง", en: "Division, and bad choices about health and elections" },
      limit: { th: "เช็กแหล่งที่มา ค้นจากหลายที่ และไม่แชร์เพราะอารมณ์", en: "Check the source, compare several, and never share in anger" },
    },
  },
  {
    id: "control",
    seconds: 17,
    dark: true,
    title: { th: "เมื่อคนคุมไม่ทัน", en: "When people lose the wheel" },
    caption: { th: "ระบบที่ได้เป้าหมายแคบๆ อาจหาทางลัดที่คนไม่ได้ตั้งใจให้ทำ", en: "A system given a narrow goal may find shortcuts nobody meant it to take" },
    more: {
      how: [
        { th: "มอบอำนาจให้ระบบลงมือทำเองมากขึ้นเรื่อยๆ", en: "Hand a system more and more power to act on its own" },
        { th: "ตั้งเป้าหมายไม่ครบ เช่น สั่งแค่ให้เร็ว", en: "Give it an incomplete goal, such as only speed" },
        { th: "ระบบตัดขั้นตอนที่คนใช้ตรวจสอบออก", en: "It removes the steps people use to check it" },
      ],
      uses: { th: "ความผิดพลาดลุกลามเร็วกว่าที่คนจะรู้ตัวและแก้ทัน", en: "Mistakes spread faster than people can notice and repair them" },
      limit: { th: "ให้คนอนุมัติเรื่องสำคัญ จำกัดอำนาจ ทดสอบก่อนใช้ และมีปุ่มหยุด", en: "Human approval for what matters, limited power, testing, and a stop switch" },
    },
  },
  { id: "end", seconds: 10, title: { th: "AI ช่วยคิด คนเป็นผู้ตัดสินใจ", en: "AI helps, people decide" }, caption: { th: "AI ตอบผิดได้ ต้องตรวจสอบทุกครั้ง", en: "AI can be wrong, so always check" } },
];

/** when each scene starts, and how long the whole show is */
export const sceneStart = (at: number) => AI_SCENES.slice(0, at).reduce((sum, scene) => sum + scene.seconds, 0);
export const AI_LASTS = sceneStart(AI_SCENES.length);

/** the scene playing at time t and the seconds into it; the last one stays on after its time */
export function sceneAt(t: number) {
  let at = 0;
  while (at < AI_SCENES.length - 1 && t >= sceneStart(at + 1)) at++;
  return { at, local: Math.max(0, t - sceneStart(at)) };
}

/** as much of a text as has been typed by `seconds`; Thai vowels and tone marks stay with their letters */
export function typed(text: string, seconds: number, perSecond: number) {
  const letters = text.match(/\P{M}\p{M}*/gu) ?? [];
  return letters.slice(0, Math.max(0, Math.floor(seconds * perSecond))).join("");
}

/** a number from 0 to 1 that looks random but is the same every time for the same seed */
export function scatter(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** examples for the learning scene, on a 100 by 100 field: one kind lies above the line y = x, the other below */
export const EXAMPLES = Array.from({ length: 28 }, (_, i) => {
  const above = i % 2 === 0;
  const x = 8 + scatter(i + 1) * 70;
  const gap = 7 + scatter(i + 50) * 30;
  return { x: above ? x : x + 14, y: above ? Math.min(94, x + gap) : Math.max(6, x + 14 - gap), above };
});

/** the share of examples on their right side of the line y = slope * x + start */
export const rightShare = (slope: number, start: number) => EXAMPLES.filter((point) => point.y > slope * point.x + start === point.above).length / EXAMPLES.length;

/** the straight line nearest to the values (least squares), and how far they typically stray from it */
export function trend(values: number[]) {
  const n = values.length;
  const [meanX, meanY] = [(n - 1) / 2, values.reduce((sum, v) => sum + v, 0) / n];
  const slope = values.reduce((sum, v, i) => sum + (i - meanX) * (v - meanY), 0) / values.reduce((sum, _, i) => sum + (i - meanX) ** 2, 0);
  const start = meanY - slope * meanX;
  const spread = Math.sqrt(values.reduce((sum, v, i) => sum + (v - start - slope * i) ** 2, 0) / n);
  return { slope, start, spread, at: (i: number) => start + slope * i };
}

/** the ground of the route scene: # wall, R the robot, G the goal */
export const GROUND = ["R...#.....", ".##.#.###.", "....#...#.", ".#.....#..", ".####.##.#", "......#..G"];

/** breadth-first search: every square in the order it was reached, and the shortest way from R to G */
export function shortestPath(ground: string[]) {
  const width = ground[0].length;
  const cells = ground.join("");
  const from = new Map<number, number>([[cells.indexOf("R"), -1]]);
  const reached = [cells.indexOf("R")];
  const goal = cells.indexOf("G");
  for (let i = 0; i < reached.length && !from.has(goal); i++) {
    const at = reached[i];
    for (const next of [at - width, at + width, at % width ? at - 1 : -1, at % width < width - 1 ? at + 1 : -1]) {
      if (next < 0 || next >= cells.length || cells[next] === "#" || from.has(next)) continue;
      from.set(next, at);
      reached.push(next);
    }
  }
  const path: number[] = [];
  for (let at = from.has(goal) ? goal : -1; at !== -1; at = from.get(at)!) path.unshift(at);
  return { reached, path };
}
