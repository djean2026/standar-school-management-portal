import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppLayout } from './layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { NotesPage } from './pages/NotesPage'
import { PresencePage } from './pages/PresencePage'
import { RapportsPage } from './pages/RapportsPage'
import { ScolaritePage } from './pages/ScolaritePage'
import { TenantsPage } from './pages/TenantsPage'
import type { Role } from './lib/api'

const queryClient = new QueryClient()

function Protected({ children, roles }: { children: React.ReactNode; roles?: Role[] }) {
  const { user, hasRole } = useAuth()
  if (!user) return <Navigate to="/connexion" replace />
  if (roles && !roles.some((r) => hasRole(r))) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/connexion" element={<LoginPage />} />
            <Route
              element={
                <Protected>
                  <AppLayout />
                </Protected>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route
                path="etablissements"
                element={
                  <Protected roles={['PLATFORM_ADMIN']}>
                    <TenantsPage />
                  </Protected>
                }
              />
              <Route
                path="scolarite"
                element={
                  <Protected roles={['SCHOOL_ADMIN', 'REGISTRAR']}>
                    <ScolaritePage />
                  </Protected>
                }
              />
              <Route
                path="presence"
                element={
                  <Protected roles={['SCHOOL_ADMIN', 'TEACHER']}>
                    <PresencePage />
                  </Protected>
                }
              />
              <Route
                path="notes"
                element={
                  <Protected roles={['SCHOOL_ADMIN', 'TEACHER']}>
                    <NotesPage />
                  </Protected>
                }
              />
              <Route
                path="rapports"
                element={
                  <Protected roles={['SCHOOL_ADMIN', 'REGISTRAR', 'TEACHER']}>
                    <RapportsPage />
                  </Protected>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
