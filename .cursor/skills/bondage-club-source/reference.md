# Bondage Club 源码 — 补充索引

## Bondage-College 与 `BondageClub/`

- 上层目录如 `D:/gitgud/Bondage-College` 内**仅 `BondageClub/` 子目录**属于游戏客户端实现；其余内容除**被引用的资源路径**外，与 BondageClub 逻辑无关，不必作为调查范围。

## BCX（bondage-club-extended）

- 源码路径：`D:/gitgud/bondage-club-extended`（与本地克隆一致时）。
- **LilianMod 假设 BCX 已启用**：查某全局函数时，在 vanilla 中找定义后，用**同一函数名字符串**在 BCX 中搜 hook 注册 / `patch` / 包装入口（具体 API 以 BCX 与 mod-sdk 用法为准）。
- 若 vanilla 与 BCX 及本插件均挂钩同一符号，需结合 hook 链与执行顺序推断最终行为。

## `index.html` 与早期核心链（节选）

加载顺序前几段常为：`Game.js` → `Common.js` → `DictionaryBuilder.js` → 绘制与输入 → `Character.js` → … → `Speech.js` → `Server.js` → `Preference.js` 等。若怀疑基础设施问题，可查靠前的 `Common.js`、`Drawing.js` 等是否参与。

## 与 LilianMod 常见相关的脚本（按主题）

| 主题 | 优先查看 `Scripts/` 下文件 |
|------|------------------------------|
| 聊天消息构造、字典 | `DictionaryBuilder.js`；以及 `ChatRoom` 前缀的全局（多在聊天/UI 相关脚本中，以符号搜索为准） |
| 语音、口塞、乱码 | `Speech.js` |
| 偏好、扩展设置 | `Preference.js` |
| 角色数据结构 | `Character.js`、`Inventory.js` |
| 网络与同步 | `Server.js` |
| 道具与扩展物品 | `ExtendedItem.js`、`ModularItem.js`、`TypedItem.js` 及 `Screens/Inventory/**` |

具体符号名随版本变化；以当前克隆中的搜索结果为准。

## 搜索技巧

- 优先用**完整函数名**搜索，少用大词泛搜。
- 大文件中先定位 `function Foo` 或 `function Foo(`，再读相邻的 `if` / 早退 `return`。
- 大量使用**全局变量**；若只见读写未见声明，到文件顶部或 `Common.js`、`Game.js` 等查找集中声明。
