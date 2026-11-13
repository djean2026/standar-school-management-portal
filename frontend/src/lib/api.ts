const TOKEN_KEY = 'school_portal_token'

/** Backend séparé : définir VITE_API_BASE_URL (ex. http://localhost:8080). Vide = même origine (proxy dev optionnel). */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

function apiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const normalized = path.startsWith('/') ? path : `/${path}`
  return API_BASE_URL ? `${API_BASE_URL}${normalized}` : normalized
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(apiUrl(path), { ...init, headers })
  if (!res.ok) {
    let message = res.statusText
    try {
      const body = await res.json()
      message = body.detail ?? body.title ?? message
    } catch {
      /* ignore */
    }
    throw new ApiError(message, res.status)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export type Role = 'PLATFORM_ADMIN' | 'SCHOOL_ADMIN' | 'REGISTRAR' | 'TEACHER'

export interface LoginResponse {
  token: string
  userId: string
  fullName: string
  email: string
  tenantId: string | null
  tenantName: string | null
  role: Role
}

export interface Student {
  id: string
  studentNumber: string
  firstName: string
  lastName: string
  status: string
  dateOfBirth?: string
}

export interface Tenant {
  id: string
  slug: string
  name: string
  status: string
  timezone: string
}

export interface AcademicConfig {
  years: { id: string; name: string; startDate: string; endDate: string; status: string }[]
  sections: { id: string; name: string; academicYearId: string; gradeLevelId: string }[]
  subjects: { id: string; code: string; name: string }[]
  levels: { id: string; name: string; sortOrder: number }[]
}

export interface Assessment {
  id: string
  title: string
  maxScore: number
  publicationState: string
  sectionId: string
  subjectId: string
}

export interface ImportJob {
  id: string
  status: string
  totalRows: number
  successRows: number
  errorRows: number
  errorsJson?: string
}

export interface AttendanceReportRow {
  date: string
  session: string
  studentName: string
  sectionName: string
  status: string
}

export const DEMO_TENANT_ID = '11111111-1111-1111-1111-111111111111'

export const roleLabels: Record<Role, string> = {
  PLATFORM_ADMIN: 'Administrateur plateforme',
  SCHOOL_ADMIN: 'Directeur(trice) d\'établissement',
  REGISTRAR: 'Secrétaire / admissions',
  TEACHER: 'Enseignant(e)',
}
