"use client";

import { useState, type MouseEvent } from "react";
import { FirstPage } from "@/components/PdfPages";
import { SpotlightCard } from "@/components/SpotlightCard";
import { Viewer, type Shown } from "@/components/Viewer";
import { sectionOf, type Work } from "@/content";
import { useLang } from "@/i18n";
import { documentsOf, picturesOf } from "@/items";
import { fileKindOf, viewOf } from "@/viewer";

export function WorkCard({ work, pictureUrl }: { work: Work; pictureUrl: (path: string) => string }) {
  // a certificate must show whole, other photos may be cropped to fill
  const fit = sectionOf(work) === "certificates" ? "object-contain" : "object-cover";
  const { english, t } = useLang();
  const [shown, setShown] = useState<Shown | null>(null);
  const [full, setFull] = useState(false);
  const [flipped, setFlipped] = useState(false);
  // the back tells what was learned, or about the work while that has not been written yet
  const behind = work.learned || work.summary;
  const paths = picturesOf(work);
  const pictures = paths.map(pictureUrl);
  const captions = paths.map((path) => t(work.captions?.[path] ?? ""));
  const documents = documentsOf(work);
  const link = work.link ?? documents[0]?.link;
  const kind = link ? fileKindOf(link) : null;

  const showPictures = (at: number, from: Element | null) => setShown({ kind: "image", src: pictures[0], href: pictures[0], title: t(work.title), gallery: pictures, captions, start: at, from });

  // a plain press shows the file here; new-tab presses and files the page cannot draw follow the link
  function openFile(event: MouseEvent<HTMLAnchorElement>, address: string, title: string) {
    if (event.ctrlKey || event.metaKey || event.shiftKey) return;
    const view = viewOf(address, navigator.pdfViewerEnabled);
    if (!view) return;
    event.preventDefault();
    setShown({ ...view, title, href: address, from: event.currentTarget.closest("li") });
  }

  const facts = [
    ["วันที่", work.date],
    ["สถานที่", work.place],
    ["บทบาทของฉัน", work.role],
  ].filter((fact): fact is [string, string] => !!fact[1]);

  return (
    <>
      {/* turns over from the corner tab, so the buttons on the front stay easy to reach; moving away turns it back */}
      <div className={flipped ? "flip is-flipped" : "flip"} onPointerLeave={(event) => event.pointerType === "mouse" && setFlipped(false)}>
        <div className="flip-inner">
          <div className="flip-front" inert={flipped}>
            <SpotlightCard className="flex h-full flex-col">
              {pictures.length > 0 && (
                <button type="button" onClick={(event) => showPictures(0, event.currentTarget.closest("li"))} className="work-picture aspect-video bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element -- a static export serves images as they are */}
                  <img src={pictures[0]} alt={captions[0] || t(work.title)} className={`h-full w-full ${fit}`} />
                  <span>{pictures.length > 1 ? (english ? `View all ${pictures.length} pictures` : `ดูรูปทั้งหมด ${pictures.length} รูป`) : t("ดูภาพเต็ม")}</span>
                </button>
              )}
              {pictures.length === 0 && link && kind && (
                // a second way into the same file as the button below, so keyboards and screen readers skip it
                <a href={link} onClick={(event) => openFile(event, link, t(work.title))} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true" className={`work-file work-file--${kind.toLowerCase()}`}>
                  <b>{kind}</b>
                  <span>{t("กดเพื่อเปิดอ่าน")}</span>
                  {/* a Word file cannot be drawn here, so its cover comes from the PDF of the same name when there is one */}
                  {(kind === "PDF" || kind === "Word") && <FirstPage src={link.replace(/.docx?(?=$|[?#])/i, ".pdf")} />}
                </a>
              )}
              <div className="flex flex-1 flex-col gap-2 p-5">
                <p className="text-xs text-[var(--accent-soft)]">{t(work.kind)}</p>
                <h3 className="font-bold">{t(work.title)}</h3>
                <p className="text-sm whitespace-pre-line text-[var(--muted)]">{t(work.summary)}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-1">
                  {link && (
                    <a href={link} onClick={(event) => openFile(event, link, t(work.title))} target="_blank" rel="noopener noreferrer" className="solx-btn-ghost px-4 py-2 text-sm">
                      {t("เปิดดู")}
                    </a>
                  )}
                  <button type="button" onClick={() => setFull(true)} aria-label={`${t("รายละเอียด")} ${t(work.title)}`} className="solx-btn-ghost px-4 py-2 text-sm">
                    {t("รายละเอียด")}
                  </button>
                </div>
              </div>
            </SpotlightCard>
          </div>
          {behind && (
            <div className="flip-back" inert={!flipped}>
              <p>{work.learned ? t("สิ่งที่ได้เรียนรู้") : english ? "About this work" : "เกี่ยวกับผลงานนี้"}</p>
              <b>{t(work.title)}</b>
              <div>{t(behind)}</div>
              <button type="button" onClick={() => setFull(true)} className="solx-btn-ghost px-4 py-2 text-sm">
                {t("รายละเอียด")}
              </button>
            </div>
          )}
        </div>
        {behind && (
          <button
            type="button"
            aria-pressed={flipped}
            // a mouse turns the card by pointing; a finger or the keyboard presses to turn it either way
            onPointerEnter={(event) => event.pointerType === "mouse" && setFlipped(true)}
            onClick={(event) => setFlipped((event.nativeEvent as PointerEvent).pointerType === "mouse" || !flipped)}
            className="flip-tab"
          >
            <span aria-hidden="true">↻</span> {flipped ? (english ? "Turn back" : "พลิกกลับ") : english ? "Turn over" : "พลิกดู"}
          </button>
        )}
      </div>

      {full && (
        <dialog
          ref={(dialog) => {
            if (dialog && !dialog.open) dialog.showModal();
          }}
          // the picture window opened from here closes on its own, without taking this one along
          onClose={(event) => event.target === event.currentTarget && setFull(false)}
          aria-label={t(work.title)}
          className="detail"
        >
          <header>
            <div>
              <p>{t(work.kind)}</p>
              <h3>{t(work.title)}</h3>
            </div>
            <button autoFocus type="button" onClick={(event) => event.currentTarget.closest("dialog")!.close()} className="solx-btn-primary px-4 py-1.5 text-xs">
              {t("ปิด")}
            </button>
          </header>
          <div className="detail-body">
            {facts.length > 0 && (
              <dl>
                {facts.map(([label, value]) => (
                  <div key={label}>
                    <dt>{t(label)}</dt>
                    <dd>{t(value)}</dd>
                  </div>
                ))}
              </dl>
            )}
            {work.summary && <p>{t(work.summary)}</p>}
            {work.learned && (
              <section>
                <h4>{t("สิ่งที่ได้เรียนรู้")}</h4>
                <p>{t(work.learned)}</p>
              </section>
            )}
            {pictures.length > 0 && (
              <section>
                <h4>{t("รูปภาพ")}</h4>
                <div className="detail-pictures">
                  {pictures.map((picture, i) => (
                    <figure key={picture}>
                      <button type="button" onClick={() => showPictures(i, null)}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- a static export serves images as they are */}
                        <img src={picture} alt={captions[i] || `${t(work.title)} ${i + 1}`} loading="lazy" />
                      </button>
                      {captions[i] && <figcaption>{captions[i]}</figcaption>}
                    </figure>
                  ))}
                </div>
              </section>
            )}
            {documents.length > 0 && (
              <section>
                <h4>{t("ไฟล์เอกสาร")}</h4>
                <ul>
                  {documents.map((file) => (
                    <li key={file.link}>
                      <a href={file.link} onClick={(event) => openFile(event, file.link, file.name)} target="_blank" rel="noopener noreferrer" className="solx-btn-ghost px-3 py-2 text-sm">
                        <b>{fileKindOf(file.link)}</b> {file.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {work.link && !fileKindOf(work.link) && (
              <p>
                <a href={work.link} target="_blank" rel="noopener noreferrer" className="solx-btn-ghost px-4 py-2 text-sm">
                  {t("เปิดลิงก์")} <span aria-hidden="true">↗</span>
                </a>
              </p>
            )}
          </div>
        </dialog>
      )}

      {shown && <Viewer shown={shown} onClose={() => setShown(null)} />}
    </>
  );
}
