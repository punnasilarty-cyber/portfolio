import assert from "node:assert/strict";
import { test } from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { excerpt, NOTES } from "../src/xray-code.ts";
import { kindOf, plain } from "../src/xray-words.ts";
import { createNet, raster, SIDE, varied, type Stroke } from "../src/teach.ts";
import { branches, contrast, declarations, hex, nameOf, openTag, PARTS, rgba, specificity, stateless, tree, under, type Branch } from "../src/xray.ts";

const ring = (r: number, x = 100, y = 100): Stroke[] => [Array.from({ length: 33 }, (_, i) => [x + Math.cos((i / 32) * 6.2832) * r, y + Math.sin((i / 32) * 6.2832) * r * 0.9] as [number, number])];
const cross = (r: number, x = 100, y = 100): Stroke[] => [[[x - r, y], [x + r, y]], [[x, y - r], [x, y + r]]];
const slash = (r: number, x = 100, y = 100): Stroke[] => [[[x - r, y + r], [x + r, y - r * 0.8]]];

test("where and how large a drawing is does not change what the model sees", () => {
  const [small, large] = [raster(ring(20, 40, 40)), raster(ring(110, 180, 150))];
  assert.ok(small.every((ink, i) => Math.abs(ink - large[i]) < 0.35));
  assert.ok(small.every((ink) => ink >= 0 && ink <= 1));
  assert.equal(raster([]).reduce((a, b) => a + b, 0), 0);
  assert.ok(raster([[[5, 5]]]).some((ink) => ink > 0));
  assert.equal(small.length, SIDE * SIDE);
});

test("it learns three shapes from three drawings each and knows new ones", () => {
  let seed = 7;
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const shapes = [ring, cross, slash];
  const samples = shapes.flatMap((shape, kind) => [40, 70, 100].flatMap((r) => varied(shape(r), kind)));
  const net = createNet(3, random);
  const first = net.epoch(samples);
  let last = first;
  for (let i = 0; i < 59; i++) last = net.epoch(samples);
  assert.ok(last < first * 0.2, first + " -> " + last);
  shapes.forEach((shape, kind) => {
    const chances = net.guess(raster(shape(55, 130, 90), 0.08, 1.07));
    assert.ok(chances[kind] > 0.7, kind + ": " + chances.join());
    assert.ok(Math.abs(chances.reduce((a, b) => a + b) - 1) < 1e-6);
  });
});

test("the lens names the smallest part under it, and every part says how it is made", () => {
  const boxes = [{ x: 0, y: 0, width: 100, height: 100 }, { x: 10, y: 10, width: 20, height: 20 }];
  assert.equal(under(boxes, 15, 15), 1);
  assert.equal(under(boxes, 80, 80), 0);
  assert.equal(under(boxes, 200, 5), -1);
  assert.ok(PARTS.every((part) => part.find && part.th.every(Boolean) && part.en.every(Boolean)));
});

test("every part names a source file that exists, and tells its steps in both languages", () => {
  for (const part of PARTS) {
    assert.ok(existsSync(part.file) || existsSync("src/components/" + part.file), part.file);
    assert.ok(part.tech.length && part.steps.th.length === 3 && part.steps.en.length === 3, part.find);
  }
});

test("the panel writes names, colours and insides plainly", () => {
  assert.equal(nameOf("div", "top", ["a", "b", "c"]), "div#top.a.b");
  assert.equal(hex("rgb(255, 0, 16)"), "#ff0010");
  assert.equal(hex("rgba(0, 0, 0, 0)"), "");
  assert.equal(hex("rgba(255, 255, 255, 0.5)"), "#ffffff 50%");
  assert.equal(hex("oklab(0.5 0 0)"), "oklab(0.5 0 0)");
  const node = (tagName: string, children: Branch[] = []): Branch => ({ tagName, children });
  assert.deepEqual(tree(node("UL", [node("LI", [node("B")]), node("LI"), node("P")])), ["<ul>", "  <li> × 2", "    <b>", "  <p>"]);
  assert.equal(tree(node("DIV", Array.from({ length: 40 }, (_, i) => node(i % 2 ? "B" : "I"))), 3, 5).length, 6);
});

