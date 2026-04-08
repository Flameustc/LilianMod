---
name: bondage-club-source
description: >-
  Navigates Bondage Club vanilla source plus bondage-club-extended (BCX) patches
  (both use bondage-club-mod-sdk). Use when implementing or debugging LilianMod,
  tracing runtime behavior, or when the user mentions BondageClub, BCX, BC
  globals in bc.d.ts, or D:/gitgud/Bondage-College / bondage-club-extended paths.
---

# Bondage Club 源码辅助

## 源码根目录

本机约定路径（与 LilianMod 并列的开发克隆）：

`D:/gitgud/Bondage-College/BondageClub`

若路径不同，以用户 workspace 外的 **`BondageClub` 目录（游戏客户端根）** 为准；始终在**该目录**下搜索，不要用 LilianMod 的 `node_modules` 代替上游实现。

**Bondage-College 单仓范围**：若本地是 `D:/gitgud/Bondage-College` 这类上层仓库，**只把其下的 `BondageClub/` 子目录当作 BondageClub 客户端源码与逻辑**；**该子目录以外**的路径（同级或上级其它文件夹）与 BondageClub 客户端逻辑**无关**，阅读或搜索时不必纳入，**唯一例外**是代码里**显式引用的资源文件路径**（如图标、静态资源 URL）需要对照时再打开对应位置。

## Bondage Club Extended（BCX）

**bondage-club-extended**（常称 **BCX**）是另一款 Bondage Club 插件，源码本机约定路径：

`D:/gitgud/bondage-club-extended`

- BCX 同样通过 **bondage-club-mod-sdk** 拦截或替换 BondageClub 客户端中的全局函数与逻辑。
- **LilianMod 假定用户始终已安装并启用 BCX。** 分析任意函数或流程时，在读完（或并行查阅）vanilla 实现后，**必须在 BCX 源码中检索该符号是否被 hook / patch / 包装**；若 BCX 已修改其行为，**以 BCX 生效后的语义为准** 来解释运行时、设计 LilianMod 的 hook 顺序与边界条件。
- 若 vanilla 与 BCX 对同一函数均有修改，实际结果还依赖 **模组加载与 hook 链顺序**；排查争议时需在两个仓库中对照相关 `registerMod` / patch 注册点，并结合 SDK 的链式调用语义推断最终行为。

## 修改 vanilla 行为时的 hook 原则（LilianMod / mod-sdk）

- **优先增量，避免整段重写**：需要改变 BondageClub 原有函数语义时，尽量用 **bondage-club-mod-sdk** 的 `hookFunction`，只实现**与原版相比多出来的那一部分**（例如在调用 `next(args)` 前后调整参数、对返回值再加工、在极窄条件下短路并委托 `callOriginal` / `next` 等）。
- **不要复制粘贴整个上游函数体**作为默认方案；整函数镜像难以随 BC 更新维护，且容易在**不调用 `next`** 时跳过同函数上其它模组（含 BCX）的 hook 链，引发兼容性与顺序问题。
- **若增量难以表达**（例如必须在计算中途插入逻辑且无任何更细粒度 API），再考虑折中：更小范围的辅助函数抽取、`patchFunction`（谨慎）、或向 BondageClub 上游提议扩展点——若仍不得不大块替换，须在实现处**注释说明原因与风险**。

## 仓库形态与读取方式

- **无构建的浏览器脚本**：多为顶层 `function` / `var` / `let` 与全局对象，**不是 ES 模块**。
- **入口与加载顺序**：根目录 `index.html` 按 `<script src="...">` **顺序**加载；先后关系决定谁可依赖谁。复杂问题先在该文件中定位相关 `Scripts/*.js` 或 `Screens/**/*.js` 再读实现。
- **主要目录**：
  - `Scripts/`：核心逻辑（聊天、语音、偏好、角色、物品、服务器消息等）。
  - `Screens/`：各界面与子系统，含大量 `Inventory` 物品脚本。
  - `CSS/`：样式（与脚本中的绘制/UI 常成对出现）。
  - `Scripts/lib/`：第三方库。

## 如何从 LilianMod 跳到上游

