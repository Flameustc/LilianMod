import assert from "node:assert/strict";
import {
  describeVanillaPenetrateCheck,
  equipperArousalPlan,
  EQUIPPER_AROUSAL_ZONE,
  missingActivityTextTag,
  penetrableHole,
  queryReverseInsertOffers,
  pickReverseInsertChat,
  reverseInsertActivityName,
  reverseInsertChatContentKey,
  reverseInsertChatPool,
  reverseInsertDictionaryText,
  reverseInsertSheetAllowsOffer,
  reverseInsertSpecByName,
  REVERSE_INSERT_SPECS,
} from "./catalog";

const strap = { name: "StraponPanties" };
const dildo = { name: "LargeDildo" };

{
  const plan = describeVanillaPenetrateCheck("ItemButt", "Fast");
  assert.equal(plan.activityName, "PenetrateFast");
  assert.equal(plan.acting, "wearer");
  assert.equal(plan.acted, "initiator");
  assert.equal(plan.group, "ItemButt");
  assert.equal(plan.useTargetItems, false);
  assert.equal(plan.needsItem, "PenetrateItem");
  assert.deepEqual(plan.permissions, [
    { who: "wearer", other: true },
    { who: "initiator", other: false },
  ]);
}

assert.equal(penetrableHole("ItemMouth2", "ItemMouth"), "ItemMouth");
assert.equal(penetrableHole("ItemVulva", "ItemVulva"), "ItemVulva");
assert.equal(penetrableHole("ItemButt", "ItemButt"), "ItemButt");
assert.equal(penetrableHole("ItemBreast", "ItemBreast"), null);
assert.equal(penetrableHole("ItemVulvaPiercings", "ItemVulvaPiercings"), null);
assert.equal(penetrableHole("ItemPelvis", "ItemPelvis"), null);

assert.equal(reverseInsertSheetAllowsOffer({ openedSheetIsPlayer: true, zoneOwnerIsPlayer: true }), false);
assert.equal(reverseInsertSheetAllowsOffer({ openedSheetIsPlayer: null, zoneOwnerIsPlayer: true }), false);
assert.equal(reverseInsertSheetAllowsOffer({ openedSheetIsPlayer: false, zoneOwnerIsPlayer: false }), false);
assert.equal(reverseInsertSheetAllowsOffer({ openedSheetIsPlayer: false, zoneOwnerIsPlayer: true }), true);

{
  const calls: string[] = [];
  const offers = queryReverseInsertOffers({
    openedSheetIsPlayer: false,
    zoneOwnerIsPlayer: true,
    zonePossible: true,
    wearerOutOfRange: false,
    focusHole: "ItemVulva",
    holeLegal: (speed) => {
      calls.push(`legal:${speed}`);
      return speed === "Slow";
    },
    items: () => {
      calls.push("items");
      return [strap];
    },
  });
  assert.deepEqual(
    offers.map((offer) => `${offer.name}:${offer.hole}:${offer.item.name}`),
    ["LilianReverseInsertSlow:ItemVulva:StraponPanties"]
  );
  assert.deepEqual(calls, ["legal:Slow", "legal:Fast", "items"]);
}

{
  const offers = queryReverseInsertOffers({
    openedSheetIsPlayer: false,
    zoneOwnerIsPlayer: true,
    zonePossible: true,
    wearerOutOfRange: false,
    focusHole: "ItemMouth",
    holeLegal: () => true,
    items: () => [strap, dildo],
  });
  assert.deepEqual(
    offers.map((offer) => offer.name),
    [
      "LilianReverseInsertSlow",
      "LilianReverseInsertSlow",
      "LilianReverseInsertFast",
      "LilianReverseInsertFast",
    ]
  );
  assert.deepEqual(offers.map((offer) => offer.item.name), ["StraponPanties", "LargeDildo", "StraponPanties", "LargeDildo"]);
}

