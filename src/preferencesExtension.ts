import { LilianSettings, PLUGIN_KEY } from "./settings";
import { loadSettings, saveSettings } from "./storage";
import {
  PREFERENCE_EXT_EXIT,
  PREFERENCE_EXT_HELP,
  PREFERENCE_EXT_MAIN_MENU,
  PREFERENCE_EXT_SUBSCREEN,
  preferenceExtMainMenuSlot,
  preferenceExtSubscreenRowY,
} from "./ui/preferenceExtensionLayout";

const GARBLE_SOUND_PRESETS = ["呜", "嗯", "唔", "m"];
type ExtensionView = "MainMenu" | "ChatControl" | "OrgasmControl";

const MAIN_ICON = "Icons/Preference.png";

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

export function registerPreferencesExtension(state: { settings: LilianSettings }): void {
  let view: ExtensionView = "MainMenu";

  PreferenceRegisterExtensionSetting({
    Identifier: PLUGIN_KEY,
    ButtonText: "LilianMod",
    Image: MAIN_ICON,
    load: () => {
      state.settings = loadSettings();
      view = "MainMenu";
    },
    run: () => {
      const previousAlign = MainCanvas.textAlign;

      if (view === "MainMenu") {
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
          xL + 600,
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
        DrawButton(
          PREFERENCE_EXT_SUBSCREEN.CONTROL_X,
          y1 - 20,
          PREFERENCE_EXT_SUBSCREEN.CONTROL_W,
          PREFERENCE_EXT_SUBSCREEN.CONTROL_BTN_H,
          state.settings.ChatControlSetting.garbleSound,
          "White"
        );
      } else {
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
        DrawTextFit(
          "兴奋等级 (0–10)",
          xL,
          y0,
          PREFERENCE_EXT_SUBSCREEN.LABEL_WIDTH,
          hover0 ? "Red" : "Black",
          "Gray"
        );
        DrawButton(
          PREFERENCE_EXT_SUBSCREEN.CONTROL_X,
          y0 - 20,
          PREFERENCE_EXT_SUBSCREEN.CONTROL_W,
          PREFERENCE_EXT_SUBSCREEN.CONTROL_BTN_H,
          String(state.settings.OrgasmControlSetting.hornyLevel),
          "White"
        );

        const y1 = preferenceExtSubscreenRowY(1);
        const hover1 = MouseIn(xL, y1 - 32, 950, 64);
        DrawTextFit(
          "取值×10 并入所有行为的 arousal 封顶（最大 100）；封顶至 100 时可触发高潮。",
          xL,
          y1,
          950,
          hover1 ? "Red" : "Black",
          "Gray"
        );
      }

      MainCanvas.textAlign = previousAlign;
      drawExtensionExitAndHelp();
    },
    click: () => {
      if (MouseIn(PREFERENCE_EXT_EXIT.x, PREFERENCE_EXT_EXIT.y, PREFERENCE_EXT_EXIT.w, PREFERENCE_EXT_EXIT.h)) {
        if (view === "ChatControl" || view === "OrgasmControl") {
          saveSettings(state.settings);
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
            xL + 600,
            y0 - 32,
            PREFERENCE_EXT_SUBSCREEN.CHECKBOX_SIZE,
            PREFERENCE_EXT_SUBSCREEN.CHECKBOX_SIZE
          )
        ) {
          state.settings.ChatControlSetting.customGarbleEnabled = !state.settings.ChatControlSetting.customGarbleEnabled;
          saveSettings(state.settings);
          return;
        }
        const y1 = preferenceExtSubscreenRowY(1);
        if (
          MouseIn(
            PREFERENCE_EXT_SUBSCREEN.CONTROL_X,
            y1 - 20,
            PREFERENCE_EXT_SUBSCREEN.CONTROL_W,
            PREFERENCE_EXT_SUBSCREEN.CONTROL_BTN_H
          )
        ) {
          const current = GARBLE_SOUND_PRESETS.indexOf(state.settings.ChatControlSetting.garbleSound);
          const next = (current + 1 + GARBLE_SOUND_PRESETS.length) % GARBLE_SOUND_PRESETS.length;
          state.settings.ChatControlSetting.garbleSound = GARBLE_SOUND_PRESETS[next];
          saveSettings(state.settings);
        }
        return;
      }

      if (view === "OrgasmControl") {
        const y0 = preferenceExtSubscreenRowY(0);
        if (
          MouseIn(
            PREFERENCE_EXT_SUBSCREEN.CONTROL_X,
            y0 - 20,
            PREFERENCE_EXT_SUBSCREEN.CONTROL_W,
            PREFERENCE_EXT_SUBSCREEN.CONTROL_BTN_H
          )
        ) {
          const h = state.settings.OrgasmControlSetting.hornyLevel;
          state.settings.OrgasmControlSetting.hornyLevel = (h + 1) % 11;
          saveSettings(state.settings);
        }
      }
    },
    exit: () => {
      saveSettings(state.settings);
    },
  });
}
