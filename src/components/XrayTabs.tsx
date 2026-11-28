"use client";

import { Fragment, useState } from "react";
import { XrayCode } from "@/components/XrayCode";
import { XrayGlossary, XraySpeed } from "@/components/XraySpeed";
import type { accessOf, boxOf, computedOf, htmlOf, layoutOf, Leaf, mediaOf, pageOf, Row, Rule, rulesOf } from "@/xray-inspect";
import { declarations, type Part } from "@/xray";
import { plain } from "@/xray-words";

export const TABS = [
  { id: "part", th: "ส่วนนี้", en: "Part" },
  { id: "code", th: "โค้ดจริง", en: "Source" },
  { id: "box", th: "กล่อง", en: "Box" },
  { id: "css", th: "CSS", en: "CSS" },
  { id: "computed", th: "ค่าคำนวณ", en: "Computed" },
  { id: "html", th: "HTML", en: "HTML" },
  { id: "tree", th: "ผังหน้า", en: "Tree" },
  { id: "media", th: "สื่อ", en: "Media" },
  { id: "access", th: "การเข้าถึง", en: "Access" },
  { id: "speed", th: "ความเร็ว", en: "Speed" },
  { id: "page", th: "ทั้งหน้า", en: "Page" },
] as const;
export type Tab = (typeof TABS)[number]["id"];

/** what the open tab shows, read from the page */
export type Detail =
  | { tab: "part"; inside: number; code: string }
  | { tab: "code" }
  | { tab: "speed" }
  | { tab: "box"; box: ReturnType<typeof boxOf>; rows: ReturnType<typeof layoutOf> }
  | ({ tab: "css" } & ReturnType<typeof rulesOf>)
  | { tab: "computed"; values: ReturnType<typeof computedOf> }
  | ({ tab: "html"; code: string } & ReturnType<typeof htmlOf>)
  | { tab: "tree"; rows: Leaf[] }
  | { tab: "media"; rows: ReturnType<typeof mediaOf> }
  | { tab: "access"; rows: ReturnType<typeof accessOf> }
  | { tab: "page"; page: ReturnType<typeof pageOf> };

