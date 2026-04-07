import { LilianSettings, PLUGIN_KEY } from "./settings";
import { saveSettings } from "./storage";

const BUTTON = {
  x: 1200,
  y: 260,
  w: 560,
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
      DrawText("LilianMod Settings", 1000, 120, "White", "Gray");
      DrawText("Dummy setting", 820, 305, "White", "Gray");
      DrawButton(
        BUTTON.x,
        BUTTON.y,
        BUTTON.w,
        BUTTON.h,
        state.settings.dummyEnabled ? "Enabled" : "Disabled",
        state.settings.dummyEnabled ? "Green" : "#888888"
      );
    },
    click: () => {
      if (!MouseIn(BUTTON.x, BUTTON.y, BUTTON.w, BUTTON.h)) return;
      state.settings.dummyEnabled = !state.settings.dummyEnabled;
      saveSettings(state.settings);
    },
    exit: () => {
      saveSettings(state.settings);
    },
  });
}
