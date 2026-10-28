import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Home, Settings, Plus, FolderOpen } from 'lucide-react'
import {
  AppShell,
  AppToaster,
  Badge,
  Button,
  Card,
  EmptyState,
  Page,
  PageHeader,
  Select,
  SettingsContent,
  SettingsRow,
  SettingsSection,
  toast,
  useAppearance,
  type ThemeMode,
  type MotionMode,
  type AppRouteRegistration
} from '@series/ui'
import config from '../../app.config.json'
import icon from './assets/icon.svg'
function HomePage() {
  return (
    <Page>
      <PageHeader
        title="开始工作"
        actions={
          <Button icon={Plus} variant="primary" onClick={() => toast.success('示例操作已完成')}>
            示例操作
          </Button>
        }
      />
      <Card>
        <EmptyState icon={FolderOpen} title="你的新工作区已准备就绪" />
        <p className="welcome">从这里添加业务页面，沿用统一的布局与交互。</p>
      </Card>
    </Page>
  )
}
function SettingsPage() {
  const appearance = useAppearance()
  return (
    <Page>
      <PageHeader title="外观设置" />
      <SettingsContent>
        <SettingsSection title="界面">
          <SettingsRow label="明暗模式">
            <Select
              aria-label="明暗模式"
              value={appearance.theme}
              onChange={(event) => appearance.setTheme(event.target.value as ThemeMode)}
            >
              <option value="system">跟随系统</option>
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </Select>
          </SettingsRow>
          <SettingsRow label="动态效果">
            <Select
              aria-label="动态效果"
              value={appearance.motion}
              onChange={(event) => appearance.setMotion(event.target.value as MotionMode)}
            >
              <option value="system">跟随系统</option>
              <option value="reduce">减少动态效果</option>
              <option value="full">完整动态效果</option>
            </Select>
          </SettingsRow>
        </SettingsSection>
      </SettingsContent>
    </Page>
  )
}
const routes: readonly AppRouteRegistration[] = [
  { id: 'home', path: '/home', component: HomePage, navigation: { label: '首页', icon: Home } },
  {
    id: 'settings',
    path: '/settings',
    component: SettingsPage,
    navigation: { label: '设置', icon: Settings, placement: 'footer' }
  }
]
const reportWindowError = (reason: unknown): void => {
  toast.error('窗口操作失败', { description: reason instanceof Error ? reason.message : '请重试' })
}
export function App() {
  return (
    <MemoryRouter>
      <Routes>
        <Route
          element={
            <AppShell
              title={config.displayName}
              subtitle={config.subtitle}
              icon={icon}
              routes={routes}
              windowControls={window.desktop?.windowControls}
              onWindowControlError={reportWindowError}
              actions={<Badge>{window.desktop ? '桌面应用' : '浏览器预览'}</Badge>}
            />
          }
        >
          <Route index element={<Navigate to="/home" replace />} />
          {routes.map((route) => (
            <Route key={route.id} path={route.path} element={<route.component />} />
          ))}
        </Route>
      </Routes>
      <AppToaster />
    </MemoryRouter>
  )
}
