import type { BCActivity, BCCharacter } from "../types/bc";

/**
 * Mirrors vanilla `ActivitySetArousalTimer` Max computation (Activity.js ~496–518).
 * Use `Activity` after the sensitivity cap clone is applied.
 * Desire overflow does not use this gap; it anchors at 100 in `desire.ts`.
 * Raising MaxProgress / MaxProgressSelf (and the zone-orgasm bypass) still decides whether an act can reach orgasm.
 */
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
