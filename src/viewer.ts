/**
 * The address to show a linked file inside the page, or null when the link should just open as usual.
 * Browsers draw PDFs themselves (most phones cannot, hence `pdfInline`); Office files go through Microsoft's viewer,
 * which only reads files that are public on the web.
 */
export function frameOf(link: string, pdfInline: boolean): string | null {
  if (!/^https:\/\//i.test(link)) return null;
  const path = link.split(/[?#]/)[0];
  if (/\.pdf$/i.test(path)) return pdfInline ? link : null;
  if (/\.(docx?|pptx?|xlsx?)$/i.test(path)) return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(link)}`;
  return null;
}
