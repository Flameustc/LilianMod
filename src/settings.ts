export const PLUGIN_KEY = "LilianMod";
/** 仅写入存盘元数据（如新于旧备份比对），不参与「能否加载」判断。 */
export const SETTINGS_VERSION = "v0.3.0";
const BACKUP_SUFFIX = "Backup";

export interface ChatControlSetting {
  customGarbleEnabled: boolean;
  garbleSound: string;
}

/** 敏感度等级（Sensitivity level）0–10：施加于各类行为的 arousal 封顶加成（×10 并入 cap，封顶 100）。 */
export interface OrgasmControlSetting {
  sensitivityLevel: number;
  forceOrgasmEnabled: boolean;
  /** 欲望达到或超过此值（0–100）时触发强制高潮。默认 0：欲望恒 ≥ 0，等于不设额外门槛。 */
  forceOrgasmDesireThreshold: number;
  /**
   * 除 `Player.Ownership` 主人以外、也视为女主人的成员号。
   * 互动来源或目标是女主人时，玩家进度因子 ×2。
   */
  mistressMemberNumbers: number[];
}

const MISTRESS_MEMBER_LIMIT = 32;

function pushMistressMember(out: number[], seen: Set<number>, n: number): void {
  if (!Number.isInteger(n) || n <= 0 || n > 999_999_999) return;
  if (seen.has(n) || out.length >= MISTRESS_MEMBER_LIMIT) return;
  seen.add(n);
  out.push(n);
}

/** 从存盘数组或输入框文本解析女主人成员号：去重、正整数、最多 32 个。 */
export function parseMistressMemberNumbers(value: unknown): number[] {
  const out: number[] = [];
  const seen = new Set<number>();
  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === "number" && Number.isInteger(item)) {
        pushMistressMember(out, seen, item);
      } else if (typeof item === "string") {
        for (const part of item.split(/[^0-9]+/)) {
          if (!part) continue;
          pushMistressMember(out, seen, Number.parseInt(part, 10));
        }
      }
    }
    return out;
  }
  if (typeof value === "string") {
    for (const part of value.split(/[^0-9]+/)) {
      if (!part) continue;
      pushMistressMember(out, seen, Number.parseInt(part, 10));
    }
  }
  return out;
}

export function formatMistressMemberNumbers(values: readonly number[]): string {
  return values.join(", ");
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
      sensitivityLevel: 0,
      forceOrgasmEnabled: false,
      forceOrgasmDesireThreshold: 0,
      mistressMemberNumbers: [],
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
  let mistressMemberNumbers = fallback.OrgasmControlSetting.mistressMemberNumbers;
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
    if ("mistressMemberNumbers" in o) {
      mistressMemberNumbers = parseMistressMemberNumbers(o.mistressMemberNumbers);
    }
  }

  let customGarbleEnabled = fallback.ChatControlSetting.customGarbleEnabled;
  let garbleSound = fallback.ChatControlSetting.garbleSound;
  if (chatControl && typeof chatControl === "object") {
    const c = chatControl as Record<string, unknown>;
    if (typeof c.customGarbleEnabled === "boolean") {
      customGarbleEnabled = c.customGarbleEnabled;
    }
    if (typeof c.garbleSound === "string" && c.garbleSound.trim().length > 0) {
      garbleSound = c.garbleSound;
    }
  }

  return {
    ChatControlSetting: {
      customGarbleEnabled,
      garbleSound,
    },
    OrgasmControlSetting: {
      sensitivityLevel,
      forceOrgasmEnabled,
      forceOrgasmDesireThreshold,
      mistressMemberNumbers,
    },
  };
}
