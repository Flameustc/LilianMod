/**
 * 主动插入（reverse insert）的纯数据与筛选。
 *
 * 只有慢/快两个活动。按钮出现在「将被插入的一方」自己的口、阴、后穴上，
 * 且仅当对方角色面板正开着（BC 会同步画出自己）。合法性仍由调用方用原版
 * PenetrateSlow / PenetrateFast 的检查得到，角色为 acting = 穿着方，acted = 发起方。
 */

export type ReverseHole = "ItemVulva" | "ItemButt" | "ItemMouth";
export type ReverseSpeed = "Slow" | "Fast";

export const REVERSE_HOLES: readonly ReverseHole[] = ["ItemVulva", "ItemButt", "ItemMouth"];
export const REVERSE_SPEEDS: readonly ReverseSpeed[] = ["Slow", "Fast"];

/** 高于当前 R133 最大 ActivityID（71），避免挤占原版偏好串下标；读越界时因子回落为 2（普通）。 */
export const REVERSE_INSERT_ACTIVITY_ID_BASE = 240;

export const ACTIVITY_DICTIONARY_FILE = "ActivityDictionary.csv";

export interface ReverseInsertSpec {
  name: string;
  speed: ReverseSpeed;
  vanillaName: "PenetrateSlow" | "PenetrateFast";
  /** 注册进 ActivityFemale3DCG 的进度上限。保持 0，避免未装 Lilian 的对端把这条自定义活动当成对穿着者孔位的刺激。 */
  registeredMaxProgress: 0;
  activityId: number;
  label: string;
  /** 每个孔位四句，发送时随机抽一句。占位符保持 SourceCharacter / TargetCharacter / ActivityAsset。 */
  chat: Record<ReverseHole, readonly [string, string, string, string]>;
}

const REVERSE_INSERT_CHAT: Record<ReverseSpeed, Record<ReverseHole, readonly [string, string, string, string]>> = {
  Slow: {
    ItemVulva: [
      "SourceCharacter主动用阴道慢慢含入TargetCharacter的ActivityAsset。",
      "SourceCharacter把TargetCharacter的ActivityAsset缓缓纳入阴道。",
      "SourceCharacter主动沉腰，用阴道一点点吞下TargetCharacter的ActivityAsset。",
      "SourceCharacter主动用阴阜贴上TargetCharacter的ActivityAsset，慢慢含进去。",
    ],
    ItemButt: [
      "SourceCharacter主动用后穴慢慢含入TargetCharacter的ActivityAsset。",
      "SourceCharacter把TargetCharacter的ActivityAsset缓缓纳入后穴。",
      "SourceCharacter主动翘起臀，一点点把TargetCharacter的ActivityAsset吞进后穴。",
      "SourceCharacter主动用后穴口贴住TargetCharacter的ActivityAsset，慢慢吃进去。",
    ],
    ItemMouth: [
      "SourceCharacter主动用嘴慢慢含入TargetCharacter的ActivityAsset。",
      "SourceCharacter把TargetCharacter的ActivityAsset缓缓含进嘴里。",
      "SourceCharacter主动俯身，一点点把TargetCharacter的ActivityAsset吞进嘴里。",
      "SourceCharacter主动用唇舌贴上TargetCharacter的ActivityAsset，慢慢含住。",
    ],
  },
  Fast: {
    ItemVulva: [
      "SourceCharacter主动用阴道用力含入TargetCharacter的ActivityAsset。",
      "SourceCharacter猛地把TargetCharacter的ActivityAsset吞进阴道。",
      "SourceCharacter主动抬臀迎上，一口气把TargetCharacter的ActivityAsset吃进阴道。",
      "SourceCharacter迫不及待地用阴道套住TargetCharacter的ActivityAsset，快速吞吐。",
    ],
    ItemButt: [
      "SourceCharacter主动用后穴用力含入TargetCharacter的ActivityAsset。",
      "SourceCharacter猛地把TargetCharacter的ActivityAsset吞进后穴。",
      "SourceCharacter主动向后坐，一口气把TargetCharacter的ActivityAsset吃进后穴。",
      "SourceCharacter迫不及待地用后穴套住TargetCharacter的ActivityAsset，快速吞吐。",
    ],
    ItemMouth: [
      "SourceCharacter主动用嘴用力含入TargetCharacter的ActivityAsset。",
      "SourceCharacter猛地把TargetCharacter的ActivityAsset吞进嘴里。",
      "SourceCharacter主动张口迎上，一口气把TargetCharacter的ActivityAsset含到底。",
      "SourceCharacter迫不及待地用嘴套住TargetCharacter的ActivityAsset，快速吞吐。",
    ],
  },
};

