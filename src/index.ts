import { registerPreferencesExtension } from "./preferencesExtension";
import { saveSettings, loadSettings } from "./storage";

function canBootstrap(): boolean {
  return (
    typeof Player !== "undefined" &&
    typeof PreferenceRegisterExtensionSetting === "function" &&
    typeof ServerPlayerExtensionSettingsSync === "function"
  );
}

function bootstrap(): void {
  const state = {
    settings: loadSettings(),
  };

  registerPreferencesExtension(state);
  // Ensure first run creates ExtensionSettings slot and backup data.
  saveSettings(state.settings);
}

function waitForBootstrap(): void {
  if (canBootstrap()) {
    bootstrap();
    return;
  }
  setTimeout(waitForBootstrap, 500);
}

waitForBootstrap();
