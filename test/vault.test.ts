import assert from "node:assert/strict";
import { test } from "node:test";
import { isWeak, seal, unseal } from "../src/vault.ts";

test("only the right password opens the saved token", async () => {
  const sealed = await seal("test-token", "123456");
  assert.ok(!sealed.includes("test-token"));
  assert.equal(await unseal(sealed, "123456"), "test-token");
  await assert.rejects(unseal(sealed, "123457"), /รหัสไม่ถูกต้อง/);
  await assert.rejects(unseal("broken", "123456"), /รหัสไม่ถูกต้อง/);
});

test("short or repetitive passwords are refused", () => {
  assert.ok(isWeak("123456"));
  assert.ok(isWeak("abababababababababab"));
  assert.ok(!isWeak("ช้างส้มวิ่งข้ามสะพานเก่า"));
});
