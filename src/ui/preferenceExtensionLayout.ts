/**
 * 偏好扩展（PreferenceRegisterExtensionSetting）画面布局常量。
 * 尺寸与排布借鉴常见成熟 BC 模组的美观实践；不要求与任何特定第三方仓库保持一致。
 */

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
  START_X: 180,
  START_Y: 205,
  Y_MOD: 75,
  TITLE_Y: 130,
  LABEL_WIDTH: 600,
  CONTROL_X: 930,
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
