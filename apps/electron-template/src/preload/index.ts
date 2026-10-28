import { contextBridge, ipcRenderer } from 'electron'
import { createWindowControlsBridge } from '@series/electron/preload'
contextBridge.exposeInMainWorld('desktop', {
  windowControls: createWindowControlsBridge(ipcRenderer)
})
