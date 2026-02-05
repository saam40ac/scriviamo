'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { PodcastImport } from '@/types/database'

interface PodcastPanelProps {
  libroId: string
  podcasts: PodcastImport[]
  onPodcastsChange: (podcasts: PodcastImport[]) => void
}

export default function PodcastPanel({ libroId, podcasts, onPodcastsChange }: PodcastPanelProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [transcribingId, setTranscribingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.includes('audio')) {
      toast.error('Seleziona un file audio (MP3, WAV, ecc.)')
      return
    }

    const maxSize = 25 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File troppo grande. Max 25MB.')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const fileName = `${libroId}/${Date.now()}_${file.name}`
      const progressInterval = setInterval(() => setUploadProgress(prev => Math.min(prev + 10, 90)), 200)

      const { error: uploadError } = await supabase.storage.from('podcast-files').upload(fileName, file)
      clearInterval(progressInterval)
      if (uploadError) throw uploadError

      setUploadProgress(95)

      const { data: podcastData, error: dbError } = await supabase
        .from('podcast_imports')
        .insert({ libro_id: libroId, nome_file: file.name, file_url: fileName, file_size: file.size, stato: 'caricato' })
        .select().single()

      if (dbError) throw dbError

      setUploadProgress(100)
      onPodcastsChange([podcastData, ...podcasts])
      toast.success('Podcast caricato! Clicca il pulsante per trascriverlo.')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error) {
      toast.error('Errore nel caricamento')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleTranscribe = async (podcast: PodcastImport) => {
    setTranscribingId(podcast.id)
    onPodcastsChange(podcasts.map(p => p.id === podcast.id ? { ...p, stato: 'in_trascrizione' as const } : p))

    try {
      toast.loading('Trascrizione in corso... (1-3 minuti)', { id: 'transcribing' })

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ podcastId: podcast.id, fileUrl: podcast.file_url }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      onPodcastsChange(podcasts.map(p => p.id === podcast.id ? { ...p, stato: 'trascritto' as const, trascrizione_grezza: result.transcription } : p))
      toast.success('Trascrizione completata!', { id: 'transcribing' })
    } catch (error) {
      onPodcastsChange(podcasts.map(p => p.id === podcast.id ? { ...p, stato: 'errore' as const } : p))
      toast.error('Errore trascrizione. Riprova.', { id: 'transcribing' })
    } finally {
      setTranscribingId(null)
    }
  }

  const handleDelete = async (podcast: PodcastImport) => {
    if (!window.confirm(`Eliminare "${podcast.nome_file}"?`)) return
    try {
      if (podcast.file_url) await supabase.storage.from('podcast-files').remove([podcast.file_url])
      await supabase.from('podcast_imports').delete().eq('id', podcast.id)
      onPodcastsChange(podcasts.filter(p => p.id !== podcast.id))
      toast.success('Eliminato')
    } catch { toast.error('Errore') }
  }

  const statusConfig: Record<string, { label: string; class: string }> = {
    caricato: { label: '⏳ Da trascrivere', class: 'bg-amber-100 text-amber-700' },
    in_trascrizione: { label: '🔄 Trascrizione...', class: 'bg-blue-100 text-blue-700 animate-pulse' },
    trascritto: { label: '✅ Trascritto', class: 'bg-green-100 text-green-700' },
    errore: { label: '❌ Errore', class: 'bg-red-100 text-red-700' },
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">🎙️ Podcast</h3>

      {/* Upload */}
      <div className={`border-2 border-dashed rounded-xl p-6 text-center mb-4 cursor-pointer ${isUploading ? 'border-accent bg-accent/5' : 'border-gray-300 hover:border-accent'}`}
        onClick={() => !isUploading && fileInputRef.current?.click()}>
        <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileSelect} className="hidden" />
        {isUploading ? (
          <div>
            <p className="text-sm mb-2">Caricamento... {uploadProgress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-accent h-2 rounded-full" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm"><span className="text-accent font-medium">Clicca per caricare</span> un file audio</p>
            <p className="text-xs text-gray-400 mt-1">MP3, WAV, M4A • Max 25MB</p>
          </>
        )}
      </div>

      {/* List */}
      {podcasts.length > 0 ? (
        <div className="space-y-3">
          {podcasts.map(podcast => {
            const status = statusConfig[podcast.stato] || statusConfig.caricato
            const canTranscribe = podcast.stato === 'caricato' || podcast.stato === 'errore'
            const hasText = podcast.trascrizione_grezza || podcast.trascrizione_elaborata

            return (
              <div key={podcast.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-white">🎙️</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{podcast.nome_file}</p>
                  <p className="text-xs text-gray-500">{((podcast.file_size || 0) / 1024 / 1024).toFixed(1)} MB</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.class}`}>{status.label}</span>
                
                {canTranscribe && (
                  <button onClick={() => handleTranscribe(podcast)} className="px-3 py-1 bg-accent text-white text-xs rounded-lg hover:bg-accent/90">
                    🤖 Trascrivi
                  </button>
                )}
                {hasText && (
                  <button onClick={() => { navigator.clipboard.writeText(podcast.trascrizione_grezza || ''); toast.success('Copiato!') }}
                    className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600">
                    📋 Copia
                  </button>
                )}
                <button onClick={() => handleDelete(podcast)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100">🗑️</button>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">Nessun podcast caricato</p>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700"><strong>💡 Come usare:</strong> Carica audio → Clicca "Trascrivi" → Vai nell'editor e clicca "Da Podcast" per inserire il testo.</p>
      </div>
    </div>
  )
}
