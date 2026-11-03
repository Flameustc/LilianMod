import type { ModSDKModAPI } from "bondage-club-mod-sdk";
import type { BCCharacter } from "../types/bc";
import {
  describeVanillaPenetrateCheck,
  isReverseInsertName,
  missingActivityTextTag,
  penetrableHole,
  queryReverseInsertOffers,
  reverseInsertActivityName,
  reverseInsertChatContentKey,
  reverseInsertDictionaryText,
  reverseInsertSpecByName,
  REVERSE_INSERT_SPECS,
  type ReverseHole,
  type ReverseSpeed,
} from "./catalog";

let installed = false;

type GameActivity = {
  Name: string;
  ActivityID?: number;
  MaxProgress?: number;
  Prerequisite?: readonly string[];
  Target?: readonly string[];
  TargetSelf?: readonly string[] | boolean;
};

type GameItemActivity = {
  Activity: GameActivity;
  Item?: {
    Asset: { Name: string; Group: { Name: string; Family?: string } };
    Craft?: { Name?: string };
  };
  Blocked?: "blocked" | "limited";
  Group: string;
};

const registered = new Map<string, GameActivity>();

function familyOf(character: BCCharacter): string {
  return character.AssetFamily || "Female3DCG";
}

function forgetStaleActivities(): void {
  const keep = new Set(REVERSE_INSERT_SPECS.map((spec) => spec.name));
  for (let i = ActivityFemale3DCG.length - 1; i >= 0; i -= 1) {
    const name = ActivityFemale3DCG[i].Name;
    if (name.startsWith("LilianReverseInsert") && !keep.has(name)) {
      ActivityFemale3DCG.splice(i, 1);
    }
  }
  if (typeof ActivityFemale3DCGOrdering === "undefined") return;
  for (let i = ActivityFemale3DCGOrdering.length - 1; i >= 0; i -= 1) {
    const name = ActivityFemale3DCGOrdering[i];
    if (name.startsWith("LilianReverseInsert") && !keep.has(name)) {
      ActivityFemale3DCGOrdering.splice(i, 1);
    }
  }
}

function registerActivities(): void {
  forgetStaleActivities();
  const usedIds = new Set(ActivityFemale3DCG.map((activity) => activity.ActivityID).filter((id): id is number => typeof id === "number"));
  for (const spec of REVERSE_INSERT_SPECS) {
    if (registered.has(spec.name)) continue;
    const existing = ActivityFemale3DCG.find((activity) => activity.Name === spec.name);
    if (existing) {
      registered.set(spec.name, existing);
      continue;
    }
    let activityId = spec.activityId;
    while (usedIds.has(activityId)) activityId += 1;
    usedIds.add(activityId);
    const activity: GameActivity = {
      Name: spec.name,
      ActivityID: activityId,
      MaxProgress: spec.registeredMaxProgress,
      Prerequisite: [],
      Target: [],
      TargetSelf: [],
    };
    ActivityFemale3DCG.push(activity);
    if (typeof ActivityFemale3DCGOrdering !== "undefined" && !ActivityFemale3DCGOrdering.includes(spec.name)) {
      ActivityFemale3DCGOrdering.push(spec.name);
    }
    registered.set(spec.name, activity);
  }
}

function activityNameOf(activity: unknown): string {
  if (typeof activity === "string") return activity;
  if (activity && typeof activity === "object") {
    const record = activity as { Name?: string; Activity?: { Name?: string } };
    return record.Activity?.Name ?? record.Name ?? "";
  }
  return "";
}

function characterFor(planWho: "wearer" | "initiator", wearer: BCCharacter, initiator: BCCharacter): BCCharacter {
  return planWho === "wearer" ? wearer : initiator;
}

/**
 * 右侧打开的是穿着方。只打开自己时 CurrentCharacter 就是玩家，返回 null。
 */
function openedWearer(): BCCharacter | null {
  if (typeof CurrentCharacter === "undefined" || CurrentCharacter == null || CurrentCharacter.IsPlayer()) return null;
  return CurrentCharacter;
}

/**
 * 原版「穿着方插入发起方的这个孔」是否成立。
 * 前置和权限都走原函数，角色按 {@link describeVanillaPenetrateCheck} 对调。
 */
function vanillaHoleLegal(wearer: BCCharacter, initiator: BCCharacter, hole: ReverseHole, speed: ReverseSpeed): boolean {
  const plan = describeVanillaPenetrateCheck(hole, speed);
  const family = familyOf(wearer);
  const vanilla = AssetGetActivity(family, plan.activityName);
  const group = ActivityGetGroupOrMirror(family, plan.group);
  const ours = registered.get(reverseInsertActivityName(speed));
  if (!vanilla || !group || !ours) return false;

  const acting = characterFor(plan.acting, wearer, initiator);
  const acted = characterFor(plan.acted, wearer, initiator);
  if (!ActivityCheckPrerequisites(vanilla, acting, acted, group)) return false;
  for (const permission of plan.permissions) {
    const who = characterFor(permission.who, wearer, initiator);
    if (!ActivityCheckPermissions(vanilla, who, permission.other)) return false;
  }
  // 偏好页可以单独关掉「主动插入」。默认因子为普通，不会比原版插入更松。
  if (!ActivityCheckPermissions(ours, initiator, true)) return false;
  if (!ActivityCheckPermissions(ours, wearer, false)) return false;
  return true;
}

