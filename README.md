# LilianMod

Bondage Club 插件。本仓库是 LilianMod 本体；给其他人分发时走另行维护的 FUSAM-Lilian，不在这里上架。

## 当前功能

- `Preferences -> Extensions -> LilianMod`
- **ChatControl / Custom gag garble**：自定义口塞说话（可关）
- **Garble sound**：拟声字，默认 `呜`
- 高潮控制子页（与口塞无关）
- 设置写入 `Player.ExtensionSettings.LilianMod`，并调用 `ServerPlayerExtensionSettingsSync("LilianMod")`
- 本地备份：`localStorage["LilianMod_<MemberNumber>_Backup"]`

## 口塞怎么接

出站 Chat / Whisper 的字母含糊在 R131+ 走 `SpeechTransformProcess` → `SpeechTransformGagGarble`。LilianMod **只替换这一层的口塞算法**：

- 开关关闭：`SpeechTransformGagGarble` 调用 `next`，游戏和其它插件照旧
- 开关开启：不调用 `next`，用 `src/chat-control/garble.ts` 的结果（OOC 括号保留、强度沿用入参、`呜` / `m` / `M` / `*` / `—`）
- 优先级 6，高于 MPA（5）、BC+（3）、MBS（0），所以这些插件挂在同一函数上的口塞算法不会再改这条结果
- **失聪仍走原链**。原版把 deafen 也实现成 `SpeechTransformGagGarble`。开关开启时 Lilian 在 `SpeechTransformProcess`（优先级 20）里把 deafen 拆出去，口塞调用用自定义算法，deafen 那次调用 `next`（MPA 宠物听力、MBS 替代含糊的失聪分支还在）

`ChatRoomGenerateChatRoomChatMessage` **不再短路**。旧实现留在 `src/chat-control/legacy/chatRoomGenerateGarbleHook.ts`，`LEGACY_GENERATE_GARBLE_HOOK_ENABLED` 为 false，入口不会安装它。

开关开启时，生成函数仍会 `next`（优先级 12，包在 WCE 的 11 外面），只做两件事后处理：

1. 若这条消息根本没进到 `SpeechTransformGagGarble`（WCE 耳语 anti-garble 设为 `off` 时会跳过整段变换），用当前口塞强度补一次 Lilian 含糊
2. 去掉字典里的明文：`Original`、`OriginalMsg`，以及 BCX 的 `{ Tag: "BCX_ORIGINAL_MESSAGE" }`

BCX 是在 `ServerSend`（优先级 1）里才把 `BCX_ORIGINAL_MESSAGE` 推进字典的，所以同一条消息在 `ServerSend` 优先级 -100 再剥一次，发生在真正发送之前。没戴口塞（强度 0 且没跑过自定义含糊）时不动字典，WCE 的婴儿语/结巴明文提示还在。

开关开启且这句话被含糊过时，接收方的 `ShowUngarbledMessages` 和 WCE anti-garble 括号原文都依赖同一个 `Original` 字段，会一起看不到明文。这是「不能被 anti-garble 还原」的直接结果。

## 构建

```bash
npm install
npm run typecheck
npm run check:garble
npm run build
```

产物：`dist/lilianmod.user.js`（IIFE，带 userscript 头；头是注释，FUSAM `type: script` 也能加载）。

## 加载

Tampermonkey 加载 `dist/lilianmod.user.js`。`@match` 覆盖 elementfx、bondageprojects.com 和 localhost。

Flame 自测，在游戏 URL 上加（先在本机把 `dist/` 用静态服务器挂出去）：

```text
?fusam=http://localhost:PORT/lilianmod.user.js&fusamType=script
```

## 测试笔记（对照当前源码，不是进游戏实测）

本环境没有 Bondage Club 客户端，下面是对当前上游源码的核对，加上 `npm run check:garble` 对算法和字典剥离的本地断言。进房验证仍要在游戏里做。

| 来源 | 修订 | 和 Lilian 口塞的关系 |
|---|---|---|
| Bondage Club `Speech.js` / `ChatRoom.js` | `856b3de9`（2026-10-30） | 出站含糊是 `SpeechTransformGagGarble`。`NoSpeechGarble` 时 Generate 写入 `Dictionary[].Original`。显示端在 `ShowUngarbledMessages` 时把它抄进 `metadata.OriginalMsg`，画成 `[...]`。`SpeechGarble` 已废弃，Generate 不调用它 |
| WCE `src/functions/antiGarbling.ts` | `01de779`（6.3.21，2026-10-19） | anti-garble 开时 Generate 优先级 11 且不 `next`，自己调 `SpeechTransformProcess` / `SpeechTransformGagGarble`，并把明文或轻含糊写进 `Original`。默认档位是 `none`（括号里是完整原文）。Lilian 的 GagGarble 钩仍会包住它的直接调用；Generate 后处理删掉 `Original`。耳语档 `off` 不调用变换，由后处理补含糊。WCE anti-deafen 只在接收端、本地把已收到的 `msg` 填进 `metadata.OriginalMsg`，不会把发送前删掉的明文找回来 |
| BCX `src/modules/speech.ts` | `5099644`（v1.1.23，2026-10-21） | `.antigarble` 仍钩在废弃的 `SpeechGarble`（优先级 6），R131+ 出站聊天不经过它。真正会把明文送出去的是 `ServerSend` 优先级 1 的 `{ Tag: "BCX_ORIGINAL_MESSAGE", Text }`；耳语接收端用它还原。Lilian 在更低优先级删掉这个条目。听力白名单（`rules/bc_alter.ts`）读的是同一个 Tag，因此也还原不了 Lilian 发出的口塞句。BCX 不读取 `Original` / `OriginalMsg` |
| MBS `src/garbling/index.ts` | `390bad3`（2026-10-19） | `patchFunction(SpeechTransformProcess)` 给 GagGarble 多传角色；`SpeechTransformGagGarble` 优先级 0，AlternativeGarbling 开时用自己的算法。Lilian 优先级更高且口塞调用不 `next`，替代含糊不会作用在口塞上。deafen 那次调用仍 `next`，MBS 的失聪分支还在。MBS 不写 `Original` |
| MPA `src/modules/profile.ts`、`private.ts` | `9e4b037`（2026-07-27） | `SpeechTransformGagGarble` 优先级 5：宠物听力，以及宠物含糊 First / Last / **Replace（不 next）**。Lilian 优先级 6 且口塞不 `next`，Replace / First / Last 都不会改口塞结果。MPA 在 Process 优先级 10 把 deafen 拆开；Lilian 用优先级 20 先拆，deafen 调用仍 `next`，宠物听力保留。MPA 不写 anti-garble 明文 |

建议在游戏里再点一遍：只开 Lilian；Lilian + WCE anti-garble 开/关，以及耳语 `off`；`NoSpeechGarble` / Show ungarbled；BCX `.antigarble both|ungarbled` 看耳语；MBS AlternativeGarbling；MPA pet gagging Replace；中英文 OOC 括号。LSCG 窒息/牵引若对已含糊文本再调 `SpeechGarbleByGagLevel`，会再进一次同一个钩，可能过糊。
