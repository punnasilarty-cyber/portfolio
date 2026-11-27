// ผังของแต่ละโรงเรียนในพิกัดของฉาก: x ไปทางทิศตะวันออก y ไปทางทิศใต้ (ด้านหน้าติดถนน)
//
// สุรวิทยาคาร: ตำแหน่งอาคารตามแผนผังโรงเรียน สี หลังคา และจำนวนชั้นของอาคาร 7 กับโดมพลศึกษาตามภาพมุมสูง
// (ภาพที่เจ้าของเว็บให้มา) อาคารที่ไม่เห็นในภาพ จำนวนชั้นและสีเป็นการประมาณ
// สังขะวิทยาคม: ตำแหน่งอาคารตามแผนผังสถานที่แข่งขันของโรงเรียน (ปีการศึกษา 2566) สีและจำนวนชั้นของอาคาร 6
// ตามภาพถ่ายอาคาร (ภาพที่เจ้าของเว็บให้มา) ส่วนที่เหลือเป็นการประมาณ

export type Rect = [x: number, y: number, w: number, d: number];

export type Building = {
  at: Rect;
  floors: number;
  roof: string;
  wall?: string;
  /** สีแถบระเบียงของแต่ละชั้น */
  band?: string;
  /** หลังคาโค้ง ถ้าให้สองสี ครึ่งเหนือใช้สีแรก ครึ่งใต้ใช้สีที่สอง */
  vault?: string[];
  /** โถงเปิดโล่ง มีแต่เสากับหลังคา */
  open?: boolean;
  /** ชั้นล่างเปิดโล่ง เป็นเสารับอาคาร */
  pilotis?: boolean;
  /** อาคารหลัก ติดตราโรงเรียน */
  main?: boolean;
  /** หอบันไดที่ยื่นออกมาด้านหน้า ตำแหน่งเป็นสัดส่วนของความกว้าง */
  towers?: number[];
};

export type Spot = [number, number];

export type Layout = {
  viewBox: string;
  ground: Rect;
  storey: number;
  roads?: Rect[];
  ponds?: Rect[];
  paving?: { at: Rect; color: string }[];
  field: Rect;
  buildings: Building[];
  /** ศาลาทรงไทย */
  salas?: { at: Rect; roof: string }[];
  trees: Spot[];
  treeSize: number;
  flag: Spot;
  sign: Rect;
};

const SANGKHA_YELLOW = "#f7c815";
const MINT = "#45c9bd";
const MINT_BAND = "#7fd6bd";

/** a straight row of trees */
const row = (from: Spot, to: Spot, count: number): Spot[] =>
  Array.from({ length: count }, (_, i) => [from[0] + ((to[0] - from[0]) * i) / (count - 1), from[1] + ((to[1] - from[1]) * i) / (count - 1)]);