function generatedItems(wearer: BCCharacter, initiator: BCCharacter, hole: ReverseHole): GameItemActivity[] {
  const plan = describeVanillaPenetrateCheck(hole, "Slow");
  const family = familyOf(wearer);
  const vanilla = AssetGetActivity(family, plan.activityName);
  const group = ActivityGetGroupOrMirror(family, plan.group);
  if (!vanilla || !group) return [];
  const acting = characterFor(plan.acting, wearer, initiator);
  const acted = characterFor(plan.acted, wearer, initiator);
  return ActivityGenerateItemActivitiesFromNeed(
    acting,
    acted,
    plan.needsItem,
    vanilla,
    group,
    plan.useTargetItems
  ) as GameItemActivity[];
}

function offersFor(initiator: BCCharacter, wearer: BCCharacter, focusGroup: string): ReturnType<typeof queryReverseInsertOffers<GameItemActivity>> {
  const family = familyOf(initiator);
  const focusActivityGroup = ActivityGetGroupOrMirror(family, focusGroup)?.Name ?? focusGroup;
  const hole = penetrableHole(focusGroup, focusActivityGroup);
  let itemCache: GameItemActivity[] | null = null;
  return queryReverseInsertOffers({
    openedSheetIsPlayer: wearer.IsPlayer() ? true : false,
    zoneOwnerIsPlayer: initiator.IsPlayer(),
    zonePossible: ActivityPossibleOnGroup(initiator, focusGroup),
    wearerOutOfRange: InventoryIsBlockedByDistance(wearer),
    focusHole: hole,
    holeLegal: (speed) => (hole ? vanillaHoleLegal(wearer, initiator, hole, speed) : false),
    items: () => {
      if (!hole) return [];
      if (!itemCache) itemCache = generatedItems(wearer, initiator, hole);
      return itemCache;
    },
  });
}

function renderChat(specName: string, hole: ReverseHole, initiator: BCCharacter, wearer: BCCharacter, item: GameItemActivity["Item"]): string {
  const spec = reverseInsertSpecByName(specName);
  if (!spec) return "";
  const contentKey = reverseInsertChatContentKey(spec.name, hole);
  const dictionary = new DictionaryBuilder()
    .sourceCharacter(initiator)
    .targetCharacter(wearer)
    .focusGroup(hole);
  if (item) {
    dictionary.asset(item.Asset, "ActivityAsset", item.Craft?.Name ?? "");
  }
  const built = dictionary.build();
  built.push({ ActivityName: spec.name });
  const extracted = ChatRoomMessageRunExtractors(
    { Content: contentKey, Type: "Activity", Dictionary: built, Sender: initiator.MemberNumber },
    initiator
  );
  return CommonStringSubstitute(spec.chat[hole], extracted.substitutions ?? []);
}

function sendReverseInsertMessage(
  initiator: BCCharacter,
  wearer: BCCharacter,
  itemActivity: GameItemActivity,
  specName: string,
  hole: ReverseHole
): void {
  const spec = reverseInsertSpecByName(specName);
  if (!spec) return;
  const contentKey = reverseInsertChatContentKey(spec.name, hole);
  const dictionary = new DictionaryBuilder()
    .sourceCharacter(initiator)
    .targetCharacter(wearer)
    .focusGroup(hole);
  if (itemActivity.Item) {
    dictionary.asset(itemActivity.Item.Asset, "ActivityAsset", itemActivity.Item.Craft?.Name ?? "");
  }
  const built = dictionary.build();
  built.push({ ActivityName: spec.name });
  built.push({
    Tag: missingActivityTextTag(contentKey),
    Text: renderChat(spec.name, hole, initiator, wearer, itemActivity.Item),
  });
  ServerSend("ChatRoomChat", { Content: contentKey, Type: "Activity", Dictionary: built });
}

/**
 * 动作扩展的挂法：活动推进 ActivityFemale3DCG，文案走 ActivityDictionaryText，
 * 发出的活动消息带上 MISSING TEXT 回退，没装本插件的人仍能看到中文整句。
 * 不注册自定义 Prerequisite 字符串，避免和动作扩展的 ActivityCheckPrerequisite 分发抢名字。
 *
 * 按钮只加在自己的口/阴/后穴上，并且 CurrentCharacter 必须是别人（穿着方的面板开着，BC 会把自己画在左侧）。
 * ActivityRun 确认是主动插入后，把参数改成原版 Penetrate*（acting = 穿着方，acted = 自己，部位 = 点中的孔）再交给 next，并关掉原版聊天。
 * 不把原始参数交给 next：原始调用的 acted 是自己，活动名却是自定义的，刺激和句子都会错。
 */
