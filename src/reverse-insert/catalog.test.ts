import assert from "node:assert/strict";
import {
  describeVanillaPenetrateCheck,
  missingActivityTextTag,
  penetrableHole,
  queryReverseInsertOffers,
  reverseInsertChatContentKey,
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

assert.equal(REVERSE_INSERT_SPECS.length, 2);
assert.equal(reverseInsertSpecByName("LilianReverseInsertSlow")?.label, "主动插入·慢");
assert.equal(reverseInsertSpecByName("LilianReverseInsertFast")?.label, "主动插入·快");
assert.equal(
  reverseInsertDictionaryText("Label-ChatSelf-ItemPenis-LilianReverseInsertFast"),
  "主动插入·快"
);
assert.match(
  reverseInsertDictionaryText("ChatSelf-ItemMouth-LilianReverseInsertSlow") ?? "",
  /SourceCharacter主动用嘴慢慢含入TargetCharacter的ActivityAsset。/
);
assert.match(
  reverseInsertDictionaryText("ChatSelf-ItemButt-LilianReverseInsertFast") ?? "",
  /SourceCharacter主动用后穴用力含入TargetCharacter的ActivityAsset。/
);
assert.equal(reverseInsertDictionaryText("ActivityWhisper"), null);
assert.equal(reverseInsertDictionaryText("Label-ChatOther-ItemVulva-LilianReverseInsertVulvaSlow"), null);

const contentKey = reverseInsertChatContentKey("LilianReverseInsertSlow", "ItemVulva");
assert.equal(
  missingActivityTextTag(contentKey),
  'MISSING TEXT IN "ActivityDictionary.csv": ChatSelf-ItemVulva-LilianReverseInsertSlow'
);

console.log("reverse-insert catalog tests passed");
