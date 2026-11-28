// โหมดอ่านง่าย: ตัวใหญ่ สีตัดชัด ฉากตกแต่งหายไป และหยุดการเคลื่อนไหว (หน้าตาอยู่ใน globals.css)

const KEY = "easy";
export const isEasy = () => document.documentElement.dataset.easy === "on";

export function setEasy(on: boolean) {
  const calm = document.querySelector<HTMLInputElement>("#calm");
  if (on) document.documentElement.dataset.easy = "on";
  else delete document.documentElement.dataset.easy;
  // motion stops with it; on leaving, only motion that this mode stopped starts again
  if (calm && on && !calm.checked) {
    calm.click();
    calm.dataset.byEasy = "yes";
  } else if (calm && !on && calm.dataset.byEasy) {
    if (calm.checked) calm.click();
    delete calm.dataset.byEasy;
  }
  try {
    localStorage.setItem(KEY, on ? "on" : "");
  } catch {
    // not remembered, which does no harm
  }
  // the text changed size: the scroll animations are measured again
  window.dispatchEvent(new Event("view-change"));
}

export const toggleEasy = () => setEasy(!isEasy());

export function keptEasy() {
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
}
