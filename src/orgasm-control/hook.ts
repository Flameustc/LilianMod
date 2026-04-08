import type { ModSDKModAPI } from "bondage-club-mod-sdk";
import type { LilianSettings } from "../settings";
import type { BCActivity, BCCharacter } from "../types/bc";

let installed = false;

/** >0 while `ActivitySetArousalTimer` runs with horny cap applied (for `PreferenceGetZoneOrgasm` incremental bypass). */
let lilianArousalBoostDepth = 0;

function applyHornyCapToActivitySetArousalTimerArgs(args: unknown[], hornyLevel: number): void {
  const capBonus = hornyLevel * 10;
  const Activity = args[1] as BCActivity | null;
  const Zone = args[2] as string;

  if (Activity == null) {
    const syn: BCActivity = {
      Name: "",
      MaxProgress: Math.min(100, 100 + capBonus),
    };
    if (Zone === "ActivityOnOther") {
      syn.MaxProgressSelf = Math.min(100, 67 + capBonus);
    }
    args[1] = syn;
    return;
  }

  const baseMp = Activity.MaxProgress == null || Activity.MaxProgress > 100
    ? 100
    : Activity.MaxProgress;
  const clone: BCActivity = { ...Activity };
  clone.MaxProgress = Math.min(100, baseMp + capBonus);
  if (Zone === "ActivityOnOther") {
    const baseSelf = Activity.MaxProgressSelf != null ? Activity.MaxProgressSelf : 67;
    clone.MaxProgressSelf = Math.min(100, baseSelf + capBonus);
  }
  args[1] = clone;
}

export function installOrgasmControlHooks(mod: ModSDKModAPI, getSettings: () => LilianSettings): void {
  if (installed) return;
  installed = true;

  mod.hookFunction("ActivitySetArousalTimer", 50, (args, next) => {
    const C = args[0] as BCCharacter;
    const horny = getSettings().OrgasmControlSetting.hornyLevel;
    if (!C.IsPlayer() || horny <= 0) {
      return next(args);
    }
    lilianArousalBoostDepth++;
    try {
      applyHornyCapToActivitySetArousalTimerArgs(args, horny);
      return next(args);
    } finally {
      lilianArousalBoostDepth--;
    }
  });

  mod.hookFunction("PreferenceGetZoneOrgasm", 50, (args, next) => {
    const v = next(args);
    if (lilianArousalBoostDepth > 0 && (args[0] as BCCharacter)?.IsPlayer?.()) {
      return true;
    }
    return v;
  });
}
