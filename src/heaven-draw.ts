// ภาพของฉาก Made in Heaven วาดเองทั้งหมดบน canvas: ท้องฟ้าเหนือโรงเรียน ดาวลากเส้น ดวงอาทิตย์ ดวงจันทร์ เมฆ
// นาฬิกาดาราศาสตร์ การยุบตัวของจักรวาล และการระเบิดกำเนิดจักรวาลใหม่
import { momentAt, WHITE_FULL as WHITE_FULL_AT } from "./heaven";

type Pen = CanvasRenderingContext2D;
const TAU = Math.PI * 2;
const ROMAN = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ramp = (from: number, to: number, t: number) => {
  const x = clamp((t - from) / (to - from));
  return x * x * (3 - 2 * x);
};
const blendList = (a: number[], b: number[], k: number) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
const blend = (a: number[], b: number[], k: number) => `rgb(${blendList(a, b, k).join(",")})`;
/** the same scatter on every showing */
const scatter = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

function layer(width: number, height: number, ratio: number) {
  const sheet = document.createElement("canvas");
  sheet.width = Math.max(1, Math.round(width * ratio));
  sheet.height = Math.max(1, Math.round(height * ratio));
  const pen = sheet.getContext("2d")!;
  pen.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { sheet, pen };
}

/** a soft round light, drawn once and stamped wherever a glow is wanted */
function glow(color: string) {
  const { sheet, pen } = layer(128, 128, 1);
  const light = pen.createRadialGradient(64, 64, 0, 64, 64, 64);
  light.addColorStop(0, `rgba(${color},1)`);
  light.addColorStop(0.25, `rgba(${color},0.45)`);
  light.addColorStop(1, `rgba(${color},0)`);
  pen.fillStyle = light;
  pen.fillRect(0, 0, 128, 128);
  return sheet;
}

/** the school against the sky: roofs, a domed hall, lit windows, trees and palms */
function skyline(w: number, h: number, ratio: number) {
  const tall = h * 0.34;
  const land = layer(w, tall, ratio);
  const lamps = layer(w, tall, ratio);
  const random = scatter(11);
  const ground = tall * 0.62;
  const unit = Math.max(w / 800, 0.75);
  const pen = land.pen;
  pen.fillStyle = "#05060d";

  const roof = (x: number, y: number, wide: number, rise: number) => {
    pen.beginPath();
    pen.moveTo(x - wide * 0.04, y);
    pen.lineTo(x + wide * 0.12, y - rise);
    pen.lineTo(x + wide * 0.88, y - rise);
    pen.lineTo(x + wide * 1.04, y);
    pen.fill();
  };
  const block = (x: number, wide: number, floors: number) => {
    const floor = 15 * unit;
    const top = ground - floors * floor;
    pen.fillRect(x, top, wide, ground - top + 2);
    roof(x, top + 1, wide, 15 * unit);
    for (let f = 0; f < floors; f++) {
      for (let at = x + 8 * unit; at < x + wide - 10 * unit; at += 13 * unit) {
        if (random() < 0.42) continue;
        lamps.pen.fillStyle = random() < 0.8 ? "#ffcf7a" : "#bfe3ff";
        lamps.pen.fillRect(at, top + f * floor + 5 * unit, 6 * unit, 6 * unit);
      }
    }
  };
  block(w * 0.03, w * 0.16, 3);
  block(w * 0.27, w * 0.46, 4);
  block(w * 0.79, w * 0.19, 3);
  // the dome of the sports hall
  pen.beginPath();
  pen.ellipse(w * 0.22, ground, w * 0.075, 40 * unit, 0, Math.PI, TAU);
  pen.fill();
  for (let x = 0; x < w; x += 26 * unit) {
    if (random() < 0.45) continue;
    const size = (7 + random() * 11) * unit;
    for (let k = 0; k < 4; k++) {
      pen.beginPath();
      pen.arc(x + (random() - 0.5) * size * 1.6, ground - size * (0.5 + random()), size * (0.6 + random() * 0.5), 0, TAU);
      pen.fill();
    }
  }
  pen.strokeStyle = "#05060d";
  for (const at of [0.012, 0.245, 0.755, 0.775, 0.99]) {
    const x = w * at;
    const top = ground - (66 + random() * 22) * unit;
    pen.lineWidth = 4 * unit;
    pen.beginPath();
    pen.moveTo(x, ground);
    pen.quadraticCurveTo(x + 6 * unit, (ground + top) / 2, x, top);
    pen.stroke();
    pen.lineWidth = 3 * unit;
    for (let k = 0; k < 7; k++) {
      const a = Math.PI + (k / 6) * Math.PI;
      pen.beginPath();
      pen.moveTo(x, top);
      pen.quadraticCurveTo(x + Math.cos(a) * 20 * unit, top + Math.sin(a) * 20 * unit, x + Math.cos(a) * 30 * unit, top + Math.sin(a) * 12 * unit + 10 * unit);
      pen.stroke();
    }
  }
  pen.fillRect(0, ground, w, tall - ground);
  return { land: land.sheet, lamps: lamps.sheet, tall, ground, unit };
}

/** a spiral galaxy, painted once */
function galaxy(size: number) {
  const { sheet, pen } = layer(size, size, 1);
  const random = scatter(29);
  const lights = ["196,181,253", "125,211,252", "244,114,182", "253,230,138"].map(glow);
  pen.globalCompositeOperation = "lighter";
  for (let i = 0; i < 900; i++) {
    const along = random() ** 0.8;
    const angle = (i % 3) * (TAU / 3) + along * 5.2 + (random() - 0.5) * 0.7;
    const r = along * size * 0.46;
    const dot = (0.015 + random() * 0.07) * size * (1 - along * 0.6);
    pen.globalAlpha = 0.07 + random() * 0.09;
    pen.drawImage(lights[i % 4], size / 2 + Math.cos(angle) * r - dot / 2, size / 2 + Math.sin(angle) * r - dot / 2, dot, dot);
  }
  return sheet;
}

/** the dots of printed comics, laid over the whole picture */
function halftone() {
  const { sheet, pen } = layer(8, 8, 1);
  pen.fillStyle = "#000";
  for (const [x, y] of [[2, 2], [6, 6]]) {
    pen.beginPath();
    pen.arc(x, y, 1.5, 0, TAU);
    pen.fill();
  }
  return sheet;
}

/** a world seen from space, its day side to the upper left; `spin` slides the land across */
function globe(size: number) {
  const land = layer(size * 2, size, 1);
  const random = scatter(53);
  for (let i = 0; i < 46; i++) {
    const [x, y] = [random() * size * 2, size * (0.12 + random() * 0.76)];
    for (let k = 0; k < 16; k++) {
      land.pen.fillStyle = random() < 0.75 ? "#3f8f5c" : "#a99562";
      land.pen.beginPath();
      land.pen.arc(x + (random() - 0.5) * size * 0.22, y + (random() - 0.5) * size * 0.13, size * (0.008 + random() * 0.032), 0, TAU);
      land.pen.fill();
    }
  }
  const cloud = layer(size * 2, size, 1);
  cloud.pen.fillStyle = "rgba(255,255,255,0.35)";
  for (let i = 0; i < 90; i++) {
    cloud.pen.beginPath();
    cloud.pen.ellipse(random() * size * 2, random() * size, size * (0.03 + random() * 0.12), size * (0.008 + random() * 0.025), random() * 0.4 - 0.2, 0, TAU);
    cloud.pen.fill();
  }
  return { land: land.sheet, cloud: cloud.sheet };
}

