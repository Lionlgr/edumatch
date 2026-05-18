import { Tutor } from '../types'

const subjectColors: Record<string, string> = {
  math: 'bg-blue-50 text-blue-700 ring-blue-200',
  algebra: 'bg-blue-50 text-blue-700 ring-blue-200',
  calculus: 'bg-blue-50 text-blue-700 ring-blue-200',
  physics: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  thermodynamics: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  english: 'bg-rose-50 text-rose-700 ring-rose-200',
  tofl: 'bg-rose-50 text-rose-700 ring-rose-200',
  literature: 'bg-rose-50 text-rose-700 ring-rose-200',
  java: 'bg-amber-50 text-amber-700 ring-amber-200',
  'computer-science': 'bg-amber-50 text-amber-700 ring-amber-200',
  algorithms: 'bg-amber-50 text-amber-700 ring-amber-200',
}

function colorFor(subject: string): string {
  return subjectColors[subject.toLowerCase()] ?? 'bg-slate-100 text-slate-700 ring-slate-200'
}

function initials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map(s => s[0]).join('').toUpperCase()
}

const avatarColors = [
  'from-violet-500 to-fuchsia-500',
  'from-emerald-500 to-teal-500',
  'from-rose-500 to-orange-500',
  'from-blue-500 to-cyan-500',
]

interface Props {
  tutor: Tutor
  index: number
  onBook: (tutor: Tutor) => void
}

export default function TutorCard({ tutor, index, onBook }: Props) {
  const gradient = avatarColors[index % avatarColors.length]
  const eurosPerHour = (tutor.hourlyRateCents / 100).toFixed(0)

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200
                        bg-white p-6 shadow-soft transition hover:shadow-card hover:border-brand-200">
      <div className="flex items-start gap-4">
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl
                         bg-gradient-to-br ${gradient} text-lg font-bold text-white shadow-sm`}>
          {initials(tutor.fullName)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-base font-semibold text-slate-900 truncate">
              {tutor.fullName}
            </h3>
            <div className="text-right shrink-0">
              <div className="text-lg font-bold text-brand-700">{eurosPerHour}€<span className="text-sm font-medium text-slate-500">/h</span></div>
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-2">
            {tutor.yearsExperience} an{tutor.yearsExperience > 1 ? 's' : ''} d'expérience
          </p>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {tutor.subjects.map(s => (
              <span key={s} className={`inline-flex items-center rounded-full px-2.5 py-0.5
                                          text-xs font-medium ring-1 ring-inset ${colorFor(s)}`}>
                {s}
              </span>
            ))}
          </div>

          {tutor.bio && (
            <p className="text-sm text-slate-600 line-clamp-2">{tutor.bio}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-xs text-slate-400 font-mono">#{tutor.id.slice(0, 8)}</span>
        <button
          onClick={() => onBook(tutor)}
          className="btn-ghost text-brand-700 hover:bg-brand-50 text-xs font-semibold"
        >
          Réserver →
        </button>
      </div>
    </article>
  )
}
