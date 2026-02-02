'use client'

import { Capitolo, Paragrafo, StatoCapitolo, StatoParagrafo } from '@/types/database'

interface EditorSidebarProps {
  capitoli: Capitolo[]
  paragrafi: Paragrafo[]
  currentCapitolo: Capitolo | null
  currentParagrafo: Paragrafo | null
  onSelectCapitolo: (capitolo: Capitolo) => void
  onSelectParagrafo: (paragrafo: Paragrafo) => void
  onAddParagrafo: () => void
  notes: string
  onNotesChange: (notes: string) => void
}

const statusColors: Record<StatoParagrafo, string> = {
  bozza: 'border-2 border-gray-300 bg-white',
  in_lavorazione: 'bg-accent',
  completato: 'bg-green-500',
}

export default function EditorSidebar({
  capitoli,
  paragrafi,
  currentCapitolo,
  currentParagrafo,
  onSelectCapitolo,
  onSelectParagrafo,
  onAddParagrafo,
  notes,
  onNotesChange,
}: EditorSidebarProps) {
  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
      {/* Chapter selector */}
      <div className="p-4 border-b border-gray-200">
        <select
          value={currentCapitolo?.id || ''}
          onChange={(e) => {
            const cap = capitoli.find(c => c.id === e.target.value)
            if (cap) onSelectCapitolo(cap)
          }}
          className="input text-sm"
        >
          {capitoli.map((cap) => (
            <option key={cap.id} value={cap.id}>
              Cap. {cap.numero_ordine}: {cap.titolo}
            </option>
          ))}
        </select>
      </div>

      {/* Paragraphs list */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Paragrafi
        </h3>
        
        <div className="space-y-1">
          {paragrafi.map((paragrafo) => {
            const isActive = currentParagrafo?.id === paragrafo.id
            
            return (
              <button
                key={paragrafo.id}
                onClick={() => onSelectParagrafo(paragrafo)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-primary/10 border-l-3 border-primary'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className={`w-4 h-4 rounded-full flex-shrink-0 ${statusColors[paragrafo.stato]}`}>
                  {paragrafo.stato === 'completato' && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm truncate ${isActive ? 'font-medium text-primary' : 'text-gray-700'}`}>
                  § {currentCapitolo?.numero_ordine}.{paragrafo.numero_ordine} - {paragrafo.titolo}
                </span>
              </button>
            )
          })}
        </div>

        <button
          onClick={onAddParagrafo}
          className="w-full flex items-center gap-2 p-3 mt-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm">Nuovo paragrafo</span>
        </button>
      </div>

      {/* Notes section */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Note del capitolo
          </h4>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Appunti, idee, riferimenti..."
            className="w-full h-24 p-2 text-sm bg-white border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-primary"
          />
        </div>
      </div>
    </div>
  )
}