export const LAYOUTS: Record<string, Layout> = {
  โรงเรียนสุรวิทยาคาร: {
    viewBox: "-212 -142 424 268",
    ground: [-137, -102, 272, 204],
    storey: 7,
    roads: [
      [29, -102, 8, 204],
      [-89, -16, 118, 6],
      [-117, 70, 146, 6],
      [37, -66, 76, 5],
      [37, -1, 76, 5],
    ],
    ponds: [
      [-105, 80, 114, 18],
      [-71, -96, 54, 36],
    ],
    paving: [
      // the red walk along the north of the stadium, and the garden by the front gate
      { at: [-62, -9, 90, 5], color: "#b0503c" },
      { at: [10, 78, 18, 22], color: "#57a05a" },
      // the island in the back pond
      { at: [-52, -86, 16, 14], color: "#57a05a" },
    ],
    field: [-62, -2, 90, 64],
    buildings: [
      // อาคารศรีสุระ ห้องสมุด และโรงอาหาร
      { at: [-127, -93, 40, 22], floors: 4, roof: "#8a5a48", wall: "#bfe0c4" },
      { at: [-127, -66, 40, 20], floors: 1, roof: "#7d93ab" },
      // อาคาร 1 เอกอมรินทร์ และอาคาร 7 อมเรศธำรง
      { at: [-81, -53, 74, 14], floors: 4, roof: MINT, band: MINT_BAND },
      { at: [-81, -34, 83, 15], floors: 4, roof: MINT, band: MINT_BAND, main: true, towers: [0.22, 0.74] },
      // หอประชุมรวมน้ำใจ และหอประชุมสุรวิทยาคาร
      { at: [-22, -86, 40, 24], floors: 2, roof: "#e2a62b" },
      { at: [9, -56, 17, 37], floors: 2, roof: "#d9e6e4", vault: ["#d9e6e4"] },
      // ฝั่งตะวันตก: อุตสาหกรรม พลศึกษา ยิม อาคาร 100 ปี และโดมพลศึกษา
      { at: [-134, -22, 42, 19], floors: 1, roof: "#3f9d6d", vault: ["#3f9d6d"] },
      { at: [-134, 1, 42, 15], floors: 1, roof: "#8d8177" },
      { at: [-134, 19, 42, 16], floors: 1, roof: "#2f8f66", vault: ["#2f8f66"] },
      { at: [-116, 39, 24, 29], floors: 2, roof: "#49b08a", vault: ["#49b08a"] },
      { at: [-134, 50, 15, 29], floors: 2, roof: "#c4632f" },
      { at: [-89, -8, 24, 74], floors: 2, roof: "#f4c61e", vault: ["#f4c61e", "#a9dce8"], open: true },
      // ฝั่งตะวันออก: อาคาร 6, 2, โดมอาคาร 2, 3, 4, 84 ปี, 5 และอาคาร 111 ปี
      { at: [41, -92, 70, 14], floors: 4, roof: "#9aa7b4" },
      { at: [41, -54, 70, 14], floors: 4, roof: "#b8c4cc" },
      { at: [41, -36, 70, 14], floors: 2, roof: "#e7ecee", vault: ["#e7ecee"], open: true },
      { at: [50, -18, 61, 15], floors: 4, roof: "#cf5a43" },
      { at: [50, 13, 61, 14], floors: 4, roof: "#8f9db0" },
      { at: [50, 36, 30, 14], floors: 3, roof: "#c4632f" },
      { at: [51, 56, 77, 14], floors: 4, roof: "#a7b3bd", band: MINT_BAND },
      { at: [116, -38, 11, 42], floors: 2, roof: "#7fa8d8" },
      // โรงจอดรถจักรยานยนต์
      { at: [54, 83, 74, 13], floors: 1, roof: "#9fb0a0", open: true },
    ],
    salas: [
      { at: [-24, 66, 13, 9], roof: "#c2492f" },
      { at: [14, 62, 12, 10], roof: "#2a9c8c" },
    ],
    trees: [
      ...row([-58, -12], [24, -12], 8),
      ...row([-100, 77], [-34, 77], 7),
      ...row([-6, 77], [6, 77], 2),
      ...row([40, -72], [104, -72], 6),
      ...row([40, 7], [40, 31], 2),
    ],
    treeSize: 0.42,
    flag: [-34, -14],
    sign: [9, 93, 22, 4],
  },
  โรงเรียนสังขะวิทยาคม: {
    viewBox: "-218 -166 436 282",
    ground: [-148, -126, 262, 224],
    storey: 10,
    roads: [
      [-148, 96, 262, 2],
      [-70, -92, 6, 176],
      [-140, 52, 76, 6],
      [66, -88, 6, 146],
    ],
    // the two basketball courts east of the field
    paving: [
      { at: [78, -48, 28, 18], color: "#e08a2c" },
      { at: [78, -24, 28, 18], color: "#e08a2c" },
    ],
    field: [-20, -66, 76, 96],
    buildings: [
      // อาคาร 6: the three-storey block with the open ground floor and yellow bands
      { at: [-62, -86, 30, 62], floors: 3, roof: "#3a3f4a", band: SANGKHA_YELLOW, wall: "#f7f4ea", main: true, pilotis: true },
      // อาคารร่มบารมี and the orange-roofed block behind it
      { at: [-100, -8, 28, 54], floors: 3, roof: "#2f3f9a", band: SANGKHA_YELLOW },
      { at: [-128, -2, 22, 46], floors: 2, roof: "#e8901f", band: SANGKHA_YELLOW },
      // small houses along the north-west, the library, อาคารฉลอง 60 ปี and อาคาร 2
      { at: [-100, -46, 22, 28], floors: 1, roof: "#7a4a38" },
      { at: [-140, 62, 24, 30], floors: 1, roof: "#d9d7d2" },
      { at: [-108, 70, 36, 20], floors: 1, roof: "#e8901f" },
      { at: [-62, 70, 42, 18], floors: 1, roof: "#6f6f72" },
      { at: [-14, 76, 16, 14], floors: 1, roof: "#7a4a38" },
      { at: [8, 76, 16, 14], floors: 1, roof: "#7a4a38" },
      // อาคารเอนกประสงค์ and the two small blocks by the first entrance
      { at: [42, 58, 22, 34], floors: 2, roof: "#33373f" },
      { at: [76, 34, 22, 18], floors: 2, roof: "#a9472f" },
      // north-east side: the blue roof, the long grey roof and โดม 99 ปี
      { at: [-30, -116, 44, 20], floors: 1, roof: "#2f8fd1" },
      { at: [30, -118, 72, 18], floors: 1, roof: "#8b8f94" },
      { at: [74, -86, 30, 22], floors: 1, roof: "#2f8fd1", open: true },
    ],
    // the white pavilion beside the flag, and the playground
    salas: [
      { at: [-34, 4, 11, 9], roof: "#e9e7e0" },
      { at: [80, 6, 12, 10], roof: "#d9482f" },
    ],
    trees: [
      ...row([-136, -100], [-136, -24], 5),
      ...row([-62, -102], [-40, -102], 2),
      ...row([-4, 44], [52, 44], 4),
      ...row([62, -60], [62, 22], 5),
      ...row([108, -54], [108, 20], 4),
      ...row([-62, 12], [-62, 40], 2),
    ],
    treeSize: 0.55,
    flag: [-30, -12],
    sign: [74, 86, 34, 5],
  },
};
