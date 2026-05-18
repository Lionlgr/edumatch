import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch, setAuth } from '../auth'
import { AuthResponse, Role } from '../types'

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<Role>('STUDENT')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const auth = await apiFetch<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName, role }),
      })
      setAuth(auth)
      navigate('/me')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Inscription</h1>
          <p className="text-sm text-slate-500 mt-1">
            Rejoins la plateforme en 30 secondes
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nom complet
            </label>
            <input
              className="input"
              required
              autoComplete="name"
              placeholder="Alice Étudiante"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email
            </label>
            <input
              className="input"
              type="email"
              required
              autoComplete="email"
              placeholder="alice@miage.fr"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mot de passe <span className="font-normal text-slate-400">(min. 8 caractères)</span>
            </label>
            <input
              className="input"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Je suis…
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`rounded-xl border-2 p-4 text-left transition ${
                  role === 'STUDENT'
                    ? 'border-brand-600 bg-brand-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-xl mb-1">📚</div>
                <div className="text-sm font-semibold text-slate-900">Étudiant</div>
                <div className="text-xs text-slate-500">Je cherche un tuteur</div>
              </button>
              <button
                type="button"
                onClick={() => setRole('TUTOR')}
                className={`rounded-xl border-2 p-4 text-left transition ${
                  role === 'TUTOR'
                    ? 'border-brand-600 bg-brand-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-xl mb-1">🎓</div>
                <div className="text-sm font-semibold text-slate-900">Tuteur</div>
                <div className="text-xs text-slate-500">Je donne des cours</div>
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Déjà inscrit ?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
            Connexion
          </Link>
        </p>
      </div>
    </div>
  )
}
