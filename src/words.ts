// ตัดข้อความเป็นคำ ใช้ได้ทั้งภาษาไทยซึ่งไม่เว้นวรรคระหว่างคำ และภาษาอังกฤษ

/** the words of a text, each keeping the spaces and marks after it, so that joined they are the text again */
export function words(text: string): string[] {
  if (!("Segmenter" in Intl)) return text.split(/(?<= )/);
  const parts: string[] = [];
  for (const { segment, isWordLike } of new Intl.Segmenter("th", { granularity: "word" }).segment(text)) {
    if (isWordLike || !parts.length) parts.push(segment);
    else parts[parts.length - 1] += segment;
  }
  return parts;
}
