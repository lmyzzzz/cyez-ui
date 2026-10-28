import { useState } from 'react'
import {
  ArrowUpRight,
  Copy,
  FileText,
  FolderOpen,
  Plus,
  RefreshCw,
  Trash2
} from 'lucide-react'
import {
  ActionMenu,
  ActionMenuItem,
  Badge,
  Banner,
  Button,
  Card,
  CheckField,
  ConfirmModal,
  EmptyState,
  Field,
  IconButton,
  Input,
  Modal,
  ModalDescription,
  ModalPanel,
  Page,
  PageHeader,
  ResizableSplit,
  Select,
  SettingsContent,
  SettingsRow,
  SettingsSection,
  Switch,
  TableContainer,
  TaskProgress,
  Textarea,
  Toolbar,
  modalBackdropClassName,
  toast,
  useAppearance,
  type ThemeMode,
  type MotionMode
} from '@series/ui'
export function Overview() {
  const [dialog, setDialog] = useState(false)
  const [name, setName] = useState('')
  const [created, setCreated] = useState<string[]>([])
  return (
    <Page>
      <PageHeader
        title="工作概览"
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setDialog(true)}>
            新建项目
          </Button>
        }
      />
      <p className="page-intro">一套熟悉的界面，为不同的工作而准备。</p>
      <div className="stats-grid">
        {[
          ['项目', String(12 + created.length), '保持井然有序'],
          ['最近更新', '04', '继续上次的工作'],
          ['已完成', '08', '每一步都有记录']
        ].map(([label, value, hint]) => (
          <Card key={label}>
            <span className="stat-label">{label}</span>
            <strong className="stat-value">{value}</strong>
            <span className="stat-hint">{hint}</span>
          </Card>
        ))}
      </div>
      <div className="section-heading">
        <h2>最近项目</h2>
        <Badge tone="accent">示例内容</Badge>
      </div>
      <TableContainer>
        <table>
          <thead>
            <tr>
              <th>名称</th>
              <th>状态</th>
              <th>最近更新</th>
              <th>
                <span className="sr-only">操作</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              ...created.map((value) => [value, '进行中', '刚刚']),
              ['工作区整理', '进行中', '今天 10:24'],
              ['设计素材归档', '已完成', '昨天 16:40'],
              ['周度计划', '待处理', '昨天 09:15']
            ].map(([title, status, time]) => (
              <tr key={title}>
                <td>
                  <span className="file-cell">
                    <FileText size={18} />
                    {title}
                  </span>
                </td>
                <td>
                  <Badge
                    tone={
                      status === '已完成' ? 'success' : status === '进行中' ? 'accent' : 'neutral'
                    }
                  >
                    {status}
                  </Badge>
                </td>
                <td className="muted">{time}</td>
                <td>
                  <IconButton
                    icon={ArrowUpRight}
                    label={'查看' + title}
                    onClick={() => toast.info(title, { description: '此项目用于展示界面与交互。' })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableContainer>
      <div className="bottom-grid">
        <Card>
          <h2>保持一致的工作方式</h2>
          <p>导航、表单和反馈延续同一套规则。切换主题后，熟悉的操作仍在原来的位置。</p>
          <Button
            icon={RefreshCw}
            onClick={() => toast.success('已刷新', { description: '当前示例内容已是最新。' })}
          >
            刷新概览
          </Button>
        </Card>
        <Banner tone="success">所有示例组件已就绪。成功状态保持独立的语义颜色。</Banner>
      </div>
      <Modal open={dialog} onOpenChange={setDialog} overlayClassName={modalBackdropClassName}>
        <ModalPanel title="新建项目" close={() => setDialog(false)}>
          <ModalDescription>创建一个仅用于本次预览的项目。</ModalDescription>
          <Field label="项目名称" htmlFor="project-name">
            <Input
              id="project-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="例如：资料整理"
            />
          </Field>
          <div className="dialog-actions">
            <Button variant="ghost" onClick={() => setDialog(false)}>
              取消
            </Button>
            <Button
              variant="primary"
              disabled={!name.trim()}
              onClick={() => {
                setCreated((values) => [name.trim(), ...values])
                setName('')
                setDialog(false)
                toast.success('项目已创建')
              }}
            >
              创建项目
            </Button>
          </div>
        </ModalPanel>
      </Modal>
    </Page>
  )
}
export function Components() {
  const [confirm, setConfirm] = useState(false)
  const [enabled, setEnabled] = useState(true)
  return (
    <Page>
      <PageHeader title="组件" actions={<Badge>界面示例</Badge>} />
      <p className="page-intro">观察同一套组件在不同品牌和明暗模式下的表现。</p>
      <div className="component-grid">
        <Card>
          <h2>操作与反馈</h2>
          <Toolbar>
            <Button variant="primary" icon={Plus} onClick={() => toast.success('操作成功')}>
              主要操作
            </Button>
            <Button onClick={() => toast.info('普通通知')}>次要操作</Button>
            <Button variant="ghost" onClick={() => toast.info('轻量操作')}>
              轻量操作
            </Button>
            <Button disabled>不可用</Button>
          </Toolbar>
          <Toolbar className="spaced">
            <Button variant="danger" icon={Trash2} onClick={() => setConfirm(true)}>
              删除示例
            </Button>
            <ActionMenu label="更多操作">
              <ActionMenuItem icon={Copy} onSelect={() => toast.info('已选择复制')}>
                复制
              </ActionMenuItem>
              <ActionMenuItem icon={Trash2} danger onSelect={() => setConfirm(true)}>
                删除
              </ActionMenuItem>
            </ActionMenu>
            <IconButton
              icon={RefreshCw}
              label="刷新示例"
              onClick={() => toast.success('示例已刷新')}
            />
          </Toolbar>
        </Card>
        <Card>
          <h2>表单</h2>
          <Field label="名称" htmlFor="sample-name" hint="标签、提示与输入框遵循共同样式。">
            <Input id="sample-name" placeholder="输入名称" />
          </Field>
          <Field label="分类" htmlFor="sample-category">
            <Select id="sample-category">
              <option>日常工作</option>
              <option>个人项目</option>
            </Select>
          </Field>
          <Switch
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            label="启用提醒"
          />
          <CheckField label="保留副本" defaultChecked />
        </Card>
        <Card>
          <h2>状态提示</h2>
          <div className="stack">
            <Banner tone="success">操作已完成。</Banner>
            <Banner tone="warning">有一项内容需要确认。</Banner>
            <Banner tone="error">暂时无法完成此操作。</Banner>
            <Banner tone="info">可以随时调整外观偏好。</Banner>
          </div>
        </Card>
        <Card>
          <h2>任务进度</h2>
          <TaskProgress
            label="示例任务"
            items={[
              { id: '1', label: '准备内容', status: 'completed' },
              { id: '2', label: '整理文件', status: 'running' },
              { id: '3', label: '生成结果', status: 'waiting' }
            ]}
          />
        </Card>
      </div>
      <Card className="spaced">
        <h2>可调整分栏</h2>
        <ResizableSplit initialSize={300} minFirst={180} minSecond={180} label="调整示例分栏">
          <EmptyState icon={FolderOpen} title="在这里选择项目" />
          <div className="split-detail">
            <Field label="备注" htmlFor="sample-notes">
              <Textarea
                id="sample-notes"
                rows={4}
                placeholder="拖拽分隔线，或聚焦后使用左右方向键。"
              />
            </Field>
          </div>
        </ResizableSplit>
      </Card>
      <ConfirmModal
        open={confirm}
        title="删除这条示例？"
        message="该操作只演示确认流程，不会删除磁盘文件。"
        danger
        confirmLabel="确认删除"
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false)
          toast.success('示例已删除')
        }}
      />
    </Page>
  )
}
export function Appearance() {
  const appearance = useAppearance()
  return (
    <Page>
      <PageHeader
        title="外观设置"
        actions={
          <Button icon={RefreshCw} onClick={appearance.reset}>
            恢复默认
          </Button>
        }
      />
      <p className="page-intro">选择适合当前环境的显示方式。</p>
      <SettingsContent>
        <SettingsSection title="界面" description="这些偏好会在当前浏览器中保存。">
          <SettingsRow label="明暗模式" description="跟随系统时，界面会响应系统外观变化。">
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
          <SettingsRow label="动态效果" description="控制页面过渡、提示与加载动画。">
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
        <SettingsSection title="当前外观">
          <SettingsRow label="显示状态" description="品牌配色由主题样式文件提供。">
            <Badge tone="accent">{appearance.resolvedTheme === 'dark' ? '深色' : '浅色'}</Badge>
            <Badge>{appearance.reducedMotion ? '减少动态效果' : '完整动态效果'}</Badge>
          </SettingsRow>
        </SettingsSection>
      </SettingsContent>
    </Page>
  )
}
