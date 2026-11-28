// ผังของแต่ละโรงเรียนในพิกัดของฉาก: x ไปทางทิศตะวันออก y ไปทางทิศใต้ (ด้านหน้าติดถนน)
//
// สุรวิทยาคาร: ตำแหน่งอาคารตามแผนผังโรงเรียน สี หลังคา แผงโซลาร์ รั้ว ป้าย และต้นไม้ตามภาพมุมสูงรอบโรงเรียน
// (ภาพที่เจ้าของเว็บให้มา) อาคารที่เห็นไม่ชัดในภาพ จำนวนชั้นและสีเป็นการประมาณ
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
  /** เลขอาคารบนหอบันได */
  number?: string;
  /** แผงโซลาร์บนหลังคาด้านใต้ */
  solar?: boolean;
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
  /** แท่นหน้าเสาธง */
  podium?: string;
  sign: Rect;
  /** ป้ายหน้าประตูแบบแผ่นดำตัวอักษรทอง มีเสาขาว */
  gate?: boolean;
  /** ต้นปาล์ม และปาล์มใบสีเงิน */
  palms?: Spot[];
  silverPalms?: Spot[];
  /** รั้วด้านทิศตะวันตกและด้านหน้า [x, y, กว้าง, ลึก] */
  fences?: Rect[];
  /** เสาประตูฟุตบอลที่ปลายสนามด้านตะวันตกและตะวันออก */
  goals?: boolean;
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
      [-102, 81, 99, 17],
      [-71, -96, 54, 36],
    ],
    paving: [
      // the red walk along the north of the stadium, and the garden and forecourt by the front gate
      { at: [-62, -9, 90, 5], color: "#b0503c" },
      { at: [-1, 78, 29, 22], color: "#57a05a" },
      { at: [8, 62, 21, 8], color: "#cfc7b6" },
      // the island in the back pond and the white footbridges to it
      { at: [-52, -86, 16, 14], color: "#57a05a" },
      { at: [-46, -72, 3, 19], color: "#e8e6df" },
      { at: [-36, -80, 14, 3], color: "#e8e6df" },
    ],
    field: [-62, -2, 90, 64],
    goals: true,
    buildings: [
      // อาคารศรีสุระ ห้องสมุด และโรงอาหาร
      { at: [-127, -93, 40, 22], floors: 3, roof: "#9b9ea1", wall: "#eef0ec" },
      { at: [-127, -66, 40, 20], floors: 1, roof: "#c3d394", vault: ["#c3d394"] },
      // อาคาร 1 เอกอมรินทร์ (หลังคาแดง) และอาคาร 7 อมเรศธำรง
      { at: [-81, -53, 74, 14], floors: 4, roof: "#a95a5c", wall: "#dfe6d8", band: MINT_BAND },
      { at: [-81, -34, 83, 15], floors: 4, roof: MINT, wall: "#d8ddd6", band: MINT_BAND, main: true, pilotis: true, towers: [0.17, 0.76], number: "๗" },
      // หอประชุมรวมน้ำใจ และหอประชุมสุรวิทยาคาร
      { at: [-22, -86, 40, 24], floors: 2, roof: "#a5e0dc", wall: "#eabc9d" },
      { at: [9, -56, 17, 37], floors: 2, roof: "#9fdcd3" },
      // ฝั่งตะวันตก: โดมอุตสาหกรรม อุตสาหกรรม 2 พลศึกษา ยิม อาคาร 100 ปี อาคารดนตรี และโดมพลศึกษา
      { at: [-134, -22, 42, 19], floors: 1, roof: "#4fcaa4", vault: ["#4fcaa4"] },
      { at: [-134, 1, 42, 15], floors: 1, roof: "#8f8a85", wall: "#e59a6e" },
      { at: [-134, 19, 42, 16], floors: 1, roof: "#7fab90", vault: ["#7fab90", "#4fcaa4"] },
      { at: [-116, 39, 24, 29], floors: 2, roof: "#74cec3", vault: ["#74cec3"] },
      { at: [-134, 78, 15, 21], floors: 3, roof: "#8a5a48", wall: "#b4dcb8" },
      { at: [-117, 83, 12, 14], floors: 1, roof: "#78b2e6", wall: "#a9cdee" },
      { at: [-89, -8, 24, 74], floors: 2, roof: "#f4c61e", vault: ["#f4c61e", "#b9e2e4"], open: true },
      // ฝั่งตะวันออก: อาคาร 6, 2, โดมอาคาร 2, 3, 4, 84 ปี, 5 และอาคาร 111 ปี
      { at: [41, -92, 70, 14], floors: 4, roof: "#ee7c30", wall: "#f5f3ec" },
      { at: [41, -54, 70, 14], floors: 4, roof: "#9bdcdc", wall: "#bdd7ea", solar: true },
      { at: [41, -36, 70, 14], floors: 2, roof: "#6f93a6", vault: ["#6f93a6"], open: true },
      { at: [50, -18, 61, 15], floors: 4, roof: "#a3dfdc", wall: "#eef0ec", solar: true },
      { at: [50, 13, 61, 14], floors: 4, roof: "#a3dfdc", wall: "#e8bab6", solar: true },
      { at: [50, 36, 30, 14], floors: 2, roof: "#b7e3df", wall: "#ecc3a6", solar: true },
      { at: [51, 56, 77, 14], floors: 3, roof: "#a9a9a6", wall: "#ecc9b2", solar: true },
      { at: [116, -38, 11, 42], floors: 2, roof: "#7fa8d8" },
      // โรงจอดรถจักรยานยนต์ หลังคาโค้งสีเขียว
      { at: [54, 83, 74, 13], floors: 1, roof: "#86c48c", vault: ["#86c48c"], open: true },
    ],
    salas: [
      // อัฒจันทร์ลูกพระอินทร์ ศาลาในสวนหน้าประตู ซุ้มหลังคาเขียว เรือนไทยข้างประตู และศาลาบนเกาะ
      { at: [-38, 65, 18, 9], roof: "#bd5b3a" },
      { at: [-2, 80, 9, 8], roof: "#d2502c" },
      { at: [12, 62, 7, 6], roof: "#239c82" },
      { at: [21, 62, 7, 6], roof: "#239c82" },
      { at: [40, 83, 11, 10], roof: "#d4682f" },
      { at: [-49, -83, 10, 8], roof: "#1fae8c" },
    ],
    trees: [
      ...row([-72, -12], [-60, -12], 3),
      ...row([-40, -12], [-34, -12], 2),
      ...row([-28, -12], [24, -12], 7),
      ...row([-58, 66], [-46, 66], 3),
      ...row([-12, 66], [2, 66], 3),
      ...row([40, -72], [104, -72], 6),
      ...row([40, 7], [40, 31], 3),
      ...row([46, 75], [118, 75], 6),
    ],
    palms: [
      ...row([-96, 78.5], [-14, 78.5], 8),
      ...row([-3, 91], [7, 91], 2),
    ],
    silverPalms: [
      [-5, 71],
      [3, 73],
      [44, -62.5],
      [60, -62.5],
      [76, -62.5],
    ],
    treeSize: 0.42,
    flag: [-50, -13],
    podium: "#d98a6a",
    sign: [1, 95, 25, 3],
    gate: true,
    fences: [
      [-136.5, -102, 0.8, 204],
      [-137, 101, 147, 0.8],
      [39, 101, 96, 0.8],
    ],
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
