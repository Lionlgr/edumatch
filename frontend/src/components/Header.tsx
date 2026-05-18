import { Link, useNavigate } from 'react-router-dom'
import { clearAuth, useAuth } from '../auth'

export default function Header() {
  const user = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🎓</span>
          <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-brand-700 transition">
            EduMatch
          </span>
          <span className="hidden sm:inline text-xs font-medium text-slate-500 ml-1">
            · Master MIAGE GR2
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/me" className="btn-ghost">
                <span className="hidden sm:inline mr-1">Bonjour,</span>
                <span className="font-semibold">{user.fullName.split(' ')[0]}</span>
              </Link>
              <button
                onClick={() => { clearAuth(); navigate('/') }}
                className="btn-ghost text-slate-500 hover:text-rose-600"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Connexion</Link>
              <Link to="/register" className="btn-primary">Inscription</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