1. **全局 API**：在 LilianMod 中先看 `src/types/bc.d.ts` 里声明的名字；再到 BondageClub 仓库 **精确搜索符号**（函数名、`PreferenceRegisterExtensionSetting`、`ChatRoom*` 等）。
2. **Mod SDK 与 BCX**：vanilla 文件中的实现是**基线**；随后必须在 **BCX 仓库** 中检索同一符号是否被 mod-sdk **hook**。LilianMod 假定 BCX 已启用，**以「vanilla + BCX 修改」后的逻辑作为用户环境下的真实行为基础**；仅读 vanilla 不足以判断已装 BCX 时的表现。
3. **行为不确定时**：在 BC 仓库中对同一符号做 **调用方搜索**（谁调用、事件从哪触发），再沿 `Server.js` / 聊天相关脚本回溯网络与 UI 路径；并联检索 BCX 中是否改变该路径上的节点。

## 推荐调查顺序（复杂逻辑）

1. `index.html` 中确认涉及模块的 `<script>` 文件名。
2. 在 `Scripts/`（或对应 `Screens/` 文件）打开定义处，读函数体与注释。
3. 用仓库内搜索查找 **赋值处、分支、早退条件**（BC 常用全局状态变量，名称较长但稳定）。
4. 若与联机相关协议有关，对照 `Scripts/Server.js` 及消息类型处理分支，注意 **客户端校验与服务端字段** 可能分处不同文件。

## LilianMod 扩展偏好界面（美观参考，非兼容义务）

`PreferenceRegisterExtensionSetting` 的配置页应**清晰、易读**，并与 Bondage Club 原生偏好里常见的扩展屏**观感协调**（疏密、颜色、`DrawText` / `DrawTextFit` / `DrawButton` / `DrawCheckbox` 的搭配）。具体像素与排布借鉴了社区中**公认较美观**的一类实现，仅作 aesthetic 参考：**不要求**与任何特定第三方插件保持 UI 兼容或随其版本同步；代码与注释里也**不要绑定**具体第三方项目名称。

若需要找灵感，可在本机任意并列克隆的 BC 模组仓库中自行翻阅其 Settings / 偏好相关源码；对齐的是**模式**（例如主菜单卡片网格、子屏左标签右控件列），不是逐文件复刻。

### 建议遵循的布局与控件习惯

- **子屏标题**：`DrawText(..., x=180, y=130, "Black", "#D7F6E9")`（常见写法为子屏首行基线 205 减去行距 75）。
- **子屏内容列**：标签列起点 **180**，首行基线 **205**，行间 **`Y_MOD = 75`**。
- **勾选**：标签 `DrawTextFit` 宽约 **600**，**Black** / **Gray**，标签区悬停 **Red**；**`DrawCheckbox`** 在标签右侧 **`x + 600`**, **`y - 32`**, **64×64**。
- **非布尔控件列**：常见为 **`START_X + 750 = 930`**，宽约 **300**；轻量场景可用 **`DrawButton`** 显示当前值并点击轮换。
- **主菜单模块入口**：原点 **(150, 190)**，步进 **(480, 120)**，格内按钮 **450×90**，图标约 **70×70**、内边距 **10**；`DrawTextFit` 标签约 **`x+100`、`y+45`、宽 340**。不可用项可用按钮色 **`#ddd`** 并写明 hover 说明。
- **退出**：**`DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", "Main Menu")`**。
- **说明图标**：子屏右下角 **1815, 820, 90×90**，常用 **`Icons/Introduction.png`**；是否在 `click` 中打开外链由模组自定。
- **`MainCanvas.textAlign`**：主菜单每一格内常在 **`center`**（画按钮）与 **`left`**（画标签）之间切换；子屏结束前恢复进入 `run` 时的对齐方式。

### 落地文件

尺寸集中放在 **`src/ui/preferenceExtensionLayout.ts`**（`PREFERENCE_EXT_*`、`preferenceExtMainMenuSlot`、`preferenceExtSubscreenRowY`）；新项优先从该处取常量，避免魔法数散落。

## 与插件协作的注意点

- **不要假设 TypeScript 类型即运行时全貌**：`bc.d.ts` 仅为插件维护的摘要，完整字段以 `Character.js`、`Preference.js` 等与 `Player` 相关的上游定义为准。
- **BCX 为既定环境**：设计 LilianMod 时默认 BCX 已加载；与 BCX 叠加的 hook、共享全局状态或竞态需在 BCX 源码侧一并核实。
- **版本漂移**：BC 主分支会变；以用户本地的 BondageClub 克隆为准，diff/行号以当前检出的提交为准。BCX 与 BC 版本组合以用户本地 BCX 克隆为准。

## 延伸阅读

- 更细的目录说明与聊天/偏好相关文件名提示见 [reference.md](reference.md)。
