import type { ModSDKModAPI } from "bondage-club-mod-sdk";
import type { BCCharacter } from "../types/bc";

export type RuinedOrgasmPathEvent = {
  at: number;
  character: BCCharacter;
  ruinedBefore: boolean;
  progressAfter: number;
  orgasmStageAfter: number | undefined;
  orgasmTimerAfter: number | undefined;
};

const listeners: Array<(ev: RuinedOrgasmPathEvent) => void> = [];
let installed = false;

let lastEvent: RuinedOrgasmPathEvent | null = null;

export function onRuinedOrgasmPath(cb: (ev: RuinedOrgasmPathEvent) => void): () => void {
  listeners.push(cb);
  return () => {
    const i = listeners.indexOf(cb);
    if (i >= 0) listeners.splice(i, 1);
  };
}

export function getLastRuinedOrgasmEvent(): RuinedOrgasmPathEvent | null {
  return lastEvent;
}

function notify(ev: RuinedOrgasmPathEvent): void {
  lastEvent = ev;
  for (const cb of listeners) {
    try {
      cb(ev);
    } catch {
      /* ignore */
    }
  }
}

function isLikelyRuinedPath(
  ruinedBefore: boolean,
  progressAfter: number,
  stageAfter: number | undefined,
  timerAfter: number | undefined,
  now: number
): boolean {
  if (!ruinedBefore) return false;
  const timerActive = timerAfter != null && typeof timerAfter === "number" && timerAfter > now;
  if (stageAfter === 2 && timerActive) return false;
  const progressInRuinRange = progressAfter >= 60 && progressAfter <= 92;
  const timerCleared = timerAfter == null || timerAfter === 0 || !timerActive;
  const stageIdle = stageAfter == null || stageAfter === 0;
  return timerCleared && stageIdle && progressInRuinRange;
}

/** Higher priority than Lilian `ActivityOrgasmStart` force hook so `next` runs full inner chain. */
export function registerRuinedOrgasmIntercept(mod: ModSDKModAPI, priority = 115): void {
  if (installed) return;
  installed = true;

  mod.hookFunction("ActivityOrgasmStart", priority, (args, next) => {
    const C = args[0];
    const now = CurrentTime;
    if (!C.IsPlayer()) {
      return next(args);
    }
    const ruinedBefore = ActivityOrgasmRuined === true;
    next(args);
    const arousal = C.ArousalSettings as BCCharacter["ArousalSettings"] & {
      OrgasmTimer?: number;
      OrgasmStage?: number;
    };
    const progressAfter = typeof arousal.Progress === "number" ? arousal.Progress : 0;
    const stageAfter = arousal.OrgasmStage;
    const timerAfter = arousal.OrgasmTimer;
    if (isLikelyRuinedPath(ruinedBefore, progressAfter, stageAfter, timerAfter, now)) {
      notify({
        at: now,
        character: C,
        ruinedBefore,
        progressAfter,
        orgasmStageAfter: stageAfter,
        orgasmTimerAfter: timerAfter,
      });
    }
  });
}
