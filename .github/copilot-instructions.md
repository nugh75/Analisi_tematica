# Copilot Instructions per Analisi Tematica

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Descrizione del Progetto

Questa è un'applicazione React TypeScript per l'analisi tematica di file Excel, progettata per ricercatori. L'applicazione permette di:

- Caricare file Excel (.xlsx, .xls)
- Etichettare manualmente i dati (celle e righe)
- Gestire etichette con gerarchia dinamica
- Navigare e filtrare i dati
- Visualizzare analisi quantitative

## Tecnologie Utilizzate

- **React 18** con TypeScript
- **Vite** come build tool
- **Zustand** per state management
- **Dexie.js** per persistenza locale (IndexedDB)
- **Tailwind CSS** per styling
- **shadcn/ui** per componenti UI
- **Recharts** per visualizzazioni
- **XLSX** per parsing Excel
- **Lucide React** per icone

## Struttura del Progetto

```
src/
├── components/
│   ├── ui/           # Componenti base shadcn/ui
│   ├── FileUpload.tsx
│   ├── DataGrid.tsx
│   ├── LabelManager.tsx
│   ├── ColumnSelector.tsx
│   ├── CellNavigator.tsx
│   └── AnalyticsDashboard.tsx
├── store/
│   └── useAppStore.ts  # Store Zustand
├── lib/
│   ├── database.ts     # Schema Dexie
│   └── utils.ts        # Utilità
└── App.tsx
```

## Pattern e Best Practices

1. **State Management**: Usare Zustand store per stato globale
2. **Database**: Tutte le operazioni passano attraverso Dexie.js
3. **Styling**: Utilizzare Tailwind CSS con design system shadcn/ui
4. **TypeScript**: Tipizzazione forte per tutti i componenti
5. **Modularità**: Componenti piccoli e riutilizzabili

## Convenzioni

- Nomi componenti in PascalCase
- File TypeScript con estensione .tsx per componenti
- Import path alias @ per src/
- Colori tematici: blu per primary, verde per success, rosso per destructive
- Responsive design con mobile-first approach

## Funzionalità Chiave

- **Etichettatura a Livello Cella**: Click su cella per applicare etichette
- **Etichettatura a Livello Riga**: Click su numero riga per etichettare intera riga
- **Gerarchia Etichette**: Supporto per etichette padre-figlio
- **Navigazione Avanzata**: Filtri per colonna chiave e selezione multipla
- **Analytics**: Dashboard con grafici di frequenza e distribuzioni
- **Persistenza**: Salvataggio automatico in IndexedDB

## Note per l'AI

- Mantenere consistenza con il design system esistente
- Utilizzare sempre i hook dello store Zustand per state management
- Assicurarsi che tutte le operazioni database siano async/await
- Seguire i pattern esistenti per gestione errori
- Testare la responsività su mobile e desktop
