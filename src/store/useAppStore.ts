import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db, type ExcelFile, type Label, type CellLabel } from '../lib/database';
import * as XLSX from 'xlsx';

export interface ExcelData {
  id?: number;
  name: string;
  headers: string[];
  data: any[][];
  visibleColumns: boolean[];
}

export interface AppState {
  // Excel Data
  currentFile: ExcelData | null;
  files: ExcelFile[];
  
  // Labels
  labels: Label[];
  labelHierarchy: Map<string, Label[]>;
  
  // Cell Labels
  cellLabels: Map<string, string[]>; // key: "row-col", value: labelIds[]
  rowLabels: Map<number, string[]>; // key: rowIndex, value: labelIds[]
  
  // UI State
  selectedCells: Set<string>; // "row-col" format
  selectedRows: Set<number>;
  showLabelPanel: boolean;
  showAnalytics: boolean;
  keyColumn: string | null;
  
  // Sidebar state
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  
  // Colonne Anagrafiche
  demographicColumns: Set<string>; // Nome delle colonne anagrafiche
  
  // Actions
  loadFile: (file: ExcelFile) => void;
  loadFileFromUrl: (url: string, name: string) => Promise<void>;
  loadFileById: (fileId: number) => Promise<void>;
  loadAvailableFiles: () => Promise<void>;
  setFiles: (files: ExcelFile[]) => void;
  addLabel: (label: Omit<Label, 'createdAt'>) => Promise<void>;
  updateLabel: (id: string, updates: Partial<Label>) => Promise<void>;
  deleteLabel: (id: string) => Promise<void>;
  loadLabels: () => Promise<void>;
  applyCellLabel: (rowIndex: number, columnIndex: number, labelId: string) => Promise<void>;
  applyRowLabel: (rowIndex: number, labelId: string) => Promise<void>;
  removeCellLabel: (rowIndex: number, columnIndex: number, labelId: string) => Promise<void>;
  removeRowLabel: (rowIndex: number, labelId: string) => Promise<void>;
  loadCellLabels: (fileId: number) => Promise<void>;
  toggleCellSelection: (rowIndex: number, columnIndex: number) => void;
  toggleRowSelection: (rowIndex: number) => void;
  clearSelections: () => void;
  setVisibleColumns: (visibleColumns: boolean[]) => void;
  setKeyColumn: (column: string | null) => void;
  setShowLabelPanel: (show: boolean) => void;
  setShowAnalytics: (show: boolean) => void;
  
  // Sidebar actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarWidth: (width: number) => void;
  toggleSidebar: () => void;
  
  // Demographic columns actions
  setDemographicColumns: (columns: Set<string>) => void;
  addDemographicColumn: (columnName: string) => void;
  removeDemographicColumn: (columnName: string) => void;
  isDemographicColumn: (columnName: string) => boolean;
  
  // Nuove funzioni per gestione dettagliata etichette
  getCellLabels: (rowIndex: number, columnIndex: number) => Promise<CellLabel[]>;
  getRowLabels: (rowIndex: number) => Promise<CellLabel[]>;
  getCellLabelHistory: (rowIndex: number, columnIndex: number) => Promise<CellLabel[]>;
  removeCellLabelById: (labelId: number) => Promise<void>;
  getRespondentData: (rowIndex: number) => Promise<{ cellData: any[], labels: Map<string, CellLabel[]> }>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentFile: null,
      files: [],
      labels: [],
      labelHierarchy: new Map(),
      cellLabels: new Map(),
      rowLabels: new Map(),
      selectedCells: new Set(),
      selectedRows: new Set(),
      showLabelPanel: true,
      showAnalytics: false,
      keyColumn: null,
      sidebarCollapsed: false,
      sidebarWidth: 320,
      demographicColumns: new Set(),

      // Actions
      loadFile: (file: ExcelFile) => {
        const visibleColumns = new Array(file.headers.length).fill(true);
        set({
          currentFile: {
            id: file.id,
            name: file.name,
            headers: file.headers,
            data: file.data,
            visibleColumns
          }
        });
        if (file.id) {
          get().loadCellLabels(file.id);
        }
      },

