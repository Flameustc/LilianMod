import { getBackupStorageKey, getDefaultSettings, LilianSettings, PLUGIN_KEY, sanitizeSettings, SETTINGS_VERSION } from "./settings";

interface PersistedSettings {
  settings: LilianSettings;
  version: string;
  updatedAt: number;
}

function compareVersion(a: string, b: string): number {
  const normA = a.replace(/^v/i, "");
  const normB = b.replace(/^v/i, "");
  const pa = normA.split(".").map((x) => Number.parseInt(x, 10) || 0);
  const pb = normB.split(".").map((x) => Number.parseInt(x, 10) || 0);
  const maxLen = Math.max(pa.length, pb.length);
  for (let i = 0; i < maxLen; i++) {
    const av = pa[i] ?? 0;
    const bv = pb[i] ?? 0;
    if (av > bv) return 1;
    if (av < bv) return -1;
  }
  return 0;
}

function parseSettings(raw: string | null): PersistedSettings | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;

    // Backward compatibility: old format stored settings object directly.
    if (!("settings" in parsed)) {
      return {
        settings: sanitizeSettings(parsed),
        version: "v0.0.0",
        updatedAt: 0,
      };
    }

    const wrapped = parsed as { settings?: unknown; updatedAt?: unknown; version?: unknown; Version?: unknown };
    const storedVersion = typeof wrapped.version === "string"
      ? wrapped.version
      : typeof wrapped.Version === "string"
        ? wrapped.Version
        : "v0.0.0";
    return {
      settings: sanitizeSettings(wrapped.settings),
      version: storedVersion,
      updatedAt: typeof wrapped.updatedAt === "number" ? wrapped.updatedAt : 0,
    };
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
  const remote = parseSettings(remoteRaw);
  const backup = parseSettings(backupRaw);

  if (!remote && !backup) return defaults;
  if (!remote) return backup!.settings;
  if (!backup) return remote.settings;
  const versionCmp = compareVersion(remote.version, backup.version);
  if (versionCmp > 0) return remote.settings;
  if (versionCmp < 0) return backup.settings;
  return remote.updatedAt >= backup.updatedAt ? remote.settings : backup.settings;
}

export function saveSettings(settings: LilianSettings): void {
  const container = ensureExtensionSettingsContainer();
  const value = JSON.stringify({
    settings: sanitizeSettings(settings),
    version: SETTINGS_VERSION,
    updatedAt: Date.now(),
  });
  container[PLUGIN_KEY] = value;
  localStorage.setItem(getBackupStorageKey(Player.MemberNumber), value);
  ServerPlayerExtensionSettingsSync(PLUGIN_KEY);
}
