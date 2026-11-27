// ฉากโรงเรียนจำลองแบบไอโซเมตริก วาดด้วย SVG ล้วน ผังและที่มาอยู่ใน school-layouts.ts
import { paintOrder } from "./iso";
import { LAYOUTS, type Building, type Rect, type Spot } from "./school-layouts";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const COS = Math.cos(Math.PI / 6);
const CREAM = "#ece6d4";

/** x runs down to the right, y down to the left, z straight up */
const iso = (x: number, y: number, z = 0) => `${((x - y) * COS).toFixed(1)},${((x + y) / 2 - z).toFixed(1)}`;
const face = (...corners: [number, number, number?][]) => corners.map(([x, y, z]) => iso(x, y, z)).join(" ");
/** a flat rectangle on the ground or at height z */
const slab = ([x, y, w, d]: Rect, z = 0) => face([x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z]);
/** an upright rectangle on the wall facing south (at depth y) */
const south = (x: number, w: number, y: number, low: number, high: number) => face([x, y, low], [x + w, y, low], [x + w, y, high], [x, y, high]);
/** an upright rectangle on the wall facing east (at x) */
const east = (y: number, d: number, x: number, low: number, high: number) => face([x, y, low], [x, y + d, low], [x, y + d, high], [x, y, high]);
/** lays flat artwork onto a wall that runs along x at depth y: its (0,0) lands on the given point */
const onWall = (x: number, y: number, z: number) => `matrix(${COS} 0.5 0 1 ${iso(x, y, z).replace(",", " ")})`;
/** the same for a wall facing east, which runs along y */
const onEast = (x: number, y: number, z: number) => `matrix(${COS} -0.5 0 1 ${iso(x, y, z).replace(",", " ")})`;
const shade = (amount: number) => ({ filter: `brightness(${amount})` });

function Box({ at: [x, y, w, d], z = 0, h, color }: { at: Rect; z?: number; h: number; color: string }) {
  // one colour, lit from the left: the walls are shaded from it
  return (
    <g fill={color} stroke="rgba(0,0,0,0.25)" strokeWidth="0.4">
      <polygon points={south(x, w, y + d, z, z + h)} />
      <polygon points={east(y, d, x + w, z, z + h)} style={shade(0.72)} />
      <polygon points={slab([x, y, w, d], z + h)} style={shade(1.1)} />
    </g>
  );
}

/** evenly spaced window starts along a wall */
const bays = (from: number, length: number, wide: number) => {
  const count = Math.max(1, Math.floor((length - wide * 0.5) / (wide * 1.55)));
  const gap = (length - count * wide) / (count + 1);
  return Array.from({ length: count }, (_, i) => from + gap + i * (wide + gap));
};

