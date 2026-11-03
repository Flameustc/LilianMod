import type { ModSDKModAPI } from "bondage-club-mod-sdk";
import type { LilianSettings } from "../settings";
import type { BCActivity, BCCharacter } from "../types/bc";
import {
  DESIRE_DECAY_MS,
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
import { onRuinedOrgasmPath, registerRuinedOrgasmIntercept } from "./ruinedIntercept";
import {
  commitDebugArousal,
  commitDebugDesire,
  createLilianDebugApi,
  readDebugArousal,
  type LilianDebugApi,
} from "./debugApi";

let installed = false;
let debugApi: LilianDebugApi | null = null;

/** >0 while `ActivitySetArousalTimer` runs with sensitivity cap applied (for `PreferenceGetZoneOrgasm` incremental bypass). */
let lilianArousalBoostDepth = 0;

let desireValue = 0;
let lastDesireDecayAt: number | null = null;
/** >1 while ActivityEffect / ActivityEffectFlat / ActivityRunSelf should double the player's factor. */
let mistressProgressMultiplier = 1;
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
  desireValue = desireAfterDecay(desireValue, steps);
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

function characterIsPlayer(c: BCCharacter | null | undefined): boolean {
  return typeof c?.IsPlayer === "function" && c.IsPlayer();
}

/**
 * `ActivitySetArousalTimer` has no Source/Target. Mark mistress interactions here, then
 * scale the factor inside the timer hook before vanilla applies it.
 * `ActivityRunSelf` is the player's own meter when the target is someone else.
 */
function withMistressProgress<T>(
  getSettings: () => LilianSettings,
  source: BCCharacter | null | undefined,
  target: BCCharacter | null | undefined,
  progressGoesToPlayer: boolean,
  run: () => T
): T {
  if (!progressGoesToPlayer) return run();
  const doubles = interactionDoublesPlayerProgress(
    otherCharacterMemberNumber(asMemberNumber(source?.MemberNumber), characterIsPlayer(source)),
    otherCharacterMemberNumber(asMemberNumber(target?.MemberNumber), characterIsPlayer(target)),
    asMemberNumber(Player.Ownership?.MemberNumber),
    getSettings().OrgasmControlSetting.mistressMemberNumbers
  );
  if (!doubles) return run();
  const previous = mistressProgressMultiplier;
  mistressProgressMultiplier *= MISTRESS_PROGRESS_MULTIPLIER;
  try {
    return run();
  } finally {
    mistressProgressMultiplier = previous;
  }
}

function debugNow(): number {
  return typeof CurrentTime === "number" && Number.isFinite(CurrentTime) ? CurrentTime : Number.NaN;
}

function readPlayerArousal(): number {
  return readDebugArousal(Player);
}

function writePlayerArousal(value: number): number {
  const applied = commitDebugArousal(Player, value);
  if (applied != null && Player.ArousalSettings != null && typeof ActivityChatRoomArousalSync === "function") {
    ActivityChatRoomArousalSync(Player as unknown as BCCharacter);
  }
  return applied ?? readPlayerArousal();
}

function writeHiddenDesire(value: number, now: number): number {
  const state = { desire: desireValue, lastDecayAt: lastDesireDecayAt };
  commitDebugDesire(state, value, now);
  desireValue = state.desire;
  lastDesireDecayAt = state.lastDecayAt;
  return desireValue;
}

/** Console-only API. Installed onto `window.LilianMod.debug` from the mod entry. */
export function getLilianDebugApi(): LilianDebugApi | null {
  return debugApi;
}

export function installOrgasmControlHooks(mod: ModSDKModAPI, getSettings: () => LilianSettings): void {
  if (installed) return;
  installed = true;

  debugApi = createLilianDebugApi({
    readDesire: () => desireValue,
    writeDesire: writeHiddenDesire,
    readArousal: readPlayerArousal,
    writeArousal: writePlayerArousal,
    now: debugNow,
  });

  onRuinedOrgasmPath(() => {
    if (!getSettings().OrgasmControlSetting.forceOrgasmEnabled) return;
    applyDesireDecay();
    desireValue += DESIRE_RUINED_BONUS;
  });

  registerRuinedOrgasmIntercept(mod, 115);

  mod.hookFunction("ActivityEffect", 50, (args, next) => {
    return withMistressProgress(getSettings, args[0], args[1], characterIsPlayer(args[1]), () => next(args));
  });

  mod.hookFunction("ActivityEffectFlat", 50, (args, next) => {
    return withMistressProgress(getSettings, args[0], args[1], characterIsPlayer(args[1]), () => next(args));
  });

  mod.hookFunction("ActivityRunSelf", 50, (args, next) => {
    return withMistressProgress(getSettings, args[0], args[1], characterIsPlayer(args[0]), () => next(args));
  });

  mod.hookFunction("ActivitySetArousalTimer", 50, (args, next) => {
    const C = args[0];
    if (!C.IsPlayer()) {
      return next(args);
    }

    if (mistressProgressMultiplier !== 1) {
      args[3] = scaleProgressFactor(args[3], mistressProgressMultiplier);
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
        const arousal = C.ArousalSettings;
        let oldTimer = arousal.ProgressTimer;
        if (oldTimer == null || typeof oldTimer !== "number" || Number.isNaN(oldTimer)) {
          oldTimer = 0;
        }
        let progressNow = arousal.Progress;
        if (typeof progressNow !== "number" || !Number.isFinite(progressNow)) {
          progressNow = 0;
        }
        // Progress_after_increase uses the pre-Max timer (mistress factor ×2, then + sensitivity), anchored at 100.
        const incoming = arousalTimerIncoming(args[3], org.sensitivityLevel);
        const progressAfterIncrease = progressNow + computeTimerBeforeMaxCap(oldTimer, incoming);
        desireValue += computeDesireOverflow(progressAfterIncrease, desireValue);
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
    pendingOrgasmGameDifficultyOverride = forceOrgasmGameDifficulty(desireValue);

    applyDesireDecay();
    // threshold 0 disables the bypass even if desire is high; otherwise desire >= threshold.
    const threshold = org.forceOrgasmDesireThreshold;
    if (!desireReachesForceThreshold(desireValue, threshold)) {
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
