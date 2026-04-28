import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home, Calendar, ListOrdered, Activity, CalendarDays, Users, Anchor, Globe, RotateCcw } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useT } from '../i18n/useT'

export default function DispatcherLayout() {
  const t = useT()
  const lang = useStore(s => s.lang)
  const setLang = useStore(s => s.setLang)
  const resetDemo = useStore(s => s.resetDemo)
  const navigate = useNavigate()
  const loc = useLocation()

  const navItems = [
    { to: 'schedule', icon: Calendar, label: t('nav.schedule') },
    { to: 'queue', icon: ListOrdered, label: t('nav.queue') },
    { to: 'readiness', icon: Activity, label: t('nav.readiness') },
    { to: 'shift', icon: CalendarDays, label: t('nav.shift') },
    { to: 'crew', icon: Users, label: t('nav.crewAssign') },
    { to: 'berth', icon: Anchor, label: t('nav.berth') },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-60 bg-brand-dark text-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-white/10">
          <button onClick={() => navigate('/')} className="text-sm text-white/70 hover:text-white flex items-center gap-2">
            <Home size={14} /> {t('nav.home')}
          </button>
          <div className="mt-2 text-sm font-bold text-white">{t('app.title')}</div>
          <div className="text-xs text-white/60 mt-0.5">{t('persona.dispatcher')}</div>
        </div>
        <nav className="flex-1 py-3">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm transition ${
                  isActive ? 'bg-brand-mid text-white border-l-4 border-brand-orange' : 'text-white/80 hover:bg-white/5 border-l-4 border-transparent'
                }`
              }
            >
              <item.icon size={16} /> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-2">
          <button
            onClick={() => setLang(lang === 'en' ? 'th' : 'en')}
            aria-label="Toggle language"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-sm font-semibold"
          >
            <Globe size={14} /> {lang === 'en' ? 'ไทย' : 'EN'}
          </button>
          <button
            onClick={() => { if (confirm('Reset demo data to initial state?')) resetDemo() }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-brand-red/80 hover:bg-brand-red rounded text-sm font-semibold"
          >
            <RotateCcw size={14} /> {t('app.reset')}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