function Roof({ at: [x, y, w, d], eaves, rise, roof, vault }: { at: Rect; eaves: number; rise: number; roof: string; vault?: string[] }) {
  const [x1, y1] = [x + w, y + d];
  const alongX = w >= d;
  if (vault) {
    const arc = Array.from({ length: 7 }, (_, i) => (Math.PI * i) / 6);
    // half-cylinder along the longer side, cut in as many colours as given, north (or west) first
    const parts = vault.map((color, p) => ({ color, from: p / vault.length, to: (p + 1) / vault.length }));
    const point = (t: number, along: number): [number, number, number] => {
      const across = (1 - Math.cos(t)) / 2;
      const z = eaves + Math.sin(t) * rise * 1.4;
      return alongX ? [x + w * along, y + d * across, z] : [x + w * across, y + d * along, z];
    };
    return (
      <g stroke="rgba(0,0,0,0.25)" strokeWidth="0.3">
        {parts.map(({ color, from, to }) => (
          <g key={from} fill={color}>
            {arc.slice(0, -1).map((a, i) => (
              <polygon key={i} points={face(point(a, from), point(a, to), point(arc[i + 1], to), point(arc[i + 1], from))} style={shade(alongX ? 0.7 + i * 0.07 : 1.08 - i * 0.07)} />
            ))}
          </g>
        ))}
        <polygon points={face(...arc.map((t) => point(t, 1)))} fill={parts[parts.length - 1].color} style={shade(0.78)} />
      </g>
    );
  }
  // a hipped roof with its ridge along the longer side
  const eave = Math.min(w, d) * 0.12;
  const inset = Math.min(w, d) * 0.45;
  const [a, b]: [number, number, number][] = alongX
    ? [[x + inset, y + d / 2, eaves + rise], [x1 - inset, y + d / 2, eaves + rise]]
    : [[x + w / 2, y + inset, eaves + rise], [x + w / 2, y1 - inset, eaves + rise]];
  const nw: [number, number, number] = [x - eave, y - eave, eaves];
  const ne: [number, number, number] = [x1 + eave, y - eave, eaves];
  const se: [number, number, number] = [x1 + eave, y1 + eave, eaves];
  const sw: [number, number, number] = [x - eave, y1 + eave, eaves];
  return (
    <g fill={roof} stroke="rgba(0,0,0,0.3)" strokeWidth="0.4">
      <polygon points={alongX ? face(nw, ne, b, a) : face(nw, sw, b, a)} style={shade(0.8)} />
      <polygon points={alongX ? face(ne, se, b) : face(ne, se, b, a)} style={shade(0.68)} />
      <polygon points={alongX ? face(sw, se, b, a) : face(sw, se, b)} />
    </g>
  );
}

function Block({ at, floors, roof, wall = CREAM, band = "#fffdf6", vault, open, pilotis, towers = [], storey, trim, main }: Building & { storey: number; trim: string }) {
  const [x, y, w, d] = at;
  const [x1, y1] = [x + w, y + d];
  const height = floors === 1 ? storey * 1.4 : storey;
  const eaves = floors * height;
  const rise = Math.min(Math.min(w, d) * 0.4, storey * 1.2);
  const pane = Math.min(storey * 0.55, 9);

  if (open) {
    // columns along the two near sides hold the roof up
    const posts: Spot[] = [...bays(x, w, w / 7).map((px): Spot => [px, y1]), ...bays(y, d, d / 7).map((py): Spot => [x1, py])];
    return (
      <g>
        <g className="sc-floor">
          <polygon points={slab(at)} fill="#8d8a82" />
          {posts.map(([px, py]) => (
            <path key={`${px},${py}`} d={`M${iso(px, py)}L${iso(px, py, eaves)}`} stroke="#d6d3c8" strokeWidth="1.1" />
          ))}
        </g>
        <g className="sc-roof">
          <Roof at={at} eaves={eaves} rise={rise} roof={roof} vault={vault} />
        </g>
      </g>
    );
  }

  return (
    <g>
      {Array.from({ length: floors }, (_, floor) => {
        const [low, high] = [floor * height + height * 0.3, floor * height + height * 0.82];
        if (pilotis && floor === 0) {
          // columns carry the floors above, with a shadowed hall behind them
          return (
            <g key={floor} className="sc-floor">
              <Box at={[x, y, w * 0.72, d]} h={height} color="#3b3a36" />
              {[...bays(x, w, w / 8).map((px): Spot => [px, y1]), ...bays(y, d, 2).map((py): Spot => [x1, py])].map(([px, py]) => (
                <path key={`${px},${py}`} d={`M${iso(px, py)}L${iso(px, py, height)}`} stroke={wall} strokeWidth="1.8" />
              ))}
            </g>
          );
        }
        return (
          <g key={floor} className="sc-floor">
            <Box at={at} z={floor * height} h={height} color={wall} />
            {bays(x, w, pane).map((p) => (
              <polygon key={p} points={south(p, pane, y1, low, high)} fill="#52767d" />
            ))}
            {bays(y, d, pane).map((p) => (
              <polygon key={p} points={east(p, pane, x1, low, high)} fill="#3d5c63" />
            ))}
            {/* the open corridor's rail on both near walls; the school's colour marks the ground floor */}
            <polygon points={south(x, w, y1, floor * height, floor * height + height * 0.22)} fill={floor === 0 ? trim : band} />
            <polygon points={east(y, d, x1, floor * height, floor * height + height * 0.22)} fill={floor === 0 ? trim : band} style={shade(0.78)} />
          </g>
        );
      })}
      {towers.map((share) => {
        const tower: Rect = [x + w * share, y1, w * 0.07, 3];
        return (
          <g key={share} className="sc-floor">
            <Box at={tower} h={eaves + 1} color="#f1dc9a" />
            {Array.from({ length: floors }, (_, floor) => (
              <polygon key={floor} points={south(tower[0] + tower[2] * 0.2, tower[2] * 0.6, y1 + 3, floor * height + height * 0.35, floor * height + height * 0.8)} fill="#52767d" />
            ))}
          </g>
        );
      })}
      {main && floors >= 4 && (
        <g className="sc-door">
          {/* the long name board across the front */}
          <polygon points={south(x + w * 0.34, w * 0.34, y1 + 0.2, eaves - height * 1.12, eaves - height * 0.86)} fill="#f2c41b" />
        </g>
      )}
      <g className="sc-roof">
        <Roof at={at} eaves={eaves} rise={rise} roof={roof} vault={vault} />
      </g>
    </g>
  );
}

