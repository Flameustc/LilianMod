export const PLUGIN_KEY = "LilianMod";
/** 仅写入存盘元数据（如新于旧备份比对），不参与「能否加载」判断。 */
export const SETTINGS_VERSION = "v0.3.0";
const BACKUP_SUFFIX = "Backup";

export interface ChatControlSetting {
  customGarbleEnabled: boolean;
  garbleSound: string;
  actionMessageReplaceEnabled: boolean;
}

/** 敏感度等级（Sensitivity level）0–10：施加于各类行为的 arousal 封顶加成（×10 并入 cap，封顶 100）。 */
export interface OrgasmControlSetting {
  sensitivityLevel: number;
  forceOrgasmEnabled: boolean;
  /** 仅当累积欲望值大于此数（0–100）时才触发强制高潮；默认 0 表示不额外门槛。 */
  forceOrgasmDesireThreshold: number;
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
      actionMessageReplaceEnabled: false,
    },
    OrgasmControlSetting: {
      sensitivityLevel: 0,
      forceOrgasmEnabled: false,
      forceOrgasmDesireThreshold: 0,
    },
  };
}

export function getBackupStorageKey(memberNumber: number): string {
  return `${PLUGIN_KEY}_${memberNumber}_${BACKUP_SUFFIX}`;
}

/**
 * 从任意存盘对象裁剪为当前 `LilianSettings`：
 * 只读取当前 schema 中存在的配置项；存盘里多余字段一律忽略；
 * 某项缺失或类型/取值不兼容则该项用默认值。
 */
export function sanitizeSettings(input: unknown): LilianSettings {
  const fallback = getDefaultSettings();
  if (!input || typeof input !== "object") return fallback;
  const raw = input as Record<string, unknown>;

  const chatControl = raw.ChatControlSetting;
  const orgasm = raw.OrgasmControlSetting;

  let sensitivityLevel = fallback.OrgasmControlSetting.sensitivityLevel;
  let forceOrgasmEnabled = fallback.OrgasmControlSetting.forceOrgasmEnabled;
  let forceOrgasmDesireThreshold = fallback.OrgasmControlSetting.forceOrgasmDesireThreshold;
  if (orgasm && typeof orgasm === "object") {
    const o = orgasm as Record<string, unknown>;
    const ov = o.sensitivityLevel;
    if (typeof ov === "number" && Number.isFinite(ov)) {
      sensitivityLevel = Math.floor(ov);
      if (sensitivityLevel < 0) sensitivityLevel = 0;
      if (sensitivityLevel > 10) sensitivityLevel = 10;
    }
    if (typeof o.forceOrgasmEnabled === "boolean") {
      forceOrgasmEnabled = o.forceOrgasmEnabled;
    }
    const th = o.forceOrgasmDesireThreshold;
    if (typeof th === "number" && Number.isFinite(th)) {
      forceOrgasmDesireThreshold = Math.min(100, Math.max(0, Math.floor(th)));
    }
  }

  let customGarbleEnabled = fallback.ChatControlSetting.customGarbleEnabled;
  let garbleSound = fallback.ChatControlSetting.garbleSound;
  let actionMessageReplaceEnabled = fallback.ChatControlSetting.actionMessageReplaceEnabled;
  if (chatControl && typeof chatControl === "object") {
    const c = chatControl as Record<string, unknown>;
    if (typeof c.customGarbleEnabled === "boolean") {
      customGarbleEnabled = c.customGarbleEnabled;
    }
    if (typeof c.garbleSound === "string" && c.garbleSound.trim().length > 0) {
      garbleSound = c.garbleSound;
    }
    if (typeof c.actionMessageReplaceEnabled === "boolean") {
      actionMessageReplaceEnabled = c.actionMessageReplaceEnabled;
    }
  }

  return {
    ChatControlSetting: {
      customGarbleEnabled,
      garbleSound,
      actionMessageReplaceEnabled,
    },
    OrgasmControlSetting: {
      sensitivityLevel,
      forceOrgasmEnabled,
      forceOrgasmDesireThreshold,
    },
  };
}
