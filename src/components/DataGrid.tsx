import React, { useMemo, useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Stack,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAppStore } from '@/store/useAppStore';
import CellLabelViewer from './CellLabelViewer';

interface DataGridProps {
  className?: string;
}

export const DataGrid: React.FC<DataGridProps> = () => {
  const {
    currentFile,
    cellLabels,
    rowLabels,
    labels,
    selectedCells,
    selectedRows,
    toggleCellSelection,
    toggleRowSelection,
    isDemographicColumn,
  } = useAppStore();

  const [stickyColumn, setStickyColumn] = useState(true);
  const [labelViewerOpen, setLabelViewerOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col?: number } | null>(null);

  const labelMap = useMemo(() => {
    const map = new Map();
    labels.forEach(label => map.set(label.id, label));
    return map;
  }, [labels]);

  if (!currentFile) {
    return (
      <Card elevation={2} sx={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CardContent>
          <Typography variant="body1" color="text.secondary" align="center">
            Carica un file Excel per iniziare
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const visibleColumnIndices = currentFile.visibleColumns
    .map((visible, index) => visible ? index : -1)
    .filter(index => index !== -1);

  const getCellLabels = (rowIndex: number, columnIndex: number) => {
    const cellKey = `${rowIndex}-${columnIndex}`;
    const cellLabelIds = cellLabels.get(cellKey) || [];
    return cellLabelIds.map(id => labelMap.get(id)).filter(Boolean);
  };

  const getRowLabels = (rowIndex: number) => {
    const rowLabelIds = rowLabels.get(rowIndex) || [];
    return rowLabelIds.map(id => labelMap.get(id)).filter(Boolean);
  };

  const isCellSelected = (rowIndex: number, columnIndex: number) => {
    return selectedCells.has(`${rowIndex}-${columnIndex}`);
  };

  const isRowSelected = (rowIndex: number) => {
    return selectedRows.has(rowIndex);
  };

  return (
    <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" color="primary.main">
            Griglia Dati
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={stickyColumn}
                onChange={(e) => setStickyColumn(e.target.checked)}
                size="small"
              />
            }
            label="Prima colonna fissa"
          />
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            {currentFile.data.length} righe × {visibleColumnIndices.length} colonne
          </Typography>
          <Typography variant="caption" color="primary.main" sx={{ fontStyle: 'italic' }}>
            💡 Clicca su una cella per etichettarla • Clicca sul numero di riga per etichettare l'intera riga
          </Typography>
        </Stack>
      </Box>

      <TableContainer sx={{ flex: 1, maxHeight: '70vh' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  width: 120,
                  backgroundColor: 'grey.100',
                  borderRight: 1,
                  borderColor: 'divider',
                  fontWeight: 600,
                  textAlign: 'center',
                  position: stickyColumn ? 'sticky' : 'static',
                  left: 0,
                  zIndex: stickyColumn ? 2 : 1,
                }}
              >
                # / Azioni
              </TableCell>
              {visibleColumnIndices.map((columnIndex) => {
                const columnName = currentFile.headers[columnIndex];
                const isDemographic = isDemographicColumn(columnName);
                
                return (
                  <TableCell
                    key={columnIndex}
                    sx={{
                      fontWeight: 600,
                      minWidth: 150,
                      backgroundColor: isDemographic ? 'info.100' : 'background.paper',
                      border: isDemographic ? '1px solid' : 'none',
                      borderColor: isDemographic ? 'info.300' : 'transparent',
                      position: 'relative',
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="inherit">
                        {columnName}
                      </Typography>
                      {isDemographic && (
                        <Chip
                          label="Anagrafica"
                          size="small"
                          color="info"
                          variant="filled"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Stack>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {currentFile.data.map((row, rowIndex) => {
              const isRowHighlighted = isRowSelected(rowIndex);
              const rowLabelsList = getRowLabels(rowIndex);

              return (
                <TableRow
                  key={rowIndex}
                  hover
                  selected={isRowHighlighted}
                  sx={{
                    backgroundColor: isRowHighlighted ? 'primary.50' : 'inherit',
                    '&:hover': {
                      backgroundColor: isRowHighlighted ? 'primary.100' : 'action.hover',
                    },
                  }}
                >
                  <TableCell
                    onClick={() => toggleRowSelection(rowIndex)}
                    sx={{
                      width: 120,
                      textAlign: 'center',
                      borderRight: 1,
                      borderColor: 'divider',
                      cursor: 'pointer',
                      position: stickyColumn ? 'sticky' : 'static',
                      left: 0,
                      zIndex: stickyColumn ? 1 : 0,
                      backgroundColor: isRowHighlighted 
                        ? 'primary.100' 
                        : stickyColumn ? 'background.paper' : 'inherit',
                      '&:hover': {
                        backgroundColor: isRowHighlighted ? 'primary.200' : 'action.hover',
                      },
                    }}
                  >
                    <Stack spacing={0.5} alignItems="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {rowIndex + 1}
                        </Typography>
                        <Tooltip title="Vista dettagliata rispondente">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCell({ row: rowIndex });
                              setLabelViewerOpen(true);
                            }}
                            sx={{ p: 0.25 }}
                          >
                            <PersonIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      {rowLabelsList.length > 0 && (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {rowLabelsList.slice(0, 2).map((label) => (
                            <Chip
                              key={label.id}
                              label={label.name}
                              size="small"
                              sx={{
                                height: 16,
                                fontSize: '0.65rem',
                                backgroundColor: label.color,
                                color: 'white',
                                '& .MuiChip-label': { px: 0.5 },
                              }}
                            />
                          ))}
                          {rowLabelsList.length > 2 && (
                            <Chip
                              label={`+${rowLabelsList.length - 2}`}
                              size="small"
                              variant="outlined"
                              sx={{
                                height: 16,
                                fontSize: '0.65rem',
                                '& .MuiChip-label': { px: 0.5 },
                              }}
                            />
                          )}
                        </Stack>
                      )}
                    </Stack>
                  </TableCell>

                  {visibleColumnIndices.map((columnIndex) => {
                    const cellValue = row[columnIndex];
                    const cellLabelsList = getCellLabels(rowIndex, columnIndex);
                    const isCellHighlighted = isCellSelected(rowIndex, columnIndex);
                    const columnName = currentFile.headers[columnIndex];
                    const isDemographic = isDemographicColumn(columnName);

                    return (
                      <TableCell
                        key={columnIndex}
                        onClick={isDemographic ? undefined : () => toggleCellSelection(rowIndex, columnIndex)}
                        sx={{
                          cursor: isDemographic ? 'default' : 'pointer',
                          position: 'relative',
                          backgroundColor: isDemographic 
                            ? 'info.50' 
                            : isCellHighlighted ? 'secondary.50' : 'inherit',
                          border: isDemographic ? '1px solid' : 'none',
                          borderColor: isDemographic ? 'info.200' : 'transparent',
                          '&:hover': {
                            backgroundColor: isDemographic 
                              ? 'info.100' 
                              : isCellHighlighted ? 'secondary.100' : 'action.hover',
                            ...(isDemographic ? {} : {
                              '&::after': {
                                content: '"Clicca per etichettare"',
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                fontSize: '0.6rem',
                                color: 'primary.main',
                                backgroundColor: 'primary.50',
                                padding: '2px 4px',
                                borderRadius: '4px',
                                pointerEvents: 'none',
                              }
                            })
                          },
                        }}
                      >
                        <Stack spacing={0.5}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2" sx={{ flex: 1 }}>
                              {cellValue?.toString() || ''}
                            </Typography>
                            {isDemographic && (
                              <Chip
                                label="Dati Anagrafica"
                                size="small"
                                color="info"
                                variant="outlined"
                                sx={{ height: 18, fontSize: '0.65rem' }}
                              />
                            )}
                            {!isDemographic && (cellLabelsList.length > 0 || isCellHighlighted) && (
                              <Tooltip title="Gestisci etichette cella">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCell({ row: rowIndex, col: columnIndex });
                                    setLabelViewerOpen(true);
                                  }}
                                  sx={{ p: 0.25, ml: 0.5 }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                          {!isDemographic && cellLabelsList.length > 0 && (
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                              {cellLabelsList.slice(0, 3).map((label) => (
                                <Chip
                                  key={label.id}
                                  label={label.name}
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: '0.7rem',
                                    backgroundColor: label.color,
                                    color: 'white',
                                    '& .MuiChip-label': { px: 0.5 },
                                  }}
                                />
                              ))}
                              {cellLabelsList.length > 3 && (
                                <Chip
                                  label={`+${cellLabelsList.length - 3}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    height: 18,
                                    fontSize: '0.7rem',
                                    '& .MuiChip-label': { px: 0.5 },
                                  }}
                                />
                              )}
                            </Stack>
                          )}
                        </Stack>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      {selectedCell && (
        <CellLabelViewer
          open={labelViewerOpen}
          onClose={() => {
            setLabelViewerOpen(false);
            setSelectedCell(null);
          }}
          rowIndex={selectedCell.row}
          columnIndex={selectedCell.col}
        />
      )}
    </Card>
  );
};
