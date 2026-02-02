import { create } from 'zustand'
import { Libro, Capitolo, Paragrafo, StatisticheUtente } from '@/types/database'

interface AppState {
  // Libro corrente
  currentLibro: Libro | null
  setCurrentLibro: (libro: Libro | null) => void

  // Capitolo corrente
  currentCapitolo: Capitolo | null
  setCurrentCapitolo: (capitolo: Capitolo | null) => void

  // Paragrafo corrente
  currentParagrafo: Paragrafo | null
  setCurrentParagrafo: (paragrafo: Paragrafo | null) => void

  // Lista libri
  libri: Libro[]
  setLibri: (libri: Libro[]) => void
  addLibro: (libro: Libro) => void
  updateLibro: (id: string, updates: Partial<Libro>) => void
  removeLibro: (id: string) => void

  // Lista capitoli del libro corrente
  capitoli: Capitolo[]
  setCapitoli: (capitoli: Capitolo[]) => void
  addCapitolo: (capitolo: Capitolo) => void
  updateCapitolo: (id: string, updates: Partial<Capitolo>) => void
  removeCapitolo: (id: string) => void

  // Lista paragrafi del capitolo corrente
  paragrafi: Paragrafo[]
  setParagrafi: (paragrafi: Paragrafo[]) => void
  addParagrafo: (paragrafo: Paragrafo) => void
  updateParagrafo: (id: string, updates: Partial<Paragrafo>) => void
  removeParagrafo: (id: string) => void

  // Statistiche
  statistiche: StatisticheUtente | null
  setStatistiche: (stats: StatisticheUtente | null) => void

  // UI State
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  // Modal state
  modalOpen: string | null
  openModal: (modalId: string) => void
  closeModal: () => void

  // Loading states
  isLoading: boolean
  setIsLoading: (loading: boolean) => void

  // Reset
  reset: () => void
}

const initialState = {
  currentLibro: null,
  currentCapitolo: null,
  currentParagrafo: null,
  libri: [],
  capitoli: [],
  paragrafi: [],
  statistiche: null,
  sidebarOpen: true,
  modalOpen: null,
  isLoading: false,
}

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  // Libro corrente
  setCurrentLibro: (libro) => set({ currentLibro: libro }),

  // Capitolo corrente
  setCurrentCapitolo: (capitolo) => set({ currentCapitolo: capitolo }),

  // Paragrafo corrente
  setCurrentParagrafo: (paragrafo) => set({ currentParagrafo: paragrafo }),

  // Libri
  setLibri: (libri) => set({ libri }),
  addLibro: (libro) => set((state) => ({ libri: [...state.libri, libro] })),
  updateLibro: (id, updates) =>
    set((state) => ({
      libri: state.libri.map((l) => (l.id === id ? { ...l, ...updates } : l)),
      currentLibro:
        state.currentLibro?.id === id
          ? { ...state.currentLibro, ...updates }
          : state.currentLibro,
    })),
  removeLibro: (id) =>
    set((state) => ({
      libri: state.libri.filter((l) => l.id !== id),
      currentLibro: state.currentLibro?.id === id ? null : state.currentLibro,
    })),

  // Capitoli
  setCapitoli: (capitoli) => set({ capitoli }),
  addCapitolo: (capitolo) =>
    set((state) => ({ capitoli: [...state.capitoli, capitolo] })),
  updateCapitolo: (id, updates) =>
    set((state) => ({
      capitoli: state.capitoli.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
      currentCapitolo:
        state.currentCapitolo?.id === id
          ? { ...state.currentCapitolo, ...updates }
          : state.currentCapitolo,
    })),
  removeCapitolo: (id) =>
    set((state) => ({
      capitoli: state.capitoli.filter((c) => c.id !== id),
      currentCapitolo:
        state.currentCapitolo?.id === id ? null : state.currentCapitolo,
    })),

  // Paragrafi
  setParagrafi: (paragrafi) => set({ paragrafi }),
  addParagrafo: (paragrafo) =>
    set((state) => ({ paragrafi: [...state.paragrafi, paragrafo] })),
  updateParagrafo: (id, updates) =>
    set((state) => ({
      paragrafi: state.paragrafi.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
      currentParagrafo:
        state.currentParagrafo?.id === id
          ? { ...state.currentParagrafo, ...updates }
          : state.currentParagrafo,
    })),
  removeParagrafo: (id) =>
    set((state) => ({
      paragrafi: state.paragrafi.filter((p) => p.id !== id),
      currentParagrafo:
        state.currentParagrafo?.id === id ? null : state.currentParagrafo,
    })),

  // Statistiche
  setStatistiche: (statistiche) => set({ statistiche }),

  // UI
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  // Modal
  openModal: (modalId) => set({ modalOpen: modalId }),
  closeModal: () => set({ modalOpen: null }),

  // Loading
  setIsLoading: (isLoading) => set({ isLoading }),

  // Reset
  reset: () => set(initialState),
}))
