// หน้าต่างและรูปภาพที่ขยายออกจากการ์ดต้นทาง แล้วหดกลับเมื่อปิด
const timing = { duration: 420, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" };
const still = () => !!document.querySelector<HTMLInputElement>("#calm")?.checked;

/** moves a window between its card and its own place; nothing when animation is stopped */
export function grow(dialog: HTMLDialogElement, from: Element | null | undefined, back = false) {
  if (!from || still()) return;
  const card = from.getBoundingClientRect();
  const open = dialog.getBoundingClientRect();
  const x = card.x + card.width / 2 - open.x - open.width / 2;
  const y = card.y + card.height / 2 - open.y - open.height / 2;
  const frames = [{ transform: `translate(${x}px, ${y}px) scale(${card.width / open.width}, ${card.height / open.height})`, opacity: 0 }, { transform: "none", opacity: 1 }];
  return dialog.animate(back ? frames.reverse() : frames, { ...timing, fill: back ? "forwards" : "none" });
}

/** the box a picture of this shape takes when shown whole inside another */
export function contained(box: { x: number; y: number; width: number; height: number }, wide: number, tall: number) {
  const k = Math.min(box.width / wide, box.height / tall);
  const [width, height] = [wide * k, tall * k];
  return { x: box.x + (box.width - width) / 2, y: box.y + (box.height - height) / 2, width, height };
}

/**
 * Carries the pressed thumbnail to where the window shows it whole (or back again), the rest of the window fading
 * around it. Nothing when there is no thumbnail of this very picture on screen.
 */
export function fly(dialog: HTMLDialogElement, from: Element | null | undefined, back = false) {
  const picture = dialog.querySelector<HTMLImageElement>(".viewer-picture:not(.is-full) img");
  const thumb = from?.querySelector<HTMLImageElement>(".work-picture img") ?? from?.querySelector("img");
  if (!picture || !thumb?.naturalWidth || still() || thumb.src !== picture.src) return;
  const frame = thumb.getBoundingClientRect();
  if (!frame.width || frame.bottom < 0 || frame.top > innerHeight) return;
  const small = getComputedStyle(thumb).objectFit === "contain" ? contained(frame, thumb.naturalWidth, thumb.naturalHeight) : frame;
  const large = contained(picture.getBoundingClientRect(), thumb.naturalWidth, thumb.naturalHeight);
  const place = (box: typeof large, radius: number) => ({ left: `${box.x}px`, top: `${box.y}px`, width: `${box.width}px`, height: `${box.height}px`, borderRadius: `${radius}px` });
  const around = [...dialog.children].map((part) => part.animate({ opacity: back ? [1, 0] : [0, 1] }, { ...timing, fill: back ? "forwards" : "none" }));
  const shade = dialog.animate({ backgroundColor: back ? [getComputedStyle(dialog).backgroundColor, "transparent"] : ["transparent", getComputedStyle(dialog).backgroundColor], borderColor: back ? [getComputedStyle(dialog).borderColor, "transparent"] : ["transparent", getComputedStyle(dialog).borderColor] }, { ...timing, fill: back ? "forwards" : "none" });
  const flyer = document.createElement("img");
  flyer.src = picture.src;
  flyer.alt = "";
  flyer.className = "viewer-fly";
  picture.style.visibility = "hidden";
  dialog.append(flyer);
  const frames = [place(small, 8), place(large, 0)];
  const flight = flyer.animate(back ? frames.reverse() : frames, { ...timing, fill: "forwards" });
  const land = () => {
    flyer.remove();
    if (back) return;
    picture.style.visibility = "";
    around.forEach((part) => part.cancel());
    shade.cancel();
  };
  // closing removes the whole window, so only the way in needs tidying
  if (!back) flight.finished.then(land, land);
  return flight;
}
