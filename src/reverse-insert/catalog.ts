/**
 * 主动插入（reverse insert）的纯数据与筛选。
 *
 * 合法性不在这里重写。调用方必须先用原版 PenetrateSlow / PenetrateFast 的
 * `ActivityCheckPrerequisites` + `ActivityGenerateItemActivitiesFromNeed`
 *（acting = 穿着可插入物的一方，acted = 发起插入的一方，group = 发起方的孔位）
 * 得到 `holeLegal` / `itemsForHole`，这里只决定按钮出现在哪个焦点部位。
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
  hole: ReverseHole;
  speed: ReverseSpeed;
  vanillaName: "PenetrateSlow" | "PenetrateFast";
  /** 注册进 ActivityFemale3DCG 的进度上限。保持 0，避免未装 Lilian 的对端把这条自定义活动当成对穿着者孔位的刺激。 */
  registeredMaxProgress: 0;
  activityId: number;
  label: string;
  chat: string;
}

const HOLE_LABEL: Record<ReverseHole, string> = {
  ItemVulva: "阴道",
  ItemButt: "后穴",
  ItemMouth: "口腔",
};

const HOLE_CHAT: Record<ReverseHole, string> = {
  ItemVulva: "阴道",
  ItemButt: "后穴",
  ItemMouth: "嘴",
};

export function vanillaPenetrateName(speed: ReverseSpeed): "PenetrateSlow" | "PenetrateFast" {
  return speed === "Fast" ? "PenetrateFast" : "PenetrateSlow";
}

export function reverseInsertActivityName(hole: ReverseHole, speed: ReverseSpeed): string {
  const holeKey = hole === "ItemVulva" ? "Vulva" : hole === "ItemButt" ? "Butt" : "Mouth";
  return `LilianReverseInsert${holeKey}${speed}`;
}

function buildSpecs(): ReverseInsertSpec[] {
  const specs: ReverseInsertSpec[] = [];
  let offset = 0;
  for (const hole of REVERSE_HOLES) {
    for (const speed of REVERSE_SPEEDS) {
      const pace = speed === "Fast" ? "快" : "慢";
      const verb = speed === "Fast" ? "用力含入" : "慢慢含入";
      specs.push({
        name: reverseInsertActivityName(hole, speed),
        hole,
        speed,
        vanillaName: vanillaPenetrateName(speed),
        registeredMaxProgress: 0,
        activityId: REVERSE_INSERT_ACTIVITY_ID_BASE + offset,
        label: `主动插入（${HOLE_LABEL[hole]}·${pace}）`,
        chat: `SourceCharacter主动用${HOLE_CHAT[hole]}${verb}TargetCharacter的ActivityAsset。`,
      });
      offset += 1;
    }
  }
  return specs;
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
 * 原版插入检查的角色方向。只允许这一组，避免把发起方和穿着方写反。
 * - acting：穿着可插入物、在原版里执行 Penetrate* 的一方
 * - acted：被插入的一方（主动插入里是点击活动的人）
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

export function reverseInsertChatContentKey(activityName: string): string {
  return `ChatOther-ItemVulva-${activityName}`;
}

/** 与动作扩展（XiaoSuActivity）相同的缺词回退标签，让没装 Lilian 的客户端也能看到整句。 */
export function missingActivityTextTag(contentKey: string): string {
  return `MISSING TEXT IN "${ACTIVITY_DICTIONARY_FILE}": ${contentKey}`;
}

export function reverseInsertDictionaryText(key: string): string | null {
  const spec = REVERSE_INSERT_SPECS.find((entry) => key.includes(entry.name));
  if (!spec) return null;
  if (key.startsWith("Chat")) return spec.chat;
  if (key.startsWith("Label-") || key.startsWith("Activity")) return spec.label;
  return spec.label;
}

export interface ReverseInsertItemIdentity {
  group: string;
  activityGroup: string;
  name: string;
}

/**
 * 按钮出现的焦点部位。
 * ItemVulva 与原版 SuckPenetrateItem / TargetNeeds-PenetrateItem 一样，是「对方身上任意可插入物」的入口。
 * 物品自己的活动部位（手持镜像到 ItemHands、骨盆、嘴、臀等）上也会出现。
 */
export function penetrativeItemVisibleOnFocus(item: ReverseInsertItemIdentity, focusGroup: string, focusActivityGroup: string): boolean {
  if (item.activityGroup === focusActivityGroup || item.group === focusGroup || item.group === focusActivityGroup) {
    return true;
  }
  return focusActivityGroup === "ItemVulva" || focusGroup === "ItemVulva";
}

export interface ReverseInsertOffer<T> {
  name: string;
  hole: ReverseHole;
  speed: ReverseSpeed;
  item: T;
}

export function queryReverseInsertOffers<T>(args: {
  wearerIsPlayer: boolean;
  zonePossible: boolean;
  blockedByDistance: boolean;
  focusGroup: string;
  focusActivityGroup: string;
  holeLegal: (hole: ReverseHole, speed: ReverseSpeed) => boolean;
  itemsForHole: (hole: ReverseHole) => readonly T[];
  describeItem: (item: T) => ReverseInsertItemIdentity;
}): ReverseInsertOffer<T>[] {
  if (args.wearerIsPlayer || !args.zonePossible || args.blockedByDistance) return [];

  const offers: ReverseInsertOffer<T>[] = [];
  for (const hole of REVERSE_HOLES) {
    for (const speed of REVERSE_SPEEDS) {
      if (!args.holeLegal(hole, speed)) continue;
      const spec = reverseInsertSpecByName(reverseInsertActivityName(hole, speed));
      if (!spec) continue;
      for (const item of args.itemsForHole(hole)) {
        if (!penetrativeItemVisibleOnFocus(args.describeItem(item), args.focusGroup, args.focusActivityGroup)) continue;
        offers.push({ name: spec.name, hole, speed, item });
      }
    }
  }
  return offers;
}
