// ภาพวาดบริเวณเกาะลอยจากมุมเดียวกับภาพถ่าย วาดขึ้นเอง พิกัดเทียบกรอบภาพ 1000 x 666
import { memo } from "react";

export const VIEW_BOX = "0 0 1000 666";
const WATERLINE = 468;
const range = (count: number) => Array.from({ length: count }, (_, i) => i);

/** a repeatable 0–1 number from integers only, so the server and the browser draw the same leaves */
function chance(n: number) {
  let h = Math.imul(n ^ 0x5bd1e995, 0x27d4eb2d);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  return ((h ^ (h >>> 13)) >>> 0) / 4294967296;
}

/** the long white building: a low gable roof, an arched gallery, and a side that runs away to the right */
function Hall() {
  const arches = [530, 568, 606, 642, 677, 712, 747, 782, 818];
  return (
    <g>
      <path d="M505 268 636 200 850 216 857 424 505 424Z" fill="url(#pond-wall)" />
      <path d="M850 216 950 298 948 410 857 424Z" fill="url(#pond-side)" />
      {/* roof slab with its parapet, and the shadow it throws */}
      <path d="M481 252 634 184 636 172 651 172 651 185 853 202 957 291V303L850 224 636 207 486 270Z" fill="#e8e5da" />
      <path d="M486 270 636 207 850 224 957 303V311L850 235 636 218 496 276Z" fill="#6f6c61" opacity="0.36" />
      <path d="M481 252 634 184M651 185 853 202 957 291" fill="none" stroke="#fffef8" strokeWidth="2.2" />
      <path d="M690 192q40 6 90 7l30 8" stroke="#77736a" strokeWidth="5" opacity="0.35" fill="none" />
      {range(7).map((i) => (
        <path key={i} d={`M${862 + i * 13} ${232 + i * 10.7}l-12 16`} stroke="#d4d0c3" strokeWidth="5" />
      ))}
      <rect x="755" y="262" width="17" height="25" fill="#b8623c" />
      <path d="M760 262v25M755 274h17" stroke="#8f4527" strokeWidth="1.5" />
      <rect x="556" y="284" width="9" height="22" fill="#a8603f" opacity="0.8" />
      {range(8).map((i) => (
        <path key={i} d={`M${827 + i * 15} ${242 + i * 10}l9 7v${34 - i * 2}l-9-4Z`} fill="url(#pond-glass)" />
      ))}
      {/* upper floor line, arches and railing */}
      <path d="M505 308 640 300 857 297 952 340" fill="none" stroke="#fbf9f0" strokeWidth="6" />
      <path d="M505 313 857 303 952 345" fill="none" stroke="#8b877a" strokeWidth="2.5" opacity="0.45" />
      {arches.map((x) => (
        <path key={x} d={`M${x - 14} 362v-35a14 17 0 0 1 28 0v35Z`} fill="url(#pond-arch)" stroke="#fffdf4" strokeWidth="3.5" />
      ))}
      {[781, 819, 645].map((x) => (
        <rect key={x} x={x - 8} y="330" width="14" height="30" fill="#4d584f" opacity="0.7" />
      ))}
      {range(8).map((i) => (
        <path key={i} d={`M${860 + i * 11.5} ${362 - i * 1}v${-52 + i * 4.5}a${(4.6 - i * 0.25).toFixed(2)} 9 0 0 1 ${(9.2 - i * 0.5).toFixed(1)} ${i < 4 ? 2 : 3}v${50 - i * 4.5}Z`} fill="url(#pond-arch)" stroke="#f1eee2" strokeWidth="1.6" />
      ))}
      <path d="M505 342H850l105 4v5l-105-5H505Z" fill="#fffef9" />
      <path d="M505 354H850l105 3" fill="none" stroke="#eeebdf" strokeWidth="15" strokeDasharray="2.4 3.6" />
      <path d="M505 362H852l104-3v12l-104 8H505Z" fill="#f5f2e8" />
      <path d="M505 376H852l104-6v10l-104 10H505Z" fill="#39403e" opacity="0.36" />
      {/* ground floor: shutters and window grids between columns */}
      {[
        [545, 24, "door"],
        [576, 16, "door"],
        [650, 24, "door"],
        [690, 46, "glass"],
        [760, 54, "glass"],
        [826, 26, "door"],
      ].map(([x, w, kind]) => (
        <g key={x}>
          <rect x={x as number} y="382" width={w as number} height="34" fill={`url(#pond-${kind})`} />
          <path d={range(Math.floor((w as number) / 8)).map((i) => `M${(x as number) + 4 + i * 8} 382v34`).join("") + `M${x} 394h${w}`} stroke="#d8d6ca" strokeWidth="1.1" />
        </g>
      ))}
      {[538, 570, 596, 678, 745, 818, 856].map((x) => (
        <rect key={x} x={x} y="376" width="7" height="46" fill="url(#pond-column)" />
      ))}
      {/* the outside stairs, two flights */}
      <path d="M600 384 640 352H652L612 384Z" fill="#fbf9f0" />
      <path d="M612 376h26l32 44h-18l-28-36h-12Z" fill="#fbf9f0" />
      <path d="M600 372 636 344M640 366l32 46" stroke="#e8e5da" strokeWidth="2.5" />
      <path d="M601 378 639 348M626 372l36 46" stroke="#c9c5b6" strokeWidth="9" strokeDasharray="1.6 4" />
      <rect x="545" y="416" width="320" height="9" fill="#9c4f37" />
      <rect x="505" y="425" width="450" height="45" fill="#78827a" />
    </g>
  );
}

