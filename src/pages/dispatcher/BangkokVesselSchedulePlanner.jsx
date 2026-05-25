import { useState, useMemo } from 'react'
import { useStore } from '../../store/useStore'
import { useT } from '../../i18n/useT'
import {
  Ship, AlertTriangle, Edit, CheckCircle2, X, Plus, Trash2,
  ShieldCheck, Send, LayoutGrid, List, Moon,
} from 'lucide-react'

const STATUS_STYLES = {
  published: 'bg-surface-green text-brand-green border-brand-green',
  'fleet-confirmed': 'bg-surface-teal text-brand-teal border-brand-teal',
  'no-tug': 'bg-surface-red text-brand-red border-brand-red',
  draft: 'bg-slate-100 text-slate-600 border-slate-300',
}

const BERTH_TYPE_LABEL = {
  wharf: { en: 'Wharf', th: 'ท่าเทียบ' },
  dolphin: { en: 'Mid-River Dolphin', th: 'หลักกลางน้ำ' },
  buoy: { en: 'Buoy Mooring', th: 'ทุ่นผูกเรือ' },
  anchor: { en: 'Anchorage', th: 'ทอดสมอ' },
}

export default function BangkokVesselSchedulePlanner() {
  const t = useT()
  const lang = useStore(s => s.lang)
  const bangkokSchedule = useStore(s => s.bangkokSchedule)
  const bangkokAllocations = useStore(s => s.bangkokAllocations)
  const tugs = useStore(s => s.tugs)
  const readiness = useStore(s => s.readiness)
  const dummy = useStore(s => s.bangkokDummy)
  const addBangkokMovement = useStore(s => s.addBangkokMovement)
  const updateBangkokMovement = useStore(s => s.updateBangkokMovement)
  const removeBangkokMovement = useStore(s => s.removeBangkokMovement)
  const allocateBangkokTugs = useStore(s => s.allocateBangkokTugs)
  const unallocateBangkok = useStore(s => s.unallocateBangkok)
  const runBangkokFleetConfirm = useStore(s => s.runBangkokFleetConfirm)
  const postBangkokSchedule = useStore(s => s.postBangkokSchedule)

  const bkkTugs = useMemo(() => tugs.filter(t => t.site === 'BKK'), [tugs])

  const [editId, setEditId] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editMovementId, setEditMovementId] = useState(null)
  const [view, setView] = useState('list')
  const [toast, setToast] = useState(null)

  const { groups, counts } = useMemo(() => {
    const byType = { wharf: [], dolphin: [], buoy: [], anchor: [] }
    bangkokSchedule.forEach(m => {
      const type = m.berthType || 'wharf'
      ;(byType[type] || byType.wharf).push(m)
    })
    const countBy = k => bangkokSchedule.filter(m => m.planStatus === k).length
    return {
      groups: byType,
      counts: {
        total: bangkokSchedule.length,
        berth: bangkokSchedule.filter(m => m.operation === 'berth').length,
        unberth: bangkokSchedule.filter(m => m.operation === 'unberth').length,
        draft: countBy('draft'),
        fleetConfirmed: countBy('fleet-confirmed'),
        published: countBy('published'),
        noTug: countBy('no-tug'),
        allocated: Object.keys(bangkokAllocations).length,
      },
    }
  }, [bangkokSchedule, bangkokAllocations])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const handleFleetConfirm = () => {
    runBangkokFleetConfirm()
    showToast(t('plan.fleetConfirm.done'))
  }
  const handlePost = () => {
    if (!confirm(t('plan.post.confirm'))) return
    postBangkokSchedule()
    showToast(t('plan.post.done'))
  }
  const handleDelete = (id) => {
    if (!confirm(lang === 'en' ? 'Remove this vessel from schedule?' : 'ลบเรือนี้จากตาราง?')) return
    removeBangkokMovement(id)
  }

  const editingMovement = editMovementId ? bangkokSchedule.find(m => m.id === editMovementId) : null

  return (
    <div className="p-6">
      <header className="mb-4 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">
            {t('bvsp.title')}
            <span className="ml-2 text-sm font-normal text-brand-mid">· {dummy.port}</span>
          </h1>
          <p className="text-sm text-slate-500">{t('bvsp.sub')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setEditMovementId(null); setShowAdd(true) }} className="btn btn-primary">
            <Plus size={14} /> {t('bvsp.add')}
          </button>
          <button
            onClick={handleFleetConfirm}
            disabled={counts.draft === 0 && counts.noTug === 0}
            className={`btn ${counts.draft + counts.noTug > 0 ? 'btn-orange' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            <ShieldCheck size={14} /> {t('plan.fleetConfirm')}
            {counts.draft + counts.noTug > 0 && <span className="ml-1 bg-white/30 px-1 rounded text-[10px]">{counts.draft + counts.noTug}</span>}
          </button>
          <button
            onClick={handlePost}
            disabled={counts.fleetConfirmed === 0}
            className={`btn ${counts.fleetConfirmed > 0 ? 'btn-primary' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            <Send size={14} /> {t('plan.post')}
            {counts.fleetConfirmed > 0 && <span className="ml-1 bg-white/30 px-1 rounded text-[10px]">{counts.fleetConfirmed}</span>}
          </button>
          <div className="w-px h-6 bg-slate-300 mx-1" />
          <div className="flex border border-slate-300 rounded overflow-hidden">
            <button onClick={() => setView('list')} className={`px-2 py-1.5 text-xs flex items-center gap-1 ${view === 'list' ? 'bg-brand-dark text-white' : 'bg-white text-slate-600'}`}>
              <List size={12} /> {t('plan.view.list')}
            </button>
            <button onClick={() => setView('matrix')} className={`px-2 py-1.5 text-xs flex items-center gap-1 ${view === 'matrix' ? 'bg-brand-dark text-white' : 'bg-white text-slate-600'}`}>
              <LayoutGrid size={12} /> {t('plan.view.matrix')}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 mb-3 items-center">
        <Pill color="bg-brand-dark" icon={Ship}>{counts.total} {t('vsp.pill.vessels')}</Pill>
        <Pill color="bg-brand-green">{counts.berth} {t('vsp.pill.berth')}</Pill>
        <Pill color="bg-brand-orange">{counts.unberth} {t('vsp.pill.unberth')}</Pill>
        <span className="mx-2 text-slate-300">|</span>
        {counts.draft > 0 && <Pill color="bg-slate-500">{counts.draft} {t('plan.status.draft')}</Pill>}
        {counts.fleetConfirmed > 0 && <Pill color="bg-brand-teal"><ShieldCheck size={10} /> {counts.fleetConfirmed} {t('plan.status.fleetConfirmed')}</Pill>}
        {counts.noTug > 0 && <Pill color="bg-brand-red"><AlertTriangle size={10} /> {counts.noTug} {t('plan.status.noTug')}</Pill>}
        {counts.published > 0 && <Pill color="bg-brand-green"><CheckCircle2 size={10} /> {counts.published} {t('plan.status.published')}</Pill>}
      </div>

      {bangkokSchedule.length === 0 ? (
        <div className="card p-12 text-center">
          <Ship size={32} className="mx-auto text-slate-300 mb-3" />
          <div className="text-sm text-slate-500 mb-3">{t('bvsp.empty')}</div>
          <button onClick={() => { setEditMovementId(null); setShowAdd(true) }} className="btn btn-primary inline-flex">
            <Plus size={14} /> {t('bvsp.addFirst')}
          </button>
        </div>
      ) : view === 'list' ? (
        <ListView
          groups={groups}
          allocations={bangkokAllocations}
          setEditId={setEditId}
          unallocate={unallocateBangkok}
          onEditMovement={(id) => { setEditMovementId(id); setShowAdd(true) }}
          onDelete={handleDelete}
          t={t}
          lang={lang}
        />
      ) : (
        <MatrixView
          schedule={bangkokSchedule}
          allocations={bangkokAllocations}
          tugs={bkkTugs}
          t={t}
          lang={lang}
        />
      )}

      {editId && (
        <AllocationModal
          movement={bangkokSchedule.find(m => m.id === editId)}
          currentAlloc={bangkokAllocations[editId]}
          tugs={bkkTugs}
          readiness={readiness}
          onSave={(alloc) => { allocateBangkokTugs(editId, alloc); setEditId(null) }}
          onClose={() => setEditId(null)}
          t={t}
          lang={lang}
        />
      )}

      {showAdd && (
        <ManualEntryModal
          dummy={dummy}
          existing={editingMovement}
          onSave={(m) => {
            if (editingMovement) {
              updateBangkokMovement(editingMovement.id, m)
              showToast(lang === 'en' ? 'Vessel updated' : 'แก้ไขเรือเรียบร้อย')
            } else {
              addBangkokMovement(m)
              showToast(lang === 'en' ? 'Vessel added' : 'เพิ่มเรือเรียบร้อย')
            }
            setShowAdd(false)
            setEditMovementId(null)
          }}
          onClose={() => { setShowAdd(false); setEditMovementId(null) }}
          t={t}
          lang={lang}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-brand-dark text-white px-4 py-3 rounded-lg shadow-xl z-50 flex items-center gap-2">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}
    </div>
  )
}

function ListView({ groups, allocations, setEditId, unallocate, onEditMovement, onDelete, t, lang }) {
  const order = ['wharf', 'dolphin', 'buoy', 'anchor']
  let startIdx = 1
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="th w-8">#</th>
            <th className="th">{t('vsp.col.vessel')}</th>
            <th className="th">Status</th>
            <th className="th">Op</th>
            <th className="th">{t('vsp.col.grt')}</th>
            <th className="th">{t('vsp.col.loa')}</th>
            <th className="th">{t('vsp.col.arrTime')}</th>
            <th className="th">{t('vsp.col.depTime')}</th>
            <th className="th">{t('vsp.col.terminal')}</th>
            <th className="th">{t('vsp.col.tug')}</th>
            <th className="th">{t('vsp.col.pilot')}</th>
            <th className="th">{t('vsp.col.agent')}</th>
            <th className="th">{t('vsp.col.draft')}</th>
            <th className="th">{t('vsp.col.remark')}</th>
            <th className="th w-24">Action</th>
          </tr>
        </thead>
        <tbody>
          {order.map(key => {
            const list = groups[key] || []
            if (list.length === 0) return null
            const label = BERTH_TYPE_LABEL[key][lang]
            const section = (
              <GroupSection
                key={key}
                label={label}
                list={list}
                startIdx={startIdx}
                allocations={allocations}
                setEditId={setEditId}
                onEditMovement={onEditMovement}
                onDelete={onDelete}
                unallocate={unallocate}
                t={t}
              />
            )
            startIdx += list.length
            return section
          })}
        </tbody>
      </table>
    </div>
  )
}

function MatrixView({ schedule, allocations, tugs, t, lang }) {
  const getBangkokOverlaps = useStore(s => s.getBangkokOverlaps)
  const overlaps = useMemo(() => getBangkokOverlaps(), [schedule, allocations, getBangkokOverlaps])

  const allocatedTugSet = useMemo(() => {
    const s = new Set()
    Object.values(allocations).forEach(a => {
      (a.tugCodes || []).forEach(c => s.add(c))
      if (a.standbyCode) s.add(a.standbyCode)
      if (a.pilotBoat) s.add(a.pilotBoat)
      if (a.ropeBoat) s.add(a.ropeBoat)
    })
    return s
  }, [allocations])

  const tugCols = useMemo(() => tugs.filter(tg => allocatedTugSet.has(tg.code)), [tugs, allocatedTugSet])
  const sortedSchedule = [...schedule].sort((a, b) => String(a.scheduledTime).localeCompare(String(b.scheduledTime)))

  function cellContent(movement, tugCode) {
    const a = allocations[movement.id]
    if (!a) return null
    if ((a.tugCodes || []).includes(tugCode)) return { type: 'main', label: '●' }
    if (a.standbyCode === tugCode) return { type: 'standby', label: 'S' }
    if (a.pilotBoat === tugCode) return { type: 'pilot', label: 'P' }
    if (a.ropeBoat === tugCode) return { type: 'rope', label: 'R' }
    return null
  }

  function isCellOverlapping(movementId, tugCode) {
    const movs = overlaps.byMovement[movementId]
    return movs && movs.has(tugCode)
  }

  const cellClasses = {
    main: 'bg-brand-dark text-white',
    standby: 'bg-amber-200 text-amber-900',
    pilot: 'bg-sky-200 text-sky-900',
    rope: 'bg-emerald-200 text-emerald-900',
  }

  const conflictCount = Object.keys(overlaps.byTug).length

  if (tugCols.length === 0) {
    return (
      <div className="card p-12 text-center text-sm text-slate-400">
        {lang === 'en' ? 'No tugs allocated yet. Allocate in List View, then switch here to see the matrix.' : 'ยังไม่มีการจัดสรรเรือทัก'}
      </div>
    )
  }

  return (
    <div className="card overflow-x-auto">
      <table className="text-xs border-collapse">
        <thead>
          <tr>
            <th className="th sticky left-0 z-10 bg-slate-100 min-w-[180px]">{t('vsp.col.vessel')}</th>
            <th className="th sticky left-[180px] z-10 bg-slate-100">Time</th>
            <th className="th sticky left-[240px] z-10 bg-slate-100">Terminal</th>
            {tugCols.map(tg => (
              <th key={tg.code} className="th text-center min-w-[48px]" title={`${tg.name} · ${tg.groupName} · ${tg.hp} HP`}>
                <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                  {tg.code}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedSchedule.map(m => (
            <tr key={m.id} className="hover:bg-slate-50">
              <td className="td sticky left-0 bg-white font-semibold">
                {m.vesselName}
                <div className="text-[10px] text-slate-500">
                  {m.operation === 'berth' ? '◀ IN' : 'OUT ▶'} · LOA {m.loa}m
                </div>
              </td>
              <td className="td sticky left-[180px] bg-white font-mono">
                {m.scheduledTime}
                {m.isOvernight && <Moon size={10} className="inline ml-1 text-indigo-500" />}
              </td>
              <td className="td sticky left-[240px] bg-white text-[11px]">{m.terminal}</td>
              {tugCols.map(tg => {
                const c = cellContent(m, tg.code)
                const isOverlap = c && isCellOverlapping(m.id, tg.code)
                return (
                  <td key={tg.code} className={`td text-center p-0.5 ${isOverlap ? 'bg-red-50' : ''}`}>
                    {c && (
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded font-bold ${cellClasses[c.type]} ${isOverlap ? 'ring-2 ring-red-500 ring-offset-1' : ''}`}
                        title={isOverlap ? `⚠ Time-window conflict for ${tg.code}` : undefined}
                      >
                        {c.label}
                      </span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-slate-200 p-3 text-xs text-slate-600 flex items-center gap-4 flex-wrap">
        <span>Legend:</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-brand-dark"></span> Tug (main)</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-amber-200"></span> Standby</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-sky-200"></span> Pilot Boat</span>
        <span className="flex items-center gap-1"><Moon size={12} className="text-indigo-500" /> Overnight</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded ring-2 ring-red-500 bg-white"></span> Overlap conflict</span>
        {conflictCount > 0 && (
          <span className="ml-auto text-red-600 font-semibold flex items-center gap-1">
            <AlertTriangle size={12} /> {conflictCount} {lang === 'en' ? 'tug(s) with time conflicts' : 'เรือทัก ที่เวลาทับซ้อน'}
          </span>
        )}
      </div>
    </div>
  )
}

function ManualEntryModal({ dummy, existing, onSave, onClose, t, lang }) {
  const isEdit = !!existing
  const [form, setForm] = useState(() => {
    if (existing) {
      return {
        vesselName: existing.vesselName || '',
        flag: existing.flag || 'TH',
        imo: existing.imo || '',
        grt: existing.grt || '',
        loa: existing.loa || '',
        operation: existing.operation || 'berth',
        scheduledTime: existing.scheduledTime || '08:00',
        terminal: existing.terminal || '',
        berthType: existing.berthType || 'wharf',
        pilot: existing.pilot || '',
        agent: existing.agent || '',
        agentTel: existing.agentTel || '',
        draftF: existing.draftF || '',
        draftM: existing.draftM || '',
        draftA: existing.draftA || '',
        remark: existing.remark || '',
      }
    }
    return {
      vesselName: '',
      flag: 'TH',
      imo: '',
      grt: '',
      loa: '',
      operation: 'berth',
      scheduledTime: '08:00',
      terminal: dummy.terminals[0]?.name || '',
      berthType: dummy.terminals[0]?.berthType || 'wharf',
      pilot: '',
      agent: '',
      agentTel: '',
      draftF: '',
      draftM: '',
      draftA: '',
      remark: '',
    }
  })

  // When vessel selected from dropdown, prefill GRT/LOA/IMO/flag
  const onPickVessel = (name) => {
    const v = dummy.vessels.find(x => x.name === name)
    if (v) setForm(f => ({ ...f, vesselName: v.name, flag: v.flag, imo: v.imo, grt: v.grt, loa: v.loa }))
    else setForm(f => ({ ...f, vesselName: name }))
  }

  const onPickTerminal = (terminalName) => {
    const term = dummy.terminals.find(x => x.name === terminalName)
    setForm(f => ({
      ...f,
      terminal: terminalName,
      berthType: term?.berthType || f.berthType,
    }))
  }

  const onPickAgent = (agentName) => {
    const a = dummy.agents.find(x => x.name === agentName)
    setForm(f => ({ ...f, agent: agentName, agentTel: a?.tel || f.agentTel }))
  }

  const canSave = form.vesselName && form.terminal && form.scheduledTime && form.loa

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <header className="bg-brand-dark text-white p-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="font-bold">
            {isEdit ? (lang === 'en' ? 'Edit Vessel' : 'แก้ไขเรือ') : t('bvsp.modal.title')}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded"><X size={20} /></button>
        </header>

        <div className="p-5 space-y-4">
          <section>
            <div className="text-xs font-bold text-slate-600 mb-2">{t('bvsp.section.vessel')}</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Field label={t('vsp.col.vessel')} required>
                <select
                  value={dummy.vessels.find(v => v.name === form.vesselName) ? form.vesselName : '__custom'}
                  onChange={e => {
                    const v = e.target.value
                    if (v === '__custom') setForm(f => ({ ...f, vesselName: '' }))
                    else onPickVessel(v)
                  }}
                  className="input"
                >
                  <option value="__custom">{lang === 'en' ? '— Custom (enter below) —' : '— กรอกเอง —'}</option>
                  {dummy.vessels.map(v => (
                    <option key={v.imo} value={v.name}>{v.name} ({v.flag} · IMO {v.imo})</option>
                  ))}
                </select>
                {!dummy.vessels.find(v => v.name === form.vesselName) && (
                  <input
                    type="text"
                    value={form.vesselName}
                    onChange={e => setForm(f => ({ ...f, vesselName: e.target.value }))}
                    placeholder={lang === 'en' ? 'Vessel name' : 'ชื่อเรือ'}
                    className="input mt-1"
                  />
                )}
              </Field>
              <Field label={lang === 'en' ? 'Flag' : 'ธงเรือ'}>
                <input type="text" value={form.flag} onChange={e => setForm(f => ({ ...f, flag: e.target.value.toUpperCase() }))} className="input" maxLength={3} />
              </Field>
              <Field label="IMO">
                <input type="text" value={form.imo} onChange={e => setForm(f => ({ ...f, imo: e.target.value }))} className="input" />
              </Field>
              <Field label={t('vsp.col.grt')}>
                <input type="number" value={form.grt} onChange={e => setForm(f => ({ ...f, grt: e.target.value ? Number(e.target.value) : '' }))} className="input" />
              </Field>
              <Field label={`${t('vsp.col.loa')} (m)`} required>
                <input type="number" value={form.loa} onChange={e => setForm(f => ({ ...f, loa: e.target.value ? Number(e.target.value) : '' }))} className="input" />
              </Field>
              <Field label={lang === 'en' ? 'Operation' : 'การปฏิบัติงาน'} required>
                <select value={form.operation} onChange={e => setForm(f => ({ ...f, operation: e.target.value }))} className="input">
                  <option value="berth">{t('common.berth')}</option>
                  <option value="unberth">{t('common.unberth')}</option>
                </select>
              </Field>
            </div>
          </section>

          <section>
            <div className="text-xs font-bold text-slate-600 mb-2">{t('bvsp.section.berth')}</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Field label={t('vsp.col.terminal')} required>
                <select value={form.terminal} onChange={e => onPickTerminal(e.target.value)} className="input">
                  <option value="">— {lang === 'en' ? 'Select terminal' : 'เลือกท่า'} —</option>
                  {dummy.terminals.map(t2 => (
                    <option key={t2.code} value={t2.name}>{t2.name}</option>
                  ))}
                </select>
              </Field>
              <Field label={lang === 'en' ? 'Berth Type' : 'ประเภทท่า'}>
                <select value={form.berthType} onChange={e => setForm(f => ({ ...f, berthType: e.target.value }))} className="input">
                  {dummy.berthTypes.map(b => (
                    <option key={b.code} value={b.code}>{lang === 'en' ? b.en : b.th}</option>
                  ))}
                </select>
              </Field>
              <Field label={lang === 'en' ? 'Scheduled Time' : 'เวลานัด'} required>
                <input type="time" value={form.scheduledTime} onChange={e => setForm(f => ({ ...f, scheduledTime: e.target.value }))} className="input" />
              </Field>
            </div>
          </section>

          <section>
            <div className="text-xs font-bold text-slate-600 mb-2">{t('bvsp.section.party')}</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Field label={t('vsp.col.pilot')}>
                <select value={form.pilot} onChange={e => setForm(f => ({ ...f, pilot: e.target.value }))} className="input">
                  <option value="">— {lang === 'en' ? 'Select pilot' : 'เลือกนำร่อง'} —</option>
                  {dummy.pilots.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </Field>
              <Field label={lang === 'en' ? 'Agent' : 'ตัวแทน'}>
                <select value={form.agent} onChange={e => onPickAgent(e.target.value)} className="input">
                  <option value="">— {lang === 'en' ? 'Select agent' : 'เลือกตัวแทน'} —</option>
                  {dummy.agents.map(a => (
                    <option key={a.name} value={a.name}>{a.name}</option>
                  ))}
                </select>
              </Field>
              <Field label={lang === 'en' ? 'Agent Tel' : 'โทร'}>
                <input type="text" value={form.agentTel} onChange={e => setForm(f => ({ ...f, agentTel: e.target.value }))} className="input" />
              </Field>
            </div>
          </section>

          <section>
            <div className="text-xs font-bold text-slate-600 mb-2">{t('bvsp.section.draft')}</div>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              <Field label={lang === 'en' ? 'Fore' : 'หัวเรือ'}>
                <input type="number" step="0.1" value={form.draftF} onChange={e => setForm(f => ({ ...f, draftF: e.target.value }))} className="input" />
              </Field>
              <Field label={lang === 'en' ? 'Mid' : 'กลาง'}>
                <input type="number" step="0.1" value={form.draftM} onChange={e => setForm(f => ({ ...f, draftM: e.target.value }))} className="input" />
              </Field>
              <Field label={lang === 'en' ? 'Aft' : 'ท้าย'}>
                <input type="number" step="0.1" value={form.draftA} onChange={e => setForm(f => ({ ...f, draftA: e.target.value }))} className="input" />
              </Field>
            </div>
            <div className="mt-3">
              <Field label={t('vsp.col.remark')}>
                <textarea value={form.remark} onChange={e => setForm(f => ({ ...f, remark: e.target.value }))} className="input" rows={2} />
              </Field>
            </div>
          </section>
        </div>

        <footer className="p-4 border-t flex justify-between items-center gap-2 bg-slate-50 sticky bottom-0">
          <div className="text-xs text-slate-500">
            {lang === 'en'
              ? 'Tug requirements will be auto-calculated from LOA + berth type using MOD(TUGBKK) rules.'
              : 'จะคำนวณจำนวนเรือทักอัตโนมัติจาก LOA และประเภทท่า ตามกฎ MOD(TUGBKK)'}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn btn-secondary">{t('common.cancel')}</button>
            <button
              onClick={() => canSave && onSave(form)}
              disabled={!canSave}
              className={`btn ${canSave ? 'btn-primary' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              <CheckCircle2 size={14} /> {isEdit ? t('common.save') : t('bvsp.modal.add')}
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold text-slate-600 block mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  )
}

function GroupSection({ label, list, startIdx, allocations, setEditId, onEditMovement, onDelete, t, unallocate }) {
  return (
    <>
      <tr className="bg-slate-200">
        <td className="td font-semibold text-brand-dark" colSpan={15}>
          {label} — {list.length} {t('vsp.pill.vessels')}
        </td>
      </tr>
      {list.map((m, i) => (
        <MovementRow
          key={m.id}
          m={m}
          idx={startIdx + i}
          alloc={allocations[m.id]}
          onAllocate={() => setEditId(m.id)}
          onEdit={() => onEditMovement(m.id)}
          onDelete={() => onDelete(m.id)}
          onClear={() => unallocate(m.id)}
          t={t}
        />
      ))}
    </>
  )
}

function MovementRow({ m, idx, alloc, onAllocate, onEdit, onDelete, onClear, t }) {
  const tugList = alloc ? (alloc.tugCodes || []) : []
  const standby = alloc?.standbyCode
  const pilot = alloc?.pilotBoat
  const rope = alloc?.ropeBoat
  const r = m.required || {}
  const needed = m.operation === 'berth' ? (r.tugsIn || 0) : (r.tugsOut || 0)
  const hasEnoughTugs = tugList.length >= needed
  const planStatus = m.planStatus || 'draft'
  const statusLabel = {
    draft: t('plan.status.draft'),
    'fleet-confirmed': t('plan.status.fleetConfirmed'),
    'no-tug': t('plan.status.noTug'),
    published: t('plan.status.published'),
  }[planStatus]

  return (
    <tr className="hover:bg-surface-blue/40">
      <td className="td text-center text-slate-400">{idx}</td>
      <td className="td font-semibold">
        <div className="flex items-center gap-1">
          {m.vesselName}
          {m.isOvernight && <Moon size={12} className="text-indigo-500" title="Overnight" />}
        </div>
        <div className="text-[10px] text-slate-500">{m.flag} {m.imo && `· IMO ${m.imo}`}</div>
      </td>
      <td className="td">
        <span className={`pill border ${STATUS_STYLES[planStatus]}`}>{statusLabel}</span>
      </td>
      <td className="td">
        <span className={`pill ${m.operation === 'berth' ? 'bg-surface-green text-brand-green' : 'bg-surface-orange text-brand-orange'}`}>
          {m.operation === 'berth' ? t('common.berth') : t('common.unberth')}
        </span>
      </td>
      <td className="td">{m.grt?.toLocaleString?.() || m.grt}</td>
      <td className="td">{m.loa}</td>
      <td className="td">{m.operation === 'berth' ? m.scheduledTime : ''}</td>
      <td className="td">{m.operation === 'unberth' ? m.scheduledTime : ''}</td>
      <td className="td">{m.terminal}</td>
      <td className="td">
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {tugList.map(c => <TugChip key={c} code={c} variant="main" />)}
          {standby && <TugChip code={standby} variant="standby" />}
          {pilot && <TugChip code={pilot} variant="pilot" />}
          {rope && <TugChip code={rope} variant="rope" />}
          {!alloc && (
            <span className="text-xs text-red-600 font-semibold">
              Need {needed} × {r.tugSize || '—'}
            </span>
          )}
          {alloc && !hasEnoughTugs && <AlertTriangle size={14} className="text-red-600" />}
        </div>
      </td>
      <td className="td text-xs">{m.pilot}</td>
      <td className="td text-xs">
        <div>{m.agent}</div>
        <div className="text-slate-500">{m.agentTel}</div>
      </td>
      <td className="td text-xs">{m.draftF || '—'}/{m.draftM || '—'}/{m.draftA || '—'}</td>
      <td className="td text-xs text-slate-500 max-w-[140px]">{m.remark}</td>
      <td className="td">
        <div className="flex gap-1">
          <button onClick={onAllocate} className="p-1.5 bg-brand-mid text-white rounded hover:bg-brand-dark" title="Allocate tugs">
            <Edit size={12} />
          </button>
          <button onClick={onEdit} className="p-1.5 bg-slate-200 text-slate-700 rounded hover:bg-slate-300" title="Edit vessel">
            <Edit size={12} />
          </button>
          {alloc && (
            <button onClick={onClear} className="p-1.5 bg-slate-300 text-slate-700 rounded hover:bg-slate-400" title="Clear allocation">
              <X size={12} />
            </button>
          )}
          <button onClick={onDelete} className="p-1.5 bg-brand-red/80 text-white rounded hover:bg-brand-red" title="Delete">
            <Trash2 size={12} />
          </button>
        </div>
      </td>
    </tr>
  )
}

function TugChip({ code, variant }) {
  const cls = {
    main: 'bg-brand-dark text-white',
    standby: 'bg-amber-100 text-amber-800 border border-amber-300',
    pilot: 'bg-sky-100 text-sky-800 border border-sky-300',
    rope: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
  }[variant]
  return <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${cls}`}>{code}</span>
}

function Pill({ color, icon: Icon, children }) {
  return (
    <span className={`${color} text-white pill`}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  )
}

function AllocationModal({ movement, currentAlloc, tugs, readiness, onSave, onClose, t, lang }) {
  const [sel, setSel] = useState(() => ({
    tugCodes: currentAlloc?.tugCodes || [],
    pilotBoat: currentAlloc?.pilotBoat || '',
    ropeBoat: currentAlloc?.ropeBoat || '',
    standbyCode: currentAlloc?.standbyCode || '',
  }))

  const r = movement.required || {}
  const needed = movement.operation === 'berth' ? (r.tugsIn || 0) : (r.tugsOut || 0)
  const sizeFilter = r.tugSize

  const readyTugs = tugs.filter(tg => readiness[tg.code]?.status === 'ready')
  const primaryPool = readyTugs.filter(tg => {
    if (!sizeFilter) return true
    return (tg.groupName || '').toLowerCase().includes(String(sizeFilter).toLowerCase())
  })
  const pilotPool = readyTugs.filter(tg => tg.groupName === 'Pilot Boat')

  const toggleTug = (code) => {
    setSel(s => s.tugCodes.includes(code)
      ? { ...s, tugCodes: s.tugCodes.filter(c => c !== code) }
      : { ...s, tugCodes: [...s.tugCodes, code] })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <header className="bg-brand-dark text-white p-4 flex items-center justify-between sticky top-0">
          <div>
            <h2 className="font-bold text-lg">{movement.vesselName}</h2>
            <p className="text-xs text-white/70">{movement.terminal} · {movement.scheduledTime} · {movement.operation === 'berth' ? t('common.berth') : t('common.unberth')}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded"><X size={20} /></button>
        </header>
        <div className="p-5 space-y-4">
          <section className="bg-surface-blue p-3 rounded">
            <div className="text-xs font-bold text-brand-dark mb-1">
              {lang === 'en' ? 'Required (MOD(TUGBKK))' : 'จำนวนตามกฎ MOD(TUGBKK)'}
            </div>
            <div className="text-sm grid grid-cols-2 md:grid-cols-4 gap-2">
              <div><span className="text-slate-500">Tugs:</span> <b>{needed} × {r.tugSize || '—'}</b></div>
              <div><span className="text-slate-500">Min HP:</span> <b>{r.minHp || '—'}</b></div>
              <div><span className="text-slate-500">Pilot Boat:</span> <b>{r.pilotBoat || 1}</b></div>
              <div><span className="text-slate-500">Berth Type:</span> <b>{r.berthType || '—'}</b></div>
            </div>
          </section>

          <Picker
            label={`${t('vsp.col.tug')} (${sel.tugCodes.length}/${needed})`}
            items={primaryPool}
            multi
            selected={sel.tugCodes}
            onToggle={toggleTug}
            lang={lang}
          />
          <Picker
            label={`Standby (${r.standby || 0})`}
            items={primaryPool}
            multi={false}
            selected={sel.standbyCode}
            onToggle={(c) => setSel(s => ({ ...s, standbyCode: s.standbyCode === c ? '' : c }))}
            lang={lang}
          />
          <Picker
            label={`${t('size.pilot')} (${r.pilotBoat || 1})`}
            items={pilotPool}
            multi={false}
            selected={sel.pilotBoat}
            onToggle={(c) => setSel(s => ({ ...s, pilotBoat: s.pilotBoat === c ? '' : c }))}
            lang={lang}
          />
        </div>
        <footer className="p-4 border-t flex justify-end gap-2 sticky bottom-0 bg-white">
          <button onClick={onClose} className="btn btn-secondary">{t('common.cancel')}</button>
          <button onClick={() => onSave(sel)} className="btn btn-primary"><CheckCircle2 size={14} /> {t('common.confirm')}</button>
        </footer>
      </div>
    </div>
  )
}

function Picker({ label, items, multi, selected, onToggle, lang }) {
  return (
    <section>
      <div className="text-xs font-bold text-slate-600 mb-2">{label}</div>
      {items.length === 0 && (
        <div className="text-xs text-red-500">
          {lang === 'en' ? 'No Bangkok tugs available of this type.' : 'ไม่มีเรือทักของกรุงเทพฯ ประเภทนี้'}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {items.map(tg => {
          const isSel = multi ? selected.includes(tg.code) : selected === tg.code
          return (
            <button
              key={tg.code}
              onClick={() => onToggle(tg.code)}
              className={`text-xs px-2 py-1 rounded border-2 font-mono font-bold transition ${
                isSel ? 'bg-brand-green text-white border-brand-green' : 'bg-white text-slate-700 border-slate-300 hover:border-brand-mid'
              }`}
              title={`${tg.name} · ${tg.hp} HP · ${tg.groupName}`}
            >
              {tg.code}
              <span className="ml-1 text-[9px] opacity-70">{tg.hp}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
