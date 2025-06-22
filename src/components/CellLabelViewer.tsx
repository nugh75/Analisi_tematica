import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Stack,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Badge,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  Label as LabelIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useAppStore } from '@/store/useAppStore';
import type { CellLabel } from '@/lib/database';

interface CellLabelViewerProps {
  open: boolean;
  onClose: () => void;
  rowIndex: number;
  columnIndex?: number; // Se undefined, mostra tutta la riga
}

export const CellLabelViewer: React.FC<CellLabelViewerProps> = ({
  open,
  onClose,
  rowIndex,
  columnIndex
}) => {
  const {
    currentFile,
    labels,
    getCellLabels,
    getRowLabels,
    getCellLabelHistory,
    removeCellLabelById,
    getRespondentData,
    applyCellLabel,
    applyRowLabel,
    demographicColumns,
    isDemographicColumn,
  } = useAppStore();

  const [cellLabels, setCellLabels] = useState<CellLabel[]>([]);
  const [rowLabels, setRowLabels] = useState<CellLabel[]>([]);
  const [labelHistory, setLabelHistory] = useState<CellLabel[]>([]);
  const [respondentData, setRespondentData] = useState<{ cellData: any[], labels: Map<string, CellLabel[]> }>({ 
    cellData: [], 
    labels: new Map() 
  });
  const [showHistory, setShowHistory] = useState(false);
  const [showAddLabels, setShowAddLabels] = useState(false);

  useEffect(() => {
    if (open && currentFile) {
      loadLabelData();
    }
  }, [open, rowIndex, columnIndex, currentFile]);

  const loadLabelData = async () => {
    if (columnIndex !== undefined) {
      // Vista singola cella
      const cellLabelData = await getCellLabels(rowIndex, columnIndex);
      const history = await getCellLabelHistory(rowIndex, columnIndex);
      setCellLabels(cellLabelData);
      setLabelHistory(history);
    } else {
      // Vista intera riga (rispondente)
      const rowLabelData = await getRowLabels(rowIndex);
      const data = await getRespondentData(rowIndex);
      setRowLabels(rowLabelData);
      setRespondentData(data);
    }
  };

  const handleRemoveLabel = async (labelId: number) => {
    if (confirm('Sei sicuro di voler rimuovere questa etichetta?')) {
      await removeCellLabelById(labelId);
      await loadLabelData();
    }
  };

  const handleAddLabel = async (labelId: string) => {
    if (columnIndex !== undefined) {
      await applyCellLabel(rowIndex, columnIndex, labelId);
    } else {
      await applyRowLabel(rowIndex, labelId);
    }
    await loadLabelData();
    setShowAddLabels(false);
  };

  const getLabelInfo = (labelId: string) => {
    return labels.find(l => l.id === labelId);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const renderCellView = () => {
    if (!currentFile || columnIndex === undefined) return null;

    const cellValue = currentFile.data[rowIndex]?.[columnIndex];
    const columnName = currentFile.headers[columnIndex];
    const isDemo = isDemographicColumn(columnName);

    return (
      <Box>
        <Paper elevation={1} sx={{ 
          p: 3, 
          mb: 3, 
          bgcolor: isDemo ? 'warning.50' : 'primary.50', 
          border: 1, 
          borderColor: isDemo ? 'warning.200' : 'primary.200' 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography variant="h6" color={isDemo ? 'warning.main' : 'primary.main'}>
              Cella Selezionata
            </Typography>
            {isDemo && (
              <Chip 
                label="Anagrafica" 
                size="small" 
                color="warning" 
                variant="outlined"
                icon={<InfoIcon />}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Posizione
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                Riga {rowIndex + 1}, Colonna "{columnName}"
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Contenuto
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {cellValue || '(vuoto)'}
              </Typography>
            </Box>
          </Box>
          {isDemo && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.100', borderRadius: 1 }}>
              <Typography variant="body2" color="warning.dark">
                ⚠️ Questa è una colonna anagrafica. Le colonne anagrafiche contengono dati del rispondente 
                e non possono essere etichettate per l'analisi tematica.
              </Typography>
            </Box>
          )}
        </Paper>

        {!isDemo && (
          <>
            {/* Etichette correnti */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" color="text.primary">
                  Etichette Applicate ({cellLabels.length})
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setShowAddLabels(!showAddLabels)}
                >
                  Aggiungi Etichetta
                </Button>
              </Box>

              {showAddLabels && (
                <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" gutterBottom>
                    Seleziona un'etichetta da aggiungere:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {labels.map((label) => (
                      <Chip
                        key={label.id}
                        label={label.name}
                        size="small"
                        clickable
                        onClick={() => handleAddLabel(label.id)}
                        sx={{
                          bgcolor: label.color,
                          color: 'white',
                          '&:hover': { opacity: 0.8 }
                        }}
                      />
                    ))}
                  </Stack>
                </Paper>
              )}

              {cellLabels.length > 0 ? (
                <Stack spacing={1}>
                  {cellLabels.map((cellLabel) => {
                    const labelInfo = getLabelInfo(cellLabel.labelId);
                    return (
                      <Card key={cellLabel.id} elevation={1}>
                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  bgcolor: labelInfo?.color || '#ccc'
                                }}
                              />
                              <Typography variant="body1" fontWeight={500}>
                                {labelInfo?.name || 'Etichetta eliminata'}
                              </Typography>
                              <Badge badgeContent={`v${cellLabel.version}`} color="primary" />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(cellLabel.appliedAt)}
                              </Typography>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveLabel(cellLabel.id!)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    bgcolor: 'grey.50',
                    border: 1,
                    borderColor: 'divider',
                    borderStyle: 'dashed'
                  }}
                >
                  <LabelIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Nessuna etichetta applicata a questa cella
                  </Typography>
                </Paper>
              )}
            </Box>

            {/* Cronologia */}
            <Accordion expanded={showHistory} onChange={() => setShowHistory(!showHistory)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HistoryIcon />
                  <Typography>Cronologia Etichette ({labelHistory.length})</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {labelHistory.length > 0 ? (
                  <List dense>
                    {labelHistory.map((historyItem, index) => {
                      const labelInfo = getLabelInfo(historyItem.labelId);
                      return (
                        <ListItem key={`${historyItem.id}-${index}`}>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: labelInfo?.color || '#ccc'
                                  }}
                                />
                                {labelInfo?.name || 'Etichetta eliminata'}
                                <Badge badgeContent={`v${historyItem.version}`} color="secondary" />
                              </Box>
                            }
                            secondary={formatDate(historyItem.appliedAt)}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nessuna cronologia disponibile
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          </>
        )}

        {isDemo && (
          <Paper elevation={1} sx={{ p: 3, bgcolor: 'info.50', border: 1, borderColor: 'info.200' }}>
            <Typography variant="h6" gutterBottom color="info.main">
              Informazioni Colonna Anagrafica
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Le colonne anagrafiche vengono utilizzate per memorizzare informazioni sui rispondenti 
              (es. età, genere, professione) e sono sempre visibili durante l'analisi per fornire contesto.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Per rimuovere o modificare le colonne anagrafiche, utilizza il tab "Colonne Anagrafiche" 
              nella barra laterale.
            </Typography>
          </Paper>
        )}
      </Box>
    );
  };

  const renderRowView = () => {
    if (!currentFile || columnIndex !== undefined) return null;

    return (
      <Box>
        <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: 'success.50', border: 1, borderColor: 'success.200' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <PersonIcon color="success" />
            <Typography variant="h6" color="success.main">
              Rispondente #{rowIndex + 1}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Vista completa delle risposte e etichette di questo rispondente
          </Typography>
        </Paper>

        {/* Dati anagrafici sempre visibili */}
        {demographicColumns.size > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom color="warning.main">
              Dati Anagrafici
            </Typography>
            <Paper elevation={1} sx={{ p: 2, bgcolor: 'warning.50', border: 1, borderColor: 'warning.200' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                {Array.from(demographicColumns).map((columnName) => {
                  const colIndex = currentFile.headers.indexOf(columnName);
                  if (colIndex === -1) return null;
                  
                  const value = currentFile.data[rowIndex]?.[colIndex];
                  
                  return (
                    <Box key={columnName}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {columnName}
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {value || '(non specificato)'}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          </Box>
        )}

        {/* Etichette di riga */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Etichette Generali ({rowLabels.length})
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setShowAddLabels(!showAddLabels)}
            >
              Aggiungi Etichetta
            </Button>
          </Box>

          {showAddLabels && (
            <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" gutterBottom>
                Seleziona un'etichetta da aggiungere al rispondente:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {labels.map((label) => (
                  <Chip
                    key={label.id}
                    label={label.name}
                    size="small"
                    clickable
                    onClick={() => handleAddLabel(label.id)}
                    sx={{
                      bgcolor: label.color,
                      color: 'white',
                      '&:hover': { opacity: 0.8 }
                    }}
                  />
                ))}
              </Stack>
            </Paper>
          )}

          {rowLabels.length > 0 ? (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {rowLabels.map((rowLabel) => {
                const labelInfo = getLabelInfo(rowLabel.labelId);
                return (
                  <Chip
                    key={rowLabel.id}
                    label={labelInfo?.name || 'Etichetta eliminata'}
                    size="small"
                    onDelete={() => handleRemoveLabel(rowLabel.id!)}
                    sx={{
                      bgcolor: labelInfo?.color || '#ccc',
                      color: 'white'
                    }}
                  />
                );
              })}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Nessuna etichetta generale applicata
            </Typography>
          )}
        </Box>

        {/* Risposte per colonna (escluse le anagrafiche) */}
        <Typography variant="h6" gutterBottom>
          Risposte per Domanda
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Le colonne anagrafiche sono mostrate sopra per contesto, ma non possono essere etichettate.
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
          {currentFile.headers.map((header, colIndex) => {
            // Saltiamo le colonne anagrafiche
            if (isDemographicColumn(header)) return null;

            const cellValue = respondentData.cellData[colIndex];
            const cellLabelsForCol = respondentData.labels.get(`cell-${colIndex}`) || [];
            
            return (
              <Card elevation={1} sx={{ height: '100%' }} key={colIndex}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom color="primary">
                    {header}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, minHeight: 40 }}>
                    {cellValue || '(nessuna risposta)'}
                  </Typography>
                  {cellLabelsForCol.length > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                        Etichette:
                      </Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {cellLabelsForCol.map((cellLabel) => {
                          const labelInfo = getLabelInfo(cellLabel.labelId);
                          return (
                            <Chip
                              key={cellLabel.id}
                              label={labelInfo?.name || 'Eliminata'}
                              size="small"
                              variant="outlined"
                              onDelete={() => handleRemoveLabel(cellLabel.id!)}
                              sx={{
                                borderColor: labelInfo?.color || '#ccc',
                                color: labelInfo?.color || '#ccc'
                              }}
                            />
                          );
                        })}
                      </Stack>
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>
    );
  };

  const title = columnIndex !== undefined 
    ? `Gestione Etichette - Cella [${rowIndex + 1}, ${currentFile?.headers[columnIndex] || columnIndex + 1}]`
    : `Gestione Etichette - Rispondente #${rowIndex + 1}`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 3 }}>
        {columnIndex !== undefined ? renderCellView() : renderRowView()}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Chiudi
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CellLabelViewer;