/**
 * Deep space, painted once and larger than the screen so it can drift: a band of the Milky Way with dark dust lanes
 * running through it, coloured nebulae, and thousands of faint stars thickest along the band.
 */
function deepSpace(w: number, h: number) {
  const [W, H] = [Math.round(w * 1.4), Math.round(h * 1.4)];
  const { sheet, pen } = layer(W, H, 1);
  const random = scatter(71);
  const gauss = () => (random() + random() + random() - 1.5) / 1.5;
  const base = pen.createLinearGradient(0, 0, W, H);
  base.addColorStop(0, "#010208");
  base.addColorStop(0.5, "#050616");
  base.addColorStop(1, "#02030a");
  pen.fillStyle = base;
  pen.fillRect(0, 0, W, H);
  const lights = { white: glow("235,232,255"), blue: glow("120,150,255"), warm: glow("255,190,140"), pink: glow("235,90,170"), teal: glow("70,210,200"), violet: glow("150,90,255") };
  // the band crosses the picture on a slant
  const along = (k: number, off: number): [number, number] => {
    const a = -0.42;
    const [mx, my] = [W / 2 + (k - 0.5) * W * 1.5 * Math.cos(a), H / 2 + (k - 0.5) * W * 1.5 * Math.sin(a)];
    return [mx - Math.sin(a) * off, my + Math.cos(a) * off];
  };
  const band = Math.min(W, H) * 0.16;
  pen.globalCompositeOperation = "lighter";
  for (let i = 0; i < 900; i++) {
    const [x, y] = along(random(), gauss() * band);
    const size = band * (0.4 + random() * 1.4);
    pen.globalAlpha = 0.025 + random() * 0.03;
    pen.drawImage(random() < 0.65 ? lights.white : random() < 0.5 ? lights.blue : lights.warm, x - size / 2, y - size / 2, size, size);
  }
  // nebulae: clouds of glowing gas in three places
  for (const [nx, ny, colors] of [[0.22, 0.3, [lights.pink, lights.violet]], [0.78, 0.68, [lights.teal, lights.blue]], [0.62, 0.22, [lights.warm, lights.pink]]] as const) {
    // wisps along a curve, each blob placed by distance and angle so the cloud has no corners
    const lean = random() * Math.PI;
    for (let i = 0; i < 220; i++) {
      const size = Math.min(W, H) * (0.02 + random() ** 2 * 0.16);
      const k = gauss();
      const spread = Math.min(W, H) * 0.06 * Math.abs(gauss());
      const turn = random() * TAU;
      const x = nx * W + Math.cos(lean) * k * W * 0.16 + Math.sin(k * 3) * W * 0.03 + Math.cos(turn) * spread;
      const y = ny * H + Math.sin(lean) * k * W * 0.16 + Math.sin(turn) * spread;
      pen.globalAlpha = 0.02 + random() * 0.035;
      pen.drawImage(colors[i % 2], x - size / 2, y - size / 2, size, size);
    }
  }
  // stars, many more along the band
  for (let i = 0; i < 7000; i++) {
    const inBand = random() < 0.6;
    const [x, y] = inBand ? along(random(), gauss() * band * 1.2) : [random() * W, random() * H];
    const bright = random() ** 6;
    pen.globalAlpha = 0.25 + bright * 0.75;
    pen.fillStyle = random() < 0.15 ? "#ffd9b0" : random() < 0.3 ? "#bcd0ff" : "#ffffff";
    const s = 0.5 + bright * 1.6;
    pen.fillRect(x, y, s, s);
  }
  // dust lanes darken the middle of the band
  pen.globalCompositeOperation = "source-over";
  for (let i = 0; i < 260; i++) {
    const [x, y] = along(random(), gauss() * band * 0.35);
    pen.globalAlpha = 0.05 + random() * 0.08;
    pen.fillStyle = "#020208";
    pen.beginPath();
    pen.ellipse(x, y, band * (0.2 + random() * 0.6), band * (0.06 + random() * 0.14), -0.42 + gauss() * 0.3, 0, TAU);
    pen.fill();
  }
  pen.globalAlpha = 1;
  return sheet;
}

