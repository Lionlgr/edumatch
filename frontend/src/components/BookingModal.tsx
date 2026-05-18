import { FormEvent, useEffect, useState } from 'react'
import { Tutor } from '../types'
import { getUser } from '../auth'

interface Props {
  tutor: Tutor
  onClose: () => void
}

const SLOTS = [
  'Lun. 14h-15h',
  'Lun. 16h-17h',
  'Mar. 10h-11h',
  'Mer. 18h-19h',
  'Jeu. 09h-10h',
  'Ven. 17h-18h',
  'Sam. 11h-12h',
]

export default function BookingModal({ tutor, onClose }: Props) {
  const user = getUser()
  const [slot, setSlot] = useState<string>(SLOTS[0])
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setDone(true)
    }, 700)
  }

  const eurosPerHour = (tutor.hourlyRateCents / 100).toFixed(0)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-[fadeIn_0.15s_ease-out]"
        onClick={e => e.stopPropagation()}
      >
        {!done ? (
          <>
            <div className="bg-gradient-to-br from-brand-600 to-fuchsia-600 px-6 py-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-white/70 uppercase tracking-wider">
                    Demande de créneau
                  </p>
                  <h2 className="mt-1 text-xl font-bold">{tutor.fullName}</h2>
                  <p className="text-sm text-white/80 mt-0.5">
                    {tutor.subjects.slice(0, 3).join(' · ')} · {eurosPerHour}€/h
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition"
                  aria-label="Fermer"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={onSubmit} className="p-6 space-y-5">
              {!user && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  💡 Tu n'es pas connecté — la demande sera envoyée en tant qu'invité.
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Créneau souhaité
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SLOTS.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSlot(s)}
                      className={`rounded-lg px-3 py-2 text-xs font-medium transition border ${
                        slot === s
                          ? 'border-brand-600 bg-brand-50 text-brand-700'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Message au tuteur <span className="font-normal text-slate-400">(optionnel)</span>
                </label>
                <textarea
                  className="input min-h-[80px] resize-none"
                  placeholder="Bonjour, j'ai besoin d'aide pour préparer mon examen…"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  maxLength={500}
                />
                <p className="mt-1 text-[11px] text-slate-400 text-right">
                  {message.length}/500
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={onClose} className="btn-ghost">
                  Annuler
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Envoi…' : 'Envoyer la demande'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-bold text-slate-900">Demande envoyée !</h3>
            <p className="mt-2 text-sm text-slate-600">
              <strong>{tutor.fullName}</strong> a reçu ta demande pour le créneau{' '}
              <strong>{slot}</strong>. Tu seras notifié dès qu'iel répond.
            </p>
            <p className="mt-3 text-[11px] text-slate-400 italic">
              (Démo — le booking-service n'est pas encore déployé. Aucune donnée persistée.)
            </p>
            <button onClick={onClose} className="btn-primary mt-6 w-full">
              Continuer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
