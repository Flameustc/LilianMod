import bcModSdk from "bondage-club-mod-sdk";
import { registerPreferencesExtension } from "./preferencesExtension";
import { loadSettings } from "./storage";
import { installChatGarbleHook } from "./chat-control/hook";
import { getLilianDebugApi, installOrgasmControlHooks } from "./orgasm-control/hook";
import type { LilianDebugApi } from "./orgasm-control/debugApi";
import { installReverseInsert } from "./reverse-insert/hook";
import { PLUGIN_KEY, SETTINGS_VERSION } from "./settings";

declare global {
  interface Window {
    LilianMod_Loaded?: boolean;
    /** Console-only debug surface. Not shown in the preference UI. */
    LilianMod?: {
      debug: LilianDebugApi;
    };
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
    repository: "https://github.com/Flameustc/LilianMod",
  });
  installChatGarbleHook(mod, () => state.settings);
  installOrgasmControlHooks(mod, () => state.settings);
  installReverseInsert(mod);
  registerPreferencesExtension(state);
  const debug = getLilianDebugApi();
  if (debug) {
    window.LilianMod = { debug };
    console.info(
      "LilianMod.debug (console only): setDesire(n), getDesire(), setArousal(n), getArousal(). Set LilianMod.debug.enabled = false to disable setters."
    );
  }
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
