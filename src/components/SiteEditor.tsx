"use client";

import { useState, type FormEvent } from "react";
import { Field } from "@/components/Fields";
import { englishOf } from "@/i18n";
import { fromDraft, toDraft, type Draft, type Pair, type Site } from "@/site";
import { useSite } from "@/site-store";

export type SiteTab = "home" | "contact" | "education";

function Both({ label, value, onChange, rows }: { label: string; value: Pair; onChange: (next: Pair) => void; rows?: number }) {
  return (
    <div className="editor-pair">
      <Field label={label} rows={rows} value={value.th} onChange={(event) => onChange({ ...value, th: event.target.value })} />
      <Field label={`${label} (อังกฤษ ไม่บังคับ)`} rows={rows} lang="en" value={value.en} onChange={(event) => onChange({ ...value, en: event.target.value })} />
    </div>
  );
}

/** a list whose entries can be added, removed and moved */
function List<T>({ name, items, onChange, blank, children }: { name: string; items: T[]; onChange: (next: T[]) => void; blank: () => T; children: (item: T, change: (next: T) => void) => React.ReactNode }) {
  // rows keep their own number, so removing or moving one does not hand its boxes to another
  const [keys, setKeys] = useState(() => items.map((_, i) => i));
  const put = (next: T[], order: number[]) => {
    setKeys(order);
    onChange(next);
  };
  const swap = <U,>(list: U[], a: number, b: number) => list.map((entry, i) => (i === a ? list[b] : i === b ? list[a] : entry));

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <fieldset key={keys[i] ?? i} className="editor-entry">
          <legend>
            {name} {i + 1}
          </legend>
          <div className="flex justify-end gap-1">
            <button type="button" disabled={i === 0} onClick={() => put(swap(items, i, i - 1), swap(keys, i, i - 1))} aria-label={`เลื่อน${name} ${i + 1} ขึ้น`} className="solx-btn-ghost editor-move">
              ↑
            </button>
            <button type="button" disabled={i === items.length - 1} onClick={() => put(swap(items, i, i + 1), swap(keys, i, i + 1))} aria-label={`เลื่อน${name} ${i + 1} ลง`} className="solx-btn-ghost editor-move">
              ↓
            </button>
            <button
              type="button"
              onClick={() => window.confirm(`ลบ${name} ${i + 1}?`) && put(items.filter((_, j) => j !== i), keys.filter((_, j) => j !== i))}
              className="solx-btn-ghost px-2 py-1 text-xs"
            >
              ลบ
            </button>
          </div>
          {children(item, (next) => onChange(items.map((entry, j) => (j === i ? next : entry))))}
        </fieldset>
      ))}
      <button type="button" onClick={() => put([...items, blank()], [...keys, Math.max(-1, ...keys) + 1])} className="solx-btn-ghost px-3 py-1.5 text-xs">
        + เพิ่ม{name}
      </button>
    </div>
  );
}

const empty = (): Pair => ({ th: "", en: "" });

