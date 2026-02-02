'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppStore } from '@/store/useAppStore'
import { supabase } from '@/lib/supabase'
import Header from '@/components/layout/Header'
import ChapterList from '@/components/libri/ChapterList'
import BookDetailsPanel from '@/components/libri/BookDetailsPanel'
import PodcastPanel from '@/components/libri/PodcastPanel'
import ExportModal from '@/components/modals/ExportModal'
import toast from 'react-hot-toast'
import { Libro, Capitolo, PodcastImport } from '@/types/database'

export default function LibroDetailPage() {
  const params = useParams()
  const router = useRouter()
  const libroId = params.id as string
  
  const { 
    currentLibro, setCurrentLibro,
    capitoli, setCapitoli,
    modalOpen, openModal, closeModal
  } = useAppStore()
  
  const [isLoading, setIsLoading] = useState(true)
  const [podcasts, setPodcasts] = useState<PodcastImport[]>([])

  useEffect(() => {
    if (libroId) {
      loadLibroData()
    }
  }, [libroId])

  const loadLibroData = async () => {
    try {
      // Carica libro
      const { data: libroData, error: libroError } = await supabase
        .from('libri')
        .select('*')
        .eq('id', libroId)
        .single()

      if (libroError) throw libroError
      setCurrentLibro(libroData)

      // Carica capitoli
      const { data: capitoliData, error: capitoliError } = await supabase
        .from('capitoli')
        .select('*')
        .eq('libro_id', libroId)
        .order('numero_ordine', { ascending: true })

      if (capitoliError) throw capitoliError
      setCapitoli(capitoliData || [])

      // Carica podcast
      const { data: podcastData, error: podcastError } = await supabase
        .from('podcast_imports')
        .select('*')
        .eq('libro_id', libroId)
        .order('created_at', { ascending: false })

      if (!podcastError) {
        setPodcasts(podcastData || [])
      }

    } catch (error: any) {
      console.error('Errore caricamento libro:', error)
      toast.error('Libro non trovato')
      router.push('/dashboard/libri')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteLibro = async () => {
    if (!currentLibro) return
    
    const confirmed = window.confirm(
      `Sei sicuro di voler eliminare "${currentLibro.titolo}"? Questa azione non può essere annullata.`
    )
    
    if (!confirmed) return

    try {
      const { error } = await supabase
        .from('libri')
        .delete()
        .eq('id', currentLibro.id)

      if (error) throw error

      toast.success('Libro eliminato')
      router.push('/dashboard/libri')
    } catch (error: any) {
      console.error('Errore eliminazione libro:', error)
      toast.error('Errore nell\'eliminazione del libro')
    }
  }

  if (isLoading) {
    return (
      <>
        <Header breadcrumbs={[{ label: 'Caricamento...' }]} />
        <div className="p-6 lg:p-8">
          <div className="animate-pulse space-y-6">
            <div className="flex gap-8">
              <div className="w-48 h-64 bg-gray-200 rounded-xl" />
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/2" />
                <div className="h-6 bg-gray-200 rounded w-1/3" />
                <div className="h-24 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!currentLibro) {
    return null
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'I Miei Libri', href: '/dashboard/libri' },
          { label: currentLibro.titolo },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => openModal('export')}
              className="btn btn-secondary"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Esporta
            </button>
            {capitoli.length > 0 && (
              <Link
                href={`/dashboard/libri/${libroId}/scrivi`}
                className="btn btn-primary"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Scrivi
              </Link>
            )}
          </div>
        }
      />

      <div className="p-6 lg:p-8">
        {/* Book Header */}
        <BookDetailsPanel 
          libro={currentLibro} 
          onDelete={handleDeleteLibro}
          onUpdate={loadLibroData}
        />

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Chapters - 2 columns */}
          <div className="lg:col-span-2">
            <ChapterList 
              libroId={libroId} 
              capitoli={capitoli}
              onUpdate={loadLibroData}
            />
          </div>

          {/* Podcast panel - 1 column */}
          <div>
            <PodcastPanel 
              libroId={libroId}
              podcasts={podcasts}
              onUpdate={loadLibroData}
            />
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {modalOpen === 'export' && (
        <ExportModal 
          libro={currentLibro}
          capitoli={capitoli}
          onClose={closeModal}
        />
      )}
    </>
  )
}
