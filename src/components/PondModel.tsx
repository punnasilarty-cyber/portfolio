import { useState } from "react";
import { At, Box, Slab } from "@/components/Solid";

const STATES = [
  { id: "bad", label: "ปัญหาที่พบ", points: ["น้ำขุ่นสีเขียวและมีกลิ่น", "ขยะและเศษใบไม้ลอยในสระ", "น้ำเสียจากบริเวณรอบไหลลงสระ", "ยุงและแมลงรบกวน"] },
  { id: "good", label: "หลังทำตามแนวทาง", points: ["เก็บขยะและเศษใบไม้สม่ำเสมอ", "มีถังขยะให้เพียงพอ", "บำบัดน้ำเสียก่อนลงสระ", "ทุกคนร่วมกันดูแล"] },
] as const;

const RUBBISH = [
  [60, 78, "#e5e7eb"],
  [92, 128, "#ef4444"],
  [150, 62, "#facc15"],
  [186, 120, "#e5e7eb"],
  [74, 156, "#8b5a2b"],
  [204, 82, "#60a5fa"],
] as const;

function Tree({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  return (
    <At x={x} y={y}>
      <g transform={`scale(${size})`}>
        <path d="M-2 0v-14h4V0z" fill="#7c4a1e" />
        <circle cy="-22" r="12" fill="#15803d" />
        <circle cx="-5" cy="-26" r="8" fill="#22a354" />
      </g>
    </At>
  );
}

/** a model of the pond the IS project studied: the problem, then the picture its proposals aim for */
export function PondModel() {
  const [state, setState] = useState<"bad" | "good">("bad");
  const current = STATES.find((item) => item.id === state)!;

  return (
    <figure className={`pond is-${state}`}>
      <div role="group" aria-label="เลือกสภาพสระน้ำ" className="edu-tabs pond-tabs">
        {STATES.map((item) => (
          <button key={item.id} type="button" aria-pressed={state === item.id} onClick={() => setState(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      <svg viewBox="-250 -80 500 340" role="img" aria-label={`โมเดลสระน้ำบริเวณเกาะลอย ${current.label}`} className="pond-art">
        {/* ground, then the water sunk into it */}
        <Box at={[0, 0, 270, 220]} z={-18} h={18} color="#3f7d3a" />
        <Slab at={[30, 40, 200, 150]} fill="#a8a29e" />
        <Slab at={[40, 50, 180, 130]} className="pond-water" />
        {/* the school behind the pond, with its drain */}
        <Box at={[40, 0, 150, 22]} h={42} color="#f5f0e1" />
        <Box at={[36, -2, 158, 26]} z={42} h={8} color="#b91c1c" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Box key={i} at={[52 + i * 23, 22, 11, 1]} z={14} h={16} color="#38bdf8" />
        ))}
        <Box at={[196, 22, 8, 30]} z={0} h={6} color="#57534e" />

        <g className="pond-good">
          {/* a filter box on the drain, an aerator, and bins on the bank */}
          <Box at={[190, 28, 22, 18]} h={18} color="#0ea5e9" />
          {[0, 1, 2].map((i) => (
            <At key={i} x={95 + i * 40} y={150 - i * 12} z={2}>
              <ellipse className="pond-ripple" style={{ animationDelay: `${i * 0.6}s` }} rx="16" ry="8" fill="none" stroke="#e0f2fe" strokeWidth="1.5" />
            </At>
          ))}
          <At x={175} y={140} z={4}>
            {[-7, 0, 7].map((dx, i) => (
              <path key={dx} className="pond-spray" style={{ animationDelay: `${i * 0.2}s` }} d={`M0 0q${dx} -30 ${dx * 2} 0`} fill="none" stroke="#e0f2fe" strokeWidth="2" strokeLinecap="round" />
            ))}
          </At>
          {["#16a34a", "#facc15", "#2563eb"].map((color, i) => (
            <Box key={color} at={[242, 70 + i * 26, 14, 14]} h={22} color={color} />
          ))}
        </g>

        {/* the floating island and its tree */}
        <Box at={[112, 92, 40, 34]} h={7} color="#4d7c0f" />
        <Tree x={132} y={109} size={1.1} />
        <Tree x={14} y={60} />
        <Tree x={14} y={130} size={1.2} />
        <Tree x={14} y={200} />
        <Tree x={250} y={20} size={1.1} />

        <g className="pond-bad">
          {/* algae, floating rubbish, the dirty drain, smell and mosquitoes */}
          {[
            [70, 100, 22],
            [170, 150, 28],
            [195, 70, 16],
            [105, 168, 18],
          ].map(([x, y, r]) => (
            <At key={`${x}-${y}`} x={x} y={y} z={1}>
              <ellipse rx={r} ry={r / 2} fill="#4d5b17" opacity="0.75" />
            </At>
          ))}
          {RUBBISH.map(([x, y, color], i) => (
            <At key={`${x}-${y}`} x={x} y={y} z={2}>
              <rect className="pond-float" style={{ animationDelay: `${i * 0.35}s` }} x="-5" y="-4" width="10" height="7" rx="2" fill={color} />
            </At>
          ))}
          <At x={200} y={52} z={6}>
            <path className="pond-drip" d="M0 0q2 10-1 18" fill="none" stroke="#78350f" strokeWidth="5" strokeLinecap="round" strokeDasharray="6 5" />
          </At>
          {[
            [90, 90],
            [160, 130],
          ].map(([x, y]) => (
            <At key={x} x={x} y={y} z={14}>
              <path className="pond-smell" d="M-6 0q6-6 0-12t0-12M6 4q6-6 0-12t0-12" fill="none" stroke="#a3a33a" strokeWidth="2" strokeLinecap="round" />
            </At>
          ))}
          {[
            [75, 70],
            [140, 150],
            [190, 100],
            [100, 130],
            [165, 75],
          ].map(([x, y], i) => (
            <At key={`${x}-${y}`} x={x} y={y} z={34}>
              <g className="pond-bug" style={{ animationDelay: `${i * -0.7}s` }}>
                <circle r="1.8" fill="#fafafa" />
                <path d="M-5-2 0 0l5-2" stroke="#fafafa" strokeWidth="1" fill="none" />
              </g>
            </At>
          ))}
        </g>
      </svg>
      <ul aria-live="polite" className="pond-points">
        {current.points.map((text) => (
          <li key={text} className="edu-fact">
            {text}
          </li>
        ))}
      </ul>
      <figcaption>ภาพจำลองจากโครงงาน IS เรื่องสระน้ำบริเวณเกาะลอย ฝั่ง “หลังทำตามแนวทาง” เป็นภาพที่คาดหวังจากข้อเสนอ ไม่ใช่ผลที่เกิดขึ้นจริง</figcaption>
    </figure>
  );
}
