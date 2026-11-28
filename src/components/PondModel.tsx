import { PondBackdrop } from "@/components/PondScene";

/** a drawing of the pond the IS project studied, from the viewpoint of a photograph */
export function PondModel() {
  return (
    <figure className="pond">
      <div className="pond-view" role="img" aria-label="ภาพวาดอาคาร สะพาน และสระน้ำบริเวณเกาะลอย">
        <PondBackdrop />
      </div>
      <figcaption>ภาพวาดจำลองสระน้ำบริเวณเกาะลอยจากโครงงาน IS</figcaption>
    </figure>
  );
}
