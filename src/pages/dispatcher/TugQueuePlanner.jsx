import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { useT } from '../../i18n/useT'
import { ArrowLeftRight, GripVertical } from 'lucide-react'

const SIZE_GROUPS = [
  { key: 'Large', label_en: 'Large Tug', label_th: 'เรือทักใหญ่', match: (n) => /large/i.test(n) },
  { key: 'Medium', label_en: 'Medium Tug', label_th: 'เรือทักกลาง', match: (n) => /middle|medium/i.test(n) },
  { key: 'Small', label_en: 'Small Tug', label_th: 'เรือทักเล็ก', match: (n) => /small/i.test(n) },
  { key: 'Pilot', label_en: 'Pilot Boat', label_th: 'เรือนำร่อง', match: (n) => /pilot/i.test(n) },
  { key: 'Rope', label_en: 'Rope Boat', label_th: 'เรือเชือก', match: (n) => /rope/i.test(n) },
]

export default function TugQueuePlanner() {
  const t = useT()
  const lang = useStore(s => s.lang)
  const tugs = useStore(s => s.tugs)
  const readiness = useStore(s => s.readiness)
  const shift = useStore(s => s.shift)
  const setShift = useStore(s => s.setShift)
  const date = useStore(s => s.date)
  const [swapSel, setSwapSel] = useState(null) // { group, tugCode }

  const readyTugs = tugs.filter(tg => readiness[tg.code]?.status === 'ready')

  const byGroup = SIZE_GROUPS.map(g => ({
    ...g,
    tugs: readyTugs.filter(tg => g.match(tg.groupName || '')),
  }))

  const shifts = [
    { key: 'morning', label: t('shift.morning'), color: 'bg-amber-100 text-amber-800 border-amber-300' },
    { key: 'afternoon', label: t('shift.afternoon'), color: 'bg-orange-100 text-orange-800 border-orange-300' },
    { key: 'night', label: t('shift.night'), color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  ]

  return (
    <div className="p-6">
      <header className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">{t('tq.title')}</h1>
          <p className="text-sm text-slate-500">{t('tq.sub')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs">
            <div className="label">{t('common.date')}</div>
            <input type="date" className="input w-auto" value={date} readOnly />
          </div>
          <div className="text-xs">
            <div className="label">{t('common.shift')}</div>
            <select className="input w-auto" value={shift} onChange={e => setShift(e.target.value)}>
              {shifts.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </header>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {byGroup.map(g => (
          <div key={g.key} className="card">
            <header className="bg-brand-dark text-white px-4 py-2.5 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm">{lang === 'en' ? g.label_en : g.label_th}</div>
                <div className="text-[11px] text-white/60">{lang === 'en' ? g.label_th : g.label_en}</div>
              </div>
              <span className="pill bg-white/10 text-white">{g.tugs.length} {t('tq.ready')}</span>
            </header>
            <div className="divide-y divide-slate-100">
              {g.tugs.map((tg, i) => {
                const isSwapSel = swapSel?.group === g.key && swapSel?.tugCode === tg.code
                return (
                  <div key={tg.code} className={`flex items-center gap-2 px-3 py-2 text-sm ${isSwapSel ? 'bg-amber-50' : 'hover:bg-slate-50'}`}>
                    <span className={`w-6 h-6 flex items-center justify-center rounded text-[11px] font-bold ${i === 0 ? 'bg-brand-green text-white' : i === 1 ? 'bg-brand-mid text-white' : i === 2 ? 'bg-brand-orange text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {i + 1}
                    </span>
                    <GripVertical size={12} className="text-slate-300" />
                    <div className="flex-1">
                      <div className="font-semibold">{tg.code}</div>
                      <div className="text-[10px] text-slate-500">{tg.name} · {tg.hp} HP{tg.site ? ` · ${tg.site}` : ''}</div>
                    </div>
                    <button
                      onClick={() => {
                        if (!swapSel) { setSwapSel({ group: g.key, tugCode: tg.code }); return }
                        if (swapSel.group !== g.key) { setSwapSel(null); return }
                        // swap within the group — this is a UI-level rearrangement; we keep it session-local for demo
                        setSwapSel(null)
                        alert(`Swap ${swapSel.tugCode} ↔ ${tg.code} (demo: visual only)`)
                      }}
                      className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded"
                    >
                      {isSwapSel ? 'Cancel' : t('tq.swap')}
                    </button>
                  </div>
                )
              })}
              {g.tugs.length === 0 && (
                <div className="px-3 py-6 text-center text-xs text-slate-400">—</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
