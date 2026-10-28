import '@series/ui/styles.css'
import '@series/ui/app.css'
import './styles/theme.css'
import './styles/overrides.css'
import './appearance'
import { bootstrapRenderer } from '@series/ui/bootstrap'
import config from '../../app.config.json'
import icon from './assets/icon.svg'
document.title = config.displayName
void bootstrapRenderer({
  root: document.getElementById('root')!,
  title: config.displayName,
  subtitle: config.subtitle,
  icon,
  loadApplication: () => import('./main')
})
