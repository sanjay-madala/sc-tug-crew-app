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
import nextDayScheduleSample from '../data/nextDayScheduleSample.json'
import nonConcession from '../data/nonConcession.json'
import bangkokRules from '../data/bangkokRules.json'

function isOvernight(timeStr) {
  if (!timeStr) return false
  const h = parseInt(String(timeStr).split(':')[0], 10)
  return h >= 22 || h < 6
}

// Seed initial runtime state
function seedState() {
  // Initial tug readiness: all Ready with no remark, for today × morning shift
  const readiness = {}
  tugs.forEach(tg => {
    readiness[tg.code] = {
      status: 'ready',
      remark: '',
      lastUpdated: new Date().toISOString(),
    }
  })

  // Seed allocations for today's movements — leave empty initially; dispatcher allocates
  const allocations = {} // movementId -> { tugCodes: [], pilotBoat: code, ropeBoat: code, standbyCode: code }

  // Job statuses: per allocated tug × movement, stage 0-9 (10 stages)
  const jobStatuses = {} // `${movementId}:${tugCode}` -> { stage: 0, timestamps: {}, gps: {}, crewConfirmed: false, checklist: {}, notes: {}, photos: [] }

  // Berth/Unberth log entries — initially empty
  const berthLog = []

  // Crew assignment: per tug × position × date × shift
  const crewAssignments = {} // `${date}:${shift}:${tugCode}:${positionCode}` -> employeeId

  // Seed crew assignments from sample data (shift D for today).
  // Crew sample stores vesselName in formats like "KNO 101" / "RS 21" (with space).
  // Tug master has codes like "KNO101" / "RS21" (no space) and names like "K.N.O. 101".
  // Crew sample's positionCode field is the position name (e.g. "MASTER"); we need MTPP01 codes ("MS").
  // We map via departmentId — which aligns with positions[].id.
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
    const key = `${today}:morning:${tug.code}:${posEntry.code}`
    crewAssignments[key] = {
      employeeId: c.employeeId,
      fullName: c.fullName,
      licenceDoc: 'e-unit://doc/' + c.employeeId,
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
    berthLog,
    crewAssignments,
    schedule: seededSchedule,
    scheduleUploads: [], // history of upload events
    date: today,
    shift: 'morning',
    // Mobile app UI state — persisted so refresh doesn't lose session
    captainSession: { selectedTug: null, currentMovementId: null, view: 'home', standbyReason: '' },
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

        // Berth log actions
        addBerthLog: (entry) =>
          set(s => ({ berthLog: [{ id: `BL${Date.now()}`, ...entry }, ...s.berthLog] })),

        // Crew assignment actions
        assignCrew: (key, data) =>
          set(s => ({ crewAssignments: { ...s.crewAssignments, [key]: data } })),

        clearCrew: (key) =>
          set(s => {
            const { [key]: _, ...rest } = s.crewAssignments
            return { crewAssignments: rest }
          }),

        // Schedule edits
        updateMovement: (id, patch) =>
          set(s => ({ schedule: s.schedule.map(m => m.id === id ? { ...m, ...patch } : m) })),

        // Mobile session state
        setCaptainSession: (patch) => set(s => ({ captainSession: { ...s.captainSession, ...patch } })),
        setCrewSession: (patch) => set(s => ({ crewSession: { ...s.crewSession, ...patch } })),

        // ============ Plan workflow ============
        // Upload a new batch of movements from port (simulates file parse)
        uploadScheduleBatch: (batch) => {
          const now = new Date().toISOString()
          const newMovements = batch.movements.map(m => ({
            // Pre-compute required tug requirement (simplified — uses existing matrix heuristic)
            required: m.required || inferRequired(m, get().terminalMatrix),
            ...m,
            planStatus: 'uploaded',
            fleetConfirmStatus: null,
            isOvernight: isOvernight(m.scheduledTime),
            uploadedAt: now,
            postedAt: null,
          }))
          set(s => ({
            // Replace any prior movements with same IDs (re-upload idempotent)
            schedule: [...s.schedule.filter(m => !newMovements.find(n => n.id === m.id)), ...newMovements]
              .sort((a, b) => String(a.scheduledTime).localeCompare(String(b.scheduledTime))),
            scheduleUploads: [{ at: now, filename: batch.filename, source: batch.source, count: newMovements.length }, ...s.scheduleUploads],
          }))
        },

        // Fleet Confirm — validate each uploaded movement against current readiness
        runFleetConfirm: () => {
          const { schedule, readiness, tugs } = get()
          const confirmed = schedule.map(m => {
            if (m.planStatus !== 'uploaded' && m.planStatus !== 'no-tug') return m // only confirm uploaded/retry
            const r = m.required || {}
            const needed = (m.operation === 'berth' ? r.tugsIn : r.tugsOut) || 0
            const sizeHint = (r.tugSize || '').toLowerCase()
            // Count ready tugs matching size
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

        // Post — publish fleet-confirmed movements so Captain/Crew apps can see them
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

        getCrewForTug: (tugCode, date, shift) => {
          const { crewAssignments, tugs, positions } = get()
          const tug = tugs.find(t => t.code === tugCode)
          if (!tug) return []
          const ps = positions[tug.positionSet] || []
          return ps.map(p => {
            const key = `${date}:${shift}:${tugCode}:${p.code}`
            const assignment = crewAssignments[key]
            return { ...p, assignment }
          })
        },
      }),
      {
        name: 'sc-tug-demo-v2',
        version: 5,
        migrate: () => undefined, // on version change, drop persisted state and re-seed
        // Only persist runtime state, not seed (seed is re-loaded from imports)
        partialize: (s) => ({
          lang: s.lang,
          readiness: s.readiness,
          allocations: s.allocations,
          jobStatuses: s.jobStatuses,
          berthLog: s.berthLog,
          crewAssignments: s.crewAssignments,
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

// Infer required tugs from terminal matrix for a movement (simplified heuristic)
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

// Cross-tab sync: listen for localStorage events and rehydrate
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'sc-tug-demo-v2' && e.newValue) {
      try {
        useStore.persist.rehydrate()
      } catch (err) { /* ignore */ }
    }
  })
}