export function installReverseInsert(mod: ModSDKModAPI): void {
  if (installed) return;
  if (typeof ActivityFemale3DCG === "undefined" || typeof ActivityAllowedForGroup !== "function" || typeof ActivityRun !== "function") {
    console.warn("LilianMod: 活动接口不存在，跳过主动插入");
    return;
  }
  installed = true;
  registerActivities();

  mod.hookFunction("ActivityDictionaryText", 5, (args, next) => {
    const text = reverseInsertDictionaryText(String(args[0]));
    if (text != null) return text;
    return next(args);
  });

  mod.hookFunction("ActivityAllowedForGroup", 20, (args, next) => {
    const allowed = next(args);
    const zoneOwner = args[0];
    const focusGroup = args[1];
    const wearer = openedWearer();
    if (!zoneOwner || !wearer || !zoneOwner.IsPlayer()) return allowed;
    const focusActivityGroup = ActivityGetGroupOrMirror(familyOf(zoneOwner), focusGroup)?.Name ?? focusGroup;
    const extras: GameItemActivity[] = [];
    for (const offer of offersFor(zoneOwner, wearer, focusGroup)) {
      const activity = registered.get(offer.name);
      if (!activity || !offer.item.Item) continue;
      const entry: GameItemActivity = {
        Activity: activity,
        Item: offer.item.Item,
        Group: focusActivityGroup,
      };
      if (offer.item.Blocked) entry.Blocked = offer.item.Blocked;
      extras.push(entry);
    }
    if (extras.length === 0) return allowed;
    const merged = [...allowed, ...extras];
    if (typeof ActivityFemale3DCGOrdering !== "undefined") {
      merged.sort((a, b) => Math.sign(ActivityFemale3DCGOrdering.indexOf(a.Activity.Name) - ActivityFemale3DCGOrdering.indexOf(b.Activity.Name)));
    }
    return merged;
  });

  mod.hookFunction("ActivityRun", 40, (args, next) => {
    const itemActivity = args[3];
    const name = activityNameOf(itemActivity?.Activity);
    if (!isReverseInsertName(name)) return next(args);

    const initiator = args[0];
    const zoneOwner = args[1];
    const focusGroup = args[2];
    const wearer = openedWearer();
    const sendMessage = args.length < 5 || args[4] !== false;
    if (!initiator || !zoneOwner || !focusGroup || !wearer || !zoneOwner.IsPlayer() || !itemActivity?.Item) return;

    const offer = offersFor(zoneOwner, wearer, focusGroup.Name).find((candidate) => {
      return candidate.name === name
        && candidate.item.Item?.Asset.Name === itemActivity.Item?.Asset.Name
        && candidate.item.Item?.Asset.Group.Name === itemActivity.Item?.Asset.Group.Name
        && candidate.item.Blocked !== "blocked";
    });
    if (!offer) return;

    const spec = reverseInsertSpecByName(offer.name);
    const family = familyOf(wearer);
    const vanilla = spec ? AssetGetActivity(family, spec.vanillaName) : null;
    const holeGroup = ActivityGetGroupOrMirror(family, offer.hole);
    if (!spec || !vanilla || !holeGroup) return;

    const vanillaRun: GameItemActivity = {
      Activity: vanilla,
      Item: itemActivity.Item,
      Group: offer.hole,
    };
    if (itemActivity.Blocked) vanillaRun.Blocked = itemActivity.Blocked;
    // 原版 ActivityRun：acted = 自己（正在被插入），activity = PenetrateSlow/Fast，部位 = 点中的孔。
    next([wearer, initiator, holeGroup, vanillaRun, false]);
    if (sendMessage) {
      try {
        sendReverseInsertMessage(initiator, wearer, vanillaRun, spec.name, offer.hole);
      } catch (error) {
        console.warn("LilianMod: 主动插入消息发送失败", error);
      }
    }
  });

  mod.hookFunction("ActivityEffect", 30, (args, next) => {
    const name = activityNameOf(args[2]);
    if (!isReverseInsertName(name)) return next(args);
    // 聊天目标是穿着方。原版会按这条自定义活动给穿着方加刺激；这里改成和原版插入一样的「对他人」进度。
    const initiator = args[0];
    const wearer = args[1];
    const spec = reverseInsertSpecByName(name);
    const zoneName = typeof args[3] === "string" ? args[3] : "";
    if (!spec || !wearer?.IsPlayer() || !initiator || initiator.IsPlayer() || !zoneName) return;
    const vanilla = AssetGetActivity(familyOf(wearer), spec.vanillaName);
    const holeGroup = ActivityGetGroupOrMirror(familyOf(wearer), zoneName);
    if (!vanilla || !holeGroup) return;
    ActivityRunSelf(wearer, initiator, vanilla, holeGroup, args[5] ?? null);
  });
}
