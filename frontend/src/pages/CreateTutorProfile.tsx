import { FormEvent, KeyboardEvent, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ApiError, apiFetch, useAuth } from '../auth'
import { Tutor } from '../types'

const SUGGESTED = ['math', 'algebra', 'calculus', 'physics', 'english', 'java', 'algorithms', 'computer-science']

export default function CreateTutorProfile() {
  const user = useAuth()
  const navigate = useNavigate()

  const [subjects, setSubjects] = useState<string[]>([])
  const [subjectInput, setSubjectInput] = useState('')
  const [hourlyRate, setHourlyRate] = useState('30')
  const [yearsExperience, setYearsExperience] = useState('1')
  const [bio, setBio] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'TUTOR' && user.role !== 'ADMIN') {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8">
          <p className="text-3xl mb-3">🔒</p>
          <h1 className="text-lg font-bold text-slate-900">Réservé aux tuteurs</h1>
          <p className="mt-2 text-sm text-slate-600">
            Ton compte est un compte <strong>étudiant</strong>. Crée un compte avec le rôle
            « Tuteur » pour publier une annonce.
          </p>
          <button onClick={() => navigate('/')} className="btn-primary mt-5">
            Retour au catalogue
          </button>
        </div>
      </div>
    )
  }

  function addSubject(raw: string) {
    const s = raw.trim().toLowerCase().replace(/\s+/g, '-')
    if (s && !subjects.includes(s) && subjects.length < 10) {
      setSubjects([...subjects, s])
    }
    setSubjectInput('')
  }

  function onSubjectKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSubject(subjectInput)
    } else if (e.key === 'Backspace' && !subjectInput && subjects.length) {
      setSubjects(subjects.slice(0, -1))
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (subjects.length === 0) {
      setError('Ajoute au moins une matière.')
      return
    }
    setLoading(true)
    try {
      await apiFetch<Tutor>('/api/tutors', {
        method: 'POST',
        body: JSON.stringify({
          fullName: user!.fullName,
          subjects,
          hourlyRateCents: Math.round(parseFloat(hourlyRate || '0') * 100),
          yearsExperience: parseInt(yearsExperience || '0', 10),
          bio: bio.trim(),
        }),
      })
      navigate('/')
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setError('Tu as déjà publié un profil tuteur.')
      } else {
        setError(e instanceof Error ? e.message : 'Erreur')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Publier mon profil tuteur</h1>
          <p className="text-sm text-slate-500 mt-1">
            Ton annonce apparaîtra dans le catalogue, sous le nom <strong>{user.fullName}</strong>.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Subjects */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Matières enseignées
            </label>
            <div className="rounded-xl border border-slate-200 bg-white p-2 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200">
              <div className="flex flex-wrap gap-1.5">
                {subjects.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-200">
                    {s}
                    <button type="button" onClick={() => setSubjects(subjects.filter(x => x !== s))} className="text-brand-400 hover:text-brand-700">×</button>
                  </span>
                ))}
                <input
                  className="flex-1 min-w-[120px] bg-transparent px-1.5 py-1 text-sm focus:outline-none placeholder:text-slate-400"
                  placeholder={subjects.length ? 'Ajouter…' : 'math, java, anglais…'}
                  value={subjectInput}
                  onChange={e => setSubjectInput(e.target.value)}
                  onKeyDown={onSubjectKey}
                  onBlur={() => subjectInput && addSubject(subjectInput)}
                />
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SUGGESTED.filter(s => !subjects.includes(s)).slice(0, 6).map(s => (
                <button key={s} type="button" onClick={() => addSubject(s)}
                  className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition">
                  + {s}
                </button>
              ))}
            </div>
          </div>

          {/* Rate + experience */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tarif horaire (€)
              </label>
              <input className="input" type="number" min={0} step={1} required
                value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Années d'expérience
              </label>
              <input className="input" type="number" min={0} max={80} required
                value={yearsExperience} onChange={e => setYearsExperience(e.target.value)} />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Présentation <span className="font-normal text-slate-400">(optionnel)</span>
            </label>
            <textarea className="input min-h-[90px] resize-none" maxLength={2000}
              placeholder="Décris ton parcours, ta pédagogie, tes spécialités…"
              value={bio} onChange={e => setBio(e.target.value)} />
          </div>

          {error && (
            <p className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => navigate('/')} className="btn-ghost">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Publication…' : 'Publier mon annonce'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
