import type { ModSDKModAPI } from "bondage-club-mod-sdk";
import type { LilianSettings } from "../settings";
import type { BCActivity, BCCharacter } from "../types/bc";

let installed = false;

/** >0 while `ActivitySetArousalTimer` runs with sensitivity cap applied (for `PreferenceGetZoneOrgasm` incremental bypass). */
let lilianArousalBoostDepth = 0;

/** 最近一次 `ActivityTimerProgress` 为玩家计算的「未截断」快感值，供 `ActivityOrgasmPrepare` 计算超出 100 的分量。 */
let playerLastUncappedArousal: number | null = null;

/** 被 BCX 等阻断高潮时累积的欲望值（horny level）；随时间衰减。 */
let storedDesire = 0;

const DESIRE_DECAY_MS = 1900;
const DESIRE_DECAY_STEP = 2;

function isOrgasmTimerActive(t: number | null | undefined): boolean {
  return t != null && typeof t === "number" && !Number.isNaN(t) && t > CurrentTime;
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

  setInterval(() => {
    const o = getSettings().OrgasmControlSetting;
    if (!o.forceOrgasmEnabled || storedDesire <= 0) return;
    storedDesire = Math.max(0, storedDesire - DESIRE_DECAY_STEP);
  }, DESIRE_DECAY_MS);

  mod.hookFunction("ActivityTimerProgress", 7, (args, next) => {
    const C = args[0] as BCCharacter;
    if (C.IsPlayer()) {
      const before = C.ArousalSettings.Progress;
      const d = args[1] as number;
      playerLastUncappedArousal = before + d;
    }
    return next(args);
  });

  /**
   * 数值高于 BCX `alt_control_orgasms`（priority 5）：欲望超阈值时直接调用原版，绕过阻断。
   */
  mod.hookFunction("ActivityOrgasmPrepare", 10, (args, next) => {
    const s = getSettings().OrgasmControlSetting;
    if (!s.forceOrgasmEnabled) return next(args);

    const C = args[0] as BCCharacter;
    if (!C.IsPlayer()) return next(args);
    if (C.ArousalSettings.Progress < 100) return next(args);

    if (storedDesire > s.forceOrgasmDesireThreshold) {
      storedDesire = 0;
      return mod.callOriginal("ActivityOrgasmPrepare", args);
    }
    return next(args);
  });

  /**
   * 欲望累积：`priority 6` > BCX `alt_control_orgasms` 的 `5`（mod-sdk：数字越大越先调用、越在栈外层）。
   * 因此本会话里**先**执行到 `p0/t0` 的读取，再 `next()` **向内**执行 BCX；`next` **返回时** BCX 已跑完（含其不调原版、直接 return 的情况）。
   * 若把本钩放在 `priority 4`（比 BCX 更内层），BCX 一旦短路不 `next`，内层钩不会执行，就无法在「阻断后」读 `p1` 做累积。
   */
  mod.hookFunction("ActivityOrgasmPrepare", 6, (args, next) => {
    const s = getSettings().OrgasmControlSetting;
    if (!s.forceOrgasmEnabled) {
      storedDesire = 0;
      return next(args);
    }

    const C = args[0] as BCCharacter;
    if (!C.IsPlayer()) return next(args);

    const p0 = C.ArousalSettings.Progress;
    const t0 = C.ArousalSettings.OrgasmTimer;

    const ret = next(args);

    const p1 = C.ArousalSettings.Progress;
    const t1 = C.ArousalSettings.OrgasmTimer;

    const hadActiveTimer = isOrgasmTimerActive(t0);
    const hasActiveTimer = isOrgasmTimerActive(t1);
    const orgasmStarted = hasActiveTimer && (!hadActiveTimer || t1 !== t0);

    const blocked = p0 >= 100 && !orgasmStarted && p1 < 100;
    if (blocked) {
      const base = playerLastUncappedArousal != null ? playerLastUncappedArousal : p0;
      const overflow = Math.max(0, base - 100);
      storedDesire = storedDesire * 0.5 + overflow;
    }
    playerLastUncappedArousal = null;
    return ret;
  });

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
}
