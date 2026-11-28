// ภาพของฉาก Made in Heaven วาดเองทั้งหมดบน canvas: ท้องฟ้าเหนือโรงเรียน ดาวลากเส้น ดวงอาทิตย์ ดวงจันทร์ เมฆ
// นาฬิกาดาราศาสตร์ การยุบตัวของจักรวาล และการระเบิดกำเนิดจักรวาลใหม่
import { BOOMS, MORNING, momentAt, WHITE_FULL as WHITE_FULL_AT } from "./heaven";
import { collide, galaxies as twoGalaxies } from "./heaven-galaxy";
import { ball, paint, shade, type Kind, type Skin } from "./heaven-planet";

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

/** a heap of soft puffs with a flat shaded underside */
function puff(seed: number) {
  const { sheet, pen } = layer(512, 192, 1);
  const random = scatter(seed);
  for (let i = 0; i < 150; i++) {
    const along = random();
    // taller in the middle, thinning to the ends
    const rise = Math.sin(along * Math.PI) ** 0.8;
    const r = 10 + random() * 40 * rise;
    const x = 50 + along * 412;
    const y = 138 - random() * 84 * rise;
    const soft = pen.createRadialGradient(x, y - r * 0.3, 0, x, y, r);
    const grey = Math.round(190 + (1 - y / 150) * 90);
    soft.addColorStop(0, `rgba(255,255,255,0.32)`);
    soft.addColorStop(0.55, `rgba(${grey},${grey},${Math.min(255, grey + 18)},0.2)`);
    soft.addColorStop(1, `rgba(${grey},${grey},255,0)`);
    pen.fillStyle = soft;
    pen.fillRect(x - r, y - r, r * 2, r * 2);
  }
  return sheet;
}

/** a mountain line across the whole picture, as heights from 0 to 1 */
function ridge(seed: number) {
  const random = scatter(seed);
  const knots = Array.from({ length: 9 }, () => random());
  const fine = Array.from({ length: 65 }, () => random());
  const at = (list: number[], k: number) => {
    const x = k * (list.length - 1);
    const i = Math.min(list.length - 2, Math.floor(x));
    const f = (x - i) * (x - i) * (3 - 2 * (x - i));
    return list[i] + (list[i + 1] - list[i]) * f;
  };
  return Array.from({ length: 161 }, (_, i) => at(knots, i / 160) * 0.78 + at(fine, i / 160) * 0.22);
}

