import { useMemo, useState } from 'react'
import { useStore } from '../../store/useStore'
import { useT } from '../../i18n/useT'
import { Upload, Plus, Download } from 'lucide-react'

const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  th: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
}
const DAY_ABB = {
  en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  th: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
}

export default function TugShiftPlanner() {
  const t = useT()
  const lang = useStore(s => s.lang)
  const crew = useStore(s => s.crew)
  const tugs = useStore(s => s.tugs)
  const [monthYear, setMonthYear] = useState({ m: 3, y: 2026 }) // April 2026 (0-indexed month)
  const [filterVessel, setFilterVessel] = useState('')
  const [filterName, setFilterName] = useState('')

  const daysInMonth = new Date(monthYear.y, monthYear.m + 1, 0).getDate()

  const rows = useMemo(() => {
    return crew
      .filter(c => !filterVessel || (c.vesselName || '').includes(filterVessel))
      .filter(c => !filterName || (c.fullName || '').toLowerCase().includes(filterName.toLowerCase()))
      .map(c => ({
        ...c,
        shifts: Array.from({ length: daysInMonth }, (_, i) => {
          // Seed a realistic D/N pattern: alternating 4-on/4-off by position
          const day = i + 1
          const bucket = ((c.crewId ?? 0) + day) % 8
          if (bucket < 4) return 'D'
          return 'N'
        }),
      }))
  }, [crew, filterVessel, filterName, daysInMonth])

  return (
    <div className="p-6">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-brand-dark">{t('sp.title')}</h1>
        <p className="text-sm text-slate-500">{t('sp.sub')}</p>
      </header>

      <div className="card p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <div className="label">Month / Year</div>
          <div className="flex gap-1">
            <select className="input w-auto" value={monthYear.m} onChange={e => setMonthYear(my => ({ ...my, m: Number(e.target.value) }))}>
              {MONTHS.en.map((m, i) => <option key={m} value={i}>{lang === 'en' ? m : MONTHS.th[i]}</option>)}
            </select>
            <input type="number" className="input w-24" value={monthYear.y} onChange={e => setMonthYear(my => ({ ...my, y: Number(e.target.value) }))} />
          </div>
        </div>
        <div>
          <div className="label">{t('sp.vessel')}</div>
          <input className="input w-32" value={filterVessel} onChange={e => setFilterVessel(e.target.value)} placeholder="RS 21" />
        </div>
        <div>
          <div className="label">{t('common.search')}</div>
          <input className="input w-40" value={filterName} onChange={e => setFilterName(e.target.value)} placeholder={lang === 'en' ? 'name…' : 'ชื่อ…'} />
        </div>
        <div className="ml-auto flex gap-2">
          <button className="btn btn-secondary"><Upload size={14} /> {t('sp.uploadRoster')}</button>
          <button className="btn btn-orange"><Plus size={14} /> {t('sp.addManual')}</button>
          <button className="btn btn-secondary"><Download size={14} /> Export</button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="text-xs">
          <thead>
            <tr>
              <th className="th sticky left-0 z-10 bg-slate-100 min-w-[110px]">{t('sp.vessel')}</th>
              <th className="th sticky left-[110px] z-10 bg-slate-100 min-w-[160px]">{t('sp.position')} / Name</th>
              {Array.from({ length: daysInMonth }, (_, i) => {
                const d = i + 1
                const dow = new Date(monthYear.y, monthYear.m, d).getDay()
                return (
                  <th key={d} className={`th text-center px-1 min-w-[28px] ${dow === 0 || dow === 6 ? 'bg-amber-100 text-amber-900' : ''}`}>
                    <div>{d}</div>
                    <div className="text-[9px] font-normal">{DAY_ABB[lang][dow]}</div>
                  </th>
                )
              })}
              <th className="th">{t('sp.leave')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.crewId}>
                <td className="td sticky left-0 bg-white font-mono font-bold">{row.vesselName}</td>
                <td className="td sticky left-[110px] bg-white">
                  <div className="font-semibold text-xs">{row.fullName}</div>
                  <div className="text-[10px] text-slate-500">{row.positionCode} · EMP {row.employeeId || '—'}</div>
                </td>
                {row.shifts.map((s, i) => (
                  <td key={i} className={`td text-center text-[10px] font-bold ${s === 'D' ? 'bg-amber-50 text-amber-700' : s === 'N' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400'}`}>
                    {s}
                  </td>
                ))}
                <td className="td text-center text-slate-400">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {lang === 'en'
          ? `Legend: D = Day shift (06:00–18:00), N = Night shift (18:00–06:00). Showing ${rows.length} crew members.`
          : `คำอธิบาย: D = กะกลางวัน (06:00–18:00), N = กะกลางคืน (18:00–06:00) แสดง ${rows.length} คน`}
      </p>
    </div>
  )
}
