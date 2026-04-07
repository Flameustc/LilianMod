// ==UserScript==\n// @name LilianMod\n// @namespace lilianmod\n// @version 0.1.0\n// @description LilianMod for BondageClub\n// @match https://www.bondageprojects.elementfx.com/R*\n// @grant none\n// ==/UserScript==
"use strict";
(() => {
  // src/settings.ts
  var PLUGIN_KEY = "LilianMod";
  var BACKUP_SUFFIX = "Backup";
  function getDefaultSettings() {
    return {
      dummyEnabled: false
    };
  }
  function getBackupStorageKey(memberNumber) {
    return `${PLUGIN_KEY}_${memberNumber}_${BACKUP_SUFFIX}`;
  }
  function sanitizeSettings(input) {
    const fallback = getDefaultSettings();
    if (!input || typeof input !== "object") return fallback;
    const raw = input;
    return {
      dummyEnabled: typeof raw.dummyEnabled === "boolean" ? raw.dummyEnabled : fallback.dummyEnabled
    };
  }

  // src/storage.ts
  function parseSettings(raw) {
    if (!raw) return null;
    try {
      return sanitizeSettings(JSON.parse(raw));
    } catch (e) {
      return null;
    }
  }
  function ensureExtensionSettingsContainer() {
    if (!Player.ExtensionSettings) Player.ExtensionSettings = {};
    return Player.ExtensionSettings;
  }
  function loadSettings() {
    var _a, _b, _c;
    const defaults = getDefaultSettings();
    const container = ensureExtensionSettingsContainer();
    const remoteRaw = (_a = container[PLUGIN_KEY]) != null ? _a : null;
    const backupRaw = localStorage.getItem(getBackupStorageKey(Player.MemberNumber));
    const parsed = (_c = (_b = parseSettings(remoteRaw)) != null ? _b : parseSettings(backupRaw)) != null ? _c : defaults;
    return sanitizeSettings(parsed);
  }
  function saveSettings(settings) {
    const container = ensureExtensionSettingsContainer();
    const value = JSON.stringify(sanitizeSettings(settings));
    container[PLUGIN_KEY] = value;
    localStorage.setItem(getBackupStorageKey(Player.MemberNumber), value);
    ServerPlayerExtensionSettingsSync(PLUGIN_KEY);
  }

  // src/preferencesExtension.ts
  var BUTTON = {
    x: 1200,
    y: 260,
    w: 560,
    h: 90
  };
  var LSCG_EXIT_BUTTON = {
    x: 1815,
    y: 75,
    w: 90,
    h: 90
  };
  function registerPreferencesExtension(state) {
    PreferenceRegisterExtensionSetting({
      Identifier: PLUGIN_KEY,
      ButtonText: "LilianMod",
      load: () => {
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
      }
    });
  }

  // src/index.ts
  function canBootstrap() {
    return typeof Player !== "undefined" && typeof PreferenceRegisterExtensionSetting === "function" && typeof ServerPlayerExtensionSettingsSync === "function";
  }
  function bootstrap() {
    const state = {
      settings: loadSettings()
    };
    registerPreferencesExtension(state);
    saveSettings(state.settings);
  }
  function waitForBootstrap() {
    if (canBootstrap()) {
      bootstrap();
      return;
    }
    setTimeout(waitForBootstrap, 500);
  }
  waitForBootstrap();
})();
