# 最小 Electron 应用模板

要求 Node.js 22.12+、pnpm 10.33.0。独立生成的项目自带 vendor/ 中的两个组件包，无需原仓库。

```powershell
pnpm install
pnpm run typecheck
pnpm run build
pnpm run dev
```

浏览器预览：pnpm run dev:browser。构建后的桌面运行：pnpm run preview。
生成 Windows 解包目录：pnpm run package:dir。生成 NSIS 安装包：pnpm run package:win。

- app.config.json：应用标识、名称和副标题。
- src/renderer/assets/icon.svg：UI 图标；resources/icon.png：系统及安装包图标，需成套替换。
- src/renderer/styles/theme.css：亮色/暗色 CSS 变量。
- src/renderer/styles/overrides.css：稳定 data-ui/data-part 接口上的外观覆写。
- src/renderer/App.tsx：菜单与业务页面。
- src/preload/index.ts：有限能力桥；src/main/index.ts：窗口与宿主行为。

模板启用 sandbox、contextIsolation，关闭 nodeIntegration，拒绝新窗口、外部导航与默认权限。文件读取、数据库和更新等能力由应用按需添加。
当前自定义标题栏以 Windows 为验收平台；macOS/Linux 尚未运行验证。
打包配置未设置发布证书，产物未签名。正式发布前请设置自己的签名与应用标识。
