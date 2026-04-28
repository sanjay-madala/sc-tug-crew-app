import { useNavigate } from 'react-router-dom'
import { Monitor, User, Users, Globe, RotateCcw, Ship, MapPin, FileText } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useT } from '../i18n/useT'

export default function Landing() {
  const navigate = useNavigate()
  const t = useT()
  const lang = useStore(s => s.lang)
  const setLang = useStore(s => s.setLang)
  const resetDemo = useStore(s => s.resetDemo)
  const schedule = useStore(s => s.schedule)
  const tugs = useStore(s => s.tugs)
  const crew = useStore(s => s.crew)

  const personas = [
    { to: '/dispatcher', icon: Monitor, title: t('persona.dispatcher'), sub: t('persona.dispatcher.sub'), color: 'bg-brand-dark', accent: 'border-brand-orange' },
    { to: '/captain', icon: User, title: t('persona.captain'), sub: t('persona.captain.sub'), color: 'bg-brand-teal', accent: 'border-brand-green' },
    { to: '/crew', icon: Users, title: t('persona.crew'), sub: t('persona.crew.sub'), color: 'bg-brand-mid', accent: 'border-brand-orange' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-dark to-slate-800 text-white">
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <Ship size={24} className="text-brand-orange" />
          <div>
            <div className="text-lg font-bold">{t('app.title')}</div>
            <div className="text-xs text-white/60">SC Group Marine Tug Division — Map Ta Phut & Bangkok</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === 'en' ? 'th' : 'en')}
            aria-label="Toggle language"
            className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-sm"
          >
            <Globe size={14} /> {lang === 'en' ? 'ไทย' : 'English'}
          </button>
          <button
            onClick={() => { if (confirm('Reset demo data?')) resetDemo() }}
            className="flex items-center gap-2 px-3 py-2 bg-brand-red/70 hover:bg-brand-red rounded text-sm"
          >
            <RotateCcw size={14} /> {t('app.reset')}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <section className="mb-10">
          <h1 className="text-3xl font-bold mb-2">{lang === 'en' ? 'Select a persona' : 'เลือกบทบาท'}</h1>
          <p className="text-white/70 text-sm">
            {lang === 'en'
              ? 'End-to-end tug management demo — dispatcher allocates, captain + crew update status on mobile; all screens stay in sync.'
              : 'เดโมการจัดการเรือทักแบบครบวงจร — ผู้จัดเรือจัดสรรงาน นายเรือและลูกเรืออัปเดตสถานะผ่านมือถือ ทุกหน้าจอซิงค์กันอัตโนมัติ'}
          </p>
        </section>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {personas.map(p => (
            <button
              key={p.to}
              onClick={() => navigate(p.to)}
              className={`${p.color} hover:opacity-95 rounded-xl p-6 text-left border-b-4 ${p.accent} transition transform hover:-translate-y-1`}
            >
              <p.icon size={28} className="mb-3 text-white" />
              <div className="text-xl font-bold">{p.title}</div>
              <div className="text-sm text-white/70 mt-1">{p.sub}</div>
            </button>
          ))}
        </div>

        <section className="bg-white/5 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-brand-orange uppercase tracking-wide mb-3">{lang === 'en' ? 'Today\'s seed data' : 'ข้อมูลวันนี้'}</h2>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <Stat icon={Ship} label={lang === 'en' ? 'Tug fleet' : 'เรือทัก'} value={tugs.length} />
            <Stat icon={MapPin} label={lang === 'en' ? 'Movements today' : 'งานวันนี้'} value={schedule.length} />
            <Stat icon={Users} label={lang === 'en' ? 'Crew seeded' : 'พนักงาน'} value={crew.length} />
            <Stat icon={FileText} label={lang === 'en' ? 'Port terminals' : 'ท่าเทียบ'} value={14} />
          </div>
        </section>

        <footer className="mt-10 text-center text-xs text-white/40">
          Hitachi Digital Services · Aarini · 2026
        </footer>
      </main>
    </div>
  )
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center">
        <Icon size={18} className="text-brand-orange" />
      </div>
      <div>
        <div className="text-xl font-bold">{value}</div>
        <div className="text-xs text-white/60">{label}</div>
      </div>
    </div>
  )
}
