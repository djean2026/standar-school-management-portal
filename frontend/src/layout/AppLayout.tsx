import { GraduationCap, LogOut } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { roleLabels } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', label: 'Tableau de bord', roles: ['PLATFORM_ADMIN', 'SCHOOL_ADMIN', 'REGISTRAR', 'TEACHER'] as const },
  { to: '/etablissements', label: 'Établissements', roles: ['PLATFORM_ADMIN'] as const },
  { to: '/scolarite', label: 'Scolarité', roles: ['SCHOOL_ADMIN', 'REGISTRAR'] as const },
  { to: '/presence', label: 'Présences', roles: ['SCHOOL_ADMIN', 'TEACHER'] as const },
  { to: '/notes', label: 'Notes', roles: ['SCHOOL_ADMIN', 'TEACHER'] as const },
  { to: '/rapports', label: 'Rapports', roles: ['SCHOOL_ADMIN', 'REGISTRAR', 'TEACHER'] as const },
]

export function AppLayout() {
  const { user, logout, hasRole } = useAuth()

  return (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col">
        <div className="p-5 border-b border-slate-700 flex items-center gap-2">
          <GraduationCap className="text-sky-400" size={28} />
          <div>
            <p className="font-semibold text-sm leading-tight">Portail scolaire</p>
            <p className="text-xs text-slate-400">Gestion MVP</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems
            .filter((item) => item.roles.some((r) => hasRole(r)))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm transition ${
                    isActive ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
        </nav>
        <div className="p-4 border-t border-slate-700 text-sm">
          <p className="font-medium truncate">{user?.fullName}</p>
          <p className="text-slate-400 text-xs truncate">{user?.tenantName ?? 'Plateforme'}</p>
          <p className="text-slate-500 text-xs mt-1">{user && roleLabels[user.role]}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-3 flex items-center gap-2 text-slate-300 hover:text-white text-xs"
          >
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
