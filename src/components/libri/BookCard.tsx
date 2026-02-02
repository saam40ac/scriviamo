'use client'

import Link from 'next/link'
import { Libro } from '@/types/database'

interface BookCardProps {
  libro: Libro
}

const statusConfig = {
  bozza: { label: 'Bozza', class: 'bg-gray-100 text-gray-600' },
  in_lavorazione: { label: 'In corso', class: 'bg-accent/10 text-accent' },
  completato: { label: 'Completato', class: 'bg-green-100 text-green-700' },
  pubblicato: { label: 'Pubblicato', class: 'bg-primary/10 text-primary' },
}

const coverGradients = [
  'book-cover-1',
  'book-cover-2',
  'book-cover-3',
  'book-cover-4',
]

export default function BookCard({ libro }: BookCardProps) {
  const status = statusConfig[libro.stato]
  
  // Usa un gradiente basato sull'ID del libro per variare i colori
  const coverIndex = libro.id.charCodeAt(0) % coverGradients.length
  const coverClass = coverGradients[coverIndex]

  // Calcola la percentuale di completamento (placeholder, andrebbe calcolato dai capitoli)
  const progressPercent = libro.stato === 'completato' ? 100 : 
    libro.stato === 'in_lavorazione' ? 50 : 10

  return (
    <Link
      href={`/dashboard/libri/${libro.id}`}
      className="group card overflow-hidden hover:shadow-card-hover"
    >
      {/* Cover */}
      <div className={`h-40 ${coverClass} flex items-center justify-center relative`}>
        {libro.copertina_url ? (
          <img
            src={libro.copertina_url}
            alt={libro.titolo}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg className="w-12 h-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )}
        
        {/* Status badge */}
        <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${status.class}`}>
          {status.label}
        </span>
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-serif text-lg font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-accent transition-colors">
          {libro.titolo}
        </h3>
        
        {libro.sottotitolo && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-1">
            {libro.sottotitolo}
          </p>
        )}

        {/* Progress */}
        <div className="mb-3">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            {libro.parole_totali.toLocaleString('it-IT')} parole
          </span>
          <span>{progressPercent}%</span>
        </div>
      </div>
    </Link>
  )
}
