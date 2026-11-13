import { useAuth } from '../context/AuthContext'
import { roleLabels } from '../lib/api'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
      <p className="text-slate-600 mt-1">Bienvenue, {user?.fullName}.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200">
          <h2 className="font-semibold text-slate-800">Votre rôle</h2>
          <p className="text-slate-600 mt-2">{user && roleLabels[user.role]}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200">
          <h2 className="font-semibold text-slate-800">Établissement</h2>
          <p className="text-slate-600 mt-2">{user?.tenantName ?? 'Administration plateforme'}</p>
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-sky-50 border border-sky-100 p-5 text-sm text-slate-700">
        <p className="font-medium text-sky-900">Parcours pilote MVP</p>
        <ol className="list-decimal list-inside mt-2 space-y-1">
          <li>Configurer l&apos;année scolaire et les sections (administration)</li>
          <li>Inscrire les élèves et les affecter à une section (scolarité)</li>
          <li>Saisir les présences (enseignants)</li>
          <li>Entrer les notes et publier les résultats (administration)</li>
          <li>Exporter les rapports de présence</li>
        </ol>
      </div>
    </div>
  )
}
