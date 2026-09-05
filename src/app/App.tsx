import { Navigate, Route, Routes } from 'react-router-dom'
import { LayoutsListPage } from '../features/layouts/LayoutsListPage'
import { EditorPage } from '../features/editor/EditorPage'
import { AuthBootstrap, RedirectIfAuthed, RequireAuth } from '../features/auth/AuthGate'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { SignupPage } from '../features/auth/pages/SignupPage'
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage'
import { ChangePasswordPage } from '../features/auth/pages/ChangePasswordPage'

export function App() {
  return (
    <AuthBootstrap>
      <Routes>
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/login" element={<RedirectIfAuthed><LoginPage /></RedirectIfAuthed>} />
        <Route path="/signup" element={<RedirectIfAuthed><SignupPage /></RedirectIfAuthed>} />
        <Route path="/forgot-password" element={<RedirectIfAuthed><ForgotPasswordPage /></RedirectIfAuthed>} />
        <Route path="/reset-password" element={<RedirectIfAuthed><ResetPasswordPage /></RedirectIfAuthed>} />
        <Route path="/change-password" element={<RequireAuth><ChangePasswordPage /></RequireAuth>} />
        <Route path="/projects" element={<RequireAuth><LayoutsListPage /></RequireAuth>} />
        <Route path="/layouts" element={<Navigate to="/projects" replace />} />
        <Route path="/editor/:layoutId" element={<RequireAuth><EditorPage /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </AuthBootstrap>
  )
}
