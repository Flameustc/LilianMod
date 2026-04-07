import { ModSDKModAPI } from "bondage-club-mod-sdk";
import { LilianSettings } from "../settings";
import { garbleMessage } from "./garble";

let installed = false;

function getGarbleSound(sound: string): string[] {
  const cleaned = sound.trim();
  return cleaned.length > 0 ? [cleaned] : ["呜"];
}

export function installChatGarbleHook(mod: ModSDKModAPI, getSettings: () => LilianSettings): void {
  if (installed) return;
  installed = true;

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
