// ผิวดาวและทรงกลมของฉาก Made in Heaven สร้างจากสัญญาณรบกวนทั้งหมด ไม่ใช้รูปภาพ
// คำนวณล้วนๆ บนอาร์เรย์ จึงทดสอบได้โดยไม่ต้องมีหน้าจอ

type RGB = [number, number, number];
export type Kind = "earth" | "sun" | "rock" | "venus" | "mars" | "gas" | "saturn" | "ice";
export type Skin = {
  w: number;
  h: number;
  color: Uint8ClampedArray; // three values a point
  /** city lights on the night side */
  night?: Uint8ClampedArray;
  /** where the surface mirrors the sun: water */
  water?: Uint8Array;
  cloud?: Uint8Array;
};

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a: number, b: number, v: number) => {
  const k = clamp((v - a) / (b - a));
  return k * k * (3 - 2 * k);
};
const mix = (a: RGB, b: RGB, k: number): RGB => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

const hash = (x: number, y: number, z: number) => {
  let n = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 1440662683)) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
};

/** smooth random values in space, 0 to 1 */
export function noise(x: number, y: number, z: number) {
  const [ix, iy, iz] = [Math.floor(x), Math.floor(y), Math.floor(z)];
  const [fx, fy, fz] = [x - ix, y - iy, z - iz];
  const [u, v, s] = [fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy), fz * fz * (3 - 2 * fz)];
  const line = (dy: number, dz: number) => {
    const a = hash(ix, iy + dy, iz + dz);
    return a + (hash(ix + 1, iy + dy, iz + dz) - a) * u;
  };
  const near = line(0, 0) + (line(1, 0) - line(0, 0)) * v;
  const far = line(0, 1) + (line(1, 1) - line(0, 1)) * v;
  return near + (far - near) * s;
}

/** noise with finer and finer detail laid over it, 0 to 1 */
export function layered(x: number, y: number, z: number, octaves: number) {
  let sum = 0;
  let size = 0.5;
  let total = 0;
  for (let i = 0; i < octaves; i++) {
    sum += noise(x, y, z) * size;
    total += size;
    size *= 0.52;
    x = x * 2.03 + 11.7;
    y = y * 2.03 + 5.3;
    z = z * 2.03 + 3.1;
  }
  return sum / total;
}

/** paints a world's surface a row at a time, so the work can be spread over many frames */
export function* paint(kind: Kind, w: number, h: number): Generator<undefined, Skin> {
  const color = new Uint8ClampedArray(w * h * 3);
  const skin: Skin = { w, h, color };
  if (kind === "earth") Object.assign(skin, { night: new Uint8ClampedArray(w * h), water: new Uint8Array(w * h), cloud: new Uint8Array(w * h) });
  for (let row = 0; row < h; row++) {
    const lat = ((row + 0.5) / h - 0.5) * Math.PI;
    for (let col = 0; col < w; col++) {
      const lon = ((col + 0.5) / w) * Math.PI * 2;
      // the point on the ball itself, so the picture joins up with no seam
      const [x, y, z] = [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)];
      const at = row * w + col;
      let c: RGB;
      if (kind === "earth") {
        const warp = layered(x * 2.1 + 9, y * 2.1, z * 2.1, 3) - 0.5;
        const land = layered(x * 1.6 + warp * 1.4, y * 1.6 + warp, z * 1.6 - warp, 6);
        const dry = layered(x * 3 + 40, y * 3, z * 3, 3);
        const polar = Math.abs(y) + (layered(x * 6, y * 6, z * 6, 3) - 0.5) * 0.25;
        if (land > 0.515) {
          const high = smooth(0.515, 0.7, land);
          c = mix([34, 92, 44], [92, 112, 52], high * 1.6);
          c = mix(c, [190, 160, 104], smooth(0.5, 0.64, dry) * (1 - smooth(0.35, 0.6, Math.abs(y))));
          c = mix(c, [120, 98, 82], smooth(0.35, 0.75, high));
          c = mix(c, [236, 240, 244], smooth(0.72, 1, high));
          // towns gather along the coasts of the warm lands
          const town = noise(x * 38, y * 38, z * 38) * noise(x * 90 + 7, y * 90, z * 90);
          skin.night![at] = Math.abs(y) < 0.75 ? smooth(0.38, 0.62, town) * (1 - high * 0.8) * 255 : 0;
        } else {
          const shallow = smooth(0.44, 0.515, land);
          c = mix([6, 28, 74], [24, 104, 148], shallow * shallow);
          skin.water![at] = 255;
        }
        const ice = smooth(0.8, 0.9, polar);
        c = mix(c, [232, 240, 248], ice);
        if (ice > 0.5) skin.water![at] = 0;
        const swirl = layered(x * 2.4 - 3, y * 5, z * 2.4, 3) - 0.5;
        skin.cloud![at] = smooth(0.52, 0.75, layered(x * 3.2 + swirl * 2.4, y * 4.4 + swirl, z * 3.2 - swirl * 2.4, 5)) * 235;
      } else if (kind === "sun") {
        const grain = layered(x * 14, y * 14, z * 14, 4);
        const patch = layered(x * 3 + 2, y * 3, z * 3, 4);
        c = mix([255, 150, 30], [255, 242, 180], smooth(0.35, 0.72, grain));
        c = mix(c, [214, 82, 10], smooth(0.62, 0.74, patch) * 0.8);
      } else if (kind === "gas" || kind === "saturn") {
        const stir = layered(x * 4, y * 9, z * 4, 4) - 0.5;
        const band = Math.sin((y + stir * 0.12) * (kind === "gas" ? 19 : 14)) * 0.5 + 0.5;
        c = kind === "gas" ? mix([150, 104, 76], [236, 218, 190], band) : mix([188, 160, 112], [240, 224, 178], band * 0.8);
        c = mix(c, [250, 236, 214], smooth(0.55, 0.75, layered(x * 7, y * 22, z * 7, 3)) * 0.5);
        if (kind === "gas") {
          // the great red storm
          const away = Math.hypot((x - Math.cos(1.2)) * 3.2, (y - 0.32) * 6.5, (z - Math.sin(1.2)) * 3.2);
          c = mix(c, [188, 84, 52], 1 - smooth(0.6, 1, away));
        }
      } else {
        const rough = layered(x * 3, y * 3, z * 3, 5);
        const fine = layered(x * 11 + 4, y * 11, z * 11, 3);
        if (kind === "rock") c = mix([84, 76, 70], [186, 172, 156], smooth(0.3, 0.7, rough * 0.6 + fine * 0.4));
        else if (kind === "venus") c = mix([196, 146, 82], [248, 226, 170], layered(x * 2 + rough * 3, y * 6, z * 2, 4));
        else if (kind === "mars") {
          c = mix([112, 48, 30], [214, 118, 66], smooth(0.35, 0.65, rough));
          c = mix(c, [80, 40, 34], smooth(0.55, 0.7, fine) * 0.7);
          c = mix(c, [240, 236, 232], smooth(0.86, 0.93, Math.abs(y) + (fine - 0.5) * 0.1));
        } else c = mix([112, 188, 208], [196, 240, 244], layered(x * 1.5, y * 7, z * 1.5, 3));
      }
      color[at * 3] = c[0];
      color[at * 3 + 1] = c[1];
      color[at * 3 + 2] = c[2];
    }
    yield undefined;
  }
  return skin;
}

