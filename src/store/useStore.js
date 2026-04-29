import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'

import tugs from '../data/tugs.json'
import vessels from '../data/vessels.json'
import terminalMatrix from '../data/terminalMatrix.json'
import tugGroups from '../data/tugGroups.json'
import lngCapable from '../data/lngCapable.json'
import crew from '../data/crew.json'
import positions from '../data/positions.json'
import dailySchedule from '../data/dailySchedule.json'
import nonConcession from '../data/nonConcession.json'
import bangkokRules from '../data/bangkokRules.json'

function isOvernight(timeStr) {
  if (!timeStr) return false
  const h = parseInt(String(timeStr).split(':')[0], 10)
  return h >= 22 || h < 6
}

// Compute a movement's [start, end] window in minutes from midnight of its scheduled day.
// Overnight movements (start ≥ 22:00) wrap into next day; we add 24*60 to end.
function movementWindow(m) {
  if (!m.scheduledTime) return null
  const [hh, mm] = String(m.scheduledTime).split(':').map(n => parseInt(n, 10))
  const startMin = hh * 60 + (mm || 0)
  const r = m.required || {}
  const hrs = m.operation === 'berth' ? (r.hrsIn || 2) : (r.hrsOut || 2)
  const endMin = startMin + Math.round(Number(hrs) * 60)
  return { startMin, endMin, isOvernight: hh >= 22 }
}

// Two windows overlap if start of one < end of the other (and vice versa).
// Treat times as same-day for simplicity. Overnight is flagged but compared as-is.
function windowsOverlap(a, b) {
  if (!a || !b) return false
  return a.startMin < b.endMin && b.startMin < a.endMin
}

// Seed initial runtime state
function seedState() {
  // Initial tug readiness: all Ready
  const readiness = {}
  tugs.forEach(tg => {
    readiness[tg.code] = {
      status: 'ready',
      remark: '',
      lastUpdated: new Date().toISOString(),
    }
  })

  const allocations = {} // movementId -> { tugCodes: [], pilotBoat, ropeBoat, standbyCode }
  const jobStatuses = {} // `${movementId}:${tugCode}` -> { stage, timestamps, gps, jobType, ... }

  // ── Permanent crew per (tugCode, positionCode) — seeded from sample data ──
  const permanentCrew = {} // `${tugCode}:${positionCode}` -> { employeeId, fullName, licenceDoc, since }
  const temporaryCrew = [] // array of { date, tugCode, positionCode, employeeId, fullName, licenceDoc, reason, fromDate, toDate }

  const today = dailySchedule.date
  const normalize = (s) => String(s || '').replace(/[.\s]/g, '').toUpperCase()
  crew.forEach(c => {
    const tug = tugs.find(t =>
      normalize(t.name) === normalize(c.vesselName) ||
      normalize(t.code) === normalize(c.vesselName)
    )
    if (!tug) return
    const posSet = positions[tug.positionSet] || positions.MTPP01
    const posEntry = posSet.find(p => p.id === c.departmentId)
    if (!posEntry) return
    const key = `${tug.code}:${posEntry.code}`
    permanentCrew[key] = {
      employeeId: c.employeeId,
      fullName: c.fullName,
      licenceDoc: 'e-unit://doc/' + c.employeeId,
      since: '2024-01-01',
    }
  })

  // Seed schedule: existing 8 movements are already "published" so demo flows work out of the box
  const seededSchedule = dailySchedule.movements.map(m => ({
    ...m,
    planStatus: 'published',
    fleetConfirmStatus: 'confirmed',
    isOvernight: isOvernight(m.scheduledTime),
    uploadedAt: new Date().toISOString(),
    postedAt: new Date().toISOString(),
  }))

  return {
    readiness,
    allocations,
    jobStatuses,
    permanentCrew,
    temporaryCrew,
    schedule: seededSchedule,
    scheduleUploads: [],
    date: today,
    shift: 'morning',
    captainSession: { selectedTug: null, currentMovementId: null, view: 'home', standbyReason: '', jobType: '', crewAttendance: {} },
    crewSession: { selectedCrewId: null, currentMovementId: null, view: 'home', confirmations: {} },
  }
}

