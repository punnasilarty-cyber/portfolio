import assert from "node:assert/strict";
import { test } from "node:test";
import { groupsOf } from "../src/content.ts";

test("items without a heading come first, then each heading in the order met", () => {
  const items = [["a", "ข"], ["b"], ["c", "ก"], ["d", "ข"]] as [string, string?][];
  const groups = groupsOf(items, (item) => item[1]);
  assert.deepEqual(groups.map((group) => [group.name, group.items.map((item) => item[0])]), [["", ["b"]], ["ข", ["a", "d"]], ["ก", ["c"]]]);
  assert.deepEqual(groupsOf([], () => undefined), []);
});
