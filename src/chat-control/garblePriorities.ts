/**
 * Hook order against current mods (higher runs first; not calling `next` skips the rest):
 * - MPA `SpeechTransformProcess` 10 splits deafen out and calls `SpeechTransformGagGarble` again.
 * - WCE `ChatRoomGenerateChatRoomChatMessage` 11 (Top) can skip `next` and attach `Original`.
 * - MPA `SpeechTransformGagGarble` 5 (pet hearing + pet gagging; Replace does not call `next`).
 * - BC+ pet hearing on `SpeechTransformGagGarble` is 3; MBS AlternativeGarbling is 0.
 * - BCX appends `BCX_ORIGINAL_MESSAGE` on `ServerSend` at priority 1, before the packet is sent.
 */
/** Kept false so the backed-up Generate-layer short-circuit cannot register. */
export const LEGACY_GENERATE_GARBLE_HOOK_ENABLED = false;

export const GARBLE_HOOK_PRIORITIES = {
  /** Above MPA's Process hook (10) so we own the gag-vs-deafen split while custom garble is on. */
  speechTransformProcessDeafenSplit: 20,
  /** Above WCE antiGarble (11). Always calls `next`; does not replace message generation. */
  chatRoomGeneratePostProcess: 12,
  /** Above MPA (5) / BC+ (3) / MBS (0) so Lilian's algorithm runs first and can skip them. */
  speechTransformGagGarble: 6,
  /** Below BCX ServerSend (1) so the cleartext tag is removed after BCX adds it and before send. */
  serverSendCleartextStrip: -100,
} as const;
