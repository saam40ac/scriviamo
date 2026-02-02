# ScriviAmo 📚

La tua Web App per scrivere libri da podcast e pubblicarli su Amazon KDP.

## 🚀 Installazione

### Prerequisiti
- Node.js 18+ installato
- Account Supabase configurato
- (Opzionale) Account Vercel per deploy

### Setup Locale

1. **Installa le dipendenze:**
```bash
npm install
```

2. **Configura le variabili d'ambiente:**
Il file `.env.local` è già configurato con le tue credenziali Supabase.

3. **Avvia il server di sviluppo:**
```bash
npm run dev
```

4. **Apri il browser:**
Vai su http://localhost:3000

## 📦 Deploy

### Opzione 1: Deploy su Vercel (Consigliato)

1. Crea un account su [vercel.com](https://vercel.com)
2. Collega il tuo repository GitHub
3. Importa il progetto
4. Configura le variabili d'ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL`
5. Deploy!

### Opzione 2: Deploy su Hosting Tradizionale (Ergonet)

1. **Build del progetto:**
```bash
npm run build
```

2. **Esporta come sito statico:**
```bash
npm run export
```

3. **Carica la cartella `out/`** sul tuo hosting via FTP

4. **Configura il dominio** `scriviamo.angelopagliara.it` nel pannello Ergonet

**Nota:** Per funzionalità avanzate (API routes, SSR), considera l'uso di Vercel o un server Node.js.

## 🔧 Configurazione Supabase

Il database è già configurato. Se devi ricrearlo:

1. Vai su Supabase → SQL Editor
2. Esegui lo script `database/schema.sql`
3. Crea i bucket Storage:
   - `podcast-files` (privato)
   - `copertine` (pubblico)

## 📁 Struttura Progetto

```
scriviamo/
├── src/
│   ├── app/                 # Pages (Next.js App Router)
│   │   ├── dashboard/       # Area autenticata
│   │   ├── login/          # Pagina login
│   │   └── register/       # Pagina registrazione
│   ├── components/          # Componenti React
│   │   ├── dashboard/      # Componenti dashboard
│   │   ├── editor/         # Editor di scrittura
│   │   ├── layout/         # Layout (Sidebar, Header)
│   │   ├── libri/          # Componenti libri
│   │   └── modals/         # Modali
│   ├── contexts/           # React Contexts
│   ├── lib/                # Utilities
│   ├── store/              # Zustand store
│   └── types/              # TypeScript types
├── database/               # Schema SQL
├── public/                 # Asset statici
└── ...config files
```

## 🎨 Colori Brand

| Colore | Hex | Uso |
|--------|-----|-----|
| Blu scuro | `#134e6f` | Primary, sidebar |
| Arancione | `#f27622` | Accent, bottoni |
| Arancione chiaro | `#ffa822` | Highlights |
| Nero | `#000000` | Testi |

## 📝 Funzionalità

- ✅ Autenticazione (login/registrazione)
- ✅ Dashboard con statistiche
- ✅ Gestione libri (CRUD)
- ✅ Gestione capitoli e paragrafi
- ✅ Editor di scrittura
- ✅ Tracciamento stato (bozza/in lavorazione/completato)
- ✅ Upload podcast MP3
- 🚧 Trascrizione automatica (Whisper)
- 🚧 Export Word/PDF/ePub

## 📄 Licenza

Progetto privato - © Angelo Pagliara
