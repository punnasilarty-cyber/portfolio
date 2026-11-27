"use client";

import { Fragment, useEffect, useState, type FormEvent, type MouseEvent } from "react";
import { Education } from "@/components/Education";
import { Reveal } from "@/components/Reveal";
import { SpotlightCard } from "@/components/SpotlightCard";
import { StaggerText } from "@/components/StaggerText";
import { groupsOf, sectionOf, sections, works as defaults, type SectionId, type Work } from "@/content";
import { Viewer, type Shown } from "@/components/Viewer";
import { checkToken, deleteFile, fromBase64, readFile, writeFile } from "@/github";
import { useMotion } from "@/motion";
import { seal, unseal } from "@/vault";
import { viewOf } from "@/viewer";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const field = "editor-field mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-[var(--foreground)]";
const DATA = "works.json";
const VAULT = "vault.txt"; // the encrypted token, public on the site

/** shrinks to 1600px JPEG, which also drops the photo's location data */
async function toJpeg(file: File) {
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("เปิดรูปนี้ไม่ได้ ใช้ไฟล์ JPG, PNG หรือ WebP");
  });
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = new OffscreenCanvas(Math.round(bitmap.width * scale), Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#08090a"; // JPEG has no transparency
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.convertToBlob({ type: "image/jpeg", quality: 0.85 });
}

