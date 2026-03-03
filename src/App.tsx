import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import DisplayScreen from './routes/display'
import LoginPage from './routes/admin/login'
import DashboardPage from './routes/admin/dashboard'
import PageEditorRoute from './routes/admin/page-editor'
import { AuthGuard } from './components/admin/AuthGuard'

export default function App() {
  return (
    <TooltipProvider>
      <HashRouter>
        <Routes>
          {/* ── TV Display ── */}
          <Route path="/" element={<DisplayScreen />} />

          {/* ── Admin ── */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin" element={<AuthGuard><DashboardPage /></AuthGuard>} />
          <Route path="/admin/pages/:id" element={<AuthGuard><PageEditorRoute /></AuthGuard>} />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
      <Toaster />
    </TooltipProvider>
  )
}
