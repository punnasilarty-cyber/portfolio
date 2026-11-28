// ภาพของแต่ละฉากใน “AI ทำอะไรได้” วาดจากเวลา t (วินาทีในฉาก) อย่างเดียว จึงหยุดและย้อนได้
import { EXAMPLES, GROUND, rightShare, scatter, shortestPath, trend, typed, type AiScene } from "@/aishow";
import { Control, Fake, Flood, Turn, Watch } from "@/components/AiRisks";
import { profile } from "@/content";

type Props = { t: number; english: boolean };

/** a part that arrives at its own moment */
const show = (when: boolean) => (when ? "ai-part is-in" : "ai-part");

const FOUND = [
  { th: "ต้นไม้", en: "tree", sure: 98, box: [22, 28, 92, 152], at: 1.6 },
  { th: "เป็ด", en: "duck", sure: 95, box: [128, 140, 58, 40], at: 2.8 },
  { th: "ปลา", en: "fish", sure: 91, box: [212, 176, 62, 28], at: 4 },
  { th: "ขวดพลาสติก", en: "plastic bottle", sure: 87, box: [292, 142, 52, 30], at: 5.2 },
];

function See({ t, english }: Props) {
  return (
    <svg viewBox="0 0 380 230" role="img" aria-label={english ? "A pond picture with the things in it marked" : "ภาพสระน้ำที่ถูกตีกรอบสิ่งของในภาพ"}>
      <rect width="380" height="230" rx="10" fill="#0f2233" />
      <circle cx="318" cy="46" r="20" fill="#fde68a" />
      <path d="M0 128q96-26 190-4t190-8v114H0z" fill="#14532d" />
      <ellipse cx="205" cy="176" rx="150" ry="42" fill="#1d6a8f" />
      <path d="M62 178V96" stroke="#78450f" strokeWidth="12" />
      <circle cx="66" cy="72" r="36" fill="#22a35a" />
      <circle cx="44" cy="90" r="22" fill="#1c8a4c" />
      <ellipse cx="154" cy="164" rx="24" ry="13" fill="#f4f4f5" />
      <circle cx="174" cy="150" r="9" fill="#f4f4f5" />
      <path d="M181 149l12 3-12 4z" fill="#f59e0b" />
      <path d="M220 190q18-18 38 0-20 18-38 0zm38 0 13-9v18z" fill="#fb923c" />
      <g transform="rotate(-14 318 157)">
        <rect x="298" y="150" width="36" height="14" rx="5" fill="#bae6fd" opacity="0.9" />
        <rect x="334" y="153" width="7" height="8" fill="#38bdf8" />
      </g>
      {/* the look passes over once */}
      {t < 6.2 && <rect x={((t / 6.2) * 400 - 20).toFixed(1)} width="3" height="230" fill="var(--a2)" opacity="0.85" />}
      {FOUND.map((thing) => {
        const [x, y, w, h] = thing.box;
        return (
          <g key={thing.en} className={show(t >= thing.at)}>
            <rect x={x} y={y} width={w} height={h} fill="none" stroke="var(--a2)" strokeWidth="2" rx="3" />
            <text x={Math.min(x, 280)} y={y - 5} fill="#fff" fontSize="11" fontWeight="700" paintOrder="stroke" stroke="#000" strokeWidth="3">
              {english ? thing.en : thing.th} {thing.sure}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const PIECES = ["ช่วยกัน", "ดูแล", "สระน้ำ", "ของ", "เรา"];
const NUMBERS = [512, 87, 1904, 23, 361];

function Language({ t }: Props) {
  return (
    <div className="ai-words" lang="th">
      <p className="ai-line">{typed(PIECES.join(""), t, 12)}</p>
      <ul>
        {PIECES.map((piece, i) => (
          <li key={piece} className={show(t >= 1.8 + i * 0.35)}>
            {piece}
            <small>{NUMBERS[i]}</small>
          </li>
        ))}
      </ul>
      <p className={show(t >= 3.8)} aria-hidden="true">↓</p>
      <p className="ai-line ai-answer" lang="en">{typed("Let's take care of our pond", t - 4.2, 16)}</p>
    </div>
  );
}

const CODE = "def average(scores):\n    return sum(scores) / len(scores)\n\nprint(average([4, 5, 3]))";

function Code({ t, english }: Props) {
  return (
    <div className="ai-code">
      <p className="ai-ask">{typed(english ? "Find the average of these scores" : "หาค่าเฉลี่ยของคะแนนชุดนี้ให้หน่อย", t, 24)}</p>
      <pre lang="en">{typed(CODE, t - 1.6, 20)}</pre>
      <p className={`${show(t >= 6.6)} ai-run`} lang="en">▶ 4.0</p>
    </div>
  );
}

function Draw({ t, english }: Props) {
  // 0 while it is all noise, 1 when the picture is clear
  const clear = Math.min(1, Math.max(0, (t - 1.6) / 5));
  const turn = Math.floor(t * 12);
  return (
    <div className="ai-draw">
      <p className="ai-ask">{typed(english ? "A lotus on a pond at dawn" : "ดอกบัวกลางสระยามเช้า", t, 20)}</p>
      <svg viewBox="0 0 240 150" role="img" aria-label={english ? "A lotus appearing out of noise" : "ภาพดอกบัวค่อยๆ ปรากฏจากจุดรบกวน"}>
        <g style={{ filter: `blur(${((1 - clear) * 10).toFixed(1)}px)`, opacity: clear }}>
          <rect width="240" height="150" fill="#fbbf8a" />
          <circle cx="182" cy="52" r="24" fill="#fff3b0" />
          <rect y="84" width="240" height="66" fill="#2c7a8c" />
          <ellipse cx="62" cy="120" rx="34" ry="10" fill="#2f9e5b" />
          <ellipse cx="190" cy="132" rx="30" ry="9" fill="#23824a" />
          <ellipse cx="120" cy="112" rx="46" ry="13" fill="#36b268" />
          <g fill="#f472b6">
            {[-62, -32, 32, 62, 0].map((angle) => (
              <path key={angle} transform={`rotate(${angle} 120 108)`} d="M120 108q-18-26 0-52 18 26 0 52z" fill={angle ? "#f472b6" : "#fbcfe8"} />
            ))}
          </g>
        </g>
        {clear < 1 &&
          Array.from({ length: 150 }, (_, i) => (
            <rect key={i} x={(i % 15) * 16} y={Math.floor(i / 15) * 15} width="16" height="15" fill={`hsl(${Math.floor(scatter(i + turn * 151) * 360)} 55% ${Math.floor(20 + scatter(i * 7 + turn) * 60)}%)`} opacity={(1 - clear).toFixed(2)} />
          ))}
      </svg>
      <p className="ai-meter">{Math.round(clear * 100)}%</p>
    </div>
  );
}

const HEARD = { th: ["สวัสดี", "ครับ", "วันนี้", "เราจะ", "นำเสนอ", "โครงงาน"], en: ["Hello,", "today", "we", "will", "present", "our project"] };

function Hear({ t, english }: Props) {
  const words = HEARD[english ? "en" : "th"];
  const loud = t < 5.2 ? 1 : 0.08;
  return (
    <div className="ai-hear">
      <svg viewBox="0 0 320 100" aria-hidden="true">
        {Array.from({ length: 40 }, (_, i) => {
          const h = 4 + loud * 80 * Math.abs(Math.sin(i * 0.6 + t * 7) * Math.sin(i * 0.21 - t * 2.3));
          return <rect key={i} x={i * 8 + 1} y={(50 - h / 2).toFixed(1)} width="5" height={h.toFixed(1)} rx="2.5" fill="var(--a2)" />;
        })}
      </svg>
      <p className="ai-line">
        {words.map((word, i) => (
          <span key={word} className={show(t >= 0.8 + i * 0.7)}>
            {word}
            {english ? " " : ""}
          </span>
        ))}
      </p>
    </div>
  );
}

function Reason({ t, english }: Props) {
  const say = (th: string, en: string) => (english ? en : th);
  const steps = [
    [say("โจทย์", "Problem"), "2x + 6 = 20"],
    [say("ลบ 6 ทั้งสองข้าง", "Take 6 from both sides"), "2x = 14"],
    [say("หารด้วย 2", "Divide by 2"), "x = 7"],
    [say("ตรวจคำตอบ", "Check"), "2(7) + 6 = 20 ✓"],
  ];
  return (
    <ol className="ai-steps">
      {steps.map(([label, line], i) => (
        <li key={line} className={show(t >= 0.4 + i * 1.8)}>
          <small>{label}</small>
          <b>{line}</b>
        </li>
      ))}
    </ol>
  );
}

/** from 0 to 1 over the seconds from `start` to `end` */
const part = (t: number, start: number, end: number) => Math.min(1, Math.max(0, (t - start) / (end - start)));

function Learn({ t, english }: Props) {
  // the line starts badly placed and is nudged round by round toward one that separates the two kinds
  const done = Math.floor(part(t, 1.5, 9) * 20) / 20;
  const slope = -0.5 + 1.5 * done;
  const start = 72 - 72 * done;
  const share = Math.round(rightShare(slope, start) * 100);
  return (
    <div>
      <svg viewBox="0 0 100 100" role="img" aria-label={english ? "A line learning to separate two groups of dots" : "เส้นแบ่งค่อยๆ เรียนรู้จนแยกจุดสองกลุ่มได้"} className="ai-field">
        <rect width="100" height="100" fill="#0b1220" />
        {EXAMPLES.map((point, i) =>
          point.above ? (
            <circle key={i} cx={point.x} cy={100 - point.y} r="2.2" fill="var(--a2)" className={show(t >= i * 0.05)} />
          ) : (
            <rect key={i} x={point.x - 2} y={98 - point.y} width="4" height="4" fill="#7dd3fc" className={show(t >= i * 0.05)} />
          ),
        )}
        <line x1="0" y1={100 - start} x2="100" y2={100 - (slope * 100 + start)} stroke="#fff" strokeWidth="1" />
      </svg>
      <p className="ai-meter">
        {english ? `Round ${done * 20} of 20 · sorted correctly ${share}%` : `รอบที่ ${done * 20} จาก 20 · แยกถูก ${share}%`}
      </p>
    </div>
  );
}

const WEEKS = [14, 13, 14.5, 12, 11.5, 11.8, 10, 9.4];
const AHEAD = 4;

function Predict({ t, english }: Props) {
  const line = trend(WEEKS);
  const x = (week: number) => 24 + week * 26;
  const y = (kg: number) => 140 - kg * 8;
  const shown = Math.ceil(part(t, 0.3, 3.5) * WEEKS.length);
  const reach = WEEKS.length - 1 + part(t, 5, 9) * AHEAD;
  // the doubt grows the further ahead it looks
  const doubt = (week: number) => line.spread * (1 + (week - WEEKS.length + 1) * 0.6);
  const steps = Array.from({ length: 13 }, (_, i) => WEEKS.length - 1 + ((reach - WEEKS.length + 1) * i) / 12);
  const band = [...steps.map((week) => `${x(week)},${y(line.at(week) + doubt(week))}`), ...steps.reverse().map((week) => `${x(week)},${y(line.at(week) - doubt(week))}`)];
  const next = WEEKS.length - 1 + AHEAD;
  return (
    <div>
      <svg viewBox="0 0 330 160" role="img" aria-label={english ? "Weekly amounts with a trend line continued into coming weeks" : "ปริมาณรายสัปดาห์ พร้อมเส้นแนวโน้มต่อไปในสัปดาห์ข้างหน้า"}>
        <rect width="330" height="160" fill="#0b1220" />
        {[0, 5, 10, 15].map((kg) => (
          <g key={kg}>
            <path d={`M20 ${y(kg)}H320`} stroke="#ffffff1a" />
            <text x="4" y={y(kg) + 3} fill="#a1a1aa" fontSize="8">
              {kg}
            </text>
          </g>
        ))}
        {t > 5 && <polygon points={band.join(" ")} fill="var(--a2)" opacity="0.25" />}
        {t > 3.8 && <path d={`M${x(0)} ${y(line.at(0))}L${x(WEEKS.length - 1)} ${y(line.at(WEEKS.length - 1))}`} stroke="var(--a2)" strokeWidth="1.5" />}
        {t > 5 && <path d={`M${x(WEEKS.length - 1)} ${y(line.at(WEEKS.length - 1))}L${x(reach)} ${y(line.at(reach))}`} stroke="var(--a2)" strokeWidth="2" strokeDasharray="5 4" />}
        {WEEKS.slice(0, shown).map((kg, i) => (
          <circle key={i} cx={x(i)} cy={y(kg)} r="3.5" fill="#fff" />
        ))}
      </svg>
      <p className={`${show(t >= 9.3)} ai-meter`}>
        {english ? `Week ${next + 1}: about ${line.at(next).toFixed(1)} kg (± ${doubt(next).toFixed(1)})` : `สัปดาห์ที่ ${next + 1}: ราว ${line.at(next).toFixed(1)} กก. (± ${doubt(next).toFixed(1)})`}
      </p>
    </div>
  );
}

const ROUTE = shortestPath(GROUND);

function Plan({ t, english }: Props) {
  const width = GROUND[0].length;
  const looked = new Set(ROUTE.reached.slice(0, Math.ceil(part(t, 0.8, 6) * ROUTE.reached.length)));
  const walked = Math.floor(part(t, 6.8, 11) * (ROUTE.path.length - 1));
  const trail = new Set(t >= 6.3 ? ROUTE.path : []);
  const robot = ROUTE.path[walked];
  const at = (cell: number) => ({ x: (cell % width) * 24, y: Math.floor(cell / width) * 24 });
  return (
    <div>
      <svg viewBox={`0 0 ${width * 24} ${GROUND.length * 24}`} role="img" aria-label={english ? "A grid with the robot searching for and walking the shortest route" : "ตารางที่หุ่นยนต์ค้นหาและเดินตามเส้นทางสั้นที่สุด"}>
        {[...GROUND.join("")].map((cell, i) => (
          <rect key={i} {...at(i)} width="23" height="23" rx="3" fill={cell === "#" ? "#52525b" : trail.has(i) ? "var(--a2)" : looked.has(i) ? "#1e3a5f" : "#0b1220"} />
        ))}
        <text x={at(ROUTE.path.at(-1)!).x + 12} y={at(ROUTE.path.at(-1)!).y + 17} textAnchor="middle" fontSize="14">
          🍾
        </text>
        <text x={at(robot).x + 12} y={at(robot).y + 17} textAnchor="middle" fontSize="15">
          🤖
        </text>
      </svg>
      <p className="ai-meter">
        {english ? `Squares checked ${looked.size} · route ${t >= 6.3 ? ROUTE.path.length - 1 : "…"} steps` : `ตรวจแล้ว ${looked.size} ช่อง · เส้นทาง ${t >= 6.3 ? ROUTE.path.length - 1 : "…"} ก้าว`}
      </p>
    </div>
  );
}

function Hello({ t, english }: Props) {
  const abilities = english ? ["learn", "see", "hear", "read", "code", "draw", "reason", "forecast", "plan"] : ["เรียนรู้", "มองเห็น", "ฟังเสียง", "เข้าใจภาษา", "เขียนโค้ด", "สร้างภาพ", "คิดเป็นขั้น", "ทำนาย", "วางแผน"];
  return (
    <ul className="ai-abilities">
      {abilities.map((ability, i) => (
        <li key={ability} className={show(t >= 0.5 + i * 0.4)}>
          {ability}
        </li>
      ))}
    </ul>
  );
}

function End({ t, english }: Props) {
  const habits = english
    ? ["Check facts against reliable sources", "Keep personal data out of it", "Say where AI helped", "The work is still yours to answer for"]
    : ["ตรวจข้อเท็จจริงกับแหล่งที่เชื่อถือได้", "ไม่ใส่ข้อมูลส่วนตัวของตนเองและผู้อื่น", "บอกให้ชัดว่าใช้ AI ช่วยตรงไหน", "ผลงานยังเป็นความรับผิดชอบของเรา"];
  return (
    <div className="ai-end">
      <p className={show(t >= 0.3)}>{english ? "The future is not written yet. People choose it." : "อนาคตยังไม่ถูกเขียน คนเป็นผู้เลือก"}</p>
      <ul>
        {habits.map((habit, i) => (
          <li key={habit} className={show(t >= 1 + i * 0.8)}>
            ✓ {habit}
          </li>
        ))}
      </ul>
      <b className={show(t >= 4.6)}>{profile.name}</b>
    </div>
  );
}

export const AI_STAGES: Record<AiScene["id"], (props: Props) => React.JSX.Element> = { turn: Turn, fake: Fake, watch: Watch, flood: Flood, control: Control, hello: Hello, learn: Learn, predict: Predict, plan: Plan, see: See, language: Language, code: Code, draw: Draw, hear: Hear, reason: Reason, end: End };
