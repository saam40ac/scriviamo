'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { supabase } from '@/lib/supabase'
import Header from '@/components/layout/Header'
import EditorSidebar from '@/components/editor/EditorSidebar'
import EditorToolbar from '@/components/editor/EditorToolbar'
import EditorContent from '@/components/editor/EditorContent'
import toast from 'react-hot-toast'
import { Capitolo, Paragrafo, StatoParagrafo } from '@/types/database'

export default function ScriviPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const libroId = params.id as string

  const {
    currentLibro, setCurrentLibro,
    currentCapitolo, setCurrentCapitolo,
    currentParagrafo, setCurrentParagrafo,
    capitoli, setCapitoli,
    paragrafi, setParagrafi,
    openModal,
  } = useAppStore()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadData()
  }, [libroId])

  useEffect(() => {
    const capitoloId = searchParams.get('capitolo')
    const paragrafoId = searchParams.get('paragrafo')

    if (capitoloId && capitoli.length > 0) {
      const cap = capitoli.find(c => c.id === capitoloId)
      if (cap) {
        setCurrentCapitolo(cap)
        loadParagrafi(cap.id, paragrafoId)
      }
    } else if (capitoli.length > 0 && !currentCapitolo) {
      setCurrentCapitolo(capitoli[0])
      loadParagrafi(capitoli[0].id)
    }
  }, [capitoli, searchParams])

  const loadData = async () => {
    try {
      const { data: libroData, error: libroError } = await supabase
        .from('libri')
        .select('*')
        .eq('id', libroId)
        .single()

      if (libroError) throw libroError
      setCurrentLibro(libroData)

      const { data: capitoliData, error: capitoliError } = await supabase
        .from('capitoli')
        .select('*')
        .eq('libro_id', libroId)
        .order('numero_ordine', { ascending: true })

      if (capitoliError) throw capitoliError
      setCapitoli(capitoliData || [])

      if (capitoliData && capitoliData.length === 0) {
        toast.error('Aggiungi almeno un capitolo prima di scrivere')
        router.push(`/dashboard/libri/${libroId}`)
        return
      }
    } catch (error: any) {
      console.error('Errore caricamento:', error)
      toast.error('Errore nel caricamento')
      router.push('/dashboard/libri')
    } finally {
      setIsLoading(false)
    }
  }

  const loadParagrafi = async (capitoloId: string, selectParagrafoId?: string | null) => {
    const { data, error } = await supabase
      .from('paragrafi')
      .select('*')
      .eq('capitolo_id', capitoloId)
      .order('numero_ordine', { ascending: true })

    if (error) {
      console.error('Errore caricamento paragrafi:', error)
      return
    }

    setParagrafi(data || [])

    if (selectParagrafoId) {
      const para = data?.find(p => p.id === selectParagrafoId)
      if (para) {
        selectParagrafo(para)
        return
      }
    }

    if (data && data.length > 0) {
      selectParagrafo(data[0])
    } else {
      setCurrentParagrafo(null)
      setContent('')
      setTitle('')
    }
  }

  const selectParagrafo = (paragrafo: Paragrafo) => {
    if (currentParagrafo && currentParagrafo.id !== paragrafo.id) {
      saveContent()
    }
    setCurrentParagrafo(paragrafo)
    setContent(paragrafo.contenuto || '')
    setTitle(paragrafo.titolo)
  }

  const selectCapitolo = (capitolo: Capitolo) => {
    if (currentCapitolo?.id === capitolo.id) return
    saveContent()
    setCurrentCapitolo(capitolo)
    setNotes(capitolo.note || '')
    loadParagrafi(capitolo.id)
  }

  const saveContent = useCallback(async () => {
    if (!currentParagrafo) return
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('paragrafi')
        .update({ contenuto: content, titolo: title })
        .eq('id', currentParagrafo.id)
      if (error) throw error
      setLastSaved(new Date())
    } catch (error) {
      console.error('Errore salvataggio:', error)
    } finally {
      setIsSaving(false)
    }
  }, [currentParagrafo, content, title])

  useEffect(() => {
    const interval = setInterval(() => {
      if (content !== currentParagrafo?.contenuto) {
        saveContent()
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [content, currentParagrafo, saveContent])

  const handleStatusChange = async (status: StatoParagrafo) => {
    if (!currentParagrafo) return
    try {
      const { error } = await supabase
        .from('paragrafi')
        .update({ stato: status })
        .eq('id', currentParagrafo.id)
      if (error) throw error
      setCurrentParagrafo({ ...currentParagrafo, stato: status })
      toast.success('Stato aggiornato')
    } catch (error) {
      console.error('Errore aggiornamento stato:', error)
      toast.error('Errore')
    }
  }

  const addParagrafo = async () => {
    if (!currentCapitolo) return
    const nextOrder = paragrafi.length + 1
    try {
      const { data, error } = await supabase
        .from('paragrafi')
        .insert({
          capitolo_id: currentCapitolo.id,
          titolo: `Paragrafo ${nextOrder}`,
          numero_ordine: nextOrder,
          stato: 'bozza',
          contenuto: '',
        })
        .select()
        .single()
      if (error) throw error
      setParagrafi([...paragrafi, data])
      selectParagrafo(data)
      toast.success('Paragrafo aggiunto')
    } catch (error) {
      console.error('Errore aggiunta paragrafo:', error)
      toast.error('Errore')
    }
  }

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length
  const charCount = content.length
  const readingTime = Math.ceil(wordCount / 200)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    )
  }

  if (!currentLibro) return null

  return (
    <div className="h-screen flex flex-col">
      <Header
        breadcrumbs={[
          { label: currentLibro.titolo, href: `/dashboard/libri/${libroId}` },
          { label: currentCapitolo?.titolo || 'Scrivi' },
        ]}
        actions={
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              {isSaving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Salvataggio...
                </>
              ) : lastSaved ? (
                <>
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Salvato
                </>
              ) : null}
            </span>
            <button onClick={() => openModal('podcast-import')} className="btn btn-secondary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Da Podcast
            </button>
            <button onClick={saveContent} className="btn btn-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Salva
            </button>
          </div>
        }
      />

      <div className="flex-1 flex overflow-hidden">
        <EditorSidebar
          capitoli={capitoli}
          paragrafi={paragrafi}
          currentCapitolo={currentCapitolo}
          currentParagrafo={currentParagrafo}
          onSelectCapitolo={selectCapitolo}
          onSelectParagrafo={selectParagrafo}
          onAddParagrafo={addParagrafo}
          notes={notes}
          onNotesChange={setNotes}
        />

        <div className="flex-1 flex flex-col bg-gray-100">
          {currentParagrafo ? (
            <>
              <EditorToolbar />
              
              <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-12 min-h-[600px]">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-2xl font-serif font-semibold text-gray-900 border-none outline-none mb-6 placeholder-gray-400"
                    placeholder="Titolo del paragrafo..."
                  />
                  <EditorContent content={content} onChange={setContent} />
                </div>
              </div>

              <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span>{wordCount.toLocaleString('it-IT')} parole</span>
                  <span>~{readingTime} min lettura</span>
                  <span>{charCount.toLocaleString('it-IT')} caratteri</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 mr-2">Stato:</span>
                  {(['bozza', 'in_lavorazione', 'completato'] as StatoParagrafo[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        currentParagrafo.stato === status
                          ? status === 'completato' ? 'bg-green-500 text-white'
                            : status === 'in_lavorazione' ? 'bg-accent text-white'
                            : 'bg-gray-500 text-white'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {status === 'bozza' ? 'Bozza' : status === 'in_lavorazione' ? 'In lavorazione' : 'Completato'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Nessun paragrafo</h3>
                <p className="text-gray-500 mb-4">Aggiungi un paragrafo per iniziare</p>
                <button onClick={addParagrafo} className="btn btn-primary">
                  Aggiungi paragrafo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
