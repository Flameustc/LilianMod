/**
 * Dictionary fields current anti-garble builds use to put cleartext back on screen.
 *
 * Verified against:
 * - Bondage Club `ChatRoomGenerateChatRoomChatMessage` / message display (`Original` → `metadata.OriginalMsg` when ShowUngarbledMessages)
 * - WCE `antiGarbling.ts` (`Original` on the generated chat dictionary; anti-deafen only fills `metadata.OriginalMsg` locally)
 * - BCX `modules/speech.ts` (`Tag: "BCX_ORIGINAL_MESSAGE"` on ServerSend; whisper `.antigarble` reads `Text`)
 */
const CLEARTEXT_VALUE_KEYS = ["Original", "OriginalMsg"] as const;

export interface DictionaryMessage {
  Content?: unknown;
  Dictionary?: unknown;
}

export function stripGarbleCleartextDictionary(message: DictionaryMessage | null | undefined): void {
  const dictionary = message?.Dictionary;
  if (!Array.isArray(dictionary)) return;

  for (let index = dictionary.length - 1; index >= 0; index -= 1) {
    const entry = dictionary[index];
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    if (record.Tag === "BCX_ORIGINAL_MESSAGE") {
      dictionary.splice(index, 1);
      continue;
    }
    for (const key of CLEARTEXT_VALUE_KEYS) {
      if (key in record) delete record[key];
    }
  }
}

/**
 * After the normal generate chain has run: apply Lilian garble only if that chain
 * never called it (WCE whisper anti-garble "off" skips SpeechTransform entirely),
 * then drop cleartext dictionary hints.
 *
 * Returns whether this outbound message must also be stripped again on ServerSend
 * (BCX appends `BCX_ORIGINAL_MESSAGE` after Generate returns).
 */
export function finalizeCustomGarbleMessage(
  message: DictionaryMessage,
  input: { hookRan: boolean; intensity: number; garble: (text: string) => string }
): boolean {
  const gagApplies = input.hookRan || input.intensity > 0;
  if (!gagApplies) return false;
  if (!input.hookRan && input.intensity > 0 && typeof message.Content === "string") {
    message.Content = input.garble(message.Content);
  }
  stripGarbleCleartextDictionary(message);
  return true;
}
