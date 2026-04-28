import { useState, useMemo, Fragment } from 'react'
import { useStore } from '../../store/useStore'
import { useT } from '../../i18n/useT'
import { CheckCircle2 } from 'lucide-react'

const STATUS_OPTS = [
  { value: 'ready', cls: 'bg-surface-green text-brand-green border-brand-green' },
  { value: 'maintenance', cls: 'bg-surface-orange text-brand-orange border-brand-orange' },
  { value: 'unavailable', cls: 'bg-surface-red text-brand-red border-brand-red' },
  { value: 'contracted', cls: 'bg-surface-blue text-brand-mid border-brand-mid' },
]

export default function TugReadinessLog() {
  const t = useT()
  const lang = useStore(s => s.lang)
  const tugs = useStore(s => s.tugs)
  const readiness = useStore(s => s.readiness)
  const setTugStatus = useStore(s => s.setTugStatus)
  const date = useStore(s => s.date)
  const shift = useStore(s => s.shift)
  const setShift = useStore(s => s.setShift)
  const [savedAt, setSavedAt] = useState(null)
  const [recorder, setRecorder] = useState('Somchai Donklaang')

  const groups = useMemo(() => {
    const map = {}
    tugs.forEach(tg => {
      const key = tg.groupName || 'Other'
      if (!map[key]) map[key] = []
      map[key].push(tg)
    })
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  }, [tugs])

  const counts = { ready: 0, maintenance: 0, unavailable: 0, contracted: 0 }
  tugs.forEach(tg => {
    const st = readiness[tg.code]?.status
    if (counts[st] !== undefined) counts[st]++
  })

  return (
    <div className="p-6">
      <header className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">{t('tr.title')}</h1>
          <p className="text-sm text-slate-500">{t('tr.sub')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <div className="label">{t('common.date')}</div>
            <input type="date" className="input w-auto" value={date} readOnly />
          </div>
          <div>
            <div className="label">{t('common.shift')}</div>
            <select className="input w-auto" value={shift} onChange={e => setShift(e.target.value)}>
              <option value="morning">{t('shift.morning')}</option>
              <option value="afternoon">{t('shift.afternoon')}</option>
              <option value="night">{t('shift.night')}</option>
            </select>
          </div>
          <div>
            <div className="label">{t('common.recordedBy')}</div>
            <input className="input w-40" value={recorder} onChange={e => setRecorder(e.target.value)} />
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="pill bg-surface-green text-brand-green border border-brand-green">{counts.ready} {t('status.ready')}</span>
        <span className="pill bg-surface-orange text-brand-orange border border-brand-orange">{counts.maintenance} {t('status.maintenance')}</span>
        <span className="pill bg-surface-red text-brand-red border border-brand-red">{counts.unavailable} {t('status.unavailable')}</span>
        <span className="pill bg-surface-blue text-brand-mid border border-brand-mid">{counts.contracted} {t('status.contracted')}</span>
        <button
          onClick={() => setSavedAt(new Date().toLocaleTimeString())}
          className="btn btn-primary ml-auto"
        >
          <CheckCircle2 size={14} /> {t('common.save')}
        </button>
      </div>

      {savedAt && <div className="mb-3 text-xs text-brand-green">{t('tr.saved')} — {savedAt}</div>}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="th">Tug</th>
              <th className="th">HP / Size</th>
              <th className="th w-48">Status</th>
              <th className="th">{t('tr.remarks')}</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(([groupName, list]) => (
              <Fragment key={groupName}>
                <tr className="bg-slate-100">
                  <td className="td font-semibold text-brand-dark" colSpan={4}>{groupName} — {list.length}</td>
                </tr>
                {list.map(tg => {
                  const st = readiness[tg.code] || { status: 'ready', remark: '' }
                  const opt = STATUS_OPTS.find(o => o.value === st.status) || STATUS_OPTS[0]
                  return (
                    <tr key={tg.code}>
                      <td className="td">
                        <div className="font-mono font-bold">{tg.code}</div>
                        <div className="text-[10px] text-slate-500">{tg.name}</div>
                      </td>
                      <td className="td text-xs">{tg.hp} HP · {tg.site}</td>
                      <td className="td">
                        <select
                          className={`text-xs px-2 py-1 rounded border-2 font-semibold ${opt.cls}`}
                          value={st.status}
                          onChange={e => setTugStatus(tg.code, e.target.value, st.remark)}
                        >
                          {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{t(`status.${o.value}`)}</option>)}
                        </select>
                      </td>
                      <td className="td">
                        <input
                          className="input text-xs"
                          placeholder={lang === 'en' ? 'Add remarks…' : 'ระบุหมายเหตุ…'}
                          value={st.remark}
                          onChange={e => setTugStatus(tg.code, st.status, e.target.value)}
                        />
                      </td>
                    </tr>
                  )
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
