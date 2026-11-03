import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DESIRE_DECAY_STEP,
  DESIRE_RUINED_BONUS,
  MISTRESS_PROGRESS_MULTIPLIER,
  arousalTimerIncoming,
  asMemberNumber,
  computeDesireOverflow,
  computeTimerBeforeMaxCap,
  desireAfterDecay,
  desireReachesForceThreshold,
  forceOrgasmGameDifficulty,
  interactionDoublesPlayerProgress,
  otherCharacterMemberNumber,
  scaleProgressFactor,
} from "./desire";

test("desire overflow anchors at 100 and subtracts half of current desire", () => {
  assert.equal(computeDesireOverflow(110, 0), 10);
  assert.equal(computeDesireOverflow(110, 8), 6);
  assert.equal(computeDesireOverflow(110, 40), 0);
  assert.equal(computeDesireOverflow(98, 0), 0);
  assert.equal(computeDesireOverflow(100, 0), 0);
  assert.equal(computeDesireOverflow(100 + computeTimerBeforeMaxCap(0, -5), 10), 0);
});

test("overshoot is not the MaxProgress gap", () => {
  // Progress 90 + timer 20 would pass 100 by 10.
  // The old formula treated the entire unused gap under a low MaxProgress (for example 67) as desire.
  assert.equal(computeDesireOverflow(90 + 20, 0), 10);
  assert.equal(computeDesireOverflow(40 + 20, 0), 0);
});

test("timer before the max cap matches vanilla half-life and ±25 clamp", () => {
  assert.equal(computeTimerBeforeMaxCap(10, 4), 9);
  assert.equal(computeTimerBeforeMaxCap(0, 40), 25);
  assert.equal(computeTimerBeforeMaxCap(0, -40), -25);
  assert.equal(computeTimerBeforeMaxCap(Number.NaN, 3), 3);
});

test("sensitivity is added after the activity factor", () => {
  assert.equal(arousalTimerIncoming(10, 3), 13);
  assert.equal(arousalTimerIncoming(10, 0), 10);
  assert.equal(scaleProgressFactor(10, MISTRESS_PROGRESS_MULTIPLIER), 20);
  assert.equal(arousalTimerIncoming(scaleProgressFactor(10, 2), 3), 23);
  assert.equal(scaleProgressFactor(-4, 2), -8);
});

test("desire decays by 2 per step and does not go negative", () => {
  assert.equal(DESIRE_DECAY_STEP, 2);
  assert.equal(desireAfterDecay(5, 1), 3);
  assert.equal(desireAfterDecay(5, 3), 0);
  assert.equal(desireAfterDecay(5, 0), 5);
});

test("ruined orgasm still grants a flat desire bonus", () => {
  assert.equal(DESIRE_RUINED_BONUS, 5);
});

test("force orgasm bypass requires a positive threshold and desire >= threshold", () => {
  assert.equal(desireReachesForceThreshold(10, 10), true);
  assert.equal(desireReachesForceThreshold(9, 10), false);
  assert.equal(desireReachesForceThreshold(1, 1), true);
  assert.equal(desireReachesForceThreshold(100, 0), false);
  assert.equal(desireReachesForceThreshold(0, 0), false);
});

test("mini-game difficulty follows desire only", () => {
  assert.equal(forceOrgasmGameDifficulty(0), 6);
  assert.equal(forceOrgasmGameDifficulty(5.9), 6);
  assert.equal(forceOrgasmGameDifficulty(12.8), 12);
});

test("mistress is the owner or an extra member, never the player themselves", () => {
  const owner = 38905;
  const extras = [100, 200];
  const player = 61119;
  const source = (member: number, isPlayer = false) =>
    otherCharacterMemberNumber(asMemberNumber(member), isPlayer);
  const doubles = (sourceMember: number | null, targetMember: number | null) =>
    interactionDoublesPlayerProgress(sourceMember, targetMember, owner, extras);

  assert.equal(doubles(source(owner), source(player, true)), true);
  assert.equal(doubles(source(player, true), source(owner)), true);
  assert.equal(doubles(source(100), source(player, true)), true);
  assert.equal(doubles(source(player, true), source(200)), true);
  assert.equal(doubles(source(player, true), source(7)), false);
  assert.equal(doubles(source(player, true), source(player, true)), false);
  assert.equal(interactionDoublesPlayerProgress(null, null, owner, [player]), false);
});
