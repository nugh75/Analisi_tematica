import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Paper,
  Stack,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Label as LabelIcon,
  Description as DescriptionIcon,
  GridOn as GridIcon,
} from '@mui/icons-material';
import { useAppStore } from '@/store/useAppStore';

export const AnalyticsDashboard: React.FC = () => {
  const { currentFile, cellLabels, rowLabels, labels } = useAppStore();

  const analytics = useMemo(() => {
    if (!currentFile) return null;

    const labelMap = new Map();
    labels.forEach(label => labelMap.set(label.id, label));

    // Statistiche di base
    const totalCells = currentFile.data.length * currentFile.headers.length;
    const labeledCells = cellLabels.size;
    const labeledRows = rowLabels.size;

    // Frequenza delle etichette
    const labelFrequency = new Map<string, number>();
    
    // Conta etichette delle celle
    cellLabels.forEach(labelIds => {
      labelIds.forEach(labelId => {
        labelFrequency.set(labelId, (labelFrequency.get(labelId) || 0) + 1);
      });
    });

    // Conta etichette delle righe
    rowLabels.forEach(labelIds => {
      labelIds.forEach(labelId => {
        labelFrequency.set(labelId, (labelFrequency.get(labelId) || 0) + 1);
      });
    });

    // Prepara dati per i grafici
    const chartData = Array.from(labelFrequency.entries())
      .map(([labelId, count]) => {
        const label = labelMap.get(labelId);
        return {
          name: label?.name || 'Etichetta Sconosciuta',
          value: count,
          color: label?.color || '#8884d8'
        };
      })
      .sort((a, b) => b.value - a.value);

    // Statistiche per colonna
    const columnStats = currentFile.headers.map((header, index) => {
      let cellCount = 0;
      cellLabels.forEach((_, cellKey) => {
        const [, columnIndex] = cellKey.split('-').map(Number);
        if (columnIndex === index) {
          cellCount++;
        }
      });
      return { name: header, value: cellCount };
    }).filter(stat => stat.value > 0);

    return {
      totalCells,
      labeledCells,
      labeledRows,
      labelFrequency: chartData,
      columnStats,
      coveragePercentage: ((labeledCells + labeledRows) / (totalCells + currentFile.data.length) * 100).toFixed(1)
    };
  }, [currentFile, cellLabels, rowLabels, labels]);

  if (!currentFile || !analytics) {
    return (
      <Card elevation={2} sx={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CardContent>
          <Typography variant="body1" color="text.secondary" align="center">
            Carica un file Excel e aggiungi etichette per visualizzare le analisi
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color?: string }> = ({
    title,
    value,
    icon,
    color = 'primary'
  }) => (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderLeft: 4,
        borderLeftColor: `${color}.main`,
        backgroundColor: 'background.paper',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box sx={{ color: `${color}.main` }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" fontWeight="bold" color={`${color}.main`}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" color="primary.main" gutterBottom>
          Dashboard Analisi
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Panoramica quantitativa dell'etichettatura dati
        </Typography>
      </Box>

      {/* Statistiche principali */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 2,
        }}
      >
        <StatCard
          title="Celle Etichettate"
          value={analytics.labeledCells}
          icon={<GridIcon />}
          color="primary"
        />
        <StatCard
          title="Righe Etichettate"
          value={analytics.labeledRows}
          icon={<DescriptionIcon />}
          color="secondary"
        />
        <StatCard
          title="Totale Etichette"
          value={labels.length}
          icon={<LabelIcon />}
          color="success"
        />
        <StatCard
          title="Copertura"
          value={`${analytics.coveragePercentage}%`}
          icon={<TrendingUpIcon />}
          color="warning"
        />
      </Box>

      {/* Grafici */}
      {analytics.labelFrequency.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
            gap: 3,
          }}
        >
          {/* Grafico a barre - Frequenza etichette */}
          <Card elevation={2}>
            <CardHeader>
              <Typography variant="h6" color="primary.main">
                Frequenza Etichette
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Numero di occorrenze per ogni etichetta
              </Typography>
            </CardHeader>
            <CardContent>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={analytics.labelFrequency}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          {/* Grafico a torta - Distribuzione etichette */}
          <Card elevation={2}>
            <CardHeader>
              <Typography variant="h6" color="primary.main">
                Distribuzione
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Proporzioni delle etichette
              </Typography>
            </CardHeader>
            <CardContent>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={analytics.labelFrequency}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => 
                        percent > 5 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
                      }
                    >
                      {analytics.labelFrequency.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Statistiche per colonna */}
      {analytics.columnStats.length > 0 && (
        <Card elevation={2}>
          <CardHeader>
            <Typography variant="h6" color="primary.main">
              Etichettatura per Colonna
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Numero di celle etichettate per ogni colonna
            </Typography>
          </CardHeader>
          <CardContent>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={analytics.columnStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2e7d32" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Riepilogo etichette */}
      {analytics.labelFrequency.length > 0 && (
        <Card elevation={2}>
          <CardHeader>
            <Typography variant="h6" color="primary.main">
              Riepilogo Etichette
            </Typography>
          </CardHeader>
          <CardContent>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {analytics.labelFrequency.map((item, index) => (
                <Chip
                  key={index}
                  label={`${item.name} (${item.value})`}
                  sx={{
                    backgroundColor: item.color,
                    color: 'white',
                    fontWeight: 500,
                  }}
                />
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
};
