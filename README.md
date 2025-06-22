# Analisi Tematica - Applicazione per Ricercatori

Un'applicazione web React TypeScript moderna per l'analisi tematica di file Excel, progettata specificamente per ricercatori. L'applicazione offre strumenti avanzati per l'etichettatura manuale, l'organizzazione gerarchica dei dati e l'analisi quantitativa.

## ✨ Caratteristiche Principali

### 📊 Gestione File Excel
- **File preconfigurati**: I file Excel sono già disponibili nella cartella `/public/dati`
- **Caricamento automatico**: Seleziona e carica i file dalla lista predefinita
- **Anteprima completa**: Visualizzazione tabellare con interfaccia Material Design
- **Colonne personalizzabili**: Mostra/nascondi colonne specifiche
- **Persistenza locale**: Tutti i dati salvati automaticamente in IndexedDB

### 🔄 Sistema di Versioning Avanzato
- **Versioning automatico**: Ogni etichetta applicata ha un numero di versione progressivo
- **Cronologia completa**: Tracciamento di tutte le modifiche con timestamp
- **Vista dettagliata celle**: Click sulle celle per gestire le etichette specifiche
- **Vista rispondente**: Panoramica completa di tutte le risposte di un partecipante
- **Gestione granulare**: Aggiungi/rimuovi etichette singolarmente con controllo versioni
- **Etichettatura a livello cella**: Click diretto per etichettare singole celle
- **Etichettatura a livello riga**: Selezione rapida di righe complete
- **Gerarchia dinamica**: Organizza etichette in strutture padre-figlio
- **Colori personalizzati**: Palette di colori per categorizzazione visiva
- **Batch labeling**: Applica etichette a selezioni multiple

### 🔍 Navigazione e Ricerca
- **Colonna chiave**: Definisce una colonna principale per la ricerca
- **Filtri avanzati**: Cerca e filtra dati in tempo reale
- **Selezione batch**: Seleziona automaticamente celle basate sui filtri
- **Navigazione rapida**: Jump to specific rows e column sorting

### 📈 Dashboard Analitica
- **Statistiche in tempo reale**: Conta e percentuali di copertura
- **Grafici interattivi**: Bar charts e pie charts con Recharts
- **Distribuzione etichette**: Analisi quantitativa delle categorizzazioni
- **Export reports**: Panoramica completa per reporting

## 🛠️ Tecnologie Utilizzate

### Frontend & UI
- **React 18** + TypeScript per type safety
- **Material-UI (MUI)** per design system moderno
- **Vite** come build tool e dev server veloce
- **Zustand** per state management leggero e performante

### Data & Persistenza
- **Dexie.js** per database IndexedDB locale
- **XLSX** per parsing e manipolazione file Excel
- **Recharts** per visualizzazioni dati interattive

### Design System
- **Material Design 3** principles
- **Responsive layout** mobile-first
- **Custom theme** con palette colori ottimizzata
- **Iconografia** da Material Icons

## 🚀 Setup e Installazione

### Prerequisiti
- Node.js 18+ 
- npm o yarn

### Installazione
```bash
# Clona il repository
git clone <repository-url>
cd analisi-tematica

# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev

# Build per produzione
npm run build
```

### File Dataset Preconfigurati

L'applicazione include file Excel già pronti per l'analisi nella cartella `/public/dati`:

- **Cnr-Uniroma3 - Studenti**: Questionario sull'uso dell'Intelligenza Artificiale (Risposte degli studenti)
- **Insegnanti S.U.**: Questionario sull'uso dell'Intelligenza Artificiale (Risposte degli insegnanti)

Questi file vengono caricati automaticamente dalla lista nella pagina principale, senza necessità di upload manuale.

### Struttura del Progetto
```
src/
├── components/           # Componenti React riutilizzabili
│   ├── ui/              # Componenti base Material-UI personalizzati
│   ├── FileUpload.tsx   # Upload e gestione file Excel
│   ├── DataGrid.tsx     # Griglia dati con etichettatura
│   ├── LabelManager.tsx # Gestione etichette gerarchiche
│   ├── ColumnSelector.tsx # Controllo visibilità colonne
│   ├── CellNavigator.tsx # Navigazione e ricerca avanzata
│   └── AnalyticsDashboard.tsx # Dashboard analitica
├── store/
│   └── useAppStore.ts   # Store Zustand globale
├── lib/
│   ├── database.ts      # Schema e operazioni Dexie
│   └── utils.ts         # Funzioni utility
├── theme/
│   └── materialTheme.ts # Tema Material-UI personalizzato
└── App.tsx              # Componente principale
```

