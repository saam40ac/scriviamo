'use client'

import { useState, useRef } from 'react'
import { supabase, uploadFile } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useAppStore } from '@/store/useAppStore'
import toast from 'react-hot-toast'
import { PodcastImport } from '@/types/database'

interface PodcastPanelProps {
  libroId: string
  podcasts: PodcastImport[]
  onUpdate: () => void
}

const statusConfig = {
  caricato: { label: 'Caricato', class: 'bg-gray-100 text-gray-600' },
  in_trascrizione: { label: 'Trascrizione...', class: 'bg-blue-100 text-blue-600' },
  trascritto: { label: 'Trascritto', class: 'bg-amber-100 text-amber-600' },
  elaborato: { label: 'Pronto', class: 'bg-green-100 text-green-600' },
  usato: { label: 'Usato', class: 'bg-primary/10 text-primary' },
  errore: { label: 'Errore', class: 'bg-red-100 text-red-600' },
}

export default function PodcastPanel({ libroId, podcasts, onUpdate }: PodcastPanelProps) {
  const { user } = useAuth()
  const { openModal } = useAppStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    if (!file.type.includes('audio')) {
      toast.error('Seleziona un file audio (MP3, WAV, etc.)')
      return
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Il file è troppo grande (max 100MB)')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Upload file to storage
      const filePath = `${user.id}/${Date.now()}_${file.name}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('podcast-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100)
            setUploadProgress(percent)
          },
        })

      if (uploadError) throw uploadError

      // Create database record
      const { error: dbError } = await supabase
        .from('podcast_imports')
        .insert({
          libro_id: libroId,
          nome_file: file.name,
          file_url: uploadData.path,
          file_size: file.size,
          stato: 'caricato',
        })

      if (dbError) throw dbError

      toast.success('Podcast caricato! La trascrizione inizierà a breve.')
      onUpdate()
    } catch (error: any) {
      console.error('Errore upload:', error)
      toast.error(error.message || 'Errore nel caricamento')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (podcast: PodcastImport) => {
    const confirmed = window.confirm(`Eliminare "${podcast.nome_file}"?`)
    if (!confirmed) return

    try {
      // Delete from storage
      if (podcast.file_url) {
        await supabase.storage.from('podcast-files').remove([podcast.file_url])
      }

      // Delete from database
      const { error } = await supabase
        .from('podcast_imports')
        .delete()
        .eq('id', podcast.id)

      if (error) throw error

      toast.success('Podcast eliminato')
      onUpdate()
    } catch (error: any) {
      console.error('Errore eliminazione:', error)
      toast.error('Errore nell\'eliminazione')
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '--'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          Podcast
        </h2>
      </div>

      {/* Upload area */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all mb-4 ${
          isUploading
            ? 'border-accent bg-accent/5'
            : 'border-gray-300 hover:border-accent hover:bg-accent/5'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div>
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-2">Caricamento in corso...</p>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{uploadProgress}%</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">Carica un file MP3</p>
            <p className="text-xs text-gray-400">Trascina qui o clicca per selezionare</p>
          </>
        )}
      </div>

      {/* Podcast list */}
      <div className="space-y-3">
        {podcasts.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Nessun podcast caricato
          </p>
        ) : (
          podcasts.map((podcast) => {
            const status = statusConfig[podcast.stato]
            
            return (
              <div
                key={podcast.id}
                className="flex items-center p-3 bg-gray-50 rounded-lg group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <div className="flex-1 ml-3 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {podcast.nome_file}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDuration(podcast.durata_secondi)} • {formatFileSize(podcast.file_size)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.class}`}>
                    {status.label}
                  </span>
                  
                  {(podcast.stato === 'trascritto' || podcast.stato === 'elaborato') && (
                    <button
                      onClick={() => openModal(`podcast-transform-${podcast.id}`)}
                      className="p-1.5 hover:bg-accent/10 rounded-lg transition-colors"
                      title="Usa testo"
                    >
                      <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(podcast)}
                    className="p-1.5 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Elimina"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
