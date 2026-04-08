import { LilianSettings, PLUGIN_KEY, getDefaultSettings } from "./settings";
import { loadSettings, saveSettings } from "./storage";
import {
  PREFERENCE_EXT_EXIT,
  PREFERENCE_EXT_HELP,
  PREFERENCE_EXT_MAIN_MENU,
  PREFERENCE_EXT_SUBSCREEN,
  PREFERENCE_EXT_TOOLTIP_BAR,
  preferenceExtMainMenuSlot,
  preferenceExtSubscreenRowY,
} from "./ui/preferenceExtensionLayout";

type ExtensionView = "MainMenu" | "ChatControl" | "OrgasmControl";

const MAIN_ICON = "Icons/Preference.png";
const PREF_INPUT_GARBLE = `${PLUGIN_KEY}-pref-garble-sound`;
const PREF_INPUT_SENSITIVITY = `${PLUGIN_KEY}-pref-sensitivity-level`;
const GARBLE_SOUND_MAX_LEN = 24;

/** 悬停配置项名称时于底部条展示（行为对齐 LSCG `Tooltip` + `drawTooltip`） */
const TT_CUSTOM_GARBLE =
  "开启后，使用下方自定义拟声字参与堵嘴含糊；关闭则走游戏原版逻辑。";
const TT_GARBLE_SOUND =
  "含糊时插入的拟声字，在框内直接输入（建议短字或词）。若清空后失焦/更改，将恢复为默认「呜」。最多 24 字符。";
const TT_SENSITIVITY_LEVEL =
  "敏感度等级（Sensitivity level）0–10。数值 ×10 会并入各类行为导致的 arousal 封顶（最大 100）；封顶至 100 时可触发高潮。";
const TT_FORCE_ORGASM =
  "开启后，玩家高潮准备阶段会无视 Denial/Edged 及 BCX 的高潮阻断规则，强制进入高潮流程。";

function drawPreferenceTooltipBar(text: string): void {
  const { X: x, Y: y, W: w, H: h } = PREFERENCE_EXT_TOOLTIP_BAR;
  const canvas = MainCanvas;
  const bak = canvas.textAlign;
  canvas.textAlign = "left";
  DrawRect(x, y, w, h, "#FFFF88");
  DrawEmptyRect(x, y, w, h, "black", 2);
  DrawTextFit(text, x + 3, y + 33, w - 6, "black");
  canvas.textAlign = bak;
}

