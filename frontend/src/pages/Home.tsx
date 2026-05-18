import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../auth'
import { Tutor } from '../types'
import TutorCard from '../components/TutorCard'
import BookingModal from '../components/BookingModal'

const POPULAR_SUBJECTS = ['math', 'java', 'english', 'physics']

export default function Home() {
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subject, setSubject] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  const [bookingTutor, setBookingTutor] = useState<Tutor | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const qs = subject ? `?subject=${encodeURIComponent(subject)}` : ''
    apiFetch<Tutor[]>(`/api/tutors${qs}`)
      .then(setTutors)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [subject])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return tutors
    return tutors.filter(t =>
      t.fullName.toLowerCase().includes(q) ||
      t.bio?.toLowerCase().includes(q) ||
      t.subjects.some(s => s.toLowerCase().includes(q))
    )
  }, [tutors, search])

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16">
      {/* Hero */}
      <section className="pt-12 pb-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="chip">🚀 Master MIAGE GR2 · Projet Cloud Native</span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
            Trouve ton{' '}
            <span className="bg-gradient-to-r from-brand-600 to-fuchsia-600 bg-clip-text text-transparent">
              tuteur idéal
            </span>
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Marketplace de tutorat universitaire. Trouve un tuteur par matière,
            réserve un créneau en quelques clics.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Recherche libre
            </label>
            <input
              className="input"
              placeholder="Nom, matière, description…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="sm:w-64">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Matière (backend filter)
            </label>
            <select
              className="input"
              value={subject}
              onChange={e => setSubject(e.target.value)}
            >
              <option value="">Toutes</option>
              {POPULAR_SUBJECTS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="text-xs text-slate-500 mr-1">Suggestions :</span>
          {POPULAR_SUBJECTS.map(s => (
            <button
              key={s}
              onClick={() => setSubject(s === subject ? '' : s)}
              className={`text-xs px-2.5 py-1 rounded-full transition font-medium ${
                subject === s
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* Results */}
      <section>
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
            <p className="mt-3 text-sm text-slate-500">Chargement des tuteurs…</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
            <p className="text-sm font-medium text-rose-700">⚠️ {error}</p>
            <p className="text-xs text-rose-600 mt-1">
              Vérifie que <code className="bg-rose-100 px-1 rounded">kubectl port-forward</code> tourne pour user-service et tutor-service.
            </p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-500">Aucun tuteur trouvé</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-700">
                <span className="text-brand-700 font-semibold">{filtered.length}</span>{' '}
                tuteur{filtered.length > 1 ? 's' : ''} {subject && `pour "${subject}"`}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((t, i) => (
                <TutorCard key={t.id} tutor={t} index={i} onBook={setBookingTutor} />
              ))}
            </div>
          </>
        )}
      </section>

      {bookingTutor && (
        <BookingModal tutor={bookingTutor} onClose={() => setBookingTutor(null)} />
      )}
    </div>
  )
}
