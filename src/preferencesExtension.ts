import { LilianSettings, PLUGIN_KEY } from "./settings";
import { loadSettings, saveSettings } from "./storage";

const MENU_BUTTON = {
  x: 150,
  y: 190,
  w: 450,
  h: 90,
};
const CUSTOM_GARBLE_BUTTON = {
  x: 1200,
  y: 260,
  w: 560,
  h: 90,
};
const GARBLE_SOUND_BUTTON = {
  x: 1200,
  y: 380,
  w: 560,
  h: 90,
};
const LSCG_EXIT_BUTTON = {
  x: 1815,
  y: 75,
  w: 90,
  h: 90,
};
const GARBLE_SOUND_PRESETS = ["呜", "嗯", "唔", "m"];
type ExtensionView = "MainMenu" | "ChatControl";

export function registerPreferencesExtension(state: { settings: LilianSettings }): void {
  let view: ExtensionView = "MainMenu";

  PreferenceRegisterExtensionSetting({
    Identifier: PLUGIN_KEY,
    ButtonText: "LilianMod",
    load: () => {
      // Always reload when opening the page to avoid stale in-memory values.
      state.settings = loadSettings();
      view = "MainMenu";
    },
    run: () => {
      const previousAlign = MainCanvas.textAlign;
      MainCanvas.textAlign = "left";
      if (view === "MainMenu") {
        DrawText("- LilianMod Settings -", 180, 130, "Black", "#D7F6E9");
        DrawButton(MENU_BUTTON.x, MENU_BUTTON.y, MENU_BUTTON.w, MENU_BUTTON.h, "", "White");
        DrawImageResize("Icons/Preference.png", MENU_BUTTON.x + 10, MENU_BUTTON.y + 10, 70, 70);
        DrawTextFit("ChatControl", MENU_BUTTON.x + 100, MENU_BUTTON.y + 45, 340, "Black");
      } else {
        DrawText("- LilianMod ChatControl -", 180, 130, "Black", "#D7F6E9");
        DrawText("Custom gag garble", 820, 305, "White", "Gray");
        DrawButton(
          CUSTOM_GARBLE_BUTTON.x,
          CUSTOM_GARBLE_BUTTON.y,
          CUSTOM_GARBLE_BUTTON.w,
          CUSTOM_GARBLE_BUTTON.h,
          state.settings.ChatControlSetting.customGarbleEnabled ? "Enabled" : "Disabled",
          state.settings.ChatControlSetting.customGarbleEnabled ? "Green" : "#888888"
        );
        DrawText("Garble sound", 820, 425, "White", "Gray");
        DrawButton(
          GARBLE_SOUND_BUTTON.x,
          GARBLE_SOUND_BUTTON.y,
          GARBLE_SOUND_BUTTON.w,
          GARBLE_SOUND_BUTTON.h,
          state.settings.ChatControlSetting.garbleSound,
          "White"
        );
      }
      DrawButton(
        LSCG_EXIT_BUTTON.x,
        LSCG_EXIT_BUTTON.y,
        LSCG_EXIT_BUTTON.w,
        LSCG_EXIT_BUTTON.h,
        "",
        "White",
        "Icons/Exit.png",
        "Main Menu"
      );
      MainCanvas.textAlign = previousAlign;
    },
    click: () => {
      if (view === "MainMenu" && MouseIn(MENU_BUTTON.x, MENU_BUTTON.y, MENU_BUTTON.w, MENU_BUTTON.h)) {
        view = "ChatControl";
        return;
      }

      if (view === "ChatControl") {
        if (MouseIn(CUSTOM_GARBLE_BUTTON.x, CUSTOM_GARBLE_BUTTON.y, CUSTOM_GARBLE_BUTTON.w, CUSTOM_GARBLE_BUTTON.h)) {
          state.settings.ChatControlSetting.customGarbleEnabled = !state.settings.ChatControlSetting.customGarbleEnabled;
          saveSettings(state.settings);
          return;
        }
        if (MouseIn(GARBLE_SOUND_BUTTON.x, GARBLE_SOUND_BUTTON.y, GARBLE_SOUND_BUTTON.w, GARBLE_SOUND_BUTTON.h)) {
          const current = GARBLE_SOUND_PRESETS.indexOf(state.settings.ChatControlSetting.garbleSound);
          const next = (current + 1 + GARBLE_SOUND_PRESETS.length) % GARBLE_SOUND_PRESETS.length;
          state.settings.ChatControlSetting.garbleSound = GARBLE_SOUND_PRESETS[next];
          saveSettings(state.settings);
          return;
        }
      }
      if (MouseIn(LSCG_EXIT_BUTTON.x, LSCG_EXIT_BUTTON.y, LSCG_EXIT_BUTTON.w, LSCG_EXIT_BUTTON.h)) {
        if (view === "ChatControl") {
          saveSettings(state.settings);
          view = "MainMenu";
        } else {
          saveSettings(state.settings);
          void PreferenceSubscreenExtensionsClear();
        }
      }
    },
    exit: () => {
      saveSettings(state.settings);
    },
  });
}