function drawExtensionExitAndHelp(): void {
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

function drawMainMenuEntry(px: number, py: number, icon: string, label: string): void {
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

function clickMainMenuEntry(px: number, py: number): boolean {
  const { x, y } = preferenceExtMainMenuSlot(px, py);
  return MouseIn(x, y, PREFERENCE_EXT_MAIN_MENU.BTN_W, PREFERENCE_EXT_MAIN_MENU.BTN_H);
}

function removePreferenceExtensionInputs(): void {
  ElementRemove(PREF_INPUT_GARBLE);
  ElementRemove(PREF_INPUT_SENSITIVITY);
}

export function registerPreferencesExtension(state: { settings: LilianSettings }): void {
  let view: ExtensionView = "MainMenu";
  /** 当前子屏是否已挂上 HTML 输入框 */
  let inputsMountedView: ExtensionView | null = null;

  function ensurePreferenceExtensionInputs(sub: "ChatControl" | "OrgasmControl"): void {
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
      const commit = (): void => {
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
      const inp = ElementCreateInput(
        PREF_INPUT_SENSITIVITY,
        "number",
        String(state.settings.OrgasmControlSetting.sensitivityLevel),
        "2"
      );
      inp.setAttribute("min", "0");
      inp.setAttribute("max", "10");
      inp.setAttribute("autocomplete", "off");
      const commit = (): void => {
        let n = parseInt(inp.value, 10);
        if (!Number.isFinite(n)) {
          n = state.settings.OrgasmControlSetting.sensitivityLevel;
        } else {
          n = Math.min(10, Math.max(0, Math.floor(n)));
        }
        state.settings.OrgasmControlSetting.sensitivityLevel = n;
        inp.value = String(n);
        saveSettings(state.settings);
      };
      inp.addEventListener("change", commit);
      inp.addEventListener("blur", commit);
    }
  }

  function positionPreferenceExtensionInput(sub: "ChatControl" | "OrgasmControl", row: number): void {
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
    } else {
      ElementPosition(
        PREF_INPUT_SENSITIVITY,
        cx,
        cy,
        PREFERENCE_EXT_SUBSCREEN.CONTROL_W,
        PREFERENCE_EXT_SUBSCREEN.CONTROL_BTN_H
      );
    }
  }

  function syncPreferenceInputsFromState(sub: "ChatControl" | "OrgasmControl"): void {
    if (sub === "ChatControl") {
      const el = document.getElementById(PREF_INPUT_GARBLE) as HTMLInputElement | null;
      if (!el || document.activeElement === el) return;
      const want = state.settings.ChatControlSetting.garbleSound;
      if (el.value !== want) el.value = want;
    } else {
      const el = document.getElementById(PREF_INPUT_SENSITIVITY) as HTMLInputElement | null;
      if (!el || document.activeElement === el) return;
      const want = String(state.settings.OrgasmControlSetting.sensitivityLevel);
      if (el.value !== want) el.value = want;
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
        drawMainMenuEntry(0, 1, MAIN_ICON, "高潮控制");
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
        syncPreferenceInputsFromState("OrgasmControl");

        DrawText(
          `- LilianMod 高潮控制 -`,
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
          "强制高潮 (Force orgasm)",
          xL,
          y0,
          PREFERENCE_EXT_SUBSCREEN.LABEL_WIDTH,
          hover0 ? "Red" : "Black",
          "Gray"
        );

        const y1 = preferenceExtSubscreenRowY(1);
        const hover1 = MouseIn(xL, y1 - 32, PREFERENCE_EXT_SUBSCREEN.LABEL_WIDTH, 64);
        DrawTextFit(
          "敏感度等级 (Sensitivity 0–10)",
          xL,
          y1,
          PREFERENCE_EXT_SUBSCREEN.LABEL_WIDTH,
          hover1 ? "Red" : "Black",
          "Gray"
        );
        if (hover0) {
          drawPreferenceTooltipBar(TT_FORCE_ORGASM);
        }
        if (hover1) {
          drawPreferenceTooltipBar(TT_SENSITIVITY_LEVEL);
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
        if (
          MouseIn(
            PREFERENCE_EXT_SUBSCREEN.CHECKBOX_LEFT,
            y0 - 32,
            PREFERENCE_EXT_SUBSCREEN.CHECKBOX_SIZE,
            PREFERENCE_EXT_SUBSCREEN.CHECKBOX_SIZE
          )
        ) {
          state.settings.ChatControlSetting.customGarbleEnabled = !state.settings.ChatControlSetting.customGarbleEnabled;
          saveSettings(state.settings);
        }
      } else if (view === "OrgasmControl") {
        const y0 = preferenceExtSubscreenRowY(0);
        if (
          MouseIn(
            PREFERENCE_EXT_SUBSCREEN.CHECKBOX_LEFT,
            y0 - 32,
            PREFERENCE_EXT_SUBSCREEN.CHECKBOX_SIZE,
            PREFERENCE_EXT_SUBSCREEN.CHECKBOX_SIZE
          )
        ) {
          state.settings.OrgasmControlSetting.forceOrgasmEnabled = !state.settings.OrgasmControlSetting.forceOrgasmEnabled;
          saveSettings(state.settings);
        }
      }
    },
    exit: () => {
      saveSettings(state.settings);
      removePreferenceExtensionInputs();
      inputsMountedView = null;
    },
  });
}
