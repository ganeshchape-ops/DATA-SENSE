import React, { createContext, useContext, useState, useEffect, type ReactNode, useMemo } from 'react';
import type {
  Dataset, DatasetProfile, CorrelationResponse,
  AIInsightsResponse, KPICardData, DynamicChartData, ExploreQueryResponse
} from '../types';
import { parseUploadedFile, analyzeUploadedDataset, computeNumericStats, computeCategoricalStats, computeCorrelationMatrix } from '../services/dataEngine';
import { generateStrictAIInsights } from '../services/aiEngine';
import { useAuth } from './AuthContext';

export interface FilterRule {
  column: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'not_equals';
  value: any;
}

interface DatasetContextType {
  activeDataset: Dataset | null;
  datasets: Dataset[];
  rawRows: Record<string, any>[];
  filteredRows: Record<string, any>[];
  profile: DatasetProfile | null;
  correlations: CorrelationResponse | null;
  insights: AIInsightsResponse | null;
  kpis: KPICardData[];
  charts: DynamicChartData[];
  isLoading: boolean;
  isProfileLoading: boolean;
  filterRules: FilterRule[];
  searchQuery: string;
  // Actions
  uploadAndProcessFile: (file: File) => Promise<Dataset>;
  loadSampleDataset: (sampleKey: string) => Promise<Dataset>;
  setActiveDataset: (dataset: Dataset | null) => void;
  refreshDatasets: () => Promise<void>;
  selectDatasetById: (id: number) => Promise<void>;
  deleteDataset: (id: number) => Promise<void>;
  setSearchQuery: (query: string) => void;
  addFilterRule: (rule: FilterRule) => void;
  removeFilterRule: (index: number) => void;
  clearAllFilters: () => void;
  resetDataset: () => void;
  exportFilteredDataCSV: () => void;
  exportFilteredDataJSON: () => void;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export const DatasetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [activeDataset, setActiveDataset] = useState<Dataset | null>(null);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [baseProfile, setBaseProfile] = useState<DatasetProfile | null>(null);
  const [baseCorrelations, setBaseCorrelations] = useState<CorrelationResponse | null>(null);
  const [baseInsights, setBaseInsights] = useState<AIInsightsResponse | null>(null);
  const [baseKpis, setBaseKpis] = useState<KPICardData[]>([]);
  const [baseCharts, setBaseCharts] = useState<DynamicChartData[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);

