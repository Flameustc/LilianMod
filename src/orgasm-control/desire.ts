/**
 * Hidden desire from arousal overshoot, force-orgasm threshold, and mistress progress.
 * Vanilla `ActivitySetArousalTimer` still caps the visible meter at MaxProgress; desire
 * uses the pre-cap timer against 100 instead of that MaxProgress gap.
 */

export const DESIRE_DECAY_MS = 1900;
export const DESIRE_DECAY_STEP = 2;
export const DESIRE_RUINED_BONUS = 5;
export const MISTRESS_PROGRESS_MULTIPLIER = 2;

const TIMER_LIMIT = 25;

function clamp(n: number, lo: number, hi: number): number {
  if (n < lo) return lo;
  if (n > hi) return hi;
  return n;
}

/**
 * Value vanilla stores in `ProgressTimer` before the MaxProgress / zone cap:
 * `clamp(round(oldTimer / 2 + incoming), -25, 25)`.
 * `incoming` is the activity factor (already mistress-scaled) plus sensitivity.
 */
export function computeTimerBeforeMaxCap(oldTimer: number, incoming: number): number {
  const old = Number.isFinite(oldTimer) ? oldTimer : 0;
  const next = Number.isFinite(incoming) ? incoming : 0;
  return clamp(Math.round(old / 2 + next), -TIMER_LIMIT, TIMER_LIMIT);
}

/** Factor passed into the timer, with sensitivity added on top (not multiplied). */
export function arousalTimerIncoming(factor: number, sensitivityLevel: number): number {
  const base = Number.isFinite(factor) ? factor : 0;
  const bonus = Number.isFinite(sensitivityLevel) && sensitivityLevel > 0 ? sensitivityLevel : 0;
  return base + bonus;
}

/** Mistress interactions multiply the activity factor. `multiplier` is 1 when not involved. */
export function scaleProgressFactor(factor: number, multiplier: number): number {
  const base = Number.isFinite(factor) ? factor : 0;
  if (!Number.isFinite(multiplier) || multiplier === 1) return base;
  return base * multiplier;
}

/**
 * Flame overflow: `add = (Progress_after_increase - 100) - (currentDesire / 2)`.
 * Negative results do not reduce desire; time decay does that separately.
 */
export function computeDesireOverflow(progressAfterIncrease: number, currentDesire: number): number {
  if (!Number.isFinite(progressAfterIncrease) || !Number.isFinite(currentDesire)) return 0;
  const add = (progressAfterIncrease - 100) - currentDesire / 2;
  return add > 0 ? add : 0;
}

export function desireAfterDecay(desire: number, steps: number): number {
  const current = Number.isFinite(desire) ? desire : 0;
  if (!Number.isFinite(steps) || steps <= 0) return Math.max(0, current);
  return Math.max(0, current - steps * DESIRE_DECAY_STEP);
}

/**
 * Bypass Denial/Edge/BCX only when `threshold > 0` and `desire >= threshold`.
 * A threshold of 0 turns the bypass off no matter how high desire is.
 */
export function desireReachesForceThreshold(desire: number, threshold: number): boolean {
  if (!Number.isFinite(desire) || !Number.isFinite(threshold) || threshold <= 0) return false;
  return desire >= threshold;
}

/** Resist mini-game length depends only on current desire. */
export function forceOrgasmGameDifficulty(desire: number): number {
  const value = Number.isFinite(desire) ? desire : 0;
  return Math.max(6, Math.floor(value));
}

export function asMemberNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0 || value > 999_999_999) {
    return null;
  }
  return value;
}

/** Player is not their own mistress; pass `null` for the local player side of an interaction. */
export function otherCharacterMemberNumber(memberNumber: number | null, isPlayer: boolean): number | null {
  if (isPlayer) return null;
  return memberNumber;
}

export function isMistressMember(
  memberNumber: number | null,
  ownerMemberNumber: number | null,
  extraMistressMemberNumbers: readonly number[] | null | undefined
): boolean {
  if (memberNumber == null) return false;
  if (ownerMemberNumber != null && memberNumber === ownerMemberNumber) return true;
  return (extraMistressMemberNumbers ?? []).includes(memberNumber);
}

/**
 * True when the other side of the interaction is the owner (`Player.Ownership.MemberNumber`)
 * or is listed in `mistressMemberNumbers`. Source and target are already stripped of the player.
 */
export function interactionDoublesPlayerProgress(
  otherSourceMember: number | null,
  otherTargetMember: number | null,
  ownerMemberNumber: number | null,
  extraMistressMemberNumbers: readonly number[] | null | undefined
): boolean {
  return (
    isMistressMember(otherSourceMember, ownerMemberNumber, extraMistressMemberNumbers) ||
    isMistressMember(otherTargetMember, ownerMemberNumber, extraMistressMemberNumbers)
  );
}

/** Where the slave's own arousal meter is updated. */
export type PlayerProgressActivityHook = "ActivityEffect" | "ActivityEffectFlat" | "ActivityRunSelf";

/**
 * ActivityEffect and ActivityEffectFlat add progress to the target.
 * ActivityRunSelf adds progress to the player only when the player acts on someone else.
 */
export function playerReceivesActivityProgress(
  hook: PlayerProgressActivityHook,
  sourceIsPlayer: boolean,
  targetIsPlayer: boolean
): boolean {
  if (hook === "ActivityRunSelf") return sourceIsPlayer && !targetIsPlayer;
  return targetIsPlayer;
}

/** 2 when this call should double the slave's factor, otherwise 1. */
export function mistressProgressMultiplierFor(input: {
  hook: PlayerProgressActivityHook;
  sourceIsPlayer: boolean;
  targetIsPlayer: boolean;
  sourceMember: number | null;
  targetMember: number | null;
  ownerMember: number | null;
  extraMistressMemberNumbers: readonly number[] | null | undefined;
}): number {
  if (!playerReceivesActivityProgress(input.hook, input.sourceIsPlayer, input.targetIsPlayer)) return 1;
  const doubles = interactionDoublesPlayerProgress(
    otherCharacterMemberNumber(input.sourceMember, input.sourceIsPlayer),
    otherCharacterMemberNumber(input.targetMember, input.targetIsPlayer),
    input.ownerMember,
    input.extraMistressMemberNumbers
  );
  return doubles ? MISTRESS_PROGRESS_MULTIPLIER : 1;
}
