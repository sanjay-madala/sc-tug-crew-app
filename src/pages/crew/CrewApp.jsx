import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { useT } from '../../i18n/useT'
import { ChevronLeft, Globe, Home as HomeIcon, RotateCcw, MapPin, CheckCircle2, RotateCw, Clock, Anchor } from 'lucide-react'

const DEMO_GPS = { lat: 12.667842, lng: 101.234561, acc: 8 }

export default function CrewApp() {
  const navigate = useNavigate()
  const t = useT()
  const lang = useStore(s => s.lang)
  const setLang = useStore(s => s.setLang)
  const resetDemo = useStore(s => s.resetDemo)
  const crew = useStore(s => s.crew)
  const schedule = useStore(s => s.schedule)
  const allocations = useStore(s => s.allocations)
  const jobStatuses = useStore(s => s.jobStatuses)
  const setJobDetail = useStore(s => s.setJobDetail)
  const crewSession = useStore(s => s.crewSession)
  const setCrewSession = useStore(s => s.setCrewSession)

  // Resolve selectedCrew from its ID (persisted) so we always fetch fresh
  const selectedCrewId = crewSession.selectedCrewId
  const selectedCrew = selectedCrewId ? crew.find(c => c.crewId === selectedCrewId) : null
  const view = crewSession.view
  const currentMovementId = crewSession.currentMovementId
  const confirmed = crewSession.confirmations || {}

  const setSelectedCrew = (c) => setCrewSession({ selectedCrewId: c ? c.crewId : null })
  const setView = (v) => setCrewSession({ view: v })
  const setCurrentMovementId = (v) => setCrewSession({ currentMovementId: v })
  const setConfirmed = (updater) => {
    const current = crewSession.confirmations || {}
    const next = typeof updater === 'function' ? updater(current) : updater
    setCrewSession({ confirmations: next })
  }

  // GPS stays local — it's runtime, not session
  const [gps, setGps] = useState(null)

  const myTugCode = selectedCrew?.vesselName
    ? useStore.getState().tugs.find(tg => tg.name.replace(/\s+/g, '') === selectedCrew.vesselName.replace(/\s+/g, ''))?.code
    : null

  const myJobs = useMemo(() => {
    if (!myTugCode) return []
    return schedule.filter(m => {
      if (m.planStatus && m.planStatus !== 'published') return false
      const a = allocations[m.id]
      if (!a) return false
      return (a.tugCodes || []).includes(myTugCode) || a.standbyCode === myTugCode
    })
  }, [schedule, allocations, myTugCode])

  useEffect(() => {
    if (view !== 'detail') return
    setGps(null)
    const t1 = setTimeout(() => setGps(DEMO_GPS), 1200) // simulate GPS acquire
    return () => clearTimeout(t1)
  }, [view, currentMovementId])

  const openJob = (mId) => { setCurrentMovementId(mId); setView('detail') }

  const doConfirm = () => {
    const key = `${currentMovementId}:${myTugCode}`
    const now = new Date().toISOString()
    const prev = jobStatuses[key] || { crewConfirmations: {} }
    setJobDetail(currentMovementId, myTugCode, {
      crewConfirmations: {
        ...(prev.crewConfirmations || {}),
        [selectedCrew.crewId]: { confirmedAt: now, gps: gps, name: selectedCrew.fullName, position: selectedCrew.positionCode },
      },
    })
    setConfirmed(c => ({ ...c, [currentMovementId]: true }))
  }

  const undo = () => {
    const key = `${currentMovementId}:${myTugCode}`
    const prev = jobStatuses[key] || { crewConfirmations: {} }
    const { [selectedCrew.crewId]: _, ...rest } = prev.crewConfirmations || {}
    setJobDetail(currentMovementId, myTugCode, { crewConfirmations: rest })
    setConfirmed(c => { const n = { ...c }; delete n[currentMovementId]; return n })
  }

  const currentMovement = schedule.find(m => m.id === currentMovementId)
  const isConfirmed = !!confirmed[currentMovementId]

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-4">
      <div className="w-full max-w-md mb-3 flex items-center justify-between text-white">
        <button onClick={() => navigate('/')} className="flex items-center gap-1 text-sm hover:text-brand-orange">
          <HomeIcon size={14} /> {t('nav.home')}
        </button>
        <div className="text-xs text-white/60">Crew Mobile Demo</div>
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
        <div className="bg-brand-mid text-white h-10 flex items-center justify-between px-5 text-xs flex-shrink-0">
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span>LTE  92%</span>
        </div>
        <div className="bg-brand-mid text-white px-3 pb-3 flex items-center justify-between flex-shrink-0">
          {view !== 'home' ? (
            <button onClick={() => setView('home')} className="p-1 hover:bg-white/10 rounded"><ChevronLeft size={20} /></button>
          ) : <div className="w-6" />}
          <div className="text-center flex-1">
            <div className="text-sm font-bold">
              {view === 'home' && !selectedCrew && (lang === 'en' ? 'Select crew member' : 'เลือกลูกเรือ')}
              {view === 'home' && selectedCrew && selectedCrew.fullName}
              {view === 'detail' && t('crew.confirmWork')}
            </div>
            {selectedCrew && view === 'home' && <div className="text-[10px] text-white/70">{selectedCrew.positionCode} · {selectedCrew.vesselName}</div>}
          </div>
          <div className="w-6" />
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50">
          {view === 'home' && !selectedCrew && (
            <CrewSelect crew={crew.filter(c => c.fullName)} onPick={setSelectedCrew} lang={lang} />
          )}
          {view === 'home' && selectedCrew && (
            <MyJobsList myJobs={myJobs} onOpen={openJob} confirmed={confirmed} onChange={() => setSelectedCrew(null)} t={t} lang={lang} myTugCode={myTugCode} />
          )}
          {view === 'detail' && currentMovement && (
            <ConfirmScreen
              movement={currentMovement}
              crew={selectedCrew}
              myTugCode={myTugCode}
              gps={gps}
              isConfirmed={isConfirmed}
              onConfirm={doConfirm}
              onUndo={undo}
              onDone={() => setView('home')}
              t={t}
              lang={lang}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function CrewSelect({ crew, onPick, lang }) {
  const [q, setQ] = useState('')
  // Sort by vessel name then full name so similar-tug crew group together; no hard cap (scrollable)
  const sorted = [...crew].sort((a, b) =>
    String(a.vesselName || '').localeCompare(String(b.vesselName || '')) ||
    String(a.fullName || '').localeCompare(String(b.fullName || ''))
  )
  const filtered = sorted.filter(c =>
    (c.fullName || '').toLowerCase().includes(q.toLowerCase()) ||
    (c.vesselName || '').toLowerCase().includes(q.toLowerCase())
  ).slice(0, 40)
  return (
    <div className="p-4">
      <div className="text-sm text-slate-500 mb-3">
        {lang === 'en' ? 'Tap your name to continue.' : 'แตะชื่อของคุณเพื่อเข้าสู่ระบบ'}
      </div>
      <input className="input mb-3" placeholder={lang === 'en' ? 'Name / Vessel…' : 'ชื่อ / เรือ…'} value={q} onChange={e => setQ(e.target.value)} />
      <div className="space-y-1.5">
        {filtered.map(c => (
          <button
            key={c.crewId}
            onClick={() => onPick(c)}
            className="w-full text-left bg-white border border-slate-200 hover:border-brand-mid rounded-lg p-3"
          >
            <div className="font-semibold text-sm">{c.fullName}</div>
            <div className="text-xs text-slate-500">{c.positionCode} · {c.vesselName} · EMP {c.employeeId}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

function MyJobsList({ myJobs, onOpen, confirmed, onChange, t, lang, myTugCode }) {
  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="text-slate-600">{t('cap.today')} ({myTugCode || '—'})</div>
        <button onClick={onChange} className="text-brand-mid hover:underline">{lang === 'en' ? 'Change user' : 'เปลี่ยนผู้ใช้'}</button>
      </div>
      {myJobs.length === 0 && (
        <div className="text-center py-10 text-sm text-slate-400">
          {lang === 'en' ? 'No jobs allocated to your tug yet.' : 'ยังไม่มีงานสำหรับเรือของคุณ'}
        </div>
      )}
      {myJobs.map(m => (
        <button
          key={m.id}
          onClick={() => onOpen(m.id)}
          className={`w-full text-left bg-white border-2 rounded-lg p-3 mb-2 ${confirmed[m.id] ? 'border-brand-green' : 'border-slate-200 hover:border-brand-mid'}`}
        >
          <div className="flex items-center justify-between">
            <div className="font-bold text-sm">{m.vesselName}</div>
            {confirmed[m.id] && <CheckCircle2 size={14} className="text-brand-green" />}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
            <Anchor size={10} /> {m.terminal}
            <span>·</span>
            <Clock size={10} /> {m.scheduledTime}
          </div>
        </button>
      ))}
    </div>
  )
}

function ConfirmScreen({ movement, crew, myTugCode, gps, isConfirmed, onConfirm, onUndo, onDone, t, lang }) {
  return (
    <div className="p-3">
      <section className="bg-white rounded-lg p-3 border border-slate-200 mb-3">
        <div className="text-[11px] font-bold uppercase text-slate-500 mb-2">{lang === 'en' ? 'Shipment' : 'งาน'}</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold">{movement.vesselName}</div>
            <div className="text-xs text-slate-500">{movement.terminal} · {movement.operation === 'berth' ? t('common.berth') : t('common.unberth')}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">{lang === 'en' ? 'Time' : 'เวลา'}</div>
            <div className="font-semibold">{movement.scheduledTime}</div>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t text-xs text-slate-600">
          {lang === 'en' ? 'You are' : 'คุณคือ'}: <b>{crew.fullName}</b> ({crew.positionCode}) — {myTugCode}
        </div>
      </section>

      <section className={`rounded-lg p-3 border-2 mb-3 ${gps ? 'bg-surface-teal border-brand-teal' : 'bg-slate-50 border-slate-300'}`}>
        <div className="flex items-center gap-2 text-sm font-bold">
          <MapPin size={16} className={gps ? 'text-brand-teal' : 'text-slate-400'} />
          {gps ? t('crew.gpsReady') : t('crew.gpsWait')}
        </div>
        {gps && (
          <div className="mt-2 text-xs space-y-0.5 font-mono">
            <div>Lat: {gps.lat}</div>
            <div>Lng: {gps.lng}</div>
            <div>Accuracy: {gps.acc} m</div>
          </div>
        )}
      </section>

      {isConfirmed ? (
        <>
          <div className="bg-surface-green rounded-lg p-4 text-center mb-3 border-2 border-brand-green">
            <CheckCircle2 size={40} className="text-brand-green mx-auto mb-2" />
            <div className="font-bold text-brand-green">{t('crew.confirmed')}</div>
            <div className="text-xs text-slate-600 mt-1">{new Date().toLocaleString()}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={onUndo} className="flex-1 btn btn-secondary justify-center"><RotateCw size={14} /> {t('crew.undo')}</button>
            <button onClick={onDone} className="flex-1 btn btn-primary justify-center">{t('crew.done')} ✓</button>
          </div>
        </>
      ) : (
        <button disabled={!gps} onClick={onConfirm} className={`w-full btn justify-center ${gps ? 'btn-primary' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
          {gps ? t('crew.confirmWork') : t('crew.gpsWait')}
        </button>
      )}
    </div>
  )
}