/** a small Thai pavilion: four posts under a steep gable */
function Sala({ at: [x, y, w, d], roof }: { at: Rect; roof: string }) {
  const [x1, y1, eaves, top] = [x + w, y + d, 8, 19];
  return (
    <g className="sc-pop-box">
      <Box at={[x, y, w, d]} h={2} color="#d8cdb4" />
      {[[x1, y], [x1, y1], [x, y1]].map(([px, py]) => (
        <path key={`${px},${py}`} d={`M${iso(px, py, 2)}L${iso(px, py, eaves)}`} stroke="#7c4a21" strokeWidth="1.1" />
      ))}
      <g fill={roof} stroke="#f2c41b" strokeWidth="0.5">
        <polygon points={face([x - 2, y - 2, eaves], [x1 + 2, y - 2, eaves], [x1, y + d / 2, top], [x, y + d / 2, top])} style={shade(0.75)} />
        <polygon points={face([x1 + 2, y - 2, eaves], [x1 + 2, y1 + 2, eaves], [x1, y + d / 2, top + 2])} style={shade(0.85)} />
        <polygon points={face([x - 2, y1 + 2, eaves], [x1 + 2, y1 + 2, eaves], [x1, y + d / 2, top], [x, y + d / 2, top])} />
      </g>
    </g>
  );
}

function Tree({ at: [x, y], size }: { at: Spot; size: number }) {
  const [cx, cy] = iso(x, y).split(",").map(Number);
  return (
    <g transform={`translate(${cx} ${cy}) scale(${size})`}>
      <g className="sc-pop">
        <ellipse rx="11" ry="5" fill="rgba(0,0,0,0.3)" />
        <rect x="-1.5" y="-13" width="3" height="13" fill="#7c4a21" />
        <circle cy="-19" r="10" fill="#15803d" />
        <circle cx="-6" cy="-15" r="6.5" fill="#16a34a" />
        <circle cx="5" cy="-23" r="6.5" fill="#22a04f" />
      </g>
    </g>
  );
}