export const useStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Seed (read-only master data)
        tugs,
        vessels,
        terminalMatrix,
        tugGroups,
        lngCapable,
        crew,
        positions,
        nonConcession,
        bangkokRules,

        // User preferences
        lang: 'en',
        setLang: (lang) => set({ lang }),

        // Runtime state
        ...seedState(),

        // Shift / date
        setShift: (shift) => set({ shift }),
        setDate: (date) => set({ date }),

        // Readiness actions
        setTugStatus: (tugCode, status, remark) =>
          set(s => ({
            readiness: {
              ...s.readiness,
              [tugCode]: { status, remark: remark ?? s.readiness[tugCode]?.remark ?? '', lastUpdated: new Date().toISOString() },
            },
          })),

        // Allocation actions
        allocateTugs: (movementId, alloc) =>
          set(s => ({ allocations: { ...s.allocations, [movementId]: alloc } })),

        unallocate: (movementId) =>
          set(s => {
            const { [movementId]: _, ...rest } = s.allocations
            return { allocations: rest }
          }),

        // Job status actions
        setJobStage: (movementId, tugCode, stage, extra = {}) =>
          set(s => {
            const key = `${movementId}:${tugCode}`
            const prev = s.jobStatuses[key] || { stage: -1, timestamps: {}, gps: {}, notes: {}, photos: [] }
            const now = new Date().toISOString()
            return {
              jobStatuses: {
                ...s.jobStatuses,
                [key]: {
                  ...prev,
                  stage,
                  timestamps: { ...prev.timestamps, [stage]: now },
                  ...extra,
                },
              },
            }
          }),

        setJobDetail: (movementId, tugCode, patch) =>
          set(s => {
            const key = `${movementId}:${tugCode}`
            const prev = s.jobStatuses[key] || { stage: -1, timestamps: {}, gps: {}, notes: {}, photos: [] }
            return {
              jobStatuses: {
                ...s.jobStatuses,
                [key]: { ...prev, ...patch },
              },
            }
          }),

        // ── Permanent crew actions ──
        setPermanentCrew: (tugCode, positionCode, data) =>
          set(s => ({
            permanentCrew: {
              ...s.permanentCrew,
              [`${tugCode}:${positionCode}`]: { ...data, since: data.since || new Date().toISOString().slice(0, 10) },
            },
          })),

        clearPermanentCrew: (tugCode, positionCode) =>
          set(s => {
            const key = `${tugCode}:${positionCode}`
            const { [key]: _, ...rest } = s.permanentCrew
            return { permanentCrew: rest }
          }),

        // ── Temporary reassignment actions ──
        addTemporaryCrew: (entry) =>
          set(s => ({
            temporaryCrew: [
              ...s.temporaryCrew.filter(t =>
                !(t.tugCode === entry.tugCode && t.positionCode === entry.positionCode && t.date === entry.date)
              ),
              { id: `T${Date.now()}`, ...entry },
            ],
          })),

        removeTemporaryCrew: (date, tugCode, positionCode) =>
          set(s => ({
            temporaryCrew: s.temporaryCrew.filter(t =>
              !(t.date === date && t.tugCode === tugCode && t.positionCode === positionCode)
            ),
          })),

        // Resolve crew for a given (tug, position, date) — temp wins over permanent
        getResolvedCrew: (tugCode, positionCode, date) => {
          const { permanentCrew, temporaryCrew } = get()
          const temp = temporaryCrew.find(t =>
            t.tugCode === tugCode && t.positionCode === positionCode && t.date === date
          )
          if (temp) return { ...temp, type: 'temporary' }
          const perm = permanentCrew[`${tugCode}:${positionCode}`]
          if (perm) return { ...perm, type: 'permanent', tugCode, positionCode }
          return null
        },

        // Schedule edits
        updateMovement: (id, patch) =>
          set(s => ({ schedule: s.schedule.map(m => m.id === id ? { ...m, ...patch } : m) })),

        // Mobile session state
        setCaptainSession: (patch) => set(s => ({ captainSession: { ...s.captainSession, ...patch } })),
        setCrewSession: (patch) => set(s => ({ crewSession: { ...s.crewSession, ...patch } })),

        // ============ Plan workflow ============
        // Upload a new batch of movements from port. The file may include `tugAssignment`
        // per movement — if so, we apply it to allocations on upload (no manual assignment needed).
        uploadScheduleBatch: (batch) => {
          const now = new Date().toISOString()
          const newMovements = batch.movements.map(m => ({
            required: m.required || inferRequired(m, get().terminalMatrix),
            ...m,
            planStatus: 'uploaded',
            fleetConfirmStatus: null,
            isOvernight: isOvernight(m.scheduledTime),
            uploadedAt: now,
            postedAt: null,
          }))
          // Build allocations map from movements that have tugAssignment
          const incomingAllocs = {}
          newMovements.forEach(m => {
            if (m.tugAssignment) {
              incomingAllocs[m.id] = {
                tugCodes: m.tugAssignment.tugCodes || [],
                pilotBoat: m.tugAssignment.pilotBoat || '',
                ropeBoat: m.tugAssignment.ropeBoat || '',
                standbyCode: m.tugAssignment.standbyCode || '',
              }
            }
          })
          set(s => ({
            schedule: [...s.schedule.filter(m => !newMovements.find(n => n.id === m.id)), ...newMovements]
              .sort((a, b) => String(a.scheduledTime).localeCompare(String(b.scheduledTime))),
            allocations: { ...s.allocations, ...incomingAllocs },
            scheduleUploads: [{
              at: now,
              filename: batch.filename,
              source: batch.source,
              count: newMovements.length,
              withTugAssignment: Object.keys(incomingAllocs).length,
            }, ...s.scheduleUploads],
          }))
        },

        runFleetConfirm: () => {
          const { schedule, readiness, tugs } = get()
          const confirmed = schedule.map(m => {
            if (m.planStatus !== 'uploaded' && m.planStatus !== 'no-tug') return m
            const r = m.required || {}
            const needed = (m.operation === 'berth' ? r.tugsIn : r.tugsOut) || 0
            const sizeHint = (r.tugSize || '').toLowerCase()
            const readyOfSize = tugs.filter(tg => {
              const st = readiness[tg.code]?.status
              if (st !== 'ready') return false
              if (!sizeHint) return true
              return (tg.groupName || '').toLowerCase().includes(sizeHint)
            }).length
            const hasEnough = needed === 0 || readyOfSize >= needed
            return {
              ...m,
              planStatus: hasEnough ? 'fleet-confirmed' : 'no-tug',
              fleetConfirmStatus: hasEnough ? 'confirmed' : 'no-tug',
            }
          })
          set({ schedule: confirmed })
        },

        postSchedule: () => {
          const now = new Date().toISOString()
          set(s => ({
            schedule: s.schedule.map(m =>
              m.planStatus === 'fleet-confirmed'
                ? { ...m, planStatus: 'published', postedAt: now }
                : m
            ),
          }))
        },

        // ── Overlap detection ──
        // Returns map: tugCode -> array of conflicting movement-id pairs
        // Two movements conflict if same tug is allocated to both AND time windows overlap.
        getOverlaps: () => {
          const { schedule, allocations } = get()
          const tugMovements = {} // tugCode -> array of { movementId, window, role }
          schedule.forEach(m => {
            const a = allocations[m.id]
            if (!a) return
            const win = movementWindow(m)
            if (!win) return
            const codes = [
              ...(a.tugCodes || []).map(c => ({ code: c, role: 'main' })),
              ...(a.standbyCode ? [{ code: a.standbyCode, role: 'standby' }] : []),
              ...(a.pilotBoat ? [{ code: a.pilotBoat, role: 'pilot' }] : []),
              ...(a.ropeBoat ? [{ code: a.ropeBoat, role: 'rope' }] : []),
            ]
            codes.forEach(({ code, role }) => {
              if (!tugMovements[code]) tugMovements[code] = []
              tugMovements[code].push({ movementId: m.id, vesselName: m.vesselName, window: win, role, scheduledTime: m.scheduledTime })
            })
          })
          // Find overlaps
          const overlaps = {} // tugCode -> array of conflicting movementIds (set)
          const movementOverlaps = {} // movementId -> Set of tugCodes that overlap on this movement
          Object.entries(tugMovements).forEach(([code, list]) => {
            for (let i = 0; i < list.length; i++) {
              for (let j = i + 1; j < list.length; j++) {
                if (windowsOverlap(list[i].window, list[j].window)) {
                  if (!overlaps[code]) overlaps[code] = []
                  overlaps[code].push({
                    a: list[i],
                    b: list[j],
                  })
                  if (!movementOverlaps[list[i].movementId]) movementOverlaps[list[i].movementId] = new Set()
                  if (!movementOverlaps[list[j].movementId]) movementOverlaps[list[j].movementId] = new Set()
                  movementOverlaps[list[i].movementId].add(code)
                  movementOverlaps[list[j].movementId].add(code)
                }
              }
            }
          })
          return { byTug: overlaps, byMovement: movementOverlaps }
        },

        // Reset demo
        resetDemo: () => {
          const s = seedState()
          set({ ...s, lang: get().lang })
        },

        // Helpers
        getAllocatedMovementsForTug: (tugCode) => {
          const { schedule, allocations } = get()
          return schedule.filter(m => {
            const a = allocations[m.id]
            if (!a) return false
            return (a.tugCodes || []).includes(tugCode) || a.pilotBoat === tugCode || a.ropeBoat === tugCode || a.standbyCode === tugCode
          })
        },

        // Resolve full crew roster for a tug on a given date
        getCrewForTug: (tugCode, date) => {
          const { tugs, positions, permanentCrew, temporaryCrew } = get()
          const tug = tugs.find(t => t.code === tugCode)
          if (!tug) return []
          const ps = positions[tug.positionSet] || []
          return ps.map(p => {
            const tempEntry = temporaryCrew.find(t =>
              t.tugCode === tugCode && t.positionCode === p.code && t.date === date
            )
            if (tempEntry) return { position: p, crew: { ...tempEntry, type: 'temporary' } }
            const perm = permanentCrew[`${tugCode}:${p.code}`]
            if (perm) return { position: p, crew: { ...perm, type: 'permanent' } }
            return { position: p, crew: null }
          })
        },
      }),
      {
        name: 'sc-tug-demo-v2',
        version: 6,
        migrate: () => undefined,
        partialize: (s) => ({
          lang: s.lang,
          readiness: s.readiness,
          allocations: s.allocations,
          jobStatuses: s.jobStatuses,
          permanentCrew: s.permanentCrew,
          temporaryCrew: s.temporaryCrew,
          schedule: s.schedule,
          scheduleUploads: s.scheduleUploads,
          date: s.date,
          shift: s.shift,
          captainSession: s.captainSession,
          crewSession: s.crewSession,
        }),
      }
    )
  )
)

