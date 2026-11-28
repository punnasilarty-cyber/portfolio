// แรงโน้มถ่วงของ “ควบคุมจักรวาล”: ดาวฤกษ์อยู่กับที่ ดาวเคราะห์โคจรตามแรงดึงของดาวฤกษ์ทุกดวง

export type Star = { x: number; y: number; mass: number };
export type Planet = { x: number; y: number; vx: number; vy: number; hue: number; trail: [number, number][] };

/** the pull of gravity in this little universe: pixels, seconds and star masses */
export const G = 900_000;
export const STAR_RADIUS = 14;
export const MAX_STARS = 8;
export const MAX_PLANETS = 40;
const TRAIL = 160; // points of tail kept behind each planet

/** the speed that keeps a planet circling a lone star at this distance */
export const orbitSpeed = (mass: number, distance: number) => Math.sqrt((G * mass) / distance);

/** moves the planets on by dt seconds, in small steps so close passes stay steady; those that hit a star or drift far away are gone */
export function advance(stars: Star[], planets: Planet[], dt: number, width: number, height: number) {
  const steps = Math.max(1, Math.ceil(dt / 0.004));
  const h = dt / steps;
  const gone = new Set<Planet>();
  for (let n = 0; n < steps; n++) {
    for (const planet of planets) {
      if (gone.has(planet)) continue;
      for (const star of stars) {
        const [dx, dy] = [star.x - planet.x, star.y - planet.y];
        const distance = Math.hypot(dx, dy);
        if (distance < STAR_RADIUS) {
          gone.add(planet);
          break;
        }
        const pull = (G * star.mass * h) / distance ** 3;
        planet.vx += dx * pull;
        planet.vy += dy * pull;
      }
      planet.x += planet.vx * h;
      planet.y += planet.vy * h;
    }
  }
  return planets.filter((planet) => {
    if (gone.has(planet) || Math.abs(planet.x - width / 2) > width * 2 || Math.abs(planet.y - height / 2) > height * 2) return false;
    planet.trail.push([planet.x, planet.y]);
    if (planet.trail.length > TRAIL) planet.trail.shift();
    return true;
  });
}

/** a ready-made system: one star in the middle and four planets on round orbits */
export function sample(width: number, height: number) {
  const star: Star = { x: width / 2, y: height / 2, mass: 1 };
  const reach = Math.min(width, height) / 2;
  const planets: Planet[] = [0.28, 0.46, 0.66, 0.86].map((part, i) => {
    const distance = reach * part;
    const angle = i * 2.2;
    const speed = orbitSpeed(star.mass, distance);
    return { x: star.x + Math.cos(angle) * distance, y: star.y + Math.sin(angle) * distance, vx: -Math.sin(angle) * speed, vy: Math.cos(angle) * speed, hue: 190 + i * 45, trail: [] };
  });
  return { stars: [star], planets };
}
