/**
 * BACKUP ONLY. Not installed.
 *
 * Previous outbound garble path: `ChatRoomGenerateChatRoomChatMessage` at priority 10,
 * and when custom garble was on it returned a hand-built `{ Content, Type, Dictionary }`
 * without calling `next`. That skipped `SpeechTransformProcess`, lost to WCE antiGarble
 * at priority 11, and stored cleartext on `Dictionary[].Original` when NoSpeechGarble was set.
 *
 * Live behavior is `installChatGarbleHook` in `../hook.ts` (`SpeechTransformGagGarble`).
 * `LEGACY_GENERATE_GARBLE_HOOK_ENABLED` stays false so this copy cannot register itself.
 */
import { ModSDKModAPI } from "bondage-club-mod-sdk";
import { LilianSettings } from "../../settings";
import { garbleMessage, garbleSoundList } from "../garble";
import { LEGACY_GENERATE_GARBLE_HOOK_ENABLED } from "../garblePriorities";

export { LEGACY_GENERATE_GARBLE_HOOK_ENABLED };

function getGarbleSound(sound: string): string[] {
  return garbleSoundList(sound);
}

export function installLegacyGenerateLayerGarbleHook(mod: ModSDKModAPI, getSettings: () => LilianSettings): void {
  if (!LEGACY_GENERATE_GARBLE_HOOK_ENABLED) return;

  mod.hookFunction("ChatRoomGenerateChatRoomChatMessage", 10, (args, next) => {
    const [type, originalInput, replyId] = args;
    let msg = originalInput;
    const settings = getSettings();
    if (!settings.ChatControlSetting.customGarbleEnabled || (type !== "Chat" && type !== "Whisper")) {
      return next(args);
    }

    const dictionary = new DictionaryBuilder()
      .sourceCharacter(Player)
      .build();

    const lastRange = SpeechGetOOCRanges(msg).pop();
    if (
      Player.ChatSettings.OOCAutoClose
      && lastRange !== undefined
      && msg.charAt(lastRange.start + lastRange.length - 1) !== ")"
      && lastRange.start + lastRange.length === msg.length
      && lastRange.length !== 1
    ) {
      msg += ")";
    }

    const originalMsg = msg;
    const garbledMsg = garbleMessage(
      originalMsg,
      SpeechTransformGagGarbleIntensity(Player),
      getGarbleSound(settings.ChatControlSetting.garbleSound)
    );

    if (Player.RestrictionSettings.NoSpeechGarble && garbledMsg !== originalMsg) {
      dictionary.push({ Effects: ["gagGarble"], Original: originalMsg });
    }
    if (replyId) {
      dictionary.push({ ReplyId: replyId, Tag: "ReplyId" });
      ChatRoomMessageReplyStop();
    }

    return { Content: garbledMsg, Type: type, Dictionary: dictionary };
  });
}
