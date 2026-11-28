import { useState } from "react";
import { PdfPages } from "@/components/PdfPages";
import { useLang } from "@/i18n";
import type { View } from "@/viewer";

export type Shown = View & { title: string; /** where the file itself lives */ href: string; /** all the pictures to step through */ gallery?: string[]; /** the card the window grows out of and shrinks back into */ from?: Element | null };

/** a full-screen window over the page for one picture or file */
export function Viewer({ shown, onClose }: { shown: Shown; onClose: () => void }) {
  // a picture fits the window until pressed, then shows at its own size and scrolls
  const { english, t } = useLang();
  const [full, setFull] = useState(false);
  const [at, setAt] = useState(0);
  const gallery = shown.gallery && shown.gallery.length > 1 ? shown.gallery : null;
  const picture = gallery ? gallery[at] : shown.src;

  /** moves the window between its card and full size; nothing when animation is stopped */
  function grow(dialog: HTMLDialogElement, back = false) {
    if (!shown.from || document.querySelector<HTMLInputElement>("#calm")?.checked) return;
    const card = shown.from.getBoundingClientRect();
    const open = dialog.getBoundingClientRect();
    const x = card.x + card.width / 2 - open.x - open.width / 2;
    const y = card.y + card.height / 2 - open.y - open.height / 2;
    const frames = [{ transform: `translate(${x}px, ${y}px) scale(${card.width / open.width}, ${card.height / open.height})`, opacity: 0 }, { transform: "none", opacity: 1 }];
    return dialog.animate(back ? frames.reverse() : frames, { duration: 360, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: back ? "forwards" : "none" });
  }

  function close(dialog: HTMLDialogElement) {
    const leaving = grow(dialog, true);
    if (leaving) leaving.onfinish = () => dialog.close();
    else dialog.close();
  }

  function step(by: number) {
    setAt((now) => (now + by + gallery!.length) % gallery!.length);
    setFull(false);
  }
  return (
    <dialog
      // a native modal: traps focus and closes on Escape
      ref={(dialog) => {
        if (dialog && !dialog.open) {
          dialog.showModal();
          grow(dialog);
        }
      }}
      onClose={onClose}
      // Escape shrinks it away too
      onCancel={(event) => {
        event.preventDefault();
        close(event.currentTarget);
      }}
      onKeyDown={(event) => {
        if (gallery && event.key === "ArrowLeft") step(-1);
        if (gallery && event.key === "ArrowRight") step(1);
      }}
      aria-label={shown.title}
      className="viewer"
    >
      <header>
        <p>{shown.title}</p>
        <a href={gallery ? picture : shown.href} target="_blank" rel="noopener noreferrer" className="solx-btn-ghost px-3 py-1.5 text-xs">
          {t("เปิดแท็บใหม่")}
        </a>
        <button autoFocus onClick={(event) => close(event.currentTarget.closest("dialog")!)} className="solx-btn-primary px-4 py-1.5 text-xs">
          {t("ปิด")}
        </button>
      </header>
      {shown.kind === "image" ? (
        <div className="viewer-body">
          <button type="button" aria-pressed={full} onClick={() => setFull(!full)} className={full ? "viewer-picture is-full" : "viewer-picture"}>
            {/* eslint-disable-next-line @next/next/no-img-element -- a static export serves images as they are */}
            <img src={picture} alt={gallery ? `${shown.title} ${english ? "picture" : "รูปที่"} ${at + 1}` : shown.title} />
            <span className="sr-only">{t(full ? "ย่อให้พอดีจอ" : "ขยายเท่าขนาดจริง")}</span>
          </button>
        </div>
      ) : shown.kind === "pages" ? (
        <PdfPages src={shown.src} title={shown.title} />
      ) : (
        <iframe src={shown.src} title={shown.title} className="viewer-body" />
      )}
      {gallery && (
        <footer>
          <button type="button" onClick={() => step(-1)} className="solx-btn-ghost px-4 py-1.5 text-xs">
            {t("← ก่อนหน้า")}
          </button>
          <span aria-live="polite">
            {at + 1} / {gallery.length}
          </span>
          <button type="button" onClick={() => step(1)} className="solx-btn-ghost px-4 py-1.5 text-xs">
            {t("ถัดไป →")}
          </button>
        </footer>
      )}
    </dialog>
  );
}
