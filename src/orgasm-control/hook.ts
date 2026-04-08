import type { ModSDKModAPI } from "bondage-club-mod-sdk";
import type { LilianSettings } from "../settings";
import type { BCActivity, BCCharacter } from "../types/bc";

let installed = false;

/** >0 while `ActivitySetArousalTimer` runs with sensitivity cap applied (for `PreferenceGetZoneOrgasm` incremental bypass). */
let lilianArousalBoostDepth = 0;

function forcePreparePlayerOrgasm(C: BCCharacter): void {
  const g = globalThis as Record<string, unknown>;
  const arousal = C.ArousalSettings as BCCharacter["ArousalSettings"] & { OrgasmTimer?: number; OrgasmStage?: number };
  const now = typeof g.CurrentTime === "number" ? (g.CurrentTime as number) : Date.now();
  const activeTimer = typeof arousal.OrgasmTimer === "number" && arousal.OrgasmTimer > now;
  if (activeTimer) {
    // Already in orgasm countdown/game; avoid reinitializing timer and resync spam.
    return;
  }
  g.ActivityOrgasmRuined = false;
  const timer = now + 5000;
  arousal.OrgasmTimer = timer;
  arousal.OrgasmStage = 0;
  g.ActivityOrgasmGameTimer = timer - now;

  const currentCharacter = g.CurrentCharacter as { ID?: number } | null | undefined;
  if (currentCharacter && (currentCharacter.ID === C.ID) && typeof g.DialogLeave === "function") {
    (g.DialogLeave as () => void)();
  }
  if (typeof g.ActivityChatRoomArousalSync === "function") {
    (g.ActivityChatRoomArousalSync as (character: BCCharacter) => void)(C);
  }
}

function applySensitivityCapToActivitySetArousalTimerArgs(args: unknown[], sensitivityLevel: number): void {
  const capBonus = sensitivityLevel * 10;
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
    const sensitivity = getSettings().OrgasmControlSetting.sensitivityLevel;
    if (!C.IsPlayer() || sensitivity <= 0) {
      return next(args);
    }
    lilianArousalBoostDepth++;
    try {
      applySensitivityCapToActivitySetArousalTimerArgs(args, sensitivity);
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

  (mod as unknown as {
    hookFunction: (name: string, priority: number, hook: (args: unknown[], next: (args: unknown[]) => unknown) => unknown) => void;
  }).hookFunction("ActivityOrgasmPrepare", 100, (args, next) => {
    const C = args[0] as BCCharacter;
    if (C?.IsPlayer?.() && getSettings().OrgasmControlSetting.forceOrgasmEnabled) {
      forcePreparePlayerOrgasm(C);
      return;
    }
    return next(args);
  });

  (mod as unknown as {
    hookFunction: (name: string, priority: number, hook: (args: unknown[], next: (args: unknown[]) => unknown) => unknown) => void;
  }).hookFunction("ActivityOrgasmStart", 100, (args, next) => {
    const C = args[0] as BCCharacter;
    if (C?.IsPlayer?.() && getSettings().OrgasmControlSetting.forceOrgasmEnabled) {
      (globalThis as Record<string, unknown>).ActivityOrgasmRuined = false;
    }
    return next(args);
  });
}
