'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useAppStore } from '@/store/useAppStore'
import { supabase } from '@/lib/supabase'
import Header from '@/components/layout/Header'
import BookCard from '@/components/libri/BookCard'
import StatCard from '@/components/dashboard/StatCard'
import toast from 'react-hot-toast'
import { Libro, StatisticheUtente } from '@/types/database'

export default function DashboardPage() {
  const { profile } = useAuth()
  const { libri, setLibri, statistiche, setStatistiche } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Carica libri
      const { data: libriData, error: libriError } = await supabase
        .from('libri')
        .select('*')
        .order('updated_at', { ascending: false })

      if (libriError) throw libriError
      setLibri(libriData || [])

      // Carica statistiche
      const { data: statsData, error: statsError } = await supabase
        .from('statistiche_utente')
        .select('*')
        .single()

      if (!statsError && statsData) {
        setStatistiche(statsData)
      }
    } catch (error) {
      console.error('Errore caricamento dashboard:', error)
      toast.error('Errore nel caricamento dei dati')
    } finally {
      setIsLoading(false)
    }
  }

  const stats = [
    {
      label: 'Libri in lavorazione',
      value: statistiche?.libri_in_lavorazione || 0,
      icon: 'book',
      color: 'primary' as const,
    },
    {
      label: 'Capitoli completati',
      value: statistiche?.capitoli_completati || 0,
      icon: 'check',
      color: 'success' as const,
    },
    {
      label: 'Parole totali',
      value: statistiche?.parole_totali || 0,
      icon: 'document',
      color: 'accent' as const,
      format: 'number' as const,
    },
    {
      label: 'Podcast importati',
      value: statistiche?.podcast_importati || 0,
      icon: 'microphone',
      color: 'warning' as const,
    },
  ]

  return (
    <>
      <Header
        breadcrumbs={[{ label: 'Dashboard' }]}
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
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Bentornato, {profile?.nome || 'Autore'}! 👋
          </h1>
          <p className="text-gray-500">
            Ecco una panoramica dei tuoi progetti di scrittura
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Books section */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">I Miei Libri</h2>
          <Link
            href="/dashboard/libri"
            className="text-sm text-accent hover:text-accent-dark font-medium flex items-center gap-1"
          >
            Vedi tutti
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
        ) : libri.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {libri.slice(0, 3).map((libro) => (
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
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Nessun libro ancora
            </h3>
            <p className="text-gray-500 mb-4">
              Inizia a scrivere il tuo primo libro!
            </p>
            <Link href="/dashboard/libri/nuovo" className="btn btn-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crea il tuo primo libro
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
