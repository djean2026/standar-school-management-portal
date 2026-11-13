import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  api,
  getToken,
  setToken,
  type LoginResponse,
  type Role,
} from '../lib/api'

interface AuthState {
  user: LoginResponse | null
  login: (email: string, password: string, tenantId?: string | null) => Promise<void>
  logout: () => void
  hasRole: (...roles: Role[]) => boolean
}

const AuthContext = createContext<AuthState | null>(null)

function loadStoredUser(): LoginResponse | null {
  const token = getToken()
  const raw = localStorage.getItem('school_portal_user')
  if (!token || !raw) return null
  try {
    return JSON.parse(raw) as LoginResponse
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoginResponse | null>(() => loadStoredUser())

  const login = useCallback(async (email: string, password: string, tenantId?: string | null) => {
    const body: Record<string, unknown> = { email, password }
    if (tenantId) body.tenantId = tenantId
    const res = await api<LoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    setToken(res.token)
    localStorage.setItem('school_portal_user', JSON.stringify(res))
    setUser(res)
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    localStorage.removeItem('school_portal_user')
    setUser(null)
  }, [])

  const hasRole = useCallback(
    (...roles: Role[]) => (user ? roles.includes(user.role) : false),
    [user],
  )

  const value = useMemo(
    () => ({ user, login, logout, hasRole }),
    [user, login, logout, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider')
  return ctx
}