{
  const offers = queryReverseInsertOffers({
    openedSheetIsPlayer: true,
    zoneOwnerIsPlayer: true,
    zonePossible: true,
    wearerOutOfRange: false,
    focusHole: "ItemVulva",
    holeLegal: () => {
      throw new Error("own sheet must not consult vanilla gates");
    },
    items: () => {
      throw new Error("own sheet must not scan items");
    },
  });
  assert.deepEqual(offers, []);
}

{
  const offers = queryReverseInsertOffers({
    openedSheetIsPlayer: false,
    zoneOwnerIsPlayer: false,
    zonePossible: true,
    wearerOutOfRange: false,
    focusHole: "ItemVulva",
    holeLegal: () => {
      throw new Error("wearer zones must not consult vanilla gates");
    },
    items: () => {
      throw new Error("wearer zones must not scan items");
    },
  });
  assert.deepEqual(offers, []);
}

for (const blocked of [
  { zonePossible: false, wearerOutOfRange: false, focusHole: "ItemButt" as const },
  { zonePossible: true, wearerOutOfRange: true, focusHole: "ItemButt" as const },
  { zonePossible: true, wearerOutOfRange: false, focusHole: null },
]) {
  const offers = queryReverseInsertOffers({
    openedSheetIsPlayer: false,
    zoneOwnerIsPlayer: true,
    ...blocked,
    holeLegal: () => true,
    items: () => [strap],
  });
  assert.equal(offers.length, 0);
}

{
  const offers = queryReverseInsertOffers({
    openedSheetIsPlayer: false,
    zoneOwnerIsPlayer: true,
    zonePossible: true,
    wearerOutOfRange: false,
    focusHole: "ItemButt",
    holeLegal: () => false,
    items: () => {
      throw new Error("illegal hole must not scan items");
    },
  });
  assert.deepEqual(offers, []);
}

{
  const slow = equipperArousalPlan({
    activityName: "LilianReverseInsertSlow",
    localPlayerIsTarget: true,
    localPlayerIsSender: false,
  });
  assert.deepEqual(slow, {
    vanillaName: "PenetrateSlow",
    zone: EQUIPPER_AROUSAL_ZONE,
    source: "equipper",
    target: "initiator",
    forwardAsset: true,
  });
  assert.equal(slow?.zone, "ActivityOnOther");
  const fast = equipperArousalPlan({
    activityName: "LilianReverseInsertFast",
    localPlayerIsTarget: true,
    localPlayerIsSender: false,
  });
  assert.equal(fast?.vanillaName, "PenetrateFast");
  assert.equal(
    equipperArousalPlan({
      activityName: "LilianReverseInsertSlow",
      localPlayerIsTarget: false,
      localPlayerIsSender: false,
    }),
    null
  );
  assert.equal(
    equipperArousalPlan({
      activityName: "LilianReverseInsertFast",
      localPlayerIsTarget: true,
      localPlayerIsSender: true,
    }),
    null
  );
  assert.equal(
    equipperArousalPlan({
      activityName: "PenetrateSlow",
      localPlayerIsTarget: true,
      localPlayerIsSender: false,
    }),
    null
  );
}

assert.equal(REVERSE_INSERT_SPECS.length, 2);
assert.equal(reverseInsertSpecByName("LilianReverseInsertSlow")?.label, "主动插入·慢");
assert.equal(reverseInsertSpecByName("LilianReverseInsertFast")?.label, "主动插入·快");
assert.equal(
  reverseInsertDictionaryText("Label-ChatSelf-ItemPenis-LilianReverseInsertFast"),
  "主动插入·快"
);
assert.equal(reverseInsertDictionaryText("ActivityWhisper"), null);
assert.equal(reverseInsertDictionaryText("Label-ChatOther-ItemVulva-LilianReverseInsertVulvaSlow"), null);

