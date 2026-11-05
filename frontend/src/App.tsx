import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ScannerPage from './pages/ScannerPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/scanner" element={<ScannerPage />} />
      <Route path="/analyze" element={<ScannerPage />} />
      {/* Catch-all: redirect any unknown path back to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
