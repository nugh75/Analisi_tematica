import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Label as LabelIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useAppStore } from '@/store/useAppStore';
import type { Label } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

interface LabelFormProps {
  onSubmit: (label: { name: string; color: string; parentId?: string }) => void;
  onCancel: () => void;
  initialValues?: { name: string; color: string; parentId?: string };
  availableParents: Label[];
}

const LabelForm: React.FC<LabelFormProps> = ({ onSubmit, onCancel, initialValues, availableParents }) => {
  const [name, setName] = useState(initialValues?.name || '');
  const [color, setColor] = useState(initialValues?.color || '#3B82F6');
  const [parentId, setParentId] = useState(initialValues?.parentId || '');

  const colors = [
    '#1976d2', '#d32f2f', '#2e7d32', '#ed6c02', '#9c27b0',
    '#e91e63', '#0097a7', '#f57c00', '#689f38', '#5e35b1'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({
        name: name.trim(),
        color,
        parentId: parentId || undefined
      });
      setName('');
      setColor('#1976d2');
      setParentId('');
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom color="primary">
        {initialValues ? 'Modifica Etichetta' : 'Nuova Etichetta'}
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            label="Nome Etichetta"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Es. Tema Principale, Sottocategoria..."
            required
            size="small"
            helperText="Scegli un nome descrittivo per l'etichetta"
          />
          
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Colore dell'etichetta
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
              {colors.map((c) => (
                <IconButton
                  key={c}
                  onClick={() => setColor(c)}
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: c,
                    border: color === c ? 3 : 1,
                    borderColor: color === c ? 'primary.main' : 'divider',
                    '&:hover': {
                      backgroundColor: c,
                      opacity: 0.8,
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s',
                  }}
                />
              ))}
            </Stack>
            
            {/* Anteprima etichetta */}
            {name && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Anteprima:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: color,
                      border: 1,
                      borderColor: 'divider',
                    }}
                  />
                  <Typography variant="body2" fontWeight={500}>
                    {name}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          <FormControl fullWidth size="small">
            <InputLabel>Etichetta Padre (opzionale)</InputLabel>
            <Select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              label="Etichetta Padre (opzionale)"
            >
              <MenuItem value="">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography>Nessuna (etichetta principale)</Typography>
                </Box>
              </MenuItem>
              {availableParents.map((parent) => (
                <MenuItem key={parent.id} value={parent.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: parent.color,
                        border: 1,
                        borderColor: 'divider',
                      }}
                    />
                    <Typography>{parent.name}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button 
              type="button" 
              variant="outlined" 
              size="small" 
              onClick={onCancel}
            >
              Annulla
            </Button>
            <Button type="submit" variant="contained" size="small">
              {initialValues ? 'Aggiorna' : 'Crea Etichetta'}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Paper>
  );
};

interface LabelItemProps {
  label: Label;
  children?: Label[];
  onEdit: (label: Label) => void;
  onDelete: (id: string) => void;
  onApply: (labelId: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const LabelItem: React.FC<LabelItemProps> = ({
  label,
  children = [],
  onEdit,
  onDelete,
  onApply,
  isExpanded,
  onToggleExpand
}) => {
  return (
    <Box>
      <ListItem
        sx={{
          borderRadius: 1,
          '&:hover': { bgcolor: 'action.hover' },
          pl: label.parentId ? 4 : 2,
          minHeight: 48,
        }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          {children.length > 0 ? (
            <IconButton size="small" onClick={onToggleExpand}>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          ) : (
            <Box sx={{ width: 32 }} />
          )}
        </ListItemIcon>
        
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: label.color,
            mr: 2,
            border: 1,
            borderColor: 'divider',
            flexShrink: 0,
          }}
        />
        
        <ListItemText
          primary={label.name}
          secondary={children.length > 0 ? `${children.length} sotto-etichette` : undefined}
          primaryTypographyProps={{
            variant: 'body2',
            fontWeight: label.parentId ? 400 : 500,
            sx: { cursor: 'pointer' },
          }}
          secondaryTypographyProps={{
            variant: 'caption',
            color: 'text.secondary'
          }}
          onClick={() => onApply(label.id)}
        />
        
        <ListItemSecondaryAction>
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              onClick={() => onEdit(label)}
              title="Modifica etichetta"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(label.id)}
              color="error"
              title="Elimina etichetta"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        </ListItemSecondaryAction>
      </ListItem>
      
      {children.length > 0 && (
        <Collapse in={isExpanded}>
          <List component="div" disablePadding sx={{ ml: 2 }}>
            {children.map((child) => (
              <LabelItem
                key={child.id}
                label={child}
                children={[]} // I figli dei figli non sono supportati per ora
                onEdit={onEdit}
                onDelete={onDelete}
                onApply={onApply}
                isExpanded={false}
                onToggleExpand={() => {}}
              />
            ))}
          </List>
        </Collapse>
      )}
    </Box>
  );
};

