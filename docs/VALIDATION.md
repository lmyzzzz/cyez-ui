# 验证记录

日期：2026-10-20。参考源码提交：8012b2513a5e3b0e133109cda76c92c52990e9dc。
在独立目录实施，参考仓库的 git status --porcelain 为空。

## 已通过

| 检查                    | 结果与范围                                                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TypeScript              | 根项目与独立模板类型检查通过；额外检查未使用局部变量与参数                                                                                                                                             |
| 单元/组件测试           | 5 个文件、12 个测试通过；覆盖 Toast、路由注册、外观保存与系统监听、启动错误、就绪等待及输入恢复、窗口 IPC 授权及清理                                                                                   |
| 构建                    | UI 包、Electron 包、浏览器展示页、Electron main/preload/renderer 均成功                                                                                                                                |
| 浏览器                  | 12 个测试通过，0 失败、0 跳过、0 不稳定；青绿/靛紫 × 亮/暗、Portal 继承、表单/菜单键盘操作、弹窗焦点、侧栏、分栏、CSS 覆写、偏好保存、启动首帧、动态效果偏好、启动品牌动画、减少动态效果与加载失败重试 |
| 浏览器尺寸              | 1280×800 展示与 760×560 设置页；截图已检查                                                                                                                                                             |
| 独立消费                | 将两个包打成 tgz，生成仓库外应用，独立安装、类型检查和 Electron 构建通过；确认单份 React，无 workspace 协议或旧业务包导入，preload 无 main 代码                                                        |
| Electron 模板浏览器预览 | 无 Electron 全局也可运行；系统窗口按钮隐藏，导航及主题切换通过                                                                                                                                         |
| Electron 运行           | 启动动画更新后的最终 Windows 解包产物通过启动及覆盖层清理、输入恢复、最大化/还原/最小化、状态同步、主题重载、Toast 与关闭检查                                                                          |
| Electron 隔离           | sandbox=true、contextIsolation=true、nodeIntegration=false；渲染端 require/process 不可见，仅开放五个窗口能力                                                                                          |
| Windows 打包            | 最终 NSIS 安装包生成成功；解包产物图标已提取检查，ProductName/FileDescription 为 Series Demo，版本 0.1.0.0                                                                                             |

结构化结果见 artifacts/browser-results.json、consumer-results.json、template-browser-results.json、electron-results.json 和 electron-packaged-results.json；截图见 artifacts/screenshots/。

artifacts/ 是本地验证产物目录，不纳入 Git；从 GitHub 克隆后，运行相应验证命令即可重新生成。2026-10-28 提交前再次通过类型检查和 12 项单元/组件测试；其他结果为上述 2026-10-20 的验证记录。

## 未验证边界

- 原生桌面检查被用户按 Esc 中止，随后停止 Computer Use；标题栏鼠标拖动及边缘鼠标缩放未完成验证。自动化已确认窗口允许缩放，并实际检查了最大化/还原，不能据此等同于鼠标检查。
- NSIS 安装包已生成，未执行安装/卸载验证；示例没有数字签名。
- 当前只在 Windows 验证；macOS/Linux、不同 DPI、多显示器与系统高对比度模式未验证。
- 键盘和焦点测试覆盖所列交互，不代表完成全面 WCAG 审计。
- 这是可复用 UI 与应用骨架。新产品的业务页面、数据库、文件操作、更新与发布配置需要应用自行实现。

## 环境与复跑

Node.js 22.22.2、pnpm 10.33.0、React 19.2.8、TypeScript 5.9.3、Vite 7.3.6、Electron 44.9.1、Playwright 1.64.1。

```powershell
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm test
pnpm run build
pnpm exec playwright install chromium
pnpm run test:browser
pnpm run verify:consumer
pnpm run test:electron

# 构建完成后再打包，不要与 build 同时运行
pnpm --filter series-electron-template package:win
node scripts/test-electron.mjs 'apps/electron-template/release/win-unpacked/Series Demo.exe'
```

模板的普通浏览器测试需要先在单独终端运行 pnpm --filter series-electron-template dev:browser，再运行 pnpm run test:template-browser。
