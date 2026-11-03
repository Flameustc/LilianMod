import assert from "node:assert/strict";
import { test } from "node:test";
import { formatMistressMemberNumbers, parseMistressMemberNumbers, sanitizeSettings } from "./settings";

test("sanitizeSettings keeps orgasm defaults and parses mistress member numbers", () => {
  const settings = sanitizeSettings({
    OrgasmControlSetting: {
      sensitivityLevel: 4,
      forceOrgasmEnabled: true,
      forceOrgasmDesireThreshold: 12,
      mistressMemberNumbers: [38905, 38905, 0, -3, 1.5, "nope", 100],
    },
  });
  assert.equal(settings.OrgasmControlSetting.sensitivityLevel, 4);
  assert.equal(settings.OrgasmControlSetting.forceOrgasmEnabled, true);
  assert.equal(settings.OrgasmControlSetting.forceOrgasmDesireThreshold, 12);
  assert.deepEqual(settings.OrgasmControlSetting.mistressMemberNumbers, [38905, 100]);
});

test("missing mistress list defaults to empty", () => {
  const settings = sanitizeSettings({ OrgasmControlSetting: { sensitivityLevel: 1 } });
  assert.deepEqual(settings.OrgasmControlSetting.mistressMemberNumbers, []);
});

test("parseMistressMemberNumbers accepts comma or space separated text", () => {
  assert.deepEqual(parseMistressMemberNumbers("38905, 100 100; 42"), [38905, 100, 42]);
  assert.equal(formatMistressMemberNumbers([38905, 100]), "38905, 100");
});
