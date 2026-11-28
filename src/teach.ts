// "สอน AI ด้วยตัวเอง": แปลงเส้นที่วาดเป็นตารางจุด แล้วฝึกโครงข่ายประสาทเล็กๆ (หนึ่งชั้นซ่อน) ด้วย gradient descent
// เขียนเองทั้งหมด ทำงานในเบราว์เซอร์ ไม่ส่งข้อมูลออกจากเครื่อง

export type Stroke = [x: number, y: number][];
export const SIDE = 20;
export const MAX_KINDS = 5;
export const ENOUGH = 3; // drawings of each kind before training

/**
 * The drawing as a SIDE×SIDE grid of ink, 0 to 1: cut to its own edges and centred, so where and how large it was
 * drawn do not matter, only its shape. `turn` (radians) and `stretch` make the varied copies used in training.
 */
export function raster(strokes: Stroke[], turn = 0, stretch = 1): Float32Array {
  const grid = new Float32Array(SIDE * SIDE);
  const moved = strokes.map((stroke) => stroke.map(([x, y]) => [(x * Math.cos(turn) - y * Math.sin(turn)) * stretch, x * Math.sin(turn) + y * Math.cos(turn)]));
  const all = moved.flat();
  if (!all.length) return grid;
  const xs = all.map((point) => point[0]);
  const ys = all.map((point) => point[1]);
  const [left, right, top, bottom] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const scale = (SIDE - 4) / Math.max(right - left, bottom - top, 1);
  const place = ([x, y]: number[]) => [(x - (left + right) / 2) * scale + (SIDE - 1) / 2, (y - (top + bottom) / 2) * scale + (SIDE - 1) / 2];
  const dot = (x: number, y: number) => {
    for (let row = Math.floor(y) - 1; row <= Math.floor(y) + 2; row++) {
      for (let column = Math.floor(x) - 1; column <= Math.floor(x) + 2; column++) {
        if (row < 0 || column < 0 || row >= SIDE || column >= SIDE) continue;
        const ink = Math.max(0, Math.min(1, 1.6 - Math.hypot(column - x, row - y)));
        grid[row * SIDE + column] = Math.max(grid[row * SIDE + column], ink);
      }
    }
  };
  for (const stroke of moved) {
    const points = stroke.map(place);
    points.forEach(([x, y], i) => {
      const [fromX, fromY] = points[i - 1] ?? [x, y];
      const steps = Math.max(1, Math.ceil(Math.hypot(x - fromX, y - fromY) * 2));
      for (let k = 1; k <= steps; k++) dot(fromX + ((x - fromX) * k) / steps, fromY + ((y - fromY) * k) / steps);
    });
  }
  return grid;
}

export interface Sample {
  grid: Float32Array;
  kind: number;
}

/** each drawing and eight slightly turned and stretched copies of it */
export const varied = (strokes: Stroke[], kind: number): Sample[] =>
  [-0.18, 0, 0.18].flatMap((turn) => [0.85, 1, 1.18].map((stretch) => ({ grid: raster(strokes, turn, stretch), kind })));

const HIDDEN = 24;

/** a network of SIDE² inputs, one hidden layer, and one output for each kind */
export function createNet(kinds: number, random: () => number = Math.random) {
  const small = (count: number, spread: number) => Float32Array.from({ length: count }, () => (random() - 0.5) * spread);
  const first = small(SIDE * SIDE * HIDDEN, 0.1);
  const second = small(HIDDEN * kinds, 0.4);
  const firstBase = new Float32Array(HIDDEN);
  const secondBase = new Float32Array(kinds);
  const hidden = new Float32Array(HIDDEN);

  /** the chance of each kind, adding up to 1 */
  function guess(grid: Float32Array): number[] {
    for (let h = 0; h < HIDDEN; h++) {
      let sum = firstBase[h];
      for (let i = 0; i < grid.length; i++) sum += first[h * grid.length + i] * grid[i];
      hidden[h] = Math.tanh(sum);
    }
    const scores = Array.from({ length: kinds }, (_, k) => hidden.reduce((sum, value, h) => sum + value * second[k * HIDDEN + h], secondBase[k]));
    const top = Math.max(...scores);
    const raised = scores.map((score) => Math.exp(score - top));
    const total = raised.reduce((a, b) => a + b, 0);
    return raised.map((value) => value / total);
  }

  /** learns from every sample once, in a shuffled order; returns how wrong it was on average (the loss) */
  function epoch(samples: Sample[], rate = 0.04): number {
    const order = samples.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    let loss = 0;
    for (const at of order) {
      const { grid, kind } = samples[at];
      const chances = guess(grid);
      loss -= Math.log(chances[kind] + 1e-9);
      // how far each output, then each hidden value, should move: back through the network
      const off = chances.map((chance, k) => chance - (k === kind ? 1 : 0));
      for (let h = 0; h < HIDDEN; h++) {
        let blame = 0;
        for (let k = 0; k < kinds; k++) blame += off[k] * second[k * HIDDEN + h];
        blame *= 1 - hidden[h] ** 2;
        for (let i = 0; i < grid.length; i++) if (grid[i]) first[h * grid.length + i] -= rate * blame * grid[i];
        firstBase[h] -= rate * blame;
      }
      for (let k = 0; k < kinds; k++) {
        for (let h = 0; h < HIDDEN; h++) second[k * HIDDEN + h] -= rate * off[k] * hidden[h];
        secondBase[k] -= rate * off[k];
      }
    }
    return loss / samples.length;
  }

  return { guess, epoch };
}

export type Net = ReturnType<typeof createNet>;