## 📖 Guida all'Utilizzo

### 1. Caricamento File
1. Clicca su "Carica File Excel" nell'area upload
2. Seleziona uno o più file .xlsx/.xls
3. Il file verrà processato e mostrato nella griglia

### 2. Gestione Etichette
1. Vai al pannello "Gestione Etichette"
2. Clicca "Nuova" per creare un'etichetta
3. Scegli nome, colore e gerarchia (opzionale)
4. Le etichette appaiono nell'elenco organizzate per gerarchia

### 3. Etichettatura Dati
- **Celle singole**: Click diretto sulla cella
- **Righe complete**: Click sul numero di riga
- **Selezione multipla**: Usa Ctrl/Cmd + click
- **Batch**: Usa il pannello "Navigazione Avanzata"

### 4. Gestione Avanzata Etichette
1. **Vista dettagliata cella**: Click sull'icona 👁️ nella cella per gestire le etichette specifiche
2. **Vista rispondente**: Click sull'icona 👤 nel numero di riga per vedere tutte le risposte
3. **Versioning**: Ogni etichetta applicata viene tracciata con versione e timestamp
4. **Rimozione selettiva**: Rimuovi etichette specifiche mantenendo la cronologia
5. **Cronologia completa**: Visualizza l'evoluzione delle etichettature nel tempo

### 5. Navigazione Avanzata
1. Seleziona una "Colonna Chiave" 
2. Inserisci un termine di ricerca
3. Clicca "Cerca" per filtrare le righe
4. Seleziona colonne target per batch selection
5. Applica etichette alla selezione

### 5. Analisi Quantitativa
- Vai alla sezione "Dashboard Analisi"
- Visualizza statistiche di copertura
- Esamina grafici di distribuzione
- Analizza l'etichettatura per colonna

## 🎨 Interfaccia Material Design

### Caratteristiche UI
- **Design pulito e moderno** con Material Design 3
- **Palette colori** ottimizzata per analisi dati
- **Tipografia Inter** per massima leggibilità
- **Iconografia consistente** con Material Icons
- **Responsive design** da mobile a desktop

### Componenti Personalizzati
- **Cards elevate** con shadows sottili
- **Buttons** con hover effects
- **Tables** con sticky headers
- **Chips** per etichette colorate
- **Drawer navigation** per mobile

## 🔧 Architettura Tecnica

### State Management (Zustand)
```typescript
interface AppState {
  // File management
  files: ExcelFile[]
  currentFile: ExcelFile | null
  
  // Labeling system
  labels: Label[]
  cellLabels: Map<string, string[]>
  rowLabels: Map<number, string[]>
  
  // Selection state
  selectedCells: Set<string>
  selectedRows: Set<number>
  
  // Navigation
  keyColumn: string | null
  
  // Actions
  loadFile: (file: ExcelFile) => void
  addLabel: (label: LabelData) => Promise<void>
  applyCellLabel: (row: number, col: number, labelId: string) => Promise<void>
  // ... more actions
}
```

### Database Schema (Dexie)
```typescript
// Tabelle IndexedDB
excelFiles: { id, name, data, headers, uploadDate, visibleColumns }
labels: { id, name, color, parentId?, createdAt }
cellLabels: { id, fileId, rowIndex, columnIndex, labelId, createdAt }
```

## 🛡️ Best Practices Implementate

### Performance
- **Lazy loading** componenti
- **Virtualizzazione** tabelle grandi
- **Debounced search** per filtri
- **Memoization** calcoli pesanti

### UX/UI
- **Loading states** per operazioni async
- **Error boundaries** per gestione errori
- **Feedback visivo** per azioni utente
- **Accessibilità** ARIA labels

### Data Integrity
- **TypeScript strict mode**
- **Validazione input** all'inserimento
- **Backup automatico** IndexedDB
- **Error handling** robusto

## 🤝 Contribuire

1. Fork del repository
2. Crea feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Add: AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

### Coding Standards
- **TypeScript** strict mode
- **ESLint** + Prettier
- **Conventional Commits**
- **Component documentation**

## 📄 Licenza

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Supporto

Per bug reports e feature requests, apri una issue su GitHub.

---

**Sviluppato con ❤️ per la comunità di ricerca**
