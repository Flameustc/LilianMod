// ==UserScript==
// @name LilianMod
// @namespace lilianmod
// @version 0.4.0
// @description LilianMod for BondageClub
// @match https://www.bondageprojects.elementfx.com/*
// @match https://bondageprojects.elementfx.com/*
// @match https://www.bondageprojects.com/*
// @match http://localhost:*/*
// @match https://localhost:*/*
// @grant none
// ==/UserScript==
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
  var SETTINGS_VERSION = "v0.4.0";
  var BACKUP_SUFFIX = "Backup";
  var MISTRESS_MEMBER_LIMIT = 32;
  function pushMistressMember(out, seen, n) {
    if (!Number.isInteger(n) || n <= 0 || n > 999999999) return;
    if (seen.has(n) || out.length >= MISTRESS_MEMBER_LIMIT) return;
    seen.add(n);
    out.push(n);
  }
  function parseMistressMemberNumbers(value) {
    const out = [];
    const seen = /* @__PURE__ */ new Set();
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "number" && Number.isInteger(item)) {
          pushMistressMember(out, seen, item);
        } else if (typeof item === "string") {
          for (const part of item.split(/[^0-9]+/)) {
            if (!part) continue;
            pushMistressMember(out, seen, Number.parseInt(part, 10));
          }
        }
      }
      return out;
    }
    if (typeof value === "string") {
      for (const part of value.split(/[^0-9]+/)) {
        if (!part) continue;
        pushMistressMember(out, seen, Number.parseInt(part, 10));
      }
    }
    return out;
  }
  function formatMistressMemberNumbers(values) {
    return values.join(", ");
  }
  function getDefaultSettings() {
    return {
      ChatControlSetting: {
        customGarbleEnabled: true,
        garbleSound: "\u545C"
      },
      OrgasmControlSetting: {
        sensitivityLevel: 0,
        forceOrgasmEnabled: false,
        forceOrgasmDesireThreshold: 0,
        mistressMemberNumbers: []
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
    const orgasm = raw.OrgasmControlSetting;
    let sensitivityLevel = fallback.OrgasmControlSetting.sensitivityLevel;
    let forceOrgasmEnabled = fallback.OrgasmControlSetting.forceOrgasmEnabled;
    let forceOrgasmDesireThreshold = fallback.OrgasmControlSetting.forceOrgasmDesireThreshold;
    let mistressMemberNumbers = fallback.OrgasmControlSetting.mistressMemberNumbers;
    if (orgasm && typeof orgasm === "object") {
      const o = orgasm;
      const ov = o.sensitivityLevel;
      if (typeof ov === "number" && Number.isFinite(ov)) {
        sensitivityLevel = Math.floor(ov);
        if (sensitivityLevel < 0) sensitivityLevel = 0;
        if (sensitivityLevel > 10) sensitivityLevel = 10;
      }
      if (typeof o.forceOrgasmEnabled === "boolean") {
        forceOrgasmEnabled = o.forceOrgasmEnabled;
      }
      const th = o.forceOrgasmDesireThreshold;
      if (typeof th === "number" && Number.isFinite(th)) {
        forceOrgasmDesireThreshold = Math.min(100, Math.max(0, Math.floor(th)));
      }
      if ("mistressMemberNumbers" in o) {
        mistressMemberNumbers = parseMistressMemberNumbers(o.mistressMemberNumbers);
      }
    }
    let customGarbleEnabled = fallback.ChatControlSetting.customGarbleEnabled;
    let garbleSound = fallback.ChatControlSetting.garbleSound;
    if (chatControl && typeof chatControl === "object") {
      const c = chatControl;
      if (typeof c.customGarbleEnabled === "boolean") {
        customGarbleEnabled = c.customGarbleEnabled;
      }
      if (typeof c.garbleSound === "string" && c.garbleSound.trim().length > 0) {
        garbleSound = c.garbleSound;
      }
    }
    return {
      ChatControlSetting: {
        customGarbleEnabled,
        garbleSound
      },
      OrgasmControlSetting: {
        sensitivityLevel,
        forceOrgasmEnabled,
        forceOrgasmDesireThreshold,
        mistressMemberNumbers
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
      const o = parsed;
      let settingsSource = parsed;
      let storedVersion = "v0.0.0";
      let updatedAt = 0;
      if ("settings" in o) {
        const inner = o.settings;
        if (inner != null && typeof inner === "object") {
          settingsSource = inner;
        } else {
          settingsSource = {};
        }
      }
      if (typeof o.version === "string") {
        storedVersion = o.version;
      } else if (typeof o.Version === "string") {
        storedVersion = o.Version;
      }
      if (typeof o.updatedAt === "number") {
        updatedAt = o.updatedAt;
      }
      return {
        settings: sanitizeSettings(settingsSource),
        version: storedVersion,
        updatedAt
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

  // src/ui/preferenceExtensionLayout.ts
  var SUB_X0 = 180;
  var PREFERENCE_EXT_MAIN_MENU = {
    ORIGIN_X: 150,
    ORIGIN_Y: 190,
    STEP_X: 480,
    STEP_Y: 120,
    BTN_W: 450,
    BTN_H: 90,
    ICON_SIZE: 70,
    ICON_PAD: 10,
    TEXT_INNER_X: 100,
    TEXT_BASELINE_OFFSET: 45,
    TEXT_MAX_W: 340
  };
  var PREFERENCE_EXT_SUBSCREEN = {
    START_X: SUB_X0,
    START_Y: 205,
    /** 行距；标签悬停框高度 64、顶边 y = 行基线 −32，故需 Y_MOD ≥ 64 才不重叠（现余 11px 间隙） */
    Y_MOD: 75,
    TITLE_Y: 130,
    LABEL_WIDTH: 600,
    /** 勾选框左缘，同 LSCG `getXPos(i) + 600` */
    CHECKBOX_LEFT: SUB_X0 + 600,
    /** `ElementPosition` 横坐标（控件水平中心），同 LSCG `getXPos(i) + 750` */
    CONTROL_CENTER_X: SUB_X0 + 750,
    CONTROL_W: 300,
    CONTROL_BTN_H: 50,
    CHECKBOX_SIZE: 64
  };
  var PREFERENCE_EXT_EXIT = { x: 1815, y: 75, w: 90, h: 90 };
  var PREFERENCE_EXT_HELP = { x: 1815, y: 820, w: 90, h: 90 };
  var PREFERENCE_EXT_TOOLTIP_BAR = {
    X: 300,
    Y: 850,
    W: 1400,
    H: 65
  };
  function preferenceExtMainMenuSlot(px, py) {
    return {
      x: PREFERENCE_EXT_MAIN_MENU.ORIGIN_X + PREFERENCE_EXT_MAIN_MENU.STEP_X * px,
      y: PREFERENCE_EXT_MAIN_MENU.ORIGIN_Y + PREFERENCE_EXT_MAIN_MENU.STEP_Y * py
    };
  }
  function preferenceExtSubscreenRowY(row) {
    return PREFERENCE_EXT_SUBSCREEN.START_Y + PREFERENCE_EXT_SUBSCREEN.Y_MOD * row;
  }

  // src/preferencesExtension.ts
  var MAIN_ICON = "Icons/Preference.png";
  var PREF_INPUT_GARBLE = `${PLUGIN_KEY}-pref-garble-sound`;
  var PREF_INPUT_SENSITIVITY = `${PLUGIN_KEY}-pref-sensitivity-level`;
  var PREF_INPUT_DESIRE_THRESHOLD = `${PLUGIN_KEY}-pref-desire-threshold`;
  var PREF_INPUT_MISTRESS_MEMBERS = `${PLUGIN_KEY}-pref-mistress-members`;
  var MISTRESS_MEMBERS_MAX_LEN = 400;
  var GARBLE_SOUND_MAX_LEN = 24;
  var TT_CUSTOM_GARBLE = "\u5F00\u542F\u540E\uFF0C\u51FA\u7AD9\u53E3\u585E\u8D70 Lilian \u7B97\u6CD5\uFF08\u545C / m / M / * / \u2014\uFF09\uFF0C\u5E76\u76D6\u8FC7\u540C\u8DEF\u5F84\u4E0A\u7684\u5176\u5B83\u542B\u7CCA\uFF1B\u53D1\u51FA\u7684\u804A\u5929\u4E0D\u9644\u5E26 WCE/BCX \u53EF\u8FD8\u539F\u7684\u539F\u6587\u3002\u5173\u95ED\u5219\u4EA4\u7ED9\u6E38\u620F\u548C\u5DF2\u88C5\u63D2\u4EF6\u3002";
  var TT_GARBLE_SOUND = "\u542B\u7CCA\u65F6\u63D2\u5165\u7684\u62DF\u58F0\u5B57\uFF0C\u5728\u6846\u5185\u76F4\u63A5\u8F93\u5165\uFF08\u5EFA\u8BAE\u77ED\u5B57\u6216\u8BCD\uFF09\u3002\u82E5\u6E05\u7A7A\u540E\u5931\u7126/\u66F4\u6539\uFF0C\u5C06\u6062\u590D\u4E3A\u9ED8\u8BA4\u300C\u545C\u300D\u3002\u6700\u591A 24 \u5B57\u7B26\u3002";
  var TT_SENSITIVITY_LEVEL = "\u654F\u611F\u5EA6\u7B49\u7EA7\uFF08Sensitivity level\uFF090\u201310\u3002\u6570\u503C \xD710 \u4F1A\u5E76\u5165\u5404\u7C7B\u884C\u4E3A\u5BFC\u81F4\u7684 arousal \u5C01\u9876\uFF08\u6700\u5927 100\uFF09\uFF1B\u5C01\u9876\u81F3 100 \u65F6\u53EF\u89E6\u53D1\u9AD8\u6F6E\u3002";
  var TT_FORCE_ORGASM = "\u5F00\u542F\u540E\uFF0C\u4EC5\u5F53\u4E0B\u65B9\u9608\u503C\u5927\u4E8E 0 \u4E14\u6B32\u671B\u8FBE\u5230\u6216\u8D85\u8FC7\u8BE5\u9608\u503C\u65F6\uFF0C\u9AD8\u6F6E\u51C6\u5907\u4F1A\u65E0\u89C6 Denial/Edged \u53CA BCX \u7684\u963B\u65AD\uFF0C\u8FDB\u5165\u53EF\u62B5\u6297\u7684\u9AD8\u6F6E\u6D41\u7A0B\uFF1B\u62B5\u6297\u5931\u8D25\u4E3A\u6B63\u5E38\u9AD8\u6F6E\uFF08\u6E05\u9664 Ruined\uFF09\uFF0C\u4E0D\u662F ruined\u3002\u9608\u503C\u4E3A 0 \u65F6\u4E0D\u7ED5\u8FC7\u3002";
  var TT_DESIRE_THRESHOLD = "\u5F3A\u5236\u9AD8\u6F6E\u6B32\u671B\u9608\u503C\uFF080\u2013100\uFF0C\u9ED8\u8BA4 0\uFF09\u3002\u8FDB\u5EA6\u82E5\u4F1A\u8D85\u8FC7 100\uFF0C\u6EA2\u51FA\u51CF\u53BB\u5F53\u524D\u6B32\u671B\u7684\u4E00\u534A\u540E\u8BA1\u5165\u9690\u85CF\u6B32\u671B\uFF0C\u6BCF 1.9 \u79D2\u8870\u51CF 2 \u70B9\u3002\u4EC5\u5F53\u9608\u503C\u5927\u4E8E 0 \u4E14\u6B32\u671B\u8FBE\u5230\u6216\u8D85\u8FC7\u8BE5\u503C\u65F6\u624D\u5F3A\u5236\u9AD8\u6F6E\uFF1B\u9608\u503C\u4E3A 0 \u65F6\u5173\u95ED\u7ED5\u8FC7\uFF0C\u6B32\u671B\u518D\u9AD8\u4E5F\u4E0D\u5F3A\u5236\u3002ruined \u989D\u5916 +5 \u6B32\u671B\u3002";
  var TT_MISTRESS_MEMBERS = "Ownership \u4E2D\u7684\u4E3B\u4EBA\u4F1A\u81EA\u52A8\u89C6\u4E3A\u5973\u4E3B\u4EBA\u3002\u8FD9\u91CC\u518D\u586B\u989D\u5916\u6210\u5458\u53F7\uFF08\u9017\u53F7\u6216\u7A7A\u683C\u5206\u9694\uFF0C\u6700\u591A 32 \u4E2A\uFF09\u3002\u6765\u6E90\u6216\u76EE\u6807\u662F\u5973\u4E3B\u4EBA\u65F6\uFF0C\u73A9\u5BB6\u4ECE\u8BE5\u4E92\u52A8\u83B7\u5F97\u7684\u8FDB\u5EA6\u56E0\u5B50\u7FFB\u500D\u3002";
  function drawPreferenceTooltipBar(text) {
    const { X: x, Y: y, W: w, H: h } = PREFERENCE_EXT_TOOLTIP_BAR;
    const canvas = MainCanvas;
    const bak = canvas.textAlign;
    canvas.textAlign = "left";
    DrawRect(x, y, w, h, "#FFFF88");
    DrawEmptyRect(x, y, w, h, "black", 2);
    DrawTextFit(text, x + 3, y + 33, w - 6, "black");
    canvas.textAlign = bak;
  }
  function drawExtensionExitAndHelp() {
    DrawButton(
      PREFERENCE_EXT_EXIT.x,
      PREFERENCE_EXT_EXIT.y,
      PREFERENCE_EXT_EXIT.w,
      PREFERENCE_EXT_EXIT.h,
      "",
      "White",
      "Icons/Exit.png",
      "Main Menu"
    );
    DrawButton(
      PREFERENCE_EXT_HELP.x,
      PREFERENCE_EXT_HELP.y,
      PREFERENCE_EXT_HELP.w,
      PREFERENCE_EXT_HELP.h,
      "",
      "White",
      "Icons/Introduction.png",
      "LilianMod"
    );
  }
  function drawMainMenuEntry(px, py, icon, label) {
    const { x, y } = preferenceExtMainMenuSlot(px, py);
    MainCanvas.textAlign = "center";
    DrawButton(x, y, PREFERENCE_EXT_MAIN_MENU.BTN_W, PREFERENCE_EXT_MAIN_MENU.BTN_H, "", "White");
    DrawImageResize(
      icon,
      x + PREFERENCE_EXT_MAIN_MENU.ICON_PAD,
      y + PREFERENCE_EXT_MAIN_MENU.ICON_PAD,
      PREFERENCE_EXT_MAIN_MENU.ICON_SIZE,
      PREFERENCE_EXT_MAIN_MENU.ICON_SIZE
    );
    MainCanvas.textAlign = "left";
    DrawTextFit(
      label,
      x + PREFERENCE_EXT_MAIN_MENU.TEXT_INNER_X,
      y + PREFERENCE_EXT_MAIN_MENU.TEXT_BASELINE_OFFSET,
      PREFERENCE_EXT_MAIN_MENU.TEXT_MAX_W,
      "Black"
    );
    MainCanvas.textAlign = "center";
  }
  function clickMainMenuEntry(px, py) {
    const { x, y } = preferenceExtMainMenuSlot(px, py);
    return MouseIn(x, y, PREFERENCE_EXT_MAIN_MENU.BTN_W, PREFERENCE_EXT_MAIN_MENU.BTN_H);
  }
  function removePreferenceExtensionInputs() {
    ElementRemove(PREF_INPUT_GARBLE);
    ElementRemove(PREF_INPUT_SENSITIVITY);
    ElementRemove(PREF_INPUT_DESIRE_THRESHOLD);
    ElementRemove(PREF_INPUT_MISTRESS_MEMBERS);
  }
  function registerPreferencesExtension(state) {
    let view = "MainMenu";
    let inputsMountedView = null;
    function ensurePreferenceExtensionInputs(sub) {
      if (inputsMountedView === sub) return;
      removePreferenceExtensionInputs();
      inputsMountedView = sub;
      if (sub === "ChatControl") {
        const inp = ElementCreateInput(
          PREF_INPUT_GARBLE,
          "text",
          state.settings.ChatControlSetting.garbleSound,
          String(GARBLE_SOUND_MAX_LEN)
        );
        inp.setAttribute("autocomplete", "off");
        const commit = () => {
          let v = inp.value.trim();
          if (!v) v = getDefaultSettings().ChatControlSetting.garbleSound;
          const chars = [...v];
          if (chars.length > GARBLE_SOUND_MAX_LEN) {
            v = chars.slice(0, GARBLE_SOUND_MAX_LEN).join("");
          } else {
            v = chars.join("");
          }
          state.settings.ChatControlSetting.garbleSound = v;
          inp.value = v;
          saveSettings(state.settings);
        };
        inp.addEventListener("change", commit);
        inp.addEventListener("blur", commit);
      } else {
        const sensInp = ElementCreateInput(
          PREF_INPUT_SENSITIVITY,
          "number",
          String(state.settings.OrgasmControlSetting.sensitivityLevel),
          "2"
        );
        sensInp.setAttribute("min", "0");
        sensInp.setAttribute("max", "10");
        sensInp.setAttribute("autocomplete", "off");
        const commitSens = () => {
          let n = parseInt(sensInp.value, 10);
          if (!Number.isFinite(n)) {
            n = state.settings.OrgasmControlSetting.sensitivityLevel;
          } else {
            n = Math.min(10, Math.max(0, Math.floor(n)));
          }
          state.settings.OrgasmControlSetting.sensitivityLevel = n;
          sensInp.value = String(n);
          saveSettings(state.settings);
        };
        sensInp.addEventListener("change", commitSens);
        sensInp.addEventListener("blur", commitSens);
        const thrInp = ElementCreateInput(
          PREF_INPUT_DESIRE_THRESHOLD,
          "number",
          String(state.settings.OrgasmControlSetting.forceOrgasmDesireThreshold),
          "3"
        );
        thrInp.setAttribute("min", "0");
        thrInp.setAttribute("max", "100");
        thrInp.setAttribute("autocomplete", "off");
        const commitThr = () => {
          let n = parseInt(thrInp.value, 10);
          if (!Number.isFinite(n)) {
            n = state.settings.OrgasmControlSetting.forceOrgasmDesireThreshold;
          } else {
            n = Math.min(100, Math.max(0, Math.floor(n)));
          }
          state.settings.OrgasmControlSetting.forceOrgasmDesireThreshold = n;
          thrInp.value = String(n);
          saveSettings(state.settings);
        };
        thrInp.addEventListener("change", commitThr);
        thrInp.addEventListener("blur", commitThr);
        const mistressInp = ElementCreateInput(
          PREF_INPUT_MISTRESS_MEMBERS,
          "text",
          formatMistressMemberNumbers(state.settings.OrgasmControlSetting.mistressMemberNumbers),
          String(MISTRESS_MEMBERS_MAX_LEN)
        );
        mistressInp.setAttribute("autocomplete", "off");
        const commitMistresses = () => {
          const parsed = parseMistressMemberNumbers(mistressInp.value);
          state.settings.OrgasmControlSetting.mistressMemberNumbers = parsed;
          mistressInp.value = formatMistressMemberNumbers(parsed);
          saveSettings(state.settings);
        };
        mistressInp.addEventListener("change", commitMistresses);
        mistressInp.addEventListener("blur", commitMistresses);
      }
    }
    function positionPreferenceExtensionInput(sub, row) {
      const y = preferenceExtSubscreenRowY(row);
      const cx = PREFERENCE_EXT_SUBSCREEN.CONTROL_CENTER_X;
      const cy = y - 20 + PREFERENCE_EXT_SUBSCREEN.CONTROL_BTN_H / 2;
      if (sub === "ChatControl") {
        ElementPosition(
          PREF_INPUT_GARBLE,
          cx,
          cy,
          PREFERENCE_EXT_SUBSCREEN.CONTROL_W,
          PREFERENCE_EXT_SUBSCREEN.CONTROL_BTN_H
        );
      } else if (row === 1) {
        ElementPosition(
          PREF_INPUT_SENSITIVITY,
          cx,
          cy,
          PREFERENCE_EXT_SUBSCREEN.CONTROL_W,
          PREFERENCE_EXT_SUBSCREEN.CONTROL_BTN_H
        );
      } else if (row === 2) {
        ElementPosition(
          PREF_INPUT_DESIRE_THRESHOLD,
          cx,
          cy,
          PREFERENCE_EXT_SUBSCREEN.CONTROL_W,
          PREFERENCE_EXT_SUBSCREEN.CONTROL_BTN_H
        );
      } else {
        ElementPosition(
          PREF_INPUT_MISTRESS_MEMBERS,
          cx,
          cy,
          PREFERENCE_EXT_SUBSCREEN.CONTROL_W,
          PREFERENCE_EXT_SUBSCREEN.CONTROL_BTN_H
        );
      }
    }
    function syncPreferenceInputsFromState(sub) {
      if (sub === "ChatControl") {
        const el = document.getElementById(PREF_INPUT_GARBLE);
        if (!el || document.activeElement === el) return;
        const want = state.settings.ChatControlSetting.garbleSound;
        if (el.value !== want) el.value = want;
      } else {
        const sens = document.getElementById(PREF_INPUT_SENSITIVITY);
        if (sens && document.activeElement !== sens) {
          const wantS = String(state.settings.OrgasmControlSetting.sensitivityLevel);
          if (sens.value !== wantS) sens.value = wantS;
        }
        const thr = document.getElementById(PREF_INPUT_DESIRE_THRESHOLD);
        if (thr && document.activeElement !== thr) {
          const wantT = String(state.settings.OrgasmControlSetting.forceOrgasmDesireThreshold);
          if (thr.value !== wantT) thr.value = wantT;
        }
        const mistress = document.getElementById(PREF_INPUT_MISTRESS_MEMBERS);
        if (mistress && document.activeElement !== mistress) {
          const wantM = formatMistressMemberNumbers(state.settings.OrgasmControlSetting.mistressMemberNumbers);
          if (mistress.value !== wantM) mistress.value = wantM;
        }
      }
    }
    PreferenceRegisterExtensionSetting({
      Identifier: PLUGIN_KEY,
      ButtonText: "LilianMod",
      Image: MAIN_ICON,
      load: () => {
        state.settings = loadSettings();
        view = "MainMenu";
        removePreferenceExtensionInputs();
        inputsMountedView = null;
      },
      unload: () => {
        removePreferenceExtensionInputs();
        inputsMountedView = null;
      },
      run: () => {
        const previousAlign = MainCanvas.textAlign;
        if (view === "MainMenu") {
          removePreferenceExtensionInputs();
          inputsMountedView = null;
          MainCanvas.textAlign = "left";
          DrawText(
            `- LilianMod Settings -`,
            PREFERENCE_EXT_SUBSCREEN.START_X,
            PREFERENCE_EXT_SUBSCREEN.TITLE_Y,
            "Black",
            "#D7F6E9"
          );
          drawMainMenuEntry(0, 0, MAIN_ICON, "ChatControl");
          drawMainMenuEntry(0, 1, MAIN_ICON, "\u9AD8\u6F6E\u63A7\u5236");
          MainCanvas.textAlign = previousAlign;
          drawExtensionExitAndHelp();
          return;
        }
        MainCanvas.textAlign = "left";
        if (view === "ChatControl") {
          ensurePreferenceExtensionInputs("ChatControl");
          positionPreferenceExtensionInput("ChatControl", 1);
          syncPreferenceInputsFromState("ChatControl");
          DrawText(
            `- LilianMod ChatControl -`,
            PREFERENCE_EXT_SUBSCREEN.START_X,
            PREFERENCE_EXT_SUBSCREEN.TITLE_Y,
            "Black",
            "#D7F6E9"
          );
          const xL = PREFERENCE_EXT_SUBSCREEN.START_X;
          const y0 = preferenceExtSubscreenRowY(0);
          const hover0 = MouseIn(xL, y0 - 32, PREFERENCE_EXT_SUBSCREEN.LABEL_WIDTH, 64);
          DrawCheckbox(
            PREFERENCE_EXT_SUBSCREEN.CHECKBOX_LEFT,
            y0 - 32,
            PREFERENCE_EXT_SUBSCREEN.CHECKBOX_SIZE,
            PREFERENCE_EXT_SUBSCREEN.CHECKBOX_SIZE,
            "",
            state.settings.ChatControlSetting.customGarbleEnabled,
            false
          );
          DrawTextFit(
            "Custom gag garble",
            xL,
            y0,
            PREFERENCE_EXT_SUBSCREEN.LABEL_WIDTH,
            hover0 ? "Red" : "Black",
            "Gray"
          );
          const y1 = preferenceExtSubscreenRowY(1);
          const hover1 = MouseIn(xL, y1 - 32, PREFERENCE_EXT_SUBSCREEN.LABEL_WIDTH, 64);
          DrawTextFit(
            "Garble sound",
            xL,
            y1,
            PREFERENCE_EXT_SUBSCREEN.LABEL_WIDTH,
            hover1 ? "Red" : "Black",
            "Gray"
          );
          if (hover0) {
            drawPreferenceTooltipBar(TT_CUSTOM_GARBLE);
          }
          if (hover1) {
            drawPreferenceTooltipBar(TT_GARBLE_SOUND);
          }
        } else {
          ensurePreferenceExtensionInputs("OrgasmControl");
          positionPreferenceExtensionInput("OrgasmControl", 1);
          positionPreferenceExtensionInput("OrgasmControl", 2);
          positionPreferenceExtensionInput("OrgasmControl", 3);
          syncPreferenceInputsFromState("OrgasmControl");
          DrawText(
            `- LilianMod \u9AD8\u6F6E\u63A7\u5236 -`,
            PREFERENCE_EXT_SUBSCREEN.START_X,
            PREFERENCE_EXT_SUBSCREEN.TITLE_Y,
            "Black",
            "#D7F6E9"
          );
          const xL = PREFERENCE_EXT_SUBSCREEN.START_X;
          const y0 = preferenceExtSubscreenRowY(0);
          const hover0 = MouseIn(xL, y0 - 32, PREFERENCE_EXT_SUBSCREEN.LABEL_WIDTH, 64);
          DrawCheckbox(
            PREFERENCE_EXT_SUBSCREEN.CHECKBOX_LEFT,
            y0 - 32,
            PREFERENCE_EXT_SUBSCREEN.CHECKBOX_SIZE,
            PREFERENCE_EXT_SUBSCREEN.CHECKBOX_SIZE,
            "",
            state.settings.OrgasmControlSetting.forceOrgasmEnabled,
            false
          );
          DrawTextFit(
            "\u5F3A\u5236\u9AD8\u6F6E (Force orgasm)",
            xL,
            y0,
            PREFERENCE_EXT_SUBSCREEN.LABEL_WIDTH,
            hover0 ? "Red" : "Black",
            "Gray"
          );
          const y1 = preferenceExtSubscreenRowY(1);
          const hover1 = MouseIn(xL, y1 - 32, PREFERENCE_EXT_SUBSCREEN.LABEL_WIDTH, 64);
          DrawTextFit(
            "\u654F\u611F\u5EA6\u7B49\u7EA7 (Sensitivity 0\u201310)",
            xL,
            y1,
            PREFERENCE_EXT_SUBSCREEN.LABEL_WIDTH,
            hover1 ? "Red" : "Black",
            "Gray"
          );
          const y2 = preferenceExtSubscreenRowY(2);
          const hover2 = MouseIn(xL, y2 - 32, PREFERENCE_EXT_SUBSCREEN.LABEL_WIDTH, 64);
          DrawTextFit(
            "\u5F3A\u5236\u9AD8\u6F6E\u6B32\u671B\u9608\u503C (0\u2013100)",
            xL,
            y2,
            PREFERENCE_EXT_SUBSCREEN.LABEL_WIDTH,
            hover2 ? "Red" : "Black",
            "Gray"
          );
          const y3 = preferenceExtSubscreenRowY(3);
          const hover3 = MouseIn(xL, y3 - 32, PREFERENCE_EXT_SUBSCREEN.LABEL_WIDTH, 64);
          DrawTextFit(
            "\u989D\u5916\u5973\u4E3B\u4EBA\u6210\u5458\u53F7",
            xL,
            y3,
            PREFERENCE_EXT_SUBSCREEN.LABEL_WIDTH,
            hover3 ? "Red" : "Black",
            "Gray"
          );
          if (hover0) {
            drawPreferenceTooltipBar(TT_FORCE_ORGASM);
          }
          if (hover1) {
            drawPreferenceTooltipBar(TT_SENSITIVITY_LEVEL);
          }
          if (hover2) {
            drawPreferenceTooltipBar(TT_DESIRE_THRESHOLD);
          }
          if (hover3) {
            drawPreferenceTooltipBar(TT_MISTRESS_MEMBERS);
          }
        }
        MainCanvas.textAlign = previousAlign;
        drawExtensionExitAndHelp();
      },
      click: () => {
        if (MouseIn(PREFERENCE_EXT_EXIT.x, PREFERENCE_EXT_EXIT.y, PREFERENCE_EXT_EXIT.w, PREFERENCE_EXT_EXIT.h)) {
          if (view === "ChatControl" || view === "OrgasmControl") {
            saveSettings(state.settings);
            removePreferenceExtensionInputs();
            inputsMountedView = null;
            view = "MainMenu";
          } else {
            saveSettings(state.settings);
            void PreferenceSubscreenExtensionsClear();
          }
          return;
        }
        if (view === "MainMenu") {
          if (clickMainMenuEntry(0, 0)) {
            view = "ChatControl";
            return;
          }
          if (clickMainMenuEntry(0, 1)) {
            view = "OrgasmControl";
            return;
          }
          return;
        }
        if (view === "ChatControl") {
          const xL = PREFERENCE_EXT_SUBSCREEN.START_X;
          const y0 = preferenceExtSubscreenRowY(0);
          if (MouseIn(
            PREFERENCE_EXT_SUBSCREEN.CHECKBOX_LEFT,
            y0 - 32,
            PREFERENCE_EXT_SUBSCREEN.CHECKBOX_SIZE,
            PREFERENCE_EXT_SUBSCREEN.CHECKBOX_SIZE
          )) {
            state.settings.ChatControlSetting.customGarbleEnabled = !state.settings.ChatControlSetting.customGarbleEnabled;
            saveSettings(state.settings);
          }
        } else if (view === "OrgasmControl") {
          const y0 = preferenceExtSubscreenRowY(0);
          if (MouseIn(
            PREFERENCE_EXT_SUBSCREEN.CHECKBOX_LEFT,
            y0 - 32,
            PREFERENCE_EXT_SUBSCREEN.CHECKBOX_SIZE,
            PREFERENCE_EXT_SUBSCREEN.CHECKBOX_SIZE
          )) {
            state.settings.OrgasmControlSetting.forceOrgasmEnabled = !state.settings.OrgasmControlSetting.forceOrgasmEnabled;
            saveSettings(state.settings);
          }
        }
      },
      exit: () => {
        saveSettings(state.settings);
        removePreferenceExtensionInputs();
        inputsMountedView = null;
      }
    });
  }

  // src/chat-control/cleartextDictionary.ts
  var CLEARTEXT_VALUE_KEYS = ["Original", "OriginalMsg"];
  function stripGarbleCleartextDictionary(message) {
    const dictionary = message == null ? void 0 : message.Dictionary;
    if (!Array.isArray(dictionary)) return;
    for (let index = dictionary.length - 1; index >= 0; index -= 1) {
      const entry = dictionary[index];
      if (!entry || typeof entry !== "object") continue;
      const record = entry;
      if (record.Tag === "BCX_ORIGINAL_MESSAGE") {
        dictionary.splice(index, 1);
        continue;
      }
      for (const key of CLEARTEXT_VALUE_KEYS) {
        if (key in record) delete record[key];
      }
    }
  }
  function finalizeCustomGarbleMessage(message, input) {
    const gagApplies = input.hookRan || input.intensity > 0;
    if (!gagApplies) return false;
    if (!input.hookRan && input.intensity > 0 && typeof message.Content === "string") {
      message.Content = input.garble(message.Content);
    }
    stripGarbleCleartextDictionary(message);
    return true;
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
  function garbleSoundList(sound) {
    const cleaned = sound.trim();
    return cleaned.length > 0 ? [cleaned] : ["\u545C"];
  }
  function garbleMessage(msg, gagLevel, garbleSound, ignoreOOC = false) {
    if (gagLevel <= 0) return msg;
    let inOOC = false;
    let allowHyphen = false;
    const output = [];
    let i = 0;
    while (i < msg.length) {
      switch (msg[i]) {
        case "(":
        case "\uFF08":
          if (!ignoreOOC) inOOC = true;
          allowHyphen = false;
          output.push(msg[i++]);
          continue;
        case ")":
        case "\uFF09":
          if (!ignoreOOC) inOOC = false;
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

  // src/chat-control/garblePriorities.ts
  var GARBLE_HOOK_PRIORITIES = {
    /** Above MPA's Process hook (10) so we own the gag-vs-deafen split while custom garble is on. */
    speechTransformProcessDeafenSplit: 20,
    /** Above WCE antiGarble (11). Always calls `next`; does not replace message generation. */
    chatRoomGeneratePostProcess: 12,
    /** Above MPA (5) / BC+ (3) / MBS (0) so Lilian's algorithm runs first and can skip them. */
    speechTransformGagGarble: 6,
    /** Below BCX ServerSend (1) so the cleartext tag is removed after BCX adds it and before send. */
    serverSendCleartextStrip: -100
  };

  // src/chat-control/hook.ts
  var installed = false;
  var deafenPassthrough = false;
  var gagReplaceCount = 0;
  var protectedOutboundMessage = null;
  function installChatGarbleHook(mod, getSettings) {
    if (installed) return;
    installed = true;
    mod.hookFunction("SpeechTransformProcess", GARBLE_HOOK_PRIORITIES.speechTransformProcessDeafenSplit, (args, next) => {
      if (!getSettings().ChatControlSetting.customGarbleEnabled) return next(args);
      const [character, text, effects, ignoreOOC] = args;
      if (!Array.isArray(effects) || !effects.includes("deafen")) return next(args);
      const withoutDeafen = effects.filter((effect) => effect !== "deafen");
      const output = next([character, text, withoutDeafen, ignoreOOC]);
      if (!output || typeof output.text !== "string") return output;
      const intensity = SpeechTransformDeafenIntensity(character);
      if (intensity > 0) {
        deafenPassthrough = true;
        try {
          output.text = SpeechTransformGagGarble(output.text, intensity, ignoreOOC === true, character);
        } finally {
          deafenPassthrough = false;
        }
        if (!Array.isArray(output.effects)) output.effects = [];
        if (!output.effects.includes("deafen")) output.effects.push("deafen");
      }
      return output;
    });
    mod.hookFunction("SpeechTransformGagGarble", GARBLE_HOOK_PRIORITIES.speechTransformGagGarble, (args, next) => {
      if (!getSettings().ChatControlSetting.customGarbleEnabled || deafenPassthrough) return next(args);
      const text = args[0] == null ? "" : String(args[0]);
      const intensity = typeof args[1] === "number" && Number.isFinite(args[1]) ? args[1] : 0;
      const ignoreOOC = args[2] === true;
      gagReplaceCount += 1;
      return garbleMessage(text, intensity, garbleSoundList(getSettings().ChatControlSetting.garbleSound), ignoreOOC);
    });
    mod.hookFunction(
      "ChatRoomGenerateChatRoomChatMessage",
      GARBLE_HOOK_PRIORITIES.chatRoomGeneratePostProcess,
      (args, next) => {
        const type = args[0];
        if (!getSettings().ChatControlSetting.customGarbleEnabled || type !== "Chat" && type !== "Whisper") {
          protectedOutboundMessage = null;
          return next(args);
        }
        const replacementsBefore = gagReplaceCount;
        protectedOutboundMessage = null;
        const message = next(args);
        const hookRan = gagReplaceCount !== replacementsBefore;
        if (!message || typeof message !== "object") return message;
        const intensity = SpeechTransformGagGarbleIntensity(Player);
        const protect = finalizeCustomGarbleMessage(message, {
          hookRan,
          intensity,
          garble: (content) => garbleMessage(content, intensity, garbleSoundList(getSettings().ChatControlSetting.garbleSound))
        });
        if (protect) protectedOutboundMessage = message;
        return message;
      }
    );
    mod.hookFunction("ServerSend", GARBLE_HOOK_PRIORITIES.serverSendCleartextStrip, (args, next) => {
      const payload = args[1];
      if (protectedOutboundMessage && payload === protectedOutboundMessage) {
        stripGarbleCleartextDictionary(protectedOutboundMessage);
        protectedOutboundMessage = null;
      }
      return next(args);
    });
  }

  // src/orgasm-control/desire.ts
  var DESIRE_DECAY_MS = 1900;
  var DESIRE_DECAY_STEP = 2;
  var DESIRE_RUINED_BONUS = 5;
  var MISTRESS_PROGRESS_MULTIPLIER = 2;
  var TIMER_LIMIT = 25;
  function clamp(n, lo, hi) {
    if (n < lo) return lo;
    if (n > hi) return hi;
    return n;
  }
  function computeTimerBeforeMaxCap(oldTimer, incoming) {
    const old = Number.isFinite(oldTimer) ? oldTimer : 0;
    const next = Number.isFinite(incoming) ? incoming : 0;
    return clamp(Math.round(old / 2 + next), -TIMER_LIMIT, TIMER_LIMIT);
  }
  function arousalTimerIncoming(factor, sensitivityLevel) {
    const base = Number.isFinite(factor) ? factor : 0;
    const bonus = Number.isFinite(sensitivityLevel) && sensitivityLevel > 0 ? sensitivityLevel : 0;
    return base + bonus;
  }
  function scaleProgressFactor(factor, multiplier) {
    const base = Number.isFinite(factor) ? factor : 0;
    if (!Number.isFinite(multiplier) || multiplier === 1) return base;
    return base * multiplier;
  }
  function computeDesireOverflow(progressAfterIncrease, currentDesire) {
    if (!Number.isFinite(progressAfterIncrease) || !Number.isFinite(currentDesire)) return 0;
    const add = progressAfterIncrease - 100 - currentDesire / 2;
    return add > 0 ? add : 0;
  }
  function desireAfterDecay(desire, steps) {
    const current = Number.isFinite(desire) ? desire : 0;
    if (!Number.isFinite(steps) || steps <= 0) return Math.max(0, current);
    return Math.max(0, current - steps * DESIRE_DECAY_STEP);
  }
  function desireReachesForceThreshold(desire, threshold) {
    if (!Number.isFinite(desire) || !Number.isFinite(threshold) || threshold <= 0) return false;
    return desire >= threshold;
  }
  function forceOrgasmGameDifficulty(desire) {
    const value = Number.isFinite(desire) ? desire : 0;
    return Math.max(6, Math.floor(value));
  }
  function asMemberNumber(value) {
    if (typeof value !== "number" || !Number.isInteger(value) || value <= 0 || value > 999999999) {
      return null;
    }
    return value;
  }
  function otherCharacterMemberNumber(memberNumber, isPlayer) {
    if (isPlayer) return null;
    return memberNumber;
  }
  function isMistressMember(memberNumber, ownerMemberNumber, extraMistressMemberNumbers) {
    if (memberNumber == null) return false;
    if (ownerMemberNumber != null && memberNumber === ownerMemberNumber) return true;
    return (extraMistressMemberNumbers != null ? extraMistressMemberNumbers : []).includes(memberNumber);
  }
  function interactionDoublesPlayerProgress(otherSourceMember, otherTargetMember, ownerMemberNumber, extraMistressMemberNumbers) {
    return isMistressMember(otherSourceMember, ownerMemberNumber, extraMistressMemberNumbers) || isMistressMember(otherTargetMember, ownerMemberNumber, extraMistressMemberNumbers);
  }
  function playerReceivesActivityProgress(hook, sourceIsPlayer, targetIsPlayer) {
    if (hook === "ActivityRunSelf") return sourceIsPlayer && !targetIsPlayer;
    return targetIsPlayer;
  }
  function mistressProgressMultiplierFor(input) {
    if (!playerReceivesActivityProgress(input.hook, input.sourceIsPlayer, input.targetIsPlayer)) return 1;
    const doubles = interactionDoublesPlayerProgress(
      otherCharacterMemberNumber(input.sourceMember, input.sourceIsPlayer),
      otherCharacterMemberNumber(input.targetMember, input.targetIsPlayer),
      input.ownerMember,
      input.extraMistressMemberNumbers
    );
    return doubles ? MISTRESS_PROGRESS_MULTIPLIER : 1;
  }

  // src/orgasm-control/ruinedIntercept.ts
  var listeners = [];
  var installed2 = false;
  var lastEvent = null;
  function onRuinedOrgasmPath(cb) {
    listeners.push(cb);
    return () => {
      const i = listeners.indexOf(cb);
      if (i >= 0) listeners.splice(i, 1);
    };
  }
  function notify(ev) {
    lastEvent = ev;
    for (const cb of listeners) {
      try {
        cb(ev);
      } catch (e) {
      }
    }
  }
  function isLikelyRuinedPath(ruinedBefore, progressAfter, stageAfter, timerAfter, now) {
    if (!ruinedBefore) return false;
    const timerActive = timerAfter != null && typeof timerAfter === "number" && timerAfter > now;
    if (stageAfter === 2 && timerActive) return false;
    const progressInRuinRange = progressAfter >= 60 && progressAfter <= 92;
    const timerCleared = timerAfter == null || timerAfter === 0 || !timerActive;
    const stageIdle = stageAfter == null || stageAfter === 0;
    return timerCleared && stageIdle && progressInRuinRange;
  }
  function registerRuinedOrgasmIntercept(mod, priority = 115) {
    if (installed2) return;
    installed2 = true;
    mod.hookFunction("ActivityOrgasmStart", priority, (args, next) => {
      const C = args[0];
      const now = CurrentTime;
      if (!C.IsPlayer()) {
        return next(args);
      }
      const ruinedBefore = ActivityOrgasmRuined === true;
      next(args);
      const arousal = C.ArousalSettings;
      const progressAfter = typeof arousal.Progress === "number" ? arousal.Progress : 0;
      const stageAfter = arousal.OrgasmStage;
      const timerAfter = arousal.OrgasmTimer;
      if (isLikelyRuinedPath(ruinedBefore, progressAfter, stageAfter, timerAfter, now)) {
        notify({
          at: now,
          character: C,
          ruinedBefore,
          progressAfter,
          orgasmStageAfter: stageAfter,
          orgasmTimerAfter: timerAfter
        });
      }
    });
  }

  // src/orgasm-control/debugApi.ts
  function clampDebugDesire(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
    return value < 0 ? 0 : value;
  }
  function clampDebugArousal(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
    if (value < 0) return 0;
    if (value > 100) return 100;
    return value;
  }
  function commitDebugDesire(state, value, now) {
    const next = clampDebugDesire(value);
    if (next == null) return state;
    state.desire = next;
    if (Number.isFinite(now)) state.lastDecayAt = now;
    return state;
  }
  function commitDebugArousal(target, value) {
    var _a;
    const next = clampDebugArousal(value);
    if (next == null) {
      const current = (_a = target.ArousalSettings) == null ? void 0 : _a.Progress;
      return typeof current === "number" && Number.isFinite(current) ? current : null;
    }
    const settings = target.ArousalSettings;
    if (settings == null) return next;
    settings.Progress = next;
    settings.ProgressTimer = 0;
    return settings.Progress;
  }
  function readDebugArousal(target) {
    var _a;
    const progress = (_a = target.ArousalSettings) == null ? void 0 : _a.Progress;
    return typeof progress === "number" && Number.isFinite(progress) ? progress : 0;
  }
  function createLilianDebugApi(io) {
    const api = {
      enabled: true,
      setDesire(value) {
        if (!api.enabled) return io.readDesire();
        return io.writeDesire(value, io.now());
      },
      getDesire() {
        return io.readDesire();
      },
      setArousal(value) {
        if (!api.enabled) return io.readArousal();
        return io.writeArousal(value);
      },
      getArousal() {
        return io.readArousal();
      }
    };
    return api;
  }

  // src/orgasm-control/hook.ts
  var installed3 = false;
  var debugApi = null;
  var lilianArousalBoostDepth = 0;
  var desireValue = 0;
  var lastDesireDecayAt = null;
  var mistressProgressMultiplier = 1;
  var allowRuinedBypassOnNextStart = false;
  var pendingOrgasmGameDifficultyOverride = null;
  function getNow() {
    return CurrentTime;
  }
  function applyDesireDecay() {
    const now = getNow();
    if (lastDesireDecayAt == null) {
      lastDesireDecayAt = now;
      return;
    }
    const elapsed = now - lastDesireDecayAt;
    const steps = Math.floor(elapsed / DESIRE_DECAY_MS);
    if (steps <= 0) return;
    desireValue = desireAfterDecay(desireValue, steps);
    lastDesireDecayAt += steps * DESIRE_DECAY_MS;
  }
  function forcePreparePlayerOrgasm(C) {
    const arousal = C.ArousalSettings;
    const now = getNow();
    const activeTimer = typeof arousal.OrgasmTimer === "number" && arousal.OrgasmTimer > now;
    if (activeTimer) {
      return;
    }
    ActivityOrgasmRuined = false;
    const timer = now + 5e3;
    arousal.OrgasmTimer = timer;
    arousal.OrgasmStage = 0;
    ActivityOrgasmGameTimer = timer - now;
    if (CurrentCharacter && CurrentCharacter.ID === C.ID) {
      DialogLeave();
    }
    ActivityChatRoomArousalSync(C);
  }
  function applySensitivityCapToActivitySetArousalTimerArgs(args, sensitivityLevel) {
    const capBonus = sensitivityLevel * 10;
    const Activity = args[1];
    const Zone = args[2];
    if (Activity == null) {
      const syn = {
        Name: "",
        MaxProgress: Math.min(100, 100 + capBonus)
      };
      if (Zone === "ActivityOnOther") {
        syn.MaxProgressSelf = Math.min(100, 67 + capBonus);
      }
      args[1] = syn;
      return;
    }
    const baseMp = Activity.MaxProgress == null || Activity.MaxProgress > 100 ? 100 : Activity.MaxProgress;
    const clone = { ...Activity };
    clone.MaxProgress = Math.min(100, baseMp + capBonus);
    if (Zone === "ActivityOnOther") {
      const baseSelf = Activity.MaxProgressSelf != null ? Activity.MaxProgressSelf : 67;
      clone.MaxProgressSelf = Math.min(100, baseSelf + capBonus);
    }
    args[1] = clone;
  }
  function characterIsPlayer(c) {
    return typeof (c == null ? void 0 : c.IsPlayer) === "function" && c.IsPlayer();
  }
  function withMistressProgress(getSettings, hook, source, target, run) {
    var _a;
    const multiplier = mistressProgressMultiplierFor({
      hook,
      sourceIsPlayer: characterIsPlayer(source),
      targetIsPlayer: characterIsPlayer(target),
      sourceMember: asMemberNumber(source == null ? void 0 : source.MemberNumber),
      targetMember: asMemberNumber(target == null ? void 0 : target.MemberNumber),
      ownerMember: asMemberNumber((_a = Player.Ownership) == null ? void 0 : _a.MemberNumber),
      extraMistressMemberNumbers: getSettings().OrgasmControlSetting.mistressMemberNumbers
    });
    if (multiplier === 1) return run();
    const previous = mistressProgressMultiplier;
    mistressProgressMultiplier *= multiplier;
    try {
      return run();
    } finally {
      mistressProgressMultiplier = previous;
    }
  }
  function debugNow() {
    return typeof CurrentTime === "number" && Number.isFinite(CurrentTime) ? CurrentTime : Number.NaN;
  }
  function readPlayerArousal() {
    return readDebugArousal(Player);
  }
  function writePlayerArousal(value) {
    const applied = commitDebugArousal(Player, value);
    const stored = Player.ArousalSettings != null && applied != null && applied === Player.ArousalSettings.Progress;
    if (stored && typeof ActivityChatRoomArousalSync === "function") {
      ActivityChatRoomArousalSync(Player);
    }
    return applied != null ? applied : readPlayerArousal();
  }
  function writeHiddenDesire(value, now) {
    const state = { desire: desireValue, lastDecayAt: lastDesireDecayAt };
    commitDebugDesire(state, value, now);
    desireValue = state.desire;
    lastDesireDecayAt = state.lastDecayAt;
    return desireValue;
  }
  function getLilianDebugApi() {
    return debugApi;
  }
  function installOrgasmControlHooks(mod, getSettings) {
    if (installed3) return;
    installed3 = true;
    debugApi = createLilianDebugApi({
      readDesire: () => desireValue,
      writeDesire: writeHiddenDesire,
      readArousal: readPlayerArousal,
      writeArousal: writePlayerArousal,
      now: debugNow
    });
    onRuinedOrgasmPath(() => {
      if (!getSettings().OrgasmControlSetting.forceOrgasmEnabled) return;
      applyDesireDecay();
      desireValue += DESIRE_RUINED_BONUS;
    });
    registerRuinedOrgasmIntercept(mod, 115);
    mod.hookFunction("ActivityEffect", 50, (args, next) => {
      return withMistressProgress(getSettings, "ActivityEffect", args[0], args[1], () => next(args));
    });
    mod.hookFunction("ActivityEffectFlat", 50, (args, next) => {
      return withMistressProgress(getSettings, "ActivityEffectFlat", args[0], args[1], () => next(args));
    });
    mod.hookFunction("ActivityRunSelf", 50, (args, next) => {
      return withMistressProgress(getSettings, "ActivityRunSelf", args[0], args[1], () => next(args));
    });
    mod.hookFunction("ActivitySetArousalTimer", 50, (args, next) => {
      const C = args[0];
      if (!C.IsPlayer()) {
        return next(args);
      }
      if (mistressProgressMultiplier !== 1) {
        args[3] = scaleProgressFactor(args[3], mistressProgressMultiplier);
      }
      const org = getSettings().OrgasmControlSetting;
      if (!org.forceOrgasmEnabled) {
        desireValue = 0;
        allowRuinedBypassOnNextStart = false;
        pendingOrgasmGameDifficultyOverride = null;
      }
      if (org.sensitivityLevel <= 0 && !org.forceOrgasmEnabled) {
        return next(args);
      }
      let depthInc = false;
      if (org.sensitivityLevel > 0) {
        applySensitivityCapToActivitySetArousalTimerArgs(args, org.sensitivityLevel);
        lilianArousalBoostDepth++;
        depthInc = true;
      }
      try {
        if (org.forceOrgasmEnabled) {
          applyDesireDecay();
          const arousal = C.ArousalSettings;
          let oldTimer = arousal.ProgressTimer;
          if (oldTimer == null || typeof oldTimer !== "number" || Number.isNaN(oldTimer)) {
            oldTimer = 0;
          }
          let progressNow = arousal.Progress;
          if (typeof progressNow !== "number" || !Number.isFinite(progressNow)) {
            progressNow = 0;
          }
          const incoming = arousalTimerIncoming(args[3], org.sensitivityLevel);
          const progressAfterIncrease = progressNow + computeTimerBeforeMaxCap(oldTimer, incoming);
          desireValue += computeDesireOverflow(progressAfterIncrease, desireValue);
        }
        if (org.sensitivityLevel > 0) {
          const base = Number.isFinite(args[3]) ? args[3] : 0;
          args[3] = base + org.sensitivityLevel;
        }
        return next(args);
      } finally {
        if (depthInc) {
          lilianArousalBoostDepth--;
        }
      }
    });
    mod.hookFunction("PreferenceGetZoneOrgasm", 50, (args, next) => {
      const v = next(args);
      if (lilianArousalBoostDepth > 0 && args[0].IsPlayer()) {
        return true;
      }
      return v;
    });
    mod.hookFunction("ActivityOrgasmPrepare", 100, (args, next) => {
      const C = args[0];
      if (!C.IsPlayer()) {
        return next(args);
      }
      const org = getSettings().OrgasmControlSetting;
      if (!org.forceOrgasmEnabled) {
        allowRuinedBypassOnNextStart = false;
        return next(args);
      }
      pendingOrgasmGameDifficultyOverride = forceOrgasmGameDifficulty(desireValue);
      applyDesireDecay();
      const threshold = org.forceOrgasmDesireThreshold;
      if (!desireReachesForceThreshold(desireValue, threshold)) {
        allowRuinedBypassOnNextStart = false;
        return next(args);
      }
      allowRuinedBypassOnNextStart = true;
      forcePreparePlayerOrgasm(C);
    });
    mod.hookFunction("ActivityOrgasmStart", 100, (args, next) => {
      const C = args[0];
      if (C.IsPlayer() && getSettings().OrgasmControlSetting.forceOrgasmEnabled && allowRuinedBypassOnNextStart) {
        ActivityOrgasmRuined = false;
        allowRuinedBypassOnNextStart = false;
      }
      return next(args);
    });
    mod.hookFunction("ActivityOrgasmGameGenerate", 100, (args, next) => {
      const ret = next(args);
      if (!getSettings().OrgasmControlSetting.forceOrgasmEnabled) {
        pendingOrgasmGameDifficultyOverride = null;
        return ret;
      }
      if (args[0] === 0 && pendingOrgasmGameDifficultyOverride != null) {
        ActivityOrgasmGameDifficulty = pendingOrgasmGameDifficultyOverride;
        const g = globalThis;
        const textGet = g.TextGet;
        if (typeof textGet === "function") {
          const progress = typeof g.ActivityOrgasmGameProgress === "number" ? g.ActivityOrgasmGameProgress : 0;
          const remain = Math.max(0, Math.ceil(ActivityOrgasmGameDifficulty - progress));
          g.ActivityOrgasmResistLabel = `${textGet("OrgasmResist")} (${remain.toString()})`;
        }
        pendingOrgasmGameDifficultyOverride = null;
      }
      return ret;
    });
    mod.hookFunction("ActivityOrgasmStop", 100, (args, next) => {
      const C = args[0];
      const stopProgress = args[1];
      const ret = next(args);
      if (C.IsPlayer() && getSettings().OrgasmControlSetting.forceOrgasmEnabled && typeof stopProgress === "number" && stopProgress <= 20) {
        desireValue = 0;
        allowRuinedBypassOnNextStart = false;
        pendingOrgasmGameDifficultyOverride = null;
      }
      return ret;
    });
  }

  // src/reverse-insert/catalog.ts
  var REVERSE_HOLES = ["ItemVulva", "ItemButt", "ItemMouth"];
  var REVERSE_SPEEDS = ["Slow", "Fast"];
  var REVERSE_INSERT_ACTIVITY_ID_BASE = 240;
  var ACTIVITY_DICTIONARY_FILE = "ActivityDictionary.csv";
  var REVERSE_INSERT_CHAT = {
    Slow: {
      ItemVulva: [
        "SourceCharacter\u4E3B\u52A8\u7528\u9634\u9053\u6162\u6162\u542B\u5165TargetCharacter\u7684ActivityAsset\u3002",
        "SourceCharacter\u628ATargetCharacter\u7684ActivityAsset\u7F13\u7F13\u7EB3\u5165\u9634\u9053\u3002",
        "SourceCharacter\u4E3B\u52A8\u6C89\u8170\uFF0C\u7528\u9634\u9053\u4E00\u70B9\u70B9\u541E\u4E0BTargetCharacter\u7684ActivityAsset\u3002",
        "SourceCharacter\u4E3B\u52A8\u7528\u9634\u961C\u8D34\u4E0ATargetCharacter\u7684ActivityAsset\uFF0C\u6162\u6162\u542B\u8FDB\u53BB\u3002"
      ],
      ItemButt: [
        "SourceCharacter\u4E3B\u52A8\u7528\u540E\u7A74\u6162\u6162\u542B\u5165TargetCharacter\u7684ActivityAsset\u3002",
        "SourceCharacter\u628ATargetCharacter\u7684ActivityAsset\u7F13\u7F13\u7EB3\u5165\u540E\u7A74\u3002",
        "SourceCharacter\u4E3B\u52A8\u7FD8\u8D77\u81C0\uFF0C\u4E00\u70B9\u70B9\u628ATargetCharacter\u7684ActivityAsset\u541E\u8FDB\u540E\u7A74\u3002",
        "SourceCharacter\u4E3B\u52A8\u7528\u540E\u7A74\u53E3\u8D34\u4F4FTargetCharacter\u7684ActivityAsset\uFF0C\u6162\u6162\u5403\u8FDB\u53BB\u3002"
      ],
      ItemMouth: [
        "SourceCharacter\u4E3B\u52A8\u7528\u5634\u6162\u6162\u542B\u5165TargetCharacter\u7684ActivityAsset\u3002",
        "SourceCharacter\u628ATargetCharacter\u7684ActivityAsset\u7F13\u7F13\u542B\u8FDB\u5634\u91CC\u3002",
        "SourceCharacter\u4E3B\u52A8\u4FEF\u8EAB\uFF0C\u4E00\u70B9\u70B9\u628ATargetCharacter\u7684ActivityAsset\u541E\u8FDB\u5634\u91CC\u3002",
        "SourceCharacter\u4E3B\u52A8\u7528\u5507\u820C\u8D34\u4E0ATargetCharacter\u7684ActivityAsset\uFF0C\u6162\u6162\u542B\u4F4F\u3002"
      ]
    },
    Fast: {
      ItemVulva: [
        "SourceCharacter\u4E3B\u52A8\u7528\u9634\u9053\u7528\u529B\u542B\u5165TargetCharacter\u7684ActivityAsset\u3002",
        "SourceCharacter\u731B\u5730\u628ATargetCharacter\u7684ActivityAsset\u541E\u8FDB\u9634\u9053\u3002",
        "SourceCharacter\u4E3B\u52A8\u62AC\u81C0\u8FCE\u4E0A\uFF0C\u4E00\u53E3\u6C14\u628ATargetCharacter\u7684ActivityAsset\u5403\u8FDB\u9634\u9053\u3002",
        "SourceCharacter\u8FEB\u4E0D\u53CA\u5F85\u5730\u7528\u9634\u9053\u5957\u4F4FTargetCharacter\u7684ActivityAsset\uFF0C\u5FEB\u901F\u541E\u5410\u3002"
      ],
      ItemButt: [
        "SourceCharacter\u4E3B\u52A8\u7528\u540E\u7A74\u7528\u529B\u542B\u5165TargetCharacter\u7684ActivityAsset\u3002",
        "SourceCharacter\u731B\u5730\u628ATargetCharacter\u7684ActivityAsset\u541E\u8FDB\u540E\u7A74\u3002",
        "SourceCharacter\u4E3B\u52A8\u5411\u540E\u5750\uFF0C\u4E00\u53E3\u6C14\u628ATargetCharacter\u7684ActivityAsset\u5403\u8FDB\u540E\u7A74\u3002",
        "SourceCharacter\u8FEB\u4E0D\u53CA\u5F85\u5730\u7528\u540E\u7A74\u5957\u4F4FTargetCharacter\u7684ActivityAsset\uFF0C\u5FEB\u901F\u541E\u5410\u3002"
      ],
      ItemMouth: [
        "SourceCharacter\u4E3B\u52A8\u7528\u5634\u7528\u529B\u542B\u5165TargetCharacter\u7684ActivityAsset\u3002",
        "SourceCharacter\u731B\u5730\u628ATargetCharacter\u7684ActivityAsset\u541E\u8FDB\u5634\u91CC\u3002",
        "SourceCharacter\u4E3B\u52A8\u5F20\u53E3\u8FCE\u4E0A\uFF0C\u4E00\u53E3\u6C14\u628ATargetCharacter\u7684ActivityAsset\u542B\u5230\u5E95\u3002",
        "SourceCharacter\u8FEB\u4E0D\u53CA\u5F85\u5730\u7528\u5634\u5957\u4F4FTargetCharacter\u7684ActivityAsset\uFF0C\u5FEB\u901F\u541E\u5410\u3002"
      ]
    }
  };
  function vanillaPenetrateName(speed) {
    return speed === "Fast" ? "PenetrateFast" : "PenetrateSlow";
  }
  function reverseInsertActivityName(speed) {
    return speed === "Fast" ? "LilianReverseInsertFast" : "LilianReverseInsertSlow";
  }
  function chatFor(speed) {
    return REVERSE_INSERT_CHAT[speed];
  }
  function buildSpecs() {
    return REVERSE_SPEEDS.map((speed, offset) => ({
      name: reverseInsertActivityName(speed),
      speed,
      vanillaName: vanillaPenetrateName(speed),
      registeredMaxProgress: 0,
      activityId: REVERSE_INSERT_ACTIVITY_ID_BASE + offset,
      label: speed === "Fast" ? "\u4E3B\u52A8\u63D2\u5165\xB7\u5FEB" : "\u4E3B\u52A8\u63D2\u5165\xB7\u6162",
      chat: chatFor(speed)
    }));
  }
  var REVERSE_INSERT_SPECS = buildSpecs();
  var SPEC_BY_NAME = new Map(REVERSE_INSERT_SPECS.map((spec) => [spec.name, spec]));
  function reverseInsertSpecByName(name) {
    return SPEC_BY_NAME.get(name);
  }
  function isReverseInsertName(name) {
    return SPEC_BY_NAME.has(name);
  }
  var EQUIPPER_AROUSAL_ZONE = "ActivityOnOther";
  function equipperArousalPlan(input) {
    if (!input.localPlayerIsTarget || input.localPlayerIsSender) return null;
    const spec = reverseInsertSpecByName(input.activityName);
    if (!spec) return null;
    return {
      vanillaName: spec.vanillaName,
      zone: EQUIPPER_AROUSAL_ZONE,
      source: "equipper",
      target: "initiator",
      forwardAsset: true
    };
  }
  function describeVanillaPenetrateCheck(hole, speed) {
    return {
      activityName: vanillaPenetrateName(speed),
      acting: "wearer",
      acted: "initiator",
      group: hole,
      permissions: [
        { who: "wearer", other: true },
        { who: "initiator", other: false }
      ],
      useTargetItems: false,
      needsItem: "PenetrateItem"
    };
  }
  function reverseInsertChatPool(hole, speed) {
    return REVERSE_INSERT_CHAT[speed][hole];
  }
  function pickReverseInsertChat(hole, speed, random = Math.random()) {
    const pool = reverseInsertChatPool(hole, speed);
    const unit = Number.isFinite(random) ? Math.min(0.999999, Math.max(0, random)) : 0;
    const index = Math.floor(unit * pool.length);
    return { index, text: pool[index] };
  }
  function reverseInsertChatContentKey(activityName, hole, variant) {
    return `ChatSelf-${hole}-${activityName}-${variant}`;
  }
  function chatVariantIndex(key) {
    const match = /-([0-3])$/.exec(key);
    if (!match) return 0;
    return Number(match[1]);
  }
  function missingActivityTextTag(contentKey) {
    return `MISSING TEXT IN "${ACTIVITY_DICTIONARY_FILE}": ${contentKey}`;
  }
  function reverseInsertDictionaryText(key) {
    var _a, _b;
    const spec = REVERSE_INSERT_SPECS.find((entry) => key.includes(entry.name));
    if (!spec) return null;
    if (key.startsWith("Chat")) {
      const hole = (_a = REVERSE_HOLES.find((entry) => key.includes(entry))) != null ? _a : "ItemVulva";
      const pool = spec.chat[hole];
      return (_b = pool[chatVariantIndex(key)]) != null ? _b : pool[0];
    }
    return spec.label;
  }
  function penetrableHole(focusGroup, focusActivityGroup) {
    for (const name of [focusActivityGroup, focusGroup]) {
      if (name === "ItemVulva" || name === "ItemButt" || name === "ItemMouth") return name;
    }
    return null;
  }
  function reverseInsertSheetAllowsOffer(input) {
    return input.openedSheetIsPlayer === false && input.zoneOwnerIsPlayer;
  }
  function queryReverseInsertOffers(args) {
    if (!reverseInsertSheetAllowsOffer({
      openedSheetIsPlayer: args.openedSheetIsPlayer,
      zoneOwnerIsPlayer: args.zoneOwnerIsPlayer
    })) {
      return [];
    }
    if (!args.zonePossible || args.wearerOutOfRange || args.focusHole == null) return [];
    const legalSpeeds = REVERSE_SPEEDS.filter((speed) => args.holeLegal(speed));
    if (legalSpeeds.length === 0) return [];
    const hole = args.focusHole;
    const found = args.items();
    const offers = [];
    for (const speed of legalSpeeds) {
      const spec = reverseInsertSpecByName(reverseInsertActivityName(speed));
      if (!spec) continue;
      for (const item of found) {
        offers.push({ name: spec.name, speed, hole, item });
      }
    }
    return offers;
  }

  // src/reverse-insert/hook.ts
  var installed4 = false;
  var registered = /* @__PURE__ */ new Map();
  function familyOf(character) {
    return character.AssetFamily || "Female3DCG";
  }
  function forgetStaleActivities() {
    const keep = new Set(REVERSE_INSERT_SPECS.map((spec) => spec.name));
    for (let i = ActivityFemale3DCG.length - 1; i >= 0; i -= 1) {
      const name = ActivityFemale3DCG[i].Name;
      if (name.startsWith("LilianReverseInsert") && !keep.has(name)) {
        ActivityFemale3DCG.splice(i, 1);
      }
    }
    if (typeof ActivityFemale3DCGOrdering === "undefined") return;
    for (let i = ActivityFemale3DCGOrdering.length - 1; i >= 0; i -= 1) {
      const name = ActivityFemale3DCGOrdering[i];
      if (name.startsWith("LilianReverseInsert") && !keep.has(name)) {
        ActivityFemale3DCGOrdering.splice(i, 1);
      }
    }
  }
  function registerActivities() {
    forgetStaleActivities();
    const usedIds = new Set(ActivityFemale3DCG.map((activity) => activity.ActivityID).filter((id) => typeof id === "number"));
    for (const spec of REVERSE_INSERT_SPECS) {
      if (registered.has(spec.name)) continue;
      const existing = ActivityFemale3DCG.find((activity2) => activity2.Name === spec.name);
      if (existing) {
        registered.set(spec.name, existing);
        continue;
      }
      let activityId = spec.activityId;
      while (usedIds.has(activityId)) activityId += 1;
      usedIds.add(activityId);
      const activity = {
        Name: spec.name,
        ActivityID: activityId,
        MaxProgress: spec.registeredMaxProgress,
        Prerequisite: [],
        Target: [],
        TargetSelf: []
      };
      ActivityFemale3DCG.push(activity);
      if (typeof ActivityFemale3DCGOrdering !== "undefined" && !ActivityFemale3DCGOrdering.includes(spec.name)) {
        ActivityFemale3DCGOrdering.push(spec.name);
      }
      registered.set(spec.name, activity);
    }
  }
  function activityNameOf(activity) {
    var _a, _b, _c;
    if (typeof activity === "string") return activity;
    if (activity && typeof activity === "object") {
      const record = activity;
      return (_c = (_b = (_a = record.Activity) == null ? void 0 : _a.Name) != null ? _b : record.Name) != null ? _c : "";
    }
    return "";
  }
  function characterFor(planWho, wearer, initiator) {
    return planWho === "wearer" ? wearer : initiator;
  }
  function openedWearer() {
    if (typeof CurrentCharacter === "undefined" || CurrentCharacter == null || CurrentCharacter.IsPlayer()) return null;
    return CurrentCharacter;
  }
  function vanillaHoleLegal(wearer, initiator, hole, speed) {
    const plan = describeVanillaPenetrateCheck(hole, speed);
    const family = familyOf(wearer);
    const vanilla = AssetGetActivity(family, plan.activityName);
    const group = ActivityGetGroupOrMirror(family, plan.group);
    const ours = registered.get(reverseInsertActivityName(speed));
    if (!vanilla || !group || !ours) return false;
    const acting = characterFor(plan.acting, wearer, initiator);
    const acted = characterFor(plan.acted, wearer, initiator);
    if (!ActivityCheckPrerequisites(vanilla, acting, acted, group)) return false;
    for (const permission of plan.permissions) {
      const who = characterFor(permission.who, wearer, initiator);
      if (!ActivityCheckPermissions(vanilla, who, permission.other)) return false;
    }
    if (!ActivityCheckPermissions(ours, initiator, true)) return false;
    if (!ActivityCheckPermissions(ours, wearer, false)) return false;
    return true;
  }
  function generatedItems(wearer, initiator, hole) {
    const plan = describeVanillaPenetrateCheck(hole, "Slow");
    const family = familyOf(wearer);
    const vanilla = AssetGetActivity(family, plan.activityName);
    const group = ActivityGetGroupOrMirror(family, plan.group);
    if (!vanilla || !group) return [];
    const acting = characterFor(plan.acting, wearer, initiator);
    const acted = characterFor(plan.acted, wearer, initiator);
    return ActivityGenerateItemActivitiesFromNeed(
      acting,
      acted,
      plan.needsItem,
      vanilla,
      group,
      plan.useTargetItems
    );
  }
  function offersFor(initiator, wearer, focusGroup) {
    var _a, _b;
    const family = familyOf(initiator);
    const focusActivityGroup = (_b = (_a = ActivityGetGroupOrMirror(family, focusGroup)) == null ? void 0 : _a.Name) != null ? _b : focusGroup;
    const hole = penetrableHole(focusGroup, focusActivityGroup);
    let itemCache = null;
    return queryReverseInsertOffers({
      openedSheetIsPlayer: wearer.IsPlayer() ? true : false,
      zoneOwnerIsPlayer: initiator.IsPlayer(),
      zonePossible: ActivityPossibleOnGroup(initiator, focusGroup),
      wearerOutOfRange: InventoryIsBlockedByDistance(wearer),
      focusHole: hole,
      holeLegal: (speed) => hole ? vanillaHoleLegal(wearer, initiator, hole, speed) : false,
      items: () => {
        if (!hole) return [];
        if (!itemCache) itemCache = generatedItems(wearer, initiator, hole);
        return itemCache;
      }
    });
  }
  function renderChat(specName, hole, variant, template, initiator, wearer, item) {
    var _a, _b, _c, _d;
    const spec = reverseInsertSpecByName(specName);
    if (!spec) return "";
    const contentKey = reverseInsertChatContentKey(spec.name, hole, variant);
    const line = (_a = reverseInsertDictionaryText(contentKey)) != null ? _a : template;
    const dictionary = new DictionaryBuilder().sourceCharacter(initiator).targetCharacter(wearer).focusGroup(hole);
    if (item) {
      dictionary.asset(item.Asset, "ActivityAsset", (_c = (_b = item.Craft) == null ? void 0 : _b.Name) != null ? _c : "");
    }
    const built = dictionary.build();
    built.push({ ActivityName: spec.name });
    const extracted = ChatRoomMessageRunExtractors(
      { Content: contentKey, Type: "Activity", Dictionary: built, Sender: initiator.MemberNumber },
      initiator
    );
    return CommonStringSubstitute(line, (_d = extracted.substitutions) != null ? _d : []);
  }
  function sendReverseInsertMessage(initiator, wearer, itemActivity, specName, hole) {
    var _a, _b;
    const spec = reverseInsertSpecByName(specName);
    if (!spec) return;
    const picked = pickReverseInsertChat(hole, spec.speed);
    const contentKey = reverseInsertChatContentKey(spec.name, hole, picked.index);
    const dictionary = new DictionaryBuilder().sourceCharacter(initiator).targetCharacter(wearer).focusGroup(hole);
    if (itemActivity.Item) {
      dictionary.asset(itemActivity.Item.Asset, "ActivityAsset", (_b = (_a = itemActivity.Item.Craft) == null ? void 0 : _a.Name) != null ? _b : "");
    }
    const built = dictionary.build();
    built.push({ ActivityName: spec.name });
    built.push({
      Tag: missingActivityTextTag(contentKey),
      Text: renderChat(spec.name, hole, picked.index, picked.text, initiator, wearer, itemActivity.Item)
    });
    ServerSend("ChatRoomChat", { Content: contentKey, Type: "Activity", Dictionary: built });
  }
  function installReverseInsert(mod) {
    if (installed4) return;
    if (typeof ActivityFemale3DCG === "undefined" || typeof ActivityAllowedForGroup !== "function" || typeof ActivityRun !== "function") {
      console.warn("LilianMod: \u6D3B\u52A8\u63A5\u53E3\u4E0D\u5B58\u5728\uFF0C\u8DF3\u8FC7\u4E3B\u52A8\u63D2\u5165");
      return;
    }
    installed4 = true;
    registerActivities();
    mod.hookFunction("ActivityDictionaryText", 5, (args, next) => {
      const text = reverseInsertDictionaryText(String(args[0]));
      if (text != null) return text;
      return next(args);
    });
    mod.hookFunction("ActivityAllowedForGroup", 20, (args, next) => {
      var _a, _b;
      const allowed = next(args);
      const zoneOwner = args[0];
      const focusGroup = args[1];
      const wearer = openedWearer();
      if (!zoneOwner || !wearer || !zoneOwner.IsPlayer()) return allowed;
      const focusActivityGroup = (_b = (_a = ActivityGetGroupOrMirror(familyOf(zoneOwner), focusGroup)) == null ? void 0 : _a.Name) != null ? _b : focusGroup;
      const extras = [];
      for (const offer of offersFor(zoneOwner, wearer, focusGroup)) {
        const activity = registered.get(offer.name);
        if (!activity || !offer.item.Item) continue;
        const entry = {
          Activity: activity,
          Item: offer.item.Item,
          Group: focusActivityGroup
        };
        if (offer.item.Blocked) entry.Blocked = offer.item.Blocked;
        extras.push(entry);
      }
      if (extras.length === 0) return allowed;
      const merged = [...allowed, ...extras];
      if (typeof ActivityFemale3DCGOrdering !== "undefined") {
        merged.sort((a, b) => Math.sign(ActivityFemale3DCGOrdering.indexOf(a.Activity.Name) - ActivityFemale3DCGOrdering.indexOf(b.Activity.Name)));
      }
      return merged;
    });
    mod.hookFunction("ActivityRun", 40, (args, next) => {
      const itemActivity = args[3];
      const name = activityNameOf(itemActivity == null ? void 0 : itemActivity.Activity);
      if (!isReverseInsertName(name)) return next(args);
      const initiator = args[0];
      const zoneOwner = args[1];
      const focusGroup = args[2];
      const wearer = openedWearer();
      const sendMessage = args.length < 5 || args[4] !== false;
      if (!initiator || !zoneOwner || !focusGroup || !wearer || !zoneOwner.IsPlayer() || !(itemActivity == null ? void 0 : itemActivity.Item)) return;
      const offer = offersFor(zoneOwner, wearer, focusGroup.Name).find((candidate) => {
        var _a, _b, _c, _d;
        return candidate.name === name && ((_a = candidate.item.Item) == null ? void 0 : _a.Asset.Name) === ((_b = itemActivity.Item) == null ? void 0 : _b.Asset.Name) && ((_c = candidate.item.Item) == null ? void 0 : _c.Asset.Group.Name) === ((_d = itemActivity.Item) == null ? void 0 : _d.Asset.Group.Name) && candidate.item.Blocked !== "blocked";
      });
      if (!offer) return;
      const spec = reverseInsertSpecByName(offer.name);
      const family = familyOf(wearer);
      const vanilla = spec ? AssetGetActivity(family, spec.vanillaName) : null;
      const holeGroup = ActivityGetGroupOrMirror(family, offer.hole);
      if (!spec || !vanilla || !holeGroup) return;
      const vanillaRun = {
        Activity: vanilla,
        Item: itemActivity.Item,
        Group: offer.hole
      };
      if (itemActivity.Blocked) vanillaRun.Blocked = itemActivity.Blocked;
      next([wearer, initiator, holeGroup, vanillaRun, false]);
      if (sendMessage) {
        try {
          sendReverseInsertMessage(initiator, wearer, vanillaRun, spec.name, offer.hole);
        } catch (error) {
          console.warn("LilianMod: \u4E3B\u52A8\u63D2\u5165\u6D88\u606F\u53D1\u9001\u5931\u8D25", error);
        }
      }
    });
    mod.hookFunction("ActivityEffect", 30, (args, next) => {
      var _a;
      const name = activityNameOf(args[2]);
      if (!isReverseInsertName(name)) return next(args);
      const initiator = args[0];
      const wearer = args[1];
      const plan = equipperArousalPlan({
        activityName: name,
        localPlayerIsTarget: (wearer == null ? void 0 : wearer.IsPlayer()) === true,
        localPlayerIsSender: (initiator == null ? void 0 : initiator.IsPlayer()) === true
      });
      if (!plan || !wearer || !initiator) return;
      const vanilla = AssetGetActivity(familyOf(wearer), plan.vanillaName);
      if (!vanilla) return;
      const zoneName = typeof args[3] === "string" ? args[3] : "";
      const holeGroup = zoneName ? ActivityGetGroupOrMirror(familyOf(wearer), zoneName) : null;
      ActivityRunSelf(wearer, initiator, vanilla, holeGroup, (_a = args[5]) != null ? _a : null);
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
      version: SETTINGS_VERSION.replace(/^v/i, ""),
      repository: "https://github.com/Flameustc/LilianMod"
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
  function waitForBootstrap() {
    if (canBootstrap()) {
      bootstrap();
      return;
    }
    setTimeout(waitForBootstrap, 500);
  }
  waitForBootstrap();
})();
