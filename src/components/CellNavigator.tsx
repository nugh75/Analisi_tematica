import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Chip,
  Paper,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Navigation as NavigationIcon,
  FilterList as FilterIcon,
  Label as LabelIcon,
  Clear as ClearIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAppStore } from '@/store/useAppStore';

export const CellNavigator: React.FC = () => {
  const {
    currentFile,
    keyColumn,
    setKeyColumn,
    labels,
    selectedCells,
    selectedRows,
    toggleCellSelection,
    clearSelections,
    applyCellLabel,
    applyRowLabel
  } = useAppStore();

  const [searchValue, setSearchValue] = useState('');
  const [selectedColumns, setSelectedColumns] = useState<Set<number>>(new Set());
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const [filteredRows, setFilteredRows] = useState<number[]>([]);

  if (!currentFile) return null;

  const keyColumnIndex = keyColumn ? currentFile.headers.indexOf(keyColumn) : -1;

  const handleSearch = () => {
    if (!searchValue.trim() || keyColumnIndex === -1) {
      setFilteredRows([]);
      return;
    }

    const matchingRows: number[] = [];
    currentFile.data.forEach((row, index) => {
      const cellValue = row[keyColumnIndex];
      if (cellValue && String(cellValue).toLowerCase().includes(searchValue.toLowerCase())) {
        matchingRows.push(index);
      }
    });

    setFilteredRows(matchingRows);
  };

  const handleColumnToggle = (columnIndex: number) => {
    const newSelected = new Set(selectedColumns);
    if (newSelected.has(columnIndex)) {
      newSelected.delete(columnIndex);
    } else {
      newSelected.add(columnIndex);
    }
    setSelectedColumns(newSelected);
  };

  const handleBatchSelection = () => {
    if (filteredRows.length === 0 || selectedColumns.size === 0) return;

    // Seleziona le celle nelle righe filtrate e colonne selezionate
    filteredRows.forEach(rowIndex => {
      selectedColumns.forEach(columnIndex => {
        toggleCellSelection(rowIndex, columnIndex);
      });
    });
  };

  const handleBatchLabeling = async () => {
    if (!selectedLabel || (selectedCells.size === 0 && selectedRows.size === 0)) return;

    // Applica etichetta alle celle selezionate
    for (const cellKey of selectedCells) {
      const [rowIndex, columnIndex] = cellKey.split('-').map(Number);
      await applyCellLabel(rowIndex, columnIndex, selectedLabel);
    }

    // Applica etichetta alle righe selezionate
    for (const rowIndex of selectedRows) {
      await applyRowLabel(rowIndex, selectedLabel);
    }

    // Reset selezioni
    clearSelections();
    setSelectedLabel('');
  };

  const clearFilters = () => {
    setSearchValue('');
    setFilteredRows([]);
    setSelectedColumns(new Set());
  };

  return (
    <Stack spacing={2}>
      {/* Selezione Colonna Chiave */}
      <Card elevation={2}>
        <CardHeader>
          <Box display="flex" alignItems="center" gap={1}>
            <NavigationIcon color="primary" />
            <Typography variant="h6" color="primary.main">
              Navigazione Avanzata
            </Typography>
          </Box>
        </CardHeader>
        <CardContent>
          <Stack spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Colonna Chiave</InputLabel>
              <Select
                value={keyColumn || ''}
                onChange={(e) => setKeyColumn(e.target.value || null)}
                label="Colonna Chiave"
              >
                <MenuItem value="">Nessuna</MenuItem>
                {currentFile.headers.map((header, index) => (
                  <MenuItem key={index} value={header}>
                    {header}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {keyColumn && (
              <Box>
                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={`Cerca in ${keyColumn}...`}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSearch}
                    disabled={!searchValue.trim()}
                    startIcon={<SearchIcon />}
                  >
                    Cerca
                  </Button>
                </Stack>

                {filteredRows.length > 0 && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    Trovate {filteredRows.length} righe corrispondenti
                  </Alert>
                )}
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Selezione Colonne */}
      {filteredRows.length > 0 && (
        <Card elevation={2}>
          <CardHeader>
            <Box display="flex" alignItems="center" gap={1}>
              <FilterIcon color="primary" />
              <Typography variant="h6" color="primary.main">
                Selezione Batch
              </Typography>
            </Box>
          </CardHeader>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Seleziona le colonne per la selezione automatica delle celle
              </Typography>

              <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                <Stack spacing={1}>
                  {currentFile.headers.map((header, index) => (
                    <Chip
                      key={index}
                      label={header}
                      onClick={() => handleColumnToggle(index)}
                      color={selectedColumns.has(index) ? 'primary' : 'default'}
                      variant={selectedColumns.has(index) ? 'filled' : 'outlined'}
                      clickable
                      size="small"
                    />
                  ))}
                </Stack>
              </Box>

              <Button
                variant="contained"
                onClick={handleBatchSelection}
                disabled={selectedColumns.size === 0}
                startIcon={<PlayArrowIcon />}
                fullWidth
              >
                Seleziona Celle ({filteredRows.length} righe × {selectedColumns.size} colonne)
              </Button>

              <Button
                variant="outlined"
                onClick={clearFilters}
                startIcon={<ClearIcon />}
                size="small"
              >
                Cancella Filtri
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Etichettatura Batch */}
      {(selectedCells.size > 0 || selectedRows.size > 0) && (
        <Card elevation={2}>
          <CardHeader>
            <Box display="flex" alignItems="center" gap={1}>
              <LabelIcon color="primary" />
              <Typography variant="h6" color="primary.main">
                Etichettatura Batch
              </Typography>
            </Box>
          </CardHeader>
          <CardContent>
            <Stack spacing={2}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: 'primary.50',
                  border: 1,
                  borderColor: 'primary.200',
                }}
              >
                <Typography variant="body2" color="primary.main" fontWeight={500}>
                  Selezione attuale:
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  {selectedRows.size > 0 && (
                    <Chip
                      label={`${selectedRows.size} righe`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {selectedCells.size > 0 && (
                    <Chip
                      label={`${selectedCells.size} celle`}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Paper>

              <FormControl fullWidth size="small">
                <InputLabel>Seleziona Etichetta</InputLabel>
                <Select
                  value={selectedLabel}
                  onChange={(e) => setSelectedLabel(e.target.value)}
                  label="Seleziona Etichetta"
                >
                  {labels.map((label) => (
                    <MenuItem key={label.id} value={label.id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: label.color,
                          }}
                        />
                        {label.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                onClick={handleBatchLabeling}
                disabled={!selectedLabel}
                startIcon={<CheckCircleIcon />}
                color="success"
                fullWidth
              >
                Applica Etichetta
              </Button>

              <Button
                variant="outlined"
                onClick={clearSelections}
                startIcon={<ClearIcon />}
                size="small"
              >
                Cancella Selezioni
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
};
