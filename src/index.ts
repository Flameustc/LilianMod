import { registerPreferencesExtension } from "./preferencesExtension";
import { loadSettings } from "./storage";

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
}

function waitForBootstrap(): void {
  if (canBootstrap()) {
    bootstrap();
    return;
  }
  setTimeout(waitForBootstrap, 500);
}

waitForBootstrap();
