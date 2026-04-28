import { useState, useMemo } from 'react'
import { useStore } from '../../store/useStore'
import { useT } from '../../i18n/useT'
import { FileText, Edit3, Check, X } from 'lucide-react'

export default function CrewAssignment() {
  const t = useT()
  const lang = useStore(s => s.lang)
  const tugs = useStore(s => s.tugs)
  const crew = useStore(s => s.crew)
  const positions = useStore(s => s.positions)
  const crewAssignments = useStore(s => s.crewAssignments)
  const assignCrew = useStore(s => s.assignCrew)
  const clearCrew = useStore(s => s.clearCrew)
  const date = useStore(s => s.date)
  const shift = useStore(s => s.shift)
  const setShift = useStore(s => s.setShift)

  const [site, setSite] = useState('MTP')
  const [groupFilter, setGroupFilter] = useState('All')
  const [editing, setEditing] = useState(null)

  const siteFilteredTugs = tugs.filter(tg => tg.site === site)
  const groups = ['All', ...Array.from(new Set(siteFilteredTugs.map(tg => tg.groupName)))]
  const displayedTugs = groupFilter === 'All' ? siteFilteredTugs : siteFilteredTugs.filter(tg => tg.groupName === groupFilter)

  const crewSearchable = useMemo(() => {
    const map = new Map()
    crew.forEach(c => {
      if (!c.employeeId) return
      map.set(c.employeeId, c)
    })
    return Array.from(map.values())
  }, [crew])

  return (
    <div className="p-6">
      <header className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">{t('ca.title')}</h1>
          <p className="text-sm text-slate-500">{t('ca.sub')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <div className="label">{t('common.date')}</div>
            <input className="input w-auto" type="date" value={date} readOnly />
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
            <div className="label">{t('ca.unit')}</div>
            <select className="input w-auto" value={site} onChange={e => setSite(e.target.value)}>
              <option value="MTP">Map Ta Phut</option>
              <option value="BKK">Bangkok</option>
            </select>
          </div>
          <div>
            <div className="label">{t('ca.group')}</div>
            <select className="input w-auto" value={groupFilter} onChange={e => setGroupFilter(e.target.value)}>
              {groups.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
        </div>
      </header>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="th">{t('ca.unit')} / {t('sp.vessel')}</th>
              <th className="th">{t('ca.group')}</th>
              {(positions[site === 'MTP' ? 'MTPP01' : 'BKKP01'] || []).map(p => (
                <th key={p.code} className="th text-center">
                  <div className="text-[11px] font-bold">{p.code}</div>
                  <div className="text-[9px] font-normal text-slate-500">{lang === 'en' ? p.en : p.th}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedTugs.map(tg => {
              const positionSet = tg.positionSet || (tg.site === 'BKK' ? 'BKKP01' : 'MTPP01')
              const ps = positions[positionSet] || []
              return (
                <tr key={tg.code}>
                  <td className="td">
                    <div className="font-mono font-bold">{tg.code}</div>
                    <div className="text-[10px] text-slate-500">{tg.name}</div>
                  </td>
                  <td className="td text-xs">{tg.groupName}</td>
                  {ps.map(p => {
                    const key = `${date}:${shift}:${tg.code}:${p.code}`
                    const a = crewAssignments[key]
                    const isEditing = editing === key
                    return (
                      <td key={p.code} className="td text-center">
                        {isEditing ? (
                          <CrewPicker
                            crew={crewSearchable}
                            onPick={(c) => {
                              assignCrew(key, { employeeId: c.employeeId, fullName: c.fullName, licenceDoc: 'e-unit://doc/' + c.employeeId })
                              setEditing(null)
                            }}
                            onClose={() => setEditing(null)}
                          />
                        ) : a ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <div className="text-[11px] font-semibold">{a.fullName}</div>
                            {a.licenceDoc && (
                              <a href="#" onClick={e => e.preventDefault()} title={t('ca.viewDoc')} className="text-[9px] text-brand-mid flex items-center gap-0.5 hover:underline">
                                <FileText size={10} /> {t('ca.licence')}
                              </a>
                            )}
                            <div className="flex gap-1 mt-0.5">
                              <button onClick={() => setEditing(key)} className="text-slate-400 hover:text-brand-mid" title={t('common.edit')}><Edit3 size={10} /></button>
                              <button onClick={() => clearCrew(key)} className="text-slate-400 hover:text-brand-red" title={t('common.delete')}><X size={10} /></button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setEditing(key)} className="text-[11px] text-slate-400 hover:text-brand-mid border border-dashed border-slate-300 px-2 py-1 rounded">
                            + {t('common.add')}
                          </button>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CrewPicker({ crew, onPick, onClose }) {
  const [q, setQ] = useState('')
  const filtered = crew.filter(c =>
    c.fullName?.toLowerCase().includes(q.toLowerCase()) ||
    String(c.employeeId).includes(q)
  ).slice(0, 10)

  return (
    <div className="text-left">
      <input autoFocus className="input text-xs w-32" placeholder="Name / ID" value={q} onChange={e => setQ(e.target.value)} />
      <div className="absolute bg-white border border-slate-300 rounded shadow-lg mt-1 z-20 max-h-60 overflow-y-auto">
        {filtered.map(c => (
          <button
            key={c.crewId}
            onClick={() => onPick(c)}
            className="block w-full text-left px-2 py-1 text-xs hover:bg-slate-100"
          >
            <div className="font-semibold">{c.fullName}</div>
            <div className="text-[10px] text-slate-500">EMP {c.employeeId} · {c.vesselName}</div>
          </button>
        ))}
        <button onClick={onClose} className="block w-full text-center text-[10px] text-slate-400 py-1 border-t">
          Cancel
        </button>
      </div>
    </div>
  )
}
