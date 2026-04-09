import type { ModSDKModAPI } from "bondage-club-mod-sdk";
import type { LilianSettings } from "../settings";
import type { BCActivity, BCCharacter } from "../types/bc";
import { computeIntendedArousalDelta, computeMaxForArousalTimer } from "./sensitivity";
import { onRuinedOrgasmPath, registerRuinedOrgasmIntercept } from "./ruinedIntercept";

let installed = false;

/** >0 while `ActivitySetArousalTimer` runs with sensitivity cap applied (for `PreferenceGetZoneOrgasm` incremental bypass). */
let lilianArousalBoostDepth = 0;

const DESIRE_DECAY_MS = 1900;
const DESIRE_DECAY_STEP = 2;
const DESIRE_RUINED_BONUS = 5;

let desireValue = 0;
let lastDesireDecayAt: number | null = null;
/** Set by Prepare hook when this orgasm attempt is allowed to bypass ruined. Consumed by Start hook once. */
let allowRuinedBypassOnNextStart = false;
/** Set when an action pushes arousal to orgasm; consumed by ActivityOrgasmGameGenerate(0). */
let pendingOrgasmGameDifficultyOverride: number | null = null;

function getNow(): number {
  return CurrentTime;
}

function applyDesireDecay(): void {
  const now = getNow();
  if (lastDesireDecayAt == null) {
    lastDesireDecayAt = now;
    return;
  }
  const elapsed = now - lastDesireDecayAt;
  const steps = Math.floor(elapsed / DESIRE_DECAY_MS);
  if (steps <= 0) return;
  desireValue = Math.max(0, desireValue - steps * DESIRE_DECAY_STEP);
  lastDesireDecayAt += steps * DESIRE_DECAY_MS;
}

function forcePreparePlayerOrgasm(C: BCCharacter): void {
  const arousal = C.ArousalSettings as BCCharacter["ArousalSettings"] & { OrgasmTimer?: number; OrgasmStage?: number };
  const now = getNow();
  const activeTimer = typeof arousal.OrgasmTimer === "number" && arousal.OrgasmTimer > now;
  if (activeTimer) {
    return;
  }
  ActivityOrgasmRuined = false;
  const timer = now + 5000;
  arousal.OrgasmTimer = timer;
  arousal.OrgasmStage = 0;
  ActivityOrgasmGameTimer = timer - now;

  if (CurrentCharacter && CurrentCharacter.ID === C.ID) {
    DialogLeave();
  }
  ActivityChatRoomArousalSync(C);
}

