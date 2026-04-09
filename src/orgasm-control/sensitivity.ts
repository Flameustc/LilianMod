import type { BCActivity, BCCharacter } from "../types/bc";

/** Mirrors vanilla `ActivitySetArousalTimer` Max computation (Activity.js ~520–530). Use `Activity` after Lilian cap clone is applied. */
export function computeMaxForArousalTimer(
  C: BCCharacter,
  Activity: BCActivity | null,
  Zone: string,
  Asset: unknown
): number {
  let max =
    Activity == null || Activity.MaxProgress == null || Activity.MaxProgress > 100
      ? 100
      : Activity.MaxProgress;
  if (max > 95 && Zone !== "ActivityOnOther" && !PreferenceGetZoneOrgasm(C, Zone)) {
    max = 95;
  }
  if (max > 67 && Zone === "ActivityOnOther" && Activity != null) {
    const pen = Asset as { Group?: { Name: string }; Name?: string } | undefined;
    if (
      ["PenetrateSlow", "PenetrateFast"].includes(Activity.Name) &&
      pen &&
      pen.Group?.Name === "Pussy" &&
      pen.Name === "Penis"
    ) {
      max = PreferenceGetZoneOrgasm(Player, "ItemVulva") ? 100 : 95;
    } else {
      max = Activity.MaxProgressSelf != null ? Activity.MaxProgressSelf : 67;
    }
  }
  return max;
}

function clamp(n: number, lo: number, hi: number): number {
  if (n < lo) return lo;
  if (n > hi) return hi;
  return n;
}

export interface IntendedArousalDeltaResult {
  intended: number;
  applied: number;
  overflow: number;
}

/**
 * intended = clamp(round(old/2 + incoming0), -25, 25) + sensitivityLevel;
 * applied follows vanilla-style timer clamp on boosted input then Progress-vs-Max cap.
 */
export function computeIntendedArousalDelta(
  oldTimer: number,
  incoming0: number,
  progressNow: number,
  sensitivityLevel: number,
  maxEffective: number
): IntendedArousalDeltaResult {
  const baseClamped = clamp(Math.round(oldTimer / 2 + incoming0), -25, 25);
  const intended = baseClamped + sensitivityLevel;
  const boostedClamped = clamp(
    Math.round(oldTimer / 2 + incoming0 + sensitivityLevel),
    -25,
    25
  );
  const allowed = Math.max(0, maxEffective - progressNow);
  const applied =
    boostedClamped > 0 ? Math.min(boostedClamped, allowed) : boostedClamped;
  const overflow = Math.max(0, intended - applied);
  return { intended, applied, overflow };
}
