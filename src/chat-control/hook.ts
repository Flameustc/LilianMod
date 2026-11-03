import { ModSDKModAPI } from "bondage-club-mod-sdk";
import { LilianSettings } from "../settings";
import { finalizeCustomGarbleMessage, stripGarbleCleartextDictionary } from "./cleartextDictionary";
import { garbleMessage, garbleSoundList } from "./garble";
import { GARBLE_HOOK_PRIORITIES } from "./garblePriorities";

let installed = false;

/** True only while the post-process deafen call should keep vanilla / MPA / MBS deafen behavior. */
let deafenPassthrough = false;
/** Counts Lilian replacements inside the current `ChatRoomGenerateChatRoomChatMessage` call. */
let gagReplaceCount = 0;
/** Message object whose dictionary must be stripped again on the following ServerSend. */
let protectedOutboundMessage: object | null = null;

export function installChatGarbleHook(mod: ModSDKModAPI, getSettings: () => LilianSettings): void {
  if (installed) return;
  installed = true;

  mod.hookFunction("SpeechTransformProcess", GARBLE_HOOK_PRIORITIES.speechTransformProcessDeafenSplit, (args, next) => {
    if (!getSettings().ChatControlSetting.customGarbleEnabled) return next(args);

    const [character, text, effects, ignoreOOC] = args;
    // Vanilla uses SpeechTransformGagGarble for both gagGarble and deafen. Only the gag call is ours.
    if (!Array.isArray(effects) || !effects.includes("deafen")) return next(args);

    const withoutDeafen = effects.filter((effect) => effect !== "deafen");
    const output = next([character, text, withoutDeafen, ignoreOOC]);
    if (!output || typeof output.text !== "string") return output;

    const intensity = SpeechTransformDeafenIntensity(character);
    if (intensity > 0) {
      deafenPassthrough = true;
      try {
        output.text = SpeechTransformGagGarble(output.text, intensity, ignoreOOC === true, character);
      } finally {
        deafenPassthrough = false;
      }
      if (!Array.isArray(output.effects)) output.effects = [];
      if (!output.effects.includes("deafen")) output.effects.push("deafen");
    }
    return output;
  });

  mod.hookFunction("SpeechTransformGagGarble", GARBLE_HOOK_PRIORITIES.speechTransformGagGarble, (args, next) => {
    // Deafen (and MPA pet hearing / MBS alternative on that deafen call) stays on the shared chain.
    // Gag calls do not call next: MPA Replace, MBS AlternativeGarbling, and BC+ pet garble must not run after us.
    if (!getSettings().ChatControlSetting.customGarbleEnabled || deafenPassthrough) return next(args);

    const text = args[0] == null ? "" : String(args[0]);
    const intensity = typeof args[1] === "number" && Number.isFinite(args[1]) ? args[1] : 0;
    const ignoreOOC = args[2] === true;
    gagReplaceCount += 1;
    return garbleMessage(text, intensity, garbleSoundList(getSettings().ChatControlSetting.garbleSound), ignoreOOC);
  });

  mod.hookFunction(
    "ChatRoomGenerateChatRoomChatMessage",
    GARBLE_HOOK_PRIORITIES.chatRoomGeneratePostProcess,
    (args, next) => {
      const type = args[0];
      if (!getSettings().ChatControlSetting.customGarbleEnabled || (type !== "Chat" && type !== "Whisper")) {
        protectedOutboundMessage = null;
        return next(args);
      }

      const replacementsBefore = gagReplaceCount;
      protectedOutboundMessage = null;
      const message = next(args);
      const hookRan = gagReplaceCount !== replacementsBefore;
      if (!message || typeof message !== "object") return message;

      const intensity = SpeechTransformGagGarbleIntensity(Player);
      const protect = finalizeCustomGarbleMessage(message, {
        hookRan,
        intensity,
        garble: (content) =>
          garbleMessage(content, intensity, garbleSoundList(getSettings().ChatControlSetting.garbleSound)),
      });
      if (protect) protectedOutboundMessage = message;
      return message;
    }
  );

  mod.hookFunction("ServerSend", GARBLE_HOOK_PRIORITIES.serverSendCleartextStrip, (args, next) => {
    const payload = args[1];
    if (protectedOutboundMessage && payload === protectedOutboundMessage) {
      // BCX's ServerSend hook (priority 1) has already pushed BCX_ORIGINAL_MESSAGE.
      stripGarbleCleartextDictionary(protectedOutboundMessage);
      protectedOutboundMessage = null;
    }
    return next(args);
  });
}
