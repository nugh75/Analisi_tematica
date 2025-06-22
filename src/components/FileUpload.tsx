import { useCallback, useRef } from 'react';
import { Upload, File, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useAppStore } from '../store/useAppStore';
import { db, type ExcelFile } from '../lib/database';
import * as XLSX from 'xlsx';

export default function FileUpload() {
  const { 
    files, 
    currentFile, 
    setFiles, 
    loadFile 
  } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    for (const file of Array.from(selectedFiles)) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const headers = jsonData[0] as string[];
        const data = jsonData.slice(1) as any[][];

        const newFile: ExcelFile = {
          name: file.name,
          headers,
          data,
          uploadDate: new Date()
        };

        // Salva il file nel database
        const id = await db.excelFiles.add(newFile);
        const fileWithId = { ...newFile, id };

        // Aggiorna la lista dei file
        const updatedFiles = await db.excelFiles.toArray();
        setFiles(updatedFiles);

        // Carica il nuovo file come attivo
        loadFile(fileWithId);
      } catch (error) {
        console.error('Errore nel caricamento del file:', error);
      }
    }
  }, [setFiles, loadFile]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (file: ExcelFile) => {
    if (file.id) {
      loadFile(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Carica File Excel
          </CardTitle>
          <CardDescription>
            Trascina i file Excel qui o clicca per selezionarli
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          <div
            onClick={handleUploadClick}
            className="border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg p-8 text-center cursor-pointer transition-colors"
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">
              Clicca per selezionare i file Excel
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supportati: .xlsx, .xls
            </p>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <File className="h-5 w-5" />
              File Caricati ({files.length})
            </CardTitle>
            <CardDescription>
              Seleziona un file per iniziare l'analisi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                    currentFile?.id === file.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleFileSelect(file)}
                >
                  <div className="flex items-center gap-3">
                    <File className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {file.headers.length} colonne, {file.data.length} righe
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentFile?.id === file.id && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Attivo
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant={currentFile?.id === file.id ? "default" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFileSelect(file);
                      }}
                    >
                      {currentFile?.id === file.id ? 'Selezionato' : 'Seleziona'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
