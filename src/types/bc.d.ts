export {};

/** Minimal BondageClub types for orgasm-control hooks */
export interface BCAssetGroupRef {
  Name: string;
}

export interface BCAsset {
  Name: string;
  Group: BCAssetGroupRef;
}

export interface BCActivity {
  Name: string;
  MaxProgress?: number | null;
  MaxProgressSelf?: number | null;
}

export interface BCCharacter {
  ID: number;
  MemberNumber?: number;
  AssetFamily?: string;
  IsPlayer(): boolean;
  ArousalSettings: {
    Progress: number;
    ProgressTimer: number;
    OrgasmTimer?: number;
    OrgasmStage?: number;
    Active?: string;
    Activity?: string | null;
  };
}

declare global {
  interface PlayerCharacter {
    ID: number;
    MemberNumber: number;
    AssetFamily?: string;
    Ownership?: { MemberNumber?: number; Name?: string } | null;
    IsPlayer(): boolean;
    ArousalSettings?: BCCharacter["ArousalSettings"];
    ExtensionSettings?: Record<string, string>;
    ChatSettings: {
      OOCAutoClose: boolean;
    };
    RestrictionSettings: {
      NoSpeechGarble: boolean;
    };
  }

  interface BCPreferenceExtensionSetting {
    Identifier: string;
    ButtonText: string;
    Image?: string;
    load?: () => void;
    run: () => void;
    click: () => void;
    exit?: () => void;
    unload?: () => void;
    resize?: (onLoad: boolean) => void;
  }

  const Player: PlayerCharacter;
  const MouseX: number;
  const MouseY: number;
  const CurrentTime: number;
  /** Right-hand sheet. The player when only self is open; the other character when their sheet is open (self is then drawn on the left). */
  const CurrentCharacter: BCCharacter | null;
  const MainCanvas: CanvasRenderingContext2D;
  class DictionaryBuilder {
    sourceCharacter(character: PlayerCharacter | BCCharacter): DictionaryBuilder;
    targetCharacter(character: PlayerCharacter | BCCharacter, index?: number): DictionaryBuilder;
    focusGroup(groupName: string): DictionaryBuilder;
    asset(
      asset: { Name: string; Group: { Name: string } },
      tag?: string,
      craftName?: string
    ): DictionaryBuilder;
    build(): any[];
  }

  function PreferenceRegisterExtensionSetting(setting: BCPreferenceExtensionSetting): void;
  function PreferenceSubscreenExtensionsClear(): Promise<void>;
  function ElementCreateInput(
    ID: string | null,
    Type: string,
    Value?: string | null,
    MaxLength?: number | string | null
  ): HTMLInputElement;
  function ElementPosition(ElementOrID: string, X: number, Y: number, W: number, H?: number): void;
  function ElementRemove(elementOrId: string | HTMLElement | null): void;
  function ElementValue(ID: string, Value?: string | null): string;
  function ServerPlayerExtensionSettingsSync(dataKeyName: string): void;
  var ChatRoomGenerateChatRoomChatMessage: (
    type: "Chat" | "Whisper" | "Emote",
    msg: string,
    replyId?: string
  ) => { Content: string; Type: string; Dictionary: any[] };
  function SpeechGetOOCRanges(msg: string): Array<{ start: number; length: number }>;
  function SpeechTransformGagGarbleIntensity(character: PlayerCharacter): number;
  function SpeechTransformDeafenIntensity(character: PlayerCharacter): number;
  /**
   * R131+ gag-letter transform. Vanilla also calls this for deafen; the 4th argument
   * is not in vanilla, but MBS patches Process to pass the character through.
   */
  function SpeechTransformGagGarble(
    text: string,
    intensity: number,
    ignoreOOC?: boolean,
    character?: PlayerCharacter
  ): string;
  function SpeechTransformProcess(
    character: PlayerCharacter,
    text: string,
    effects: string[],
    ignoreOOC?: boolean
  ): { effects: string[]; text: string };
  function ServerSend(message: string, data?: object | null): void;
  function ChatRoomMessageReplyStop(): void;
  function DialogLeave(): void;

  function DrawText(text: string, x: number, y: number, color: string, backgroundColor?: string): void;
  function DrawButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    color: string,
    image?: string,
    hoverText?: string
  ): void;
  function DrawImageResize(path: string, x: number, y: number, width: number, height: number): void;
  function DrawTextFit(text: string, x: number, y: number, width: number, color: string, backgroundColor?: string): void;
  function DrawRect(left: number, top: number, width: number, height: number, color: string): void;
  function DrawEmptyRect(left: number, top: number, width: number, height: number, color: string, thickness?: number): void;
  function DrawCheckbox(
    left: number,
    top: number,
    width: number,
    height: number,
    text: string,
    isChecked: boolean,
    disabled?: boolean,
    textColor?: string,
    checkImage?: string
  ): void;
  function MouseIn(x: number, y: number, width: number, height: number): boolean;

  function PreferenceGetZoneOrgasm(character: BCCharacter | PlayerCharacter, zone: string): boolean;
  function ActivityChatRoomArousalSync(character: BCCharacter): void;
  /** Declared for `bondage-club-mod-sdk` `hookFunction` typing (`GetDotedPathType<typeof globalThis, ...>`). */
  function ActivitySetArousalTimer(
    C: BCCharacter,
    Activity: BCActivity | null,
    Zone: string,
    Progress: number,
    Asset?: unknown
  ): void;
  /** Source `S`, target `C`. Factor is applied inside, before `ActivitySetArousalTimer`. */
  function ActivityEffect(
    S: BCCharacter,
    C: BCCharacter,
    A: unknown,
    Z: string,
    Count?: number,
    Asset?: unknown
  ): void;
  function ActivityEffectFlat(
    S: BCCharacter,
    C: BCCharacter,
    Amount: number,
    Z: string,
    Count?: number,
    Asset?: unknown
  ): void;
  /** Player self-arousal when acting on someone else. Passes Source and Target; the timer call does not. */
  function ActivityRunSelf(
    Source: BCCharacter,
    Target: BCCharacter,
    Activity: BCActivity,
    Group: unknown,
    Asset?: unknown
  ): void;
  function ActivityOrgasmGameGenerate(Progress: number): void;
  function ActivityOrgasmPrepare(C: BCCharacter, Bypass?: boolean): void;
  function ActivityOrgasmStart(C: BCCharacter): void;
  function ActivityOrgasmStop(C: BCCharacter, Progress: number): void;
  var ActivityOrgasmGameDifficulty: number;
  var ActivityOrgasmRuined: boolean;
  var ActivityOrgasmGameTimer: number;

  /** Vanilla activity registry (`var` in Female3DCG.js). Ordering is a top-level `let` shared by classic scripts. */
  var ActivityFemale3DCG: Array<{
    Name: string;
    ActivityID?: number;
    MaxProgress?: number;
    MaxProgressSelf?: number;
    Prerequisite?: readonly string[];
    Target?: readonly string[];
    TargetSelf?: readonly string[] | boolean;
  }>;
  var ActivityFemale3DCGOrdering: string[];

  function ActivityDictionaryText(keyword: string): string;
  function ActivityAllowedForGroup(character: BCCharacter, groupName: string): LilianItemActivity[];
  function ActivityRun(
    actor: BCCharacter,
    acted: BCCharacter,
    targetGroup: { Name: string },
    itemActivity: LilianItemActivity,
    sendMessage?: boolean
  ): void;
  function ActivityCheckPrerequisites(
    activity: { Name: string; Prerequisite?: readonly string[] },
    acting: BCCharacter,
    acted: BCCharacter,
    group: { Name: string }
  ): boolean;
  function ActivityCheckPermissions(activity: { Name: string }, character: BCCharacter, other: boolean): boolean;
  function ActivityGenerateItemActivitiesFromNeed(
    acting: BCCharacter,
    acted: BCCharacter,
    needsItem: string,
    activity: { Name: string },
    targetGroup: { Name: string },
    useTargetItems?: boolean
  ): LilianItemActivity[];
  function ActivityGetGroupOrMirror(family: string, groupName: string): { Name: string } | null;
  function ActivityPossibleOnGroup(character: BCCharacter, groupName: string): boolean;
  function AssetGetActivity(family: string, name: string): { Name: string; ActivityID?: number; Prerequisite?: readonly string[] } | null;
  function InventoryIsBlockedByDistance(character: BCCharacter): boolean;
  function CommonStringSubstitute(template: string, substitutions: ReadonlyArray<[string, string]>): string;
  function ChatRoomMessageRunExtractors(
    data: { Content: string; Type: string; Dictionary?: unknown[]; Sender?: number },
    character: BCCharacter
  ): { substitutions?: Array<[string, string]> };
}

interface LilianItemActivity {
  Activity: {
    Name: string;
    ActivityID?: number;
    MaxProgress?: number;
    Prerequisite?: readonly string[];
    Target?: readonly string[];
    TargetSelf?: readonly string[] | boolean;
  };
  Item?: {
    Asset: { Name: string; Group: { Name: string; Family?: string } };
    Craft?: { Name?: string };
  };
  Blocked?: "blocked" | "limited";
  Group: string;
} 
