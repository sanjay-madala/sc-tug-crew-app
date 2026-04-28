import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { useT } from '../../i18n/useT'
import { CheckCircle2, Trash2 } from 'lucide-react'

const TERMINALS = [
  'BLCP', 'PTTLNG  LMPT1', 'PTTLNG  LMPT2 (หนองแฟบ)', 'MTT', 'PTTGC E', 'PTTGC W',
  'SPRC', 'MIT', 'NFC', 'TCT', 'PTT TANK', 'GSC', 'RTC', 'TTT', 'SPM',
]

const INITIAL = {
  vesselName: '', berthTerminal: '', operationType: 'berth',
  plannedDate: '', plannedTime: '',
  draftF: '', draftM: '', draftA: '',
  pilotName: '', pilotLicence: '', pilotCompany: '',
  agentName: '', contactPerson: '', contactTel: '',
  remark: '',
}

export default function VesselBerthLog() {
  const t = useT()
  const lang = useStore(s => s.lang)
  const berthLog = useStore(s => s.berthLog)
  const addBerthLog = useStore(s => s.addBerthLog)
  const vessels = useStore(s => s.vessels)
  const [form, setForm] = useState(INITIAL)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (!form.vesselName || !form.berthTerminal) { alert('Vessel and Terminal required'); return }
    addBerthLog({ ...form, recordedAt: new Date().toISOString() })
    setForm(INITIAL)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="p-6">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-brand-dark">{t('bl.title')}</h1>
        <p className="text-sm text-slate-500">{t('bl.sub')}</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-5">
        <section className="card p-5">
          <h2 className="font-semibold text-brand-dark mb-3">{lang === 'en' ? 'New record' : 'บันทึกใหม่'}</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <div className="label">{t('bl.vesselName')}</div>
              <input list="vesselList" className="input" value={form.vesselName} onChange={e => update('vesselName', e.target.value)} />
              <datalist id="vesselList">
                {vessels.map(v => <option key={v.id} value={v.name} />)}
              </datalist>
            </div>
            <div>
              <div className="label">{t('bl.berthTerminal')}</div>
              <select className="input" value={form.berthTerminal} onChange={e => update('berthTerminal', e.target.value)}>
                <option value="">— {lang === 'en' ? 'Select' : 'เลือก'} —</option>
                {TERMINALS.map(tm => <option key={tm}>{tm}</option>)}
              </select>
            </div>
            <div>
              <div className="label">{t('bl.operationType')}</div>
              <select className="input" value={form.operationType} onChange={e => update('operationType', e.target.value)}>
                <option value="berth">{t('common.berth')}</option>
                <option value="unberth">{t('common.unberth')}</option>
              </select>
            </div>
            <div>
              <div className="label">{t('bl.plannedDateTime')}</div>
              <input type="date" className="input" value={form.plannedDate} onChange={e => update('plannedDate', e.target.value)} />
            </div>
            <div>
              <div className="label">&nbsp;</div>
              <input type="time" className="input" value={form.plannedTime} onChange={e => update('plannedTime', e.target.value)} />
            </div>

            <div className="col-span-2 mt-2">
              <div className="label">Draft (m)</div>
              <div className="grid grid-cols-3 gap-2">
                <input className="input" placeholder={t('bl.draftForward')} value={form.draftF} onChange={e => update('draftF', e.target.value)} />
                <input className="input" placeholder={t('bl.draftMid')} value={form.draftM} onChange={e => update('draftM', e.target.value)} />
                <input className="input" placeholder={t('bl.draftAft')} value={form.draftA} onChange={e => update('draftA', e.target.value)} />
              </div>
            </div>

            <div className="col-span-2 mt-2">
              <div className="label">{t('bl.pilotDetails')}</div>
              <div className="grid grid-cols-3 gap-2">
                <input className="input" placeholder={lang === 'en' ? 'Name' : 'ชื่อ'} value={form.pilotName} onChange={e => update('pilotName', e.target.value)} />
                <input className="input" placeholder={lang === 'en' ? 'Licence No.' : 'ใบอนุญาต'} value={form.pilotLicence} onChange={e => update('pilotLicence', e.target.value)} />
                <input className="input" placeholder={lang === 'en' ? 'Company' : 'บริษัท'} value={form.pilotCompany} onChange={e => update('pilotCompany', e.target.value)} />
              </div>
            </div>

            <div className="col-span-2">
              <div className="label">{t('bl.agentName')}</div>
              <input className="input" value={form.agentName} onChange={e => update('agentName', e.target.value)} />
            </div>
            <div>
              <div className="label">{t('bl.contactPerson')}</div>
              <input className="input" value={form.contactPerson} onChange={e => update('contactPerson', e.target.value)} />
            </div>
            <div>
              <div className="label">{t('bl.tel')}</div>
              <input className="input" value={form.contactTel} onChange={e => update('contactTel', e.target.value)} />
            </div>

            <div className="col-span-2">
              <div className="label">{t('vsp.col.remark')}</div>
              <textarea className="input" rows={2} value={form.remark} onChange={e => update('remark', e.target.value)} />
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <button onClick={() => setForm(INITIAL)} className="btn btn-secondary"><Trash2 size={14} /> {t('common.clear')}</button>
            <button onClick={handleSave} className="btn btn-primary"><CheckCircle2 size={14} /> {t('common.save')}</button>
          </div>
          {saved && <div className="mt-3 text-xs text-brand-green">✓ {lang === 'en' ? 'Saved' : 'บันทึกแล้ว'}</div>}
        </section>

        <section className="card p-5">
          <h2 className="font-semibold text-brand-dark mb-3">{lang === 'en' ? 'Recent entries' : 'รายการล่าสุด'} ({berthLog.length})</h2>
          {berthLog.length === 0 ? (
            <div className="text-sm text-slate-400 text-center py-10">
              {lang === 'en' ? 'No records yet. Fill the form to add one.' : 'ยังไม่มีรายการ'}
            </div>
          ) : (
            <div className="space-y-2 max-h-[520px] overflow-y-auto">
              {berthLog.slice(0, 20).map(e => (
                <div key={e.id} className="border border-slate-200 rounded p-3 text-sm hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{e.vesselName}</div>
                    <span className={`pill ${e.operationType === 'berth' ? 'bg-surface-green text-brand-green' : 'bg-surface-orange text-brand-orange'}`}>
                      {e.operationType === 'berth' ? t('common.berth') : t('common.unberth')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {e.berthTerminal} · {e.plannedDate} {e.plannedTime}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Draft {e.draftF}/{e.draftM}/{e.draftA} · Pilot {e.pilotName || '—'} · {e.agentName || '—'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