/** for each dot of a size by size picture: where on a tipped ball it looks */
export function ball(size: number, tilt: number) {
  const dots: number[] = [];
  const half = size / 2;
  const radius = half - 1;
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const [dx, dy] = [(px + 0.5 - half) / radius, (py + 0.5 - half) / radius];
      const away = Math.hypot(dx, dy);
      // the rim is softened over its last dot
      const cover = clamp((1 - away) * radius + 0.5);
      if (cover <= 0) continue;
      const [nx, ny] = away > 1 ? [dx / away, dy / away] : [dx, dy];
      const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
      const [rx, ry] = [nx * Math.cos(tilt) + ny * Math.sin(tilt), ny * Math.cos(tilt) - nx * Math.sin(tilt)];
      dots.push((py * size + px) * 4, (Math.atan2(rx, nz) / (Math.PI * 2) + 1) % 1, Math.asin(Math.max(-1, Math.min(1, ry))) / Math.PI + 0.5, nx, ny, nz, cover);
    }
  }
  return { size, dots: new Float32Array(dots) };
}

export type Ball = ReturnType<typeof ball>;

/**
 * Colours the ball into `out` (RGBA). `spin` and `drift` are turns of the surface and of its clouds; `light` points to
 * the sun (x right, y down, z toward the eye). A glowing world needs no light.
 */
export function shade(out: Uint8ClampedArray, { dots }: Ball, skin: Skin, spin: number, drift: number, light: RGB, glowing = false) {
  const length = Math.hypot(...light) || 1;
  const [lx, ly, lz] = [light[0] / length, light[1] / length, light[2] / length];
  // halfway between the sun and the eye, for the glint on water
  const hl = Math.hypot(lx, ly, lz + 1) || 1;
  const [hx, hy, hz] = [lx / hl, ly / hl, (lz + 1) / hl];
  const { w, h, color } = skin;
  for (let i = 0; i < dots.length; i += 7) {
    const at = dots[i];
    const [u, nx, ny, nz] = [dots[i + 1], dots[i + 3], dots[i + 4], dots[i + 5]];
    const row = Math.min(h - 1, (dots[i + 2] * h) | 0) * w;
    const point = row + ((((u + spin) % 1) * w) | 0);
    let r = color[point * 3];
    let g = color[point * 3 + 1];
    let b = color[point * 3 + 2];
    if (glowing) {
      // darker toward the limb, as a star is
      const k = 0.5 + 0.5 * nz;
      r *= 0.75 + 0.25 * k;
      g *= k;
      b *= k * k;
    } else {
      const facing = nx * lx + ny * ly + nz * lz;
      const day = smooth(-0.08, 0.28, facing);
      const lit = 0.03 + 0.97 * Math.max(0, facing) ** 0.8;
      const cloud = skin.cloud ? skin.cloud[row + ((((u + drift) % 1) * w) | 0)] / 255 : 0;
      const town = skin.night ? skin.night[point] * (1 - day) * (1 - cloud) : 0;
      const glint = skin.water?.[point] ? Math.max(0, nx * hx + ny * hy + nz * hz) ** 60 * day * (1 - cloud) * 220 : 0;
      r = r * lit * (1 - cloud) + 245 * cloud * lit + glint + town;
      g = g * lit * (1 - cloud) + 248 * cloud * lit + glint * 0.92 + town * 0.78;
      b = b * lit * (1 - cloud) + 255 * cloud * lit + glint * 0.75 + town * 0.4;
      if (skin.water) {
        // air seen edge-on shines blue
        const rim = (1 - nz) ** 3 * day;
        r += 70 * rim;
        g += 150 * rim;
        b += 255 * rim;
      }
    }
    out[at] = r;
    out[at + 1] = g;
    out[at + 2] = b;
    out[at + 3] = dots[i + 6] * 255;
  }
}
