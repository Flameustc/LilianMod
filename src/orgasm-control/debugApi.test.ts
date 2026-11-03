import assert from "node:assert/strict";
import { test } from "node:test";
import { DESIRE_DECAY_MS, desireAfterDecay } from "./desire";
import {
  clampDebugArousal,
  clampDebugDesire,
  commitDebugArousal,
  commitDebugDesire,
  createLilianDebugApi,
  readDebugArousal,
} from "./debugApi";

test("setDesire clamps to >= 0 and ignores non-finite input", () => {
  assert.equal(clampDebugDesire(-4), 0);
  assert.equal(clampDebugDesire(0), 0);
  assert.equal(clampDebugDesire(12.5), 12.5);
  assert.equal(clampDebugDesire(Number.NaN), null);
  assert.equal(clampDebugDesire("20"), null);
});

test("setArousal clamps to the 0–100 meter", () => {
  assert.equal(clampDebugArousal(-1), 0);
  assert.equal(clampDebugArousal(0), 0);
  assert.equal(clampDebugArousal(40.5), 40.5);
  assert.equal(clampDebugArousal(100), 100);
  assert.equal(clampDebugArousal(140), 100);
  assert.equal(clampDebugArousal(Number.POSITIVE_INFINITY), null);
});

test("setting desire does not apply decay that already elapsed", () => {
  const state = { desire: 80, lastDecayAt: 0 };
  commitDebugDesire(state, 25, 50_000);
  assert.equal(state.desire, 25);
  assert.equal(state.lastDecayAt, 50_000);
  const stepsAtSet = Math.floor((50_000 - state.lastDecayAt) / DESIRE_DECAY_MS);
  assert.equal(stepsAtSet, 0);
  assert.equal(desireAfterDecay(state.desire, stepsAtSet), 25);
  const oneStepLater = Math.floor(DESIRE_DECAY_MS / DESIRE_DECAY_MS);
  assert.equal(desireAfterDecay(state.desire, oneStepLater), 23);
});

test("invalid setDesire does not move the decay clock", () => {
  const state = { desire: 9, lastDecayAt: 100 };
  commitDebugDesire(state, Number.NaN, 9_000);
  assert.equal(state.desire, 9);
  assert.equal(state.lastDecayAt, 100);
});

test("setArousal writes Progress and clears ProgressTimer", () => {
  const player = { ArousalSettings: { Progress: 10, ProgressTimer: 18 } };
  assert.equal(commitDebugArousal(player, 77), 77);
  assert.equal(player.ArousalSettings.Progress, 77);
  assert.equal(player.ArousalSettings.ProgressTimer, 0);
  assert.equal(readDebugArousal(player), 77);
  assert.equal(commitDebugArousal(player, 250), 100);
  assert.equal(player.ArousalSettings.Progress, 100);
});

test("debug.enabled false leaves desire and arousal unchanged", () => {
  let desire = 4;
  let progress = 15;
  const api = createLilianDebugApi({
    readDesire: () => desire,
    writeDesire: (value) => {
      desire = value;
      return desire;
    },
    readArousal: () => progress,
    writeArousal: (value) => {
      progress = value;
      return progress;
    },
    now: () => 0,
  });
  api.enabled = false;
  assert.equal(api.setDesire(30), 4);
  assert.equal(api.setArousal(90), 15);
  assert.equal(desire, 4);
  assert.equal(progress, 15);
  assert.equal(api.getDesire(), 4);
  assert.equal(api.getArousal(), 15);
  api.enabled = true;
  assert.equal(api.setDesire(30), 30);
  assert.equal(api.setArousal(90), 90);
});
