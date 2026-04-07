export {};

declare global {
  interface PlayerCharacter {
    MemberNumber: number;
    ExtensionSettings?: Record<string, string>;
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
  }

  const Player: PlayerCharacter;
  const MouseX: number;
  const MouseY: number;
  const MainCanvas: CanvasRenderingContext2D;

  function PreferenceRegisterExtensionSetting(setting: BCPreferenceExtensionSetting): void;
  function PreferenceSubscreenExtensionsClear(): Promise<void>;
  function ServerPlayerExtensionSettingsSync(dataKeyName: string): void;

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
  function MouseIn(x: number, y: number, width: number, height: number): boolean;
}