export const LabelManager: React.FC = () => {
  const {
    labels,
    labelHierarchy,
    addLabel,
    updateLabel,
    deleteLabel,
    loadLabels,
    selectedCells,
    selectedRows,
    applyCellLabel,
    applyRowLabel,
    currentFile
  } = useAppStore();

  const [showForm, setShowForm] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [expandedLabels, setExpandedLabels] = useState<Set<string>>(new Set());
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadLabels();
      } catch (error) {
        console.error('Errore nel caricamento delle etichette:', error);
      }
    };
    loadData();
  }, [loadLabels]);

  const topLevelLabels = labels.filter(label => !label.parentId);

  const handleAddLabel = async (labelData: { name: string; color: string; parentId?: string }) => {
    try {
      const newLabel = {
        id: uuidv4(),
        ...labelData
      };
      await addLabel(newLabel);
      setShowForm(false);
      setSnackbar({ 
        open: true, 
        message: `Etichetta "${labelData.name}" creata con successo!`, 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Errore nella creazione dell\'etichetta:', error);
      setSnackbar({ 
        open: true, 
        message: 'Errore nella creazione dell\'etichetta', 
        severity: 'error' 
      });
    }
  };

  const handleUpdateLabel = async (labelData: { name: string; color: string; parentId?: string }) => {
    if (editingLabel) {
      try {
        await updateLabel(editingLabel.id, labelData);
        setEditingLabel(null);
        setSnackbar({ 
          open: true, 
          message: `Etichetta "${labelData.name}" aggiornata con successo!`, 
          severity: 'success' 
        });
      } catch (error) {
        console.error('Errore nell\'aggiornamento dell\'etichetta:', error);
        setSnackbar({ 
          open: true, 
          message: 'Errore nell\'aggiornamento dell\'etichetta', 
          severity: 'error' 
        });
      }
    }
  };

  const handleDeleteLabel = async (id: string) => {
    const labelToDelete = labels.find(l => l.id === id);
    if (confirm('Sei sicuro di voler eliminare questa etichetta? Verranno rimosse anche tutte le etichettature associate.')) {
      try {
        await deleteLabel(id);
        setSnackbar({ 
          open: true, 
          message: `Etichetta "${labelToDelete?.name}" eliminata`, 
          severity: 'success' 
        });
      } catch (error) {
        console.error('Errore nell\'eliminazione dell\'etichetta:', error);
        setSnackbar({ 
          open: true, 
          message: 'Errore nell\'eliminazione dell\'etichetta', 
          severity: 'error' 
        });
      }
    }
  };

  const handleApplyLabel = async (labelId: string) => {
    if (!currentFile) return;

    // Applica alle righe selezionate
    for (const rowIndex of selectedRows) {
      await applyRowLabel(rowIndex, labelId);
    }

    // Applica alle celle selezionate
    for (const cellKey of selectedCells) {
      const [rowIndex, columnIndex] = cellKey.split('-').map(Number);
      await applyCellLabel(rowIndex, columnIndex, labelId);
    }
  };

  const toggleExpanded = (labelId: string) => {
    const newExpanded = new Set(expandedLabels);
    if (newExpanded.has(labelId)) {
      newExpanded.delete(labelId);
    } else {
      newExpanded.add(labelId);
    }
    setExpandedLabels(newExpanded);
  };

  return (
    <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <LabelIcon color="primary" />
            <Typography variant="h6" color="primary.main">
              Gestione Etichette
            </Typography>
          </Box>
        }
        action={
          <Button
            onClick={() => setShowForm(true)}
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            disabled={showForm || !!editingLabel}
          >
            Nuova
          </Button>
        }
      />
      
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {(showForm || editingLabel) && (
          <LabelForm
            onSubmit={editingLabel ? handleUpdateLabel : handleAddLabel}
            onCancel={() => {
              setShowForm(false);
              setEditingLabel(null);
            }}
            initialValues={editingLabel ? {
              name: editingLabel.name,
              color: editingLabel.color,
              parentId: editingLabel.parentId
            } : undefined}
            availableParents={labels.filter(l => l.id !== editingLabel?.id)}
          />
        )}

        <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: 400 }}>
          {topLevelLabels.length > 0 ? (
            <List dense>
              {topLevelLabels.map((label) => (
                <LabelItem
                  key={label.id}
                  label={label}
                  children={labelHierarchy.get(label.id) || []}
                  onEdit={setEditingLabel}
                  onDelete={handleDeleteLabel}
                  onApply={handleApplyLabel}
                  isExpanded={expandedLabels.has(label.id)}
                  onToggleExpand={() => toggleExpanded(label.id)}
                />
              ))}
            </List>
          ) : (
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 6,
                bgcolor: 'grey.50',
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
                borderStyle: 'dashed',
              }}
            >
              <LabelIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Nessuna etichetta creata
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Inizia creando la tua prima etichetta.<br />
                Puoi organizzarle in una struttura gerarchica.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setShowForm(true)}
                sx={{ mt: 2 }}
                size="small"
              >
                Crea la prima etichetta
              </Button>
            </Paper>
          )}
        </Box>

        {(selectedCells.size > 0 || selectedRows.size > 0) && (
          <Paper
            elevation={1}
            sx={{
              p: 2,
              bgcolor: 'primary.50',
              border: 1,
              borderColor: 'primary.200',
              borderRadius: 2,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <LabelIcon fontSize="small" color="primary" />
              <Typography variant="body2" color="primary.main" fontWeight={500}>
                {selectedRows.size > 0 && `${selectedRows.size} righe`}
                {selectedRows.size > 0 && selectedCells.size > 0 && ', '}
                {selectedCells.size > 0 && `${selectedCells.size} celle`}
                {' '}selezionate
              </Typography>
            </Stack>
            <Typography variant="caption" color="primary.dark">
              Clicca su un'etichetta per applicarla alla selezione
            </Typography>
          </Paper>
        )}
      </CardContent>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};
