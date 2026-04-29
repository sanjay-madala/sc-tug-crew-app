import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { useT } from '../../i18n/useT'
import { translations } from '../../i18n/translations'
import { ChevronLeft, Globe, Home as HomeIcon, RotateCcw, MapPin, Camera, FileText, CheckSquare, Square, Anchor, Clock, Briefcase } from 'lucide-react'

const STAGE_KEYS = ['stage.1', 'stage.2', 'stage.3', 'stage.4', 'stage.5', 'stage.6', 'stage.7', 'stage.8', 'stage.9', 'stage.10']
const GPS_STAGES = [3, 4, 8, 9] // 0-indexed: Departed, Arrived, Let Go, Complete

const DEMO_GPS = [
  null, null, null,
  '12.7124° N, 101.1502° E',
  '12.7089° N, 101.1578° E',
  null, null, null,
  '12.7065° N, 101.1612° E',
  '12.7124° N, 101.1502° E',
]

// Job Types from client captain_app.html
const JOB_TYPES = ['berth_assist', 'unberth_assist', 'shifting', 'escort', 'emergency', 'anchor_assist', 'standby', 'other']

// Compute initials from a Thai or English name (last word, first 2 chars)
function initials(name) {
  if (!name) return '?'
  const trimmed = String(name).trim()
  // For Thai (no spaces), take first 2 chars
  if (!/\s/.test(trimmed)) return trimmed.slice(0, 2)
  // For English, take first letter of first 2 words
  const parts = trimmed.split(/\s+/).filter(Boolean)
  return (parts[0]?.[0] || '') + (parts[1]?.[0] || '')
}

function getCurrentShiftLabel(lang) {
  const h = new Date().getHours()
  if (h >= 6 && h < 14) return lang === 'en' ? 'Morning Shift' : 'กะเช้า'
  if (h >= 14 && h < 22) return lang === 'en' ? 'Afternoon Shift' : 'กะบ่าย'
  return lang === 'en' ? 'Night Shift' : 'กะดึก'
}

