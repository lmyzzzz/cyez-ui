import tealIcon from './assets/teal.svg'
import violetIcon from './assets/violet.svg'

export type Brand = 'teal' | 'violet'
export const brands = {
  teal: { name: '青屿工作台', icon: tealIcon, label: '青绿 · 原系列' },
  violet: { name: '星序工作台', icon: violetIcon, label: '靛紫 · 示例系列' }
}