test("contrast follows WCAG, and rules and tags are written out whole", () => {
  assert.equal(Math.round(contrast([0, 0, 0], [255, 255, 255]) * 100), 2100);
  assert.equal(contrast([90, 90, 90], [90, 90, 90]), 1);
  assert.ok(Math.abs(contrast([119, 119, 119], [255, 255, 255]) - 4.48) < 0.01);
  assert.deepEqual(rgba("rgba(1, 2, 3, 0.5)"), [1, 2, 3, 0.5]);
  assert.equal(rgba("oklab(0 0 0)"), null);
  assert.equal(openTag("br", []), "<br>");
  assert.equal(openTag("a", [["href", "x".repeat(5)]], 3), '<a\n  href="xxx…"\n>');
  assert.deepEqual(declarations('color: red; background: url("data:a;b"); width: calc(1px + var(--a));'), ["color: red", 'background: url("data:a;b")', "width: calc(1px + var(--a))"]);
});

test("selectors are weighed as CSS weighs them", () => {
  assert.deepEqual(branches('a, b:is(c, d), [title="x,y"], .e\\,f'), ["a", "b:is(c, d)", '[title="x,y"]', ".e\\,f"]);
  const weigh = (selector: string) => specificity(selector).join();
  assert.equal(weigh("*"), "0,0,0");
  assert.equal(weigh("ul li"), "0,0,2");
  assert.equal(weigh("#a .b c"), "1,1,1");
  assert.equal(weigh(".a:hover > [type=text]::before"), "0,3,1");
  assert.equal(weigh(":where(#a, .b) p"), "0,0,1");
  assert.equal(weigh("a:not(.b, #c)"), "1,0,1");
  assert.equal(weigh(".text-\\[var\\(--x\\)\\]"), "0,1,0");
  assert.equal(weigh("li:nth-child(2n+1)"), "0,1,1");
});

test("a rule waiting for a state is read without it", () => {
  assert.deepEqual(stateless(".a:hover .b:focus-visible"), { plain: ".a .b", states: ["hover", "focus-visible"] });
  assert.deepEqual(stateless(":hover"), { plain: "*", states: ["hover"] });
  assert.deepEqual(stateless("ul > :checked"), { plain: "ul > *", states: ["checked"] });
  assert.deepEqual(stateless(".hover\\:underline").states, []);
});

test("every explained line is still in the real file, and every part with code is explained", () => {
  for (const [file, notes] of Object.entries(NOTES)) {
    const source = readFileSync(existsSync(file) ? file : "src/components/" + file, "utf8");
    for (const [anchor, th, en] of notes) assert.ok(source.includes(anchor) && th && en, file + ": " + anchor);
    assert.equal(excerpt(source, notes).flat().filter((line) => line.note).length, notes.length, file);
  }
  assert.ok(PARTS.every((part) => NOTES[part.file] || part.file.endsWith(".svg")), PARTS.map((part) => part.file).filter((file) => !NOTES[file]).join());
});

test("an excerpt keeps line numbers, joins neighbours, and never gives away a whole file", () => {
  const source = Array.from({ length: 30 }, (_, i) => "line " + (i + 1) + ";").join("\n");
  const near = excerpt(source, [["line 5;", "a", "a"], ["line 9;", "b", "b"], ["line 25;", "c", "c"]], 2);
  assert.deepEqual(near.map((block) => [block[0].number, block.at(-1)!.number]), [[3, 11], [23, 27]]);
  assert.deepEqual(excerpt(source, []), []);
  assert.deepEqual(excerpt(source, [["no such line", "x", "x"]]), []);
  // what the site publishes is a small share of each real file
  for (const [file, notes] of Object.entries(NOTES)) {
    const real = readFileSync(existsSync(file) ? file : "src/components/" + file, "utf8").split("\n").length;
    const published = excerpt(readFileSync(existsSync(file) ? file : "src/components/" + file, "utf8"), notes).flat().length;
    assert.ok(published <= notes.length * 3 && published < real, file + ": " + published + "/" + real);
  }
});

test("every element has a kind and a plain explanation", () => {
  assert.deepEqual([kindOf("button", true), kindOf("img", false), kindOf("svg", false), kindOf("p", true), kindOf("div", false)], ["press", "media", "draw", "text", "box"]);
  assert.ok(plain("marquee").th.includes("marquee") && plain("p").en.length > 0);
});
