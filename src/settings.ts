export const PLUGIN_KEY = "LilianMod";
const BACKUP_SUFFIX = "Backup";

export interface LilianSettings {
  dummyEnabled: boolean;
}

export function getDefaultSettings(): LilianSettings {
  return {
    dummyEnabled: false,
  };
}

export function getBackupStorageKey(memberNumber: number): string {
  return `${PLUGIN_KEY}_${memberNumber}_${BACKUP_SUFFIX}`;
}

export function sanitizeSettings(input: unknown): LilianSettings {
  const fallback = getDefaultSettings();
  if (!input || typeof input !== "object") return fallback;
  const raw = input as Partial<LilianSettings>;
  return {
    dummyEnabled: typeof raw.dummyEnabled === "boolean" ? raw.dummyEnabled : fallback.dummyEnabled,
  };
}
