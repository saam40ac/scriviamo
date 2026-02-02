'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/store/useAppStore'
import { supabase } from '@/lib/supabase'
import Header from '@/components/layout/Header'
import BookCard from '@/components/libri/BookCard'
import toast from 'react-hot-toast'
import { StatoLibro } from '@/types/database'

type FiltroStato = 'tutti' | StatoLibro

export default function LibriPage() {
  const { libri, setLibri } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [filtro, setFiltro] = useState<FiltroStato>('tutti')

  useEffect(() => {
    loadLibri()
  }, [])

  const loadLibri = async () => {
    try {
      const { data, error } = await supabase
        .from('libri')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      setLibri(data || [])
    } catch (error) {
      console.error('Errore caricamento libri:', error)
      toast.error('Errore nel caricamento dei libri')
    } finally {
      setIsLoading(false)
    }
  }

  const libriFiltrati = filtro === 'tutti' 
    ? libri 
    : libri.filter(l => l.stato === filtro)

  const filtriOptions: { value: FiltroStato; label: string }[] = [
    { value: 'tutti', label: 'Tutti' },
    { value: 'bozza', label: 'Bozze' },
    { value: 'in_lavorazione', label: 'In lavorazione' },
    { value: 'completato', label: 'Completati' },
    { value: 'pubblicato', label: 'Pubblicati' },
  ]

  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'I Miei Libri' },
        ]}
        actions={
          <Link href="/dashboard/libri/nuovo" className="btn btn-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuovo Libro
          </Link>
        }
      />

      <div className="p-6 lg:p-8">
        {/* Header with filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
              I Miei Libri
            </h1>
            <p className="text-gray-500">
              {libri.length} {libri.length === 1 ? 'libro' : 'libri'} totali
            </p>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {filtriOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFiltro(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtro === option.value
                    ? 'bg-accent text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Books grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-2 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : libriFiltrati.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {libriFiltrati.map((libro) => (
              <BookCard key={libro.id} libro={libro} />
            ))}
            
            {/* New book card */}
            <Link
              href="/dashboard/libri/nuovo"
              className="group flex flex-col items-center justify-center min-h-[280px] border-2 border-dashed border-gray-300 rounded-2xl hover:border-accent hover:bg-accent/5 transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-gray-200 group-hover:bg-accent flex items-center justify-center mb-4 transition-colors">
                <svg className="w-8 h-8 text-gray-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-gray-600 font-medium group-hover:text-accent">
                Crea nuovo libro
              </span>
            </Link>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {filtro === 'tutti' ? 'Nessun libro ancora' : `Nessun libro ${filtro.replace('_', ' ')}`}
            </h3>
            <p className="text-gray-500 mb-4">
              {filtro === 'tutti' 
                ? 'Inizia a scrivere il tuo primo libro!' 
                : 'Cambia filtro per vedere altri libri'}
            </p>
            {filtro === 'tutti' && (
              <Link href="/dashboard/libri/nuovo" className="btn btn-primary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Crea il tuo primo libro
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  )
}
