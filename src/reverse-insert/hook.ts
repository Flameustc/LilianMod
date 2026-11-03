import type { ModSDKModAPI } from "bondage-club-mod-sdk";
import type { BCCharacter } from "../types/bc";
import {
  describeVanillaPenetrateCheck,
  isReverseInsertName,
  missingActivityTextTag,
  queryReverseInsertOffers,
  reverseInsertActivityName,
  reverseInsertChatContentKey,
  reverseInsertDictionaryText,
  reverseInsertSpecByName,
  REVERSE_INSERT_SPECS,
  type ReverseHole,
  type ReverseInsertItemIdentity,
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

function registerActivities(): void {
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

function describeGeneratedItem(item: GameItemActivity): ReverseInsertItemIdentity {
  const group = item.Item?.Asset.Group.Name ?? "";
  const mirrored = group ? ActivityGetGroupOrMirror(item.Item?.Asset.Group.Family || "Female3DCG", group) : null;
  return {
    group,
    activityGroup: mirrored?.Name ?? group,
    name: item.Item?.Asset.Name ?? "",
  };
}

function characterFor(planWho: "wearer" | "initiator", wearer: BCCharacter, initiator: BCCharacter): BCCharacter {
  return planWho === "wearer" ? wearer : initiator;
}

/**
 * 原版「穿着方插入发起方的这个孔」是否成立。
 * 前置、权限、可插入物清单都走原函数，角色按 {@link describeVanillaPenetrateCheck} 对调。
 */
function vanillaHoleLegal(wearer: BCCharacter, initiator: BCCharacter, hole: ReverseHole, speed: ReverseSpeed): boolean {
  const plan = describeVanillaPenetrateCheck(hole, speed);
  const family = familyOf(wearer);
  const vanilla = AssetGetActivity(family, plan.activityName);
  const group = ActivityGetGroupOrMirror(family, plan.group);
  const ours = registered.get(reverseInsertActivityName(hole, speed));
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

function offersFor(wearer: BCCharacter, initiator: BCCharacter, focusGroup: string): ReturnType<typeof queryReverseInsertOffers<GameItemActivity>> {
  const family = familyOf(wearer);
  const focusActivityGroup = ActivityGetGroupOrMirror(family, focusGroup)?.Name ?? focusGroup;
  const itemCache = new Map<ReverseHole, GameItemActivity[]>();
  return queryReverseInsertOffers({
    wearerIsPlayer: wearer.IsPlayer(),
    zonePossible: ActivityPossibleOnGroup(wearer, focusGroup),
    blockedByDistance: InventoryIsBlockedByDistance(wearer),
    focusGroup,
    focusActivityGroup,
    holeLegal: (hole, speed) => vanillaHoleLegal(wearer, initiator, hole, speed),
    itemsForHole: (hole) => {
      let items = itemCache.get(hole);
      if (!items) {
        items = generatedItems(wearer, initiator, hole);
        itemCache.set(hole, items);
      }
      return items;
    },
    describeItem: describeGeneratedItem,
  });
}

function renderChat(specName: string, initiator: BCCharacter, wearer: BCCharacter, item: GameItemActivity["Item"]): string {
  const spec = reverseInsertSpecByName(specName);
  if (!spec) return "";
  const contentKey = reverseInsertChatContentKey(spec.name);
  const dictionary = new DictionaryBuilder()
    .sourceCharacter(initiator)
    .targetCharacter(wearer)
    .focusGroup(spec.hole);
  if (item) {
    dictionary.asset(item.Asset, "ActivityAsset", item.Craft?.Name ?? "");
  }
  const built = dictionary.build();
  built.push({ ActivityName: spec.name });
  const extracted = ChatRoomMessageRunExtractors(
    { Content: contentKey, Type: "Activity", Dictionary: built, Sender: initiator.MemberNumber },
    initiator
  );
  return CommonStringSubstitute(spec.chat, extracted.substitutions ?? []);
}

function sendReverseInsertMessage(initiator: BCCharacter, wearer: BCCharacter, itemActivity: GameItemActivity, specName: string): void {
  const spec = reverseInsertSpecByName(specName);
  if (!spec) return;
  const contentKey = reverseInsertChatContentKey(spec.name);
  const dictionary = new DictionaryBuilder()
    .sourceCharacter(initiator)
    .targetCharacter(wearer)
    .focusGroup(spec.hole);
  if (itemActivity.Item) {
    dictionary.asset(itemActivity.Item.Asset, "ActivityAsset", itemActivity.Item.Craft?.Name ?? "");
  }
  const built = dictionary.build();
  built.push({ ActivityName: spec.name });
  built.push({
    Tag: missingActivityTextTag(contentKey),
    Text: renderChat(spec.name, initiator, wearer, itemActivity.Item),
  });
  ServerSend("ChatRoomChat", { Content: contentKey, Type: "Activity", Dictionary: built });
}

/**
 * 动作扩展的挂法：活动推进 ActivityFemale3DCG，文案走 ActivityDictionaryText，
 * 发出的活动消息带上 MISSING TEXT 回退，没装本插件的人仍能看到中文整句。
 * 不注册自定义 Prerequisite 字符串，避免和动作扩展的 ActivityCheckPrerequisite 分发抢名字。
 *
 * ActivityRun 确认是主动插入后，把参数改成原版 Penetrate*（acting = 穿着方，acted = 发起方，部位 = 发起方孔位）再交给 next，并关掉原版聊天。
 * 不把原始参数交给 next：那会把刺激算到被点击的穿着者身上，并生成「穿着方正在插入」的原版句子。
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
    const wearer = args[0];
    const focusGroup = args[1];
    if (!wearer || wearer.IsPlayer()) return allowed;
    const extras: GameItemActivity[] = [];
    for (const offer of offersFor(wearer, Player, focusGroup)) {
      const activity = registered.get(offer.name);
      if (!activity || !offer.item.Item) continue;
      const focusActivityGroup = ActivityGetGroupOrMirror(familyOf(wearer), focusGroup)?.Name ?? focusGroup;
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
    const wearer = args[1];
    const focusGroup = args[2];
    const sendMessage = args.length < 5 || args[4] !== false;
    if (!initiator || !wearer || !focusGroup || !itemActivity?.Item) return;

    const offer = offersFor(wearer, initiator, focusGroup.Name).find((candidate) => {
      return candidate.name === name
        && candidate.item.Item?.Asset.Name === itemActivity.Item?.Asset.Name
        && candidate.item.Item?.Asset.Group.Name === itemActivity.Item?.Asset.Group.Name
        && candidate.item.Blocked !== "blocked";
    });
    if (!offer) return;

    const spec = reverseInsertSpecByName(offer.name);
    const family = familyOf(wearer);
    const vanilla = spec ? AssetGetActivity(family, spec.vanillaName) : null;
    const holeGroup = spec ? ActivityGetGroupOrMirror(family, spec.hole) : null;
    if (!spec || !vanilla || !holeGroup) return;

    const vanillaRun: GameItemActivity = {
      Activity: vanilla,
      Item: itemActivity.Item,
      Group: spec.hole,
    };
    if (itemActivity.Blocked) vanillaRun.Blocked = itemActivity.Blocked;
    // 原版 ActivityRun：acted = 发起方（正在被插入），activity = PenetrateSlow/Fast，部位 = 发起方孔位。
    next([wearer, initiator, holeGroup, vanillaRun, false]);
    if (sendMessage) {
      try {
        sendReverseInsertMessage(initiator, wearer, vanillaRun, spec.name);
      } catch (error) {
        console.warn("LilianMod: 主动插入消息发送失败", error);
      }
    }
  });

  mod.hookFunction("ActivityEffect", 30, (args, next) => {
    const name = activityNameOf(args[2]);
    if (!isReverseInsertName(name)) return next(args);
    // 聊天目标是穿着方。原版会按这条自定义活动给穿着方的孔位加刺激；这里改成和原版插入一样的「对他人」进度。
    const initiator = args[0];
    const wearer = args[1];
    const spec = reverseInsertSpecByName(name);
    if (!spec || !wearer?.IsPlayer() || !initiator || initiator.IsPlayer()) return;
    const vanilla = AssetGetActivity(familyOf(wearer), spec.vanillaName);
    const holeGroup = ActivityGetGroupOrMirror(familyOf(wearer), spec.hole);
    if (!vanilla || !holeGroup) return;
    ActivityRunSelf(wearer, initiator, vanilla, holeGroup, args[5] ?? null);
  });
}
