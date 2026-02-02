'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import toast from 'react-hot-toast'
import { Capitolo, Paragrafo, StatoCapitolo } from '@/types/database'

interface ChapterListProps {
  libroId: string
  capitoli: Capitolo[]
  onUpdate: () => void
}

const statusIcons: Record<StatoCapitolo, JSX.Element> = {
  bozza: <div className="w-6 h-6 rounded-full border-2 border-gray-300" />,
  in_lavorazione: (
    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    </div>
  ),
  completato: (
    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  ),
}

export default function ChapterList({ libroId, capitoli, onUpdate }: ChapterListProps) {
  const { addCapitolo, removeCapitolo } = useAppStore()
  const [expandedChapters, setExpandedChapters] = useState<string[]>([])
  const [chapterParagraphs, setChapterParagraphs] = useState<Record<string, Paragrafo[]>>({})
  const [isAddingChapter, setIsAddingChapter] = useState(false)
  const [newChapterTitle, setNewChapterTitle] = useState('')
  const [loadingParagraphs, setLoadingParagraphs] = useState<string | null>(null)

  const toggleChapter = async (chapterId: string) => {
    if (expandedChapters.includes(chapterId)) {
      setExpandedChapters(expandedChapters.filter(id => id !== chapterId))
    } else {
      setExpandedChapters([...expandedChapters, chapterId])
      
      // Load paragraphs if not already loaded
      if (!chapterParagraphs[chapterId]) {
        setLoadingParagraphs(chapterId)
        const { data, error } = await supabase
          .from('paragrafi')
          .select('*')
          .eq('capitolo_id', chapterId)
          .order('numero_ordine', { ascending: true })

        if (!error) {
          setChapterParagraphs(prev => ({ ...prev, [chapterId]: data || [] }))
        }
        setLoadingParagraphs(null)
      }
    }
  }

  const handleAddChapter = async () => {
    if (!newChapterTitle.trim()) {
      toast.error('Inserisci un titolo per il capitolo')
      return
    }

    try {
      const nextOrder = capitoli.length + 1

      const { data, error } = await supabase
        .from('capitoli')
        .insert({
          libro_id: libroId,
          titolo: newChapterTitle.trim(),
          numero_ordine: nextOrder,
          stato: 'bozza',
        })
        .select()
        .single()

      if (error) throw error

      addCapitolo(data)
      setNewChapterTitle('')
      setIsAddingChapter(false)
      toast.success('Capitolo aggiunto')
      onUpdate()
    } catch (error: any) {
      console.error('Errore aggiunta capitolo:', error)
      toast.error('Errore nell\'aggiunta del capitolo')
    }
  }

  const handleDeleteChapter = async (capitolo: Capitolo) => {
    const confirmed = window.confirm(
      `Sei sicuro di voler eliminare "${capitolo.titolo}"? Tutti i paragrafi verranno eliminati.`
    )
    
    if (!confirmed) return

    try {
      const { error } = await supabase
        .from('capitoli')
        .delete()
        .eq('id', capitolo.id)

      if (error) throw error

      removeCapitolo(capitolo.id)
      toast.success('Capitolo eliminato')
      onUpdate()
    } catch (error: any) {
      console.error('Errore eliminazione capitolo:', error)
      toast.error('Errore nell\'eliminazione')
    }
  }

  const handleAddParagraph = async (capitoloId: string) => {
    const paragraphs = chapterParagraphs[capitoloId] || []
    const nextOrder = paragraphs.length + 1

    try {
      const { data, error } = await supabase
        .from('paragrafi')
        .insert({
          capitolo_id: capitoloId,
          titolo: `Paragrafo ${nextOrder}`,
          numero_ordine: nextOrder,
          stato: 'bozza',
          contenuto: '',
        })
        .select()
        .single()

      if (error) throw error

      setChapterParagraphs(prev => ({
        ...prev,
        [capitoloId]: [...(prev[capitoloId] || []), data]
      }))
      
      toast.success('Paragrafo aggiunto')
      onUpdate()
    } catch (error: any) {
      console.error('Errore aggiunta paragrafo:', error)
      toast.error('Errore nell\'aggiunta del paragrafo')
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Indice dei Capitoli</h2>
        <button className="btn btn-ghost text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Riordina
        </button>
      </div>

      {/* Chapters list */}
      <div className="space-y-3">
        {capitoli.map((capitolo) => {
          const isExpanded = expandedChapters.includes(capitolo.id)
          const paragraphs = chapterParagraphs[capitolo.id] || []
          const isLoading = loadingParagraphs === capitolo.id

          return (
            <div
              key={capitolo.id}
              className="border border-gray-200 rounded-xl overflow-hidden hover:border-primary/50 transition-colors"
            >
              {/* Chapter header */}
              <div
                className="flex items-center p-4 bg-gray-50 cursor-pointer"
                onClick={() => toggleChapter(capitolo.id)}
              >
                {statusIcons[capitolo.stato]}
                
                <div className="flex-1 ml-3">
                  <p className="text-xs text-gray-500">Capitolo {capitolo.numero_ordine}</p>
                  <h3 className="font-semibold text-gray-800">{capitolo.titolo}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {capitolo.parole_totali.toLocaleString('it-IT')} parole
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteChapter(capitolo)
                    }}
                    className="p-1.5 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Elimina"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Paragraphs */}
              {isExpanded && (
                <div className="p-4 pt-0">
                  {isLoading ? (
                    <div className="py-4 text-center text-gray-400">
                      Caricamento...
                    </div>
                  ) : (
                    <>
                      {paragraphs.map((paragrafo) => (
                        <Link
                          key={paragrafo.id}
                          href={`/dashboard/libri/${libroId}/scrivi?capitolo=${capitolo.id}&paragrafo=${paragrafo.id}`}
                          className="flex items-center p-3 hover:bg-gray-100 rounded-lg transition-colors group"
                        >
                          <div className={`w-4 h-4 rounded-full mr-3 ${
                            paragrafo.stato === 'completato' 
                              ? 'bg-green-500' 
                              : paragrafo.stato === 'in_lavorazione'
                              ? 'bg-accent'
                              : 'border-2 border-gray-300'
                          }`}>
                            {paragrafo.stato === 'completato' && (
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="flex-1 text-sm text-gray-700 group-hover:text-accent">
                            § {capitolo.numero_ordine}.{paragrafo.numero_ordine} - {paragrafo.titolo}
                          </span>
                          <span className="text-xs text-gray-400">
                            {paragrafo.parole > 0 ? `${paragrafo.parole} parole` : '--'}
                          </span>
                        </Link>
                      ))}
                      
                      <button
                        onClick={() => handleAddParagraph(capitolo.id)}
                        className="flex items-center gap-2 p-3 text-accent hover:bg-accent/10 rounded-lg transition-colors w-full"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-sm">Aggiungi paragrafo</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Add chapter */}
        {isAddingChapter ? (
          <div className="border-2 border-dashed border-accent rounded-xl p-4">
            <input
              type="text"
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              placeholder="Titolo del capitolo"
              className="input mb-3"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddChapter()
                if (e.key === 'Escape') {
                  setIsAddingChapter(false)
                  setNewChapterTitle('')
                }
              }}
            />
            <div className="flex gap-2">
              <button onClick={handleAddChapter} className="btn btn-primary text-sm">
                Aggiungi
              </button>
              <button
                onClick={() => {
                  setIsAddingChapter(false)
                  setNewChapterTitle('')
                }}
                className="btn btn-secondary text-sm"
              >
                Annulla
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingChapter(true)}
            className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-accent hover:text-accent hover:bg-accent/5 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Aggiungi nuovo capitolo
          </button>
        )}
      </div>
    </div>
  )
}