      loadFileFromUrl: async (url: string, name: string) => {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error('Network response was not ok');

          const arrayBuffer = await response.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          const headers = jsonData[0] as string[];
          const data = jsonData.slice(1) as any[][];

          const newFile: ExcelFile = {
            name: name,
            headers,
            data,
            uploadDate: new Date()
          };

          // Salva il file nel database
          const id = await db.excelFiles.add(newFile);
          const fileWithId = { ...newFile, id };

          // Aggiorna lo stato con il nuovo file
          const visibleColumns = new Array(headers.length).fill(true);
          const excelData: ExcelData = {
            id,
            name: newFile.name,
            headers: newFile.headers,
            data: newFile.data,
            visibleColumns
          };

          set((state) => ({
            files: [...state.files, fileWithId],
            currentFile: excelData
          }));

          // Carica le etichette delle celle per questo file
          if (id) {
            get().loadCellLabels(id);
          }
        } catch (error) {
          console.error('Errore nel caricamento del file da URL:', error);
          throw error;
        }
      },

      loadFileById: async (fileId: number) => {
        const file = await db.excelFiles.get(fileId);
        if (!file) throw new Error('File non trovato');

        const visibleColumns = new Array(file.headers.length).fill(true);
        const excelData: ExcelData = {
          id: file.id,
          name: file.name,
          headers: file.headers,
          data: file.data,
          visibleColumns
        };

        set({ currentFile: excelData });

        // Carica le etichette delle celle per questo file
        get().loadCellLabels(fileId);
      },

      setFiles: (files: ExcelFile[]) => set({ files }),

      loadAvailableFiles: async () => {
        const availableFiles = [
          {
            name: 'Cnr-Uniroma3 - Studenti - Questionario sull\'uso dell\'Intelligenza Artificiale (Risposte).xlsx',
            url: '/dati/Cnr-Uniroma3 - Studenti - Questionario sull\'uso dell\'Intelligenza Artificiale (Risposte).xlsx'
          },
          {
            name: 'Insegnanti S.U. - Questionario sull\'uso dell\'Intelligenza Artificiale (Risposte).xlsx',
            url: '/dati/Insegnanti S.U. - Questionario sull\'uso dell\'Intelligenza Artificiale (Risposte).xlsx'
          }
        ];

        try {
          // Controlla quali file sono già nel database
          const existingFiles = await db.excelFiles.toArray();
          const existingFileNames = new Set(existingFiles.map(f => f.name));

          // Carica solo i file che non sono già presenti
          for (const file of availableFiles) {
            if (!existingFileNames.has(file.name)) {
              await get().loadFileFromUrl(file.url, file.name);
            }
          }

          // Aggiorna la lista dei file
          const updatedFiles = await db.excelFiles.toArray();
          set({ files: updatedFiles });

          // Se non c'è un file corrente e ci sono file disponibili, carica il primo
          if (!get().currentFile && updatedFiles.length > 0) {
            await get().loadFileById(updatedFiles[0].id!);
          }
        } catch (error) {
          console.error('Errore nel caricamento automatico dei file:', error);
        }
      },

      addLabel: async (label: Omit<Label, 'createdAt'>) => {
        try {
          const newLabel: Label = {
            ...label,
            createdAt: new Date()
          };
          await db.labels.add(newLabel);
          await get().loadLabels();
        } catch (error) {
          console.error('Errore nell\'aggiunta dell\'etichetta:', error);
          throw error;
        }
      },

      updateLabel: async (id: string, updates: Partial<Label>) => {
        await db.labels.update(id, updates);
        await get().loadLabels();
      },

      deleteLabel: async (id: string) => {
        // Delete all cell labels with this labelId
        await db.cellLabels.where('labelId').equals(id).delete();
        // Delete the label
        await db.labels.delete(id);
        await get().loadLabels();
        // Reload cell labels for current file
        const currentFile = get().currentFile;
        if (currentFile?.id) {
          await get().loadCellLabels(currentFile.id);
        }
      },

      loadLabels: async () => {
        try {
          const labels = await db.labels.toArray();
          const hierarchy = new Map<string, Label[]>();
          
          // Build hierarchy
          labels.forEach(label => {
            if (label.parentId) {
              const children = hierarchy.get(label.parentId) || [];
              children.push(label);
              hierarchy.set(label.parentId, children);
            }
          });

          set({ labels, labelHierarchy: hierarchy });
        } catch (error) {
          console.error('Errore nel caricamento delle etichette:', error);
        }
      },

      applyCellLabel: async (rowIndex: number, columnIndex: number, labelId: string) => {
        const currentFile = get().currentFile;
        if (!currentFile?.id) return;

        // Ottieni la versione corrente per questa cella
        const existingLabels = await db.cellLabels
          .where('[fileId+rowIndex+columnIndex]')
          .equals([currentFile.id, rowIndex, columnIndex])
          .toArray();
        
        const currentVersion = Math.max(0, ...existingLabels.map(l => l.version || 0));

        const cellLabel: Omit<CellLabel, 'id'> = {
          fileId: currentFile.id,
          rowIndex,
          columnIndex,
          labelId,
          isRowLabel: false,
          appliedAt: new Date(),
          version: currentVersion + 1
        };

        await db.cellLabels.add(cellLabel);
        await get().loadCellLabels(currentFile.id);
      },

      applyRowLabel: async (rowIndex: number, labelId: string) => {
        const currentFile = get().currentFile;
        if (!currentFile?.id) return;

        // Ottieni la versione corrente per questa riga
        const existingLabels = await db.cellLabels
          .where('[fileId+rowIndex]')
          .equals([currentFile.id, rowIndex])
          .and(item => item.isRowLabel === true)
          .toArray();
        
        const currentVersion = Math.max(0, ...existingLabels.map(l => l.version || 0));

        const cellLabel: Omit<CellLabel, 'id'> = {
          fileId: currentFile.id,
          rowIndex,
          columnIndex: -1, // -1 indica che è un'etichetta di riga
          labelId,
          isRowLabel: true,
          appliedAt: new Date(),
          version: currentVersion + 1
        };

        await db.cellLabels.add(cellLabel);
        await get().loadCellLabels(currentFile.id);
      },

      removeCellLabel: async (rowIndex: number, columnIndex: number, labelId: string) => {
        const currentFile = get().currentFile;
        if (!currentFile?.id) return;

        await db.cellLabels
          .where('[fileId+rowIndex+columnIndex+labelId]')
          .equals([currentFile.id, rowIndex, columnIndex, labelId])
          .delete();

        await get().loadCellLabels(currentFile.id);
      },

      removeRowLabel: async (rowIndex: number, labelId: string) => {
        const currentFile = get().currentFile;
        if (!currentFile?.id) return;

        await db.cellLabels
          .where('fileId').equals(currentFile.id)
          .and(item => item.rowIndex === rowIndex && item.labelId === labelId && item.isRowLabel === true)
          .delete();

        await get().loadCellLabels(currentFile.id);
      },

      loadCellLabels: async (fileId: number) => {
        const cellLabelsData = await db.cellLabels.where('fileId').equals(fileId).toArray();
        
        const cellLabels = new Map<string, string[]>();
        const rowLabels = new Map<number, string[]>();

        cellLabelsData.forEach(cellLabel => {
          if (cellLabel.isRowLabel) {
            const existingRowLabels = rowLabels.get(cellLabel.rowIndex) || [];
            existingRowLabels.push(cellLabel.labelId);
            rowLabels.set(cellLabel.rowIndex, existingRowLabels);
          } else {
            const key = `${cellLabel.rowIndex}-${cellLabel.columnIndex}`;
            const existingLabels = cellLabels.get(key) || [];
            existingLabels.push(cellLabel.labelId);
            cellLabels.set(key, existingLabels);
          }
        });

        set({ cellLabels, rowLabels });
      },

      toggleCellSelection: (rowIndex: number, columnIndex: number) => {
        const key = `${rowIndex}-${columnIndex}`;
        const selectedCells = new Set(get().selectedCells);
        
        if (selectedCells.has(key)) {
          selectedCells.delete(key);
        } else {
          selectedCells.add(key);
        }
        
        set({ selectedCells });
      },

      toggleRowSelection: (rowIndex: number) => {
        const selectedRows = new Set(get().selectedRows);
        
        if (selectedRows.has(rowIndex)) {
          selectedRows.delete(rowIndex);
        } else {
          selectedRows.add(rowIndex);
        }
        
        set({ selectedRows });
      },

      clearSelections: () => {
        set({ selectedCells: new Set(), selectedRows: new Set() });
      },

      setVisibleColumns: (visibleColumns: boolean[]) => {
        const currentFile = get().currentFile;
        if (currentFile) {
          set({
            currentFile: { ...currentFile, visibleColumns }
          });
        }
      },

      setKeyColumn: (column: string | null) => set({ keyColumn: column }),
      setShowLabelPanel: (show: boolean) => set({ showLabelPanel: show }),
      setShowAnalytics: (show: boolean) => set({ showAnalytics: show }),
      setSidebarCollapsed: (collapsed: boolean) => set({ sidebarCollapsed: collapsed }),
      setSidebarWidth: (width: number) => set({ sidebarWidth: width }),
      toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setDemographicColumns: (columns: Set<string>) => set({ demographicColumns: columns }),
      addDemographicColumn: (columnName: string) => set(state => {
        const columns = new Set(state.demographicColumns);
        columns.add(columnName);
        return { demographicColumns: columns };
      }),
      removeDemographicColumn: (columnName: string) => set(state => {
        const columns = new Set(state.demographicColumns);
        columns.delete(columnName);
        return { demographicColumns: columns };
      }),
      isDemographicColumn: (columnName: string) => get().demographicColumns.has(columnName),

      // Nuove funzioni per gestione dettagliata etichette
      getCellLabels: async (rowIndex: number, columnIndex: number) => {
        const currentFile = get().currentFile;
        if (!currentFile?.id) return [];
        
        return await db.cellLabels
          .where('[fileId+rowIndex+columnIndex]')
          .equals([currentFile.id, rowIndex, columnIndex])
          .and(item => !item.isRowLabel)
          .toArray();
      },

      getRowLabels: async (rowIndex: number) => {
        const currentFile = get().currentFile;
        if (!currentFile?.id) return [];
        
        return await db.cellLabels
          .where('[fileId+rowIndex]')
          .equals([currentFile.id, rowIndex])
          .and(item => item.isRowLabel === true)
          .toArray();
      },

      getCellLabelHistory: async (rowIndex: number, columnIndex: number) => {
        const currentFile = get().currentFile;
        if (!currentFile?.id) return [];
        
        return await db.cellLabels
          .where('[fileId+rowIndex+columnIndex]')
          .equals([currentFile.id, rowIndex, columnIndex])
          .and(item => !item.isRowLabel)
          .reverse()
          .sortBy('version');
      },

      removeCellLabelById: async (labelId: number) => {
        await db.cellLabels.delete(labelId);
        const currentFile = get().currentFile;
        if (currentFile?.id) {
          await get().loadCellLabels(currentFile.id);
        }
      },

      getRespondentData: async (rowIndex: number) => {
        const currentFile = get().currentFile;
        if (!currentFile?.id) return { cellData: [], labels: new Map() };

        const cellData = currentFile.data[rowIndex] || [];
        
        // Ottieni tutte le etichette per questa riga
        const allLabels = await db.cellLabels
          .where('[fileId+rowIndex]')
          .equals([currentFile.id, rowIndex])
          .toArray();

        const labelsByCell = new Map<string, CellLabel[]>();
        
        allLabels.forEach(label => {
          const key = label.isRowLabel ? 'row' : `cell-${label.columnIndex}`;
          const existing = labelsByCell.get(key) || [];
          existing.push(label);
          labelsByCell.set(key, existing);
        });

        return { cellData, labels: labelsByCell };
      },
    }),
    {
      name: 'thematic-analysis-storage',
      partialize: (state) => ({
        showLabelPanel: state.showLabelPanel,
        showAnalytics: state.showAnalytics,
      }),
    }
  )
);
