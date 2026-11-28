// keeps a copy of the site on the device, so it still opens with no internet.
// scripts/precache.mjs fills in the next two lines after each build.
const BUILD = "1a2390f42650";
const FILES = ["","__next.__PAGE__.txt","__next._full.txt","__next._tree.txt","_next/static/chunks/0cz1d0mv5g_q7.js","_next/static/chunks/0j1we3cwg31qe.js","_next/static/chunks/0qaaitb7p48_y.js","_next/static/chunks/2tcr62wycp0-a.js","_next/static/chunks/39_j1bdzreq0m.js","_next/static/chunks/3gj3pu-4bglnn.css","_next/static/chunks/3qfy96eoyh-ek.js","_next/static/chunks/3qutjfl3fizyb.js","_next/static/chunks/40p4kcl9ok8lp.js","_next/static/chunks/turbopack-2zcip91djmwl_.js","_next/static/media/LINESeedSansTH_W_Bd-s.p.38p8rx8vmjq_s.woff2","_next/static/media/LINESeedSansTH_W_He-s.p.20kuh-8i3m92d.woff2","_next/static/media/LINESeedSansTH_W_Rg-s.p.1zk9avbvwlzda.woff2","_next/static/media/LINESeedSansTH_W_XBd-s.p.0fr0nnm58tv5f.woff2","_next/static/media/pdf.worker.min.0eszirmnk0nq3.mjs","_next/static/sXFUI9YNFAAyAAwCb6VTc/_buildManifest.js","_next/static/sXFUI9YNFAAyAAwCb6VTc/_clientMiddlewareManifest.js","_next/static/sXFUI9YNFAAyAAwCb6VTc/_ssgManifest.js","apple-icon.png","icon-192.png","icon-512.png","icon-maskable.png","icon.svg","index.html","index.txt","manifest.webmanifest","og.png","qr.svg","schools/sangkha.png","schools/sura.png"];

const CACHE = `portfolio-${BUILD}`;
const scope = new URL("./", self.location).href;
const SLOW = 4000; // a network this slow loses to the copy already here

// copies are filed without the ?t= the page adds to its data
const keyOf = (address) => {
  const url = new URL(address, scope);
  url.search = "";
  url.hash = "";
  return url.href;
};

/** the pictures and documents of the work cards, which are not part of the build */
async function keepWorks(list) {
  const cache = await caches.open(CACHE);
  const paths = list.flatMap((work) => [work.image, ...(work.images ?? []), work.link, ...(work.files ?? []).map((file) => file.link)]);
  await Promise.allSettled(
    paths.filter(Boolean).map(async (path) => {
      // pictures are written from the site's root, documents as full addresses
      const key = keyOf(path.startsWith("/") ? path.slice(1) : path);
      if (key.startsWith(`${scope}works/`) && !(await cache.match(key))) await cache.add(key);
    }),
  );
}

async function install() {
  const cache = await caches.open(CACHE);
  await cache.addAll(FILES.map((file) => new Request(scope + file, { cache: "reload" })));
  // data saved by the editor: kept when there is any
  for (const name of ["works.json", "site.json"]) {
    try {
      const response = await fetch(scope + name, { cache: "no-store" });
      if (!response.ok) continue;
      await cache.put(scope + name, response.clone());
      if (name === "works.json") await keepWorks(await response.json());
    } catch {
      // kept on a later visit instead
    }
  }
  await self.skipWaiting();
}

self.addEventListener("install", (event) => event.waitUntil(install()));

self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      for (const name of await caches.keys()) if (name.startsWith("portfolio-") && name !== CACHE) await caches.delete(name);
      await self.clients.claim();
    })(),
  ),
);

/** a document asked for in pieces gets the piece cut from the whole copy */
async function piece(copy, range) {
  const found = /^bytes=(\d+)-(\d*)$/.exec(range);
  if (!found) return copy;
  const whole = await copy.arrayBuffer();
  const start = Number(found[1]);
  const end = Math.min(found[2] ? Number(found[2]) : whole.byteLength - 1, whole.byteLength - 1);
  return new Response(whole.slice(start, end + 1), {
    status: 206,
    headers: { "Content-Type": copy.headers.get("Content-Type") ?? "application/octet-stream", "Content-Range": `bytes ${start}-${end}/${whole.byteLength}`, "Content-Length": String(end - start + 1) },
  });
}

async function answer(event) {
  const { request } = event;
  const key = keyOf(request.url);
  const cache = await caches.open(CACHE);
  const copy = await cache.match(key, { ignoreVary: true });
  const range = request.headers.get("range");
  // built files never change under the same name
  if (copy && key.startsWith(`${scope}_next/static/`)) return copy;
  // everything else comes fresh from the network while it can, so edits show at once
  // the limit is only on the wait for a first reply, never on a download under way
  const stop = new AbortController();
  const late = copy && setTimeout(() => stop.abort(), SLOW);
  try {
    const response = await fetch(request, copy ? { signal: stop.signal } : undefined);
    clearTimeout(late);
    if (response.status >= 500 && copy) return range ? piece(copy, range) : copy;
    if (response.status === 200) {
      event.waitUntil(cache.put(key, response.clone()).catch(() => {}));
      if (key === `${scope}works.json`) event.waitUntil(response.clone().json().then(keepWorks).catch(() => {}));
    }
    return response;
  } catch (error) {
    clearTimeout(late);
    if (!copy) throw error;
    return range ? piece(copy, range) : copy;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  // the editor's key file and anything from elsewhere are left to the network
  if (request.method !== "GET" || !request.url.startsWith(scope) || keyOf(request.url) === `${scope}vault.txt`) return;
  event.respondWith(answer(event));
});
