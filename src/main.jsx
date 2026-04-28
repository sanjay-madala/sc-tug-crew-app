import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles.css'

import Landing from './pages/Landing'
import DispatcherLayout from './layout/DispatcherLayout'
import VesselSchedulePlanner from './pages/dispatcher/VesselSchedulePlanner'
import TugQueuePlanner from './pages/dispatcher/TugQueuePlanner'
import TugReadinessLog from './pages/dispatcher/TugReadinessLog'
import TugShiftPlanner from './pages/dispatcher/TugShiftPlanner'
import CrewAssignment from './pages/dispatcher/CrewAssignment'
import VesselBerthLog from './pages/dispatcher/VesselBerthLog'
import CaptainApp from './pages/captain/CaptainApp'
import CrewApp from './pages/crew/CrewApp'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dispatcher" element={<DispatcherLayout />}>
          <Route index element={<Navigate to="schedule" replace />} />
          <Route path="schedule" element={<VesselSchedulePlanner />} />
          <Route path="queue" element={<TugQueuePlanner />} />
          <Route path="readiness" element={<TugReadinessLog />} />
          <Route path="shift" element={<TugShiftPlanner />} />
          <Route path="crew" element={<CrewAssignment />} />
          <Route path="berth" element={<VesselBerthLog />} />
        </Route>
        <Route path="/captain" element={<CaptainApp />} />
        <Route path="/crew" element={<CrewApp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