function applySensitivityCapToActivitySetArousalTimerArgs(
  args: Parameters<typeof ActivitySetArousalTimer>,
  sensitivityLevel: number
): void {
  const capBonus = sensitivityLevel * 10;
  const Activity = args[1];
  const Zone = args[2];

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

  onRuinedOrgasmPath(() => {
    if (!getSettings().OrgasmControlSetting.forceOrgasmEnabled) return;
    applyDesireDecay();
    desireValue += DESIRE_RUINED_BONUS;
  });

  registerRuinedOrgasmIntercept(mod, 115);

  mod.hookFunction("ActivitySetArousalTimer", 50, (args, next) => {
    const C = args[0];
    if (!C.IsPlayer()) {
      return next(args);
    }

    const org = getSettings().OrgasmControlSetting;
    if (!org.forceOrgasmEnabled) {
      desireValue = 0;
      allowRuinedBypassOnNextStart = false;
      pendingOrgasmGameDifficultyOverride = null;
    }

    if (org.sensitivityLevel <= 0 && !org.forceOrgasmEnabled) {
      return next(args);
    }

    let depthInc = false;
    if (org.sensitivityLevel > 0) {
      applySensitivityCapToActivitySetArousalTimerArgs(args, org.sensitivityLevel);
      lilianArousalBoostDepth++;
      depthInc = true;
    }

    try {
      if (org.forceOrgasmEnabled) {
        applyDesireDecay();
        const incoming0 = Number.isFinite(args[3]) ? args[3] : 0;
        const arousal = C.ArousalSettings;
        let oldTimer = arousal.ProgressTimer;
        if (oldTimer == null || typeof oldTimer !== "number" || Number.isNaN(oldTimer)) {
          oldTimer = 0;
        }
        const progressNow = arousal.Progress;
        const zone = args[2];
        const activity = args[1];
        const maxEffective = computeMaxForArousalTimer(C, activity, zone, args[4]);
        const { overflow } = computeIntendedArousalDelta(
          oldTimer,
          incoming0,
          progressNow,
          org.sensitivityLevel,
          maxEffective
        );
        desireValue += overflow;
      }

      if (org.sensitivityLevel > 0) {
        const base = Number.isFinite(args[3]) ? args[3] : 0;
        args[3] = base + org.sensitivityLevel;
      }

      return next(args);
    } finally {
      if (depthInc) {
        lilianArousalBoostDepth--;
      }
    }
  });

  mod.hookFunction("PreferenceGetZoneOrgasm", 50, (args, next) => {
    const v = next(args);
    if (lilianArousalBoostDepth > 0 && args[0].IsPlayer()) {
      return true;
    }
    return v;
  });

  mod.hookFunction("ActivityOrgasmPrepare", 100, (args, next) => {
    const C = args[0];
    if (!C.IsPlayer()) {
      return next(args);
    }

    const org = getSettings().OrgasmControlSetting;
    if (!org.forceOrgasmEnabled) {
      allowRuinedBypassOnNextStart = false;
      return next(args);
    }

    // Any orgasm attempt while force mode is enabled should use desire-based mini-game difficulty.
    pendingOrgasmGameDifficultyOverride = Math.max(6, Math.floor(desireValue));

    applyDesireDecay();
    const threshold = org.forceOrgasmDesireThreshold;
    if (desireValue <= threshold) {
      allowRuinedBypassOnNextStart = false;
      return next(args);
    }

    allowRuinedBypassOnNextStart = true;
    forcePreparePlayerOrgasm(C);
  });

  mod.hookFunction("ActivityOrgasmStart", 100, (args, next) => {
    const C = args[0];
    if (C.IsPlayer() && getSettings().OrgasmControlSetting.forceOrgasmEnabled && allowRuinedBypassOnNextStart) {
      ActivityOrgasmRuined = false;
      allowRuinedBypassOnNextStart = false;
    }
    return next(args);
  });

  mod.hookFunction("ActivityOrgasmGameGenerate", 100, (args, next) => {
    const ret = next(args);
    if (!getSettings().OrgasmControlSetting.forceOrgasmEnabled) {
      pendingOrgasmGameDifficultyOverride = null;
      return ret;
    }
    if (args[0] === 0 && pendingOrgasmGameDifficultyOverride != null) {
      ActivityOrgasmGameDifficulty = pendingOrgasmGameDifficultyOverride;
      // Vanilla already built the first label with old difficulty in this same call.
      // Recompute it immediately so the first rendered button shows correct remaining clicks.
      const g = globalThis as Record<string, unknown>;
      const textGet = g.TextGet;
      if (typeof textGet === "function") {
        const progress = typeof g.ActivityOrgasmGameProgress === "number"
          ? (g.ActivityOrgasmGameProgress as number)
          : 0;
        const remain = Math.max(0, Math.ceil(ActivityOrgasmGameDifficulty - progress));
        g.ActivityOrgasmResistLabel = `${(textGet as (k: string) => string)("OrgasmResist")} (${remain.toString()})`;
      }
      pendingOrgasmGameDifficultyOverride = null;
    }
    return ret;
  });

  mod.hookFunction("ActivityOrgasmStop", 100, (args, next) => {
    const C = args[0];
    const stopProgress = args[1];
    const ret = next(args);
    if (
      C.IsPlayer() &&
      getSettings().OrgasmControlSetting.forceOrgasmEnabled &&
      typeof stopProgress === "number" &&
      stopProgress <= 20
    ) {
      // Clear desire only after a real orgasm finishes.
      desireValue = 0;
      allowRuinedBypassOnNextStart = false;
      pendingOrgasmGameDifficultyOverride = null;
    }
    return ret;
  });
}
