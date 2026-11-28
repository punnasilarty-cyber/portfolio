// ชิ้นส่วนวาดภาพมุมสูงแบบ isometric ที่โมเดลใช้ร่วมกัน: x ไปขวาล่าง y ไปซ้ายล่าง z ขึ้นบน
const COS = Math.cos(Math.PI / 6);

export const point = (x: number, y: number, z = 0) => `${((x - y) * COS).toFixed(1)},${((x + y) / 2 - z).toFixed(1)}`;

export const shape = (corners: [number, number, number?][]) => corners.map(([x, y, z]) => point(x, y, z)).join(" ");

/** a flat patch lying at height z */
export function Slab({ at: [x, y, w, d], z = 0, ...paint }: { at: number[]; z?: number } & React.SVGProps<SVGPolygonElement>) {
  return <polygon points={shape([[x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z]])} {...paint} />;
}

/** a box: the top in its colour, the two faces toward the viewer darkened */
export function Box({ at: [x, y, w, d], z = 0, h, color }: { at: number[]; z?: number; h: number; color: string }) {
  const front = shape([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]]);
  const side = shape([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]]);
  return (
    <g>
      <polygon points={front} fill={color} />
      <polygon points={front} fill="#000" opacity="0.28" />
      <polygon points={side} fill={color} />
      <polygon points={side} fill="#000" opacity="0.45" />
      <Slab at={[x, y, w, d]} z={z + h} fill={color} />
    </g>
  );
}

/** moves a drawing to stand at a spot on the ground */
export function At({ x, y, z = 0, children }: { x: number; y: number; z?: number; children: React.ReactNode }) {
  const [sx, sy] = point(x, y, z).split(",");
  return <g transform={`translate(${sx} ${sy})`}>{children}</g>;
}
