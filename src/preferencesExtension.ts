import { LilianSettings, PLUGIN_KEY } from "./settings";
import { saveSettings } from "./storage";

const BUTTON = {
  x: 1200,
  y: 260,
  w: 560,
  h: 90,
};
const LSCG_EXIT_BUTTON = {
  x: 1815,
  y: 75,
  w: 90,
  h: 90,
};

export function registerPreferencesExtension(state: { settings: LilianSettings }): void {
  PreferenceRegisterExtensionSetting({
    Identifier: PLUGIN_KEY,
    ButtonText: "LilianMod",
    load: () => {
      // no-op for now, state already loaded by plugin bootstrap
    },
    run: () => {
      const previousAlign = MainCanvas.textAlign;
      MainCanvas.textAlign = "left";
      DrawText("- LilianMod Settings -", 180, 130, "Black", "#D7F6E9");
      DrawText("Dummy setting", 820, 305, "White", "Gray");
      DrawButton(
        BUTTON.x,
        BUTTON.y,
        BUTTON.w,
        BUTTON.h,
        state.settings.dummyEnabled ? "Enabled" : "Disabled",
        state.settings.dummyEnabled ? "Green" : "#888888"
      );
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
      if (MouseIn(BUTTON.x, BUTTON.y, BUTTON.w, BUTTON.h)) {
        state.settings.dummyEnabled = !state.settings.dummyEnabled;
        saveSettings(state.settings);
        return;
      }
      if (MouseIn(LSCG_EXIT_BUTTON.x, LSCG_EXIT_BUTTON.y, LSCG_EXIT_BUTTON.w, LSCG_EXIT_BUTTON.h)) {
        saveSettings(state.settings);
        void PreferenceSubscreenExtensionsClear();
      }
    },
    exit: () => {
      saveSettings(state.settings);
    },
  });
}
