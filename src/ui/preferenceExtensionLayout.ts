/**
 * 偏好扩展（PreferenceRegisterExtensionSetting）画面布局常量.
 * 子屏横向刻度与 LSCG `GuiSubscreen`（START_X / 标签 600 / 控件列 +750）对齐。
 */

const SUB_X0 = 180;

export const PREFERENCE_EXT_MAIN_MENU = {
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
  TEXT_MAX_W: 340,
} as const;

export const PREFERENCE_EXT_SUBSCREEN = {
  START_X: SUB_X0,
  START_Y: 205,
  Y_MOD: 75,
  TITLE_Y: 130,
  LABEL_WIDTH: 600,
  /** 勾选框左缘，同 LSCG `getXPos(i) + 600` */
  CHECKBOX_LEFT: SUB_X0 + 600,
  /** `ElementPosition` 横坐标（控件水平中心），同 LSCG `getXPos(i) + 750` */
  CONTROL_CENTER_X: SUB_X0 + 750,
  CONTROL_W: 300,
  CONTROL_BTN_H: 50,
  CHECKBOX_SIZE: 64,
} as const;

export const PREFERENCE_EXT_EXIT = { x: 1815, y: 75, w: 90, h: 90 } as const;
export const PREFERENCE_EXT_HELP = { x: 1815, y: 820, w: 90, h: 90 } as const;

export function preferenceExtMainMenuSlot(px: number, py: number): { x: number; y: number } {
  return {
    x: PREFERENCE_EXT_MAIN_MENU.ORIGIN_X + PREFERENCE_EXT_MAIN_MENU.STEP_X * px,
    y: PREFERENCE_EXT_MAIN_MENU.ORIGIN_Y + PREFERENCE_EXT_MAIN_MENU.STEP_Y * py,
  };
}

export function preferenceExtSubscreenRowY(row: number): number {
  return PREFERENCE_EXT_SUBSCREEN.START_Y + PREFERENCE_EXT_SUBSCREEN.Y_MOD * row;
}
