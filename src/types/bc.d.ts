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
  IsPlayer(): boolean;
  ArousalSettings: {
    Progress: number;
    ProgressTimer: number;
    OrgasmTimer?: number | null;
  };
}

declare global {
  var CurrentTime: number;

  interface PlayerCharacter {
    MemberNumber: number;
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
  const MainCanvas: CanvasRenderingContext2D;
  class DictionaryBuilder {
    sourceCharacter(character: PlayerCharacter): DictionaryBuilder;
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
  function ChatRoomMessageReplyStop(): void;

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

  function PreferenceGetZoneOrgasm(character: BCCharacter, zone: string): boolean;
  function ActivityChatRoomArousalSync(character: BCCharacter): void;
} 
