import Dexie, { type Table } from 'dexie';

export interface ExcelFile {
  id?: number;
  name: string;
  data: any[][];
  headers: string[];
  uploadDate: Date;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  parentId?: string;
  children?: Label[];
  createdAt: Date;
}

export interface CellLabel {
  id?: number;
  fileId: number;
  rowIndex: number;
  columnIndex: number;
  labelId: string;
  isRowLabel: boolean; // true se è un'etichetta applicata all'intera riga
  appliedAt: Date;
  version: number; // Versione dell'etichetta
  appliedBy?: string; // Chi ha applicato l'etichetta (futuro uso)
  notes?: string; // Note opzionali
}

export class ThematicAnalysisDB extends Dexie {
  excelFiles!: Table<ExcelFile>;
  labels!: Table<Label>;
  cellLabels!: Table<CellLabel>;

  constructor() {
    super('ThematicAnalysisDB');
    this.version(2).stores({
      excelFiles: '++id, name, uploadDate',
      labels: 'id, name, parentId, createdAt',
      cellLabels: '++id, fileId, rowIndex, columnIndex, labelId, isRowLabel, appliedAt, version'
    });
  }
}

export const db = new ThematicAnalysisDB();