function inferRequired(m, matrix) {
  const loa = Number(m.loa) || 0
  const loaFt = loa * 3.28084
  let bracket
  if (loaFt < 300) bracket = '<300 Ft.'
  else if (loaFt <= 400) bracket = '301 - 400  Ft.'
  else if (loaFt <= 700) bracket = '401 - 700 Ft.'
  else bracket = '>701 Ft.'
  const row = matrix.find(r => r.terminal === m.terminal && r.loaRange === bracket)
  if (!row) {
    return { tugSize: 'Large', tugsIn: 2, tugsOut: 2, standby: 0, pilotBoat: 1, ropeBoat: 1, hrsIn: 2, hrsOut: 2 }
  }
  const isLng = (m.terminal || '').includes('PTTLNG')
  return {
    tugSize: (row.tugSize || 'LARGE').replace(/\s*TUG\s*/i, '').trim() || 'Large',
    tugsIn: row.tugsIn || 0,
    tugsOut: row.tugsOut || 0,
    standby: row.standby || 0,
    pilotBoat: row.pilotIn || 1,
    ropeBoat: 1,
    hrsIn: row.hrsIn || 2,
    hrsOut: row.hrsOut || 2,
    lngRequired: isLng,
    zTechRequired: loa > 128 || (m.terminal || '').includes('LMPT2'),
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'sc-tug-demo-v2' && e.newValue) {
      try {
        useStore.persist.rehydrate()
      } catch (err) { /* ignore */ }
    }
  })
}
