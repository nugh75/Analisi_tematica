import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControlLabel,
  Checkbox,
  Stack,
  Alert,
  Button,
  Chip,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PersonOutline as PersonOutlineIcon,
  ViewColumn as ViewColumnIcon,
  SelectAll as SelectAllIcon,
  DeselectOutlined as DeselectIcon,
  Badge,
} from '@mui/icons-material';
import { useAppStore } from '@/store/useAppStore';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`column-tabpanel-${index}`}
      aria-labelledby={`column-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const ColumnManager: React.FC = () => {
  const { 
    currentFile, 
    setVisibleColumns,
    demographicColumns,
    addDemographicColumn,
    removeDemographicColumn,
    isDemographicColumn
  } = useAppStore();

  const [tabValue, setTabValue] = useState(0);

  if (!currentFile) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">
            Carica un file Excel per gestire le colonne
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Gestione colonne visibili
  const toggleColumnVisibility = (index: number) => {
    const newVisibleColumns = [...currentFile.visibleColumns];
    newVisibleColumns[index] = !newVisibleColumns[index];
    setVisibleColumns(newVisibleColumns);
  };

  const selectAllColumns = () => {
    setVisibleColumns(new Array(currentFile.headers.length).fill(true));
  };

  const deselectAllColumns = () => {
    setVisibleColumns(new Array(currentFile.headers.length).fill(false));
  };

  // Gestione colonne anagrafiche
  const toggleDemographicColumn = (columnName: string) => {
    if (isDemographicColumn(columnName)) {
      removeDemographicColumn(columnName);
    } else {
      addDemographicColumn(columnName);
    }
  };

  const visibleCount = currentFile.visibleColumns.filter(Boolean).length;
  const demographicCount = demographicColumns.size;

  return (
    <Card>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="column management tabs">
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VisibilityIcon />
                Visibilità Colonne
                <Chip label={`${visibleCount}/${currentFile.headers.length}`} size="small" />
              </Box>
            } 
            id="column-tab-0" 
            aria-controls="column-tabpanel-0" 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonOutlineIcon />
                Dati Anagrafici
                <Chip label={demographicCount} size="small" color="warning" />
              </Box>
            }
            id="column-tab-1" 
            aria-controls="column-tabpanel-1" 
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {/* Tab Visibilità Colonne */}
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ViewColumnIcon />
              Gestione Visibilità Colonne
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Seleziona quali colonne mostrare nella griglia dati. Le colonne nascoste non saranno visibili ma i dati rimangono nel file.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              startIcon={<SelectAllIcon />}
              onClick={selectAllColumns}
              variant="outlined"
              size="small"
            >
              Mostra Tutte
            </Button>
            <Button
              startIcon={<DeselectIcon />}
              onClick={deselectAllColumns}
              variant="outlined"
              size="small"
            >
              Nascondi Tutte
            </Button>
          </Box>

          <Paper variant="outlined" sx={{ p: 2, maxHeight: '400px', overflow: 'auto' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 1 }}>
              {currentFile.headers.map((header, index) => {
                const isVisible = currentFile.visibleColumns[index];
                const isDemographic = isDemographicColumn(header);
                
                return (
                  <Box key={index}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isVisible}
                          onChange={() => toggleColumnVisibility(index)}
                          icon={<VisibilityOffIcon />}
                          checkedIcon={<VisibilityIcon />}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                          <Typography variant="body2" sx={{ 
                            wordBreak: 'break-word',
                            opacity: isVisible ? 1 : 0.6
                          }}>
                            {header}
                          </Typography>
                          {isDemographic && (
                            <Chip 
                              label="Anagrafica" 
                              size="small" 
                              color="warning"
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.65rem' }}
                            />
                          )}
                        </Box>
                      }
                      sx={{ 
                        margin: 0,
                        width: '100%',
                        border: 1,
                        borderColor: isVisible ? 'primary.200' : 'divider',
                        borderRadius: 1,
                        p: 1,
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Paper>

          <Alert severity="info">
            <Typography variant="body2">
              <strong>{visibleCount}</strong> di <strong>{currentFile.headers.length}</strong> colonne sono attualmente visibili nella griglia.
            </Typography>
          </Alert>
        </Stack>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Tab Dati Anagrafici */}
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonOutlineIcon />
              Configurazione Dati Anagrafici
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Seleziona le colonne che contengono informazioni sui rispondenti (età, genere, professione, ecc.). 
              Queste colonne saranno sempre visibili durante l'etichettatura e non potranno essere etichettate.
            </Typography>
          </Box>

          <Paper variant="outlined" sx={{ p: 2, maxHeight: '400px', overflow: 'auto' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 1 }}>
              {currentFile.headers.map((header, index) => {
                const isDemographic = isDemographicColumn(header);
                
                return (
                  <Box key={index}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isDemographic}
                          onChange={() => toggleDemographicColumn(header)}
                          icon={<PersonOutlineIcon />}
                          checkedIcon={<Badge />}
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ 
                          wordBreak: 'break-word',
                          fontWeight: isDemographic ? 600 : 400,
                          color: isDemographic ? 'warning.main' : 'text.primary'
                        }}>
                          {header}
                        </Typography>
                      }
                      sx={{ 
                        margin: 0,
                        width: '100%',
                        border: 1,
                        borderColor: isDemographic ? 'warning.300' : 'divider',
                        borderRadius: 1,
                        p: 1,
                        bgcolor: isDemographic ? 'warning.50' : 'transparent',
                        '&:hover': {
                          bgcolor: isDemographic ? 'warning.100' : 'action.hover'
                        }
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Paper>

          {demographicCount > 0 ? (
            <Alert severity="success">
              <Typography variant="body2">
                <strong>{demographicCount}</strong> colonne anagrafiche configurate:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                {Array.from(demographicColumns).map((columnName) => (
                  <Chip
                    key={columnName}
                    label={columnName}
                    size="small"
                    color="warning"
                    onDelete={() => removeDemographicColumn(columnName)}
                    deleteIcon={<DeselectIcon />}
                  />
                ))}
              </Box>
            </Alert>
          ) : (
            <Alert severity="info">
              <Typography variant="body2">
                Nessuna colonna anagrafica configurata. Le colonne anagrafiche aiutano a contestualizzare le risposte durante l'analisi.
              </Typography>
            </Alert>
          )}
        </Stack>
      </TabPanel>
    </Card>
  );
};

export default ColumnManager;