/** every category of the page; the owner unlocks editing in place with a password */
export function Works() {
  const [works, setWorks] = useState<Work[] | null>(null);
  // the plain token stays in memory only
  const [token, setToken] = useState("");
  // null: the dialog is closed; saved is empty when a new password is being set up
  const [panel, setPanel] = useState<{ saved: string } | null>(null);
  const [sha, setSha] = useState<string>();
  // a number edits that item, a section id adds a new one there
  const [editing, setEditing] = useState<number | SectionId | null>(null);
  // fresh uploads are not on the host for a minute or two
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  // the floating editor window; closed shows the page exactly as visitors see it
  const [open, setOpen] = useState(true);
  const [opacity, setOpacity] = useState(95);

  useEffect(() => {
    // the query string skips the host's cache, so a fresh save shows up
    fetch(`${base}/works.json?t=${Date.now()}`)
      .then((response) => (response.ok ? response.json() : defaults))
      .then((data) => setWorks(Array.isArray(data) ? data : defaults))
      .catch(() => setWorks(defaults));
  }, []);

  useMotion(works);

  async function run(task: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    try {
      await task();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    const saved = panel!.saved;
    run(async () => {
      if (!saved && password !== data.get("confirm")) throw new Error("รหัสสองช่องไม่ตรงกัน");
      const value = saved ? await unseal(saved, password) : String(data.get("token")).trim();
      await checkToken(value);
      const file = await readFile(value, DATA);
      setWorks(file ? JSON.parse(new TextDecoder().decode(fromBase64(file.content))) : defaults);
      setSha(file?.sha);
      if (!saved) {
        const bytes = new TextEncoder().encode(await seal(value, password));
        await writeFile(value, VAULT, bytes, (await readFile(value, VAULT))?.sha);
      }
      setToken(value);
      setOpen(true);
      setPanel(null);
      if (!saved) setMessage("ตั้งรหัสแล้ว เครื่องอื่นจะใช้ได้ในราว 1–2 นาที");
    });
  }

  function openPanel() {
    run(async () => {
      const response = await fetch(`${base}/${VAULT}?t=${Date.now()}`);
      // only a missing file means "not set up"; other failures must not offer to replace the password
      if (!response.ok && response.status !== 404) throw new Error("โหลดข้อมูลรหัสไม่ได้ ลองใหม่อีกครั้ง");
      setPanel({ saved: response.ok ? (await response.text()).trim() : "" });
    });
  }

  function logout() {
    setToken("");
    setEditing(null);
    setMessage("");
  }

  async function publish(next: Work[]) {
    const bytes = new TextEncoder().encode(JSON.stringify(next, null, 2));
    setSha(await writeFile(token, DATA, bytes, sha));
    setWorks(next);
  }

  // an image goes away only once no item points at it
  async function dropImage(image: string | undefined, next: Work[]) {
    if (image?.startsWith("/works/") && !next.some((work) => work.image === image)) await deleteFile(token, image.slice(1));
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (name: string) => String(data.get(name) ?? "").trim();
    run(async () => {
      const old = typeof editing === "number" ? works![editing] : undefined;
      const link = text("link");
      if (!text("title")) throw new Error("ใส่ชื่อรายการ");
      if (link && !/^https?:\/\//i.test(link)) throw new Error("ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://");
      let image = data.get("removeImage") ? undefined : old?.image;
      const file = data.get("image") as File;
      if (file.size) {
        const name = `works/${Date.now()}.jpg`;
        const jpeg = await toJpeg(file);
        await writeFile(token, name, new Uint8Array(await jpeg.arrayBuffer()));
        image = `/${name}`;
        setPreviews((map) => ({ ...map, [`/${name}`]: URL.createObjectURL(jpeg) }));
      }
      const work: Work = {
        section: text("section") as SectionId,
        group: text("group") || undefined,
        title: text("title"),
        kind: text("kind"),
        summary: text("summary"),
        image,
        link: link || undefined,
      };
      const next = old ? works!.map((item, i) => (i === editing ? work : item)) : [work, ...works!];
      await publish(next);
      setEditing(null);
      await dropImage(old?.image, next);
      setMessage("บันทึกแล้ว คนอื่นจะเห็นในราว 1–2 นาที");
    });
  }

  function remove(index: number) {
    if (!window.confirm(`ลบ "${works![index].title}" ออกจากเว็บ?`)) return;
    run(async () => {
      const next = works!.filter((_, i) => i !== index);
      await publish(next);
      setEditing(null);
      await dropImage(works![index].image, next);
      setMessage("ลบแล้ว คนอื่นจะเห็นในราว 1–2 นาที");
    });
  }

  const current = typeof editing === "number" ? works?.[editing] : undefined;
  const status = (
    <p role="status" className="min-h-5 text-center text-sm text-[var(--accent-soft)]">
      {busy ? "กำลังทำงาน…" : message}
    </p>
  );
  // keeps each item's position in the saved list, which editing and deleting need
  // education is a fixed timeline in content.ts
  const editable = sections.filter((section) => section.id !== "education");
  const inSection = (id: SectionId) => (works ?? []).map((work, index) => ({ work, index })).filter(({ work }) => sectionOf(work) === id);

  return (
    <>
      {sections.map((section, order) => (
        <section key={section.id} id={section.id} className="relative isolate mx-auto max-w-6xl scroll-mt-28 px-5 py-16 lg:scroll-mt-24">
          <span aria-hidden="true" className="fx-number">
            {String(order + 1).padStart(2, "0")}
          </span>
          {/* only the heading waits for scrolling: a tall grid might never be "visible enough" */}
          <Reveal>
            <h2 aria-label={section.title} className="mb-10 text-center text-2xl font-semibold sm:text-4xl">
              <StaggerText text={section.title} />
            </h2>
          </Reveal>
          {section.id === "education" ? (
            <Education project={inSection("is2").find(({ work }) => work.image)?.work} />
          ) : works && inSection(section.id).length === 0 ? (
            <p className="text-center text-sm text-[var(--muted)]">ยังไม่มีข้อมูล</p>
          ) : (
            // while loading, one empty list holds the space
            (works ? groupsOf(inSection(section.id), ({ work }) => work.group) : [{ name: "", items: [] }]).map((group) => (
              <Fragment key={group.name}>
                {group.name && <h3 className="work-group">{group.name}</h3>}
                <ul aria-label={group.name || undefined} className="grid min-h-40 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy={!works}>
                  {group.items.map(({ work, index }) => (
                    <li key={`${index}-${work.title}`}>
                      <WorkCard work={work} preview={work.image ? previews[work.image] : undefined} />
                    </li>
                  ))}
                </ul>
              </Fragment>
            ))
          )}
        </section>
      ))}

      {!token && (
        <div className="fixed bottom-4 left-4 z-40">
          <button disabled={!works || busy} onClick={openPanel} aria-label="เข้าสู่โหมดแก้ไข" className="secret-btn">
            <Lock />
            <span aria-hidden="true">แก้ไข</span>
          </button>
          {!panel && message && (
            <p role="alert" className="solx-card mt-2 max-w-60 p-2 text-xs text-[var(--accent-soft)]">
              {message}
            </p>
          )}
        </div>
      )}

      {!token && panel && (
        <dialog
          // a native modal: traps focus and closes on Escape
          ref={(dialog) => {
            if (dialog && !dialog.open) dialog.showModal();
          }}
          onClose={() => {
            setPanel(null);
            setMessage("");
          }}
          aria-label="เข้าสู่โหมดแก้ไข"
          className="secret-dialog m-auto w-[min(24rem,calc(100vw-2rem))] text-[var(--foreground)]"
        >
          <form key={panel.saved} onSubmit={login} className="space-y-4 p-6">
            <h2 className="flex items-center gap-2 font-bold">
              <Lock />
              พื้นที่เจ้าของเว็บ
            </h2>
            {/* lets the browser's password manager save the password */}
            <input name="username" autoComplete="username" defaultValue="portfolio-admin" hidden readOnly />
            {!panel.saved && (
              <>
                <p className="text-xs text-[var(--muted)]">ตั้งรหัสสำหรับใช้ทุกเครื่อง ทำครั้งเดียว</p>
                <label className="block text-sm">
                  GitHub token
                  <input name="token" type="password" autoComplete="off" required autoFocus className={field} />
                </label>
              </>
            )}
            <label className="block text-sm">
              {panel.saved ? "รหัส" : "ตั้งรหัส"}
              <input
                name="password"
                type="password"
                autoComplete={panel.saved ? "current-password" : "new-password"}
                required
                autoFocus={!!panel.saved}
                className={field}
              />
            </label>
            {!panel.saved && (
              <label className="block text-sm">
                พิมพ์รหัสอีกครั้ง
                <input name="confirm" type="password" autoComplete="new-password" required className={field} />
              </label>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <button disabled={busy} className="solx-btn-primary px-5 py-2 text-sm">
                เข้าแก้ไข
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={(event) => event.currentTarget.closest("dialog")!.close()}
                className="solx-btn-ghost px-5 py-2 text-sm"
              >
                ยกเลิก
              </button>
              {panel.saved && (
                <button type="button" disabled={busy} onClick={() => setPanel({ saved: "" })} className="ml-auto text-xs text-[var(--muted)] underline">
                  ตั้งรหัสใหม่
                </button>
              )}
            </div>
            {status}
          </form>
        </dialog>
      )}

      {token && !open && (
        <button onClick={() => setOpen(true)} className="solx-btn-primary fixed right-4 bottom-4 z-40 px-5 py-3 text-sm">
          เปิดหน้าต่างแก้ไข
        </button>
      )}

      {token && (
        // kept mounted while hidden, so a half-filled form survives
        <aside
          aria-label="หน้าต่างแก้ไข"
          hidden={!open}
          className="editor-window"
          style={{ opacity: opacity / 100, backdropFilter: `blur(${(opacity - 30) / 7}px)` }}
        >
          <header className="flex items-center gap-2 border-b px-4 py-3">
            <h2 className="mr-auto font-bold">แก้ไขเนื้อหา</h2>
            <button onClick={() => setOpen(false)} className="solx-btn-ghost px-3 py-1.5 text-xs">
              ซ่อน ดูผลลัพธ์
            </button>
            <button disabled={busy} onClick={logout} className="solx-btn-ghost px-3 py-1.5 text-xs">
              ออก
            </button>
          </header>
          <label className="flex items-center gap-3 border-b px-4 py-2 text-xs text-[var(--muted)]">
            ความทึบ
            <input type="range" min={30} max={100} value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} className="flex-1 accent-red-500" />
            {opacity}%
          </label>
          <div className="space-y-3 overflow-y-auto p-4">
            {status}
            {editing !== null ? (
              <form key={editing} onSubmit={save} className="space-y-3">
                <h3 className="font-bold">{current ? `แก้ไข: ${current.title}` : "เพิ่มรายการ"}</h3>
                <label className="block text-sm">
                  หมวด
                  <select name="section" defaultValue={current ? sectionOf(current) : editing} className={field}>
                    {editable.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  หัวข้อย่อย (ไม่บังคับ)
                  <input name="group" placeholder="รายการที่ใช้ชื่อเดียวกันจะอยู่ด้วยกัน" defaultValue={current?.group} className={field} />
                </label>
                <label className="block text-sm">
                  ชื่อรายการ
                  <input name="title" required autoFocus defaultValue={current?.title} className={field} />
                </label>
                <label className="block text-sm">
                  ปี หรือประเภท
                  <input name="kind" placeholder="เช่น ปีการศึกษา 2569" defaultValue={current?.kind} className={field} />
                </label>
                <label className="block text-sm">
                  คำอธิบาย
                  <textarea name="summary" rows={3} defaultValue={current?.summary} className={field} />
                </label>
                <label className="block text-sm">
                  ลิงก์ (ไม่บังคับ)
                  <input name="link" type="url" placeholder="https://" defaultValue={current?.link} className={field} />
                </label>
                <label className="block text-sm">
                  รูป (ไม่บังคับ)
                  <input name="image" type="file" accept="image/*" className={field} />
                </label>
                {current?.image && (
                  <label className="flex items-center gap-2 text-sm">
                    <input name="removeImage" type="checkbox" /> เอารูปเดิมออก
                  </label>
                )}
                <div className="flex gap-3">
                  <button disabled={busy} className="solx-btn-primary px-5 py-2 text-sm">
                    บันทึก
                  </button>
                  <button type="button" disabled={busy} onClick={() => setEditing(null)} className="solx-btn-ghost px-5 py-2 text-sm">
                    ยกเลิก
                  </button>
                </div>
              </form>
            ) : (
              editable.map((section) => (
                <div key={section.id} className="space-y-2">
                  <div className="flex items-center gap-2 pt-2">
                    <h3 className="mr-auto text-sm font-bold text-[var(--accent-soft)]">{section.title}</h3>
                    <button disabled={busy} onClick={() => setEditing(section.id)} className="solx-btn-primary shrink-0 px-3 py-1 text-xs">
                      + เพิ่ม
                    </button>
                  </div>
                  <ul aria-label={section.title} className="space-y-2">
                    {inSection(section.id).map(({ work, index }) => (
                      <li key={`${index}-${work.title}`} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                        <span className="min-w-0 flex-1 truncate text-sm">{work.title}</span>
                        <button disabled={busy} onClick={() => setEditing(index)} className="solx-btn-ghost px-3 py-1 text-xs">
                          แก้ไข
                        </button>
                        <button disabled={busy} onClick={() => remove(index)} className="solx-btn-ghost px-3 py-1 text-xs">
                          ลบ
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </aside>
      )}
    </>
  );
}

function Lock() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="shrink-0">
      <path d="M12 2 21 7v10l-9 5-9-5V7Z" />
      <circle cx="12" cy="11" r="2" />
      <path d="M12 13v3" />
    </svg>
  );
}

function WorkCard({ work, preview }: { work: Work; preview?: string }) {
  // a certificate must show whole, other photos may be cropped to fill
  const fit = sectionOf(work) === "certificates" ? "object-contain" : "object-cover";
  const [shown, setShown] = useState<Shown | null>(null);
  const picture = preview ?? `${base}${work.image}`;

  // a plain press shows the file here; new-tab presses and files the page cannot draw follow the link
  function openFile(event: MouseEvent<HTMLAnchorElement>) {
    if (event.ctrlKey || event.metaKey || event.shiftKey) return;
    const view = viewOf(work.link!, navigator.pdfViewerEnabled);
    if (!view) return;
    event.preventDefault();
    setShown({ ...view, title: work.title, href: work.link! });
  }

  return (
    <SpotlightCard className="flex h-full flex-col">
      {work.image && (
        <button type="button" onClick={() => setShown({ kind: "image", src: picture, href: picture, title: work.title })} className="work-picture aspect-video bg-black/40">
          {/* eslint-disable-next-line @next/next/no-img-element -- a static export serves images as they are */}
          <img src={picture} alt={work.title} className={`h-full w-full ${fit}`} />
          <span>ดูภาพเต็ม</span>
        </button>
      )}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-xs text-[var(--accent-soft)]">{work.kind}</p>
        <h3 className="font-bold">{work.title}</h3>
        <p className="text-sm whitespace-pre-line text-[var(--muted)]">{work.summary}</p>
        {work.link && (
          <a href={work.link} onClick={openFile} target="_blank" rel="noopener noreferrer" className="solx-btn-ghost mt-auto self-start px-4 py-2 text-sm">
            เปิดดู
          </a>
        )}
      </div>
      {shown && <Viewer shown={shown} onClose={() => setShown(null)} />}
    </SpotlightCard>
  );
}
