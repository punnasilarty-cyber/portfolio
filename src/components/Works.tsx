"use client";

import { Fragment, useEffect, useState, type FormEvent } from "react";
import { Education } from "@/components/Education";
import { Reveal } from "@/components/Reveal";
import { StaggerText } from "@/components/StaggerText";
import { groupsOf, sectionOf, sections, works as defaults, type SectionId, type Work } from "@/content";
import { DownloadAll } from "@/components/DownloadAll";
import { EmptyArt } from "@/components/Graphics";
import { BackupPanel } from "@/components/BackupPanel";
import { CardForm } from "@/components/CardForm";
import { field } from "@/components/Fields";
import { SiteEditor, type SiteTab } from "@/components/SiteEditor";
import { WorkCard } from "@/components/WorkCard";
import { setOwnEnglish, useLang } from "@/i18n";
import { readBackup, unzip } from "@/backup";
import { checkToken, deleteFile, fromBase64, readBytes, readFile, writeFile } from "@/github";
import { addressOf, DOCUMENT_TYPES, documentsOf, filesOf, MAX_DOCUMENT_BYTES, MAX_DOCUMENTS, MAX_PICTURES, moved, picturesOf, safeName, unusedFiles } from "@/items";
import { useMotion } from "@/motion";
import { readSite, texts, type Site } from "@/site";
import { setSite, useSite } from "@/site-store";
import { seal, unseal } from "@/vault";
import { uniqueNames, zip } from "@/zip";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const DATA = "works.json";
const SITE = "site.json"; // front page, contacts and schooling
const TABS = [
  { id: "cards", label: "ผลงาน" },
  { id: "home", label: "หน้าแรก" },
  { id: "contact", label: "ติดต่อ" },
  { id: "education", label: "การศึกษา" },
  { id: "backup", label: "สำรอง" },
] as const;
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
  const { english, t } = useLang();
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
  const [tab, setTab] = useState<"cards" | "backup" | SiteTab>("cards");
  const [siteSha, setSiteSha] = useState<string>();
  const site = useSite();

  useEffect(() => {
    // the query string skips the host's cache, so a fresh save shows up
    const load = (name: string) =>
      fetch(`${base}/${name}?t=${Date.now()}`)
        .then((response) => (response.ok ? response.json() : null))
        .catch(() => null);
    // together, so the cards never show before the words around them
    Promise.all([load(DATA), load(SITE)]).then(([data, words]) => {
      setSite(readSite(words));
      setWorks(Array.isArray(data) ? data : defaults);
    });
  }, []);

  // the owner's English, from the cards and from the rest of the page
  useEffect(() => {
    setOwnEnglish(Object.assign({}, ...(works ?? []).map((work) => texts(work.en)), site.en));
  }, [works, site]);

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
      const words = await readFile(value, SITE);
      setSite(words ? readSite(JSON.parse(new TextDecoder().decode(fromBase64(words.content)))) : readSite(null));
      setSiteSha(words?.sha);
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

  // a stored file goes away only once no item points at it
  async function dropFiles(old: Work | undefined, next: Work[]) {
    if (old) for (const path of unusedFiles(old, next)) await deleteFile(token, path);
  }

  const pictureUrl = (path: string) => previews[path] ?? `${base}${path}`;

  /** everything the editor has saved, as one file */
  function backup() {
    run(async () => {
      const json = (value: unknown) => new TextEncoder().encode(JSON.stringify(value, null, 2));
      const entries = [{ name: DATA, data: json(works) }];
      // only when something was saved; otherwise the page's own texts are in use
      if (siteSha) entries.push({ name: SITE, data: json(site) });
      const paths = [...new Set(works!.flatMap(filesOf))];
      let missing = 0;
      for (const [i, path] of paths.entries()) {
        setMessage(`กำลังรวมไฟล์ ${i + 1} จาก ${paths.length}…`);
        const data = await readBytes(token, path);
        if (data) entries.push({ name: path, data });
        else missing++;
      }
      const address = URL.createObjectURL(new Blob([zip(entries)], { type: "application/zip" }));
      const link = document.createElement("a");
      link.href = address;
      // the day by this computer's clock
      link.download = `portfolio-backup-${new Date().toLocaleDateString("sv-SE")}.zip`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(address), 60000);
      setMessage(missing ? `ดาวน์โหลดแล้ว แต่หาไฟล์ไม่พบ ${missing} ไฟล์` : "ดาวน์โหลดไฟล์สำรองแล้ว");
    });
  }

  function restore(file: File) {
    run(async () => {
      // the whole file is checked before anything is written
      const saved = readBackup(unzip(new Uint8Array(await file.arrayBuffer())));
      const warning = saved.missing.length ? `\nคำเตือน: ไฟล์สำรองขาดไฟล์ ${saved.missing.length} ไฟล์` : "";
      if (!window.confirm(`กู้คืนจาก "${file.name}"?\nการ์ด ${saved.works.length} ใบ ไฟล์ ${saved.files.length} ไฟล์\nเนื้อหาบนเว็บตอนนี้ (${works!.length} ใบ) จะถูกแทนที่${warning}`)) return;
      for (const [i, entry] of saved.files.entries()) {
        setMessage(`กำลังตรวจและอัปโหลดไฟล์ ${i + 1} จาก ${saved.files.length}…`);
        // names carry the time of upload, so a file already there is the same one
        if (!(await readFile(token, entry.name))) await writeFile(token, entry.name, entry.data);
      }
      setMessage("กำลังเขียนเนื้อหา…");
      if (saved.site) setSiteSha(await writeFile(token, SITE, new TextEncoder().encode(JSON.stringify(saved.site, null, 2)), siteSha));
      else if (siteSha) {
        await deleteFile(token, SITE);
        setSiteSha(undefined);
      }
      setSite(saved.site ?? readSite(null));
      await publish(saved.works);
      setEditing(null);
      setMessage("กู้คืนแล้ว คนอื่นจะเห็นในราว 1–2 นาที");
    });
  }

  function saveSite(make: () => Site) {
    run(async () => {
      // made first, so a refusal is shown and nothing is written
      const next = make();
      setSiteSha(await writeFile(token, SITE, new TextEncoder().encode(JSON.stringify(next, null, 2)), siteSha));
      setSite(next);
      setMessage("บันทึกเนื้อหาแล้ว คนอื่นจะเห็นในราว 1–2 นาที");
    });
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
      const dropped = data.getAll("drop");
      const before = old ? picturesOf(old) : [];
      const pictures = before.filter((path) => !dropped.includes(path));
      const cover = String(data.get("cover") ?? "");
      if (pictures.includes(cover)) pictures.unshift(...pictures.splice(pictures.indexOf(cover), 1));
      const added = (data.getAll("pictures") as File[]).filter((file) => file.size);
      const removed = data.getAll("dropfile");
      const documents = (old ? documentsOf(old) : []).filter((file) => !removed.includes(file.link));
      const uploads = (data.getAll("document") as File[]).filter((file) => file.size);
      // everything is checked before the first upload, so a refusal leaves nothing behind
      if (pictures.length + added.length > MAX_PICTURES) throw new Error(`ใส่รูปได้ไม่เกิน ${MAX_PICTURES} รูปต่อรายการ`);
      if (documents.length + uploads.length > MAX_DOCUMENTS) throw new Error(`ใส่ไฟล์ได้ไม่เกิน ${MAX_DOCUMENTS} ไฟล์ต่อรายการ`);
      if (uploads.some((file) => !DOCUMENT_TYPES.test(file.name))) throw new Error("ไฟล์เอกสารต้องเป็น PDF, Word, PowerPoint หรือ Excel");
      if (uploads.some((file) => file.size > MAX_DOCUMENT_BYTES)) throw new Error("ไฟล์เอกสารต้องไม่เกินไฟล์ละ 20 MB");
      // English typed beside a text is kept under that text
      const en: Record<string, string> = {};
      const pair = (name: string) => {
        const thai = text(name);
        if (thai && text(`en-${name}`)) en[thai] = text(`en-${name}`);
        return thai || undefined;
      };
      const captions: Record<string, string> = {};
      before.forEach((path, i) => {
        const caption = pair(`caption-${i}`);
        if (caption && pictures.includes(path)) captions[path] = caption;
      });
      // all pictures are opened first for the same reason
      const jpegs: Blob[] = [];
      for (const file of added) jpegs.push(await toJpeg(file));
      const stamp = Date.now();
      // shortcut: a failed save leaves already uploaded files in works/, clean them up by hand if it ever matters
      for (const [i, jpeg] of jpegs.entries()) {
        setMessage(`กำลังอัปโหลดรูป ${i + 1} จาก ${jpegs.length}…`);
        const name = `works/${stamp + i}.jpg`;
        await writeFile(token, name, new Uint8Array(await jpeg.arrayBuffer()));
        pictures.push(`/${name}`);
        setPreviews((map) => ({ ...map, [`/${name}`]: URL.createObjectURL(jpeg) }));
      }
      const names = uniqueNames(uploads.map((file) => safeName(file.name)));
      for (const [i, file] of uploads.entries()) {
        setMessage(`กำลังอัปโหลดไฟล์ ${i + 1} จาก ${uploads.length}…`);
        // a folder of its own keeps the file's name for whoever downloads it
        const path = `works/${stamp}/${names[i]}`;
        await writeFile(token, path, new Uint8Array(await file.arrayBuffer()));
        documents.push({ link: addressOf(path), name: names[i] });
      }
      // the card opens the web link when there is one, otherwise the first file
      const main = link || documents[0]?.link;
      const others = documents.filter((file) => file.link !== main);
      const work: Work = {
        section: text("section") as SectionId,
        group: pair("group"),
        title: pair("title")!,
        kind: pair("kind") ?? "",
        summary: pair("summary") ?? "",
        date: pair("date"),
        place: pair("place"),
        role: pair("role"),
        learned: pair("learned"),
        image: pictures[0],
        more: pictures.length > 1 ? pictures.slice(1) : undefined,
        link: main || undefined,
        files: others.length ? others : undefined,
        captions: Object.keys(captions).length ? captions : undefined,
        en: Object.keys(en).length ? en : undefined,
      };
      const next = old ? works!.map((item, i) => (i === editing ? work : item)) : [work, ...works!];
      await publish(next);
      setEditing(null);
      await dropFiles(old, next);
      setMessage("บันทึกแล้ว คนอื่นจะเห็นในราว 1–2 นาที");
    });
  }

  function remove(index: number) {
    if (!window.confirm(`ลบ "${works![index].title}" ออกจากเว็บ?`)) return;
    run(async () => {
      const next = works!.filter((_, i) => i !== index);
      await publish(next);
      setEditing(null);
      await dropFiles(works![index], next);
      setMessage("ลบแล้ว คนอื่นจะเห็นในราว 1–2 นาที");
    });
  }

  function reorder(next: Work[]) {
    run(async () => {
      await publish(next);
      setMessage("จัดลำดับแล้ว คนอื่นจะเห็นในราว 1–2 นาที");
    });
  }

  const current = typeof editing === "number" ? works?.[editing] : undefined;
  const status = (
    <p role="status" className="min-h-5 text-center text-sm text-[var(--accent-soft)]">
      {busy ? message || "กำลังทำงาน…" : message}
    </p>
  );
  // keeps each item's position in the saved list, which editing and deleting need
  // education is a fixed timeline, edited under its own tab
  const editable = sections.filter((section) => section.id !== "education");
  const inSection = (id: SectionId) => (works ?? []).map((work, index) => ({ work, index })).filter(({ work }) => sectionOf(work) === id);
  // the project's documents under their own names, and its pictures under their card's title
  const files = inSection("is2").flatMap(({ work }) => [
    ...picturesOf(work).map((path) => ({ name: safeName(`${work.title}.jpg`), url: pictureUrl(path) })),
    ...documentsOf(work).map((file) => ({ name: safeName(file.name), url: file.link })),
  ]);

  return (
    <>
      {sections.map((section, order) => (
        // an empty section takes less room, so the page does not read as unfinished
        <section key={section.id} id={section.id} className={`relative isolate mx-auto max-w-6xl scroll-mt-28 px-5 lg:scroll-mt-24 ${works && section.id !== "education" && inSection(section.id).length === 0 ? "py-10" : "py-16"}`}>
          <span aria-hidden="true" className="fx-number">
            {String(order + 1).padStart(2, "0")}
          </span>
          {/* only the heading waits for scrolling: a tall grid might never be "visible enough" */}
          <Reveal>
            <h2 aria-label={t(section.title)} className="mb-10 text-center text-2xl font-semibold sm:text-4xl">
              <StaggerText text={t(section.title)} />
            </h2>
          </Reveal>
          {section.id === "is2" && files.length > 1 && <DownloadAll files={files} name="IS2-Punnasin.zip" />}
          {section.id === "education" ? (
            <Education project={inSection("is2").find(({ work }) => work.image)?.work} />
          ) : works && inSection(section.id).length === 0 ? (
            <div className="work-empty">
              <EmptyArt section={section.id} />
              <p>{english ? `${t(section.title)}: coming soon` : `กำลังรวบรวม${section.title}`}</p>
            </div>
          ) : (
            // while loading, one empty list holds the space
            (works ? groupsOf(inSection(section.id), ({ work }) => work.group) : [{ name: "", items: [] }]).map((group) => (
              <Fragment key={group.name}>
                {group.name && <h3 className="work-group">{t(group.name)}</h3>}
                <ul aria-label={group.name ? t(group.name) : undefined} className={section.id === "is2" ? "deck min-h-40" : "grid min-h-40 gap-5 sm:grid-cols-2 lg:grid-cols-3"} aria-busy={!works}>
                  {group.items.map(({ work, index }) => (
                    // its place in the pile sets how low it sticks
                    <li key={`${index}-${work.title}`} style={{ "--i": group.items.findIndex((item) => item.index === index) } as React.CSSProperties}>
                      <WorkCard work={work} pictureUrl={pictureUrl} />
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
          <button disabled={!works || busy} onClick={openPanel} aria-label={t("เข้าสู่โหมดแก้ไข")} className="secret-btn">
            <Lock />
            <span aria-hidden="true">{t("แก้ไข")}</span>
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
          <div role="group" aria-label="เลือกสิ่งที่จะแก้" className="editor-tabs">
            {TABS.map((item) => (
              <button key={item.id} type="button" aria-pressed={tab === item.id} onClick={() => setTab(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
          <div className="space-y-3 overflow-y-auto p-4">
            {status}
            {/* kept mounted, so what is typed survives a look at another tab */}
            <div hidden={tab === "cards" || tab === "backup"}>
              <SiteEditor key={siteSha ?? "new"} tab={tab === "cards" || tab === "backup" ? "home" : tab} busy={busy} onSave={saveSite} />
            </div>
            {tab === "backup" && <BackupPanel busy={busy} onBackup={backup} onRestore={restore} />}
            <div hidden={tab !== "cards"} className="space-y-3">
            {editing !== null ? (
              <CardForm
                key={editing}
                current={current}
                section={typeof editing === "number" ? "activities" : editing}
                busy={busy}
                pictureUrl={pictureUrl}
                onSubmit={save}
                onCancel={() => setEditing(null)}
              />
            ) : (
              editable.map((section) => (
                <div key={section.id} className="space-y-2">
                  <div className="flex items-center gap-2 pt-2">
                    <h3 className="mr-auto text-sm font-bold text-[var(--accent-soft)]">{section.title}</h3>
                    <button disabled={busy} onClick={() => setEditing(section.id)} className="solx-btn-primary shrink-0 px-3 py-1 text-xs">
                      + เพิ่ม
                    </button>
                  </div>
                  {/* listed in the same order as on the page */}
                  {groupsOf(inSection(section.id), ({ work }) => work.group).map((group) => (
                    <Fragment key={group.name}>
                      {group.name && <p className="text-xs text-[var(--muted)]">{group.name}</p>}
                      <ul aria-label={group.name || section.title} className="space-y-2">
                        {group.items.map(({ work, index }) => {
                          const up = moved(works!, index, -1);
                          const down = moved(works!, index, 1);
                          return (
                            <li key={`${index}-${work.title}`} className="flex items-center gap-1 rounded-lg border px-3 py-2">
                              <span className="min-w-0 flex-1 truncate text-sm" title={work.title}>
                                {work.title}
                              </span>
                              <button disabled={busy || !up} onClick={() => reorder(up!)} aria-label={`เลื่อนขึ้น ${work.title}`} className="solx-btn-ghost editor-move">
                                ↑
                              </button>
                              <button disabled={busy || !down} onClick={() => reorder(down!)} aria-label={`เลื่อนลง ${work.title}`} className="solx-btn-ghost editor-move">
                                ↓
                              </button>
                              <button disabled={busy} onClick={() => setEditing(index)} className="solx-btn-ghost px-2 py-1 text-xs">
                                แก้ไข
                              </button>
                              <button disabled={busy} onClick={() => remove(index)} className="solx-btn-ghost px-2 py-1 text-xs">
                                ลบ
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </Fragment>
                  ))}
                </div>
              ))
            )}
            </div>
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
