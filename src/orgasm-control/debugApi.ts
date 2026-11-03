/**
 * Console-only debug helpers. Not a preference-screen control.
 * `window.LilianMod.debug` is installed at startup so club-console tests can
 * set arousal and hidden desire exactly, without waiting out decay.
 */

export interface DesireDebugState {
  desire: number;
  lastDecayAt: number | null;
}

export interface ArousalDebugTarget {
  ArousalSettings?: {
    Progress: number;
    ProgressTimer: number;
  } | null;
}

export interface LilianDebugApi {
  /**
   * Console-only switch. Setters no-op while false.
   * Defaults to true so `LilianMod.debug.setDesire` / `setArousal` work immediately.
   */
  enabled: boolean;
  /** Hidden desire. Clamped to >= 0. Restarts the decay clock at `now`. */
  setDesire(value: number): number;
  getDesire(): number;
  /** Player arousal Progress, clamped to 0–100. Clears ProgressTimer and chat-syncs. */
  setArousal(value: number): number;
  getArousal(): number;
}

/** Finite numbers only. Negative desire becomes 0. Invalid input returns null (caller keeps the previous value). */
export function clampDebugDesire(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value < 0 ? 0 : value;
}

/** Finite numbers only. Clamped to the visible arousal meter, 0–100. */
export function clampDebugArousal(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

/**
 * Writes desire and anchors decay at `now`, so elapsed time before the call is not applied.
 * Invalid values leave the state unchanged.
 */
export function commitDebugDesire(state: DesireDebugState, value: unknown, now: number): DesireDebugState {
  const next = clampDebugDesire(value);
  if (next == null) return state;
  state.desire = next;
  if (Number.isFinite(now)) state.lastDecayAt = now;
  return state;
}

/** Sets Progress and clears ProgressTimer so the meter stays on the requested value. */
export function commitDebugArousal(target: ArousalDebugTarget, value: unknown): number | null {
  const next = clampDebugArousal(value);
  if (next == null) {
    const current = target.ArousalSettings?.Progress;
    return typeof current === "number" && Number.isFinite(current) ? current : null;
  }
  const settings = target.ArousalSettings;
  if (settings == null) return next;
  settings.Progress = next;
  settings.ProgressTimer = 0;
  return settings.Progress;
}

export function readDebugArousal(target: ArousalDebugTarget): number {
  const progress = target.ArousalSettings?.Progress;
  return typeof progress === "number" && Number.isFinite(progress) ? progress : 0;
}

export function createLilianDebugApi(io: {
  readDesire(): number;
  writeDesire(value: number, now: number): number;
  readArousal(): number;
  writeArousal(value: number): number;
  now(): number;
}): LilianDebugApi {
  const api: LilianDebugApi = {
    enabled: true,
    setDesire(value) {
      if (!api.enabled) return io.readDesire();
      return io.writeDesire(value, io.now());
    },
    getDesire() {
      return io.readDesire();
    },
    setArousal(value) {
      if (!api.enabled) return io.readArousal();
      return io.writeArousal(value);
    },
    getArousal() {
      return io.readArousal();
    },
  };
  return api;
}