/** the pavilion with the green roof and its two white gables */
function Pavilion() {
  const windows = (list: number[][]) =>
    list.map(([x, y, w, h]) => (
      <g key={x}>
        <rect x={x} y={y} width={w} height={h} fill="url(#pond-louvre)" stroke="#fbfbf5" strokeWidth="2" />
        <path d={range(Math.floor(w / 7)).map((i) => `M${x + 6 + i * 7} ${y}v${h}`).join("") + `M${x} ${y + h * 0.3}h${w}M${x} ${y + h * 0.66}h${w}`} stroke="#e9ede5" strokeWidth="0.9" />
      </g>
    ));
  return (
    <g>
      <path d="M255 366 350 364 541 372 542 450 350 452 256 448Z" fill="url(#pond-wall)" />
      <path d="M255 366 350 364V452L256 448Z" fill="#dfe3dc" />
      {windows([
        [263, 370, 26, 54],
        [294, 370, 22, 54],
        [360, 370, 27, 56],
        [392, 370, 36, 56],
        [464, 372, 20, 52],
        [515, 373, 22, 50],
      ])}
      <rect x="490" y="394" width="22" height="56" fill="url(#pond-door)" stroke="#fff" strokeWidth="2" />
      <path d="M501 394v56" stroke="#e6efe9" />
      {[255, 322, 347, 457, 540].map((x) => (
        <rect key={x} x={x - 3} y="364" width="7" height="87" fill="url(#pond-column)" />
      ))}
      <path d="M255 368 350 365 541 373v9L350 375 256 378Z" fill="#33403a" opacity="0.3" />
      {/* roof: the front slope, the darker valley between the gables, and the tile seams */}
      <path d="M255 349 287 237 301 239 472 283 495 306 526 356 406 353 346 350Z" fill="url(#pond-roof)" />
      <path d="M299 241 452 281 405 348 349 344Z" fill="#0f8e73" />
      {range(15).map((i) => (
        <path key={i} d={`M${306 + i * 10} ${(243 + i * 2.7).toFixed(1)}L${(352 + i * 4).toFixed(1)} ${(344 + i * 0.3).toFixed(1)}`} stroke="#06503f" strokeWidth="0.9" opacity="0.4" />
      ))}
      <path d="M299 240 472 283 495 306" fill="none" stroke="#86e6cf" strokeWidth="2.5" />
      <path d="M257 346 290 249 347 343Z" fill="url(#pond-gable)" stroke="#149c80" strokeWidth="7" strokeLinejoin="round" />
      <path d="M284 273 292 259 297 274Z" fill="#aaa699" />
      <path d="M406 347 466 288 490 352Z" fill="url(#pond-gable)" stroke="#17a888" strokeWidth="6" strokeLinejoin="round" />
      <path d="M216 354 255 349 346 347 576 361V372L540 373 346 363 255 366 216 369Z" fill="#fbfaf4" />
      <path d="M216 369 255 366 346 363 540 373 576 372v3l-36 3-194-10-91 3-39 2Z" fill="#59625a" opacity="0.4" />
    </g>
  );
}

/** the stone island the pavilion stands on */
function Island() {
  return (
    <g>
      <path d="M180 448Q240 442 262 446H552L558 458Q470 474 380 474 250 470 180 460Z" fill="url(#pond-lawn)" />
      <path d="M180 459Q270 474 400 474L558 456 580 474 520 492Q400 500 300 497L200 486Z" fill="#4d4e47" />
      {range(120).map((i) => {
        const x = 190 + chance(i) * 378;
        const y = 472 + chance(i + 500) * 20 + (x > 240 && x < 520 ? 3 : -3);
        const r = 3 + chance(i + 900) * 6.5;
        return (
          <g key={i}>
            <ellipse cx={x.toFixed(1)} cy={y.toFixed(1)} rx={r.toFixed(1)} ry={(r * 0.6).toFixed(1)} fill={["#6c6b62", "#84837a", "#a09e92", "#55554d"][i % 4]} />
            <ellipse cx={(x - r * 0.25).toFixed(1)} cy={(y - r * 0.2).toFixed(1)} rx={(r * 0.5).toFixed(1)} ry={(r * 0.22).toFixed(1)} fill="#fff" opacity="0.18" />
          </g>
        );
      })}
    </g>
  );
}

