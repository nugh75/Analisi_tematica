import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Stack,
  FormControlLabel,
  Checkbox,
  Chip,
  Divider,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ViewColumn as ViewColumnIcon,
  SelectAll as SelectAllIcon,
  DeselectOutlined as DeselectIcon,
} from '@mui/icons-material';
import { useAppStore } from '@/store/useAppStore';

export const ColumnSelector: React.FC = () => {
  const { currentFile, setVisibleColumns } = useAppStore();

  if (!currentFile) return null;

  const toggleColumn = (index: number) => {
    const newVisibleColumns = [...currentFile.visibleColumns];
    newVisibleColumns[index] = !newVisibleColumns[index];
    setVisibleColumns(newVisibleColumns);
  };

  const selectAll = () => {
    setVisibleColumns(new Array(currentFile.headers.length).fill(true));
  };

  const deselectAll = () => {
    setVisibleColumns(new Array(currentFile.headers.length).fill(false));
  };

  const visibleCount = currentFile.visibleColumns.filter(Boolean).length;

  return (
    <Card elevation={2}>
      <CardHeader>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <ViewColumnIcon color="primary" />
            <Typography variant="h6" color="primary.main">
              Visibilità Colonne
            </Typography>
          </Box>
          <Chip 
            label={`${visibleCount} di ${currentFile.headers.length}`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
      </CardHeader>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={selectAll}
              disabled={visibleCount === currentFile.headers.length}
              startIcon={<SelectAllIcon />}
            >
              Seleziona Tutto
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={deselectAll}
              disabled={visibleCount === 0}
              startIcon={<DeselectIcon />}
            >
              Deseleziona Tutto
            </Button>
          </Stack>

          <Divider />

          <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
            <Stack spacing={1}>
              {currentFile.headers.map((header, index) => {
                const isVisible = currentFile.visibleColumns[index];
                return (
                  <FormControlLabel
                    key={index}
                    control={
                      <Checkbox
                        checked={isVisible}
                        onChange={() => toggleColumn(index)}
                        size="small"
                        icon={<VisibilityOffIcon />}
                        checkedIcon={<VisibilityIcon />}
                        color="primary"
                      />
                    }
                    label={
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: isVisible ? 'text.primary' : 'text.secondary',
                          fontWeight: isVisible ? 500 : 400,
                        }}
                      >
                        {header}
                      </Typography>
                    }
                    sx={{
                      margin: 0,
                      padding: 0.5,
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  />
                );
              })}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};
