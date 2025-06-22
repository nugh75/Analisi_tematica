import { useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Container,
  Paper,
  Fade,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import {
  TableChart,
  Label,
  Navigation,
  Analytics,
  Menu as MenuIcon,
  Close as CloseIcon,
  CloudUpload,
  PersonOutline
} from '@mui/icons-material';
import { materialTheme } from '@/theme/materialTheme';
import FileUpload from '@/components/FileUpload';
import { DataGrid } from '@/components/DataGrid';
import { LabelManager } from '@/components/LabelManager';
import { ColumnSelector } from '@/components/ColumnSelector';
import { CellNavigator } from '@/components/CellNavigator';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { DemographicColumnsManager } from '@/components/DemographicColumnsManager';
import { ResizableSidebar } from '@/components/ResizableSidebar';
import { useAppStore } from '@/store/useAppStore';

type TabType = 'data' | 'labels' | 'navigator' | 'analytics' | 'demographics';

function App() {
  const {
    currentFile,
    showLabelPanel,
    setShowLabelPanel,
    sidebarCollapsed,
    sidebarWidth,
    setSidebarWidth,
    toggleSidebar,
    loadAvailableFiles,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('data');

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

  const tabs = [
    { id: 'data' as TabType, label: 'Dati Excel', icon: TableChart, color: 'primary' },
    { id: 'labels' as TabType, label: 'Etichette', icon: Label, color: 'secondary' },
    { id: 'demographics' as TabType, label: 'Anagrafiche', icon: PersonOutline, color: 'info' },
    { id: 'navigator' as TabType, label: 'Navigazione', icon: Navigation, color: 'success' },
    { id: 'analytics' as TabType, label: 'Analisi', icon: Analytics, color: 'warning' },
  ];

  const renderMainContent = () => {
    if (!currentFile && activeTab !== 'data' && activeTab !== 'labels' && activeTab !== 'demographics') {
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
            Carica un file Excel per utilizzare questa funzionalità
          </Typography>
        </Box>
      );
    }

    switch (activeTab) {
      case 'data':
        return currentFile ? <DataGrid /> : <FileUpload />;
      case 'labels':
        return <LabelManager />;
      case 'demographics':
        return <DemographicColumnsManager />;
      case 'navigator':
        return <CellNavigator />;
      case 'analytics':
        return <AnalyticsDashboard />;
      default:
        return <FileUpload />;
    }
  };

  return (
    <ThemeProvider theme={materialTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
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
            <IconButton
              color="inherit"
              aria-label="toggle sidebar"
              edge="start"
              onClick={toggleSidebar}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            
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

        {/* Resizable Navigation Sidebar */}
        <ResizableSidebar
          width={sidebarWidth}
          onWidthChange={setSidebarWidth}
          collapsed={sidebarCollapsed}
          minWidth={250}
          maxWidth={600}
        >
          <Box sx={{ pt: '64px', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
              {/* Navigation Tabs */}
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                Sezioni
              </Typography>
              <List sx={{ mb: 2 }}>
                {tabs.map((tab) => (
                  <ListItem key={tab.id} disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      selected={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      sx={{
                        borderRadius: 2,
                        '&.Mui-selected': {
                          bgcolor: `${tab.color}.light`,
                          color: `${tab.color}.contrastText`,
                          '&:hover': {
                            bgcolor: `${tab.color}.main`,
                          },
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: activeTab === tab.id ? 'inherit' : `${tab.color}.main`,
                        }}
                      >
                        <tab.icon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={tab.label}
                        primaryTypographyProps={{
                          fontWeight: activeTab === tab.id ? 600 : 400,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              {/* Conditional Sidebar Content */}
              {currentFile && (
                <Stack spacing={2}>
                  {/* File Upload */}
                  <Paper sx={{ p: 2 }} elevation={2}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main' }}>
                      Gestione File
                    </Typography>
                    <FileUpload />
                  </Paper>

                  {/* Column Selector */}
                  <ColumnSelector />

                  {/* Label Manager when not main focus */}
                  {activeTab !== 'labels' && (
                    <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                      <LabelManager />
                    </Box>
                  )}
                </Stack>
              )}
            </Box>
          </Box>
        </ResizableSidebar>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            mt: '64px',
            overflow: 'hidden',
          }}
        >
          {/* Quick Labels Panel */}
          {currentFile && showLabelPanel && (
            <Fade in={showLabelPanel}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 0,
                  borderBottom: 1,
                  borderColor: 'divider',
                  bgcolor: 'primary.50',
                }}
                elevation={1}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2" color="primary.main" fontWeight={600}>
                    Etichette Rapide
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setShowLabelPanel(false)}
                    sx={{ color: 'action.active' }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Le etichette rapide appariranno qui dopo la creazione
                </Typography>
              </Paper>
            </Fade>
          )}

          {/* Content Area */}
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
    </ThemeProvider>
  );
}

export default App;
