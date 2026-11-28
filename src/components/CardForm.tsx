import type { FormEvent } from "react";
import { Field, field, TwoField } from "@/components/Fields";
import { sectionOf, sections, type SectionId, type Work } from "@/content";
import { englishOf } from "@/i18n";
import { documentsOf, MAX_DOCUMENTS, MAX_PICTURES, picturesOf } from "@/items";
import { fileKindOf } from "@/viewer";

/** the form for one card, read by the save in Works when it is sent */
export function CardForm({
  current,
  section: adding,
  busy,
  pictureUrl,
  onSubmit,
  onCancel,
}: {
  current?: Work;
  /** where a new card goes */
  section: SectionId;
  busy: boolean;
  pictureUrl: (path: string) => string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  // what the page shows in English now, left empty when there is nothing
  const english = (text?: string) => (text && (current?.en?.[text] ?? (englishOf(text) !== text ? englishOf(text) : ""))) || "";
  const both = (name: "title" | "kind" | "group" | "summary" | "date" | "place" | "role" | "learned", label: string, rows?: number) => (
    <TwoField name={name} label={label} value={current?.[name]} english={english(current?.[name])} rows={rows} required={name === "title"} />
  );
  const pictures = current ? picturesOf(current) : [];
  const documents = current ? documentsOf(current) : [];

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <h3 className="font-bold">{current ? `แก้ไข: ${current.title}` : "เพิ่มรายการ"}</h3>
      <label className="block text-sm">
        หมวด
        <select name="section" defaultValue={current ? sectionOf(current) : adding} className={field}>
          {sections
            .filter((section) => section.id !== "education")
            .map((section) => (
              <option key={section.id} value={section.id}>
                {section.title}
              </option>
            ))}
        </select>
      </label>
      {both("group", "หัวข้อย่อย (ไม่บังคับ รายการชื่อเดียวกันอยู่ด้วยกัน)")}
      {both("title", "ชื่อรายการ")}
      {both("kind", "ปี หรือประเภท")}
      {both("summary", "คำอธิบายสั้นบนการ์ด", 3)}

      <details className="editor-more" open={!!(current?.date || current?.place || current?.role || current?.learned)}>
        <summary>รายละเอียดเพิ่มเติม (แสดงในหน้าเต็ม)</summary>
        <div className="space-y-3 pt-3">
          {both("date", "วันที่")}
          {both("place", "สถานที่")}
          {both("role", "บทบาทของฉัน", 2)}
          {both("learned", "สิ่งที่ได้เรียนรู้", 4)}
        </div>
      </details>

      <Field label="ลิงก์เว็บภายนอก (ไม่บังคับ)" name="link" type="url" placeholder="https://" defaultValue={current?.link && !fileKindOf(current.link) ? current.link : ""} />
      <label className="block text-sm">
        ไฟล์ PDF, Word, PowerPoint หรือ Excel (เลือกได้หลายไฟล์ รวมไม่เกิน {MAX_DOCUMENTS} ไฟล์ ไฟล์ละไม่เกิน 20 MB)
        <input name="document" type="file" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" className={field} />
        <span className="text-xs text-[var(--muted)]">ใครก็ดาวน์โหลดไฟล์ที่ใส่ได้</span>
      </label>
      {documents.length > 0 && (
        <ul aria-label="ไฟล์ที่มีอยู่" className="space-y-1">
          {documents.map((file) => (
            <li key={file.link} className="rounded-lg border px-3 py-2 text-xs">
              <p className="break-all">{file.name}</p>
              <label className="mt-1 flex items-center gap-1">
                <input name="dropfile" type="checkbox" value={file.link} /> เอาออก
              </label>
            </li>
          ))}
        </ul>
      )}

      <label className="block text-sm">
        รูป (เลือกได้หลายรูป รวมไม่เกิน {MAX_PICTURES} รูป)
        <input name="pictures" type="file" accept="image/*" multiple className={field} />
        <span className="text-xs text-[var(--muted)]">ใส่คำบรรยายและเลือกปกได้เมื่อกดแก้ไขอีกครั้งหลังบันทึก</span>
      </label>
      {pictures.length > 0 && (
        <ul aria-label="รูปที่มีอยู่" className="space-y-3">
          {pictures.map((path, i) => {
            const caption = current?.captions?.[path];
            return (
              <li key={path} className="space-y-2 rounded-lg border p-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- a static export serves images as they are */}
                <img src={pictureUrl(path)} alt={`รูปที่ ${i + 1}`} className="h-28 w-full rounded-lg object-contain" />
                <div className="flex gap-4 text-xs">
                  <label className="flex items-center gap-1">
                    <input name="cover" type="radio" value={path} defaultChecked={i === 0} /> ใช้เป็นปก
                  </label>
                  <label className="flex items-center gap-1">
                    <input name="drop" type="checkbox" value={path} /> เอาออก
                  </label>
                </div>
                <TwoField name={`caption-${i}`} label="คำบรรยายใต้รูป" value={caption} english={english(caption)} />
              </li>
            );
          })}
        </ul>
      )}
      <div className="editor-save">
        <button disabled={busy} className="solx-btn-primary px-5 py-2 text-sm">
          บันทึก
        </button>
        <button type="button" disabled={busy} onClick={onCancel} className="solx-btn-ghost px-5 py-2 text-sm">
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
