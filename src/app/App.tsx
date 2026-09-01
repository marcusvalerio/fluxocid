import { Navigate, Route, Routes } from 'react-router-dom'
import { LayoutsListPage } from '../features/layouts/LayoutsListPage'
import { EditorPage } from '../features/editor/EditorPage'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/layouts" replace />} />
      <Route path="/layouts" element={<LayoutsListPage />} />
      <Route path="/editor/:layoutId" element={<EditorPage />} />
      <Route path="*" element={<Navigate to="/layouts" replace />} />
    </Routes>
  )
}
