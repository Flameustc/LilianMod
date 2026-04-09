import { ModSDKModAPI } from "bondage-club-mod-sdk";
import { LilianSettings } from "../settings";
import { garbleMessage } from "./garble";

let installed = false;

function getGarbleSound(sound: string): string[] {
  const cleaned = sound.trim();
  return cleaned.length > 0 ? [cleaned] : ["呜"];
}

const CUSTOM_ACTION_DIALOG_KEY = "LILIAN_PLAYER_CUSTOM_DIALOG";

function applyActionMessageTemplate(template: string, msg: string): string {
  return template.split("$msg").join(msg);
}

function sendAsCustomActionMessage(msg: string, template: string): void {
  const contentText = applyActionMessageTemplate(template, msg);
  const dictionary = new DictionaryBuilder()
    .sourceCharacter(Player)
    .build();
  const replyId = ChatRoomMessageGetReplyId();
  if (replyId) {
    dictionary.push({ ReplyId: replyId, Tag: "ReplyId" });
    ChatRoomMessageReplyStop();
  }

  ServerSend("ChatRoomChat", {
    Content: CUSTOM_ACTION_DIALOG_KEY,
    Type: "Action",
    Dictionary: [
      { Tag: `MISSING TEXT IN "Interface.csv": ${CUSTOM_ACTION_DIALOG_KEY}`, Text: contentText },
      ...dictionary,
    ],
  });
}

export function installChatGarbleHook(mod: ModSDKModAPI, getSettings: () => LilianSettings): void {
  if (installed) return;
  installed = true;

  mod.hookFunction("ChatRoomSendChatMessage", 100, (args, next) => {
    const [msg] = args;
    const settings = getSettings();
    if (!settings.ChatControlSetting.actionMessageReplaceEnabled) {
      return next(args);
    }

    // Keep vanilla rule checks so blocked talk / forbidden words still work.
    if (ChatRoomOwnerPresenceRule("BlockTalk", null)) return false;
    if (!ChatRoomOwnerForbiddenWordCheck(msg)) return false;
    sendAsCustomActionMessage(msg, settings.ChatControlSetting.actionMessageTemplate);

    const firstOOCRange = SpeechGetOOCRanges(msg).shift();
    if (!firstOOCRange || firstOOCRange.start > 0) ChatRoomStimulationMessage("Talk");
    return true;
  });

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
