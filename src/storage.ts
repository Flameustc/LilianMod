import { getBackupStorageKey, getDefaultSettings, LilianSettings, PLUGIN_KEY, sanitizeSettings } from "./settings";

function parseSettings(raw: string | null): LilianSettings | null {
  if (!raw) return null;
  try {
    return sanitizeSettings(JSON.parse(raw));
  } catch {
    return null;
  }
}

function ensureExtensionSettingsContainer(): Record<string, string> {
  if (!Player.ExtensionSettings) Player.ExtensionSettings = {};
  return Player.ExtensionSettings;
}

export function loadSettings(): LilianSettings {
  const defaults = getDefaultSettings();
  const container = ensureExtensionSettingsContainer();
  const remoteRaw = container[PLUGIN_KEY] ?? null;
  const backupRaw = localStorage.getItem(getBackupStorageKey(Player.MemberNumber));
  const parsed = parseSettings(remoteRaw) ?? parseSettings(backupRaw) ?? defaults;
  return sanitizeSettings(parsed);
}

export function saveSettings(settings: LilianSettings): void {
  const container = ensureExtensionSettingsContainer();
  const value = JSON.stringify(sanitizeSettings(settings));
  container[PLUGIN_KEY] = value;
  localStorage.setItem(getBackupStorageKey(Player.MemberNumber), value);
  ServerPlayerExtensionSettingsSync(PLUGIN_KEY);
}