export default function CaptainApp() {
  const navigate = useNavigate()
  const t = useT()
  const lang = useStore(s => s.lang)
  const setLang = useStore(s => s.setLang)
  const resetDemo = useStore(s => s.resetDemo)
  const tugs = useStore(s => s.tugs)
  const schedule = useStore(s => s.schedule)
  const allocations = useStore(s => s.allocations)
  const jobStatuses = useStore(s => s.jobStatuses)
  const setJobStage = useStore(s => s.setJobStage)
  const setJobDetail = useStore(s => s.setJobDetail)
  const getCrewForTug = useStore(s => s.getCrewForTug)
  const date = useStore(s => s.date)
  const shift = useStore(s => s.shift)
  const captainSession = useStore(s => s.captainSession)
  const setCaptainSession = useStore(s => s.setCaptainSession)

  // Session fields are persisted in the store so refresh keeps user's context
  const { selectedTug, currentMovementId, view, standbyReason } = captainSession
  const setSelectedTug = (v) => setCaptainSession({ selectedTug: v })
  const setCurrentMovementId = (v) => setCaptainSession({ currentMovementId: v })
  const setView = (v) => setCaptainSession({ view: v })
  const setStandbyReason = (v) => setCaptainSession({ standbyReason: v })

  const myJobs = useMemo(() => {
    if (!selectedTug) return []
    return schedule.filter(m => {
      // Captain only sees Published movements (after dispatcher hits Post)
      if (m.planStatus && m.planStatus !== 'published') return false
      const a = allocations[m.id]
      if (!a) return false
      return (a.tugCodes || []).includes(selectedTug)
        || a.standbyCode === selectedTug
    })
  }, [selectedTug, schedule, allocations])

  const currentMovement = schedule.find(m => m.id === currentMovementId)
  const jobKey = currentMovementId && selectedTug ? `${currentMovementId}:${selectedTug}` : null
  const jobStatus = jobKey ? (jobStatuses[jobKey] || { stage: -1, timestamps: {}, gps: {}, notes: {}, crewConfirmed: false, checklist: {}, jobType: '', crewAttendance: {} }) : null

  // Captain identity — derived from the MS (Master) permanent crew of the selected tug
  const masterCrew = useMemo(() => {
    if (!selectedTug) return null
    const roster = getCrewForTug(selectedTug, date)
    return roster.find(r => r.position?.code === 'MS')?.crew || null
  }, [selectedTug, getCrewForTug, date])

  const openJob = (mId) => {
    setCurrentMovementId(mId)
    if (!jobStatuses[`${mId}:${selectedTug}`]) {
      setJobStage(mId, selectedTug, 0) // Assignment received
    }
    setView('detail')
  }

  const advance = (targetStage, extra = {}) => {
    const gps = GPS_STAGES.includes(targetStage) ? DEMO_GPS[targetStage] : null
    const newExtra = gps ? { gps: { ...(jobStatus?.gps || {}), [targetStage]: gps }, ...extra } : extra
    setJobStage(currentMovementId, selectedTug, targetStage, newExtra)
    if (targetStage === 9) {
      setView('summary')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-4">
      <div className="w-full max-w-md mb-3 flex items-center justify-between text-white">
        <button onClick={() => navigate('/')} className="flex items-center gap-1 text-sm hover:text-brand-orange">
          <HomeIcon size={14} /> {t('nav.home')}
        </button>
        <div className="text-xs text-white/60">Captain Mobile Demo</div>
        <div className="flex gap-2">
          <button onClick={() => setLang(lang === 'en' ? 'th' : 'en')} aria-label="Toggle language" className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded text-xs">
            <Globe size={12} /> {lang === 'en' ? 'ไทย' : 'EN'}
          </button>
          <button onClick={() => { if (confirm('Reset?')) { resetDemo() } }}
            className="flex items-center gap-1 px-2 py-1 bg-brand-red/80 rounded text-xs">
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      <div className="phone-frame">
        {/* Status bar */}
        <div className="bg-brand-dark text-white h-10 flex items-center justify-between px-5 text-xs flex-shrink-0">
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span>LTE  92%</span>
        </div>
        {/* Nav */}
        <div className="bg-brand-dark text-white px-3 pb-3 flex items-center gap-2 flex-shrink-0">
          {view !== 'home' ? (
            <button onClick={() => setView('home')} className="p-1 hover:bg-white/10 rounded flex-shrink-0"><ChevronLeft size={20} /></button>
          ) : selectedTug && masterCrew ? (
            <div className="w-9 h-9 rounded-full bg-sky-200 text-sky-900 flex items-center justify-center text-[11px] font-bold flex-shrink-0" title={masterCrew.fullName}>
              {initials(masterCrew.fullName)}
            </div>
          ) : <div className="w-9 flex-shrink-0" />}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold truncate">
              {view === 'home' && !selectedTug && t('cap.selectTug')}
              {view === 'home' && selectedTug && `${selectedTug}`}
              {view === 'detail' && currentMovement?.vesselName}
              {view === 'checklist' && t('cap.preDepartureCheck')}
              {view === 'summary' && t('cap.jobComplete')}
            </div>
            {view === 'home' && selectedTug && (
              <div className="text-[10px] text-white/70 truncate">
                {masterCrew ? `${masterCrew.fullName} · ` : ''}{getCurrentShiftLabel(lang)}
              </div>
            )}
            {view === 'detail' && currentMovement && (
              <div className="text-[10px] text-white/60">SHP-{date.replace(/-/g, '').slice(2)}-{currentMovement.id.slice(-4)}</div>
            )}
          </div>
          <div className="text-[10px] text-white/60 flex-shrink-0 px-2 py-1 bg-white/10 rounded-full">
            {new Date().toLocaleDateString(lang === 'en' ? 'en-GB' : 'th-TH', { day: 'numeric', month: 'short' })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          {view === 'home' && (
            !selectedTug ? (
              <TugSelector tugs={tugs} onSelect={setSelectedTug} lang={lang} />
            ) : (
              <MyJobs
                myJobs={myJobs}
                jobStatuses={jobStatuses}
                selectedTug={selectedTug}
                onOpen={openJob}
                onChangeTug={() => setSelectedTug(null)}
                t={t}
                lang={lang}
              />
            )
          )}
          {view === 'detail' && currentMovement && jobStatus && (
            <JobDetail
              movement={currentMovement}
              jobStatus={jobStatus}
              selectedTug={selectedTug}
              allocations={allocations}
              onAdvance={advance}
              onOpenChecklist={() => setView('checklist')}
              onSetJobType={(jt) => setJobDetail(currentMovementId, selectedTug, { jobType: jt })}
              standbyReason={standbyReason}
              setStandbyReason={setStandbyReason}
              t={t}
              lang={lang}
            />
          )}
          {view === 'checklist' && currentMovement && (
            <Checklist
              movement={currentMovement}
              selectedTug={selectedTug}
              date={date}
              getCrewForTug={getCrewForTug}
              onConfirm={(crewAttendance, checklist) => {
                setJobDetail(currentMovementId, selectedTug, { crewAttendance, checklist, crewConfirmed: true })
                advance(2) // Pre-Departure Check done
                setView('detail')
              }}
              t={t}
              lang={lang}
            />
          )}
          {view === 'summary' && currentMovement && (
            <Summary movement={currentMovement} jobStatus={jobStatus} t={t} lang={lang} />
          )}
        </div>
      </div>
    </div>
  )
}

function TugSelector({ tugs, onSelect, lang }) {
  const [q, setQ] = useState('')
  // Show only tugs that a captain might pick (Large, Medium, Small, KNO series)
  const pickable = tugs.filter(tg => /large|medium|middle|small/i.test(tg.groupName || '') && (!q || tg.code.toLowerCase().includes(q.toLowerCase())))

  return (
    <div className="p-4">
      <div className="text-sm text-slate-500 mb-3">
        {lang === 'en' ? 'Pick the tug you are the Master of today.' : 'เลือกเรือทักที่คุณเป็นนายเรือวันนี้'}
      </div>
      <input className="input mb-3" placeholder={lang === 'en' ? 'Search tug code…' : 'ค้นหารหัสเรือ…'} value={q} onChange={e => setQ(e.target.value)} />
      <div className="space-y-1.5">
        {pickable.map(tg => (
          <button
            key={tg.code}
            onClick={() => onSelect(tg.code)}
            className="w-full text-left bg-white border border-slate-200 hover:border-brand-mid rounded-lg p-3 flex items-center gap-3"
          >
            <Anchor size={20} className="text-brand-mid" />
            <div className="flex-1">
              <div className="font-mono font-bold">{tg.code}</div>
              <div className="text-xs text-slate-500">{tg.name} · {tg.groupName} · {tg.hp} HP</div>
            </div>
            <div className="text-xs text-slate-400">{tg.site}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

function MyJobs({ myJobs, jobStatuses, selectedTug, onOpen, onChangeTug, t, lang }) {
  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="text-slate-600">{t('cap.today')}</div>
        <button onClick={onChangeTug} className="text-brand-mid hover:underline">{lang === 'en' ? 'Change tug' : 'เปลี่ยนเรือ'}</button>
      </div>
      {myJobs.length === 0 ? (
        <div className="text-center py-10 text-sm text-slate-400">
          {lang === 'en' ? `No jobs allocated to ${selectedTug} yet.` : `ยังไม่มีงานสำหรับ ${selectedTug}`}
          <div className="mt-2 text-xs">{lang === 'en' ? 'Dispatcher hasn\'t assigned this tug.' : 'ผู้จัดเรือยังไม่ได้จัดสรรงานให้'}</div>
        </div>
      ) : myJobs.map(m => {
        const key = `${m.id}:${selectedTug}`
        const st = jobStatuses[key]
        const stage = st?.stage ?? -1
        const done = stage >= 9
        const active = stage >= 0 && stage < 9
        return (
          <button
            key={m.id}
            onClick={() => onOpen(m.id)}
            className={`w-full text-left bg-white border-2 rounded-lg p-3 mb-2 ${done ? 'border-brand-green' : active ? 'border-brand-orange' : 'border-slate-200 hover:border-brand-mid'}`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="font-bold">{m.vesselName}</div>
              <span className={`pill ${done ? 'bg-surface-green text-brand-green' : active ? 'bg-surface-orange text-brand-orange' : 'bg-slate-100 text-slate-600'}`}>
                {done ? t('cap.jobComplete') : active ? t(STAGE_KEYS[stage]) : t('stage.1')}
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span>{m.terminal}</span>
              <span>·</span>
              <span>{m.operation === 'berth' ? t('common.berth') : t('common.unberth')}</span>
              <span>·</span>
              <span className="flex items-center gap-0.5"><Clock size={10} /> {m.scheduledTime}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function JobDetail({ movement, jobStatus, selectedTug, allocations, onAdvance, onOpenChecklist, onSetJobType, standbyReason, setStandbyReason, t, lang }) {
  const stage = jobStatus.stage
  const nextStage = stage + 1
  const alloc = allocations[movement.id] || {}
  const tugListLabel = [
    ...(alloc.tugCodes || []),
    ...(alloc.standbyCode ? [`${alloc.standbyCode} (S)`] : []),
  ].join(', ') || '—'

  return (
    <div className="p-3 space-y-3">
      <Section title={t('cap.shipmentInfo')}>
        <Row label={lang === 'en' ? 'Shipment' : 'งาน'} value={`SHP-${movement.id}`} />
        <Row label={lang === 'en' ? 'Port / Terminal' : 'ท่าเทียบ'} value={movement.terminal} />
        <Row
          label={lang === 'en' ? 'Operation' : 'ปฏิบัติการ'}
          value={
            <span className={movement.operation === 'berth' ? 'text-brand-mid' : 'text-brand-orange'}>
              {movement.operation === 'berth' ? `${t('common.berth')} — เข้าจอด` : `${t('common.unberth')} — ออก`}
            </span>
          }
        />
        <Row label={lang === 'en' ? 'Vessel' : 'เรือ'} value={movement.vesselName} />
        <Row label={t('cap.tugAssigned')} value={<span className="font-mono text-[11px]">{tugListLabel}</span>} />
        <Row label={t('cap.plannedTime')} value={movement.scheduledTime} />
      </Section>

      <Section title={t('cap.vesselInfo')}>
        <Row label="IMO" value={movement.imo} />
        <Row label="LOA" value={`${movement.loa} m`} />
        <Row label="GRT" value={movement.grt?.toLocaleString?.()} />
        <Row label={lang === 'en' ? 'Flag' : 'ธง'} value={movement.flag} />
        <Row label={t('vsp.col.pilot')} value={movement.pilot} />
      </Section>

      <Section title={t('jobType.section')}>
        <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
          {t('jobType.label')} <span className="text-[10px] text-slate-400 font-normal ml-1">{lang === 'en' ? '(เลือกประเภทงาน)' : ''}</span>
        </label>
        <select
          value={jobStatus.jobType || ''}
          onChange={(e) => onSetJobType(e.target.value)}
          className="input"
        >
          <option value="">{t('jobType.placeholder')}</option>
          {JOB_TYPES.map(jt => (
            <option key={jt} value={jt}>
              {t(`jobType.${jt}`)}{lang === 'en' ? ` — ${translations[`jobType.${jt}`]?.th || ''}` : ''}
            </option>
          ))}
        </select>
        {jobStatus.jobType && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-brand-mid">
            <Briefcase size={12} /> <b>{t(`jobType.${jobStatus.jobType}`)}</b>
          </div>
        )}
      </Section>

      <Section title={t('cap.statusTimeline')}>
        <ol className="space-y-1.5">
          {STAGE_KEYS.map((key, i) => {
            const isDone = stage >= i
            const isCurrent = stage === i
            const ts = jobStatus.timestamps?.[i]
            const gps = jobStatus.gps?.[i]
            return (
              <li key={key} className={`flex items-start gap-2 ${isDone ? '' : 'opacity-40'}`}>
                <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isDone ? 'bg-brand-green text-white' : isCurrent ? 'bg-brand-orange text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {isDone ? '✓' : i + 1}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{t(key)}</div>
                  {ts && <div className="text-[10px] text-slate-500">{new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
                  {gps && <div className="text-[10px] text-brand-teal flex items-center gap-0.5"><MapPin size={9} /> {gps}</div>}
                </div>
              </li>
            )
          })}
        </ol>
      </Section>

      {/* Action box */}
      {stage < 9 && (
        <div className="sticky bottom-0 bg-white p-3 -mx-3 border-t">
          {nextStage === 1 ? (
            <button onClick={onOpenChecklist} className="w-full btn btn-primary justify-center">
              {t('stage.2')} / {t('stage.3')}
            </button>
          ) : nextStage === 5 ? (
            <div className="space-y-2">
              <select className="input" value={standbyReason} onChange={e => setStandbyReason(e.target.value)}>
                <option value="">— {lang === 'en' ? 'Delay reason' : 'สาเหตุล่าช้า'} —</option>
                <option>Vessel late / เรือล่าช้า</option>
                <option>Pilot late / นำร่องล่าช้า</option>
                <option>Weather / สภาพอากาศ</option>
                <option>No delay / ไม่ล่าช้า</option>
              </select>
              <button onClick={() => onAdvance(5, { notes: { ...(jobStatus.notes || {}), 5: standbyReason } })} className="w-full btn btn-primary justify-center">
                {t('stage.6')} ▸
              </button>
            </div>
          ) : (
            <button onClick={() => onAdvance(nextStage)} className="w-full btn btn-primary justify-center">
              {t(STAGE_KEYS[nextStage])} ▸
            </button>
          )}
          <div className="flex gap-2 mt-2">
            <button className="flex-1 text-xs py-2 border-2 border-dashed border-slate-300 rounded flex items-center justify-center gap-1 text-slate-500">
              <Camera size={12} /> Photo
            </button>
            <button className="flex-1 text-xs py-2 border-2 border-dashed border-slate-300 rounded flex items-center justify-center gap-1 text-slate-500">
              <FileText size={12} /> Note
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Checklist({ movement, selectedTug, date, getCrewForTug, onConfirm, t, lang }) {
  // New store signature: getCrewForTug(tugCode, date) returns [{ position, crew }, ...]
  const crewRoster = getCrewForTug(selectedTug, date).filter(r => r.crew).slice(0, 4)
  const [attendance, setAttendance] = useState({}) // positionCode -> 'present' | 'absent' | undefined
  const [checked, setChecked] = useState({ engine: false, nav: false, lines: false })

  const allMarked = crewRoster.length > 0 && crewRoster.every(r => attendance[r.position.code])
  const allChecked = Object.values(checked).every(Boolean)
  const ready = allMarked && allChecked

  return (
    <div className="p-3 space-y-3">
      <Section title={t('cap.crewAttendance')}>
        {crewRoster.length === 0 && (
          <div className="text-xs text-slate-400">
            {lang === 'en' ? 'No crew assigned — dispatcher to complete Crew Assignment.' : 'ยังไม่ได้จัดคนประจำเรือ'}
          </div>
        )}
        <div className="space-y-1.5">
          {crewRoster.map(({ position, crew }) => {
            const att = attendance[position.code]
            return (
              <div key={position.code} className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg">
                <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                  {initials(crew.fullName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold truncate">{crew.fullName}</div>
                  <div className="text-[10px] text-slate-500">{position.code} — {lang === 'en' ? position.en : position.th}</div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => setAttendance(s => ({ ...s, [position.code]: 'present' }))}
                    className={`text-[11px] px-2.5 py-1 rounded-full font-bold border transition ${
                      att === 'present' ? 'bg-surface-green text-brand-green border-brand-green' : 'bg-white border-slate-300 text-slate-500 hover:border-brand-green'
                    }`}
                  >
                    {t('cap.present')}
                  </button>
                  <button
                    onClick={() => setAttendance(s => ({ ...s, [position.code]: 'absent' }))}
                    className={`text-[11px] px-2.5 py-1 rounded-full font-bold border transition ${
                      att === 'absent' ? 'bg-surface-red text-brand-red border-brand-red' : 'bg-white border-slate-300 text-slate-500 hover:border-brand-red'
                    }`}
                  >
                    {t('cap.absent')}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title={t('cap.preDepartureCheck')}>
        {[
          { key: 'engine', label_en: 'Engine OK', label_th: 'เครื่องยนต์ปกติ', sub: 'Main engine, generators, fuel' },
          { key: 'nav', label_en: 'Navigation OK', label_th: 'อุปกรณ์นำทางปกติ', sub: 'Radar, GPS, VHF, lights' },
          { key: 'lines', label_en: 'Tow Lines OK', label_th: 'เชือกลากปกติ', sub: 'Lines, fenders, deck equipment' },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setChecked(s => ({ ...s, [item.key]: !s[item.key] }))}
            className={`w-full flex items-start gap-2 p-2 rounded-lg border-2 text-left mb-1 ${checked[item.key] ? 'border-brand-green bg-surface-green' : 'border-slate-200 bg-white'}`}
          >
            {checked[item.key] ? <CheckSquare size={18} className="text-brand-green" /> : <Square size={18} className="text-slate-400" />}
            <div>
              <div className="text-sm font-semibold">{lang === 'en' ? item.label_en : item.label_th}</div>
              <div className="text-[10px] text-slate-500">{item.sub}</div>
            </div>
          </button>
        ))}
      </Section>

      <button
        disabled={!ready}
        onClick={() => onConfirm(attendance, checked)}
        className={`w-full btn justify-center ${ready ? 'btn-primary' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
      >
        {ready ? t('common.confirm') : `${Object.values(attendance).filter(Boolean).length}/${crewRoster.length} crew · ${Object.values(checked).filter(Boolean).length}/3 checks`}
      </button>
    </div>
  )
}

function Summary({ movement, jobStatus, t, lang }) {
  const jobTypeLabel = jobStatus.jobType ? t(`jobType.${jobStatus.jobType}`) : '—'
  const attendance = jobStatus.crewAttendance || {}
  const total = Object.keys(attendance).length
  const present = Object.values(attendance).filter(v => v === 'present').length
  const startTime = jobStatus.timestamps?.[3] // Departed = stage 4 (0-indexed 3)
  const endTime = jobStatus.timestamps?.[9] // Job Complete

  return (
    <div className="p-4 text-center">
      <div className="w-20 h-20 bg-surface-green rounded-full flex items-center justify-center mx-auto mb-3">
        <span className="text-4xl">✓</span>
      </div>
      <div className="font-bold text-brand-green text-lg">{t('cap.jobComplete')}</div>
      <div className="text-xs text-slate-500 mb-4">{movement.vesselName} · {movement.terminal}</div>

      <Section title={lang === 'en' ? 'Job Summary' : 'สรุปงาน'}>
        <div className="text-xs space-y-1.5 text-left">
          <div className="flex justify-between border-b border-slate-100 pb-1">
            <span className="text-slate-600">{lang === 'en' ? 'Shipment' : 'งาน'}</span>
            <span className="font-semibold">SHP-{movement.id}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-1">
            <span className="text-slate-600">{lang === 'en' ? 'Port' : 'ท่า'}</span>
            <span className="font-semibold">{movement.terminal}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-1">
            <span className="text-slate-600">{t('jobType.label')}</span>
            <span className={`font-semibold ${jobStatus.jobType ? 'text-brand-mid' : 'text-slate-400'}`}>{jobTypeLabel}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-1">
            <span className="text-slate-600">{lang === 'en' ? 'Start time' : 'เวลาเริ่ม'}</span>
            <span className="font-semibold text-brand-green font-mono">{startTime ? new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-1">
            <span className="text-slate-600">{lang === 'en' ? 'End time' : 'เวลาจบ'}</span>
            <span className="font-semibold text-brand-red font-mono">{endTime ? new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">{lang === 'en' ? 'Crew present' : 'ลูกเรือ'}</span>
            <span className="font-semibold">{present} / {total} {lang === 'en' ? '' : 'คน'}</span>
          </div>
        </div>
      </Section>

      <Section title={lang === 'en' ? 'All Timestamps' : 'เวลาทั้งหมด'}>
        <div className="text-xs space-y-1">
          {STAGE_KEYS.map((k, i) => {
            const ts = jobStatus.timestamps?.[i]
            if (!ts) return null
            return (
              <div key={k} className="flex justify-between">
                <span className="text-slate-600">{t(k)}</span>
                <span className="font-mono">{new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )
          })}
        </div>
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="bg-white rounded-lg p-3 border border-slate-200">
      <h3 className="text-[11px] font-bold uppercase text-slate-500 mb-2">{title}</h3>
      {children}
    </section>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm py-0.5">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-right">{value ?? '—'}</span>
    </div>
  )
}