/** the texts of the front page, the contact channels and the schooling; one save covers all three */
export function SiteEditor({ tab, busy, onSave }: { tab: SiteTab; busy: boolean; onSave: (make: () => Site) => void }) {
  const site = useSite();
  const [draft, setDraft] = useState<Draft>(() => toDraft(site, englishOf));
  // starting over also rebuilds the lists
  const [round, setRound] = useState(0);
  const change = (part: Partial<Draft>) => setDraft((now) => ({ ...now, ...part }));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(() => fromDraft(draft));
  }

  return (
    <form key={round} onSubmit={submit} noValidate className="space-y-3">
      <div hidden={tab !== "home"} className="space-y-3">
        <Both label="ข้อความแนะนำตัวใต้ชื่อ" rows={2} value={draft.intro} onChange={(intro) => change({ intro })} />
        <h3 className="font-bold">เกี่ยวกับฉัน</h3>
        <List name="ย่อหน้า" items={draft.about} onChange={(about) => change({ about })} blank={empty}>
          {(paragraph, set) => <Both label="ข้อความ" rows={4} value={paragraph} onChange={set} />}
        </List>
      </div>

      <div hidden={tab !== "contact"}>
        <List name="ช่องทาง" items={draft.contacts} onChange={(contacts) => change({ contacts })} blank={() => ({ name: empty(), value: "", href: "" })}>
          {(item, set) => (
            <>
              <Both label="ชื่อช่องทาง" value={item.name} onChange={(name) => set({ ...item, name })} />
              <Field label="ข้อความที่แสดง" value={item.value} onChange={(event) => set({ ...item, value: event.target.value })} />
              <Field label="ลิงก์ (ไม่บังคับ ถ้าเว้นว่างจะมีปุ่มคัดลอก)" type="url" placeholder="https:// หรือ mailto: หรือ tel:" value={item.href} onChange={(event) => set({ ...item, href: event.target.value })} />
            </>
          )}
        </List>
        <p className="mt-2 text-xs text-[var(--muted)]">ทุกคนที่เปิดเว็บเห็นข้อมูลติดต่อ ใส่เฉพาะที่ยินดีให้เปิดเผย</p>
      </div>

      <div hidden={tab !== "education"} className="space-y-3">
        <List
          name="ช่วงการศึกษา"
          items={draft.stages}
          onChange={(stages) => change({ stages })}
          blank={() => ({ level: empty(), school: empty(), period: "", program: empty(), current: false, website: "", mottos: [], logo: "", schoolColors: undefined })}
        >
          {(stage, set) => (
            <>
              <Both label="ระดับชั้น (ลงท้ายด้วยช่วงชั้น เช่น 4–6)" value={stage.level} onChange={(level) => set({ ...stage, level })} />
              <Both
                label="ชื่อโรงเรียน"
                value={stage.school}
                // a school already listed lends its crest and colours
                onChange={(school) => {
                  const known = draft.stages.find((other) => other !== stage && other.school.th.trim() === school.th.trim() && other.logo);
                  set({ ...stage, school, ...(known && { logo: known.logo, schoolColors: known.schoolColors }) });
                }}
              />
              <Field label="ปีการศึกษา (เช่น 2569 – 2571)" value={stage.period} onChange={(event) => set({ ...stage, period: event.target.value })} />
              <Both label="สายการเรียน (ไม่บังคับ)" value={stage.program} onChange={(program) => set({ ...stage, program })} />
              <Field label="เว็บไซต์โรงเรียน (ไม่บังคับ)" type="url" placeholder="https://" value={stage.website} onChange={(event) => set({ ...stage, website: event.target.value })} />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={stage.current}
                  // only one stage is the one being studied now
                  onChange={(event) => change({ stages: draft.stages.map((other) => ({ ...other, current: other === stage && event.target.checked })) })}
                />
                กำลังศึกษาช่วงนี้
              </label>
              <List name="คติพจน์หรือคำขวัญ" items={stage.mottos} onChange={(mottos) => set({ ...stage, mottos })} blank={() => ({ label: empty(), text: empty() })}>
                {(motto, put) => (
                  <>
                    <Both label="คำนำหน้า (เช่น คติพจน์)" value={motto.label} onChange={(label) => put({ ...motto, label })} />
                    <Both label="ข้อความ" value={motto.text} onChange={(text) => put({ ...motto, text })} />
                  </>
                )}
              </List>
            </>
          )}
        </List>
        <p className="text-xs text-[var(--muted)]">โมเดลโรงเรียนมีเฉพาะ 2 โรงเรียนที่วาดไว้ ต้องใช้ชื่อภาษาไทยตรงกัน</p>
      </div>

      <div className="editor-save">
        <button disabled={busy} className="solx-btn-primary px-5 py-2 text-sm">
          บันทึกเนื้อหา
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            if (!window.confirm("ทิ้งการแก้ที่ยังไม่บันทึกทั้งหมด?")) return;
            setDraft(toDraft(site, englishOf));
            setRound(round + 1);
          }}
          className="solx-btn-ghost px-4 py-2 text-sm"
        >
          คืนค่าเดิม
        </button>
      </div>
    </form>
  );
}
