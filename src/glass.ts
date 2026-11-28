// รอยร้าวและเศษกระจกของฟีเจอร์ “ทุบกระจก”

export type Point = [number, number];
export type Random = () => number;

/** jagged cracks running out from a blow, and a couple of broken rings around it */
export function cracks(x: number, y: number, random: Random): Point[][] {
  const rays = 9;
  const lines = Array.from({ length: rays }, (_, i) => {
    let angle = ((i + random() * 0.7) / rays) * Math.PI * 2;
    const line: Point[] = [[x, y]];
    const reach = 110 + random() * 190;
    for (let far = 0; far < reach; ) {
      const step = 18 + random() * 34;
      far += step;
      angle += (random() - 0.5) * 0.55;
      const [px, py] = line[line.length - 1];
      line.push([px + Math.cos(angle) * step, py + Math.sin(angle) * step]);
    }
    return line;
  });
  for (const ring of [34, 82]) {
    for (let i = 0; i < rays; i++) {
      if (random() < 0.35) continue;
      const at = (n: number): Point => {
        const angle = (n / rays) * Math.PI * 2;
        const r = ring * (0.8 + random() * 0.45);
        return [x + Math.cos(angle) * r, y + Math.sin(angle) * r];
      };
      lines.push([at(i), at(i + 0.9)]);
    }
  }
  return lines;
}

/** the whole screen cut into pieces around the last blow; neighbours share their corners, so nothing is left uncovered */
export function shards(x: number, y: number, width: number, height: number, random: Random): Point[][] {
  const rays = 14;
  // far enough that even the chord between two outer corners lies beyond the screen
  const rings = [0, 55, 130, 260, 460, Math.hypot(width, height) * 1.6 + 600];
  const angles = Array.from({ length: rays }, (_, i) => ((i + random() * 0.5) / rays) * Math.PI * 2);
  const corners = rings.map((ring, k) =>
    angles.map((angle): Point => {
      const r = k === 0 || k === rings.length - 1 ? ring : ring * (0.8 + random() * 0.4);
      return [x + Math.cos(angle) * r, y + Math.sin(angle) * r];
    }),
  );
  const pieces: Point[][] = [];
  for (let k = 0; k < rings.length - 1; k++) {
    for (let i = 0; i < rays; i++) {
      const next = (i + 1) % rays;
      const piece = k === 0 ? [corners[0][i], corners[1][i], corners[1][next]] : [corners[k][i], corners[k + 1][i], corners[k + 1][next], corners[k][next]];
      // pieces that never reach the screen are not worth drawing
      const xs = piece.map(([px]) => px);
      const ys = piece.map(([, py]) => py);
      if (Math.max(...xs) < 0 || Math.min(...xs) > width || Math.max(...ys) < 0 || Math.min(...ys) > height) continue;
      pieces.push(piece);
    }
  }
  return pieces;
}

export function inside([x, y]: Point, polygon: Point[]) {
  let within = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [[ax, ay], [bx, by]] = [polygon[i], polygon[j]];
    if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) within = !within;
  }
  return within;
}