  // 1. Upload & Process File (Full Reset + Parse + Strict Analysis)
  const uploadAndProcessFile = async (file: File): Promise<Dataset> => {
    setIsLoading(true);
    // DATA RESET: Clear previous state completely
    setActiveDataset(null);
    setRawRows([]);
    setBaseProfile(null);
    setBaseCorrelations(null);
    setBaseInsights(null);
    setBaseKpis([]);
    setBaseCharts([]);
    setFilterRules([]);
    setSearchQuery('');

    try {
      // Step 1: Read & Parse file
      const { rows, columnNames } = await parseUploadedFile(file);

      // Step 2: Analyze only the current uploaded dataset
      const result = await analyzeUploadedDataset(file.name, file.size, rows, columnNames);

      // Step 3: Generate strict empirical AI insights
      const strictInsights = generateStrictAIInsights(
        result.dataset,
        result.profile,
        result.correlations,
        result.rawRows
      );

      // Step 4: Update state
      setActiveDataset(result.dataset);
      setRawRows(result.rawRows);
      setBaseProfile(result.profile);
      setBaseCorrelations(result.correlations);
      setBaseInsights(strictInsights);
      setBaseKpis(result.kpis);
      setBaseCharts(result.charts);

      return result.dataset;
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Load Sample Dataset
  const loadSampleDataset = async (sampleKey: string): Promise<Dataset> => {
    setIsLoading(true);
    resetDataset();
    try {
      const { MOCK_STUDENT_ROWS } = await import('../data/mockData');
      const cols = ['Student_ID', 'Name', 'Maths', 'Science', 'English', 'Computer', 'Attendance'];
      const result = await analyzeUploadedDataset('student_results.csv', 1024, MOCK_STUDENT_ROWS, cols);
      const strictInsights = generateStrictAIInsights(result.dataset, result.profile, result.correlations, result.rawRows);

      setActiveDataset(result.dataset);
      setRawRows(result.rawRows);
      setBaseProfile(result.profile);
      setBaseCorrelations(result.correlations);
      setBaseInsights(strictInsights);
      setBaseKpis(result.kpis);
      setBaseCharts(result.charts);

      return result.dataset;
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Reset All Data
  const resetDataset = () => {
    setActiveDataset(null);
    setRawRows([]);
    setBaseProfile(null);
    setBaseCorrelations(null);
    setBaseInsights(null);
    setBaseKpis([]);
    setBaseCharts([]);
    setFilterRules([]);
    setSearchQuery('');
  };

  // 4. Dynamic Filtering Computation
  const filteredRows = useMemo(() => {
    if (!rawRows.length) return [];
    let rows = [...rawRows];

    // Global Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      rows = rows.filter(r =>
        Object.values(r).some(val => String(val || '').toLowerCase().includes(q))
      );
    }

    // Specific Column Rules
    filterRules.forEach(rule => {
      rows = rows.filter(r => {
        const val = r[rule.column];
        if (rule.operator === 'equals') return String(val).toLowerCase() === String(rule.value).toLowerCase();
        if (rule.operator === 'not_equals') return String(val).toLowerCase() !== String(rule.value).toLowerCase();
        if (rule.operator === 'contains') return String(val || '').toLowerCase().includes(String(rule.value).toLowerCase());
        const numVal = Number(val);
        const targetNum = Number(rule.value);
        if (!isNaN(numVal) && !isNaN(targetNum)) {
          if (rule.operator === 'gt') return numVal > targetNum;
          if (rule.operator === 'lt') return numVal < targetNum;
          if (rule.operator === 'gte') return numVal >= targetNum;
          if (rule.operator === 'lte') return numVal <= targetNum;
        }
        return true;
      });
    });

    return rows;
  }, [rawRows, searchQuery, filterRules]);

  // Recalculated Profile when filter is active
  const profile = useMemo(() => {
    if (!activeDataset || !baseProfile) return null;
    if (filteredRows.length === rawRows.length) return baseProfile;

    // Recalculate stats for the filtered slice
    const totalRows = filteredRows.length;
    const numCols = baseProfile.numeric_stats.map(s => s.name);
    const catCols = baseProfile.categorical_stats.map(s => s.name);

    const numericStats = numCols.map(c => computeNumericStats(c, filteredRows.map(r => r[c])));
    const categoricalStats = catCols.map(c => computeCategoricalStats(c, filteredRows.map(r => r[c])));

    return {
      ...baseProfile,
      rows: totalRows,
      numeric_stats: numericStats,
      categorical_stats: categoricalStats,
    };
  }, [activeDataset, baseProfile, filteredRows, rawRows.length]);

  // Recalculated Correlations for filtered slice
  const correlations = useMemo(() => {
    if (!activeDataset || !baseProfile) return null;
    if (filteredRows.length === rawRows.length) return baseCorrelations;
    const numCols = baseProfile.numeric_stats.map(s => s.name);
    return computeCorrelationMatrix(numCols, filteredRows);
  }, [activeDataset, baseProfile, filteredRows, rawRows.length, baseCorrelations]);

  // Recalculated KPIs for filtered slice
  const kpis = useMemo(() => {
    if (!activeDataset || !profile) return [];
    if (filteredRows.length === rawRows.length) return baseKpis;

    const list: KPICardData[] = [
      {
        key: 'total_records',
        title: 'Filtered Records',
        value: `${filteredRows.length.toLocaleString()} / ${rawRows.length.toLocaleString()}`,
        numeric_value: filteredRows.length,
        change_pct: 0,
        change_type: 'neutral',
        trend_description: `${Math.round((filteredRows.length / (rawRows.length || 1)) * 100)}% of total dataset`,
        icon: 'Database'
      },
      {
        key: 'data_quality',
        title: 'Slice Health',
        value: `${profile.data_quality_score}%`,
        numeric_value: profile.data_quality_score,
        change_pct: 0,
        change_type: profile.data_quality_score >= 85 ? 'increase' : 'decrease',
        trend_description: 'Calculated on filtered sample',
        icon: 'ShieldCheck'
      }
    ];

    profile.numeric_stats.slice(0, 3).forEach(stat => {
      if (stat.mean !== null) {
        list.push({
          key: `avg_${stat.name}`,
          title: `Avg ${stat.name}`,
          value: stat.mean.toLocaleString(),
          numeric_value: stat.mean,
          change_pct: 0,
          change_type: 'neutral',
          trend_description: `Filtered Range: [${stat.min} - ${stat.max}]`,
          icon: 'TrendingUp'
        });
      }
    });

    return list;
  }, [activeDataset, profile, filteredRows.length, rawRows.length, baseKpis]);

  // Recalculated Charts for filtered slice
  const charts = useMemo(() => {
    if (!activeDataset || !profile) return [];
    if (filteredRows.length === rawRows.length) return baseCharts;

    const dynCharts: DynamicChartData[] = [];
    if (profile.categorical_stats.length > 0 && profile.categorical_stats[0].top_categories.length > 0) {
      const cat = profile.categorical_stats[0];
      dynCharts.push({
        id: 'cat_distribution',
        title: `${cat.name} Distribution (Filtered)`,
        subtitle: `Observed counts in active slice`,
        chart_type: 'bar',
        x_axis: 'category',
        x_label: cat.name,
        y_label: 'Count',
        series: ['count'],
        data: cat.top_categories.map(c => ({ category: c.category, count: c.count, percentage: c.percentage }))
      });
    }

    if (profile.numeric_stats.length >= 2) {
      dynCharts.push({
        id: 'numeric_averages',
        title: 'Metrics Comparison (Filtered Means)',
        subtitle: 'Average values across filtered rows',
        chart_type: 'horizontal_bar',
        x_axis: 'metric',
        x_label: 'Column',
        y_label: 'Mean',
        series: ['mean'],
        data: profile.numeric_stats.slice(0, 8).map(s => ({
          metric: s.name,
          mean: s.mean,
          min: s.min,
          max: s.max
        }))
      });
    }

    return dynCharts.length ? dynCharts : baseCharts;
  }, [activeDataset, profile, filteredRows.length, rawRows.length, baseCharts]);

  // Recalculated Insights
  const insights = useMemo(() => {
    if (!activeDataset || !profile || !correlations) return null;
    if (filteredRows.length === rawRows.length) return baseInsights;
    return generateStrictAIInsights(activeDataset, profile, correlations, filteredRows);
  }, [activeDataset, profile, correlations, filteredRows, rawRows.length, baseInsights]);

  // Filter actions
  const addFilterRule = (rule: FilterRule) => {
    setFilterRules(prev => [...prev, rule]);
  };

  const removeFilterRule = (index: number) => {
    setFilterRules(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFilters = () => {
    setFilterRules([]);
    setSearchQuery('');
  };

  // Export functions
  const exportFilteredDataCSV = () => {
    if (!activeDataset || !filteredRows.length) return;
    const cols = activeDataset.column_names;
    const csvContent = [
      cols.join(','),
      ...filteredRows.map(row =>
        cols.map(c => {
          const val = row[c] ?? '';
          return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${activeDataset.name}_filtered.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportFilteredDataJSON = () => {
    if (!activeDataset || !filteredRows.length) return;
    const jsonStr = JSON.stringify(filteredRows, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${activeDataset.name}_analysis.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const datasets = useMemo(() => activeDataset ? [activeDataset] : [], [activeDataset]);
  const isProfileLoading = isLoading;
  const refreshDatasets = async () => {};
  const selectDatasetById = async () => {};
  const deleteDataset = async () => { resetDataset(); };

  return (
    <DatasetContext.Provider
      value={{
        activeDataset,
        datasets,
        rawRows,
        filteredRows,
        profile,
        correlations,
        insights,
        kpis,
        charts,
        isLoading,
        isProfileLoading,
        filterRules,
        searchQuery,
        uploadAndProcessFile,
        loadSampleDataset,
        setActiveDataset,
        refreshDatasets,
        selectDatasetById,
        deleteDataset,
        setSearchQuery,
        addFilterRule,
        removeFilterRule,
        clearAllFilters,
        resetDataset,
        exportFilteredDataCSV,
        exportFilteredDataJSON,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
};

export const useDataset = () => {
  const ctx = useContext(DatasetContext);
  if (!ctx) throw new Error('useDataset must be used within a DatasetProvider');
  return ctx;
};
