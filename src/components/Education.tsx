import { education } from "@/content";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// the map's frame in degrees; north at the top
const WEST = 103.0;
const EAST = 104.3;
const NORTH = 15.45;
const SOUTH = 14.3;
const W = 400;
const H = 300;
const project = ([lat, lon]: [number, number]) => [((lon - WEST) / (EAST - WEST)) * W, ((NORTH - lat) / (NORTH - SOUTH)) * H];

// shortcut: a hand-drawn outline in the rough shape of Surin province, not real borders; use GeoJSON if accuracy matters
const PROVINCE =
  "M70 40 C120 18 190 20 238 34 C292 48 336 38 366 70 C390 98 372 140 382 178 C392 222 360 262 318 276 C270 292 222 280 180 286 C130 294 84 278 62 244 C36 204 48 166 40 128 C32 88 38 56 70 40 Z";

/** where the schooling happened: a tilted map with a route drawn between schools, then a card per stage (see motion.ts) */
export function Education() {
  // one pin per school, in the order first reached
  const pins = education.filter((stop, i) => education.findIndex((other) => other.school === stop.school) === i);
  const [from, to] = pins.map((stop) => project(stop.at));
  const route = `M${from[0]} ${from[1]} C${from[0] - 10} ${from[1] - 60} ${to[0] + 70} ${to[1] + 40} ${to[0]} ${to[1]}`;

  return (
    <div className="edu">
      <figure className="edu-map-wrap">
        <div className="edu-map">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`แผนที่จำลอง จาก${pins.map((pin) => pin.school).join(" ไป")}`}>
            <defs>
              <pattern id="edu-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M20 0H0V20" fill="none" stroke="rgba(255,255,255,0.06)" />
              </pattern>
              <radialGradient id="edu-land" cx="50%" cy="45%" r="60%">
                <stop offset="0" stopColor="#2a1416" />
                <stop offset="1" stopColor="#120a0b" />
              </radialGradient>
            </defs>
            <rect width={W} height={H} fill="url(#edu-grid)" />
            <path d={PROVINCE} fill="url(#edu-land)" stroke="rgba(248,113,113,0.45)" strokeWidth="1.5" />
            <text x="80" y="70" className="edu-map-label">
              จังหวัดสุรินทร์
            </text>
            <path d={route} className="edu-route-under" />
            <path d={route} className="edu-route" pathLength={1} />
            {pins.map((stop) => {
              const [x, y] = project(stop.at);
              const ring = stop.schoolColors?.[1]?.hex ?? "#f87171";
              return (
                <g key={stop.school} className="edu-pin" data-school={stop.school} transform={`translate(${x} ${y})`}>
                  <circle r="22" fill={ring} opacity="0.18" className="edu-pin-pulse" />
                  <circle r="17" fill="#fff" stroke={ring} strokeWidth="3" />
                  <clipPath id={`edu-clip-${stop.district}`}>
                    <circle r="15" />
                  </clipPath>
                  <image href={base + stop.logo} x="-15" y="-15" width="30" height="30" clipPath={`url(#edu-clip-${stop.district})`} />
                  <text y="-26" textAnchor="middle" className="edu-pin-label">
                    {stop.district}
                  </text>
                </g>
              );
            })}
            <circle r="5" className="edu-traveller" cx={from[0]} cy={from[1]} />
          </svg>
        </div>
        <figcaption className="mt-2 text-center text-[11px] text-[var(--muted)]">
          แผนที่จำลอง ตำแหน่งอำเภอโดยประมาณ ไม่ใช่เส้นแบ่งเขตจริง
        </figcaption>
      </figure>

      <div className="edu-list">
        {education.map((stop, i) => (
          // the school's colours paint the card
          <article
            key={stop.level}
            className="edu-stop"
            data-school={stop.school}
            style={{ "--a": stop.schoolColors?.[1]?.hex ?? "#f87171", "--b": stop.schoolColors?.[0]?.hex ?? "#7f1d1d" } as React.CSSProperties}
          >
            <div className="edu-card solx-card">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="edu-step">{String(i + 1).padStart(2, "0")}</span>
                <span className="edu-level">{stop.level}</span>
                {stop.current && <span className="edu-now">กำลังศึกษา</span>}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">ปีการศึกษา {stop.period}</p>
              <div className="mt-4 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- a static export serves images as they are */}
                <img src={base + stop.logo} alt={`ตรา${stop.school}`} className="edu-logo" />
                <h3 className="text-xl font-bold sm:text-2xl">{stop.school}</h3>
              </div>
              {stop.logoNote && <p className="edu-logo-note">ตราโรงเรียน: {stop.logoNote}</p>}
              {stop.program && <p className="edu-program">{stop.program}</p>}
              <p className="text-sm text-[var(--muted)]">{stop.place}</p>
              {stop.schoolColors && (
                <p className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  สีประจำโรงเรียน
                  {stop.schoolColors.map((color) => (
                    <span key={color.hex} className="edu-swatch" style={{ "--c": color.hex } as React.CSSProperties}>
                      {color.name}
                    </span>
                  ))}
                </p>
              )}
              {stop.stat && (
                <p className="mt-4 flex items-baseline gap-2">
                  <span className="edu-count text-4xl font-black" data-to={stop.stat.value}>
                    {stop.stat.value.toLocaleString("th-TH")}
                  </span>
                  <span className="text-sm text-[var(--muted)]">{stop.stat.label}</span>
                </p>
              )}
              <ul className="mt-4 space-y-1.5 text-sm">
                {stop.facts.map((fact) => (
                  <li key={fact} className="edu-fact">
                    {fact}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <a href={stop.website} target="_blank" rel="noopener noreferrer" className="solx-btn-ghost px-4 py-2 text-sm">
                  เว็บไซต์โรงเรียน <span aria-hidden="true">↗</span>
                </a>
                <p className="text-[11px] text-[var(--muted)]">ข้อมูล: {stop.source}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