export function createScene(pen: Pen, w: number, h: number, ratio: number) {
  const random = scatter(7);
  const short = Math.min(w, h);
  // the sky turns about this point, where the clock stands
  const cx = w / 2;
  const cy = h * 0.43;
  const reach = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy));
  const trails = layer(w, h, ratio);
  const city = skyline(w, h, ratio);
  const spiral = galaxy(1024);
  const space = deepSpace(w, h);
  const spike = glow("255,255,255");
  // the nearest stars, drawn live with their own glare, and moved more than the far sky as the camera drifts
  const near = Array.from({ length: Math.max(18, Math.round((w * h) / 40000)) }, () => ({ x: random() * 1.2 - 0.1, y: random() * 1.2 - 0.1, size: 0.4 + random() ** 2 * 1.4, depth: 0.5 + random() * 0.5, color: ["#ffffff", "#cfe0ff", "#ffe3c2"][Math.floor(random() * 3)] }));
  /** where the camera has wandered to; far things move less than near ones */
  const camera = (t: number) => [Math.sin(t * 0.13) * w * 0.05 + t * w * 0.004, Math.cos(t * 0.09) * h * 0.04] as const;
  /** the deep sky and its nearest stars, from far to near */
  function deep(alpha: number, t: number) {
    if (alpha <= 0) return;
    const [ox, oy] = camera(t);
    // a slow push in gives the far sky its distance
    const zoom = 1 + t * 0.006;
    pen.save();
    pen.globalAlpha = alpha;
    pen.translate(w / 2, h / 2);
    pen.scale(zoom, zoom);
    pen.drawImage(space, -w * 0.7 - ox * 0.25, -h * 0.7 - oy * 0.25, w * 1.4, h * 1.4);
    pen.restore();
    pen.save();
    pen.globalCompositeOperation = "lighter";
    for (const star of near) {
      const x = ((star.x * w - ox * star.depth) % (w * 1.2) + w * 1.2) % (w * 1.2) - w * 0.1;
      const y = star.y * h - oy * star.depth;
      const size = short * 0.012 * star.size * star.depth;
      pen.globalAlpha = alpha * (0.6 + 0.4 * Math.sin(t * 2 + star.x * 40));
      stamp(spike, x, y, size * 4, pen.globalAlpha * 0.6);
      // the four-pointed glare of a bright star through a lens
      pen.strokeStyle = star.color;
      pen.lineWidth = 0.8;
      pen.beginPath();
      pen.moveTo(x - size * 3, y);
      pen.lineTo(x + size * 3, y);
      pen.moveTo(x, y - size * 3);
      pen.lineTo(x, y + size * 3);
      pen.stroke();
      pen.fillStyle = "#ffffff";
      circle(x, y, Math.max(0.8, size * 0.35));
      pen.fill();
    }
    pen.restore();
  }
  const sunLight = glow("255,176,66");
  const moonLight = glow("190,214,255");
  const core = glow("255,244,214");
  const cloudLight = glow("215,225,255");
  const air = glow("110,190,255");
  const dots = pen.createPattern(halftone(), "repeat")!;
  const earth = globe(512);
  const planets = [
    { far: 0.2, size: 0.008, color: "#b9a48f" },
    { far: 0.29, size: 0.013, color: "#e8c07a" },
    { far: 0.39, size: 0.014, color: "#3f8fd8", moon: true },
    { far: 0.49, size: 0.01, color: "#d0603c" },
    { far: 0.66, size: 0.028, color: "#d9b38c", bands: true },
    { far: 0.82, size: 0.023, color: "#e6cf98", ring: true },
    { far: 0.95, size: 0.016, color: "#8fd3e6" },
  ].map((planet, i) => ({ ...planet, at: i * 1.7 + 0.4 }));
  const gas = layer(w, h, ratio);
  const gasLight = glow("80,200,255");
  const gasPale = glow("190,240,255");
  let pairTurn = 0;
  const nebulaLights = ["196,120,255", "90,160,255", "255,120,170", "255,200,120", "120,230,210"].map(glow);
  const born = scatter(97);
  const nebulae = Array.from({ length: 30 }, (_, i) => ({ a: born() * TAU, v: 0.15 + born() * 0.85, size: 0.25 + born() * 0.55, light: nebulaLights[i % nebulaLights.length] }));
  const galaxies = Array.from({ length: 14 }, () => ({ a: born() * TAU, v: 0.25 + born() * 0.7, size: 0.06 + born() * 0.13, spin: born() * TAU, tilt: 0.35 + born() * 0.5, delay: 0.5 + born() * 1.8 }));
  const colors = ["#ffffff", "#ffffff", "#cfe0ff", "#c4b5fd", "#ffe2b8", "#9fe3ff"];
  const stars = Array.from({ length: Math.min(900, Math.round((w * h) / 1300)) }, () => ({
    r: Math.sqrt(random()) * reach * 1.05,
    a: random() * TAU,
    size: 0.35 + random() ** 4 * 2.2,
    color: colors[Math.floor(random() * colors.length)],
    shine: 0.35 + random() * 0.65,
    from: null as null | [number, number],
  }));
  const clouds = Array.from({ length: 11 }, () => ({ x: random(), y: 0.1 + random() * 0.5, wide: 0.25 + random() * 0.4, pace: 0.5 + random() }));
  const sparks = Array.from({ length: 420 }, () => {
    const a = random() * TAU;
    return { a, v: 0.15 + random() ** 0.6, size: 1 + random() * 3, color: colors[Math.floor(random() * colors.length)] };
  });
  let turned = 0;
  let day = 0.35;
  let drift = 0;

  const stamp = (light: HTMLCanvasElement, x: number, y: number, size: number, alpha = 1) => {
    pen.globalAlpha = clamp(alpha);
    pen.drawImage(light, x - size / 2, y - size / 2, size, size);
    pen.globalAlpha = 1;
  };
  const circle = (x: number, y: number, r: number) => {
    pen.beginPath();
    pen.arc(x, y, r, 0, TAU);
  };

  function astrolabe(radius: number, year: number, rush: number, alpha: number) {
    if (radius < 2 || alpha <= 0) return;
    pen.save();
    pen.translate(cx, cy);
    pen.globalAlpha = alpha;
    const face = pen.createRadialGradient(0, 0, radius * 0.1, 0, 0, radius);
    face.addColorStop(0, "rgba(20,14,48,0.82)");
    face.addColorStop(1, "rgba(8,6,24,0.45)");
    pen.fillStyle = face;
    circle(0, 0, radius);
    pen.fill();
    const gold = pen.createLinearGradient(-radius, -radius, radius, radius);
    gold.addColorStop(0, "#fff4cc");
    gold.addColorStop(0.5, "#d4a548");
    gold.addColorStop(1, "#fbe6a2");
    pen.strokeStyle = gold;
    pen.fillStyle = gold;
    pen.shadowColor = "rgba(255,196,90,0.8)";
    pen.shadowBlur = 8 + rush * 16;
    // rings turning against one another, each with its own teeth
    const rings: [number, number, number, number][] = [
      [1, 60, 0.05, 2.5],
      [1.22, 96, -0.09, 1.2],
      [1.48, 36, 0.16, 1.6],
      [0.7, 24, -0.3, 1],
    ];
    for (const [scale, teeth, pace, width] of rings) {
      pen.save();
      pen.rotate(turned * pace);
      pen.lineWidth = width;
      circle(0, 0, radius * scale);
      pen.stroke();
      pen.beginPath();
      for (let i = 0; i < teeth; i++) {
        const a = (i / teeth) * TAU;
        const long = i % 5 ? 0.04 : 0.09;
        pen.moveTo(Math.cos(a) * radius * scale, Math.sin(a) * radius * scale);
        pen.lineTo(Math.cos(a) * radius * (scale + long), Math.sin(a) * radius * (scale + long));
      }
      pen.stroke();
      pen.restore();
    }
    // a tilted hoop, as on an armillary sphere
    pen.lineWidth = 1.2;
    for (const tilt of [0, TAU / 3, (TAU * 2) / 3]) {
      pen.beginPath();
      pen.ellipse(0, 0, radius * 1.34, radius * 1.34 * Math.abs(Math.sin(turned * 0.11 + tilt)), turned * 0.05 + tilt, 0, TAU);
      pen.stroke();
    }
    pen.shadowBlur = 0;
    pen.textAlign = "center";
    pen.textBaseline = "middle";
    pen.font = `600 ${Math.round(radius * 0.12)}px Georgia, "Times New Roman", serif`;
    ROMAN.forEach((numeral, i) => {
      const a = (i / 12) * TAU - Math.PI / 2;
      pen.fillText(numeral, Math.cos(a) * radius * 0.84, Math.sin(a) * radius * 0.84);
    });
    const hand = (angle: number, long: number, wide: number) => {
      // faint copies behind a fast hand read as motion blur
      for (let ghost = rush > 0.15 ? 6 : 0; ghost >= 0; ghost--) {
        pen.save();
        pen.globalAlpha = alpha * (ghost ? 0.1 : 1);
        pen.rotate(angle - ghost * 0.09 * rush);
        pen.beginPath();
        pen.moveTo(-wide, radius * 0.12);
        pen.lineTo(0, -radius * long);
        pen.lineTo(wide, radius * 0.12);
        pen.closePath();
        pen.fill();
        pen.restore();
      }
    };
    hand(turned * 0.5, 0.52, radius * 0.04);
    hand(turned * 6, 0.76, radius * 0.022);
    pen.fillStyle = "#1a1030";
    circle(0, 0, radius * 0.07);
    pen.fill();
    pen.stroke();
    pen.fillStyle = "#fff1c2";
    pen.font = `700 ${Math.round(radius * 0.17)}px ui-monospace, Consolas, monospace`;
    pen.fillText(String(year), 0, radius * 0.42);
    pen.restore();
  }

  /** a robot hand rising from below to hold the world: plated steel, glowing joints and circuit lines, a lit core in the palm */
  function hand(x: number, y: number, r: number, t: number) {
    const P = (px: number, py: number) => [x + px * r, y + py * r] as const;
    const pulse = 0.65 + 0.35 * Math.sin(t * 3);
    const cyan = (alpha: number) => `rgba(90,220,255,${alpha})`;
    const glowing = (blur: number) => {
      pen.shadowColor = cyan(0.9);
      pen.shadowBlur = blur;
    };
    const plain = () => (pen.shadowBlur = 0);
    const steel = (x1: number, y1: number, x2: number, y2: number) => {
      const metal = pen.createLinearGradient(x1, y1, x2, y2);
      metal.addColorStop(0, "#c9d3df");
      metal.addColorStop(0.35, "#5d6878");
      metal.addColorStop(1, "#1a1f29");
      return metal;
    };
    const joint = (px: number, py: number, size: number) => {
      const [jx, jy] = P(px, py);
      pen.fillStyle = "#151a23";
      pen.strokeStyle = "#8fa3b8";
      pen.lineWidth = r * 0.02;
      circle(jx, jy, r * size);
      pen.fill();
      pen.stroke();
      glowing(r * 0.25);
      pen.fillStyle = cyan(pulse);
      circle(jx, jy, r * size * 0.42);
      pen.fill();
      plain();
    };
    /** three plated segments along a curve, joints between them, a glowing pad at the tip */
    const finger = (from: [number, number], bend: [number, number], to: [number, number], thick: number) => {
      const at = (k: number) => [0, 1].map((j) => (1 - k) ** 2 * from[j] + 2 * (1 - k) * k * bend[j] + k * k * to[j]) as [number, number];
      const stops = [0, 0.4, 0.72, 1].map(at);
      pen.lineCap = "round";
      for (let i = 0; i < 3; i++) {
        const [s, e] = [P(...stops[i]), P(...stops[i + 1])];
        const width = r * thick * (1 - i * 0.18);
        pen.strokeStyle = "#0b0e14";
        pen.lineWidth = width + r * 0.04;
        pen.beginPath();
        pen.moveTo(...s);
        pen.lineTo(...e);
        pen.stroke();
        pen.strokeStyle = steel(s[0] - width, s[1] - width, e[0] + width, e[1] + width);
        pen.lineWidth = width;
        pen.beginPath();
        pen.moveTo(...s);
        pen.lineTo(...e);
        pen.stroke();
        // a circuit line down the back of each segment
        glowing(r * 0.12);
        pen.strokeStyle = cyan(0.85);
        pen.lineWidth = r * 0.018;
        pen.beginPath();
        pen.moveTo(s[0] + (e[0] - s[0]) * 0.2, s[1] + (e[1] - s[1]) * 0.2);
        pen.lineTo(s[0] + (e[0] - s[0]) * 0.8, s[1] + (e[1] - s[1]) * 0.8);
        pen.stroke();
        plain();
      }
      stops.slice(0, 3).forEach(([px, py], i) => joint(px, py, thick * (0.55 - i * 0.07)));
      const [tx, ty] = P(...stops[3]);
      glowing(r * 0.3);
      pen.fillStyle = cyan(0.55 + pulse * 0.4);
      circle(tx, ty, r * thick * 0.3);
      pen.fill();
      plain();
    };
    // the far fingers sit behind the palm
    finger([0.5, 1.6], [-0.7, 2.1], [-1.36, 1.02], 0.22);
    finger([0.4, 1.5], [-0.65, 1.75], [-1.2, 0.62], 0.26);
    // the forearm: two pistons and a bundle of cables running off the picture
    pen.lineCap = "round";
    for (const [sx, ex, width] of [[0.95, 1.75, 0.28], [1.45, 2.55, 0.24]] as const) {
      const [s, e] = [P(sx, 1.9), P(ex, 4.2)];
      pen.strokeStyle = "#0b0e14";
      pen.lineWidth = r * (width + 0.05);
      pen.beginPath();
      pen.moveTo(...s);
      pen.lineTo(...e);
      pen.stroke();
      pen.strokeStyle = steel(s[0] - r * 0.2, s[1], s[0] + r * 0.2, s[1]);
      pen.lineWidth = r * width;
      pen.beginPath();
      pen.moveTo(...s);
      pen.lineTo(...e);
      pen.stroke();
    }
    glowing(r * 0.15);
    pen.strokeStyle = cyan(0.7);
    pen.lineWidth = r * 0.03;
    for (const shift of [-0.06, 0.06]) {
      pen.beginPath();
      pen.moveTo(...P(1.2 + shift, 1.9));
      pen.bezierCurveTo(...P(1.5 + shift, 2.6), ...P(1.7 + shift, 3.2), ...P(2.1 + shift, 4.2));
      pen.stroke();
    }
    plain();
    // the palm: an angular plate with panel seams and a glowing core
    const palm: [number, number][] = [[-0.38, 1.3], [0.2, 1.06], [0.95, 0.92], [1.22, 1.18], [1.3, 1.78], [1.0, 2.15], [0.3, 2.05], [-0.25, 1.7]];
    pen.beginPath();
    palm.forEach(([px, py], i) => (i ? pen.lineTo(...P(px, py)) : pen.moveTo(...P(px, py))));
    pen.closePath();
    const [px0, py0] = P(-0.4, 0.9);
    const [px1, py1] = P(1.3, 2.2);
    pen.fillStyle = steel(px0, py0, px1, py1);
    pen.strokeStyle = "#0b0e14";
    pen.lineWidth = r * 0.04;
    pen.fill();
    pen.stroke();
    pen.strokeStyle = "rgba(10,14,20,0.7)";
    pen.lineWidth = r * 0.015;
    pen.beginPath();
    pen.moveTo(...P(0.2, 1.06));
    pen.lineTo(...P(0.3, 2.05));
    pen.moveTo(...P(-0.1, 1.5));
    pen.lineTo(...P(1.28, 1.5));
    pen.stroke();
    // the core in the palm, the light that holds the world
    const [kx, ky] = P(0.55, 1.55);
    glowing(r * 0.6);
    pen.fillStyle = cyan(0.35 + pulse * 0.5);
    circle(kx, ky, r * 0.16);
    pen.fill();
    pen.strokeStyle = cyan(0.95);
    pen.lineWidth = r * 0.025;
    circle(kx, ky, r * 0.24);
    pen.stroke();
    plain();
    pen.fillStyle = "#e9fbff";
    circle(kx, ky, r * 0.06);
    pen.fill();
    // a beam from the core lifting the world
    pen.save();
    pen.globalCompositeOperation = "lighter";
    const beam = pen.createLinearGradient(kx, ky, x, y);
    beam.addColorStop(0, cyan(0.35 * pulse));
    beam.addColorStop(1, cyan(0));
    pen.fillStyle = beam;
    pen.beginPath();
    pen.moveTo(kx - r * 0.12, ky);
    pen.lineTo(x - r * 0.6, y + r * 0.6);
    pen.lineTo(x + r * 0.6, y + r * 0.2);
    pen.lineTo(kx + r * 0.12, ky);
    pen.fill();
    pen.restore();
    // the near fingers and the thumb close round the world
    finger([0.1, 1.4], [-0.75, 1.25], [-0.98, 0.34], 0.28);
    finger([0.62, 1.25], [-0.15, 1.2], [-0.6, 0.86], 0.27);
    finger([0.95, 1.3], [1.62, 0.85], [1.08, -0.4], 0.32);
  }

  /** the sun and its planets seen from above at a slant; at speed each orbit becomes a ring of light */
  function solarSystem(shown: number, dt: number, speed: number, collapse: number) {
    if (shown <= 0) return;
    const reachX = Math.min(w * 0.47, h * 1.05) * (1 - collapse ** 1.4);
    const tilt = 0.36;
    pen.save();
    const hush = pen.createRadialGradient(cx, cy, 0, cx, cy, reach);
    hush.addColorStop(0, `rgba(3,2,14,${shown * 0.45})`);
    hush.addColorStop(1, "rgba(3,2,14,0)");
    pen.fillStyle = hush;
    pen.fillRect(0, 0, w, h);
    const place = (planet: (typeof planets)[number]) => {
      const r = planet.far * reachX;
      return [cx + Math.cos(planet.at) * r, cy + Math.sin(planet.at) * r * tilt, r] as const;
    };
    const draw = (planet: (typeof planets)[number]) => {
      const [x, y] = place(planet);
      const size = short * planet.size * (1 - collapse * 0.6);
      pen.globalCompositeOperation = "source-over";
      pen.globalAlpha = shown;
      if (planet.ring) {
        pen.strokeStyle = "rgba(230,210,160,0.8)";
        pen.lineWidth = size * 0.35;
        pen.beginPath();
        pen.ellipse(x, y, size * 2.1, size * 0.7, -0.25, 0, TAU);
        pen.stroke();
      }
      const lit = pen.createRadialGradient(x - (x - cx) * 0.02 - size * 0.3, y - size * 0.3, size * 0.1, x, y, size);
      lit.addColorStop(0, "#ffffff");
      lit.addColorStop(0.25, planet.color);
      lit.addColorStop(1, "#05040c");
      pen.fillStyle = lit;
      circle(x, y, size);
      pen.fill();
      if (planet.bands) {
        pen.strokeStyle = "rgba(120,70,40,0.45)";
        pen.lineWidth = size * 0.16;
        for (const k of [-0.4, 0, 0.35]) {
          pen.beginPath();
          pen.moveTo(x - size * Math.sqrt(1 - k * k), y + k * size);
          pen.lineTo(x + size * Math.sqrt(1 - k * k), y + k * size);
          pen.stroke();
        }
      }
      if (planet.moon) {
        const m = planet.at * 9;
        pen.fillStyle = "#dfe3ea";
        circle(x + Math.cos(m) * size * 2.2, y + Math.sin(m) * size * 0.9, size * 0.3);
        pen.fill();
      }
    };
    for (const planet of planets) {
      // farther planets go round more slowly, as they do
      const rate = (0.35 + speed * 0.32) / (planet.far / 0.39) ** 1.5;
      planet.at += rate * dt;
      const [, , r] = place(planet);
      pen.globalCompositeOperation = "source-over";
      pen.strokeStyle = `rgba(200,210,255,${0.1 * shown})`;
      pen.lineWidth = 1;
      pen.beginPath();
      pen.ellipse(cx, cy, r, r * tilt, 0, 0, TAU);
      pen.stroke();
      // the trail behind it lengthens with speed until it closes into a ring
      pen.globalCompositeOperation = "lighter";
      const span = Math.min(TAU * 0.97, 0.25 + rate * 0.3);
      const pieces = 16;
      for (let k = 0; k < pieces; k++) {
        const [a, b] = [planet.at - span * ((k + 1) / pieces), planet.at - span * (k / pieces)];
        pen.strokeStyle = planet.color;
        pen.globalAlpha = shown * (1 - k / pieces) * 0.6;
        pen.lineWidth = short * planet.size * (1 - k / pieces) * 0.9 + 0.8;
        pen.beginPath();
        pen.ellipse(cx, cy, r, r * tilt, 0, a, b);
        pen.stroke();
      }
    }
    pen.globalAlpha = 1;
    // planets behind the sun first, then the sun, then the ones in front
    planets.filter((planet) => Math.sin(planet.at) < 0).forEach(draw);
    pen.globalCompositeOperation = "lighter";
    stamp(sunLight, cx, cy, short * (0.55 + collapse * 0.6), shown);
    stamp(core, cx, cy, short * 0.16, shown);
    pen.globalCompositeOperation = "source-over";
    pen.globalAlpha = shown;
    pen.fillStyle = "#fff3c4";
    circle(cx, cy, short * 0.032);
    pen.fill();
    planets.filter((planet) => Math.sin(planet.at) >= 0).forEach(draw);
    pen.restore();
  }

  /** two bright stars circling each other in a swirl of blue gas, faster as they close in, until they meet */
  function binaryStars(shown: number, dt: number, collapse: number) {
    if (shown <= 0) return;
    const apart = short * 0.24 * (1 - collapse ** 1.15) + 1;
    // closer means faster, as with real orbits
    pairTurn += dt * (0.9 + 1.6 / Math.max(0.12, apart / (short * 0.24)) ** 1.2);
    const tilt = 0.42;
    const stars2 = [0, Math.PI].map((side) => [cx + Math.cos(pairTurn + side) * apart, cy + Math.sin(pairTurn + side) * apart * tilt] as const);
    // the gas they drag round them, kept on its own layer that forgets slowly
    const paint = gas.pen;
    paint.globalCompositeOperation = "destination-out";
    paint.fillStyle = "rgba(0,0,0,0.05)";
    paint.fillRect(0, 0, w, h);
    paint.globalCompositeOperation = "lighter";
    stars2.forEach(([x, y], i) => {
      for (let k = 0; k < 3; k++) {
        // trailing arms, swept back along the orbit
        const lag = pairTurn + i * Math.PI - (k + 1) * 0.18;
        const far = apart * (1 + k * 0.28);
        const [gx, gy] = [cx + Math.cos(lag) * far, cy + Math.sin(lag) * far * tilt];
        paint.globalAlpha = 0.22 - k * 0.05;
        paint.drawImage(gasLight, gx - short * 0.08, gy - short * 0.08, short * 0.16, short * 0.16);
      }
      paint.globalAlpha = 0.3;
      paint.drawImage(gasPale, x - short * 0.04, y - short * 0.04, short * 0.08, short * 0.08);
    });
    paint.globalAlpha = 1;
    pen.save();
    const hush = pen.createRadialGradient(cx, cy, 0, cx, cy, reach);
    hush.addColorStop(0, `rgba(1,4,12,${shown * 0.45})`);
    hush.addColorStop(1, "rgba(1,4,12,0)");
    pen.fillStyle = hush;
    pen.fillRect(0, 0, w, h);
    pen.globalCompositeOperation = "lighter";
    pen.globalAlpha = shown;
    pen.drawImage(gas.sheet, 0, 0, w, h);
    for (const [x, y] of stars2) {
      stamp(gasPale, x, y, short * 0.32, shown * 0.6);
      stamp(core, x, y, short * 0.13, shown);
      pen.globalAlpha = shown;
      pen.fillStyle = "#ffffff";
      circle(x, y, short * 0.016);
      pen.fill();
    }
    // the light where they will meet
    stamp(core, cx, cy, short * (0.05 + collapse ** 2 * 0.8), shown * collapse);
    pen.restore();
  }

  /** the big bang: one light opens into clouds of colour, stars rush outward and the first galaxies take shape */
  function birth(alpha: number, since: number) {
    if (alpha <= 0) return;
    pen.save();
    pen.globalAlpha = alpha;
    pen.fillStyle = "#02030c";
    pen.fillRect(0, 0, w, h);
    pen.globalCompositeOperation = "lighter";
    const grow = 1 - Math.exp(-since * 0.9);
    // the new universe fills with its own deep sky as it spreads
    deep(grow * 0.8, since + 30);
    pen.globalCompositeOperation = "lighter";
    for (const cloud of nebulae) {
      const d = grow * cloud.v * reach;
      stamp(cloud.light, cx + Math.cos(cloud.a) * d, cy + Math.sin(cloud.a) * d * 0.8, short * cloud.size * (0.5 + grow), alpha * 0.32);
    }
    for (const star of stars) {
      const r = star.r * grow;
      pen.globalAlpha = alpha * star.shine;
      pen.fillStyle = star.color;
      pen.fillRect(cx + Math.cos(star.a) * r, cy + Math.sin(star.a) * r, star.size + 0.4, star.size + 0.4);
    }
    for (const galaxy of galaxies) {
      const k = clamp((since - galaxy.delay) / 1.6);
      if (k <= 0) continue;
      const d = (0.12 + galaxy.v * grow) * reach * 0.85;
      const size = short * galaxy.size * (0.4 + k * 0.9);
      pen.save();
      pen.translate(cx + Math.cos(galaxy.a) * d, cy + Math.sin(galaxy.a) * d * 0.8);
      pen.rotate(galaxy.spin);
      pen.scale(1, galaxy.tilt);
      pen.rotate(since * 0.25);
      pen.globalAlpha = alpha * k;
      pen.drawImage(spiral, -size / 2, -size / 2, size, size);
      pen.restore();
    }
    stamp(core, cx, cy, short * (0.25 + (1 - grow) * 1.4), alpha * (1 - grow * 0.85));
    pen.restore();
  }

  function world(shown: number, t: number, shrink: number) {
    if (shown <= 0 || shrink >= 1) return;
    const r = short * 0.19 * (1 - shrink ** 2);
    // the sky dims behind, so the world stands out from the trails
    const hush = pen.createRadialGradient(cx, cy, 0, cx, cy, short * 0.85);
    hush.addColorStop(0, `rgba(4,3,18,${shown * 0.4 * (1 - shrink)})`);
    hush.addColorStop(1, "rgba(4,3,18,0)");
    pen.fillStyle = hush;
    pen.fillRect(0, 0, w, h);
    // it rises into place
    const y = cy + (1 - shown) * h * 0.5 * (1 - shrink);
    pen.save();
    pen.globalAlpha = shown;
    // the sun behind the world
    pen.globalCompositeOperation = "lighter";
    stamp(core, cx - r * 0.75, y - r * 0.8, r * 5.2, shown * 0.95);
    pen.strokeStyle = `rgba(255,236,190,${shown * 0.5})`;
    pen.lineWidth = 1.5;
    pen.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = i * (TAU / 8) + t * 0.05;
      const long = r * (i % 2 ? 1.6 : 3.2);
      pen.moveTo(cx - r * 0.75 - Math.cos(a) * long, y - r * 0.8 - Math.sin(a) * long);
      pen.lineTo(cx - r * 0.75 + Math.cos(a) * long, y - r * 0.8 + Math.sin(a) * long);
    }
    pen.stroke();
    stamp(air, cx, y, r * 3.1, shown * 0.8);
    pen.globalCompositeOperation = "source-over";
    pen.globalAlpha = shown;
    pen.save();
    circle(cx, y, r);
    pen.clip();
    const sea = pen.createRadialGradient(cx - r * 0.45, y - r * 0.45, r * 0.1, cx, y, r * 1.1);
    sea.addColorStop(0, "#3f9fe0");
    sea.addColorStop(1, "#0b2c63");
    pen.fillStyle = sea;
    pen.fillRect(cx - r, y - r, r * 2, r * 2);
    for (const [sheet, pace] of [[earth.land, 0.06], [earth.cloud, 0.11]] as const) {
      const shift = ((t * pace) % 1) * r * 4;
      for (const at of [-shift, r * 4 - shift]) pen.drawImage(sheet, cx - r + at, y - r, r * 4, r * 2);
    }
    // night falls across the far side
    const dusk = pen.createRadialGradient(cx - r * 0.5, y - r * 0.5, r * 0.35, cx - r * 0.2, y - r * 0.2, r * 1.55);
    dusk.addColorStop(0, "rgba(0,0,10,0)");
    dusk.addColorStop(1, "rgba(0,0,14,0.93)");
    pen.fillStyle = dusk;
    pen.fillRect(cx - r, y - r, r * 2, r * 2);
    pen.restore();
    pen.strokeStyle = "rgba(150,210,255,0.8)";
    pen.lineWidth = 2;
    circle(cx, y, r);
    pen.stroke();
    hand(cx, y, r, t);
    pen.restore();
  }

  /** the beat printed in black and white: colour drains, ink lines close in, and the comic's rumble floats by */
  function inked(amount: number, t: number) {
    if (amount <= 0) return;
    pen.save();
    pen.globalAlpha = amount;
    pen.globalCompositeOperation = "saturation";
    pen.fillStyle = "#808080";
    pen.fillRect(0, 0, w, h);
    pen.globalCompositeOperation = "soft-light";
    pen.fillStyle = "#fff";
    pen.fillRect(0, 0, w, h);
    pen.globalCompositeOperation = "source-over";
    pen.fillStyle = "#050505";
    for (let i = 0; i < 90; i++) {
      const a = i * 2.399963 + Math.floor(t * 8) * 0.013;
      const near = short * (0.42 + ((i * 0.618) % 1) * 0.28) + (1 - amount) * reach;
      const half = 0.004 + ((i * 0.317) % 1) * 0.014;
      pen.beginPath();
      pen.moveTo(cx + Math.cos(a) * near, cy + Math.sin(a) * near);
      pen.lineTo(cx + Math.cos(a - half) * reach * 1.2, cy + Math.sin(a - half) * reach * 1.2);
      pen.lineTo(cx + Math.cos(a + half) * reach * 1.2, cy + Math.sin(a + half) * reach * 1.2);
      pen.fill();
    }
    // the frame of a panel
    pen.strokeStyle = "#fff";
    pen.lineWidth = short * 0.018;
    pen.strokeRect(short * 0.025, short * 0.025, w - short * 0.05, h - short * 0.05);
    pen.restore();
  }

  function rumble(amount: number, t: number) {
    if (amount <= 0) return;
    pen.save();
    pen.textAlign = "center";
    pen.textBaseline = "middle";
    pen.lineJoin = "round";
    const places = [[0.1, 0.62], [0.17, 0.5], [0.08, 0.36], [0.9, 0.58], [0.83, 0.44], [0.92, 0.3], [0.15, 0.22], [0.86, 0.18]];
    places.forEach(([px, py], i) => {
      const size = short * (0.07 + ((i * 0.37) % 1) * 0.05);
      const lift = ((t * 0.09 + i * 0.13) % 1) * h * 0.12;
      pen.save();
      pen.translate(px * w + Math.sin(t * 7 + i) * 2, py * h - lift);
      pen.rotate(((i % 3) - 1) * 0.18);
      pen.globalAlpha = amount * 0.9;
      pen.font = `900 ${Math.round(size)}px "Yu Gothic", "MS Gothic", sans-serif`;
      pen.lineWidth = size * 0.18;
      pen.strokeStyle = "#0a0412";
      pen.strokeText("ゴ", 0, 0);
      pen.fillStyle = "#b983ff";
      pen.fillText("ゴ", 0, 0);
      pen.restore();
    });
    pen.restore();
  }

  function universe(t: number, dt: number) {
    const { rush, speed, daySpeed, year, cosmic, manga, world: held, solar, binary, collapse } = momentAt(t);
    turned += speed * dt;
    day += daySpeed * dt;
    drift += speed * dt;
    const height = Math.sin(day);
    const daylight = clamp(height * 1.4 + 0.35) * (1 - cosmic);
    const horizon = h * 0.82 + cosmic * h * 0.45;

    pen.save();
    // the world trembles as time runs away
    const shake = rush ** 4 * 5 * (1 - collapse * 0.5);
    pen.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);

    const sky = pen.createLinearGradient(0, 0, 0, Math.max(horizon, 1));
    // a clear blue day at first, warming to orange as the days begin to race; the nights are deep blue
    const dusk = ramp(2.2, 5, t);
    sky.addColorStop(0, blend([3, 5, 30], blendList([34, 104, 196], [64, 38, 104], dusk), daylight));
    sky.addColorStop(0.65, blend([10, 18, 62], blendList([104, 176, 232], [196, 80, 88], dusk), daylight));
    sky.addColorStop(1, blend([24, 30, 84], blendList([204, 232, 244], [240, 168, 58], dusk), daylight));
    pen.fillStyle = sky;
    pen.fillRect(-10, -10, w + 20, h + 20);

    // once the sky has become space, the deep sky stands behind everything
    deep(cosmic, t);
    if (cosmic > 0) {
      pen.save();
      pen.globalCompositeOperation = "lighter";
      pen.globalAlpha = cosmic * (1 - collapse * 0.35);
      pen.translate(cx, cy);
      pen.scale(1, 0.72);
      pen.rotate(turned * 0.07);
      const size = reach * 2.1 * (1.15 - collapse * 0.95);
      pen.drawImage(spiral, -size / 2, -size / 2, size, size);
      pen.restore();
    }

    // stars: each is drawn from where it was, onto a layer that forgets slowly, like a long exposure
    const paint = trails.pen;
    paint.globalCompositeOperation = "destination-out";
    paint.fillStyle = `rgba(0,0,0,${0.5 - rush * 0.42})`;
    paint.fillRect(0, 0, w, h);
    paint.globalCompositeOperation = "lighter";
    paint.lineCap = "round";
    for (const star of stars) {
      const r = star.r * (1 - collapse ** 2 * 0.97);
      const a = star.a + turned * 0.55 + collapse ** 2 * 7 * (1 - star.r / (reach * 1.1));
      const to: [number, number] = [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
      const [fx, fy] = star.from ?? to;
      paint.globalAlpha = star.shine * (1 - daylight * 0.8);
      paint.strokeStyle = star.color;
      paint.lineWidth = star.size;
      paint.beginPath();
      paint.moveTo(fx, fy);
      // bent through the middle of the turn, so a fast star traces a curve and not a chord
      paint.quadraticCurveTo(cx + Math.cos(a - speed * dt * 0.275) * r * 1.002, cy + Math.sin(a - speed * dt * 0.275) * r * 1.002, to[0] + 0.01, to[1]);
      paint.stroke();
      star.from = to;
    }
    pen.globalCompositeOperation = "lighter";
    // the long-exposure trails belong to the rush; when the world is held they give way to still, deep space
    pen.globalAlpha = 1 - Math.max(held, solar, binary) * 0.82;
    pen.drawImage(trails.sheet, 0, 0, w, h);
    pen.globalAlpha = 1;

    // sun and moon cross the sky; at speed their paths stay lit
    const wide = w * 0.46;
    const rise = h * 0.62;
    const steady = ramp(4, 7, t) * (1 - cosmic);
    if (steady > 0) {
      pen.lineCap = "round";
      for (const [color, width] of [["255,170,60", 22], ["255,236,190", 5]] as const) {
        pen.strokeStyle = `rgba(${color},${steady * 0.28})`;
        pen.lineWidth = width;
        pen.beginPath();
        pen.ellipse(cx, horizon, wide, rise, 0, Math.PI, TAU);
        pen.stroke();
      }
    }
    const body = (angle: number, isSun: boolean) => {
      const x = cx - Math.cos(angle) * wide;
      const y = horizon - Math.sin(angle) * rise;
      if (Math.sin(angle) < -0.08 || cosmic >= 1) return;
      const r = short * (isSun ? 0.032 : 0.024);
      stamp(isSun ? sunLight : moonLight, x, y, r * (isSun ? 11 : 7), 1 - cosmic);
      pen.save();
      pen.globalCompositeOperation = "source-over";
      pen.globalAlpha = 1 - cosmic;
      pen.fillStyle = isSun ? "#fff0c4" : "#dfe7f7";
      circle(x, y, r);
      pen.fill();
      if (!isSun) {
        pen.fillStyle = "rgba(110,122,160,0.4)";
        for (const [dx, dy, s] of [[-0.3, -0.2, 0.28], [0.35, 0.15, 0.2], [-0.05, 0.45, 0.15], [0.2, -0.45, 0.11]]) {
          circle(x + dx * r, y + dy * r, s * r);
          pen.fill();
        }
      }
      pen.restore();
    };
    // at speed the sun leaves a long burning trail across the sky, like a comet
    const trail = ramp(3, 6.5, t) * (1 - cosmic);
    if (trail > 0) {
      pen.save();
      pen.globalCompositeOperation = "lighter";
      pen.lineCap = "round";
      const pieces = 26;
      for (let k = pieces; k > 0; k--) {
        const [a, b] = [day - (k / pieces) * 1.3, day - ((k - 1) / pieces) * 1.3];
        if (Math.sin(b) < -0.05) continue;
        const fresh = 1 - k / pieces;
        pen.strokeStyle = `rgba(255,${Math.round(180 + fresh * 70)},${Math.round(90 + fresh * 120)},${trail * fresh * 0.55})`;
        pen.lineWidth = short * (0.008 + fresh * 0.045);
        pen.beginPath();
        pen.moveTo(cx - Math.cos(a) * wide, horizon - Math.sin(a) * rise);
        pen.lineTo(cx - Math.cos(b) * wide, horizon - Math.sin(b) * rise);
        pen.stroke();
      }
      pen.restore();
    }
    body(day, true);
    body(day + Math.PI, false);

    // clouds racing, stretched by their speed
    pen.globalCompositeOperation = "source-over";
    for (const cloud of clouds) {
      const x = (((cloud.x + drift * 0.035 * cloud.pace) % 1.6) - 0.3) * w;
      const long = cloud.wide * w * (1 + rush * 1.4);
      pen.globalAlpha = (0.12 + daylight * 0.4) * (1 - cosmic);
      pen.drawImage(cloudLight, x - long / 2, cloud.y * horizon, long, short * 0.05);
    }
    pen.globalAlpha = 1;

    // lines of speed rushing out of the middle
    const streak = ramp(4.5, 8, t) * (1 - collapse);
    if (streak > 0) {
      pen.globalCompositeOperation = "lighter";
      pen.strokeStyle = `rgba(210,222,255,${streak * 0.35})`;
      pen.lineWidth = 1.2;
      pen.beginPath();
      for (let i = 0; i < 150; i++) {
        const a = i * 2.399963;
        const far = ((i * 0.137 + drift * 0.09) % 1) ** 2;
        const near = short * 0.3 + far * reach;
        pen.moveTo(cx + Math.cos(a) * near, cy + Math.sin(a) * near);
        pen.lineTo(cx + Math.cos(a) * (near + 20 + far * 160 * streak), cy + Math.sin(a) * (near + 20 + far * 160 * streak));
      }
      pen.stroke();
    }

    // the school below, lit from inside at night; the flagpole's shadow sweeps like a sundial
    pen.globalCompositeOperation = "source-over";
    const ground = horizon - city.ground;
    if (ground < h) {
      pen.fillStyle = "#05060d";
      pen.fillRect(0, horizon, w, h - horizon + 8);
      pen.drawImage(city.land, 0, ground, w, city.tall);
      pen.globalAlpha = 1 - daylight * 0.85;
      pen.drawImage(city.lamps, 0, ground, w, city.tall);
      pen.globalAlpha = 1;
      const pole = w * 0.5;
      pen.fillStyle = `rgba(255,150,80,${daylight * 0.16})`;
      pen.fillRect(0, horizon, w, h - horizon);
      pen.fillStyle = `rgba(0,0,0,${0.35 + daylight * 0.45})`;
      pen.beginPath();
      pen.moveTo(pole - 3, horizon + 2);
      pen.lineTo(pole + 3, horizon + 2);
      pen.lineTo(pole + Math.cos(day) * w * 0.3, h);
      pen.fill();
      pen.strokeStyle = "#0a0b14";
      pen.lineWidth = 3;
      pen.beginPath();
      pen.moveTo(pole, horizon);
      pen.lineTo(pole, horizon - 92 * city.unit);
      pen.stroke();
    }

    // the clock gives its place to the world
    astrolabe(short * (0.15 + rush * 0.035) * (1 + held * 0.5), year, rush, ramp(0.5, 1.8, t) * (1 - held));
    // the world in the hand gives way to the whole solar system
    world(held * (1 - solar), t, collapse);
    solarSystem(solar * (1 - binary), dt, speed, 0);
    binaryStars(binary, dt, collapse);

    // everything falls into one point of light
    if (collapse > 0) {
      pen.globalCompositeOperation = "lighter";
      stamp(core, cx, cy, short * (0.1 + collapse ** 3 * 3.4), collapse);
      pen.strokeStyle = `rgba(255,240,205,${collapse * 0.7})`;
      pen.lineWidth = 2;
      pen.beginPath();
      pen.ellipse(cx, cy, reach * (1 - collapse) + 4, (reach * (1 - collapse) + 4) * 0.32, turned * 0.03, 0, TAU);
      pen.stroke();
      // shafts of light breaking out
      pen.fillStyle = `rgba(255,244,214,${collapse * 0.16})`;
      for (let i = 0; i < 18; i++) {
        const a = i * (TAU / 18) + t * 0.2;
        const half = 0.02 + (i % 3) * 0.018;
        pen.beginPath();
        pen.moveTo(cx, cy);
        pen.lineTo(cx + Math.cos(a - half) * reach * 1.2, cy + Math.sin(a - half) * reach * 1.2);
        pen.lineTo(cx + Math.cos(a + half) * reach * 1.2, cy + Math.sin(a + half) * reach * 1.2);
        pen.fill();
      }
    }
    pen.restore();

    const edge = pen.createRadialGradient(cx, cy, short * 0.35, cx, cy, reach * 1.15);
    edge.addColorStop(0, "rgba(0,0,0,0)");
    edge.addColorStop(1, "rgba(0,0,0,0.65)");
    pen.fillStyle = edge;
    pen.fillRect(0, 0, w, h);

    inked(manga, t);
    rumble(ramp(6.4, 7.6, t) * (1 - ramp(11.4, 12.2, t)), t);
    pen.globalAlpha = 0.07 + manga * 0.22;
    pen.fillStyle = dots;
    pen.fillRect(0, 0, w, h);
    pen.globalAlpha = 1;
  }

  /** the first morning of the new universe: the same school, still and warm, the sun just rising */
  function morning(alpha: number, since: number) {
    if (alpha <= 0) return;
    pen.save();
    pen.globalAlpha = alpha;
    const horizon = h * 0.82;
    const sky = pen.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, "#3b2a4f");
    sky.addColorStop(0.45, "#c4704a");
    sky.addColorStop(0.8, "#f4b86a");
    sky.addColorStop(1, "#ffe2a8");
    pen.fillStyle = sky;
    pen.fillRect(0, 0, w, h);
    // the sun climbs slowly, as on any ordinary morning
    const sunY = horizon - short * (0.02 + Math.min(since, 5) * 0.025);
    pen.globalCompositeOperation = "lighter";
    stamp(sunLight, cx, sunY, short * 0.9, alpha);
    // soft rays fanning up from it
    pen.fillStyle = `rgba(255,226,170,${0.1 * alpha})`;
    for (let i = 0; i < 11; i++) {
      const a = Math.PI + (i + 0.5) * (Math.PI / 11) + Math.sin(since * 0.4 + i) * 0.01;
      pen.beginPath();
      pen.moveTo(cx, sunY);
      pen.lineTo(cx + Math.cos(a - 0.03) * reach * 1.3, sunY + Math.sin(a - 0.03) * reach * 1.3);
      pen.lineTo(cx + Math.cos(a + 0.03) * reach * 1.3, sunY + Math.sin(a + 0.03) * reach * 1.3);
      pen.fill();
    }
    pen.globalCompositeOperation = "source-over";
    pen.globalAlpha = alpha;
    pen.fillStyle = "#fff4d6";
    circle(cx, sunY, short * 0.045);
    pen.fill();
    // a few clouds drifting slowly, lit from below
    for (const cloud of clouds.slice(0, 5)) {
      const long = cloud.wide * w * 0.8;
      pen.globalAlpha = alpha * 0.5;
      pen.drawImage(cloudLight, ((cloud.x + since * 0.01 * cloud.pace) % 1.3 - 0.15) * w - long / 2, cloud.y * horizon * 0.8, long, short * 0.05);
    }
    // a pair of birds crossing
    pen.globalAlpha = alpha;
    pen.strokeStyle = "#2a1a2e";
    pen.lineWidth = 2;
    for (const [bx, by] of [[0.28, 0.34], [0.33, 0.3], [0.31, 0.38]]) {
      const x = (bx + since * 0.035) * w;
      const y = by * h + Math.sin(since * 3 + bx * 20) * 3;
      const flap = Math.sin(since * 9 + bx * 30) * 4;
      pen.beginPath();
      pen.moveTo(x - 9, y - flap);
      pen.quadraticCurveTo(x - 4, y - 5, x, y);
      pen.quadraticCurveTo(x + 4, y - 5, x + 9, y - flap);
      pen.stroke();
    }
    // the school, dark against the light, its windows dark: everyone is only now waking
    pen.drawImage(city.land, 0, horizon - city.ground, w, city.tall);
    pen.fillStyle = "#05060d";
    pen.fillRect(0, horizon, w, h - horizon + 8);
    pen.restore();
  }

  /** the new universe bursting outward, then its first morning, fading over the page as it appears */
  function bang(since: number) {
    pen.clearRect(0, 0, w, h);
    const moment = momentAt(WHITE_FULL_AT + since);
    birth(moment.birth, since);
    morning(moment.dawn, Math.max(0, since - 3.2));
    const left = clamp(1 - since / 2.4);
    if (!left) return;
    pen.save();
    pen.globalCompositeOperation = "lighter";
    const spread = 1 - (1 - clamp(since / 2.4)) ** 3;
    stamp(core, cx, cy, short * (1.6 - spread), left * 0.8);
    pen.lineCap = "round";
    for (const spark of sparks) {
      const far = spread * spark.v * reach * 1.1;
      pen.globalAlpha = left;
      pen.strokeStyle = spark.color;
      pen.lineWidth = spark.size * left;
      pen.beginPath();
      pen.moveTo(cx + Math.cos(spark.a) * far * 0.86, cy + Math.sin(spark.a) * far * 0.86);
      pen.lineTo(cx + Math.cos(spark.a) * far, cy + Math.sin(spark.a) * far);
      pen.stroke();
    }
    pen.globalAlpha = left * 0.7;
    pen.strokeStyle = "#c4b5fd";
    pen.lineWidth = 14 * left;
    circle(cx, cy, spread * reach);
    pen.stroke();
    pen.restore();
  }

  return { universe, bang };
}
