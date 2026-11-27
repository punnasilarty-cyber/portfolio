export type View = { kind: "image" | "frame" | "pages"; src: string };

/**
 * How to show a linked file inside the page, or null when the link should just open as usual.
 * Browsers draw PDFs themselves in a frame; where they cannot (most phones, hence `pdfInline`) the page draws each
 * sheet itself. Office files go through Microsoft's viewer, which only reads files that are public on the web.
 */
export function viewOf(link: string, pdfInline: boolean): View | null {
  if (!/^https:\/\//i.test(link)) return null;
  const path = link.split(/[?#]/)[0];
  if (/\.pdf$/i.test(path)) return { kind: pdfInline ? "frame" : "pages", src: link };
  if (/\.(docx?|pptx?|xlsx?)$/i.test(path)) return { kind: "frame", src: `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(link)}` };
  return null;
}
