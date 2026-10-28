import { app, BrowserWindow, Menu, nativeTheme, session } from 'electron'
import { createWindowControlHost } from '@series/electron/main'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import config from '../../app.config.json'
const here = dirname(fileURLToPath(import.meta.url))
app.setName(config.appName)
app.setAppUserModelId(config.appId)
if (process.env.SERIES_USER_DATA_DIR) app.setPath('userData', process.env.SERIES_USER_DATA_DIR)
let host: ReturnType<typeof createWindowControlHost>
function createWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 760,
    minHeight: 560,
    show: false,
    title: config.displayName,
    autoHideMenuBar: true,
    ...(process.platform === 'win32' ? { titleBarStyle: 'hidden' as const } : { frame: false }),
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#151918' : '#ffffff',
    icon: join(app.getAppPath(), 'resources/icon.png'),
    webPreferences: {
      preload: join(here, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  })
  host.bind(window)
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  window.webContents.on('will-navigate', (event) => event.preventDefault())
  window.webContents.on('will-attach-webview', (event) => event.preventDefault())
  window.once('ready-to-show', () => window.show())
  const devUrl = process.env.ELECTRON_RENDERER_URL
  if (devUrl && !app.isPackaged) void window.loadURL(devUrl)
  else void window.loadFile(join(here, '../renderer/index.html'))
  return window
}
void app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) =>
    callback(false)
  )
  session.defaultSession.setPermissionCheckHandler(() => false)
  host = createWindowControlHost()
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
app.on('will-quit', () => host?.dispose())
