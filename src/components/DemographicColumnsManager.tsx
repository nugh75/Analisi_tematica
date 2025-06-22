import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Stack,
  Alert,
  FormHelperText,
} from '@mui/material';
import {
  PersonOutline,
  Badge,
} from '@mui/icons-material';
import { useAppStore } from '@/store/useAppStore';

export const DemographicColumnsManager: React.FC = () => {
  const { 
    currentFile, 
    demographicColumns, 
    setDemographicColumns,
    removeDemographicColumn 
  } = useAppStore();

  const handleChange = (event: any) => {
    const value = event.target.value;
    setDemographicColumns(new Set(typeof value === 'string' ? value.split(',') : value));
  };

  const handleDelete = (columnName: string) => {
    removeDemographicColumn(columnName);
  };

  if (!currentFile) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">
            Carica un file Excel per configurare le colonne anagrafiche
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonOutline />
              Colonne Anagrafiche
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Seleziona le colonne che contengono i dati del rispondente. 
              Queste colonne saranno sempre visibili durante l'etichettatura e non potranno essere etichettate.
            </Typography>
          </Box>

          <FormControl fullWidth>
            <InputLabel id="demographic-columns-label">Colonne Anagrafiche</InputLabel>
            <Select
              labelId="demographic-columns-label"
              multiple
              value={Array.from(demographicColumns)}
              onChange={handleChange}
              input={<OutlinedInput label="Colonne Anagrafiche" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip 
                      key={value} 
                      label={value} 
                      icon={<Badge />}
                      size="small"
                      onDelete={() => handleDelete(value)}
                      onMouseDown={(event) => event.stopPropagation()}
                    />
                  ))}
                </Box>
              )}
            >
              {currentFile.headers.map((header) => (
                <MenuItem key={header} value={header}>
                  {header}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Le colonne anagrafiche selezionate non saranno etichettabili
            </FormHelperText>
          </FormControl>

          {demographicColumns.size > 0 && (
            <Alert severity="success">
              <Typography variant="body2">
                <strong>{demographicColumns.size}</strong> colonne anagrafiche configurate.
                Queste colonne saranno sempre visibili durante l'etichettatura.
              </Typography>
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
