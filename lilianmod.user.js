// ==UserScript==\n// @name LilianMod\n// @namespace lilianmod\n// @version 0.1.0\n// @description LilianMod for BondageClub\n// @match https://www.bondageprojects.elementfx.com/R*\n// @grant none\n// ==/UserScript==
"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/bondage-club-mod-sdk/dist/bcmodsdk.js
  var require_bcmodsdk = __commonJS({
    "node_modules/bondage-club-mod-sdk/dist/bcmodsdk.js"(exports) {
      var bcModSdk2 = (function() {
        "use strict";
        const o = "1.2.0";
        function e(o2) {
          alert("Mod ERROR:\n" + o2);
          const e2 = new Error(o2);
          throw console.error(e2), e2;
        }
        const t = new TextEncoder();
        function n(o2) {
          return !!o2 && "object" == typeof o2 && !Array.isArray(o2);
        }
        function r(o2) {
          const e2 = /* @__PURE__ */ new Set();
          return o2.filter(((o3) => !e2.has(o3) && e2.add(o3)));
        }
        const i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set();
        function c(o2) {
          a.has(o2) || (a.add(o2), console.warn(o2));
        }
        function s(o2) {
          const e2 = [], t2 = /* @__PURE__ */ new Map(), n2 = /* @__PURE__ */ new Set();
          for (const r3 of f.values()) {
            const i3 = r3.patching.get(o2.name);
            if (i3) {
              e2.push(...i3.hooks);
              for (const [e3, a2] of i3.patches.entries()) t2.has(e3) && t2.get(e3) !== a2 && c(`ModSDK: Mod '${r3.name}' is patching function ${o2.name} with same pattern that is already applied by different mod, but with different pattern:
Pattern:
${e3}
Patch1:
${t2.get(e3) || ""}
Patch2:
${a2}`), t2.set(e3, a2), n2.add(r3.name);
            }
          }
          e2.sort(((o3, e3) => e3.priority - o3.priority));
          const r2 = (function(o3, e3) {
            if (0 === e3.size) return o3;
            let t3 = o3.toString().replaceAll("\r\n", "\n");
            for (const [n3, r3] of e3.entries()) t3.includes(n3) || c(`ModSDK: Patching ${o3.name}: Patch ${n3} not applied`), t3 = t3.replaceAll(n3, r3);
            return (0, eval)(`(${t3})`);
          })(o2.original, t2);
          let i2 = function(e3) {
            var t3, i3;
            const a2 = null === (i3 = (t3 = m.errorReporterHooks).hookChainExit) || void 0 === i3 ? void 0 : i3.call(t3, o2.name, n2), c2 = r2.apply(this, e3);
            return null == a2 || a2(), c2;
          };
          for (let t3 = e2.length - 1; t3 >= 0; t3--) {
            const n3 = e2[t3], r3 = i2;
            i2 = function(e3) {
              var t4, i3;
              const a2 = null === (i3 = (t4 = m.errorReporterHooks).hookEnter) || void 0 === i3 ? void 0 : i3.call(t4, o2.name, n3.mod), c2 = n3.hook.apply(this, [e3, (o3) => {
                if (1 !== arguments.length || !Array.isArray(e3)) throw new Error(`Mod ${n3.mod} failed to call next hook: Expected args to be array, got ${typeof o3}`);
                return r3.call(this, o3);
              }]);
              return null == a2 || a2(), c2;
            };
          }
          return { hooks: e2, patches: t2, patchesSources: n2, enter: i2, final: r2 };
        }
        function l(o2, e2 = false) {
          let r2 = i.get(o2);
          if (r2) e2 && (r2.precomputed = s(r2));
          else {
            let e3 = window;
            const a2 = o2.split(".");
            for (let t2 = 0; t2 < a2.length - 1; t2++) if (e3 = e3[a2[t2]], !n(e3)) throw new Error(`ModSDK: Function ${o2} to be patched not found; ${a2.slice(0, t2 + 1).join(".")} is not object`);
            const c2 = e3[a2[a2.length - 1]];
            if ("function" != typeof c2) throw new Error(`ModSDK: Function ${o2} to be patched not found`);
            const l2 = (function(o3) {
              let e4 = -1;
              for (const n2 of t.encode(o3)) {
                let o4 = 255 & (e4 ^ n2);
                for (let e5 = 0; e5 < 8; e5++) o4 = 1 & o4 ? -306674912 ^ o4 >>> 1 : o4 >>> 1;
                e4 = e4 >>> 8 ^ o4;
              }
              return ((-1 ^ e4) >>> 0).toString(16).padStart(8, "0").toUpperCase();
            })(c2.toString().replaceAll("\r\n", "\n")), d2 = { name: o2, original: c2, originalHash: l2 };
            r2 = Object.assign(Object.assign({}, d2), { precomputed: s(d2), router: () => {
            }, context: e3, contextProperty: a2[a2.length - 1] }), r2.router = /* @__PURE__ */ (function(o3) {
              return function(...e4) {
                return o3.precomputed.enter.apply(this, [e4]);
              };
            })(r2), i.set(o2, r2), e3[r2.contextProperty] = r2.router;
          }
          return r2;
        }
        function d() {
          for (const o2 of i.values()) o2.precomputed = s(o2);
        }
        function p() {
          const o2 = /* @__PURE__ */ new Map();
          for (const [e2, t2] of i) o2.set(e2, { name: e2, original: t2.original, originalHash: t2.originalHash, sdkEntrypoint: t2.router, currentEntrypoint: t2.context[t2.contextProperty], hookedByMods: r(t2.precomputed.hooks.map(((o3) => o3.mod))), patchedByMods: Array.from(t2.precomputed.patchesSources) });
          return o2;
        }
        const f = /* @__PURE__ */ new Map();
        function u(o2) {
          f.get(o2.name) !== o2 && e(`Failed to unload mod '${o2.name}': Not registered`), f.delete(o2.name), o2.loaded = false, d();
        }
        function g(o2, t2) {
          o2 && "object" == typeof o2 || e("Failed to register mod: Expected info object, got " + typeof o2), "string" == typeof o2.name && o2.name || e("Failed to register mod: Expected name to be non-empty string, got " + typeof o2.name);
          let r2 = `'${o2.name}'`;
          "string" == typeof o2.fullName && o2.fullName || e(`Failed to register mod ${r2}: Expected fullName to be non-empty string, got ${typeof o2.fullName}`), r2 = `'${o2.fullName} (${o2.name})'`, "string" != typeof o2.version && e(`Failed to register mod ${r2}: Expected version to be string, got ${typeof o2.version}`), o2.repository || (o2.repository = void 0), void 0 !== o2.repository && "string" != typeof o2.repository && e(`Failed to register mod ${r2}: Expected repository to be undefined or string, got ${typeof o2.version}`), null == t2 && (t2 = {}), t2 && "object" == typeof t2 || e(`Failed to register mod ${r2}: Expected options to be undefined or object, got ${typeof t2}`);
          const i2 = true === t2.allowReplace, a2 = f.get(o2.name);
          a2 && (a2.allowReplace && i2 || e(`Refusing to load mod ${r2}: it is already loaded and doesn't allow being replaced.
Was the mod loaded multiple times?`), u(a2));
          const c2 = (o3) => {
            let e2 = g2.patching.get(o3.name);
            return e2 || (e2 = { hooks: [], patches: /* @__PURE__ */ new Map() }, g2.patching.set(o3.name, e2)), e2;
          }, s2 = (o3, t3) => (...n2) => {
            var i3, a3;
            const c3 = null === (a3 = (i3 = m.errorReporterHooks).apiEndpointEnter) || void 0 === a3 ? void 0 : a3.call(i3, o3, g2.name);
            g2.loaded || e(`Mod ${r2} attempted to call SDK function after being unloaded`);
            const s3 = t3(...n2);
            return null == c3 || c3(), s3;
          }, p2 = { unload: s2("unload", (() => u(g2))), hookFunction: s2("hookFunction", ((o3, t3, n2) => {
            "string" == typeof o3 && o3 || e(`Mod ${r2} failed to patch a function: Expected function name string, got ${typeof o3}`);
            const i3 = l(o3), a3 = c2(i3);
            "number" != typeof t3 && e(`Mod ${r2} failed to hook function '${o3}': Expected priority number, got ${typeof t3}`), "function" != typeof n2 && e(`Mod ${r2} failed to hook function '${o3}': Expected hook function, got ${typeof n2}`);
            const s3 = { mod: g2.name, priority: t3, hook: n2 };
            return a3.hooks.push(s3), d(), () => {
              const o4 = a3.hooks.indexOf(s3);
              o4 >= 0 && (a3.hooks.splice(o4, 1), d());
            };
          })), patchFunction: s2("patchFunction", ((o3, t3) => {
            "string" == typeof o3 && o3 || e(`Mod ${r2} failed to patch a function: Expected function name string, got ${typeof o3}`);
            const i3 = l(o3), a3 = c2(i3);
            n(t3) || e(`Mod ${r2} failed to patch function '${o3}': Expected patches object, got ${typeof t3}`);
            for (const [n2, i4] of Object.entries(t3)) "string" == typeof i4 ? a3.patches.set(n2, i4) : null === i4 ? a3.patches.delete(n2) : e(`Mod ${r2} failed to patch function '${o3}': Invalid format of patch '${n2}'`);
            d();
          })), removePatches: s2("removePatches", ((o3) => {
            "string" == typeof o3 && o3 || e(`Mod ${r2} failed to patch a function: Expected function name string, got ${typeof o3}`);
            const t3 = l(o3);
            c2(t3).patches.clear(), d();
          })), callOriginal: s2("callOriginal", ((o3, t3, n2) => {
            "string" == typeof o3 && o3 || e(`Mod ${r2} failed to call a function: Expected function name string, got ${typeof o3}`);
            const i3 = l(o3);
            return Array.isArray(t3) || e(`Mod ${r2} failed to call a function: Expected args array, got ${typeof t3}`), i3.original.apply(null != n2 ? n2 : globalThis, t3);
          })), getOriginalHash: s2("getOriginalHash", ((o3) => {
            "string" == typeof o3 && o3 || e(`Mod ${r2} failed to get hash: Expected function name string, got ${typeof o3}`);
            return l(o3).originalHash;
          })) }, g2 = { name: o2.name, fullName: o2.fullName, version: o2.version, repository: o2.repository, allowReplace: i2, api: p2, loaded: true, patching: /* @__PURE__ */ new Map() };
          return f.set(o2.name, g2), Object.freeze(p2);
        }
        function h() {
          const o2 = [];
          for (const e2 of f.values()) o2.push({ name: e2.name, fullName: e2.fullName, version: e2.version, repository: e2.repository });
          return o2;
        }
        let m;
        const y = void 0 === window.bcModSdk ? window.bcModSdk = (function() {
          const e2 = { version: o, apiVersion: 1, registerMod: g, getModsInfo: h, getPatchingInfo: p, errorReporterHooks: Object.seal({ apiEndpointEnter: null, hookEnter: null, hookChainExit: null }) };
          return m = e2, Object.freeze(e2);
        })() : (n(window.bcModSdk) || e("Failed to init Mod SDK: Name already in use"), 1 !== window.bcModSdk.apiVersion && e(`Failed to init Mod SDK: Different version already loaded ('1.2.0' vs '${window.bcModSdk.version}')`), window.bcModSdk.version !== o && alert(`Mod SDK warning: Loading different but compatible versions ('1.2.0' vs '${window.bcModSdk.version}')
One of mods you are using is using an old version of SDK. It will work for now but please inform author to update`), window.bcModSdk);
        return "undefined" != typeof exports && (Object.defineProperty(exports, "__esModule", { value: true }), exports.default = y), y;
      })();
    }
  });

  // src/index.ts
  var import_bondage_club_mod_sdk = __toESM(require_bcmodsdk());

  // src/settings.ts
  var PLUGIN_KEY = "LilianMod";
  var SETTINGS_VERSION = "v0.1.0";
  var BACKUP_SUFFIX = "Backup";
  function getDefaultSettings() {
    return {
      ChatControlSetting: {
        customGarbleEnabled: true,
        garbleSound: "\u545C"
      }
    };
  }
  function getBackupStorageKey(memberNumber) {
    return `${PLUGIN_KEY}_${memberNumber}_${BACKUP_SUFFIX}`;
  }
  function sanitizeSettings(input) {
    const fallback = getDefaultSettings();
    if (!input || typeof input !== "object") return fallback;
    const raw = input;
    const chatControl = raw.ChatControlSetting;
    return {
      ChatControlSetting: {
        customGarbleEnabled: typeof (chatControl == null ? void 0 : chatControl.customGarbleEnabled) === "boolean" ? chatControl.customGarbleEnabled : fallback.ChatControlSetting.customGarbleEnabled,
        garbleSound: typeof (chatControl == null ? void 0 : chatControl.garbleSound) === "string" && chatControl.garbleSound.trim().length > 0 ? chatControl.garbleSound : fallback.ChatControlSetting.garbleSound
      }
    };
  }

  // src/storage.ts
  function compareVersion(a, b) {
    var _a, _b;
    const normA = a.replace(/^v/i, "");
    const normB = b.replace(/^v/i, "");
    const pa = normA.split(".").map((x) => Number.parseInt(x, 10) || 0);
    const pb = normB.split(".").map((x) => Number.parseInt(x, 10) || 0);
    const maxLen = Math.max(pa.length, pb.length);
    for (let i = 0; i < maxLen; i++) {
      const av = (_a = pa[i]) != null ? _a : 0;
      const bv = (_b = pb[i]) != null ? _b : 0;
      if (av > bv) return 1;
      if (av < bv) return -1;
    }
    return 0;
  }
  function parseSettings(raw) {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      if (!("settings" in parsed)) {
        return {
          settings: sanitizeSettings(parsed),
          version: "v0.0.0",
          updatedAt: 0
        };
      }
      const wrapped = parsed;
      const storedVersion = typeof wrapped.version === "string" ? wrapped.version : typeof wrapped.Version === "string" ? wrapped.Version : "v0.0.0";
      return {
        settings: sanitizeSettings(wrapped.settings),
        version: storedVersion,
        updatedAt: typeof wrapped.updatedAt === "number" ? wrapped.updatedAt : 0
      };
    } catch (e) {
      return null;
    }
  }
  function ensureExtensionSettingsContainer() {
    if (!Player.ExtensionSettings) Player.ExtensionSettings = {};
    return Player.ExtensionSettings;
  }
  function loadSettings() {
    var _a;
    const defaults = getDefaultSettings();
    const container = ensureExtensionSettingsContainer();
    const remoteRaw = (_a = container[PLUGIN_KEY]) != null ? _a : null;
    const backupRaw = localStorage.getItem(getBackupStorageKey(Player.MemberNumber));
    const remote = parseSettings(remoteRaw);
    const backup = parseSettings(backupRaw);
    if (!remote && !backup) return defaults;
    if (!remote) return backup.settings;
    if (!backup) return remote.settings;
    const versionCmp = compareVersion(remote.version, backup.version);
    if (versionCmp > 0) return remote.settings;
    if (versionCmp < 0) return backup.settings;
    return remote.updatedAt >= backup.updatedAt ? remote.settings : backup.settings;
  }
  function saveSettings(settings) {
    const container = ensureExtensionSettingsContainer();
    const value = JSON.stringify({
      settings: sanitizeSettings(settings),
      version: SETTINGS_VERSION,
      updatedAt: Date.now()
    });
    container[PLUGIN_KEY] = value;
    localStorage.setItem(getBackupStorageKey(Player.MemberNumber), value);
    ServerPlayerExtensionSettingsSync(PLUGIN_KEY);
  }

  // src/preferencesExtension.ts
  var MENU_BUTTON = {
    x: 150,
    y: 190,
    w: 450,
    h: 90
  };
  var CUSTOM_GARBLE_BUTTON = {
    x: 1200,
    y: 260,
    w: 560,
    h: 90
  };
  var GARBLE_SOUND_BUTTON = {
    x: 1200,
    y: 380,
    w: 560,
    h: 90
  };
  var LSCG_EXIT_BUTTON = {
    x: 1815,
    y: 75,
    w: 90,
    h: 90
  };
  var GARBLE_SOUND_PRESETS = ["\u545C", "\u55EF", "\u5514", "m"];
  function registerPreferencesExtension(state) {
    let view = "MainMenu";
    PreferenceRegisterExtensionSetting({
      Identifier: PLUGIN_KEY,
      ButtonText: "LilianMod",
      load: () => {
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
      }
    });
  }

  // src/chat-control/garble.ts
  function garbleChar(c, garbleSound, allowHyphen) {
    if (/^\p{N}/u.test(c)) {
      return { content: "*", allowHyphen: false };
    } else if (/^\p{Lu}/u.test(c)) {
      return { content: "M", allowHyphen: false };
    } else if (/^[\x00-\x7F]*$/.test(c)) {
      return { content: "m", allowHyphen: false };
    } else if (allowHyphen && Math.random() < 0.7) {
      return { content: "\u2014", allowHyphen: true };
    } else {
      return { content: garbleSound[Math.floor(Math.random() * garbleSound.length)], allowHyphen: true };
    }
  }
  function garbleMessage(msg, gagLevel, garbleSound) {
    if (gagLevel <= 0) return msg;
    let inOOC = false;
    let allowHyphen = false;
    const output = [];
    let i = 0;
    while (i < msg.length) {
      switch (msg[i]) {
        case "(":
        case "\uFF08":
          inOOC = true;
          allowHyphen = false;
          output.push(msg[i++]);
          continue;
        case ")":
        case "\uFF09":
          inOOC = false;
          allowHyphen = false;
          output.push(msg[i++]);
          continue;
      }
      if (inOOC || !/^(\p{L}|\p{N})/u.test(msg[i])) {
        allowHyphen = false;
        output.push(msg[i++]);
        continue;
      }
      if (Math.random() * 30 > gagLevel + 6) {
        allowHyphen = false;
        output.push(msg[i++]);
        continue;
      }
      const res = garbleChar(msg[i], garbleSound, allowHyphen);
      output.push(res.content);
      allowHyphen = res.allowHyphen;
      i++;
    }
    return output.join("");
  }

  // src/chat-control/hook.ts
  var installed = false;
  function getGarbleSound(sound) {
    const cleaned = sound.trim();
    return cleaned.length > 0 ? [cleaned] : ["\u545C"];
  }
  function installChatGarbleHook(mod, getSettings) {
    if (installed) return;
    installed = true;
    mod.hookFunction("ChatRoomGenerateChatRoomChatMessage", 10, (args, next) => {
      const [type, originalInput, replyId] = args;
      let msg = originalInput;
      const settings = getSettings();
      if (!settings.ChatControlSetting.customGarbleEnabled || type !== "Chat" && type !== "Whisper") {
        return next(args);
      }
      const dictionary = new DictionaryBuilder().sourceCharacter(Player).build();
      const lastRange = SpeechGetOOCRanges(msg).pop();
      if (Player.ChatSettings.OOCAutoClose && lastRange !== void 0 && msg.charAt(lastRange.start + lastRange.length - 1) !== ")" && lastRange.start + lastRange.length === msg.length && lastRange.length !== 1) {
        msg += ")";
      }
      const originalMsg = msg;
      const garbledMsg = garbleMessage(
        originalMsg,
        SpeechTransformGagGarbleIntensity(Player),
        getGarbleSound(settings.ChatControlSetting.garbleSound)
      );
      if (Player.RestrictionSettings.NoSpeechGarble && garbledMsg !== originalMsg) {
        dictionary.push({ Effects: ["gagGarble"], Original: originalMsg });
      }
      if (replyId) {
        dictionary.push({ ReplyId: replyId, Tag: "ReplyId" });
        ChatRoomMessageReplyStop();
      }
      return { Content: garbledMsg, Type: type, Dictionary: dictionary };
    });
  }

  // src/index.ts
  function canBootstrap() {
    return typeof Player !== "undefined" && typeof PreferenceRegisterExtensionSetting === "function" && typeof ServerPlayerExtensionSettingsSync === "function";
  }
  function bootstrap() {
    if (window.LilianMod_Loaded) return;
    window.LilianMod_Loaded = false;
    const state = {
      settings: loadSettings()
    };
    const mod = import_bondage_club_mod_sdk.default.registerMod({
      name: PLUGIN_KEY,
      fullName: "LilianMod",
      version: SETTINGS_VERSION.replace(/^v/i, "")
    });
    installChatGarbleHook(mod, () => state.settings);
    registerPreferencesExtension(state);
    window.LilianMod_Loaded = true;
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
