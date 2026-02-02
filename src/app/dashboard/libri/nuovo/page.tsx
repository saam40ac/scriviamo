'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useAppStore } from '@/store/useAppStore'
import { supabase } from '@/lib/supabase'
import Header from '@/components/layout/Header'
import toast from 'react-hot-toast'

const generi = [
  'Crescita Personale',
  'Business',
  'Narrativa',
  'Biografia',
  'Salute e Benessere',
  'Tecnologia',
  'Educazione',
  'Spiritualità',
  'Cucina',
  'Viaggi',
  'Altro',
]

export default function NuovoLibroPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { addLibro } = useAppStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    titolo: '',
    sottotitolo: '',
    descrizione: '',
    genere: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.titolo.trim()) {
      toast.error('Inserisci un titolo per il libro')
      return
    }

    if (!user) {
      toast.error('Devi essere autenticato')
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('libri')
        .insert({
          user_id: user.id,
          titolo: formData.titolo.trim(),
          sottotitolo: formData.sottotitolo.trim() || null,
          descrizione: formData.descrizione.trim() || null,
          genere: formData.genere || null,
          stato: 'bozza',
        })
        .select()
        .single()

      if (error) throw error

      addLibro(data)
      toast.success('Libro creato con successo!')
      router.push(`/dashboard/libri/${data.id}`)
    } catch (error: any) {
      console.error('Errore creazione libro:', error)
      toast.error(error.message || 'Errore nella creazione del libro')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'I Miei Libri', href: '/dashboard/libri' },
          { label: 'Nuovo Libro' },
        ]}
      />

      <div className="p-6 lg:p-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Crea un nuovo libro
          </h1>
          <p className="text-gray-500">
            Inserisci le informazioni di base del tuo libro. Potrai modificarle in qualsiasi momento.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titolo */}
          <div>
            <label htmlFor="titolo" className="label">
              Titolo <span className="text-red-500">*</span>
            </label>
            <input
              id="titolo"
              name="titolo"
              type="text"
              value={formData.titolo}
              onChange={handleChange}
              className="input"
              placeholder="Il titolo del tuo libro"
              required
            />
          </div>

          {/* Sottotitolo */}
          <div>
            <label htmlFor="sottotitolo" className="label">
              Sottotitolo
            </label>
            <input
              id="sottotitolo"
              name="sottotitolo"
              type="text"
              value={formData.sottotitolo}
              onChange={handleChange}
              className="input"
              placeholder="Un sottotitolo opzionale"
            />
          </div>

          {/* Genere */}
          <div>
            <label htmlFor="genere" className="label">
              Genere
            </label>
            <select
              id="genere"
              name="genere"
              value={formData.genere}
              onChange={handleChange}
              className="input"
            >
              <option value="">Seleziona un genere</option>
              {generi.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Descrizione (Quarta di copertina) */}
          <div>
            <label htmlFor="descrizione" className="label">
              Descrizione (Quarta di copertina)
            </label>
            <textarea
              id="descrizione"
              name="descrizione"
              value={formData.descrizione}
              onChange={handleChange}
              className="input min-h-[150px] resize-y"
              placeholder="Una breve descrizione del contenuto del libro..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Questa descrizione apparirà nella quarta di copertina
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-secondary"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creazione...
                </span>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crea Libro
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