/** the grey wooden bridge from the island to the right bank */
function Bridge() {
  return (
    <g>
      {[582, 690, 776, 822, 910, 976].map((x) => (
        <g key={x}>
          <rect x={x} y="458" width="11" height="34" fill="#585349" />
          <rect x={x} y="458" width="3.5" height="34" fill="#8d877b" />
        </g>
      ))}
      <path d="M553 424 1000 418v40L553 450Z" fill="#35403d" opacity="0.62" />
      <path d="M553 448 1000 451v13L553 460Z" fill="url(#pond-deck)" />
      <path d="M553 425 1000 419M553 431 1000 426" stroke="#dcdad2" strokeWidth="3" />
      {range(48).map((i) => (
        <path key={i} d={`M${(556 + i * 9.4).toFixed(1)} ${(426 - i * 0.12).toFixed(1)}v${24 + (i % 2)}`} stroke="#cbc8bf" strokeWidth="2.2" />
      ))}
      {[553, 640, 740, 815, 890, 966].map((x) => (
        <rect key={x} x={x - 2} y="417" width="6" height="37" fill="#e6e3da" />
      ))}
    </g>
  );
}

/** everything standing above the water, drawn once more upside down as its reflection */
function Scenery() {
  return (
    <g id="pond-scenery">
      <Hall />
      <Pavilion />
      <Bridge />
      <Island />
    </g>
  );
}

/** a gradient running down, or across */
function Ramp({ id, stops, across = false }: { id: string; stops: string[]; across?: boolean }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2={across ? "1" : "0"} y2={across ? "0" : "1"}>
      {stops.map((color, i) => (
        <stop key={i} offset={i / (stops.length - 1)} stopColor={color} />
      ))}
    </linearGradient>
  );
}

/**
 * The still picture with clear water. It never changes, so the browser draws its leaves and ripples once;
 * whatever moves lives in the layer on top (see PondModel).
 */
export const PondBackdrop = memo(function PondBackdrop() {
  return (
    <svg viewBox={VIEW_BOX} aria-hidden="true" className="pond-art">
      <defs>
        <Ramp id="pond-sky" stops={["#2d69bf", "#5a9bdc", "#a8d0ee", "#dcedf5"]} />
        <Ramp id="pond-clear" stops={["#a8c9c8", "#c4dfdc", "#7db5b0", "#4f8f8a"]} />
        <Ramp id="pond-wall" stops={["#fffdf5", "#f4f1e6", "#e0dccd"]} />
        <Ramp id="pond-side" stops={["#d2cfc3", "#e6e3d8", "#c6c2b4"]} across />
        <Ramp id="pond-arch" stops={["#8a8470", "#c8bea2", "#ece3cb"]} />
        <Ramp id="pond-glass" stops={["#3a4a50", "#718c94", "#46606a"]} />
        <Ramp id="pond-louvre" stops={["#8fa0a0", "#5f7576", "#4a5f62"]} />
        <Ramp id="pond-door" stops={["#35806c", "#7cc0ab", "#468f7d"]} />
        <Ramp id="pond-column" stops={["#ffffff", "#f1efe5", "#cbc8ba"]} across />
        <Ramp id="pond-roof" stops={["#2ed0ac", "#18ad8d", "#12957a"]} />
        <Ramp id="pond-gable" stops={["#ffffff", "#ecebe0"]} />
        <Ramp id="pond-lawn" stops={["#7fa649", "#40622b"]} />
        <Ramp id="pond-deck" stops={["#a39c8f", "#575248"]} />
        <Ramp id="pond-trunk" stops={["#5a472f", "#b09670", "#756044"]} across />
        {/* breaks the reflection into ripples */}
        <filter id="pond-ripples" x="0" y={WATERLINE} width="1000" height={666 - WATERLINE} filterUnits="userSpaceOnUse">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.1" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="15" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation="0.7 1" />
        </filter>
        <clipPath id="pond-below">
          <rect y={WATERLINE} width="1000" height={666 - WATERLINE} />
        </clipPath>
      </defs>

      <rect width="1000" height={WATERLINE} fill="url(#pond-sky)" />
      <rect y={WATERLINE} width="1000" height={666 - WATERLINE} fill="url(#pond-clear)" />
      <g clipPath="url(#pond-below)">
        <g filter="url(#pond-ripples)" opacity="0.72">
          <use href="#pond-scenery" transform={`translate(0 ${WATERLINE * 2 + 22}) scale(1 -1)`} />
        </g>
        {range(60).map((i) => {
          const depth = chance(i + 40);
          const y = WATERLINE + 28 + depth * (620 - WATERLINE);
          return <path key={i} d={`M${(chance(i + 110) * 960).toFixed(1)} ${y.toFixed(1)}h${(12 + depth * 66 * chance(i + 70)).toFixed(1)}`} stroke={i % 3 ? "#f2feff" : "#12484a"} strokeWidth={(0.8 + depth * 1.6).toFixed(1)} strokeLinecap="round" opacity="0.28" />;
        })}
      </g>
      <Scenery />

    </svg>
  );
});
