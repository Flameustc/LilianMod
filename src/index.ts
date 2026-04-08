import bcModSdk from "bondage-club-mod-sdk";
import { registerPreferencesExtension } from "./preferencesExtension";
import { loadSettings } from "./storage";
import { installChatGarbleHook } from "./chat-control/hook";
import { installOrgasmControlHooks } from "./orgasm-control/hook";
import { PLUGIN_KEY, SETTINGS_VERSION } from "./settings";

declare global {
  interface Window {
    LilianMod_Loaded?: boolean;
  }
}

function canBootstrap(): boolean {
  return (
    typeof Player !== "undefined" &&
    typeof PreferenceRegisterExtensionSetting === "function" &&
    typeof ServerPlayerExtensionSettingsSync === "function"
  );
}

function bootstrap(): void {
  if (window.LilianMod_Loaded) return;
  window.LilianMod_Loaded = false;

  const state = {
    settings: loadSettings(),
  };

  const mod = bcModSdk.registerMod({
    name: PLUGIN_KEY,
    fullName: "LilianMod",
    version: SETTINGS_VERSION.replace(/^v/i, ""),
  });
  installChatGarbleHook(mod, () => state.settings);
  installOrgasmControlHooks(mod, () => state.settings);
  registerPreferencesExtension(state);
  window.LilianMod_Loaded = true;
}

function waitForBootstrap(): void {
  if (canBootstrap()) {
    bootstrap();
    return;
  }
  setTimeout(waitForBootstrap, 500);
}

waitForBootstrap();
