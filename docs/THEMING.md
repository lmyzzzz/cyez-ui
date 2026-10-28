# 主题与样式覆写

## 加载顺序

```ts
import '@series/ui/styles.css'
import '@series/ui/app.css' // 整页应用需要，嵌入组件可省略
import './styles/theme.css'
import './styles/overrides.css'
```

组件模块使用 CSS Modules，应用覆写不依赖哈希类名。默认样式按以下层级声明：

```css
@layer ui-tokens, ui-base, ui-components, app-theme, app-overrides, ui-motion;
```

ui-motion 最后处理“减少动态效果”的用户偏好。常规主题与覆写无需 !important。所有库内主题化样式归入指定层，避免无层规则意外覆盖应用主题。
依赖库的可访问性辅助样式由依赖自身管理。

## 每个应用一个主题文件

普通应用直接使用 :root，不需要 data-brand。展示页为了比较两个品牌，额外使用 data-brand 区分它们。

```css
@layer app-theme {
  :root {
    --color-accent: #5146ce;
    --color-accent-hover: #4338b7;
    --color-accent-pressed: #372e99;
    --color-accent-soft: #efedfc;
    --color-accent-contrast: #fff;
    --color-focus-ring: rgb(81 70 206 / 30%);
    --shadow-primary: 0 3px 8px rgb(81 70 206 / 14%);
  }
  :root[data-theme='dark'] {
    --color-accent: #b1a6ff;
    --color-accent-hover: #c7bfff;
    --color-accent-pressed: #9b8fec;
    --color-accent-soft: #302944;
    --color-accent-contrast: #1d1730;
    --color-focus-ring: rgb(177 166 255 / 36%);
    --shadow-primary: 0 3px 8px rgb(0 0 0 / 24%);
  }
}
```

全部默认变量见 packages/ui/src/styles/tokens.css。可以覆写 `--font-ui`、`--radius-*`、`--space-*`、`--sidebar-width`、`--titlebar-height`、`--content-max-width`。
成功、警告、错误使用独立语义色，不随品牌主色变化。

## 稳定的覆写接口

```css
@layer app-overrides {
  [data-ui='page-header'] > h1 {
    letter-spacing: -0.4px;
  }
  [data-ui='titlebar'] [data-part='brand'] {
    gap: 12px;
  }
  [data-ui='button'][data-variant='primary'] {
    border-radius: 8px;
  }
}
```

| 组件                | 公开钩子                                                                                              |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| AppShell            | data-ui=app-shell、data-layout；workspace/content；className、slotClassNames.titlebar/sidebar/content |
| TitleBar            | data-ui=titlebar；brand/actions/drag-region/window-controls；className                                |
| Sidebar             | data-ui=sidebar、data-collapsed；navigation-link；className                                           |
| Button / IconButton | data-ui=button / icon-button、data-variant、data-size；className                                      |
| 页面 / 设置         | page、page-header、settings-content、settings-section、settings-row                                   |
| 表单                | field、check-field、input、select、textarea、switch；Switch 的 track                                  |
| 容器                | card、toolbar、badge、table-container、resizable-split；分栏的 separator                              |
| 浮层                | modal-overlay、modal-panel、confirm-modal、tooltip、action-menu；菜单的 item                          |
| 状态                | banner + data-tone、task-progress、empty-state、startup                                               |

data-part 需在组件根下选择，以免影响其他组件。可访问性角色和业务 DOM 不是视觉覆写 API。
ResizableSplit 支持一到两个面板；需要容纳 minFirst + minSecond + 8px 的可用宽度。动态计算的分栏宽度是内联值，用于拖拽交互。

## 模式控制与保存

```tsx
const appearance = createAppearanceController({
  storageKey: 'my-app:appearance',
  onError: error => console.warn(error)
})

<AppearanceProvider controller={appearance}>
  <App />
</AppearanceProvider>
```

createAppearanceController 在 React 挂载之前执行。默认存储为 localStorage，可通过同步 storage.load/save 接口注入其他缓存，或设 storage:null 禁用保存。
异步后端应由应用加载到本地缓存，再创建控制器。unmount 文档宿主时调用 dispose；Provider 本身不拥有控制器的生命周期。
useAppearance 提供 theme、resolvedTheme、motion、reducedMotion、setTheme、setMotion 和 reset。将主题属性设在 html，body 下的 Portal 同样继承主题变量。

## 首帧与启动

模板与展示页在 HTML head 使用外部阻塞脚本 appearance-init.js。prepare.mjs 从 @series/ui 产物复制它，data-storage-key 与运行时控制器使用同一个键。
它运行相同的偏好解析逻辑，在 CSS 和 React 模块加载前设置明暗与动态效果属性。没有内联脚本，也不传入颜色对象。

bootstrapRenderer 接收 root、title、icon、subtitle、loadApplication。启动时使用应用传入的图标和文字，播放图标轻微上浮、文字依次淡入、加载条与完成淡出；不要求图标具备特定 SVG 结构。

业务加载与入场动画同时进行。应用可先挂载在覆盖层下，入场结束并且 startApplication 完成后才淡出覆盖层；底层界面在交接期间设为 inert，避免穿透点击和键盘误操作。startApplication 应在首个可用界面提交后完成：模板首次 React 挂载使用 flushSync，异步初始化可返回 Promise。库不检查数据库、服务或其他业务是否就绪。

默认入场 420ms，文字与加载条最多错开 140ms，完成淡出 180ms；快速启动的视觉交接约 740ms，业务加载不因此延后。JS 等待实际 CSS 动画完成，不另设产品停留计时器，无限循环的加载条不阻塞交接。减少动态效果时取消这些时长和错开延迟，应用就绪后直接显示。加载失败立即显示可读错误和可操作的重试按钮。

```css
@layer app-theme {
  :root {
    --startup-icon-size: 80px;
    --startup-enter-duration: 420ms;
    --startup-exit-duration: 180ms;
    --startup-easing: cubic-bezier(0.22, 1, 0.36, 1);
  }
}
@layer app-overrides {
  /* 如需完全关闭启动动画，同时取消动画的延迟。 */
  /* [data-ui='startup'],
  [data-ui='startup'] *,
  [data-ui='startup'] *::before,
  [data-ui='startup'] *::after { animation: none; } */
}
```

启动页公开 data-part=mark/icon/title/subtitle/progress，以及 data-state=loading/leaving/error。在 overrides.css 中可以替换关键帧、布局或隐藏装饰；效果仍属于 CSS，名称、图标和业务就绪信号仍由应用提供。刷新浏览器展示页或重新打开桌面示例即可再次观看。

Electron 的 BrowserWindow.backgroundColor 在主进程创建窗口时不能直接读取 CSS。模板使用与默认背景一致的系统明暗底色，并在 ready-to-show 后显示窗口。若应用改变画布背景或增加独立原生启动窗口，需要同时调整 main 中的窗口背景配置。

## 应用身份与窗口能力

```tsx
<AppShell
  title={app.name}
  subtitle={app.subtitle}
  icon={iconUrl}
  actions={<MyActions />}
  routes={routes}
  windowControls={desktopCapabilities?.windowControls}
/>
```

UI 层没有 Electron 导入或 window.windowControls 回退。能力缺失时不展示不可用的系统按钮。
AppShell 需要 Router 上下文；使用显式 routes 数组即可，不需要全局注册表。
如使用旧式插件路由注册，AppRouteRegistry 仍保留为兼容工具；新应用优先显式数组。

系统窗口按钮仍位于右侧。macOS 的原生红黄绿按钮布局未包含在本次实现中。
