import { useState, useMemo } from 'react'
import { useStore } from '../../store/useStore'
import { useT } from '../../i18n/useT'
import { FileText, Edit3, Plus, X, Calendar, Anchor, Shield } from 'lucide-react'

export default function CrewAssignment() {
  const t = useT()
  const lang = useStore(s => s.lang)
  const tugs = useStore(s => s.tugs)
  const crewMaster = useStore(s => s.crew)
  const positions = useStore(s => s.positions)
  const permanentCrew = useStore(s => s.permanentCrew)
  const temporaryCrew = useStore(s => s.temporaryCrew)
  const setPermanentCrew = useStore(s => s.setPermanentCrew)
  const clearPermanentCrew = useStore(s => s.clearPermanentCrew)
  const addTemporaryCrew = useStore(s => s.addTemporaryCrew)
  const removeTemporaryCrew = useStore(s => s.removeTemporaryCrew)
  const date = useStore(s => s.date)
  const setDate = useStore(s => s.setDate)

  const [site, setSite] = useState('MTP')
  const [groupFilter, setGroupFilter] = useState('All')
  const [editing, setEditing] = useState(null) // { tugCode, positionCode, mode: 'permanent' | 'temporary' }

  const siteFilteredTugs = tugs.filter(tg => tg.site === site)
  const groups = ['All', ...Array.from(new Set(siteFilteredTugs.map(tg => tg.groupName)))]
  const displayedTugs = groupFilter === 'All' ? siteFilteredTugs : siteFilteredTugs.filter(tg => tg.groupName === groupFilter)

  const crewSearchable = useMemo(() => {
    const map = new Map()
    crewMaster.forEach(c => {
      if (c.fullName) map.set(c.crewId, c)
    })
    return Array.from(map.values())
  }, [crewMaster])

  // Stats
  const stats = useMemo(() => {
    let permCount = 0, tempCount = 0, emptyCount = 0
    displayedTugs.forEach(tg => {
      const ps = positions[tg.positionSet] || []
      ps.forEach(p => {
        const tempEntry = temporaryCrew.find(t => t.tugCode === tg.code && t.positionCode === p.code && t.date === date)
        if (tempEntry) tempCount++
        else if (permanentCrew[`${tg.code}:${p.code}`]) permCount++
        else emptyCount++
      })
    })
    return { permCount, tempCount, emptyCount }
  }, [displayedTugs, positions, permanentCrew, temporaryCrew, date])

  return (
    <div className="p-6">
      <header className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark flex items-center gap-2">
            <Anchor size={22} /> {t('ca.title')}
          </h1>
          <p className="text-sm text-slate-500">
            {lang === 'en'
              ? 'Permanent crew per tug — temporary reassignments override on specific dates.'
              : 'คนประจำเรือถาวร — การมอบหมายชั่วคราวจะแทนที่ในวันที่ระบุ'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <div className="label">{t('common.date')}<span className="text-[10px] font-normal text-slate-400 ml-1">({lang === 'en' ? 'for temp view' : 'สำหรับมุมมองชั่วคราว'})</span></div>
            <input className="input w-auto" type="date" value={date} onChange={e => setDate(e.target.value)} />
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

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <span className="pill bg-brand-dark text-white"><Shield size={10} /> {stats.permCount} {lang === 'en' ? 'Permanent' : 'ถาวร'}</span>
        <span className="pill bg-brand-orange text-white"><Calendar size={10} /> {stats.tempCount} {lang === 'en' ? 'Temporary today' : 'ชั่วคราววันนี้'}</span>
        <span className="pill bg-slate-300 text-slate-700">{stats.emptyCount} {lang === 'en' ? 'Empty' : 'ว่าง'}</span>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="th sticky left-0 bg-slate-100 z-10">{t('ca.unit')} / {t('sp.vessel')}</th>
              <th className="th">{t('ca.group')}</th>
              {(positions[site === 'MTP' ? 'MTPP01' : 'BKKP01'] || []).map(p => (
                <th key={p.code} className="th text-center min-w-[140px]">
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
                  <td className="td sticky left-0 bg-white">
                    <div className="font-mono font-bold">{tg.code}</div>
                    <div className="text-[10px] text-slate-500">{tg.name}</div>
                  </td>
                  <td className="td text-xs">{tg.groupName}</td>
                  {ps.map(p => {
                    const permKey = `${tg.code}:${p.code}`
                    const perm = permanentCrew[permKey]
                    const temp = temporaryCrew.find(tc =>
                      tc.tugCode === tg.code && tc.positionCode === p.code && tc.date === date
                    )
                    const isEditing = editing && editing.tugCode === tg.code && editing.positionCode === p.code

                    return (
                      <td key={p.code} className="td">
                        {isEditing ? (
                          <CrewPicker
                            mode={editing.mode}
                            crew={crewSearchable}
                            permanentName={perm?.fullName}
                            tugCode={tg.code}
                            positionCode={p.code}
                            date={date}
                            lang={lang}
                            onPickPermanent={(c) => {
                              setPermanentCrew(tg.code, p.code, {
                                employeeId: c.employeeId,
                                fullName: c.fullName,
                                licenceDoc: 'e-unit://doc/' + c.employeeId,
                              })
                              setEditing(null)
                            }}
                            onPickTemporary={(c, reason) => {
                              addTemporaryCrew({
                                date, tugCode: tg.code, positionCode: p.code,
                                employeeId: c.employeeId,
                                fullName: c.fullName,
                                licenceDoc: 'e-unit://doc/' + c.employeeId,
                                reason: reason || (lang === 'en' ? 'Temporary cover' : 'ชั่วคราว'),
                              })
                              setEditing(null)
                            }}
                            onClose={() => setEditing(null)}
                          />
                        ) : temp ? (
                          <CrewCell
                            type="temporary"
                            crew={temp}
                            permanent={perm}
                            lang={lang}
                            onReassign={() => setEditing({ tugCode: tg.code, positionCode: p.code, mode: 'temporary' })}
                            onClear={() => removeTemporaryCrew(date, tg.code, p.code)}
                            onEditPermanent={() => setEditing({ tugCode: tg.code, positionCode: p.code, mode: 'permanent' })}
                          />
                        ) : perm ? (
                          <CrewCell
                            type="permanent"
                            crew={perm}
                            lang={lang}
                            onReassign={() => setEditing({ tugCode: tg.code, positionCode: p.code, mode: 'temporary' })}
                            onClear={() => clearPermanentCrew(tg.code, p.code)}
                            onEditPermanent={() => setEditing({ tugCode: tg.code, positionCode: p.code, mode: 'permanent' })}
                          />
                        ) : (
                          <button
                            onClick={() => setEditing({ tugCode: tg.code, positionCode: p.code, mode: 'permanent' })}
                            className="text-[11px] text-slate-400 hover:text-brand-mid border border-dashed border-slate-300 px-2 py-1 rounded w-full"
                          >
                            <Plus size={10} className="inline" /> {lang === 'en' ? 'Assign permanent' : 'มอบหมายถาวร'}
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

function CrewCell({ type, crew, permanent, lang, onReassign, onClear, onEditPermanent }) {
  const isTemp = type === 'temporary'
  return (
    <div className={`relative border rounded p-1.5 ${isTemp ? 'border-brand-orange bg-orange-50' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center gap-1 mb-0.5">
        <span className={`text-[9px] font-bold uppercase tracking-wide px-1 rounded ${isTemp ? 'bg-brand-orange text-white' : 'bg-brand-dark text-white'}`}>
          {isTemp ? (lang === 'en' ? 'TEMP' : 'ชั่วคราว') : (lang === 'en' ? 'PERMANENT' : 'ถาวร')}
        </span>
      </div>
      <div className="text-[11px] font-semibold leading-tight">{crew.fullName}</div>
      <div className="text-[9px] text-slate-500">EMP {crew.employeeId || '—'}</div>
      {isTemp && permanent && (
        <div className="text-[9px] text-slate-500 italic mt-0.5">
          {lang === 'en' ? 'Reverts to ' : 'กลับเป็น '}{permanent.fullName}
        </div>
      )}
      {isTemp && crew.reason && (
        <div className="text-[9px] text-brand-orange mt-0.5">{crew.reason}</div>
      )}
      {crew.licenceDoc && (
        <a href="#" onClick={e => e.preventDefault()} className="text-[9px] text-brand-mid flex items-center gap-0.5 hover:underline mt-0.5">
          <FileText size={9} /> e-unit
        </a>
      )}
      <div className="flex gap-1 mt-1">
        {!isTemp && (
          <button onClick={onReassign} className="text-[9px] px-1 py-0.5 bg-brand-orange/10 text-brand-orange rounded hover:bg-brand-orange/20" title="Reassign temporarily">
            <Calendar size={9} className="inline" /> {lang === 'en' ? 'Temp' : 'ชั่ว'}
          </button>
        )}
        {!isTemp && (
          <button onClick={onEditPermanent} className="text-slate-400 hover:text-brand-dark" title="Edit permanent"><Edit3 size={10} /></button>
        )}
        {isTemp && (
          <button onClick={onClear} className="text-[9px] px-1 py-0.5 bg-slate-200 text-slate-600 rounded hover:bg-slate-300" title="Remove temporary">
            <X size={9} className="inline" /> {lang === 'en' ? 'Revert' : 'ยกเลิก'}
          </button>
        )}
        {!isTemp && (
          <button onClick={onClear} className="text-slate-400 hover:text-brand-red ml-auto" title="Clear permanent"><X size={10} /></button>
        )}
      </div>
    </div>
  )
}

function CrewPicker({ mode, crew, permanentName, lang, onPickPermanent, onPickTemporary, onClose }) {
  const [q, setQ] = useState('')
  const [reason, setReason] = useState('')
  const [picked, setPicked] = useState(null)
  const filtered = crew.filter(c =>
    (c.fullName || '').toLowerCase().includes(q.toLowerCase()) ||
    String(c.employeeId).includes(q)
  ).slice(0, 8)

  const isTemp = mode === 'temporary'

  return (
    <div className="absolute z-30 bg-white border-2 border-brand-mid rounded shadow-lg p-2 min-w-[240px]">
      <div className="text-[10px] font-bold uppercase tracking-wide mb-1 flex items-center gap-1">
        {isTemp ? (
          <>
            <Calendar size={10} className="text-brand-orange" />
            <span className="text-brand-orange">{lang === 'en' ? 'Temporary reassignment' : 'มอบหมายชั่วคราว'}</span>
          </>
        ) : (
          <>
            <Shield size={10} className="text-brand-dark" />
            <span className="text-brand-dark">{lang === 'en' ? 'Permanent assignment' : 'มอบหมายถาวร'}</span>
          </>
        )}
      </div>
      {isTemp && permanentName && (
        <div className="text-[10px] text-slate-500 mb-1">
          {lang === 'en' ? 'Replacing' : 'แทน'}: <b>{permanentName}</b>
        </div>
      )}
      <input
        autoFocus
        className="input text-xs mb-1 w-full"
        placeholder={lang === 'en' ? 'Search Name / ID' : 'ค้นหา ชื่อ / รหัส'}
        value={q}
        onChange={e => setQ(e.target.value)}
      />
      <div className="max-h-40 overflow-y-auto">
        {filtered.map(c => (
          <button
            key={c.crewId}
            onClick={() => {
              if (isTemp) setPicked(c)
              else onPickPermanent(c)
            }}
            className={`block w-full text-left px-2 py-1 text-xs hover:bg-slate-100 rounded ${picked?.crewId === c.crewId ? 'bg-brand-mid/10 ring-1 ring-brand-mid' : ''}`}
          >
            <div className="font-semibold">{c.fullName}</div>
            <div className="text-[9px] text-slate-500">EMP {c.employeeId} · {c.vesselName}</div>
          </button>
        ))}
        {filtered.length === 0 && <div className="text-[10px] text-slate-400 italic px-2 py-1">{lang === 'en' ? 'No matches' : 'ไม่พบ'}</div>}
      </div>
      {isTemp && picked && (
        <div className="mt-2 pt-2 border-t border-slate-200">
          <input
            className="input text-xs w-full mb-1"
            placeholder={lang === 'en' ? 'Reason (optional, e.g. sick leave)' : 'เหตุผล (ไม่บังคับ)'}
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
          <button
            onClick={() => onPickTemporary(picked, reason)}
            className="btn btn-orange w-full text-xs py-1.5"
          >
            {lang === 'en' ? 'Apply temporary' : 'ใช้มอบหมายชั่วคราว'}
          </button>
        </div>
      )}
      <button onClick={onClose} className="block w-full text-center text-[10px] text-slate-400 mt-1 py-1 border-t border-slate-100">
        {lang === 'en' ? 'Cancel' : 'ยกเลิก'}
      </button>
    </div>
  )
}
