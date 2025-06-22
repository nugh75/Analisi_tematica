import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Divider,
  Badge,
  TextField,
  InputAdornment,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  NavigateBefore,
  NavigateNext,
  Search,
  Label as LabelIcon,
  Person,
  BarChart,
  ExpandMore,
  ExpandLess,
  Add,
  Close,
  CheckCircle,
  CheckBox,
  CheckBoxOutlineBlank,
  Edit,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useAppStore } from '@/store/useAppStore';

interface RowData {
  [key: string]: any;
}

const RowSummary: React.FC = () => {
  const {
    currentFile,
    labels,
    applyRowLabel,
    removeRowLabel,
    getRowLabels,
    isDemographicColumn,
    selectedRowForSummary,
    setSelectedRowForSummary,
    applyCellLabel,
    removeCellLabel,
    getCellLabels,
    loadLabels
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyContent, setShowOnlyContent] = useState(false);
  
  // Due tipi di selezione
  const [selectedCellsForView, setSelectedCellsForView] = useState<Set<string>>(new Set());
  const [selectedCellsForLabeling, setSelectedCellsForLabeling] = useState<Set<string>>(new Set());
  const [appliedViewFilter, setAppliedViewFilter] = useState<Set<string>>(new Set()); // Celle effettivamente filtrate
  
  const [cellLabelsData, setCellLabelsData] = useState<Map<string, any[]>>(new Map());
  const [showCellViewSelector, setShowCellViewSelector] = useState(false);
  const [showCellLabelSelector, setShowCellLabelSelector] = useState(false);
  const [viewFilterActive, setViewFilterActive] = useState(false); // Se il filtro è attivo
  const [expandedSections, setExpandedSections] = useState({
    data: true,
    labels: true,
    cells: true,
    stats: false
  });
  const [rowData, setRowData] = useState<RowData>({});
  const [currentRowLabels, setCurrentRowLabels] = useState<string[]>([]);
  const [showLabelDialog, setShowLabelDialog] = useState(false);
  const [showCellLabelDialog, setShowCellLabelDialog] = useState(false);
  const [showBulkCellLabelDialog, setShowBulkCellLabelDialog] = useState(false);
  const [selectedCellForLabeling, setSelectedCellForLabeling] = useState<string | null>(null);
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);

  // Carica i dati della riga selezionata
  useEffect(() => {
    // Carica le etichette all'avvio se non ci sono
    if (labels.length === 0) {
      loadLabels();
    }
  }, [labels.length, loadLabels]);

  useEffect(() => {
    if (currentFile && selectedRowForSummary >= 0 && selectedRowForSummary < currentFile.data.length) {
      const data: RowData = {};
      currentFile.headers.forEach((header, index) => {
        data[header] = currentFile.data[selectedRowForSummary][index];
      });
      setRowData(data);
      
      // Carica le etichette della riga
      loadRowLabels();
      // Carica le etichette delle celle
      loadCellLabels();
    }
  }, [selectedRowForSummary, currentFile]);

  const loadCellLabels = async () => {
    if (currentFile?.id) {
      try {
        const cellLabelsMap = new Map();
        for (let colIndex = 0; colIndex < currentFile.headers.length; colIndex++) {
          const cellKey = `${selectedRowForSummary}-${colIndex}`;
          const cellLabels = await getCellLabels(selectedRowForSummary, colIndex);
          if (cellLabels.length > 0) {
            cellLabelsMap.set(cellKey, cellLabels);
          }
        }
        setCellLabelsData(cellLabelsMap);
      } catch (error) {
        console.error('Errore nel caricamento etichette celle:', error);
        setCellLabelsData(new Map());
      }
    }
  };

  const loadRowLabels = async () => {
    if (currentFile?.id) {
      try {
        const labels = await getRowLabels(selectedRowForSummary);
        setCurrentRowLabels(labels.map(l => l.labelId));
      } catch (error) {
        console.error('Errore nel caricamento etichette riga:', error);
        setCurrentRowLabels([]);
      }
    }
  };

  const handlePreviousRow = () => {
    if (selectedRowForSummary > 0) {
      setSelectedRowForSummary(selectedRowForSummary - 1);
    }
  };

  const handleNextRow = () => {
    if (currentFile && selectedRowForSummary < currentFile.data.length - 1) {
      setSelectedRowForSummary(selectedRowForSummary + 1);
    }
  };

  const handleRowSelect = (value: string) => {
    setSelectedRowForSummary(parseInt(value));
  };

  const toggleCellSelectionForView = (columnIndex: number) => {
    const cellKey = `${selectedRowForSummary}-${columnIndex}`;
    const newSelected = new Set(selectedCellsForView);
    
    if (newSelected.has(cellKey)) {
      newSelected.delete(cellKey);
    } else {
      newSelected.add(cellKey);
    }
    
    setSelectedCellsForView(newSelected);
  };

  const toggleCellSelectionForLabeling = (columnIndex: number) => {
    const cellKey = `${selectedRowForSummary}-${columnIndex}`;
    const newSelected = new Set(selectedCellsForLabeling);
    
    if (newSelected.has(cellKey)) {
      newSelected.delete(cellKey);
    } else {
      newSelected.add(cellKey);
    }
    setSelectedCellsForLabeling(newSelected);
  };

  const handleCellLabelClick = (columnIndex: number) => {
    const cellKey = `${selectedRowForSummary}-${columnIndex}`;
    setSelectedCellForLabeling(cellKey);
    setShowCellLabelDialog(true);
  };

  const handleAddCellLabel = async (labelId: string) => {
    if (!selectedCellForLabeling) return;
    
    try {
      const [rowIndex, columnIndex] = selectedCellForLabeling.split('-').map(Number);
      await applyCellLabel(rowIndex, columnIndex, labelId);
      await loadCellLabels();
      
      const label = labels.find(l => l.id === labelId);
      setRecentlyAdded(`Cella: ${label?.name || labelId}`);
      setTimeout(() => setRecentlyAdded(null), 2000);
      
      setShowCellLabelDialog(false);
      setSelectedCellForLabeling(null);
    } catch (error) {
      console.error('Errore nell\'aggiunta etichetta cella:', error);
    }
  };

  const handleAddBulkCellLabel = async (labelId: string) => {
    if (selectedCellsForLabeling.size === 0) return;
    
    try {
      const promises = Array.from(selectedCellsForLabeling).map(cellKey => {
        const [rowIndex, columnIndex] = cellKey.split('-').map(Number);
        return applyCellLabel(rowIndex, columnIndex, labelId);
      });
      
      await Promise.all(promises);
      await loadCellLabels();
      
      const label = labels.find(l => l.id === labelId);
      setRecentlyAdded(`Etichetta "${label?.name || labelId}" applicata a ${selectedCellsForLabeling.size} celle`);
      setTimeout(() => setRecentlyAdded(null), 3000);
      
      setShowBulkCellLabelDialog(false);
      setSelectedCellsForLabeling(new Set());
    } catch (error) {
      console.error('Errore nell\'aggiunta etichette bulk:', error);
    }
  };

  const handleRemoveCellLabel = async (cellKey: string, labelId: string) => {
    try {
      const [rowIndex, columnIndex] = cellKey.split('-').map(Number);
      await removeCellLabel(rowIndex, columnIndex, labelId);
      await loadCellLabels();
    } catch (error) {
      console.error('Errore nella rimozione etichetta cella:', error);
    }
  };

  const handleApplyViewFilter = () => {
    setAppliedViewFilter(new Set(selectedCellsForView));
    setViewFilterActive(true);
  };

  const handleClearViewFilter = () => {
    setViewFilterActive(false);
    setAppliedViewFilter(new Set());
  };

  const handleResetViewSelection = () => {
    setSelectedCellsForView(new Set());
  };

  const filteredData = useMemo(() => {
    if (!searchQuery) return rowData;
    
    const filtered: RowData = {};
    Object.entries(rowData).forEach(([key, value]) => {
      if (key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(value).toLowerCase().includes(searchQuery.toLowerCase())) {
        filtered[key] = value;
      }
    });
    return filtered;
  }, [rowData, searchQuery]);

  const displayData = useMemo(() => {
    return showOnlyContent 
      ? Object.fromEntries(
          Object.entries(filteredData).filter(([key]) => !isDemographicColumn(key))
        )
      : filteredData;
  }, [filteredData, showOnlyContent, isDemographicColumn]);

  // Logica aggiornata per il filtro vista
  const finalDisplayData = useMemo(() => {
    // Se il filtro vista non è attivo, mostra tutto
    if (!viewFilterActive) {
      return displayData;
    }
    
    // Se il filtro vista è attivo ma nessuna cella è nel filtro applicato, mostra tutto
    if (appliedViewFilter.size === 0) {
      return displayData;
    }
    
    // Se ci sono celle nel filtro applicato, filtra per mostrarle
    const result: RowData = {};
    Object.entries(displayData).forEach(([key, value]) => {
      if (currentFile?.headers) {
        const columnIndex = currentFile.headers.indexOf(key);
        if (columnIndex >= 0) {
          const cellKey = `${selectedRowForSummary}-${columnIndex}`;
          if (appliedViewFilter.has(cellKey)) {
            result[key] = value;
          }
        }
      }
    });
    
    return result;
  }, [displayData, viewFilterActive, appliedViewFilter, currentFile?.headers, selectedRowForSummary]);

  const handleAddLabel = async (labelId: string) => {
    try {
      await applyRowLabel(selectedRowForSummary, labelId);
      await loadRowLabels();
      
      const label = labels.find(l => l.id === labelId);
      setRecentlyAdded(label?.name || labelId);
      setTimeout(() => setRecentlyAdded(null), 2000);
      
      setShowLabelDialog(false);
    } catch (error) {
      console.error('Errore nell\'aggiunta etichetta:', error);
    }
  };

  const handleRemoveLabel = async (labelId: string) => {
    try {
      await removeRowLabel(selectedRowForSummary, labelId);
      await loadRowLabels();
    } catch (error) {
      console.error('Errore nella rimozione etichetta:', error);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getLabelInfo = (labelId: string) => {
    return labels.find(l => l.id === labelId);
  };

  const availableLabels = labels.filter(label => !currentRowLabels.includes(label.id));

  const demographicData = Object.fromEntries(
    Object.entries(rowData).filter(([key]) => isDemographicColumn(key))
  );

  const getCellKey = (columnIndex: number) => `${selectedRowForSummary}-${columnIndex}`;

  if (!currentFile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <Typography color="textSecondary">
          Carica un file Excel per visualizzare il riepilogo delle righe
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header con controlli navigazione */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            Riepilogo Riga
          </Typography>
          
          {recentlyAdded && (
            <Alert 
              severity="success" 
              sx={{ py: 0 }}
              icon={<CheckCircle />}
            >
              Etichetta "{recentlyAdded}" aggiunta!
            </Alert>
          )}
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
          {/* Navigazione righe */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Tooltip title="Riga precedente">
              <IconButton 
                onClick={handlePreviousRow} 
                disabled={selectedRowForSummary === 0}
                size="small"
              >
                <NavigateBefore />
              </IconButton>
            </Tooltip>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Riga</InputLabel>
              <Select
                value={selectedRowForSummary}
                onChange={(e) => handleRowSelect(String(e.target.value))}
                label="Riga"
              >
                {currentFile.data.map((_, index) => (
                  <MenuItem key={index} value={index}>
                    Riga {index + 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Tooltip title="Riga successiva">
              <IconButton 
                onClick={handleNextRow} 
                disabled={selectedRowForSummary === currentFile.data.length - 1}
                size="small"
              >
                <NavigateNext />
              </IconButton>
            </Tooltip>
          </Stack>

          <Divider orientation="vertical" flexItem />

          {/* Filtri e ricerca */}
          <TextField
            size="small"
            placeholder="Cerca nei dati..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <Close />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 200 }}
          />

          <Button
            variant={showOnlyContent ? "contained" : "outlined"}
            size="small"
            onClick={() => setShowOnlyContent(!showOnlyContent)}
          >
            Solo Contenuti
          </Button>

          <Button
            variant={showCellViewSelector ? "contained" : "outlined"}
            size="small"
            startIcon={showCellViewSelector ? <Visibility /> : <VisibilityOff />}
            onClick={() => setShowCellViewSelector(!showCellViewSelector)}
          >
            Seleziona per Vista
          </Button>

          {showCellViewSelector && (
            <>
              <Button
                variant="contained"
                size="small"
                color="success"
                disabled={selectedCellsForView.size === 0}
                onClick={handleApplyViewFilter}
              >
                Applica Filtro Vista ({selectedCellsForView.size})
              </Button>
              
              {viewFilterActive && (
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={handleClearViewFilter}
                >
                  Rimuovi Filtro
                </Button>
              )}
              
              <Button
                variant="outlined"
                size="small"
                disabled={selectedCellsForView.size === 0}
                onClick={handleResetViewSelection}
              >
                Reset Selezione
              </Button>
            </>
          )}

          <Button
            variant={showCellLabelSelector ? "contained" : "outlined"}
            size="small"
            startIcon={showCellLabelSelector ? <Edit /> : <VisibilityOff />}
            onClick={() => setShowCellLabelSelector(!showCellLabelSelector)}
          >
            Selezione Etichette
          </Button>

          {selectedCellsForLabeling.size > 0 && (
            <Button
              variant="contained"
              size="small"
              color="info"
              startIcon={<LabelIcon />}
              onClick={() => setShowBulkCellLabelDialog(true)}
            >
              Etichetta {selectedCellsForLabeling.size} celle
            </Button>
          )}
        </Stack>
      </Paper>

      <Stack spacing={2}>
        {/* Sezione Dati Anagrafici */}
        {Object.keys(demographicData).length > 0 && (
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Person color="warning" />
                <Typography variant="h6" color="warning.main">
                  Dati Anagrafici
                </Typography>
                <Chip label={Object.keys(demographicData).length} size="small" color="warning" />
              </Stack>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                {Object.entries(demographicData).map(([key, value]) => (
                  <Box key={key} sx={{ p: 1, bgcolor: 'warning.50', borderRadius: 1 }}>
                    <Typography variant="caption" color="warning.main" fontWeight={600}>
                      {key}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {String(value || 'N/A')}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Sezione Etichette Riga */}
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <IconButton 
                  size="small" 
                  onClick={() => toggleSection('labels')}
                >
                  {expandedSections.labels ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
                <LabelIcon color="secondary" />
                <Typography variant="h6" color="secondary.main">
                  Etichette Riga
                </Typography>
                <Badge badgeContent={currentRowLabels.length} color="secondary">
                  <Box />
                </Badge>
              </Stack>
              
              <Button
                startIcon={<Add />}
                variant="contained"
                size="small"
                onClick={() => setShowLabelDialog(true)}
                disabled={availableLabels.length === 0}
              >
                Aggiungi Etichetta
              </Button>
            </Stack>

            <Collapse in={expandedSections.labels}>
              {currentRowLabels.length > 0 ? (
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {currentRowLabels.map((labelId) => {
                    const label = getLabelInfo(labelId);
                    return (
                      <Chip
                        key={labelId}
                        label={label?.name || labelId}
                        color="secondary"
                        variant="filled"
                        onDelete={() => handleRemoveLabel(labelId)}
                        sx={{ mb: 1 }}
                      />
                    );
                  })}
                </Stack>
              ) : (
                <Typography color="textSecondary" variant="body2">
                  Nessuna etichetta applicata a questa riga
                </Typography>
              )}
            </Collapse>
          </CardContent>
        </Card>

        {/* Sezione Etichette Celle */}
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <IconButton 
                size="small" 
                onClick={() => toggleSection('cells')}
              >
                {expandedSections.cells ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
              <Edit color="info" />
              <Typography variant="h6" color="info.main">
                Etichette Celle
              </Typography>
              <Badge badgeContent={cellLabelsData.size} color="info">
                <Box />
              </Badge>
            </Stack>

            <Collapse in={expandedSections.cells}>
              {(showCellViewSelector || showCellLabelSelector) && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    {showCellViewSelector && "🔍 Selezione Vista: Seleziona le celle desiderate e poi clicca 'Applica Filtro Vista'. "}
                    {showCellLabelSelector && "🏷️ Selezione Etichette: Seleziona più celle per applicare la stessa etichetta. "}
                    {showCellViewSelector && (
                      <strong>
                        {selectedCellsForView.size > 0 
                          ? `${selectedCellsForView.size} celle selezionate per il filtro vista. `
                          : "Nessuna cella selezionata per il filtro vista. "
                        }
                        {viewFilterActive 
                          ? `Filtro attivo su ${appliedViewFilter.size} celle.`
                          : "Filtro vista non attivo - mostrando tutti i campi."
                        }
                      </strong>
                    )}
                  </Typography>
                </Alert>
              )}

              <Stack spacing={2}>
                {Object.keys(finalDisplayData).length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="textSecondary">
                      {viewFilterActive && appliedViewFilter.size > 0 
                        ? "Nessuna cella del filtro vista corrisponde ai dati filtrati."
                        : "Nessun dato da visualizzare."
                      }
                    </Typography>
                    {viewFilterActive && appliedViewFilter.size > 0 && (
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        Prova a modificare la selezione delle celle o rimuovi il filtro vista.
                      </Typography>
                    )}
                  </Box>
                ) : (
                  Object.entries(finalDisplayData).map(([key, value]) => {
                    const columnIndex = currentFile?.headers?.indexOf(key) ?? -1;
                    if (columnIndex === -1) {
                      console.warn(`⚠️ Colonna non trovata: ${key}`);
                      return null;
                    }
                    
                    const cellKey = getCellKey(columnIndex);
                    const isSelectedForView = selectedCellsForView.has(cellKey);
                    const isInAppliedFilter = appliedViewFilter.has(cellKey);
                    const isSelectedForLabeling = selectedCellsForLabeling.has(cellKey);
                    const cellLabels = cellLabelsData.get(cellKey) || [];
                    
                    // Determina il colore del bordo e lo sfondo
                    let borderColor = 'divider';
                    let bgColor = 'transparent';
                    
                    if (isSelectedForLabeling) {
                      borderColor = 'warning.main';
                      bgColor = 'warning.50';
                    } else if (isInAppliedFilter && viewFilterActive) {
                      borderColor = 'success.main';
                      bgColor = 'success.50';
                    } else if (isSelectedForView) {
                      borderColor = 'info.main';
                      bgColor = 'info.50';
                    }
                    
                    return (
                      <Box 
                        key={key} 
                        sx={{ 
                          p: 2, 
                          border: 1, 
                          borderColor,
                          borderRadius: 1,
                          bgcolor: bgColor
                        }}
                      >
                        <Stack direction="row" alignItems="flex-start" spacing={2}>
                          {/* Checkbox per selezione vista */}
                          {showCellViewSelector && (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={isSelectedForView}
                                  onChange={() => toggleCellSelectionForView(columnIndex)}
                                  icon={<CheckBoxOutlineBlank />}
                                  checkedIcon={<CheckBox />}
                                  color="info"
                                />
                              }
                              label=""
                              sx={{ mt: 0 }}
                            />
                          )}

                          {/* Checkbox per selezione etichettatura */}
                          {showCellLabelSelector && (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={isSelectedForLabeling}
                                  onChange={() => toggleCellSelectionForLabeling(columnIndex)}
                                  icon={<CheckBoxOutlineBlank />}
                                  checkedIcon={<CheckBox />}
                                  color="warning"
                                />
                              }
                              label=""
                              sx={{ mt: 0 }}
                            />
                          )}
                          
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                              <Typography variant="subtitle2" color="primary.main" fontWeight={600}>
                                {key}
                              </Typography>
                              
                              <Stack direction="row" spacing={1} alignItems="center">
                                {cellLabels.length > 0 && (
                                  <Chip 
                                    label={`${cellLabels.length} etichette`} 
                                    size="small" 
                                    color="info" 
                                    variant="outlined"
                                  />
                                )}
                                
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<LabelIcon />}
                                  onClick={() => handleCellLabelClick(columnIndex)}
                                >
                                  Etichetta
                                </Button>
                              </Stack>
                            </Stack>
                            
                            <Typography variant="body2" sx={{ 
                              wordBreak: 'break-word',
                              whiteSpace: 'pre-wrap',
                              bgcolor: 'grey.50',
                              p: 1,
                              borderRadius: 1,
                              border: 1,
                              borderColor: 'grey.200',
                              mb: 1
                            }}>
                              {String(value || 'Nessun contenuto')}
                            </Typography>

                            {/* Mostra etichette esistenti */}
                            {cellLabels.length > 0 && (
                              <Stack direction="row" flexWrap="wrap" gap={1}>
                                {cellLabels.map((cellLabel: any) => {
                                  const label = getLabelInfo(cellLabel.labelId);
                                  return (
                                    <Chip
                                      key={cellLabel.id}
                                      label={label?.name || cellLabel.labelId}
                                      size="small"
                                      color="info"
                                      variant="filled"
                                      onDelete={() => handleRemoveCellLabel(cellKey, cellLabel.labelId)}
                                    />
                                  );
                                })}
                              </Stack>
                            )}
                          </Box>
                        </Stack>
                      </Box>
                    );
                  })
                )}
              </Stack>
            </Collapse>
          </CardContent>
        </Card>

        {/* Sezione Statistiche */}
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <IconButton 
                size="small" 
                onClick={() => toggleSection('stats')}
              >
                {expandedSections.stats ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
              <BarChart color="info" />
              <Typography variant="h6" color="info.main">
                Statistiche Riga
              </Typography>
            </Stack>

            <Collapse in={expandedSections.stats}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                  <Typography variant="h4" color="info.main">
                    {Object.keys(rowData).length}
                  </Typography>
                  <Typography variant="caption" color="info.main">
                    Campi Totali
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'secondary.50', borderRadius: 1 }}>
                  <Typography variant="h4" color="secondary.main">
                    {currentRowLabels.length}
                  </Typography>
                  <Typography variant="caption" color="secondary.main">
                    Etichette Riga
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                  <Typography variant="h4" color="info.main">
                    {cellLabelsData.size}
                  </Typography>
                  <Typography variant="caption" color="info.main">
                    Celle Etichettate
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                  <Typography variant="h4" color="success.main">
                    {selectedCellsForView.size}
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    Celle Selezionate
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                  <Typography variant="h4" color="primary.main">
                    {appliedViewFilter.size}
                  </Typography>
                  <Typography variant="caption" color="primary.main">
                    Filtro Vista Attivo
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>
                  <Typography variant="h4" color="warning.main">
                    {selectedCellsForLabeling.size}
                  </Typography>
                  <Typography variant="caption" color="warning.main">
                    Celle da Etichettare
                  </Typography>
                </Box>
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      </Stack>

      {/* Dialog per aggiungere etichette riga */}
      <Dialog open={showLabelDialog} onClose={() => setShowLabelDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Aggiungi Etichetta alla Riga {selectedRowForSummary + 1}</DialogTitle>
        <DialogContent>
          {availableLabels.length > 0 ? (
            <List>
              {availableLabels.map((label) => (
                <ListItem 
                  key={label.id}
                  component="div"
                  sx={{ 
                    border: 1, 
                    borderColor: 'divider', 
                    borderRadius: 1, 
                    mb: 1,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <ListItemIcon>
                    <LabelIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={label.name}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleAddLabel(label.id)}
                  >
                    Aggiungi
                  </Button>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="textSecondary" textAlign="center" py={4}>
              Tutte le etichette disponibili sono già state applicate a questa riga
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLabelDialog(false)}>Chiudi</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog per aggiungere etichette cella */}
      <Dialog open={showCellLabelDialog} onClose={() => setShowCellLabelDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Aggiungi Etichetta alla Cella
          {selectedCellForLabeling && (
            <Typography variant="body2" color="textSecondary">
              Colonna: {currentFile.headers[parseInt(selectedCellForLabeling.split('-')[1])]}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {labels.length > 0 ? (
            <List>
              {labels.map((label) => (
                <ListItem 
                  key={label.id}
                  component="div"
                  sx={{ 
                    border: 1, 
                    borderColor: 'divider', 
                    borderRadius: 1, 
                    mb: 1,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <ListItemIcon>
                    <LabelIcon color="info" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={label.name}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    color="info"
                    onClick={() => handleAddCellLabel(label.id)}
                  >
                    Aggiungi
                  </Button>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="textSecondary" textAlign="center" py={4}>
              Nessuna etichetta disponibile. Crea prima delle etichette nella sezione Etichette.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowCellLabelDialog(false);
            setSelectedCellForLabeling(null);
          }}>
            Chiudi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog per etichettatura bulk celle */}
      <Dialog open={showBulkCellLabelDialog} onClose={() => setShowBulkCellLabelDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Etichetta {selectedCellsForLabeling.size} Celle
          <Typography variant="body2" color="textSecondary">
            Applica la stessa etichetta a tutte le celle selezionate
          </Typography>
        </DialogTitle>
        <DialogContent>
          {labels.length > 0 ? (
            <List>
              {labels.map((label) => (
                <ListItem 
                  key={label.id}
                  component="div"
                  sx={{ 
                    border: 1, 
                    borderColor: 'divider', 
                    borderRadius: 1, 
                    mb: 1,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <ListItemIcon>
                    <LabelIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={label.name}
                    secondary={`Applica a ${selectedCellsForLabeling.size} celle`}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    color="warning"
                    onClick={() => handleAddBulkCellLabel(label.id)}
                  >
                    Applica a Tutte
                  </Button>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="textSecondary" textAlign="center" py={4}>
              Nessuna etichetta disponibile. Crea prima delle etichette nella sezione Etichette.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowBulkCellLabelDialog(false);
          }}>
            Chiudi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RowSummary;
