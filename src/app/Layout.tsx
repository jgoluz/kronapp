import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from '../shared/components/BottomNav'

const HIDE_NAV = ['/timer']

export function Layout() {
  const location = useLocation()
  const hideNav = HIDE_NAV.some(p => location.pathname.startsWith(p))

  return (
    <div className="flex flex-col" style={{ height: '100dvh', position: 'relative' }}>
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}
