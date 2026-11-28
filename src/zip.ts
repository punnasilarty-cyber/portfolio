// รวมหลายไฟล์เป็น ZIP แบบไม่บีบอัด (PDF, Word และรูปบีบมาแล้ว) ชื่อไฟล์เป็น UTF-8 ใช้ภาษาไทยได้

const TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let i = 0; i < 8; i++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

export function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (const byte of data) c = TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** little-endian fields: [bytes, value] */
const record = (fields: [2 | 4, number][]) => {
  const out = new Uint8Array(fields.reduce((sum, [size]) => sum + size, 0));
  const view = new DataView(out.buffer);
  let at = 0;
  for (const [size, value] of fields) {
    if (size === 2) view.setUint16(at, value, true);
    else view.setUint32(at, value, true);
    at += size;
  }
  return out;
};

// shortcut: no ZIP64, so under 4 GB and 65535 files, far beyond a portfolio
export function zip(files: { name: string; data: Uint8Array }[]): Uint8Array<ArrayBuffer> {
  const parts: Uint8Array[] = [];
  const directory: Uint8Array[] = [];
  let offset = 0;
  for (const { name, data } of files) {
    const title = new TextEncoder().encode(name);
    // version, UTF-8 flag, stored, time, date (1 Jan 1980), checksum, both sizes, name length, no extra field
    const shared: [2 | 4, number][] = [[2, 20], [2, 0x0800], [2, 0], [2, 0], [2, 0x21], [4, crc32(data)], [4, data.length], [4, data.length], [2, title.length], [2, 0]];
    const header = record([[4, 0x04034b50], ...shared]);
    directory.push(record([[4, 0x02014b50], [2, 20], ...shared, [2, 0], [2, 0], [2, 0], [4, 0], [4, offset]]), title);
    parts.push(header, title, data);
    offset += header.length + title.length + data.length;
  }
  const size = directory.reduce((sum, part) => sum + part.length, 0);
  const all = [...parts, ...directory, record([[4, 0x06054b50], [2, 0], [2, 0], [2, files.length], [2, files.length], [4, size], [4, offset], [2, 0]])];
  const out = new Uint8Array(offset + size + 22);
  let at = 0;
  for (const part of all) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}

/** the same name twice gets a number, so nothing is overwritten on unpacking */
export function uniqueNames(names: string[]): string[] {
  const used = new Set<string>();
  return names.map((name) => {
    let next = name;
    for (let i = 2; used.has(next.toLowerCase()); i++) next = name.replace(/(\.[^.]*)?$/, ` (${i})$1`);
    used.add(next.toLowerCase());
    return next;
  });
}
