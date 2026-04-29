import { useState, useMemo } from 'react'
import { useStore } from '../../store/useStore'
import { useT } from '../../i18n/useT'
import nextDaySchedule from '../../data/nextDayScheduleSample.json'
import {
  Anchor, Ship, AlertTriangle, Edit, CheckCircle2, X, Flame, Zap, Upload,
  ShieldCheck, Send, LayoutGrid, List, Moon, FileSpreadsheet,
} from 'lucide-react'

const INNER_BAY = ['PTT GC E1', 'PTT GC E2', 'PTT GC W2', 'TTT 1', 'TTT 2', 'TTT 3', 'TTT 2B', 'MTT 1', 'MTT 3', 'TCT 1', 'TCT 2', 'TCT 3', 'PTTGC E', 'PTTGC W', 'MTT', 'TCT', 'TTT']

function isInnerBay(terminal) {
  return INNER_BAY.some(t => terminal?.includes(t))
}

const STATUS_STYLES = {
  published: 'bg-surface-green text-brand-green border-brand-green',
  'fleet-confirmed': 'bg-surface-teal text-brand-teal border-brand-teal',
  uploaded: 'bg-surface-blue text-brand-mid border-brand-mid',
  'no-tug': 'bg-surface-red text-brand-red border-brand-red',
  draft: 'bg-slate-100 text-slate-600 border-slate-300',
}