function Table({ rows, english }: { rows: Row[]; english: boolean }) {
  return (
    <dl>
      {rows.map(([th, en, value], i) => (
        <div key={`${i} ${en}`}>
          <dt>{english ? en : th}</dt>
          <dd>
            {value.startsWith("#") && <i style={{ background: value.slice(0, 7) }} />}
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** margin round border round padding round content, each with its four widths in place */
function Boxes({ box }: { box: ReturnType<typeof boxOf> }) {
  return (["margin", "border", "padding"] as const).reduceRight(
    (inner, name) => (
      <div className={`xray-box is-${name}`}>
        <span>{name}</span>
        {box[name].map((value, side) => (
          <b key={side} className={`side-${side}`}>
            {value}
          </b>
        ))}
        {inner}
      </div>
    ),
    <div className="xray-box is-content">{box.content}</div>,
  );
}

function Rules({ list }: { list: Rule[] }) {
  return list.map((rule, i) => (
    <Fragment key={i}>
      {rule.when && <p className="xray-when">{rule.when}</p>}
      <pre>
        <em>{rule.selector}</em>
        {rule.weight && <s title="specificity">({rule.weight})</s>}
        {" {\n"}
        {declarations(rule.body)
          .map((line) => `  ${line};`)
          .join("\n")}
        {"\n}"}
      </pre>
    </Fragment>
  ));
}

/** every worked-out property, narrowed by typing */
function Computed({ values, english }: { values: [string, string][]; english: boolean }) {
  const [query, setQuery] = useState("");
  const shown = values.filter(([name, value]) => `${name} ${value}`.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <>
      <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={english ? "Filter, e.g. color, margin" : "ค้นหา เช่น color, margin"} aria-label={english ? "Filter properties" : "ค้นหาคุณสมบัติ"} />
      <p className="xray-file">
        {shown.length} / {values.length}
      </p>
      <dl>
        {shown.map(([name, value]) => (
          <div key={name}>
            <dt>{name}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

function Copy({ words, english }: { words: string; english: boolean }) {
  const [done, setDone] = useState("");
  return (
    <button type="button" onClick={() => navigator.clipboard.writeText(words).then(() => setDone(words), () => setDone(""))}>
      {done === words ? (english ? "Copied ✓" : "คัดลอกแล้ว ✓") : english ? "Copy" : "คัดลอก"}
    </button>
  );
}

export function XrayTab({ detail, part, name, english, onPick, onToggle }: { detail: Detail | null; part: Part | undefined; /** the element right under the pointer, as tag.class */ name: string; english: boolean; /** a row of the tree was pressed, or its branch opened */ onPick: (at: string) => void; onToggle: (at: string) => void }) {
  const say = (th: string, en: string) => (english ? en : th);
  const none = <p className="xray-none">{say("เลื่อนแว่นไปบนชิ้นที่อยากดู", "Move the lens over something")}</p>;
  if (!detail) return none;
  switch (detail.tab) {
    case "code":
      return part ? <XrayCode file={part.file} english={english} /> : <p className="xray-none">{say("เลื่อนแว่นไปบนส่วนที่อยากดูโค้ด แล้วกด F ตรึงไว้", "Move over a part, then press F to hold it")}</p>;
    case "speed":
      return <XraySpeed english={english} />;
    case "part": {
      const tag = name.split(/[.#]/)[0];
      const pointed = tag && (
        <>
          <h4>{say("ชิ้นที่ชี้อยู่คือ", "Under the pointer")}</h4>
          <p>
            <code>{`<${tag}>`}</code> {plain(tag)[english ? "en" : "th"]}
          </p>
        </>
      );
      return part ? (
        <>
          <p>{part[english ? "en" : "th"][1]}</p>
          <h4>{say("สร้างด้วย", "Made with")}</h4>
          <ul className="xray-tags">
            {part.tech.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <h4>{say("ทำงานอย่างไร", "How it works")}</h4>
          <ol>
            {part.steps[english ? "en" : "th"].map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="xray-file">
            {say("โค้ดอยู่ที่", "Source")}: <code>{part.file}</code>
          </p>
          <h4>
            {say("โครงสร้างข้างใน", "Inside")} ({detail.inside} {say("ชิ้น", "elements")})
          </h4>
          <pre>{detail.code}</pre>
          {pointed}
          <XrayGlossary english={english} />
        </>
      ) : (
        <>
          <p className="xray-none">{say("เลื่อนแว่นไปบนส่วนต่างๆ เพื่อดูว่าสร้างด้วยอะไร กด F เพื่อตรึงแว่นไว้อ่าน", "Move over any part to see how it is made. Press F to hold the lens while you read")}</p>
          {pointed}
          <XrayGlossary english={english} />
        </>
      );
    }
    case "box":
      return (
        <>
          <Boxes box={detail.box} />
          <Table rows={detail.rows} english={english} />
        </>
      );
    case "css":
      return (
        <>
          <p className="xray-file">{say(`กฎที่ตรงกับชิ้นนี้ตอนนี้ ${detail.total} กฎ กฎท้ายไฟล์อยู่บน ตัวเลขในวงเล็บคือน้ำหนัก (id, class, แท็ก)`, `${detail.total} rules match now, last written first; weights are (id, class, tag)`)}</p>
          <Rules list={detail.rules} />
          {detail.waiting.length > 0 && (
            <>
              <h4>{say("รอสถานะ เช่น ชี้หรือโฟกัส", "Waiting for hover, focus and the like")}</h4>
              <Rules list={detail.waiting} />
            </>
          )}
          {detail.drawn.length > 0 && (
            <>
              <h4>::before / ::after</h4>
              <Rules list={detail.drawn} />
            </>
          )}
          {detail.variables.length > 0 && (
            <>
              <h4>{say("ตัวแปร CSS ที่ใช้", "CSS variables in use")}</h4>
              <dl>
                {detail.variables.map(([name, value]) => (
                  <div key={name}>
                    <dt>{name}</dt>
                    <dd>
                      {value.startsWith("#") && <i style={{ background: value }} />}
                      {value.slice(0, 120)}
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          )}
          {detail.frames.map((frame) => (
            <Fragment key={frame}>
              <h4>{say("จังหวะอนิเมชัน", "Keyframes")}</h4>
              <pre className="is-wrapped">{frame}</pre>
            </Fragment>
          ))}
        </>
      );
    case "computed":
      return <Computed values={detail.values} english={english} />;
    case "html":
      return (
        <>
          <h4>{say("ที่อยู่ของชิ้นนี้ (selector)", "Selector")}</h4>
          <pre className="is-wrapped">{detail.selector}</pre>
          <Copy words={detail.selector} english={english} />
          <h4>{say("แท็กเปิด", "Opening tag")}</h4>
          <pre className="is-wrapped">{detail.tag}</pre>
          {detail.events.length > 0 && (
            <>
              <h4>{say("เหตุการณ์ที่ React ผูกไว้", "Handlers React has bound")}</h4>
              <ul className="xray-tags">
                {detail.events.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </>
          )}
          {detail.text && (
            <>
              <h4>{say("ข้อความในชิ้นนี้", "Its words")}</h4>
              <p>{detail.text}</p>
            </>
          )}
          <h4>{say("ลูกหลานข้างใน", "Inside")}</h4>
          <pre>{detail.code}</pre>
        </>
      );
    case "tree":
      return (
        <ul className="xray-tree">
          {detail.rows.map((row) => (
            <li key={row.at} className={row.chosen ? "is-chosen" : ""} style={{ paddingLeft: `${row.depth * 0.7}rem` }}>
              {row.children > 0 && row.at ? (
                <button type="button" aria-expanded={row.open} aria-label={say("เปิดปิดกิ่ง", "Open or close")} onClick={() => onToggle(row.at)}>
                  {row.open ? "▾" : "▸"}
                </button>
              ) : (
                <span />
              )}
              <button type="button" onClick={() => onPick(row.at)}>
                {row.label}
                {row.children > 0 && <small> {row.children}</small>}
              </button>
            </li>
          ))}
        </ul>
      );
    case "media":
      return detail.rows.length ? <Table rows={detail.rows} english={english} /> : <p className="xray-none">{say("ชิ้นนี้ไม่มีรูป ภาพวาด หรือการเคลื่อนไหวที่กำลังเล่น", "No pictures, drawings or running motion here")}</p>;
    case "access":
      return (
        <>
          <Table rows={detail.rows} english={english} />
          <p className="xray-file">{say("ความต่างสีคิดจากสีพื้นทึบที่อยู่ข้างหลัง ไม่นับรูปหรือสีไล่ระดับ", "Contrast uses the solid colour behind; pictures and gradients are not counted")}</p>
        </>
      );
    default: {
      const { rows, files, fonts, colours } = detail.page;
      const most = Math.max(1, ...files.map((file) => file.kilobytes));
      return (
        <>
          <Table rows={rows} english={english} />
          <h4>{say("ไฟล์ที่หนักที่สุด", "Heaviest files")}</h4>
          <ul className="xray-files">
            {files.map((file, i) => (
              <li key={i} style={{ "--share": file.kilobytes / most } as React.CSSProperties}>
                <span>{file.name}</span>
                <b>{file.kilobytes.toLocaleString("en-US")} KB</b>
              </li>
            ))}
          </ul>
          <h4>{say("ตัวอักษรที่โหลดแล้ว", "Fonts loaded")}</h4>
          <ul className="xray-tags">
            {fonts.map((font) => (
              <li key={font}>{font}</li>
            ))}
          </ul>
          <h4>{say("สีที่พบบ่อย", "Common colours")}</h4>
          <ul className="xray-colours">
            {colours.map(([colour, times]) => (
              <li key={colour}>
                <i style={{ background: colour }} />
                {colour} × {times}
              </li>
            ))}
          </ul>
        </>
      );
    }
  }
}
