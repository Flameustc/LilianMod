export const PLUGIN_KEY = "LilianMod";
export const SETTINGS_VERSION = "v0.1.0";
const BACKUP_SUFFIX = "Backup";

export interface ChatControlSetting {
  customGarbleEnabled: boolean;
  garbleSound: string;
}

export interface LilianSettings {
  ChatControlSetting: ChatControlSetting;
}

export function getDefaultSettings(): LilianSettings {
  return {
    ChatControlSetting: {
      customGarbleEnabled: true,
      garbleSound: "呜",
    },
  };
}

export function getBackupStorageKey(memberNumber: number): string {
  return `${PLUGIN_KEY}_${memberNumber}_${BACKUP_SUFFIX}`;
}

export function sanitizeSettings(input: unknown): LilianSettings {
  const fallback = getDefaultSettings();
  if (!input || typeof input !== "object") return fallback;
  const raw = input as Partial<LilianSettings>;
  const chatControl = raw.ChatControlSetting as Partial<ChatControlSetting> | undefined;
  return {
    ChatControlSetting: {
      customGarbleEnabled: typeof chatControl?.customGarbleEnabled === "boolean"
        ? chatControl.customGarbleEnabled
        : fallback.ChatControlSetting.customGarbleEnabled,
      garbleSound: typeof chatControl?.garbleSound === "string" && chatControl.garbleSound.trim().length > 0
        ? chatControl.garbleSound
        : fallback.ChatControlSetting.garbleSound,
    },
  };
}
