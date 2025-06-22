import { useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Paper,
  Fade,
  Chip,
  Stack,
  Tab,
  Tabs,
  Badge,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  TableChart,
  Label,
  Analytics,
  CloudUpload,
  Settings as SettingsIcon,
  FolderOpen,
  ViewList
} from '@mui/icons-material';
import { materialTheme } from '@/theme/materialTheme';
import FileUpload from '@/components/FileUpload';
import { DataGrid } from '@/components/DataGrid';
import { LabelManager } from '@/components/LabelManager';
import ColumnManager from '@/components/ColumnManager';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import RowSummary from '@/components/RowSummary';
import { useAppStore } from '@/store/useAppStore';

type TabType = 'files' | 'data' | 'labels' | 'columns' | 'rowsummary' | 'analytics';

function App() {
  const {
    currentFile,
    loadAvailableFiles,
    labels,
    setSelectedRowForSummary
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('files');

  // Carica automaticamente i file disponibili al mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await loadAvailableFiles();
      } catch (error) {
        console.error('Errore nell\'inizializzazione dell\'app:', error);
      }
    };

    initializeApp();
  }, [loadAvailableFiles]);

  // Switch to data tab when a file is loaded
  useEffect(() => {
    if (currentFile && activeTab === 'files') {
      setActiveTab('data');
    }
  }, [currentFile, activeTab]);

  const tabs = [
    { 
      id: 'files' as TabType, 
      label: 'File', 
      icon: FolderOpen, 
      color: 'primary',
      disabled: false 
    },
    { 
      id: 'data' as TabType, 
      label: 'Dati', 
      icon: TableChart, 
      color: 'primary',
      disabled: !currentFile 
    },
    { 
      id: 'labels' as TabType, 
      label: 'Etichette', 
      icon: Label, 
      color: 'secondary',
      disabled: !currentFile,
      badge: labels.length > 0 ? labels.length : undefined
    },
    { 
      id: 'columns' as TabType, 
      label: 'Colonne', 
      icon: SettingsIcon, 
      color: 'info',
      disabled: !currentFile 
    },
    { 
      id: 'rowsummary' as TabType, 
      label: 'Riepilogo Riga', 
      icon: ViewList, 
      color: 'success',
      disabled: !currentFile 
    },
    { 
      id: 'analytics' as TabType, 
      label: 'Analisi', 
      icon: Analytics, 
      color: 'warning',
      disabled: !currentFile 
    },
  ];

  // Function to handle row selection from DataGrid
  const handleRowSelect = (rowIndex: number) => {
    setSelectedRowForSummary(rowIndex);
    setActiveTab('rowsummary');
  };

  const renderMainContent = () => {
    if (!currentFile && activeTab !== 'files' && activeTab !== 'labels') {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height="100%"
          color="text.secondary"
        >
          <CloudUpload sx={{ fontSize: 48, mb: 2, color: 'action.disabled' }} />
          <Typography variant="h5" gutterBottom color="textSecondary">
            Nessun file caricato
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Vai alla tab "File" per caricare un file Excel
          </Typography>
        </Box>
      );
    }

    switch (activeTab) {
      case 'files':
        return <FileUpload />;
      case 'data':
        return currentFile ? <DataGrid onRowSelect={handleRowSelect} /> : null;
      case 'labels':
        return <LabelManager />;
      case 'columns':
        return <ColumnManager />;
      case 'rowsummary':
        return <RowSummary />;
      case 'analytics':
        return <AnalyticsDashboard />;
      default:
        return <FileUpload />;
    }
  };

  return (
    <ThemeProvider theme={materialTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
        {/* App Bar */}
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)',
          }}
        >
          <Toolbar>
            <TableChart sx={{ mr: 2 }} />
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Analisi Tematica
            </Typography>
            
            {currentFile && (
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {currentFile.name}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {currentFile.data.length} righe × {currentFile.headers.length} colonne
                  </Typography>
                </Box>
                <Chip
                  label="File Caricato"
                  color="secondary"
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Stack>
            )}
          </Toolbar>
        </AppBar>

        {/* Main Layout with Vertical Icon Menu */}
        <Box sx={{ display: 'flex', flex: 1, mt: '64px' }}>
          {/* Vertical Icon Navigation */}
          <Paper
            sx={{
              width: 64,
              bgcolor: 'background.paper',
              borderRight: 1,
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              py: 1,
            }}
            elevation={0}
          >
            <Stack spacing={1} alignItems="center">
              {tabs.map((tab) => (
                <Tooltip key={tab.id} title={tab.label} placement="right" arrow>
                  <Box sx={{ position: 'relative' }}>
                    {/* Indicatore visuale per tab attiva */}
                    {activeTab === tab.id && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: -8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 4,
                          height: 24,
                          bgcolor: `${tab.color}.main`,
                          borderRadius: '0 2px 2px 0',
                          zIndex: 1,
                        }}
                      />
                    )}
                    <IconButton
                      onClick={() => setActiveTab(tab.id)}
                      disabled={tab.disabled}
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: activeTab === tab.id ? `${tab.color}.50` : 'transparent',
                        borderRadius: 2,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          bgcolor: tab.disabled ? 'transparent' : `${tab.color}.100`,
                          transform: tab.disabled ? 'none' : 'scale(1.05)',
                        },
                        '&.Mui-disabled': {
                          opacity: 0.3,
                          bgcolor: 'transparent',
                        },
                      }}
                    >
                      {tab.badge ? (
                        <Badge
                          badgeContent={tab.badge}
                          color="secondary"
                          sx={{
                            '& .MuiBadge-badge': {
                              fontSize: '0.65rem',
                              height: 16,
                              minWidth: 16,
                            },
                          }}
                        >
                          <tab.icon 
                            sx={{ 
                              fontSize: 20,
                              color: activeTab === tab.id ? `${tab.color}.main` : 'action.active',
                              transition: 'color 0.2s ease-in-out',
                            }} 
                          />
                        </Badge>
                      ) : (
                        <tab.icon 
                          sx={{ 
                            fontSize: 20,
                            color: activeTab === tab.id ? `${tab.color}.main` : 'action.active',
                            transition: 'color 0.2s ease-in-out',
                          }} 
                        />
                      )}
                    </IconButton>
                  </Box>
                </Tooltip>
              ))}
            </Stack>
          </Paper>

          {/* Content Area */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Container
              maxWidth={false}
              sx={{
                flex: 1,
                py: 3,
                px: 3,
                overflow: 'auto',
                bgcolor: 'background.default',
              }}
            >
              <Fade in timeout={300}>
                <Box>
                  {renderMainContent()}
                </Box>
              </Fade>
            </Container>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
