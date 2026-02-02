'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import toast from 'react-hot-toast'
import { Libro, StatoLibro } from '@/types/database'

interface BookDetailsPanelProps {
  libro: Libro
  onDelete: () => void
  onUpdate: () => void
}

const statusConfig: Record<StatoLibro, { label: string; class: string }> = {
  bozza: { label: 'Bozza', class: 'bg-gray-100 text-gray-600' },
  in_lavorazione: { label: 'In lavorazione', class: 'bg-accent/10 text-accent' },
  completato: { label: 'Completato', class: 'bg-green-100 text-green-700' },
  pubblicato: { label: 'Pubblicato', class: 'bg-primary/10 text-primary' },
}

const coverGradients = [
  'bg-gradient-to-br from-primary to-primary-light',
  'bg-gradient-to-br from-accent to-accent-dark',
  'bg-gradient-to-br from-amber-400 to-amber-600',
  'bg-gradient-to-br from-primary to-accent',
]

export default function BookDetailsPanel({ libro, onDelete, onUpdate }: BookDetailsPanelProps) {
  const { updateLibro } = useAppStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    titolo: libro.titolo,
    sottotitolo: libro.sottotitolo || '',
    descrizione: libro.descrizione || '',
    genere: libro.genere || '',
  })

  const status = statusConfig[libro.stato]
  const coverIndex = libro.id.charCodeAt(0) % coverGradients.length
  const coverClass = coverGradients[coverIndex]

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('libri')
        .update({
          titolo: editData.titolo,
          sottotitolo: editData.sottotitolo || null,
          descrizione: editData.descrizione || null,
          genere: editData.genere || null,
        })
        .eq('id', libro.id)

      if (error) throw error

      updateLibro(libro.id, editData)
      setIsEditing(false)
      toast.success('Modifiche salvate')
      onUpdate()
    } catch (error: any) {
      console.error('Errore salvataggio:', error)
      toast.error('Errore nel salvataggio')
    }
  }

  const handleStatusChange = async (newStatus: StatoLibro) => {
    try {
      const { error } = await supabase
        .from('libri')
        .update({ stato: newStatus })
        .eq('id', libro.id)

      if (error) throw error

      updateLibro(libro.id, { stato: newStatus })
      toast.success('Stato aggiornato')
      onUpdate()
    } catch (error: any) {
      console.error('Errore aggiornamento stato:', error)
      toast.error('Errore nell\'aggiornamento')
    }
  }

  // Calcola tempo di lettura stimato (200 parole/minuto)
  const tempoLettura = Math.ceil(libro.parole_totali / 200)
  const ore = Math.floor(tempoLettura / 60)
  const minuti = tempoLettura % 60
  const tempoLetturaStr = ore > 0 ? `${ore}h ${minuti}min` : `${minuti} min`

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Cover */}
        <div className="flex-shrink-0">
          <div className={`w-48 h-64 rounded-xl ${coverClass} flex items-center justify-center relative overflow-hidden`}>
            {libro.copertina_url ? (
              <img
                src={libro.copertina_url}
                alt={libro.titolo}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            )}
            
            {/* Change cover button */}
            <button className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full opacity-0 hover:opacity-100 transition-opacity flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Cambia
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editData.titolo}
                onChange={(e) => setEditData({ ...editData, titolo: e.target.value })}
                className="input text-2xl font-serif font-bold"
                placeholder="Titolo"
              />
              <input
                type="text"
                value={editData.sottotitolo}
                onChange={(e) => setEditData({ ...editData, sottotitolo: e.target.value })}
                className="input"
                placeholder="Sottotitolo"
              />
              <textarea
                value={editData.descrizione}
                onChange={(e) => setEditData({ ...editData, descrizione: e.target.value })}
                className="input min-h-[100px]"
                placeholder="Descrizione (quarta di copertina)"
              />
              <div className="flex gap-2">
                <button onClick={handleSave} className="btn btn-primary">
                  Salva
                </button>
                <button onClick={() => setIsEditing(false)} className="btn btn-secondary">
                  Annulla
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl lg:text-3xl font-serif font-bold text-gray-900">
                  {libro.titolo}
                </h1>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Modifica"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={onDelete}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Elimina"
                  >
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {libro.sottotitolo && (
                <p className="text-lg text-gray-500 mb-4">{libro.sottotitolo}</p>
              )}

              {/* Meta info */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                {libro.genere && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {libro.genere}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {libro.parole_totali.toLocaleString('it-IT')} parole
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ~{tempoLetturaStr} lettura
                </span>
              </div>

              {/* Status selector */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-500">Stato:</span>
                <div className="flex gap-1">
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => handleStatusChange(key as StatoLibro)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        libro.stato === key
                          ? config.class
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              {libro.descrizione && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                    Quarta di copertina
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {libro.descrizione}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
