import { useEffect, useState, type FormEvent } from 'react'
import { api, type Tenant } from '../lib/api'

export function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [slug, setSlug] = useState('')
  const [name, setName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminName, setAdminName] = useState('')
  const [adminPassword, setAdminPassword] = useState('demo1234')
  const [message, setMessage] = useState<string | null>(null)

  async function load() {
    setTenants(await api<Tenant[]>('/api/v1/tenants'))
  }

  useEffect(() => {
    load().catch(console.error)
  }, [])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    setMessage(null)
    await api('/api/v1/tenants', {
      method: 'POST',
      body: JSON.stringify({
        slug,
        name,
        timezone: 'America/Montreal',
        adminEmail,
        adminFullName: adminName,
        adminPassword,
      }),
    })
    setMessage('Établissement créé avec succès.')
    setSlug('')
    setName('')
    await load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Établissements</h1>
      <p className="text-slate-600 text-sm mt-1">Créer ou consulter les locataires (écoles).</p>

      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <form onSubmit={onCreate} className="rounded-xl bg-white p-5 shadow-sm border space-y-3">
          <h2 className="font-semibold">Nouvel établissement</h2>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Identifiant (slug)" value={slug} onChange={(e) => setSlug(e.target.value)} required />
          <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nom de l'école" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Courriel administrateur" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />
          <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Nom complet administrateur" value={adminName} onChange={(e) => setAdminName(e.target.value)} required />
          <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Mot de passe initial" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required />
          <button type="submit" className="rounded-lg bg-sky-600 text-white px-4 py-2 text-sm hover:bg-sky-700">Créer</button>
          {message && <p className="text-sm text-green-700">{message}</p>}
        </form>

        <div className="rounded-xl bg-white p-5 shadow-sm border">
          <h2 className="font-semibold mb-3">Liste</h2>
          <ul className="divide-y text-sm">
            {tenants.map((t) => (
              <li key={t.id} className="py-2 flex justify-between gap-2">
                <span>{t.name}</span>
                <span className="text-slate-500">{t.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