const approved = {
  "ItemVulva:Slow": [
    "SourceCharacter主动用阴道慢慢含入TargetCharacter的ActivityAsset。",
    "SourceCharacter把TargetCharacter的ActivityAsset缓缓纳入阴道。",
    "SourceCharacter主动沉腰，用阴道一点点吞下TargetCharacter的ActivityAsset。",
    "SourceCharacter主动用阴阜贴上TargetCharacter的ActivityAsset，慢慢含进去。",
  ],
  "ItemVulva:Fast": [
    "SourceCharacter主动用阴道用力含入TargetCharacter的ActivityAsset。",
    "SourceCharacter猛地把TargetCharacter的ActivityAsset吞进阴道。",
    "SourceCharacter主动抬臀迎上，一口气把TargetCharacter的ActivityAsset吃进阴道。",
    "SourceCharacter迫不及待地用阴道套住TargetCharacter的ActivityAsset，快速吞吐。",
  ],
  "ItemButt:Slow": [
    "SourceCharacter主动用后穴慢慢含入TargetCharacter的ActivityAsset。",
    "SourceCharacter把TargetCharacter的ActivityAsset缓缓纳入后穴。",
    "SourceCharacter主动翘起臀，一点点把TargetCharacter的ActivityAsset吞进后穴。",
    "SourceCharacter主动用后穴口贴住TargetCharacter的ActivityAsset，慢慢吃进去。",
  ],
  "ItemButt:Fast": [
    "SourceCharacter主动用后穴用力含入TargetCharacter的ActivityAsset。",
    "SourceCharacter猛地把TargetCharacter的ActivityAsset吞进后穴。",
    "SourceCharacter主动向后坐，一口气把TargetCharacter的ActivityAsset吃进后穴。",
    "SourceCharacter迫不及待地用后穴套住TargetCharacter的ActivityAsset，快速吞吐。",
  ],
  "ItemMouth:Slow": [
    "SourceCharacter主动用嘴慢慢含入TargetCharacter的ActivityAsset。",
    "SourceCharacter把TargetCharacter的ActivityAsset缓缓含进嘴里。",
    "SourceCharacter主动俯身，一点点把TargetCharacter的ActivityAsset吞进嘴里。",
    "SourceCharacter主动用唇舌贴上TargetCharacter的ActivityAsset，慢慢含住。",
  ],
  "ItemMouth:Fast": [
    "SourceCharacter主动用嘴用力含入TargetCharacter的ActivityAsset。",
    "SourceCharacter猛地把TargetCharacter的ActivityAsset吞进嘴里。",
    "SourceCharacter主动张口迎上，一口气把TargetCharacter的ActivityAsset含到底。",
    "SourceCharacter迫不及待地用嘴套住TargetCharacter的ActivityAsset，快速吞吐。",
  ],
} as const;

for (const hole of ["ItemVulva", "ItemButt", "ItemMouth"] as const) {
  for (const speed of ["Slow", "Fast"] as const) {
    const pool = reverseInsertChatPool(hole, speed);
    assert.deepEqual(pool, approved[`${hole}:${speed}`]);
    assert.equal(pool.length, 4);
    for (const random of [0, 0.24, 0.49, 0.74, 0.99]) {
      const picked = pickReverseInsertChat(hole, speed, random);
      assert.ok(pool.includes(picked.text), `${hole} ${speed} ${random}`);
      assert.equal(picked.text, pool[picked.index]);
      const key = reverseInsertChatContentKey(reverseInsertActivityName(speed), hole, picked.index);
      assert.equal(reverseInsertDictionaryText(key), picked.text);
    }
  }
}

const contentKey = reverseInsertChatContentKey("LilianReverseInsertSlow", "ItemVulva", 1);
assert.equal(
  missingActivityTextTag(contentKey),
  'MISSING TEXT IN "ActivityDictionary.csv": ChatSelf-ItemVulva-LilianReverseInsertSlow-1'
);
assert.equal(
  reverseInsertDictionaryText(contentKey),
  "SourceCharacter把TargetCharacter的ActivityAsset缓缓纳入阴道。"
);

console.log("reverse-insert catalog tests passed");
