import { finalizeCustomGarbleMessage, stripGarbleCleartextDictionary } from "./cleartextDictionary";
import { garbleMessage, garbleSoundList } from "./garble";
import { GARBLE_HOOK_PRIORITIES, LEGACY_GENERATE_GARBLE_HOOK_ENABLED } from "./garblePriorities";

function expect(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function withRandom(value: number, run: () => void): void {
  const original = Math.random;
  Math.random = () => value;
  try {
    run();
  } finally {
    Math.random = original;
  }
}

function checkGarble(): void {
  expect(garbleMessage("Hello", 0, ["呜"]) === "Hello", "intensity 0 keeps the original text");
  withRandom(0, () => {
    expect(garbleMessage("(Hi)", 20, ["呜"]) === "(Hi)", "OOC letters are not garbled");
    expect(garbleMessage("（好）", 20, ["呜"]) === "（好）", "fullwidth OOC parentheses are not garbled");
    expect(garbleMessage("(Hi) Ab", 20, ["呜"]) === "(Hi) Mm", "only the text outside OOC is garbled");
    expect(garbleMessage("(Hi)", 20, ["呜"], true) === "(Mm)", "ignoreOOC garbles letters inside parentheses");
    expect(garbleMessage("Ab1", 20, ["呜"]) === "Mm*", "latin case and digits map to M / m / *");
    expect(garbleMessage("你好", 20, ["呜"]) === "呜—", "non-ascii alternates sound then em dash");
    expect(garbleSoundList("  ")[0] === "呜", "blank sound falls back to 呜");
    expect(garbleSoundList(" 喵 ")[0] === "喵", "sound string is kept as one symbol");
  });
}

function checkDictionary(): void {
  const message = {
    Content: "mmm",
    Dictionary: [
      { Effects: ["gagGarble"], Original: "hello", OriginalMsg: "hello" },
      { Tag: "BCX_ORIGINAL_MESSAGE", Text: "hello" },
      { Tag: "ReplyId", ReplyId: "abc" },
      "leave-me",
    ],
  };
  stripGarbleCleartextDictionary(message);
  const dictionary = message.Dictionary;
  expect(dictionary.length === 3, "BCX cleartext entry is removed");
  expect(!("Original" in (dictionary[0] as object)), "Original is removed");
  expect(!("OriginalMsg" in (dictionary[0] as object)), "OriginalMsg is removed");
  expect((dictionary[0] as { Effects: string[] }).Effects[0] === "gagGarble", "effect metadata stays");
  expect((dictionary[1] as { Tag: string }).Tag === "ReplyId", "unrelated dictionary entries stay");
  expect(dictionary[2] === "leave-me", "non-object dictionary entries stay");

  const untouched = { Content: "plain", Dictionary: [{ Original: "plain" }] };
  expect(
    finalizeCustomGarbleMessage(untouched, { hookRan: false, intensity: 0, garble: () => "nope" }) === false,
    "no gag means the dictionary is left alone"
  );
  expect((untouched.Dictionary[0] as { Original: string }).Original === "plain", "Original survives when ungagged");

  let garbleCalls = 0;
  const already = { Content: "呜呜", Dictionary: [{ Original: "secret", Effects: ["gagGarble"] }] };
  expect(
    finalizeCustomGarbleMessage(already, {
      hookRan: true,
      intensity: 8,
      garble: () => {
        garbleCalls += 1;
        return "double";
      },
    }),
    "a hook hit still protects the message"
  );
  expect(garbleCalls === 0 && already.Content === "呜呜", "does not garble a second time when the gag hook already ran");
  expect(!("Original" in already.Dictionary[0]), "hook hit still strips Original");

  const bypassed = { Content: "secret words", Dictionary: [{ Effects: [], Original: "secret words" }] };
  finalizeCustomGarbleMessage(bypassed, {
    hookRan: false,
    intensity: 12,
    garble: (text) => `garbled:${text}`,
  });
  expect(bypassed.Content === "garbled:secret words", "skipped transform still gets Lilian garble");
  expect(!("Original" in bypassed.Dictionary[0]), "skipped transform still strips Original");
}

function checkPriorities(): void {
  const priorities = GARBLE_HOOK_PRIORITIES;
  expect(priorities.speechTransformGagGarble > 5, "gag hook beats MPA SpeechTransformGagGarble at 5");
  expect(priorities.speechTransformGagGarble > 3, "gag hook beats BC+ pet hearing at 3");
  expect(priorities.speechTransformGagGarble > 0, "gag hook beats MBS AlternativeGarbling at 0");
  expect(priorities.chatRoomGeneratePostProcess > 11, "generate post-process wraps WCE Top at 11");
  expect(priorities.speechTransformProcessDeafenSplit > 10, "deafen split wraps MPA Process at 10");
  expect(priorities.serverSendCleartextStrip < 1, "server send strip runs after BCX priority 1");
  expect(LEGACY_GENERATE_GARBLE_HOOK_ENABLED === false, "legacy Generate short-circuit stays disabled");
}

checkGarble();
checkDictionary();
checkPriorities();
console.log("lilian garble selfcheck ok");
