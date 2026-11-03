import assert from "node:assert/strict";
import {
  describeVanillaPenetrateCheck,
  missingActivityTextTag,
  penetrativeItemVisibleOnFocus,
  queryReverseInsertOffers,
  reverseInsertChatContentKey,
  reverseInsertDictionaryText,
  reverseInsertSpecByName,
  REVERSE_INSERT_SPECS,
} from "./catalog";

const strap = { group: "ItemPelvis", activityGroup: "ItemPelvis", name: "StraponPanties" };
const handheld = { group: "ItemHandheld", activityGroup: "ItemHands", name: "LargeDildo" };
const penis = { group: "Pussy", activityGroup: "Pussy", name: "Penis" };
const device = { group: "ItemDevices", activityGroup: "ItemDevices", name: "StrapOnSmooth" };

function identity<T extends { group: string; activityGroup: string; name: string }>(item: T) {
  return item;
}

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

assert.equal(penetrativeItemVisibleOnFocus(penis, "ItemVulva", "ItemVulva"), true);
assert.equal(penetrativeItemVisibleOnFocus(handheld, "ItemHandheld", "ItemHands"), true);
assert.equal(penetrativeItemVisibleOnFocus(strap, "ItemPelvis", "ItemPelvis"), true);
assert.equal(penetrativeItemVisibleOnFocus(device, "ItemVulva", "ItemVulva"), true);
assert.equal(penetrativeItemVisibleOnFocus(device, "ItemBreast", "ItemBreast"), false);
assert.equal(penetrativeItemVisibleOnFocus(handheld, "ItemButt", "ItemButt"), false);

{
  const calls: string[] = [];
  const offers = queryReverseInsertOffers({
    wearerIsPlayer: false,
    zonePossible: true,
    blockedByDistance: false,
    focusGroup: "ItemVulva",
    focusActivityGroup: "ItemVulva",
    holeLegal: (hole, speed) => {
      calls.push(`legal:${hole}:${speed}`);
      return hole !== "ItemMouth" && speed === "Slow";
    },
    itemsForHole: (hole) => {
      calls.push(`items:${hole}`);
      return hole === "ItemButt" ? [strap] : [];
    },
    describeItem: identity,
  });
  assert.deepEqual(
    offers.map((offer) => `${offer.name}:${offer.item.name}`),
    ["LilianReverseInsertButtSlow:StraponPanties"]
  );
  assert.equal(calls.includes("items:ItemMouth"), false);
  assert.equal(calls.filter((call) => call === "items:ItemVulva").length, 1);
  assert.equal(calls.filter((call) => call === "items:ItemButt").length, 1);
  assert.equal(calls.includes("legal:ItemMouth:Fast"), true);
}

{
  const offers = queryReverseInsertOffers({
    wearerIsPlayer: true,
    zonePossible: true,
    blockedByDistance: false,
    focusGroup: "ItemVulva",
    focusActivityGroup: "ItemVulva",
    holeLegal: () => {
      throw new Error("self focus must not consult vanilla gates");
    },
    itemsForHole: () => {
      throw new Error("self focus must not scan items");
    },
    describeItem: identity,
  });
  assert.deepEqual(offers, []);
}

for (const blocked of [
  { wearerIsPlayer: false, zonePossible: false, blockedByDistance: false },
  { wearerIsPlayer: false, zonePossible: true, blockedByDistance: true },
] as const) {
  const offers = queryReverseInsertOffers({
    ...blocked,
    focusGroup: "ItemVulva",
    focusActivityGroup: "ItemVulva",
    holeLegal: () => true,
    itemsForHole: () => [strap],
    describeItem: identity,
  });
  assert.equal(offers.length, 0);
}

{
  const offers = queryReverseInsertOffers({
    wearerIsPlayer: false,
    zonePossible: true,
    blockedByDistance: false,
    focusGroup: "ItemBreast",
    focusActivityGroup: "ItemBreast",
    holeLegal: () => true,
    itemsForHole: () => [handheld, device],
    describeItem: identity,
  });
  assert.equal(offers.length, 0);
}

assert.equal(REVERSE_INSERT_SPECS.length, 6);
assert.equal(reverseInsertSpecByName("LilianReverseInsertVulvaSlow")?.label, "主动插入（阴道·慢）");
assert.equal(
  reverseInsertDictionaryText("Label-ChatOther-ItemPenis-LilianReverseInsertVulvaFast"),
  "主动插入（阴道·快）"
);
assert.match(
  reverseInsertDictionaryText("ChatOther-ItemVulva-LilianReverseInsertMouthSlow") ?? "",
  /SourceCharacter主动用嘴慢慢含入TargetCharacter的ActivityAsset。/
);
assert.equal(reverseInsertDictionaryText("ActivityWhisper"), null);

const contentKey = reverseInsertChatContentKey("LilianReverseInsertVulvaSlow");
assert.equal(missingActivityTextTag(contentKey), 'MISSING TEXT IN "ActivityDictionary.csv": ChatOther-ItemVulva-LilianReverseInsertVulvaSlow');

console.log("reverse-insert catalog tests passed");
