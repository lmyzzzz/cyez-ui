import { createContext, useContext, useState } from 'react'
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell, AppToaster, Select, type AppRouteRegistration } from '@series/ui'
import { LayoutDashboard, Shapes, Settings } from 'lucide-react'
import { Overview, Components, Appearance } from './Pages'
import { brands, type Brand } from './brands'
export type { Brand } from './brands'
export const BrandContext = createContext<{ brand: Brand; setBrand(value: Brand): void }>({
  brand: 'teal',
  setBrand: () => {}
})
export const useBrand = () => useContext(BrandContext)
const routes: readonly AppRouteRegistration[] = [
  {
    id: 'overview',
    path: '/overview',
    component: Overview,
    navigation: { label: '概览', icon: LayoutDashboard, order: 0 }
  },
  {
    id: 'components',
    path: '/components',
    component: Components,
    navigation: { label: '组件', icon: Shapes, order: 1 }
  },
  {
    id: 'appearance',
    path: '/appearance',
    component: Appearance,
    navigation: { label: '外观设置', icon: Settings, placement: 'footer' }
  }
]
export function App() {
  const [brand, updateBrand] = useState<Brand>(() =>
    document.documentElement.dataset.brand === 'violet' ? 'violet' : 'teal'
  )
  const setBrand = (value: Brand): void => {
    document.documentElement.dataset.brand = value
    localStorage.setItem('series:showcase:brand', value)
    updateBrand(value)
  }
  const identity = brands[brand]
  return (
    <BrandContext.Provider value={{ brand, setBrand }}>
      <MemoryRouter>
        <Routes>
          <Route
            element={
              <AppShell
                title={identity.name}
                icon={identity.icon}
                subtitle="预览"
                routes={routes}
                actions={
                  <Select
                    aria-label="品牌主题"
                    value={brand}
                    onChange={(event) => setBrand(event.target.value as Brand)}
                  >
                    {Object.entries(brands).map(([id, value]) => (
                      <option key={id} value={id}>
                        {value.label}
                      </option>
                    ))}
                  </Select>
                }
              />
            }
          >
            <Route index element={<Navigate to="/overview" replace />} />
            {routes.map((route) => (
              <Route key={route.id} path={route.path} element={<route.component />} />
            ))}
          </Route>
        </Routes>
        <AppToaster />
      </MemoryRouter>
    </BrandContext.Provider>
  )
}
