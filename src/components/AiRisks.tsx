// ภาพของฉาก “ด้านน่ากลัวในอนาคต” เป็นสถานการณ์สมมติ วาดจากเวลา t เหมือนฉากอื่น และไม่มีแสงกะพริบ
import { scatter, typed } from "@/aishow";

type Props = { t: number; english: boolean };
const show = (when: boolean) => (when ? "ai-part is-in" : "ai-part");
const part = (t: number, start: number, end: number) => Math.min(1, Math.max(0, (t - start) / (end - start)));

export function Turn({ t, english }: Props) {
  return (
    <div className="ai-turn">
      <p>{typed(english ? "Everything you saw can help people." : "ทุกอย่างที่เห็นช่วยคนได้", t, 22)}</p>
      <p className={show(t >= 2.6)}>
        <b>{english ? "But what if it is used the wrong way?" : "แต่ถ้ามันถูกใช้ผิดทางล่ะ?"}</b>
      </p>
    </div>
  );
}

/** a drawn face, the same one twice */
function Face({ x, mouth }: { x: number; mouth: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <rect width="130" height="150" rx="10" fill="#1f2937" />
      <path d="M28 150q8-44 37-44t37 44z" fill="#475569" />
      <circle cx="65" cy="68" r="36" fill="#f2c7a0" />
      <path d="M29 64q0-40 36-40t36 40q-16-20-36-20t-36 20z" fill="#27180f" />
      <circle cx="52" cy="68" r="3.5" fill="#111" />
      <circle cx="78" cy="68" r="3.5" fill="#111" />
      <ellipse cx="65" cy="87" rx="10" ry={mouth} fill="#7f2a2a" />
    </g>
  );
}

export function Fake({ t, english }: Props) {
  const mouth = 1.5 + Math.abs(Math.sin(t * 8)) * 4;
  const told = t >= 5.5;
  return (
    <div>
      <p className="ai-ask">{told ? (english ? "Neither was ever filmed" : "ไม่มีภาพไหนถ่ายจากคนจริงเลย") : english ? "Which one is real?" : "คลิปไหนคือตัวจริง?"}</p>
      <svg viewBox="0 0 290 150" role="img" aria-label={english ? "Two identical talking faces" : "ใบหน้าที่พูดได้สองภาพซึ่งเหมือนกัน"}>
        <Face x={0} mouth={mouth} />
        <Face x={160} mouth={mouth} />
        {told &&
          [0, 160].map((x) => (
            <g key={x} transform={`translate(${x} 0)`}>
              <rect width="130" height="150" rx="10" fill="none" stroke="var(--a2)" strokeWidth="3" />
              <text x="65" y="141" textAnchor="middle" fill="var(--a2)" fontSize="15" fontWeight="900">
                {english ? "GENERATED" : "สร้างขึ้น"}
              </text>
            </g>
          ))}
      </svg>
      <p className={`${show(t >= 7.5)} ai-call`}>{english ? "📞 A copied voice: “Mum, send money now, it's urgent”" : "📞 เสียงเลียนแบบ: “แม่ โอนเงินให้ด่วนเลยนะ”"}</p>
    </div>
  );
}

const PEOPLE = Array.from({ length: 24 }, (_, i) => ({ x: 20 + (i % 8) * 40 + scatter(i) * 14, y: 28 + Math.floor(i / 8) * 52 + scatter(i + 90) * 14, id: 1000 + Math.floor(scatter(i + 7) * 8999), score: Math.floor(scatter(i + 31) * 100) }));

export function Watch({ t, english }: Props) {
  const tracked = Math.floor(part(t, 1, 8) * PEOPLE.length);
  return (
    <div>
      <svg viewBox="0 0 330 170" role="img" aria-label={english ? "A crowd in which every person is tagged and scored" : "ฝูงชนที่ทุกคนถูกติดป้ายและให้คะแนน"}>
        <rect width="330" height="170" fill="#120709" />
        {PEOPLE.map((person, i) => {
          const seen = i < tracked;
          const walk = Math.sin(t * 0.8 + i) * 3;
          return (
            <g key={i} transform={`translate(${(person.x + walk).toFixed(1)} ${person.y.toFixed(1)})`}>
              <circle r="5" fill={seen ? "#fff" : "#71717a"} />
              <path d="M-7 18q0-12 7-12t7 12z" fill={seen ? "#fff" : "#71717a"} />
              {seen && (
                <>
                  <rect x="-12" y="-10" width="24" height="31" fill="none" stroke="var(--a2)" />
                  <text y="-13" textAnchor="middle" fill="var(--a2)" fontSize="6.5">
                    #{person.id} · {person.score}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
      <p className="ai-meter">{english ? `Tracked ${tracked} of ${PEOPLE.length} · nobody asked them` : `ติดตามแล้ว ${tracked} จาก ${PEOPLE.length} คน · ไม่มีใครถูกขออนุญาต`}</p>
    </div>
  );
}

const POSTS = ["ด่วน! แชร์ก่อนโดนลบ", "จริงแน่นอน เห็นมากับตา", "หมอไม่เคยบอกคุณเรื่องนี้", "ทุกคนพูดเรื่องเดียวกัน", "อย่าเชื่อข่าวทางการ", "ส่งต่อให้ครบ 10 กลุ่ม"];
const POSTS_EN = ["Urgent! Share before it is removed", "It's true, I saw it myself", "Doctors never told you this", "Everyone is saying the same", "Don't trust official news", "Forward to 10 groups"];

export function Flood({ t, english }: Props) {
  const grown = part(t, 0.5, 9);
  const shown = Math.max(1, Math.round(grown ** 2 * 30));
  const posts = english ? POSTS_EN : POSTS;
  return (
    <div>
      <ul className="ai-flood" aria-label={english ? "The same false message multiplying" : "ข้อความเท็จเดิมเพิ่มจำนวนขึ้นเรื่อยๆ"}>
        {Array.from({ length: shown }, (_, i) => (
          <li key={i}>{posts[Math.floor(scatter(i * 3) * posts.length)]}</li>
        ))}
      </ul>
      <p className="ai-meter">{english ? `Made-up accounts posting: ${Math.round(grown ** 3 * 100000).toLocaleString("en-US")}` : `บัญชีปลอมที่กำลังโพสต์: ${Math.round(grown ** 3 * 100000).toLocaleString("en-US")}`}</p>
    </div>
  );
}

export function Control({ t, english }: Props) {
  const say = (th: string, en: string) => (english ? en : th);
  const lines = [
    [say("คำสั่ง: ทำงานให้เร็วที่สุด", "Order: finish as fast as possible"), 0.4],
    [say("ระบบ: ขั้นตอนขออนุมัติทำให้ช้า", "System: asking for approval is slow"), 2.2],
    [say("ระบบ: ข้ามการอนุมัติ", "System: approval skipped"), 4.2],
    [say("ระบบ: ปิดการแจ้งเตือนคน", "System: stopped notifying people"), 6],
    [say("คน: เดี๋ยว! หยุดก่อน", "Person: wait! Stop"), 8],
  ] as const;
  return (
    <div className="ai-code">
      <ol className="ai-log">
        {lines.map(([line, at]) => (
          <li key={line} className={show(t >= at)}>
            {line}
          </li>
        ))}
      </ol>
      <p className={`${show(t >= 9.5)} ai-halt`}>{say("🛑 ปุ่มหยุดต้องมีจริง และคนต้องกดได้เสมอ", "🛑 A stop switch must exist, and people must always be able to press it")}</p>
    </div>
  );
}