export function vanillaPenetrateName(speed: ReverseSpeed): "PenetrateSlow" | "PenetrateFast" {
  return speed === "Fast" ? "PenetrateFast" : "PenetrateSlow";
}

export function reverseInsertActivityName(speed: ReverseSpeed): string {
  return speed === "Fast" ? "LilianReverseInsertFast" : "LilianReverseInsertSlow";
}

function chatFor(speed: ReverseSpeed): Record<ReverseHole, readonly [string, string, string, string]> {
  return REVERSE_INSERT_CHAT[speed];
}

function buildSpecs(): ReverseInsertSpec[] {
  return REVERSE_SPEEDS.map((speed, offset) => ({
    name: reverseInsertActivityName(speed),
    speed,
    vanillaName: vanillaPenetrateName(speed),
    registeredMaxProgress: 0,
    activityId: REVERSE_INSERT_ACTIVITY_ID_BASE + offset,
    label: speed === "Fast" ? "主动插入·快" : "主动插入·慢",
    chat: chatFor(speed),
  }));
}

export const REVERSE_INSERT_SPECS: readonly ReverseInsertSpec[] = buildSpecs();

const SPEC_BY_NAME = new Map(REVERSE_INSERT_SPECS.map((spec) => [spec.name, spec]));

export function reverseInsertSpecByName(name: string): ReverseInsertSpec | undefined {
  return SPEC_BY_NAME.get(name);
}

export function isReverseInsertName(name: string): boolean {
  return SPEC_BY_NAME.has(name);
}

/**
 * 穿着方自己点原版插入时，给自己加的是 `ActivityRunSelf`：
 * 区域固定为 `ActivityOnOther`，活动名是 PenetrateSlow/Fast，物品原样传入，
 * 系数完全由原版（以及 Lilian 对 `ActivitySetArousalTimer` 的敏感度钩子）计算。
 * 这里不另写倍数。
 */
export const EQUIPPER_AROUSAL_ZONE = "ActivityOnOther" as const;

export interface EquipperArousalPlan {
  vanillaName: "PenetrateSlow" | "PenetrateFast";
  zone: typeof EQUIPPER_AROUSAL_ZONE;
  source: "equipper";
  target: "initiator";
  forwardAsset: true;
}

/**
 * 发起方发出的活动消息。只有穿着方自己的客户端（消息目标、且不是发送者）才重放原版「对他人」进度。
 * 没装 Lilian 的客户端认不出活动名，`ActivityEffect` 会直接返回，进度不加；句子仍靠 MISSING TEXT 回退显示。
 */
export function equipperArousalPlan(input: {
  activityName: string;
  localPlayerIsTarget: boolean;
  localPlayerIsSender: boolean;
}): EquipperArousalPlan | null {
  if (!input.localPlayerIsTarget || input.localPlayerIsSender) return null;
  const spec = reverseInsertSpecByName(input.activityName);
  if (!spec) return null;
  return {
    vanillaName: spec.vanillaName,
    zone: EQUIPPER_AROUSAL_ZONE,
    source: "equipper",
    target: "initiator",
    forwardAsset: true,
  };
}

/**
 * 原版插入检查的角色方向。
 * - acting：穿着可插入物、在原版里执行 Penetrate* 的一方
 * - acted：被插入的一方（主动插入里是点击自己孔位的人）
 * - permissions.other：`ActivityCheckPermissions` 的 Other。true = 施予（giving），false = 承受（receiving）
 */
export interface VanillaPenetrateCheckPlan {
  activityName: "PenetrateSlow" | "PenetrateFast";
  acting: "wearer";
  acted: "initiator";
  group: ReverseHole;
  permissions: ReadonlyArray<{ who: "wearer" | "initiator"; other: boolean }>;
  /** `ActivityGenerateItemActivitiesFromNeed` 的 useTargetItems。false = 物品来自 acting（穿着方）。 */
  useTargetItems: false;
  needsItem: "PenetrateItem";
}

export function describeVanillaPenetrateCheck(hole: ReverseHole, speed: ReverseSpeed): VanillaPenetrateCheckPlan {
  return {
    activityName: vanillaPenetrateName(speed),
    acting: "wearer",
    acted: "initiator",
    group: hole,
    permissions: [
      { who: "wearer", other: true },
      { who: "initiator", other: false },
    ],
    useTargetItems: false,
    needsItem: "PenetrateItem",
  };
}

