# LilianMod

一个最小可运行的 BondageClub TypeScript 插件示例。

## 当前功能

- 在 `Preferences -> Extensions` 注册 `LilianMod` 子页面
- 子页面包含一个 dummy 开关项（Enabled/Disabled）
- 设置持久化到 `Player.ExtensionSettings.LilianMod`
- 每次保存时调用 `ServerPlayerExtensionSettingsSync("LilianMod")`
- 同步写入本地备份：`localStorage["LilianMod_<MemberNumber>_Backup"]`

## 构建

```bash
npm install
npm run build
```

产物输出为：`dist/lilianmod.user.js`

## 加载方式

- 使用 Tampermonkey 等 userscript 管理器加载 `dist/lilianmod.user.js`
- 进入 BC 后打开 `Preferences -> Extensions -> LilianMod`

## 存储说明

- 服务器/账号扩展设置：`Player.ExtensionSettings.LilianMod`
- 本地备份：`LilianMod_<MemberNumber>_Backup`
