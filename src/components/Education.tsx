import { education } from "@/content";

/** the schooling timeline: each stop is a small 3D building that rises as it scrolls in (see motion.ts) */
export function Education() {
  return (
    <div className="edu">
      <div aria-hidden="true" className="edu-spine">
        <div className="edu-spine-fill" />
        <div className="edu-dot" />
      </div>
      {/* the school's colours paint both the model and the card */}
      {education.map((stop, i) => (
        <article key={stop.level} className="edu-stop" style={{ "--a": stop.schoolColors?.[1]?.hex ?? "#f87171", "--b": stop.schoolColors?.[0]?.hex ?? "#7f1d1d" } as React.CSSProperties}>
          <div aria-hidden="true" className="edu-model">
            {/* the CSS keeps the viewing angle; GSAP only turns and grows the inner stand */}
            <div className="edu-iso">
              <div className="edu-spin">
                <div className="edu-ground" />
                {Array.from({ length: stop.floors }, (_, f) => (
                  // the last floor of a stop still being studied is drawn as scaffolding
                  <div
                    key={f}
                    className={`edu-floor ${stop.current && f === stop.floors - 1 ? "edu-building" : ""}`}
                    style={{ transform: `translateZ(calc(var(--h) * ${f}))` }}
                  >
                    <div className="edu-top" />
                    {/* four walls: each wrapper turns a quarter around the floor's centre */}
                    {[0, 1, 2, 3].map((side) => (
                      <div key={side} className="edu-wall" style={{ transform: `rotateZ(${side * 90}deg)` }}>
                        <div className="edu-side" style={{ filter: `brightness(${[1.15, 0.8, 0.6, 0.95][side]})` }} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="edu-card solx-card">
            <p className="flex flex-wrap items-center gap-2 text-xs text-[var(--accent-soft)]">
              <span className="edu-step">{String(i + 1).padStart(2, "0")}</span>
              {stop.level}
              {stop.period && <span className="text-[var(--muted)]">· {stop.period}</span>}
              {stop.current && <span className="edu-now">กำลังศึกษา</span>}
            </p>
            <h3 className="mt-2 text-xl font-bold sm:text-2xl">{stop.school}</h3>
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
  );
}