export function reverseInsertChatPool(hole: ReverseHole, speed: ReverseSpeed): readonly [string, string, string, string] {
  return REVERSE_INSERT_CHAT[speed][hole];
}

/** `random` 取 [0, 1)。同一句交给字典键、回退文本和 renderChat，避免各端各抽一次。 */
export function pickReverseInsertChat(hole: ReverseHole, speed: ReverseSpeed, random: number = Math.random()): { index: number; text: string } {
  const pool = reverseInsertChatPool(hole, speed);
  const unit = Number.isFinite(random) ? Math.min(0.999999, Math.max(0, random)) : 0;
  const index = Math.floor(unit * pool.length);
  return { index, text: pool[index] };
}

export function reverseInsertChatContentKey(activityName: string, hole: ReverseHole, variant: number): string {
  return `ChatSelf-${hole}-${activityName}-${variant}`;
}

function chatVariantIndex(key: string): number {
  const match = /-([0-3])$/.exec(key);
  if (!match) return 0;
  return Number(match[1]);
}

/** 与动作扩展（XiaoSuActivity）相同的缺词回退标签，让没装 Lilian 的客户端也能看到整句。 */
export function missingActivityTextTag(contentKey: string): string {
  return `MISSING TEXT IN "${ACTIVITY_DICTIONARY_FILE}": ${contentKey}`;
}

export function reverseInsertDictionaryText(key: string): string | null {
  const spec = REVERSE_INSERT_SPECS.find((entry) => key.includes(entry.name));
  if (!spec) return null;
  if (key.startsWith("Chat")) {
    const hole = REVERSE_HOLES.find((entry) => key.includes(entry)) ?? "ItemVulva";
    const pool = spec.chat[hole];
    return pool[chatVariantIndex(key)] ?? pool[0];
  }
  return spec.label;
}

/**
 * 当前焦点是不是可以被原版 Penetrate* 打中的孔。
 * `focusActivityGroup` 是 `ActivityGetGroupOrMirror` 之后的名字（ItemMouth2/3 会回到 ItemMouth）。
 */
export function penetrableHole(focusGroup: string, focusActivityGroup: string): ReverseHole | null {
  for (const name of [focusActivityGroup, focusGroup]) {
    if (name === "ItemVulva" || name === "ItemButt" || name === "ItemMouth") return name;
  }
  return null;
}

/**
 * BC 对话框：`CurrentCharacter` 是右侧打开的那个人。
 * - 只打开自己时，CurrentCharacter 就是玩家，左侧不会再画一个自己，不提供主动插入。
 * - 打开了别人（穿着方）时，自己被同步画在左侧；只在自己的口/阴/后穴上加慢/快两个动作。
 */
export function reverseInsertSheetAllowsOffer(input: {
  /** null：没有打开的角色页。true：打开的是自己。false：打开的是别人。 */
  openedSheetIsPlayer: boolean | null;
  zoneOwnerIsPlayer: boolean;
}): boolean {
  return input.openedSheetIsPlayer === false && input.zoneOwnerIsPlayer;
}

export interface ReverseInsertOffer<T> {
  name: string;
  hole: ReverseHole;
  speed: ReverseSpeed;
  item: T;
}

export function queryReverseInsertOffers<T>(args: {
  openedSheetIsPlayer: boolean | null;
  zoneOwnerIsPlayer: boolean;
  zonePossible: boolean;
  wearerOutOfRange: boolean;
  focusHole: ReverseHole | null;
  holeLegal: (speed: ReverseSpeed) => boolean;
  items: () => readonly T[];
}): ReverseInsertOffer<T>[] {
  if (!reverseInsertSheetAllowsOffer({
    openedSheetIsPlayer: args.openedSheetIsPlayer,
    zoneOwnerIsPlayer: args.zoneOwnerIsPlayer,
  })) {
    return [];
  }
  if (!args.zonePossible || args.wearerOutOfRange || args.focusHole == null) return [];

  const legalSpeeds = REVERSE_SPEEDS.filter((speed) => args.holeLegal(speed));
  if (legalSpeeds.length === 0) return [];

  const hole = args.focusHole;
  const found = args.items();
  const offers: ReverseInsertOffer<T>[] = [];
  for (const speed of legalSpeeds) {
    const spec = reverseInsertSpecByName(reverseInsertActivityName(speed));
    if (!spec) continue;
    for (const item of found) {
      offers.push({ name: spec.name, speed, hole, item });
    }
  }
  return offers;
}
