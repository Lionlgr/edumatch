import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { apiFetch, useAuth } from '../auth'
import { User } from '../types'

export default function Profile() {
  const cached = useAuth()
  const [user, setUser] = useState<User | null>(cached)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!cached) return
    apiFetch<User>('/api/users/me')
      .then(setUser)
      .catch(e => setError(e.message))
  }, [cached])

  if (!cached) return <Navigate to="/login" replace />

  const roleBadge = {
    STUDENT: { label: '📚 Étudiant', cls: 'bg-blue-100 text-blue-800' },
    TUTOR:   { label: '🎓 Tuteur',   cls: 'bg-emerald-100 text-emerald-800' },
    ADMIN:   { label: '🛡️ Admin',    cls: 'bg-rose-100 text-rose-800' },
  }[user?.role ?? cached.role]

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
        <div className="flex items-start gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center
                          rounded-2xl bg-gradient-to-br from-brand-500 to-fuchsia-500
                          text-2xl font-bold text-white shadow-lg">
            {(user?.fullName ?? cached.fullName).split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">
              {user?.fullName ?? cached.fullName}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">{user?.email ?? cached.email}</p>
            <span className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${roleBadge.cls}`}>
              {roleBadge.label}
            </span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="ID utilisateur (UUID)" value={user?.id ?? cached.id} mono />
          <Field
            label="Membre depuis"
            value={new Date(user?.createdAt ?? cached.createdAt).toLocaleString('fr-FR', {
              dateStyle: 'long',
              timeStyle: 'short',
            })}
          />
        </div>

        {error && (
          <p className="mt-6 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
            Impossible de rafraîchir les données : {error}
          </p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/" className="btn-primary">← Retour au catalogue</Link>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">🔐 Sécurité</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Ces données ont été récupérées via <code className="bg-white px-1.5 py-0.5 rounded font-mono text-[11px]">GET /api/users/me</code>{' '}
          avec un token JWT signé HS256. La requête transite par Istio Gateway puis le sidecar Envoy
          du user-service en mTLS STRICT, et le <code className="bg-white px-1.5 py-0.5 rounded font-mono text-[11px]">AuthorizationPolicy</code> vérifie
          que la requête vient bien de l'<code className="bg-white px-1.5 py-0.5 rounded font-mono text-[11px]">istio-ingressgateway-service-account</code>.
        </p>
      </div>
    </div>
  )
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`mt-1 text-sm text-slate-900 ${mono ? 'font-mono text-xs break-all' : ''}`}>
        {value}
      </div>
    </div>
  )
}
