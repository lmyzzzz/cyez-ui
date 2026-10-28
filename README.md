# Series Desktop

独立的 React 应用界面框架、薄 Electron 窗口适配包和可生成的应用模板。

代码仓库：https://github.com/lmyzzzz/cyez-ui

来源：cyez-ls101 的 feat/lab-deployment 分支，提交 8012b2513a5e3b0e133109cda76c92c52990e9dc。
保留原有系列视觉与主要交互；名称与图标是开发占位。原项目的业务、数据库、授权、设备与本地服务未迁入。

## 运行

要求 Node.js 22.12+、pnpm 10.33.0。以下为 Windows PowerShell 命令，在本目录执行：

首次获取源码：

```powershell
git clone https://github.com/lmyzzzz/cyez-ui.git
Set-Location cyez-ui
```

```powershell
pnpm install --frozen-lockfile
pnpm run build
pnpm run dev
```

浏览器展示页：[http://127.0.0.1:4173](http://127.0.0.1:4173)。标题栏可切换青绿与靛紫品牌，外观设置可选择明暗模式。

```powershell
# Electron 模板开发
pnpm run dev:electron

# 模板也能在普通浏览器预览
pnpm --filter series-electron-template dev:browser

# Windows 解包应用
pnpm run package:electron

# Windows NSIS 安装包（先完成 build）
pnpm --filter series-electron-template package:win
```

Windows 解包产物位于 apps/electron-template/release/win-unpacked/，需保留整个目录一起运行。
NSIS 安装包位于 apps/electron-template/release/Series Demo Setup 0.1.0.exe。当前为未签名示例，安装/卸载未验证，详细测试范围见 docs/VALIDATION.md。
修改共享包源码后，请先执行 pnpm run build:packages，再刷新或重启消费应用。当前应用消费的是构建产物，没有隐式源码别名。

## 创建真正独立的新应用

```powershell
pnpm run build:packages
pnpm run create:app -- ..\my-new-app
Set-Location ..\my-new-app
pnpm install
pnpm run typecheck
pnpm run build
pnpm run dev
```

目标目录必须不存在。生成器会复制最小模板与 vendor/ 下的两个 .tgz 包，不包含对本 workspace 或旧仓库的路径引用。
UI 与 Electron 适配包通过本地 tgz 安装，尚未发布到 npm。GitHub 仓库提供源码，生成的应用不依赖原仓库目录。

## 目录与职责

| 位置                   | 内容                                                                       |
| ---------------------- | -------------------------------------------------------------------------- |
| packages/ui            | React 基础组件、标题栏/侧栏、页面/设置布局、导航、主题控制器、通用启动画面 |
| packages/electron      | /main、/preload、/shared 独立入口，仅窗口控制、状态同步和能力契约          |
| apps/showcase          | 双品牌、亮暗主题的组件与布局展示                                           |
| apps/electron-template | main/preload/renderer、安全默认设置、构建打包与最小页面                    |
| scripts/create-app.mjs | 生成仓库外的独立应用                                                       |
| docs/THEMING.md        | 主题文件、覆写接口、模式切换与启动说明                                     |
| docs/VALIDATION.md     | 实际验证结果与未验证边界                                                   |
| artifacts/screenshots  | 浏览器与 Electron 验证截图                                                 |

业务页面、文件系统、数据库、后台服务、业务 IPC 与更新策略由各应用自行实现。

## 配置规则

- 名称、图标、副标题、标题栏操作区和窗口能力：通过 props 传入。
- 色彩、背景、字体、圆角、间距与阴影：应用的 theme.css 覆盖公开 CSS 变量。
- 特殊外观：应用的 overrides.css 使用 className、slotClassNames 或稳定 data-ui / data-part 属性。
- 运行时外观控制器：只处理 light/dark/system、动态效果偏好、状态属性与保存；不接收颜色对象。
- 启动动画：图标与文字入场、加载条、完成淡出；跟随主题与减少动态效果偏好，时长和效果在 CSS 中覆写。刷新展示页或重开桌面示例可再次观看。
- 普通浏览器不提供 windowControls，标题栏隐藏原生控制按钮。无需模拟 Electron 全局变量。

## 验证命令

```powershell
pnpm run typecheck
pnpm test
pnpm exec playwright install chromium
pnpm run test:browser
pnpm run test:electron
pnpm run verify:consumer
```

浏览器测试使用 4173 端口，请先关闭占用该端口的开发服务器。
独立消费验证默认在此项目上两级目录的 work/ 下创建唯一测试应用；可用 SERIES_WORK_DIR 环境变量指定其他测试目录。
Electron 验证使用隔离的临时 userData，不读取现有应用配置。

依赖使用 pnpm-lock.yaml 固定版本。首次尝试 npm 10 安装时遇到其 peer 解析异常，项目已统一使用 pnpm；不要混用生成另一套锁文件。

## 许可与来源

原仓库 LICENSE 已逐字保留，详细来源见 NOTICE.md。该抽离没有将原代码重新授权为开源；对外分发前由权利人确定许可。第三方依赖各自遵守原许可证。
