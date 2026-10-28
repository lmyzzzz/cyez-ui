import '@series/ui/styles.css'
import '@series/ui/app.css'
import './styles/teal.css'
import './styles/violet.css'
import './styles/overrides.css'
import { bootstrapRenderer } from '@series/ui/bootstrap'
import './appearance'
import { brands } from './brands'
const brand = localStorage.getItem('series:showcase:brand') === 'violet' ? 'violet' : 'teal'
document.documentElement.dataset.brand = brand
void bootstrapRenderer({
  root: document.getElementById('root')!,
  title: brands[brand].name,
  icon: brands[brand].icon,
  subtitle: '组件展示',
  loadApplication: () => import('./main')
})