export default function VesselSchedulePlanner() {
  const t = useT()
  const lang = useStore(s => s.lang)
  const schedule = useStore(s => s.schedule)
  const scheduleUploads = useStore(s => s.scheduleUploads)
  const allocations = useStore(s => s.allocations)
  const tugs = useStore(s => s.tugs)
  const readiness = useStore(s => s.readiness)
  const lngCapable = useStore(s => s.lngCapable)
  const allocateTugs = useStore(s => s.allocateTugs)
  const unallocate = useStore(s => s.unallocate)
  const uploadScheduleBatch = useStore(s => s.uploadScheduleBatch)
  const runFleetConfirm = useStore(s => s.runFleetConfirm)
  const postSchedule = useStore(s => s.postSchedule)

  const [editId, setEditId] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const [view, setView] = useState('list') // list | matrix
  const [toast, setToast] = useState(null)

  const { inner, outer, counts } = useMemo(() => {
    const inner = schedule.filter(m => isInnerBay(m.terminal))
    const outer = schedule.filter(m => !isInnerBay(m.terminal))
    const countBy = k => schedule.filter(m => m.planStatus === k).length
    return {
      inner, outer,
      counts: {
        total: schedule.length,
        berth: schedule.filter(m => m.operation === 'berth').length,
        unberth: schedule.filter(m => m.operation === 'unberth').length,
        inner: inner.length,
        outer: outer.length,
        allocated: Object.keys(allocations).length,
        uploaded: countBy('uploaded'),
        fleetConfirmed: countBy('fleet-confirmed'),
        published: countBy('published'),
        noTug: countBy('no-tug'),
      },
    }
  }, [schedule, allocations])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const handleFleetConfirm = () => {
    runFleetConfirm()
    showToast(t('plan.fleetConfirm.done'))
  }
  const handlePost = () => {
    if (!confirm(t('plan.post.confirm'))) return
    postSchedule()
    showToast(t('plan.post.done'))
  }

  return (
    <div className="p-6">
      <header className="mb-4 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">{t('vsp.title')}</h1>
          <p className="text-sm text-slate-500">{t('vsp.sub')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowUpload(true)} className="btn btn-secondary">
            <Upload size={14} /> {t('plan.upload')}
          </button>
          <button
            onClick={handleFleetConfirm}
            disabled={counts.uploaded === 0 && counts.noTug === 0}
            className={`btn ${counts.uploaded + counts.noTug > 0 ? 'btn-orange' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            <ShieldCheck size={14} /> {t('plan.fleetConfirm')}
            {counts.uploaded + counts.noTug > 0 && <span className="ml-1 bg-white/30 px-1 rounded text-[10px]">{counts.uploaded + counts.noTug}</span>}
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
        <Pill color="bg-brand-mid">{counts.inner} {t('common.innerBay')}</Pill>
        <Pill color="bg-brand-teal">{counts.outer} {t('common.outerBay')}</Pill>
        <span className="mx-2 text-slate-300">|</span>
        {counts.uploaded > 0 && <Pill color="bg-brand-mid"><Upload size={10} /> {counts.uploaded} {t('plan.status.uploaded')}</Pill>}
        {counts.fleetConfirmed > 0 && <Pill color="bg-brand-teal"><ShieldCheck size={10} /> {counts.fleetConfirmed} {t('plan.status.fleetConfirmed')}</Pill>}
        {counts.noTug > 0 && <Pill color="bg-brand-red"><AlertTriangle size={10} /> {counts.noTug} {t('plan.status.noTug')}</Pill>}
        {counts.published > 0 && <Pill color="bg-brand-green"><CheckCircle2 size={10} /> {counts.published} {t('plan.status.published')}</Pill>}
      </div>

      {scheduleUploads.length > 0 && (
        <div className="mb-3 text-xs text-slate-600 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded px-3 py-1.5">
          <FileSpreadsheet size={14} className="text-brand-mid" />
          {lang === 'en' ? 'Last upload' : 'อัปโหลดล่าสุด'}:
          <b>{scheduleUploads[0].filename}</b>
          <span className="text-slate-400">· {scheduleUploads[0].count} vessels · {new Date(scheduleUploads[0].at).toLocaleString()}</span>
        </div>
      )}

      {view === 'list' ? (
        <ListView
          inner={inner}
          outer={outer}
          allocations={allocations}
          setEditId={setEditId}
          unallocate={unallocate}
          t={t}
        />
      ) : (
        <MatrixView schedule={schedule} allocations={allocations} tugs={tugs} t={t} lang={lang} />
      )}

      {editId && (
        <AllocationModal
          movement={schedule.find(m => m.id === editId)}
          currentAlloc={allocations[editId]}
          tugs={tugs}
          readiness={readiness}
          lngCapable={lngCapable}
          onSave={(alloc) => { allocateTugs(editId, alloc); setEditId(null) }}
          onClose={() => setEditId(null)}
          t={t}
          lang={lang}
        />
      )}

      {showUpload && (
        <UploadModal
          onLoad={(batch) => {
            uploadScheduleBatch(batch)
            setShowUpload(false)
            showToast(`${batch.movements.length} ${lang === 'en' ? 'vessels uploaded' : 'เรือถูกอัปโหลด'}`)
          }}
          onClose={() => setShowUpload(false)}
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

function ListView({ inner, outer, allocations, setEditId, unallocate, t }) {
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
            <th className="th w-20">Action</th>
          </tr>
        </thead>
        <tbody>
          {[['inner', inner, t('common.innerBay')], ['outer', outer, t('common.outerBay')]].map(([key, list, label]) =>
            list.length ? (
              <GroupSection key={key} label={label} list={list} startIdx={key === 'inner' ? 1 : inner.length + 1}
                allocations={allocations} setEditId={setEditId} t={t} unallocate={unallocate} />
            ) : null
          )}
        </tbody>
      </table>
    </div>
  )
}

function MatrixView({ schedule, allocations, tugs, t, lang }) {
  const getOverlaps = useStore(s => s.getOverlaps)
  const overlaps = useMemo(() => getOverlaps(), [schedule, allocations, getOverlaps])

  // Build set of allocated tug codes (across all movements)
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
                <div className="rotate-180 writing-mode-vertical-rl" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
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
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-emerald-200"></span> Rope Boat</span>
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

function UploadModal({ onLoad, onClose, t, lang }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <header className="bg-brand-dark text-white p-4 flex items-center justify-between">
          <h2 className="font-bold">{t('plan.upload.title')}</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded"><X size={20} /></button>
        </header>
        <div className="p-5">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-start gap-2">
            <FileSpreadsheet size={20} className="text-brand-mid flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <div><b>{t('plan.upload.from')}:</b> {nextDaySchedule.source}</div>
              <div><b>{lang === 'en' ? 'File' : 'ไฟล์'}:</b> {nextDaySchedule.filename}</div>
              <div><b>{t('plan.upload.received')}:</b> {new Date(nextDaySchedule.receivedAt).toLocaleString()}</div>
              <div><b>{lang === 'en' ? 'Target date' : 'วันที่ปฏิบัติการ'}:</b> {nextDaySchedule.date}</div>
              <div><b>{t('plan.upload.extractedVessels')}:</b> {nextDaySchedule.movements.length}</div>
              <div className="mt-2 pt-2 border-t border-blue-200">
                <b>{lang === 'en' ? 'Includes pre-assigned tugs' : 'รวมการจัดสรรเรือทักล่วงหน้า'}:</b>{' '}
                {nextDaySchedule.movements.filter(m => m.tugAssignment).length} / {nextDaySchedule.movements.length}{' '}
                {lang === 'en' ? '(applied automatically — overlaps flagged in Matrix view)' : '(ใช้งานอัตโนมัติ — ตรวจการทับซ้อนในมุมมองเมทริกซ์)'}
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-600 mb-2">
            {lang === 'en' ? 'Preview of vessels extracted from the incoming schedule:' : 'รายการเรือที่ดึงมาจากแผน:'}
          </div>
          <div className="card overflow-x-auto max-h-[50vh]">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="th">#</th>
                  <th className="th">{t('vsp.col.vessel')}</th>
                  <th className="th">Op</th>
                  <th className="th">{t('vsp.col.grt')}</th>
                  <th className="th">LOA</th>
                  <th className="th">Time</th>
                  <th className="th">Terminal</th>
                  <th className="th">Pilot</th>
                  <th className="th">Pre-assigned Tugs</th>
                  <th className="th">Remark</th>
                </tr>
              </thead>
              <tbody>
                {nextDaySchedule.movements.map((m, i) => {
                  const h = parseInt(String(m.scheduledTime).split(':')[0], 10)
                  const isNight = h >= 22 || h < 6
                  const tugList = m.tugAssignment?.tugCodes?.join(', ') || '—'
                  return (
                    <tr key={m.id}>
                      <td className="td text-center text-slate-400">{i + 1}</td>
                      <td className="td font-semibold">{m.vesselName}</td>
                      <td className="td"><span className={`pill ${m.operation === 'berth' ? 'bg-surface-green text-brand-green' : 'bg-surface-orange text-brand-orange'}`}>{m.operation === 'berth' ? 'IN' : 'OUT'}</span></td>
                      <td className="td">{m.grt?.toLocaleString?.()}</td>
                      <td className="td">{m.loa}</td>
                      <td className="td font-mono">
                        {m.scheduledTime}
                        {isNight && <Moon size={10} className="inline ml-1 text-indigo-500" title="Overnight" />}
                      </td>
                      <td className="td">{m.terminal}</td>
                      <td className="td">{m.pilot}</td>
                      <td className="td font-mono text-[10px] text-slate-700">{tugList}</td>
                      <td className="td text-[10px] text-slate-500 max-w-[140px]">{m.remark}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        <footer className="p-4 border-t flex justify-between items-center gap-2 bg-slate-50">
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <Moon size={12} className="text-indigo-500" />
            {lang === 'en' ? 'Overnight operations (22:00–05:59) flagged automatically' : 'งานข้ามคืน (22:00–05:59) ถูกทำเครื่องหมายอัตโนมัติ'}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn btn-secondary">{t('common.cancel')}</button>
            <button
              onClick={() => onLoad(nextDaySchedule)}
              className="btn btn-primary"
            >
              <Upload size={14} /> {t('plan.upload.extract')}
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}

function GroupSection({ label, list, startIdx, allocations, setEditId, t, unallocate }) {
  return (
    <>
      <tr className="bg-slate-200">
        <td className="td font-semibold text-brand-dark" colSpan={15}>
          {label} — {list.length} {t('vsp.pill.vessels')}
        </td>
      </tr>
      {list.map((m, i) => <MovementRow key={m.id} m={m} idx={startIdx + i} alloc={allocations[m.id]}
        onEdit={() => setEditId(m.id)} onClear={() => unallocate(m.id)} t={t} />)}
    </>
  )
}

function MovementRow({ m, idx, alloc, onEdit, onClear, t }) {
  const tugList = alloc ? (alloc.tugCodes || []) : []
  const standby = alloc?.standbyCode
  const pilot = alloc?.pilotBoat
  const rope = alloc?.ropeBoat
  const r = m.required || {}
  const needed = m.operation === 'berth' ? (r.tugsIn || 0) : (r.tugsOut || 0)
  const hasEnoughTugs = tugList.length >= needed
  const hasLngFlag = r.lngRequired
  const hasZTech = r.zTechRequired
  const hasFireCannon = r.fireCannonRequired
  const planStatus = m.planStatus || 'draft'
  const statusLabel = {
    draft: t('plan.status.draft'),
    uploaded: t('plan.status.uploaded'),
    'fleet-confirmed': t('plan.status.fleetConfirmed'),
    'no-tug': t('plan.status.noTug'),
    published: t('plan.status.published'),
  }[planStatus]

  return (
    <tr className={`hover:bg-surface-blue/40`}>
      <td className="td text-center text-slate-400">{idx}</td>
      <td className="td font-semibold">
        <div className="flex items-center gap-1">
          {m.vesselName}
          {hasLngFlag && <span title="LNG" className="text-[10px] px-1 py-0.5 bg-blue-100 text-blue-700 rounded font-bold">LNG</span>}
          {hasZTech && <Zap size={12} className="text-amber-600" />}
          {hasFireCannon && <Flame size={12} className="text-red-600" />}
          {m.isOvernight && <Moon size={12} className="text-indigo-500" title="Overnight" />}
        </div>
        <div className="text-[10px] text-slate-500">{m.flag} · IMO {m.imo}</div>
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
      <td className="td text-xs">{m.draftF}/{m.draftM}/{m.draftA}</td>
      <td className="td text-xs text-slate-500 max-w-[140px]">{m.remark}</td>
      <td className="td">
        <div className="flex gap-1">
          <button onClick={onEdit} className="p-1.5 bg-brand-mid text-white rounded hover:bg-brand-dark" title="Allocate tugs">
            <Edit size={12} />
          </button>
          {alloc && (
            <button onClick={onClear} className="p-1.5 bg-slate-300 text-slate-700 rounded hover:bg-slate-400" title="Clear">
              <X size={12} />
            </button>
          )}
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

function AllocationModal({ movement, currentAlloc, tugs, readiness, lngCapable, onSave, onClose, t, lang }) {
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
  const ropePool = readyTugs.filter(tg => tg.groupName === 'Rope Boat')

  const isLng = (movement.terminal || '').includes('PTTLNG')
  const lngList = (movement.terminal || '').includes('LMPT1') ? lngCapable.lmpt1.operation : lngCapable.lmpt2.operation
  const primaryPoolFiltered = isLng ? primaryPool.filter(tg => lngList.includes(tg.code) || lngList.includes(tg.name)) : primaryPool

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
              {lang === 'en' ? 'Required by matrix' : 'ตามตาราง'}
            </div>
            <div className="text-sm grid grid-cols-2 md:grid-cols-4 gap-2">
              <div><span className="text-slate-500">Tugs:</span> <b>{needed} × {r.tugSize || '—'}</b></div>
              <div><span className="text-slate-500">Standby:</span> <b>{r.standby || 0}</b></div>
              <div><span className="text-slate-500">Pilot Boat:</span> <b>{r.pilotBoat || 1}</b></div>
              <div><span className="text-slate-500">Rope Boat:</span> <b>{r.ropeBoat || 1}</b></div>
              <div><span className="text-slate-500">Hrs:</span> <b>{movement.operation === 'berth' ? r.hrsIn : r.hrsOut}</b></div>
              {r.lngRequired && <div className="col-span-2"><span className="pill bg-blue-100 text-blue-700">LNG — LMPT-capable tugs only</span></div>}
              {r.zTechRequired && <div className="col-span-2"><span className="pill bg-amber-100 text-amber-700">Z-Tech required</span></div>}
            </div>
          </section>

          <Picker
            label={`${t('vsp.col.tug')} (${sel.tugCodes.length}/${needed})`}
            items={primaryPoolFiltered}
            multi
            selected={sel.tugCodes}
            onToggle={toggleTug}
          />
          <Picker
            label={`Standby (${r.standby || 0})`}
            items={primaryPoolFiltered}
            multi={false}
            selected={sel.standbyCode}
            onToggle={(c) => setSel(s => ({ ...s, standbyCode: s.standbyCode === c ? '' : c }))}
          />
          <Picker
            label={`${t('size.pilot')} (${r.pilotBoat || 1})`}
            items={pilotPool}
            multi={false}
            selected={sel.pilotBoat}
            onToggle={(c) => setSel(s => ({ ...s, pilotBoat: s.pilotBoat === c ? '' : c }))}
          />
          <Picker
            label={`${t('size.rope')} (${r.ropeBoat || 1})`}
            items={ropePool}
            multi={false}
            selected={sel.ropeBoat}
            onToggle={(c) => setSel(s => ({ ...s, ropeBoat: s.ropeBoat === c ? '' : c }))}
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

function Picker({ label, items, multi, selected, onToggle }) {
  return (
    <section>
      <div className="text-xs font-bold text-slate-600 mb-2">{label}</div>
      {items.length === 0 && <div className="text-xs text-red-500">No tugs available of this type.</div>}
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