/** the same shape in one colour, for the light that catches the edges of the school */
function tinted(shape: HTMLCanvasElement, color: string) {
  const { sheet, pen } = layer(shape.width, shape.height, 1);
  pen.drawImage(shape, 0, 0);
  pen.globalCompositeOperation = "source-in";
  pen.fillStyle = color;
  pen.fillRect(0, 0, shape.width, shape.height);
  return sheet;
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
  // the worlds are painted a little at a time while the first scenes play, long before they are needed
  const skins = new Map<Kind, Skin>();
  const waiting: [Kind, Generator<undefined, Skin>][] = (
    [["earth", 640, 320], ["sun", 384, 192], ["gas", 384, 192], ["saturn", 256, 128], ["mars", 256, 128], ["venus", 192, 96], ["rock", 192, 96], ["ice", 128, 64]] as const
  ).map(([kind, across, down]) => [kind, paint(kind, across, down)]);
  function paintWorlds(budget: number) {
    const until = performance.now() + budget;
    while (waiting.length && performance.now() < until) {
      const step = waiting[0][1].next();
      if (step.done) skins.set(waiting.shift()![0], step.value);
    }
  }
  paintWorlds(12);
  /** a turning, lit ball of one of the worlds */
  function sphere(kind: Kind, size: number, tilt: number) {
    const shape = ball(size, tilt);
    const { sheet, pen: own } = layer(size, size, 1);
    const picture = own.createImageData(size, size);
    let drawn: [number, number] | null = null; // the turn and the light of the picture in hand
    return (x: number, y: number, r: number, spin: number, light: [number, number, number], glowing = false) => {
      // asked for before it is ready: finish it now rather than show a hole
      while (!skins.has(kind) && waiting.length) paintWorlds(4);
      const sun = Math.atan2(light[1], light[0]) + light[2] / (Math.hypot(...light) || 1);
      // coloured again only once the surface has moved most of a dot, or the sun has swung
      if (!drawn || Math.abs(spin - drawn[0]) * size * Math.PI > 0.7 || Math.abs(sun - drawn[1]) > 0.03) {
        shade(picture.data, shape, skins.get(kind)!, ((spin % 1) + 1) % 1, (((spin * 1.45) % 1) + 1) % 1, light, glowing);
        own.putImageData(picture, 0, 0);
        drawn = [spin, sun];
      }
      const wide = (r * 2 * size) / (size - 2);
      pen.drawImage(sheet, x - wide / 2, y - wide / 2, wide, wide);
    };
  }
  const earthBall = sphere("earth", Math.min(360, Math.max(220, Math.round(short * 0.38 * ratio))), 0.36);
  const planets = [
    { far: 0.2, size: 0.008, color: "#b9a48f" },
    { far: 0.29, size: 0.013, color: "#e8c07a" },
    { far: 0.39, size: 0.014, color: "#3f8fd8", moon: true },
    { far: 0.49, size: 0.01, color: "#d0603c" },
    { far: 0.66, size: 0.028, color: "#d9b38c", bands: true },
    { far: 0.82, size: 0.023, color: "#e6cf98", ring: true },
    { far: 0.95, size: 0.016, color: "#8fd3e6" },
  ].map((planet, i) => {
    const kind = (["rock", "venus", "earth", "mars", "gas", "saturn", "ice"] as const)[i];
    return { ...planet, at: i * 1.7 + 0.4, ball: sphere(kind, kind === "gas" || kind === "saturn" ? 112 : 72, 0.1 + i * 0.07) };
  });
  const gasWarm = glow("255,140,60");
  const puffs = [puff(131), puff(151), puff(171)];
  const hills = [ridge(201), ridge(233)];
  const rimDay = tinted(city.land, "#cfe6ff");
  const rimDawn = tinted(city.land, "#ffd08a");
  // a small copy of the picture, laid back over it so that bright things bleed light
  const bleed = layer(Math.ceil(w / 5), Math.ceil(h / 5), 1);
  let lite = false;
  let fadeClock = 0;
  // the time of the frame being drawn, and the language of the pointing labels
  let clock = 0;
  let inEnglish = false;
  let gasClock = 0;
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

  const coronaWarm = glow("255,150,40");
  const coronaRed = glow("255,60,20");
  const sunBall = sphere("sun", 240, 0.12);
  /**
   * A living star: streamers of its corona, a boiling surface that darkens to the limb, and loops of fire standing
   * off its edge. `heat` 1 is the yellow sun, 0 the red giant.
   */
  function sunAt(x: number, y: number, r: number, heat: number, alpha: number) {
    if (alpha <= 0 || r < 1) return;
    const t = clock;
    const tone = (a: number) => `rgba(255,${Math.round(80 + heat * 135)},${Math.round(20 + heat * 80)},${a})`;
    pen.save();
    pen.globalCompositeOperation = "lighter";
    stamp(heat > 0.5 ? coronaWarm : coronaRed, x, y, r * 8, alpha * 0.5);
    stamp(heat > 0.5 ? sunLight : coronaRed, x, y, r * 4.4, alpha * 0.75);
    // streamers, long and short, breathing slowly
    pen.lineCap = "round";
    for (let i = 0; i < 72; i++) {
      const a = i * 2.399963 + t * 0.02;
      const long = r * (1.18 + 0.75 * ((i * 0.618) % 1) ** 2 + 0.12 * Math.sin(t * 1.3 + i * 1.9));
      const beam = pen.createLinearGradient(x + Math.cos(a) * r, y + Math.sin(a) * r, x + Math.cos(a) * long, y + Math.sin(a) * long);
      beam.addColorStop(0, tone(0.34 * alpha));
      beam.addColorStop(1, tone(0));
      pen.strokeStyle = beam;
      pen.lineWidth = r * (0.025 + ((i * 0.377) % 1) * 0.06);
      pen.beginPath();
      pen.moveTo(x + Math.cos(a) * r * 0.96, y + Math.sin(a) * r * 0.96);
      pen.quadraticCurveTo(x + Math.cos(a + 0.08) * (r + long) * 0.5, y + Math.sin(a + 0.08) * (r + long) * 0.5, x + Math.cos(a + 0.03) * long, y + Math.sin(a + 0.03) * long);
      pen.stroke();
    }
    pen.globalCompositeOperation = "source-over";
    pen.globalAlpha = alpha;
    sunBall(x, y, r, t * 0.022, [0, 0, 1], true);
    // darker and redder toward the limb; redder all over as it cools
    pen.globalCompositeOperation = "multiply";
    const limb = pen.createRadialGradient(x, y, r * 0.2, x, y, r);
    limb.addColorStop(0, `rgb(255,${Math.round(140 + heat * 115)},${Math.round(70 + heat * 185)})`);
    limb.addColorStop(0.75, `rgb(255,${Math.round(95 + heat * 135)},${Math.round(40 + heat * 140)})`);
    limb.addColorStop(1, `rgb(${Math.round(190 + heat * 45)},${Math.round(40 + heat * 90)},${Math.round(15 + heat * 25)})`);
    pen.fillStyle = limb;
    circle(x, y, r);
    pen.fill();
    pen.globalCompositeOperation = "lighter";
    // the thin burning edge
    const rim = pen.createRadialGradient(x, y, r * 0.9, x, y, r * 1.16);
    rim.addColorStop(0, tone(0));
    rim.addColorStop(0.38, tone(0.75 * alpha));
    rim.addColorStop(1, tone(0));
    pen.fillStyle = rim;
    circle(x, y, r * 1.16);
    pen.fill();
    // arches of fire rising and sinking at the limb
    for (let i = 0; i < 7; i++) {
      const a = i * 0.93 + t * 0.035 + Math.sin(i * 7) * 0.4;
      const swell = 0.5 + 0.5 * Math.sin(t * 0.8 + i * 2.3);
      const high = r * (1.08 + 0.42 * swell * (0.4 + ((i * 0.53) % 1)));
      const half = 0.1 + ((i * 0.29) % 1) * 0.12;
      for (const [width, strength] of [[0.07, 0.22], [0.022, 0.8]]) {
        pen.strokeStyle = tone(strength * alpha * (0.35 + 0.65 * swell));
        pen.lineWidth = r * width;
        pen.beginPath();
        pen.moveTo(x + Math.cos(a - half) * r * 0.98, y + Math.sin(a - half) * r * 0.98);
        pen.bezierCurveTo(x + Math.cos(a - half * 1.7) * high, y + Math.sin(a - half * 1.7) * high, x + Math.cos(a + half * 1.7) * high, y + Math.sin(a + half * 1.7) * high, x + Math.cos(a + half) * r * 0.98, y + Math.sin(a + half) * r * 0.98);
        pen.stroke();
      }
    }
    pen.restore();
  }

  /** a blast wave: a bright front with a coloured wake, shards flying, and a long streak through the lens */
  function blast(x: number, y: number, since: number, power: number, color: string) {
    const life = 1.4 + power;
    if (since <= 0 || since >= life) return;
    const k = since / life;
    // it swells in over a few frames and dies away: strong, but never a flash
    const alpha = Math.min(1, since / 0.22) * (1 - k) ** 1.5 * Math.min(1, 0.45 + power * 0.5);
    const out = (1 - (1 - k) ** 3) * reach * (0.5 + power * 0.7);
    pen.save();
    pen.globalCompositeOperation = "lighter";
    for (const [scale, width, strength, tone] of [[1, 34, 0.2, color], [0.97, 9, 0.45, color], [1.01, 2.5, 0.85, "255,250,238"], [0.74, 18, 0.14, color], [0.5, 6, 0.2, "255,220,180"]] as const) {
      pen.strokeStyle = `rgba(${tone},${strength * alpha})`;
      pen.lineWidth = width * (0.35 + power * 0.65) * (1 - k * 0.5);
      pen.beginPath();
      pen.ellipse(x, y, out * scale + 2, out * scale * 0.82 + 2, 0, 0, TAU);
      pen.stroke();
    }
    pen.lineCap = "round";
    const shards = Math.round((lite ? 40 : 110) * Math.min(1.3, power));
    for (let i = 0; i < shards; i++) {
      const a = i * 2.399963 + power * 9;
      const far = out * (0.25 + ((i * 0.618) % 1) * 0.95);
      const tail = 8 + ((i * 0.317) % 1) * 60 * (1 - k) * power;
      pen.strokeStyle = i % 3 ? `rgba(${color},${alpha * 0.75})` : `rgba(255,246,222,${alpha * 0.9})`;
      pen.lineWidth = 1 + ((i * 0.443) % 1) * 2.4;
      pen.beginPath();
      pen.moveTo(x + Math.cos(a) * far, y + Math.sin(a) * far * 0.82);
      pen.lineTo(x + Math.cos(a) * (far + tail), y + Math.sin(a) * (far + tail) * 0.82);
      pen.stroke();
    }
    const streak = pen.createLinearGradient(x - w * 0.7, y, x + w * 0.7, y);
    streak.addColorStop(0, `rgba(${color},0)`);
    streak.addColorStop(0.5, `rgba(255,246,230,${0.55 * alpha})`);
    streak.addColorStop(1, `rgba(${color},0)`);
    pen.fillStyle = streak;
    pen.fillRect(x - w * 0.7, y - short * 0.004 * power, w * 1.4, short * 0.008 * power + 1);
    stamp(core, x, y, short * (0.1 + power * 0.28), alpha * 0.55 * (1 - k));
    pen.restore();
  }

  /** shooting stars and slow comets crossing the deep sky */
  function meteors(amount: number, t: number) {
    if (amount <= 0) return;
    pen.save();
    pen.globalCompositeOperation = "lighter";
    pen.lineCap = "round";
    for (let i = 0; i < 9; i++) {
      const pace = 0.22 + (i % 4) * 0.07;
      const k = (t * pace + i * 0.377) % 1;
      if (k > 0.55) continue;
      const run = k / 0.55;
      const round = Math.floor(t * pace + i * 0.377);
      const [x0, y0] = [(((round * 0.618 + i * 0.23) % 1) + 0.1) * w, (((round * 0.381 + i * 0.61) % 1) * 0.6) * h];
      const a = 2.35 + (i % 3) * 0.22;
      const [x, y] = [x0 + Math.cos(a) * run * short * 0.7, y0 + Math.sin(a) * run * short * 0.7];
      const long = short * (0.07 + (i % 3) * 0.04);
      const tail = pen.createLinearGradient(x, y, x - Math.cos(a) * long, y - Math.sin(a) * long);
      const fade = Math.sin(run * Math.PI) * amount;
      tail.addColorStop(0, `rgba(235,245,255,${0.85 * fade})`);
      tail.addColorStop(1, "rgba(140,170,255,0)");
      pen.strokeStyle = tail;
      pen.lineWidth = 1.2 + (i % 3) * 0.8;
      pen.beginPath();
      pen.moveTo(x, y);
      pen.lineTo(x - Math.cos(a) * long, y - Math.sin(a) * long);
      pen.stroke();
      stamp(spike, x, y, 6 + (i % 3) * 5, fade);
    }
    pen.restore();
  }

  /** the rocks between Mars and Jupiter */
  const rocks = Array.from({ length: 520 }, (_, i) => ({ a: i * 2.399963, far: 0.545 + ((i * 0.618) % 1) * 0.075, lift: ((i * 0.754) % 1) - 0.5, size: 0.7 + ((i * 0.317) % 1) * 1.7 }));
  function belt(shown: number, reachX: number, near: boolean) {
    pen.globalCompositeOperation = "source-over";
    pen.fillStyle = "#c9b8a4";
    for (let i = 0; i < rocks.length; i += lite ? 2 : 1) {
      const rock = rocks[i];
      const a = rock.a + clock * 0.16 / rock.far;
      if (Math.sin(a) >= 0 !== near) continue;
      pen.globalAlpha = shown * (near ? 0.85 : 0.45);
      pen.fillRect(cx + Math.cos(a) * rock.far * reachX, cy + Math.sin(a) * rock.far * reachX * 0.36 + rock.lift * short * 0.012, rock.size, rock.size);
    }
    pen.globalAlpha = 1;
  }
  /** a comet swinging by, its tail always pushed away from the sun */
  function comet(shown: number, t: number) {
    const k = clamp((t - 29.5) / 5);
    if (shown <= 0 || k <= 0 || k >= 1) return;
    const x = w * (0.04 + k * 0.92);
    const y = h * (0.16 + Math.sin(k * Math.PI) * 0.17);
    const away = Math.atan2(y - cy, x - cx);
    pen.save();
    pen.globalCompositeOperation = "lighter";
    for (const [bend, color, long, width] of [[0, "150,200,255", 0.34, 0.012], [0.22, "255,226,180", 0.26, 0.022]] as const) {
      const [ex, ey] = [x + Math.cos(away + bend) * short * long, y + Math.sin(away + bend) * short * long];
      const tail = pen.createLinearGradient(x, y, ex, ey);
      tail.addColorStop(0, `rgba(${color},${0.75 * shown * Math.sin(k * Math.PI)})`);
      tail.addColorStop(1, `rgba(${color},0)`);
      pen.fillStyle = tail;
      pen.beginPath();
      pen.moveTo(x, y);
      pen.quadraticCurveTo((x + ex) / 2 - Math.sin(away) * short * width, (y + ey) / 2 + Math.cos(away) * short * width, ex, ey);
      pen.quadraticCurveTo((x + ex) / 2 + Math.sin(away) * short * width, (y + ey) / 2 - Math.cos(away) * short * width, x, y);
      pen.fill();
    }
    stamp(gasPale, x, y, short * 0.05, shown * Math.sin(k * Math.PI));
    pen.restore();
  }

  /** a pointer that names the thing the story is following */
  function tag(x: number, y: number, size: number, th: string, en: string, alpha: number) {
    if (alpha <= 0) return;
    const words = inEnglish ? en : th;
    pen.save();
    pen.globalAlpha = alpha;
    const type = Math.max(12, Math.round(short * 0.024));
    pen.font = `700 ${type}px "Leelawadee UI", "Noto Sans Thai", Tahoma, sans-serif`;
    const wide = pen.measureText(words).width + type;
    // to whichever side has room
    const side = x + size + wide + type * 3 < w ? 1 : -1;
    const [bx, by] = [x + side * (size + type * 2.2), y - size - type * 1.8];
    pen.strokeStyle = "#fde68a";
    pen.lineWidth = 1.5;
    circle(x, y, size);
    pen.stroke();
    pen.beginPath();
    pen.moveTo(x + side * size * 0.72, y - size * 0.72);
    pen.lineTo(bx, by);
    pen.stroke();
    pen.fillStyle = "rgba(5,4,12,0.78)";
    pen.fillRect(side > 0 ? bx : bx - wide, by - type * 0.95, wide, type * 1.9);
    pen.fillStyle = "#fde68a";
    pen.textAlign = "center";
    pen.textBaseline = "middle";
    pen.fillText(words, bx + (side * wide) / 2, by);
    pen.restore();
  }

  /** a range of hills standing on the horizon */
  function range(line: number[], horizon: number, tall: number, color: string) {
    pen.fillStyle = color;
    pen.beginPath();
    pen.moveTo(-10, horizon + 6);
    line.forEach((v, i) => pen.lineTo((i / (line.length - 1)) * (w + 20) - 10, horizon - v * tall));
    pen.lineTo(w + 10, horizon + 6);
    pen.fill();
  }

  /** bright places spill a soft light around themselves, as through a camera lens */
  function bloom(strength: number) {
    if (lite || strength <= 0) return;
    const small = bleed.pen;
    const [bw, bh] = [bleed.sheet.width, bleed.sheet.height];
    small.globalCompositeOperation = "source-over";
    small.drawImage(pen.canvas, 0, 0, bw, bh);
    // multiplied by itself, only what was bright stays bright
    small.globalCompositeOperation = "multiply";
    small.drawImage(bleed.sheet, 0, 0);
    pen.save();
    pen.globalCompositeOperation = "lighter";
    pen.globalAlpha = strength * 0.5;
    pen.drawImage(bleed.sheet, 0, 0, w, h);
    pen.globalAlpha = strength * 0.28;
    pen.drawImage(bleed.sheet, -w * 0.012, -h * 0.012, w * 1.024, h * 1.024);
    pen.restore();
  }

  // petals, rain, leaves and snow: four kinds that take turns as the years run
  const flakes = (() => {
    const dice = scatter(213);
    return Array.from({ length: 170 }, () => ({ x: dice(), y: dice(), pace: 0.6 + dice() * 0.8 }));
  })();
  function seasons(amount: number, drift: number, horizon: number) {
    if (amount <= 0) return;
    const turn = (drift * 0.06) % 4;
    for (let kind = 0; kind < 4; kind++) {
      // each season fades in as the one before fades out
      const away = Math.min(Math.abs(turn - kind - 0.5), 4 - Math.abs(turn - kind - 0.5));
      const share = clamp(1.25 - away * 1.5) * amount;
      if (share <= 0) continue;
      pen.globalAlpha = share * 0.85;
      pen.fillStyle = pen.strokeStyle = ["#ffc1dc", "#b9d7ff", "#e8873a", "#ffffff"][kind];
      pen.lineWidth = 1.3;
      for (const flake of flakes) {
        const fall = (flake.y + drift * (kind === 1 ? 0.16 : 0.045) * flake.pace) % 1;
        const x = ((flake.x + fall * 0.25 + Math.sin(drift * 0.7 + flake.y * 20) * (kind === 1 ? 0 : 0.02)) % 1) * w;
        const y = fall * horizon;
        if (kind === 1) {
          pen.beginPath();
          pen.moveTo(x, y);
          pen.lineTo(x + 4, y + 18 * flake.pace);
          pen.stroke();
        } else {
          pen.beginPath();
          pen.ellipse(x, y, short * (kind === 3 ? 0.0035 : 0.006), short * 0.0032, drift + flake.x * 9, 0, TAU);
          pen.fill();
        }
      }
    }
    pen.globalAlpha = 1;
  }

  // an age to come: tall towers with strips of light, an elevator into the sky, craft passing between them
  const towers = (() => {
    const dice = scatter(311);
    return Array.from({ length: 17 }, (_, i) => ({ x: (i + dice() * 0.6) / 17, tall: 0.18 + dice() * 0.42 + (i % 5 === 2 ? 0.16 : 0), wide: 0.018 + dice() * 0.03, lamp: dice() < 0.5 ? "#7de3ff" : "#ff9ad5", top: Math.floor(dice() * 3), later: dice() * 0.35 }));
  })();
  function future(amount: number, t: number, horizon: number) {
    if (amount <= 0) return;
    pen.save();
    // the elevator's thread climbs out of sight
    const thread = pen.createLinearGradient(0, horizon, 0, 0);
    thread.addColorStop(0, `rgba(190,235,255,${0.8 * amount})`);
    thread.addColorStop(1, "rgba(190,235,255,0)");
    pen.fillStyle = thread;
    pen.fillRect(w * 0.68, horizon - horizon * amount, 2, horizon * amount);
    pen.fillRect(w * 0.68 - 5, horizon - horizon * ((t * 0.35) % 1) * amount, 12, 7);
    for (const tower of towers) {
      const up = ramp(tower.later, tower.later + 0.65, amount);
      if (up <= 0) continue;
      const [x, wide, tall] = [tower.x * w, tower.wide * Math.max(w, h * 0.9), tower.tall * h * up];
      const steel = pen.createLinearGradient(x, 0, x + wide, 0);
      steel.addColorStop(0, "#23324f");
      steel.addColorStop(0.5, "#141c33");
      steel.addColorStop(1, "#0a0f1f");
      pen.fillStyle = steel;
      pen.beginPath();
      pen.moveTo(x, horizon);
      pen.lineTo(x + wide * 0.1, horizon - tall * (tower.top === 1 ? 0.86 : 1));
      if (tower.top === 2) pen.quadraticCurveTo(x + wide / 2, horizon - tall * 1.16, x + wide * 0.9, horizon - tall);
      else pen.lineTo(x + wide * 0.9, horizon - tall);
      pen.lineTo(x + wide, horizon);
      pen.fill();
      pen.fillStyle = tower.lamp;
      pen.globalAlpha = amount * 0.8;
      for (let y = horizon - tall * 0.92; y < horizon - 6; y += short * 0.016) pen.fillRect(x + wide * 0.22, y, wide * (0.2 + ((y * 7.3 + x) % 40) / 90), 1.6);
      pen.fillRect(x + wide / 2 - 0.8, horizon - tall - short * 0.035, 1.6, short * 0.035);
      pen.globalAlpha = 1;
    }
    pen.globalCompositeOperation = "lighter";
    pen.lineCap = "round";
    for (let i = 0; i < 12; i++) {
      const way = i % 2 ? 1 : -1;
      const x = ((((i * 0.618 + way * t * (0.09 + (i % 4) * 0.03)) % 1) + 1) % 1) * (w + 200) - 100;
      const y = horizon - h * (0.1 + ((i * 0.273) % 1) * 0.36);
      const tail = pen.createLinearGradient(x - way * 70, y, x, y);
      tail.addColorStop(0, "rgba(120,220,255,0)");
      tail.addColorStop(1, `rgba(190,240,255,${0.75 * amount})`);
      pen.strokeStyle = tail;
      pen.lineWidth = 2.4;
      pen.beginPath();
      pen.moveTo(x - way * 70, y);
      pen.lineTo(x, y);
      pen.stroke();
    }
    pen.restore();
  }

  // left alone: trees swallow the buildings, then ice creeps over everything
  const growth = (() => {
    const dice = scatter(401);
    return Array.from({ length: 90 }, () => ({ x: dice(), size: 0.025 + dice() * 0.07, later: dice() * 0.45, shade: Math.floor(dice() * 3) }));
  })();
  const iceLine = ridge(701);
  function wild(amount: number, horizon: number) {
    if (amount <= 0) return;
    const green = ramp(0, 0.6, amount);
    for (const tree of growth) {
      const grown = ramp(tree.later, tree.later + 0.3, green);
      if (grown <= 0) continue;
      const r = short * tree.size * grown;
      pen.fillStyle = ["#0f2a1c", "#16391f", "#0a1f17"][tree.shade];
      for (const [dx, dy, s] of [[0, -1, 1], [-0.75, -0.55, 0.72], [0.72, -0.5, 0.78]]) {
        circle(tree.x * w + dx * r, horizon + dy * r + 6, r * s);
        pen.fill();
      }
    }
    const ice = ramp(0.55, 1, amount);
    if (ice <= 0) return;
    pen.fillStyle = `rgba(214,236,255,${0.85 * ice})`;
    pen.beginPath();
    pen.moveTo(-10, h + 10);
    iceLine.forEach((v, i) => pen.lineTo((i / (iceLine.length - 1)) * (w + 20) - 10, horizon + h * 0.04 - h * (0.015 + v * 0.085) * ice));
    pen.lineTo(w + 10, h + 10);
    pen.fill();
    pen.fillStyle = `rgba(255,255,255,${0.8 * ice})`;
    for (const flake of flakes) pen.fillRect(flake.x * w, ((flake.y + drift * 0.02 * flake.pace) % 1) * horizon, 2.2, 2.2);
  }

  // two galaxies meeting, each star pulled by both hearts
  const meeting = twoGalaxies(2600, scatter(509));
  const hazes = [glow("150,170,255"), glow("255,170,140")];
  const galaxyScale = Math.min(w * 0.36, h * 0.46);
  /** where one of the two hearts is on the screen */
  const heart = (i: 0 | 1) => [cx + meeting.cores[i].x * galaxyScale, cy + meeting.cores[i].y * galaxyScale * 0.82] as const;
  function galaxyMeet(shown: number, dt: number, near: number) {
    if (shown <= 0) return;
    // about five seconds of screen for the whole meeting
    collide(meeting, dt * 0.95);
    const scale = galaxyScale * (1 + near * near * 5);
    const [fx, fy] = [meeting.cores[0].x * 0.6 * near, meeting.cores[0].y * 0.6 * near];
    const at = (x: number, y: number) => [cx + (x - fx) * scale, cy + (y - fy) * scale * 0.82] as const;
    pen.save();
    const hush = pen.createRadialGradient(cx, cy, 0, cx, cy, reach);
    hush.addColorStop(0, `rgba(1,2,10,${shown * 0.78})`);
    hush.addColorStop(1, `rgba(1,2,10,${shown * 0.45})`);
    pen.fillStyle = hush;
    pen.fillRect(0, 0, w, h);
    pen.globalCompositeOperation = "lighter";
    meeting.cores.forEach((core, i) => {
      const [x, y] = at(core.x, core.y);
      stamp(hazes[i], x, y, scale * 1.15, shown * 0.4);
      stamp(core.mass > 0.17 ? gasPale : sunLight, x, y, scale * 0.34, shown * 0.65);
      stamp(spike, x, y, scale * 0.09, shown);
    });
    const sunDot = meeting.dots[41];
    meeting.dots.forEach((dot, i) => {
      const [x, y] = at(dot.x, dot.y);
      if (lite && i % 2) return;
      pen.globalAlpha = shown * (0.6 + (i % 7) * 0.06);
      pen.fillStyle = i % 23 === 0 ? "#ff7fb8" : dot.home ? "#ffd8b8" : "#c4d6ff";
      const size = (i % 31 === 0 ? 3.6 : 2) * Math.max(1, short / 800);
      pen.fillRect(x, y, size, size);
      // every so often a soft cloud of unresolved stars round one of them
      if (i % 19 === 0) stamp(hazes[dot.home], x, y, scale * 0.17, shown * 0.2);
    });
    pen.restore();
    const [hx, hy] = at(meeting.cores[0].x, meeting.cores[0].y);
    const [ox, oy] = at(meeting.cores[1].x, meeting.cores[1].y);
    const early = shown * ramp(34.6, 35.4, clock) * (1 - ramp(36.6, 37.3, clock));
    tag(hx, hy, short * 0.05, "ทางช้างเผือก", "Milky Way", early);
    tag(ox, oy, short * 0.045, "แอนดรอเมดา", "Andromeda", early);
    const [sx, sy] = at(sunDot.x, sunDot.y);
    tag(sx, sy, short * 0.018, "ดวงอาทิตย์ของเรา", "Our Sun", shown * ramp(38.4, 39.1, clock));
  }

  // the sun grows old: swells red and swallows the inner worlds, then sheds its skin around a tiny white heart
  const shell = (() => {
    const size = 512;
    const { sheet, pen: own } = layer(size, size, 1);
    const dice = scatter(601);
    const lights = ["80,230,200", "255,110,120", "255,190,120", "130,150,255"].map(glow);
    own.globalCompositeOperation = "lighter";
    for (let i = 0; i < 1100; i++) {
      const a = dice() * TAU;
      const band = i % 4;
      const r = size * (0.2 + band * 0.045 + (dice() - 0.5) * 0.07 + Math.sin(a * 3 + band) * 0.018);
      const dot = size * (0.015 + dice() ** 2 * 0.07);
      own.globalAlpha = 0.05 + dice() * 0.1;
      own.drawImage(lights[band], size / 2 + Math.cos(a) * r - dot / 2, size / 2 + Math.sin(a) * r * 0.82 - dot / 2, dot, dot);
    }
    return sheet;
  })();
  function redGiant(shown: number, age: number, t: number, arrive: number, leave: number) {
    if (shown <= 0) return;
    const swell = ramp(0, 0.5, age);
    const dx = cx + (Math.cos(pairTurn) * short * 0.24) * leave;
    const dy = cy + (Math.sin(pairTurn) * short * 0.24 * 0.42) * leave;
    const shed = ramp(0.55, 1, age);
    // seen first as a single point among the stars, then close at hand
    const r = short * (0.06 + swell * 0.27) * (1 - ramp(0.55, 0.8, age) * 0.97) * (0.04 + 0.96 * arrive);
    pen.save();
    const hush = pen.createRadialGradient(cx, cy, 0, cx, cy, reach);
    hush.addColorStop(0, `rgba(8,1,4,${shown * 0.7})`);
    hush.addColorStop(1, `rgba(2,1,8,${shown * 0.45})`);
    pen.fillStyle = hush;
    pen.fillRect(0, 0, w, h);
    // the inner worlds on their rounds, glowing and gone as the surface reaches them
    pen.strokeStyle = `rgba(200,200,255,${0.12 * shown})`;
    pen.lineWidth = 1;
    [0.12, 0.2, 0.29, 0.46].forEach((far, i) => {
      const out = short * far;
      const left = clamp((out - r) / (short * 0.05));
      pen.beginPath();
      pen.ellipse(cx, cy, out, out * 0.42, 0, 0, TAU);
      pen.stroke();
      if (left <= 0) return;
      const a = t * (1.5 - i * 0.3) + i * 2;
      const [x, y] = [cx + Math.cos(a) * out, cy + Math.sin(a) * out * 0.42];
      pen.globalAlpha = shown * left;
      stamp(sunLight, x, y, short * 0.04 * swell, shown * (1 - left * 0.5) * swell);
      pen.globalAlpha = shown * left;
      planets[i].ball(x, y, short * (0.008 + i * 0.002), t * 0.1, [cx - x, cy - y, short * 0.2]);
      pen.globalAlpha = 1;
    });
    pen.globalCompositeOperation = "lighter";
    if (shed > 0) {
      for (const [grow, alpha, spin] of [[1, 0.95, 0.03], [0.68, 0.6, -0.05]] as const) {
        const size = short * (0.25 + shed * 1.25) * grow;
        pen.save();
        pen.translate(cx, cy);
        pen.rotate(t * spin);
        pen.globalAlpha = shown * Math.min(1, alpha * 1.2) * ramp(0, 0.2, shed) * (1 - shed * 0.2);
        pen.drawImage(shell, -size / 2, -size / 2, size, size);
        pen.drawImage(shell, -size / 2, -size / 2, size, size);
        pen.restore();
      }
    }
    sunAt(cx, cy, r, 1 - swell, shown * (1 - ramp(0.7, 0.85, age)));
    // the earth, home, as the surface reaches it
    const earthAt = short * 0.29;
    const reached = clamp((earthAt - r) / (short * 0.05));
    const a = t * (1.5 - 2 * 0.3) + 4;
    tag(cx + Math.cos(a) * earthAt, cy + Math.sin(a) * earthAt * 0.42, short * 0.024, "โลกของเรา", "Our Earth", shown * ramp(0.04, 0.12, age) * reached);
    // what is left: small, white and very hot
    const dwarf = ramp(0.62, 0.85, age);
    pen.globalCompositeOperation = "lighter";
    stamp(gasPale, dx, dy, short * 0.14, shown * dwarf * 0.8);
    stamp(spike, dx, dy, short * 0.06, shown * dwarf);
    pen.globalAlpha = shown * dwarf;
    pen.fillStyle = "#ffffff";
    circle(dx, dy, short * 0.007);
    pen.fill();
    pen.restore();
  }

  // the first stars of the new universe, lighting one after another
  const firstStars = Array.from({ length: 46 }, (_, i) => ({ x: (i * 0.618034 + 0.07) % 1, y: (i * 0.754878 + 0.19) % 1, at: 1.2 + i * 0.05 }));
  function ignite(alpha: number, since: number) {
    if (alpha <= 0) return;
    pen.save();
    pen.globalCompositeOperation = "lighter";
    firstStars.forEach((star, i) => {
      const lit = ramp(star.at, star.at + 0.7, since);
      if (lit <= 0) return;
      const size = short * (0.012 + (i % 5) * 0.004) * lit;
      stamp(i % 3 ? gasPale : sunLight, star.x * w, star.y * h, size * 3, alpha * lit * 0.4);
      stamp(spike, star.x * w, star.y * h, size, alpha * lit);
    });
    pen.restore();
  }

  function astrolabe(radius: number, rush: number, alpha: number) {
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

  const orbit = Math.min(w * 0.47, h * 1.05);
  const seat = (planet: (typeof planets)[number]) => [cx + Math.cos(planet.at) * planet.far * orbit, cy + Math.sin(planet.at) * planet.far * orbit * 0.36] as const;

  /**
   * The sun and its planets seen from above at a slant; at speed each orbit becomes a ring of light. `veil` dims the
   * sky behind, and `homeward` (below 1) leaves the earth out while it is still on its way from the hand.
   */
  function solarSystem(shown: number, dt: number, speed: number, veil: number, homeward: number) {
    if (shown <= 0) return;
    const collapse = 0;
    const reachX = orbit;
    const tilt = 0.36;
    pen.save();
    const hush = pen.createRadialGradient(cx, cy, 0, cx, cy, reach);
    hush.addColorStop(0, `rgba(3,2,14,${shown * 0.45})`);
    hush.addColorStop(1, "rgba(3,2,14,0)");
    pen.fillStyle = hush;
    // shrunk into the distance, a square of shadow would show its edges
    if (veil >= 1) pen.fillRect(0, 0, w, h);
    const place = (planet: (typeof planets)[number]) => {
      const r = planet.far * reachX;
      return [cx + Math.cos(planet.at) * r, cy + Math.sin(planet.at) * r * tilt, r] as const;
    };
    const draw = (planet: (typeof planets)[number]) => {
      if (planet.moon && homeward < 1) return;
      const [x, y, r] = place(planet);
      const size = short * planet.size * (1 - collapse * 0.6) * 1.55;
      pen.globalCompositeOperation = "source-over";
      pen.globalAlpha = shown;
      const rings = (from: number, to: number) => {
        for (const [scale, width, color] of [[1.55, 0.16, "rgba(190,164,120,0.65)"], [1.85, 0.3, "rgba(236,218,170,0.9)"], [2.22, 0.18, "rgba(205,185,145,0.6)"]] as const) {
          pen.strokeStyle = color;
          pen.lineWidth = size * width;
          pen.beginPath();
          pen.ellipse(x, y, size * scale, size * scale * 0.34, -0.25, from, to);
          pen.stroke();
        }
      };
      if (planet.ring) rings(Math.PI, TAU);
      // toward the sun: planets nearer the eye than the sun show their night side more
      planet.ball(x, y, size, planet.at * 0.4 + planet.far * 3, [cx - x, cy - y, -Math.sin(planet.at) * r * 0.4 + r * 0.55]);
      if (planet.ring) rings(0, Math.PI);
      if (planet.moon) {
        const m = planet.at * 9;
        pen.fillStyle = "#dfe3ea";
        circle(x + Math.cos(m) * size * 2.2, y + Math.sin(m) * size * 0.9, size * 0.26);
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
    belt(shown, reachX, false);
    planets.filter((planet) => Math.sin(planet.at) < 0).forEach(draw);
    pen.globalCompositeOperation = "lighter";
    stamp(sunLight, cx, cy, short * (0.55 + collapse * 0.6), shown * 0.6);
    sunAt(cx, cy, short * 0.052, 1, shown);
    planets.filter((planet) => Math.sin(planet.at) >= 0).forEach(draw);
    belt(shown, reachX, true);
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
    gasClock += dt;
    if (gasClock >= 1 / 60) {
      // fades by the clock, not by the frame, so every screen shows the same tails
      paint.globalCompositeOperation = "destination-out";
      paint.fillStyle = `rgba(0,0,0,${1 - 0.945 ** Math.min(4, gasClock * 60)})`;
      paint.fillRect(0, 0, w, h);
      gasClock = 0;
    }
    paint.globalCompositeOperation = "lighter";
    const arm = Math.min(1.6, dt * 60);
    stars2.forEach(([x, y], i) => {
      for (let k = 0; k < 3; k++) {
        // trailing arms, swept back along the orbit
        const lag = pairTurn + i * Math.PI - (k + 1) * 0.18;
        const far = apart * (1 + k * 0.28);
        const [gx, gy] = [cx + Math.cos(lag) * far, cy + Math.sin(lag) * far * tilt];
        paint.globalAlpha = (0.14 - k * 0.032) * arm;
        paint.drawImage(i ? gasWarm : gasLight, gx - short * 0.075, gy - short * 0.075, short * 0.15, short * 0.15);
      }
      paint.globalAlpha = 0.14 * arm;
      paint.drawImage(i ? gasWarm : gasPale, x - short * 0.035, y - short * 0.035, short * 0.07, short * 0.07);
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
    // a thread of gas drawn from one star to the other
    const [[ax, ay], [bx, by]] = stars2;
    const sweep = short * 0.1 * Math.min(1, apart / (short * 0.12));
    for (const [width, alpha] of [[0.022, 0.12], [0.006, 0.5]]) {
      pen.strokeStyle = `rgba(255,226,200,${alpha * shown})`;
      pen.lineWidth = short * width;
      pen.beginPath();
      pen.moveTo(ax, ay);
      pen.bezierCurveTo(cx - Math.sin(pairTurn) * sweep, cy + Math.cos(pairTurn) * sweep * tilt - sweep * 0.3, cx + Math.sin(pairTurn) * sweep, cy - Math.cos(pairTurn) * sweep * tilt + sweep * 0.3, bx, by);
      pen.stroke();
    }
    stars2.forEach(([x, y], i) => {
      const size = short * (i ? 0.024 : 0.02);
      stamp(i ? gasWarm : gasPale, x, y, size * 11, shown * 0.55);
      stamp(core, x, y, size * 4.6, shown * 0.6);
      pen.globalAlpha = shown;
      const face = pen.createRadialGradient(x - size * 0.25, y - size * 0.25, size * 0.1, x, y, size);
      face.addColorStop(0, "#ffffff");
      face.addColorStop(0.6, i ? "#ffd28a" : "#cfeaff");
      face.addColorStop(1, i ? "#ff7a2a" : "#58b4ff");
      pen.fillStyle = face;
      circle(x, y, size);
      pen.fill();
      // the glare a lens gives so bright a point
      pen.strokeStyle = `rgba(255,255,255,${0.35 * shown})`;
      pen.lineWidth = 1.2;
      pen.beginPath();
      pen.moveTo(x - size * 7, y);
      pen.lineTo(x + size * 7, y);
      pen.stroke();
    });
    // the light where they will meet
    stamp(core, cx, cy, short * (0.05 + collapse ** 2 * 0.8), shown * collapse);
    pen.restore();
  }

  /** the stars merge into a black hole: a disk of white-hot gas, its far side bent into sight over and under it */
  function blackHole(shown: number, t: number) {
    if (shown <= 0) return;
    const r = short * 0.115 * (0.4 + 0.6 * shown);
    const lean = -0.14;
    const disk = (from: number, to: number) => {
      for (let i = 0; i < 18; i++) {
        const k = i / 18;
        const far = r * (1.45 + k * 2.5);
        pen.strokeStyle = `rgba(255,${Math.round(238 - k * 160)},${Math.round(208 - k * 200)},${(1 - k) ** 1.4 * 0.55 * shown})`;
        pen.lineWidth = r * 0.17;
        pen.beginPath();
        pen.ellipse(cx, cy, far, far * 0.24, lean, from, to);
        pen.stroke();
      }
      // knots of gas racing round, the inner ones fastest
      pen.lineCap = "round";
      for (let i = 0; i < 70; i++) {
        const k = (i * 0.618) % 1;
        const a = (((i * 2.399963 + t * (4.2 - k * 3)) % TAU) + TAU) % TAU;
        if (a < from || a > to - 0.25) continue;
        const far = r * (1.5 + k * 2.3);
        pen.strokeStyle = `rgba(255,${Math.round(250 - k * 110)},${Math.round(230 - k * 180)},${(1 - k * 0.7) * 0.7 * shown})`;
        pen.lineWidth = r * 0.035;
        pen.beginPath();
        pen.ellipse(cx, cy, far, far * 0.24, lean, a, a + 0.22);
        pen.stroke();
      }
    };
    pen.save();
    pen.globalCompositeOperation = "lighter";
    stamp(sunLight, cx, cy, r * 11, shown * 0.5);
    disk(Math.PI, TAU);
    // gravity carries the light of the far side over the top and underneath
    for (let i = 0; i < 9; i++) {
      const k = i / 9;
      pen.strokeStyle = `rgba(255,${Math.round(232 - k * 120)},${Math.round(190 - k * 150)},${(1 - k) * 0.6 * shown})`;
      pen.lineWidth = r * 0.075;
      pen.beginPath();
      pen.arc(cx, cy, r * (1.12 + k * 0.62), Math.PI + lean + k * 0.16, TAU + lean - k * 0.16);
      pen.stroke();
      pen.globalAlpha = 0.45;
      pen.beginPath();
      pen.arc(cx, cy, r * (1.1 + k * 0.28), lean + 0.25 + k * 0.2, Math.PI + lean - 0.25 - k * 0.2);
      pen.stroke();
      pen.globalAlpha = 1;
    }
    pen.globalCompositeOperation = "source-over";
    pen.fillStyle = `rgba(0,0,0,${shown})`;
    circle(cx, cy, r);
    pen.fill();
    pen.globalCompositeOperation = "lighter";
    pen.strokeStyle = `rgba(255,246,226,${0.95 * shown})`;
    pen.lineWidth = Math.max(1.2, r * 0.035);
    circle(cx, cy, r * 1.04);
    pen.stroke();
    disk(0, Math.PI);
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
    // rings of the shock running outward
    for (let i = 0; i < 3; i++) {
      const k = clamp((since - i * 0.45) / 2.6);
      if (k <= 0 || k >= 1) continue;
      const out = (1 - (1 - k) ** 2) * reach * 1.15;
      for (const [color, width, strength] of [["196,181,253", 26, 0.16], ["255,244,226", 3, 0.5]] as const) {
        pen.globalAlpha = alpha * (1 - k) * strength;
        pen.strokeStyle = `rgb(${color})`;
        pen.lineWidth = width * (1 - k * 0.6);
        pen.beginPath();
        pen.ellipse(cx, cy, out, out * 0.8, 0, 0, TAU);
        pen.stroke();
      }
    }
    // threads along which the first matter gathers
    pen.lineWidth = 1;
    pen.strokeStyle = "#a5b4fc";
    for (let i = 0; i < 40; i++) {
      const a = i * 2.399963;
      const far = grow * reach * (0.4 + ((i * 0.618) % 1) * 0.6);
      const bend = Math.sin(i * 5.7) * 0.5;
      pen.globalAlpha = alpha * 0.16 * grow;
      pen.beginPath();
      pen.moveTo(cx + Math.cos(a) * far * 0.12, cy + Math.sin(a) * far * 0.1);
      pen.quadraticCurveTo(cx + Math.cos(a + bend) * far * 0.6, cy + Math.sin(a + bend) * far * 0.5, cx + Math.cos(a + bend * 0.3) * far, cy + Math.sin(a + bend * 0.3) * far * 0.8);
      pen.stroke();
    }
    stamp(core, cx, cy, short * (0.2 + (1 - grow) * 1.1), alpha * (1 - grow) * 0.85 + alpha * 0.08);
    pen.restore();
  }

  function world(shown: number, t: number, shrink: number, away: number) {
    if (shown <= 0 || shrink >= 1) return;
    const held = short * 0.19 * (1 - shrink ** 2);
    const gone = ramp(0, 1, away);
    const r = held + (short * 0.022 - held) * gone;
    const [homeX, homeY] = seat(planets[2]);
    // the sky dims behind, so the world stands out from the trails
    const hush = pen.createRadialGradient(cx, cy, 0, cx, cy, short * 0.85);
    hush.addColorStop(0, `rgba(4,3,18,${shown * 0.4 * (1 - shrink)})`);
    hush.addColorStop(1, "rgba(4,3,18,0)");
    pen.fillStyle = hush;
    pen.fillRect(0, 0, w, h);
    // it rises into place, and later travels to where the earth belongs
    const x = cx + (homeX - cx) * gone;
    const y = cy + (1 - shown) * h * 0.5 * (1 - shrink) * (1 - gone) + (homeY - cy) * gone;
    pen.save();
    pen.globalAlpha = shown;
    // the sun behind the world
    pen.globalCompositeOperation = "lighter";
    stamp(core, x - r * 0.95, y - r * 1, r * 3.4, shown * 0.7 * (1 - gone));
    pen.strokeStyle = `rgba(255,236,190,${shown * 0.5 * (1 - gone)})`;
    pen.lineWidth = 1.5;
    pen.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = i * (TAU / 8) + t * 0.05;
      const long = r * (i % 2 ? 1.6 : 3.2);
      pen.moveTo(x - r * 0.75 - Math.cos(a) * long, y - r * 0.8 - Math.sin(a) * long);
      pen.lineTo(x - r * 0.75 + Math.cos(a) * long, y - r * 0.8 + Math.sin(a) * long);
    }
    pen.stroke();
    stamp(air, x, y, r * 3.1, shown * 0.8);
    pen.globalCompositeOperation = "source-over";
    pen.globalAlpha = shown;
    earthBall(x, y, r, 0.62 + t * 0.022, [-0.72 + 0.4 * gone, -0.5 + 0.3 * gone, 0.42 + 0.3 * gone]);
    pen.strokeStyle = "rgba(150,210,255,0.45)";
    pen.lineWidth = 1.5;
    circle(x, y, r);
    pen.stroke();
    // the hand sinks away as its world leaves
    const left = clamp(1 - gone * 1.8);
    if (left > 0) {
      pen.globalAlpha = shown * left;
      hand(cx, cy + (1 - shown) * h * 0.5 + gone * h * 0.35, held, t);
    }
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

  function universe(t: number, dt: number, english = false) {
    clock = t;
    inEnglish = english;
    const { rush, speed, daySpeed, cosmic, manga, world: held, solar, binary, collapse, seasons: weather, future: tomorrow, ruin, galaxy: meet, giant, ageing } = momentAt(t);
    turned += speed * dt;
    day += daySpeed * dt;
    drift += speed * dt;
    const height = Math.sin(day);
    const daylight = clamp(height * 1.4 + 0.35) * (1 - cosmic);
    const horizon = h * 0.82 + cosmic * h * 0.45;

    pen.save();
    // the world trembles as time runs away
    const struck = BOOMS.reduce((sum, boom) => sum + (t >= boom.at ? boom.power * Math.min(1, (t - boom.at) / 0.1) * Math.exp(-(t - boom.at) * 2.6) : 0), 0);
    const shake = rush ** 4 * 5 * (1 - collapse * 0.5) + struck * 22;
    pen.translate((Math.sin(t * 53) + Math.sin(t * 31.7)) * shake * 0.25, (Math.cos(t * 47) + Math.sin(t * 28.3)) * shake * 0.25);

    const sky = pen.createLinearGradient(0, 0, 0, Math.max(horizon, 1));
    // a clear blue day at first, warming to orange as the days begin to race; the nights are deep blue
    const dusk = ramp(4.5, 10, t);
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
    fadeClock += dt;
    if (fadeClock >= 1 / 60) {
      paint.globalCompositeOperation = "destination-out";
      paint.fillStyle = `rgba(0,0,0,${1 - (0.5 + rush * 0.42) ** Math.min(4, fadeClock * 60)})`;
      paint.fillRect(0, 0, w, h);
      fadeClock = 0;
    }
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
    const steady = ramp(9, 15, t) * (1 - cosmic);
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
    const trail = ramp(7, 13, t) * (1 - cosmic);
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
    clouds.forEach((cloud, i) => {
      const x = (((cloud.x + drift * 0.035 * cloud.pace) % 1.6) - 0.3) * w;
      const long = cloud.wide * w * (0.75 + rush * 1.7);
      const tall = Math.min(long * 0.34, short * 0.17) * (1 - rush * 0.6);
      pen.globalAlpha = (0.14 + daylight * 0.62) * (1 - cosmic);
      pen.drawImage(puffs[i % 3], x - long / 2, cloud.y * horizon - tall / 2, long, tall);
    });
    pen.globalAlpha = 1;

    // lines of speed rushing out of the middle
    const streak = ramp(10, 17, t) * (1 - collapse);
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
      // far hills, paler the farther they are, as through air
      const far = blend([12, 14, 40], blendList([112, 156, 200], [150, 84, 104], dusk), daylight);
      const nearer = blend([8, 10, 26], blendList([62, 98, 128], [84, 44, 68], dusk), daylight);
      range(hills[0], horizon, Math.min(h * 0.34, w * 0.28), far);
      range(hills[1], horizon, Math.min(h * 0.22, w * 0.18), nearer);
      future(tomorrow, t, horizon);
      pen.fillStyle = "#05060d";
      pen.fillRect(0, horizon, w, h - horizon + 8);
      // light catching the roofs, a hair above the dark shapes
      pen.globalAlpha = daylight * 0.5;
      pen.drawImage(dusk > 0.5 ? rimDawn : rimDay, 0, ground - 1.6, w, city.tall);
      pen.globalAlpha = 1;
      pen.drawImage(city.land, 0, ground, w, city.tall);
      pen.globalAlpha = (1 - daylight * 0.85) * (1 - ramp(0, 0.35, ruin));
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

    if (cosmic < 1) {
      pen.save();
      pen.globalAlpha = 1 - cosmic;
      wild(ruin * (1 - cosmic), horizon);
      pen.restore();
    }
    seasons(weather, drift, horizon);
    tag(w * 0.5, horizon - city.ground * 0.5, short * 0.03, "โรงเรียนของเรา", "Our school", ramp(0.8, 1.6, t) * (1 - ramp(3.6, 4.4, t)));

    // the clock gives its place to the world
    astrolabe(short * (0.15 + rush * 0.035) * (1 + held * 0.5), rush, ramp(1, 2.6, t) * (1 - held));
    // the world in the hand flies out into the whole solar system, which then shrinks into one of two galaxies,
    // one of whose stars grows old, leaving a heart that becomes one of a pair
    const homeward = ramp(0, 1, solar);
    if (meet > 0 && meet < 1) {
      const [gx, gy] = heart(0);
      const small = 1 - meet * 0.96;
      pen.save();
      pen.translate(cx + (gx - cx) * meet, cy + (gy - cy) * meet);
      pen.scale(small, small);
      pen.translate(-cx, -cy);
      solarSystem(solar * (1 - meet * meet), dt, speed, 0, homeward);
      pen.restore();
    } else solarSystem(solar * (1 - meet), dt, speed, 1, homeward);
    world(held * (1 - ramp(0.82, 1, solar)), t, collapse, solar);
    comet(solar * (1 - meet), t);
    tag(...seat(planets[2]), short * 0.028, "โลกของเรา", "Our Earth", ramp(29.6, 30.4, t) * (1 - ramp(32.4, 33.2, t)));
    galaxyMeet(meet * (1 - giant), dt, giant);
    redGiant(giant * (1 - binary), ageing, t, giant, binary);
    const holed = ramp(0.22, 0.5, collapse);
    binaryStars(binary * (1 - holed), dt, collapse);
    blackHole(holed * (1 - ramp(0.9, 1, collapse)), t);
    // ripples in space itself, one after another
    for (let i = 0; i < 5; i++) {
      const k = (t - 49 - i * 0.42) / 2.4;
      if (k <= 0 || k >= 1) continue;
      pen.strokeStyle = `rgba(150,200,255,${Math.sin(k * Math.PI) * 0.4})`;
      pen.lineWidth = 3 + k * 9;
      pen.beginPath();
      pen.ellipse(cx, cy, k * reach, k * reach * (0.55 + 0.12 * Math.sin(t * 3 + i)), t * 0.4 + i * 0.6, 0, TAU);
      pen.stroke();
    }
    // matter torn loose, winding into the hole
    if (collapse > 0.2) {
      pen.lineCap = "round";
      for (let i = 0; i < (lite ? 50 : 150); i++) {
        const k = (t * (0.28 + (i % 5) * 0.05) + i * 0.618) % 1;
        const far = reach * (1 - k) ** 1.7 + short * 0.1;
        const a = i * 2.399963 + k * k * 7;
        pen.strokeStyle = `rgba(255,${180 + (i % 4) * 22},${130 + (i % 5) * 28},${Math.sin(k * Math.PI) * 0.6 * ramp(0.2, 0.4, collapse)})`;
        pen.lineWidth = 1 + (i % 3);
        pen.beginPath();
        pen.moveTo(cx + Math.cos(a) * far, cy + Math.sin(a) * far * 0.6);
        pen.quadraticCurveTo(cx + Math.cos(a + 0.12) * far * 0.95, cy + Math.sin(a + 0.12) * far * 0.57, cx + Math.cos(a + 0.3) * far * 0.84, cy + Math.sin(a + 0.3) * far * 0.5);
        pen.stroke();
      }
    }

    meteors(cosmic * (1 - ramp(0.55, 0.85, collapse)), t);
    // the blasts of the story, each where it happens
    const colours = ["200,170,255", "150,190,255", "255,150,80", "255,110,140", "130,200,255"];
    BOOMS.slice(0, -1).forEach((boom, i) => {
      const [bx, by] = i === 1 ? heart(0) : [cx, cy];
      blast(bx, by, t - boom.at, boom.power, colours[i]);
    });

    // everything falls into one point of light
    if (collapse > 0) {
      pen.globalCompositeOperation = "lighter";
      stamp(core, cx, cy, short * (0.1 + collapse ** 4 * 3.6), collapse ** 4);
      pen.strokeStyle = `rgba(255,240,205,${collapse ** 4 * 0.7})`;
      pen.lineWidth = 2;
      pen.beginPath();
      pen.ellipse(cx, cy, reach * (1 - collapse) + 4, (reach * (1 - collapse) + 4) * 0.32, turned * 0.03, 0, TAU);
      pen.stroke();
      // shafts of light breaking out
      pen.fillStyle = `rgba(255,244,214,${collapse ** 3 * 0.16})`;
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

    // the far dark world needs the most bleeding light; the bright day and the comic panel very little
    bloom((0.2 + cosmic * 0.55) * (1 - manga) * (1 - held * 0.4));
    inked(manga, t);
    rumble(ramp(16.2, 17.6, t) * (1 - ramp(22.4, 23.4, t)), t);
    if (!lite) {
      pen.globalAlpha = 0.045 + manga * 0.22;
      pen.fillStyle = dots;
      pen.fillRect(0, 0, w, h);
      pen.globalAlpha = 1;
    }
    // the picture narrows to a cinema's shape for the great events
    const bars = h * 0.065 * ramp(22.8, 24, t) * (1 - ramp(50.6, 52, t));
    pen.fillStyle = "#000";
    pen.fillRect(0, 0, w, bars);
    pen.fillRect(0, h - bars, w, bars);
    paintWorlds(lite ? 2 : 3.5);
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
    clouds.slice(0, 7).forEach((cloud, i) => {
      const long = cloud.wide * w * 0.75;
      const x = (((cloud.x + since * 0.01 * cloud.pace) % 1.3) - 0.15) * w;
      pen.globalAlpha = alpha * 0.55;
      pen.drawImage(puffs[i % 3], x - long / 2, cloud.y * horizon * 0.75, long, Math.min(long * 0.26, short * 0.13));
    });
    pen.globalAlpha = alpha;
    range(hills[0], horizon, Math.min(h * 0.32, w * 0.26), "#9a5c74");
    pen.globalAlpha = alpha * 0.55;
    pen.drawImage(cloudLight, -w * 0.2, horizon - h * 0.11, w * 1.4, h * 0.09);
    pen.globalAlpha = alpha;
    range(hills[1], horizon, Math.min(h * 0.2, w * 0.17), "#4e2c4a");
    pen.globalAlpha = alpha * 0.4;
    pen.drawImage(cloudLight, -w * 0.2 + since * w * 0.012, horizon - h * 0.06, w * 1.4, h * 0.07);
    // circles of light the lens throws, in a line from the sun
    pen.globalCompositeOperation = "lighter";
    for (const [far, size, color] of [[0.35, 0.05, "255,190,120"], [0.62, 0.025, "180,220,255"], [0.95, 0.085, "255,150,170"], [1.3, 0.035, "190,255,220"]] as const) {
      pen.globalAlpha = alpha * 0.12;
      pen.fillStyle = `rgb(${color})`;
      circle(cx + w * 0.16 * far, sunY - h * 0.5 * far, short * size);
      pen.fill();
    }
    pen.globalCompositeOperation = "source-over";
    // a pair of birds crossing
    pen.globalAlpha = alpha;
    pen.strokeStyle = "#2a1a2e";
    pen.lineWidth = 2;
    for (const [bx, by] of [[0.28, 0.34], [0.33, 0.3], [0.31, 0.38], [0.24, 0.31], [0.36, 0.35], [0.2, 0.37], [0.27, 0.27]]) {
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
    pen.globalAlpha = alpha * 0.85;
    pen.drawImage(rimDawn, 0, horizon - city.ground - 2, w, city.tall);
    pen.globalAlpha = alpha;
    pen.drawImage(city.land, 0, horizon - city.ground, w, city.tall);
    const earthDark = pen.createLinearGradient(0, horizon, 0, h);
    earthDark.addColorStop(0, "#05060d");
    earthDark.addColorStop(1, "#1c0f1c");
    pen.fillStyle = earthDark;
    pen.fillRect(0, horizon, w, h - horizon + 8);
    pen.restore();
  }

  /** the new universe bursting outward, then its first morning, fading over the page as it appears */
  function bang(since: number) {
    pen.clearRect(0, 0, w, h);
    const moment = momentAt(WHITE_FULL_AT + since);
    birth(moment.birth, since);
    if (moment.birth > 0) {
      pen.save();
      pen.globalAlpha = moment.birth;
      clock = WHITE_FULL_AT + since;
      blast(cx, cy, since - 0.5, 1.4, "190,150,255");
      blast(cx, cy, since - 1.25, 1.1, "255,160,110");
      blast(cx, cy, since - 2.1, 0.8, "110,220,255");
      meteors(moment.birth * ramp(1, 2, since), since);
      pen.restore();
    }
    ignite(moment.birth, since);
    morning(moment.dawn, Math.max(0, since - (MORNING - WHITE_FULL_AT)));
    // gentle: over the white page behind, a strong bleed would only wash it out
    bloom(Math.max(moment.birth * 0.5, moment.dawn * 0.4));
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

  /** for a machine that cannot keep up: the finishing touches are left out */
  const lighten = () => void (lite = true);

  return { universe, bang, lighten };
}
