export const PLUGIN_KEY = "LilianMod";
export const SETTINGS_VERSION = "v0.1.0";
const BACKUP_SUFFIX = "Backup";

export interface ChatControlSetting {
  customGarbleEnabled: boolean;
  garbleSound: string;
}

/** 0–10：对应施加在所有行为上的兴奋加成（×10 并入 arousal cap，封顶 100）。 */
export interface OrgasmControlSetting {
  hornyLevel: number;
}

export interface LilianSettings {
  ChatControlSetting: ChatControlSetting;
  OrgasmControlSetting: OrgasmControlSetting;
}

export function getDefaultSettings(): LilianSettings {
  return {
    ChatControlSetting: {
      customGarbleEnabled: true,
      garbleSound: "呜",
    },
    OrgasmControlSetting: {
      hornyLevel: 0,
    },
  };
}

export function getBackupStorageKey(memberNumber: number): string {
  return `${PLUGIN_KEY}_${memberNumber}_${BACKUP_SUFFIX}`;
}

export function sanitizeSettings(input: unknown): LilianSettings {
  const fallback = getDefaultSettings();
  if (!input || typeof input !== "object") return fallback;
  const raw = input as Partial<LilianSettings> & {
    OrgasmManagementSetting?: Partial<OrgasmControlSetting>;
  };
  const chatControl = raw.ChatControlSetting as Partial<ChatControlSetting> | undefined;
  const orgasm =
    raw.OrgasmControlSetting
    ?? raw.OrgasmManagementSetting;
  let horny = typeof orgasm?.hornyLevel === "number" && Number.isFinite(orgasm.hornyLevel)
    ? Math.floor(orgasm.hornyLevel)
    : fallback.OrgasmControlSetting.hornyLevel;
  if (horny < 0) horny = 0;
  if (horny > 10) horny = 10;
  return {
    ChatControlSetting: {
      customGarbleEnabled: typeof chatControl?.customGarbleEnabled === "boolean"
        ? chatControl.customGarbleEnabled
        : fallback.ChatControlSetting.customGarbleEnabled,
      garbleSound: typeof chatControl?.garbleSound === "string" && chatControl.garbleSound.trim().length > 0
        ? chatControl.garbleSound
        : fallback.ChatControlSetting.garbleSound,
    },
    OrgasmControlSetting: {
      hornyLevel: horny,
    },
  };
}
