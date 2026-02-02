export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          nome: string | null
          cognome: string | null
          avatar_url: string | null
          ruolo: 'admin' | 'autore' | 'studente'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          nome?: string | null
          cognome?: string | null
          avatar_url?: string | null
          ruolo?: 'admin' | 'autore' | 'studente'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          nome?: string | null
          cognome?: string | null
          avatar_url?: string | null
          ruolo?: 'admin' | 'autore' | 'studente'
          created_at?: string
          updated_at?: string
        }
      }
      libri: {
        Row: {
          id: string
          user_id: string
          titolo: string
          sottotitolo: string | null
          descrizione: string | null
          genere: string | null
          stato: 'bozza' | 'in_lavorazione' | 'completato' | 'pubblicato'
          copertina_url: string | null
          parole_totali: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          titolo: string
          sottotitolo?: string | null
          descrizione?: string | null
          genere?: string | null
          stato?: 'bozza' | 'in_lavorazione' | 'completato' | 'pubblicato'
          copertina_url?: string | null
          parole_totali?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          titolo?: string
          sottotitolo?: string | null
          descrizione?: string | null
          genere?: string | null
          stato?: 'bozza' | 'in_lavorazione' | 'completato' | 'pubblicato'
          copertina_url?: string | null
          parole_totali?: number
          created_at?: string
          updated_at?: string
        }
      }
      capitoli: {
        Row: {
          id: string
          libro_id: string
          numero_ordine: number
          titolo: string
          stato: 'bozza' | 'in_lavorazione' | 'completato'
          note: string | null
          parole_totali: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          libro_id: string
          numero_ordine: number
          titolo: string
          stato?: 'bozza' | 'in_lavorazione' | 'completato'
          note?: string | null
          parole_totali?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          libro_id?: string
          numero_ordine?: number
          titolo?: string
          stato?: 'bozza' | 'in_lavorazione' | 'completato'
          note?: string | null
          parole_totali?: number
          created_at?: string
          updated_at?: string
        }
      }
      paragrafi: {
        Row: {
          id: string
          capitolo_id: string
          numero_ordine: number
          titolo: string
          contenuto: string
          stato: 'bozza' | 'in_lavorazione' | 'completato'
          parole: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          capitolo_id: string
          numero_ordine: number
          titolo: string
          contenuto?: string
          stato?: 'bozza' | 'in_lavorazione' | 'completato'
          parole?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          capitolo_id?: string
          numero_ordine?: number
          titolo?: string
          contenuto?: string
          stato?: 'bozza' | 'in_lavorazione' | 'completato'
          parole?: number
          created_at?: string
          updated_at?: string
        }
      }
      podcast_imports: {
        Row: {
          id: string
          libro_id: string
          capitolo_id: string | null
          paragrafo_id: string | null
          nome_file: string
          file_url: string | null
          file_size: number | null
          durata_secondi: number | null
          trascrizione_grezza: string | null
          trascrizione_elaborata: string | null
          stato: 'caricato' | 'in_trascrizione' | 'trascritto' | 'elaborato' | 'usato' | 'errore'
          errore_messaggio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          libro_id: string
          capitolo_id?: string | null
          paragrafo_id?: string | null
          nome_file: string
          file_url?: string | null
          file_size?: number | null
          durata_secondi?: number | null
          trascrizione_grezza?: string | null
          trascrizione_elaborata?: string | null
          stato?: 'caricato' | 'in_trascrizione' | 'trascritto' | 'elaborato' | 'usato' | 'errore'
          errore_messaggio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          libro_id?: string
          capitolo_id?: string | null
          paragrafo_id?: string | null
          nome_file?: string
          file_url?: string | null
          file_size?: number | null
          durata_secondi?: number | null
          trascrizione_grezza?: string | null
          trascrizione_elaborata?: string | null
          stato?: 'caricato' | 'in_trascrizione' | 'trascritto' | 'elaborato' | 'usato' | 'errore'
          errore_messaggio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      statistiche_utente: {
        Row: {
          user_id: string
          totale_libri: number
          libri_completati: number
          libri_in_lavorazione: number
          totale_capitoli: number
          capitoli_completati: number
          parole_totali: number
          podcast_importati: number
        }
      }
    }
  }
}

// Tipi helper per uso più semplice
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Libro = Database['public']['Tables']['libri']['Row']
export type Capitolo = Database['public']['Tables']['capitoli']['Row']
export type Paragrafo = Database['public']['Tables']['paragrafi']['Row']
export type PodcastImport = Database['public']['Tables']['podcast_imports']['Row']
export type StatisticheUtente = Database['public']['Views']['statistiche_utente']['Row']

// Tipi per insert
export type LibroInsert = Database['public']['Tables']['libri']['Insert']
export type CapitoloInsert = Database['public']['Tables']['capitoli']['Insert']
export type ParagrafoInsert = Database['public']['Tables']['paragrafi']['Insert']
export type PodcastImportInsert = Database['public']['Tables']['podcast_imports']['Insert']

// Tipi per update
export type LibroUpdate = Database['public']['Tables']['libri']['Update']
export type CapitoloUpdate = Database['public']['Tables']['capitoli']['Update']
export type ParagrafoUpdate = Database['public']['Tables']['paragrafi']['Update']
export type PodcastImportUpdate = Database['public']['Tables']['podcast_imports']['Update']

// Tipo stato
export type StatoLibro = 'bozza' | 'in_lavorazione' | 'completato' | 'pubblicato'
export type StatoCapitolo = 'bozza' | 'in_lavorazione' | 'completato'
export type StatoParagrafo = 'bozza' | 'in_lavorazione' | 'completato'
export type StatoPodcast = 'caricato' | 'in_trascrizione' | 'trascritto' | 'elaborato' | 'usato' | 'errore'
