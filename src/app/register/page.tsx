'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nome || !email || !password) {
      toast.error('Compila tutti i campi')
      return
    }

    if (password.length < 6) {
      toast.error('La password deve avere almeno 6 caratteri')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Le password non coincidono')
      return
    }

    setIsLoading(true)

    const { error } = await signUp(email, password, nome)

    if (error) {
      toast.error(error.message || 'Errore durante la registrazione')
      setIsLoading(false)
      return
    }

    toast.success('Registrazione completata! Controlla la tua email per confermare.')
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-accent to-accent-light items-center justify-center p-12">
        <div className="text-white text-center max-w-lg">
          <div className="text-6xl mb-6">✨</div>
          <h2 className="text-3xl font-bold mb-4">Inizia a scrivere oggi</h2>
          <p className="text-lg text-white/80">
            Unisciti a ScriviAmo e scopri quanto è semplice trasformare 
            i tuoi contenuti audio in libri pronti per la pubblicazione.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Scrivi<span className="text-accent">Amo</span>
            </h1>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Crea il tuo account</h2>
          <p className="text-gray-500 mb-8">Inizia a scrivere i tuoi libri gratuitamente</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="nome" className="label">Nome</label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="input"
                placeholder="Il tuo nome"
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="nome@esempio.it"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Minimo 6 caratteri"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">Conferma Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                placeholder="Ripeti la password"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-3 text-base"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Registrazione in corso...
                </span>
              ) : (
                'Registrati'
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6">
            Hai già un account?{' '}
            <Link href="/login" className="text-accent font-medium hover:underline">
              Accedi
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