export function SchoolScene({ school, logo, wall, trim }: { school: string; logo: string; wall: string; trim: string }) {
  const layout = LAYOUTS[school];
  if (!layout) return null;
  const { viewBox, ground, storey, roads = [], ponds = [], paving = [], field, buildings, salas = [], trees, treeSize, flag, sign } = layout;
  const [fx, fy, fw, fd] = field;
  const hall = buildings.find((building) => building.main)!;
  const [hx, hy, hw, hd] = hall.at;
  const emblem = Math.max(storey * 0.65, 5.5);
  const pole = storey * 5.6;
  const [sx, sy, sw, sd] = sign;
  const signHeight = sw * 0.26;

  const standing = paintOrder([
    ...buildings.map((building) => ({
      at: building.at,
      node: (
        <>
          <Block {...building} storey={storey} trim={trim} />
          {/* on whichever near wall is the long one */}
          {building.main && (
            <g className="sc-door" transform={hd > hw ? onEast(hx + hw + 0.4, hy + hd / 2, hall.floors * storey - storey * 0.45) : onWall(hx + hw / 2, hy + hd + 0.4, hall.floors * storey - storey * 0.45)}>
              <circle r={emblem} fill="#fff" stroke={trim} strokeWidth={emblem * 0.18} />
              <image href={base + logo} x={-emblem * 0.86} y={-emblem * 0.86} width={emblem * 1.72} height={emblem * 1.72} />
            </g>
          )}
        </>
      ),
    })),
    ...salas.map((sala) => ({ at: sala.at, node: <Sala {...sala} /> })),
    ...trees.map((at) => ({ at: [at[0] - 1, at[1] - 1, 2, 2] as Rect, node: <Tree at={at} size={treeSize} /> })),
    {
      at: [flag[0] - 3, flag[1] - 3, 6, 6] as Rect,
      node: (
        <g className="sc-flagpole">
          <path d={`M${iso(flag[0], flag[1])}L${iso(flag[0], flag[1], pole)}`} stroke="#e7e5e4" strokeWidth={storey > 10 ? 1.8 : 0.9} />
          <g className="sc-flag">
            <g transform={onWall(flag[0] + 0.5, flag[1], pole)}>
              {["#b91c1c", "#f5f5f4", "#1e3a8a", "#1e3a8a", "#f5f5f4", "#b91c1c"].map((color, i) => {
                const stripe = storey > 10 ? 3 : 1.5;
                return <rect key={i} y={i * stripe} width={stripe * 9} height={stripe + 0.1} fill={color} />;
              })}
            </g>
          </g>
        </g>
      ),
    },
    {
      at: sign,
      node: (
        <g className="sc-sign">
          <Box at={sign} h={signHeight} color={wall} />
          <g transform={onWall(sx + sw / 2, sy + sd + 0.2, signHeight / 2)}>
            <rect x={-sw * 0.46} y={-signHeight * 0.38} width={sw * 0.92} height={signHeight * 0.76} rx={sw * 0.02} fill="#fafaf9" />
            <text textAnchor="middle" y={sw * 0.04} fontSize={sw * 0.115} fontWeight="700" fill="#1c1917">
              {school.replace("โรงเรียน", "")}
            </text>
          </g>
        </g>
      ),
    },
  ]);

  return (
    <svg viewBox={viewBox} role="img" aria-label={`ผังจำลอง${school}`} className="edu-scene-art">
      <Box at={ground} z={-10} h={10} color="#55604a" />
      {roads.map((road) => (
        <polygon key={road.join()} points={slab(road)} fill="#3f4247" />
      ))}
      {ponds.map((pond) => (
        <polygon key={pond.join()} points={slab(pond)} fill="#33677a" stroke="#cfc9b8" strokeWidth="1" />
      ))}
      {paving.map(({ at, color }) => (
        <polygon key={at.join()} points={slab(at)} fill={color} />
      ))}
      {/* football field with its markings */}
      <polygon points={slab(field)} fill="#3b8a45" />
      <g fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={storey > 10 ? 1 : 0.6}>
        <polygon points={slab([fx + fw * 0.04, fy + fd * 0.05, fw * 0.92, fd * 0.9])} />
        <path d={`M${iso(fx + fw / 2, fy + fd * 0.05)}L${iso(fx + fw / 2, fy + fd * 0.95)}`} />
        <ellipse transform={`translate(${iso(fx + fw / 2, fy + fd / 2).replace(",", " ")})`} rx={fw * 0.12} ry={fw * 0.07} />
      </g>
      {standing.map(({ at, node }) => (
        <g key={at.join()}>{node}</g>
      ))}
    </svg>
  );
}
