import { useEffect, useRef, useState } from "react";
import { survey } from "@/content";

/** the survey averages as bars that grow when the chart scrolls into view */
export function SurveyChart() {
  const box = useRef<HTMLElement>(null);
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    const seen = new IntersectionObserver(
      (entries) => {
        // grows again on the next visit; of changes arriving together the last is the present one
        setGrown(entries[entries.length - 1].isIntersecting);
      },
      { threshold: 0.25 },
    );
    seen.observe(box.current!);
    return () => seen.disconnect();
  }, []);

  return (
    <figure ref={box} className={`survey ${grown ? "is-grown" : ""}`}>
      <h3>{survey.title}</h3>
      <ol>
        {survey.items.map((item, i) => (
          <li key={item.label}>
            <span>{item.label}</span>
            <b>{item.mean.toFixed(2)}</b>
            {/* the full track is the top score of 5 */}
            <i aria-hidden="true">
              <i style={{ width: `${(item.mean / 5) * 100}%`, transitionDelay: `${i * 0.12}s` }} />
            </i>
          </li>
        ))}
      </ol>
      <figcaption>{survey.note}</figcaption>
    </figure>
  );
}
