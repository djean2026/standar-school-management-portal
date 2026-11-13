import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { ApiError, DEMO_TENANT_ID } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const demoAccounts = [
  { label: 'Admin plateforme', email: 'admin@plateforme.local', tenantId: null as string | null },
  { label: 'Directrice', email: 'directeur@ecole-pilote.local', tenantId: DEMO_TENANT_ID },
  { label: 'Secrétaire', email: 'inscription@ecole-pilote.local', tenantId: DEMO_TENANT_ID },
  { label: 'Enseignante', email: 'prof@ecole-pilote.local', tenantId: DEMO_TENANT_ID },
]

export function LoginPage() {
  const { user, login } = useAuth()
  const [email, setEmail] = useState('directeur@ecole-pilote.local')
  const [password, setPassword] = useState('demo1234')
  const [tenantId, setTenantId] = useState<string | null>(DEMO_TENANT_ID)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password, tenantId)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Connexion impossible')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-slate-900">Connexion</h1>
        <p className="text-slate-600 text-sm mt-1">Plateforme de gestion scolaire multi-établissements</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="text-slate-700">Courriel</span>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-700">Mot de passe</span>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-700">Identifiant établissement (UUID, optionnel pour la plateforme)</span>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs"
              value={tenantId ?? ''}
              onChange={(e) => setTenantId(e.target.value || null)}
              placeholder="11111111-1111-1111-1111-111111111111"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-sky-600 text-white py-2.5 font-medium hover:bg-sky-700 disabled:opacity-60"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 border-t pt-4">
          <p className="text-xs text-slate-500 mb-2">Comptes démo (mot de passe : demo1234)</p>
          <div className="flex flex-wrap gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                className="text-xs rounded-full bg-slate-100 px-3 py-1 hover:bg-slate-200"
                onClick={() => {
                  setEmail(acc.email)
                  setTenantId(acc.tenantId)
                }}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
