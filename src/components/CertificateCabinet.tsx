import { useState, type MouseEvent } from "react";
import { Viewer, type Shown } from "@/components/Viewer";
import type { Work } from "@/content";
import { picturesOf } from "@/items";
import { viewOf } from "@/viewer";

/** certificates stand framed on the shelves of a wooden cabinet; an empty cabinet shows the places waiting */
export function CertificateCabinet({ items, pictureUrl }: { items: Work[]; pictureUrl: (path: string) => string }) {
  const [shown, setShown] = useState<Shown | null>(null);

  function open(event: MouseEvent, work: Work) {
    const pictures = picturesOf(work).map(pictureUrl);
    if (pictures.length) return setShown({ kind: "image", src: pictures[0], href: pictures[0], title: work.title, gallery: pictures });
    const view = work.link ? viewOf(work.link, navigator.pdfViewerEnabled) : null;
    if (!view) return;
    event.preventDefault();
    setShown({ ...view, title: work.title, href: work.link! });
  }

  return (
    <div className="cabinet">
      <ul aria-label="เกียรติบัตร">
        {items.map((work, i) => {
          const [cover] = picturesOf(work);
          const inside = (
            <>
              <span className="cabinet-frame">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element -- a static export serves images as they are
                  <img src={pictureUrl(cover)} alt="" />
                ) : (
                  <span aria-hidden="true">★</span>
                )}
              </span>
              <b>{work.title}</b>
              <small>{work.kind}</small>
            </>
          );
          return (
            <li key={`${i}-${work.title}`} title={work.summary || undefined}>
              {cover ? (
                <button type="button" onClick={(event) => open(event, work)}>
                  {inside}
                </button>
              ) : work.link ? (
                <a href={work.link} onClick={(event) => open(event, work)} target="_blank" rel="noopener noreferrer">
                  {inside}
                </a>
              ) : (
                <div>{inside}</div>
              )}
            </li>
          );
        })}
        {items.length === 0 &&
          [0, 1, 2].map((i) => (
            <li key={i} aria-hidden="true" className="is-empty">
              <div>
                <span className="cabinet-frame">
                  <span>★</span>
                </span>
              </div>
            </li>
          ))}
      </ul>
      {items.length === 0 && <p>กำลังรวบรวมเกียรติบัตร</p>}
      {shown && <Viewer shown={shown} onClose={() => setShown(null)} />}
    </div>
  );
}
