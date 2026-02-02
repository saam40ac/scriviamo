'use client'

import { useState } from 'react'
import { Libro, Capitolo } from '@/types/database'
import toast from 'react-hot-toast'

interface ExportModalProps {
  libro: Libro
  capitoli: Capitolo[]
  onClose: () => void
}

type ExportFormat = 'docx' | 'pdf' | 'epub'

const exportOptions: { format: ExportFormat; icon: string; name: string; desc: string }[] = [
  { format: 'docx', icon: 'word', name: 'Word', desc: '.docx' },
  { format: 'pdf', icon: 'pdf', name: 'PDF', desc: 'Amazon KDP' },
  { format: 'epub', icon: 'book', name: 'ePub', desc: 'eBook' },
]

const icons: Record<string, JSX.Element> = {
  word: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  pdf: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  book: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
}

export default function ExportModal({ libro, capitoli, onClose }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('docx')
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      // Per ora mostriamo un messaggio - l'export vero verrà implementato
      toast.success(`Esportazione in ${selectedFormat.toUpperCase()} avviata!`)
      
      // Simula un delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Qui andrà la logica di export reale
      toast.success('Libro esportato con successo!')
      onClose()
    } catch (error: any) {
      console.error('Errore export:', error)
      toast.error('Errore durante l\'esportazione')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content w-full max-w-lg" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Esporta Libro
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Seleziona il formato di esportazione per "<span className="font-medium">{libro.titolo}</span>"
          </p>

          {/* Format options */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {exportOptions.map((option) => (
              <button
                key={option.format}
                onClick={() => setSelectedFormat(option.format)}
                className={`p-6 rounded-xl border-2 text-center transition-all ${
                  selectedFormat === option.format
                    ? 'border-accent bg-accent/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-14 h-14 rounded-xl mx-auto mb-3 flex items-center justify-center ${
                  selectedFormat === option.format
                    ? 'bg-accent text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {icons[option.icon]}
                </div>
                <p className="font-medium text-gray-800">{option.name}</p>
                <p className="text-xs text-gray-500">{option.desc}</p>
              </button>
            ))}
          </div>

          {/* Info */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p className="font-medium mb-2">Il tuo libro include:</p>
            <ul className="space-y-1">
              <li>• {capitoli.length} capitoli</li>
              <li>• {libro.parole_totali.toLocaleString('it-IT')} parole</li>
              <li>• Copertina e quarta di copertina</li>
              <li>• Indice automatico</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isExporting}
          >
            Annulla
          </button>
          <button
            onClick={handleExport}
            className="btn btn-primary"
            disabled={isExporting}
          >
            {isExporting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Esportazione...
              </span>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Esporta
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
