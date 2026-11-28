// ภาพของฉาก Made in Heaven วาดเองทั้งหมดบน canvas: ท้องฟ้าเหนือโรงเรียน ดาวลากเส้น ดวงอาทิตย์ ดวงจันทร์ เมฆ
// นาฬิกาดาราศาสตร์ การยุบตัวของจักรวาล และการระเบิดกำเนิดจักรวาลใหม่
import { momentAt, RUSH_END, WHITE_FULL } from "./heaven";

type Pen = CanvasRenderingContext2D;
const TAU = Math.PI * 2;
const ROMAN = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ramp = (from: number, to: number, t: number) => {
  const x = clamp((t - from) / (to - from));
  return x * x * (3 - 2 * x);
};
const blend = (a: number[], b: number[], k: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(",")})`;
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
  const sunLight = glow("255,176,66");
  const moonLight = glow("190,214,255");
  const core = glow("255,244,214");
  const cloudLight = glow("170,180,225");
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

  function universe(t: number, dt: number) {
    const { speed, daySpeed, year } = momentAt(t);
    const rush = ramp(1.5, RUSH_END, t);
    const cosmic = ramp(5.6, 7.8, t);
    const collapse = ramp(7.2, WHITE_FULL - 0.15, t);
    turned += speed * dt;
    day += daySpeed * dt;
    drift += speed * dt;
    const height = Math.sin(day);
    const daylight = clamp(height * 1.4 + 0.15) * (1 - cosmic);
    const horizon = h * 0.82 + cosmic * h * 0.45;

    pen.save();
    // the world trembles as time runs away
    const shake = rush ** 4 * 5 * (1 - collapse * 0.5);
    pen.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);

    const sky = pen.createLinearGradient(0, 0, 0, Math.max(horizon, 1));
    sky.addColorStop(0, blend([3, 4, 16], [22, 34, 84], daylight));
    sky.addColorStop(0.65, blend([12, 14, 44], [74, 66, 128], daylight));
    sky.addColorStop(1, blend([28, 24, 66], [206, 108, 62], daylight));
    pen.fillStyle = sky;
    pen.fillRect(-10, -10, w + 20, h + 20);

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
    pen.drawImage(trails.sheet, 0, 0, w, h);

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
    body(day, true);
    body(day + Math.PI, false);

    // clouds racing, stretched by their speed
    pen.globalCompositeOperation = "source-over";
    for (const cloud of clouds) {
      const x = (((cloud.x + drift * 0.035 * cloud.pace) % 1.6) - 0.3) * w;
      const long = cloud.wide * w * (1 + rush * 1.4);
      pen.globalAlpha = (0.1 + daylight * 0.14) * (1 - cosmic);
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

    astrolabe(short * (0.15 + rush * 0.035) * (1 - collapse ** 3), year, rush, ramp(0.5, 1.8, t));

    // everything falls into one point of light
    if (collapse > 0) {
      pen.globalCompositeOperation = "lighter";
      stamp(core, cx, cy, short * (0.1 + collapse ** 3 * 3.4), collapse);
      pen.strokeStyle = `rgba(255,240,205,${collapse * 0.7})`;
      pen.lineWidth = 2;
      pen.beginPath();
      pen.ellipse(cx, cy, reach * (1 - collapse) + 4, (reach * (1 - collapse) + 4) * 0.32, turned * 0.03, 0, TAU);
      pen.stroke();
    }
    pen.restore();

    const edge = pen.createRadialGradient(cx, cy, short * 0.35, cx, cy, reach * 1.15);
    edge.addColorStop(0, "rgba(0,0,0,0)");
    edge.addColorStop(1, "rgba(0,0,0,0.65)");
    pen.fillStyle = edge;
    pen.fillRect(0, 0, w, h);
  }

  /** the new universe bursting outward, over the page as it appears */
  function bang(since: number) {
    pen.clearRect(0, 0, w, h);
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
