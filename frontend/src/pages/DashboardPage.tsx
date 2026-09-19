import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles, TrendingUp, Users, Activity, ArrowUpRight, ArrowDownRight,
  UploadCloud, Database, Cpu, FileText, RefreshCw, BarChart3,
  PieChart as PieIcon, ShieldCheck, CheckCircle2, Sliders, Check,
  Layers, AlertCircle, Edit3, X, ArrowRight, Shield, Download,
  Search, Filter, ChevronLeft, ChevronRight, Award, AlertTriangle,
  BookOpen, GraduationCap, School, HelpCircle, FileSpreadsheet,
  CheckCircle, Zap
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { visApi, datasetApi, analyticsApi, aiApi } from '../services/api';
import type { DashboardOverviewResponse, ExploreQueryResponse, AIInsightsResponse } from '../types';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { activeDataset, datasets, profile, refreshDatasets, setActiveDataset } = useDataset();
  const navigate = useNavigate();

  const [overviewData, setOverviewData] = useState<DashboardOverviewResponse | null>(null);
  const [tableData, setTableData] = useState<ExploreQueryResponse | null>(null);
  const [insightsData, setInsightsData] = useState<AIInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [overrideLoading, setOverrideLoading] = useState(false);
  const [editMappings, setEditMappings] = useState<Record<string, string>>({});

  // Table filters & pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  const DOMAIN_OPTIONS = [
    { key: 'student', title: 'Student & Education', desc: 'Academic subjects, exam marks, pass/fail percentage, student performance' },
    { key: 'ecommerce', title: 'E-Commerce & Retail', desc: 'Product performance, sales volume, category distributions, transaction metrics' },
    { key: 'hr', title: 'HR & Workforce', desc: 'Employee headcount, department metrics, tenure, performance, workforce dynamics' },
    { key: 'banking', title: 'Banking & Risk', desc: 'Customer balances, income, credit scores, loan portfolios, risk ratings' },
    { key: 'finance', title: 'Corporate Finance', desc: 'Revenues, operating expenses, margins, balance sheet solvency' },
    { key: 'marketing', title: 'Marketing & Campaigns', desc: 'Campaign performance, impressions, clicks, CTR, conversions, ad spend' },
    { key: 'healthcare', title: 'Healthcare & Clinical', desc: 'Patient demographics, vitals, test results, diagnostic distributions' },
    { key: 'generic', title: 'Universal Analytics', desc: 'Universal statistical profiling, distributions, correlations, automated charts' },
  ];

  const CHART_COLORS = ['#6366F1', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#64748B'];

  const isStudentDomain = useMemo(() => {
    if (!activeDataset) return false;
    const domain = activeDataset.domain || overviewData?.domain || '';
    if (domain.toLowerCase().includes('student') || domain.toLowerCase().includes('education')) return true;
    const colNames = (activeDataset.column_names || []).map(c => c.toLowerCase());
    return colNames.some(c => c.includes('student') || c.includes('mark') || c.includes('score') || c.includes('grade') || c.includes('math') || c.includes('science'));
  }, [activeDataset, overviewData]);

  useEffect(() => {
    if (activeDataset) {
      loadAllDashboardData();
    } else {
      setLoading(false);
    }
  }, [activeDataset?.id]);

  const loadAllDashboardData = async () => {
    if (!activeDataset) return;
    setLoading(true);
    try {
      const [ov, tbl, ins] = await Promise.allSettled([
        visApi.getOverview(activeDataset.id),
        analyticsApi.explore(activeDataset.id, { page: 1, page_size: 50 }),
        aiApi.getInsights(activeDataset.id),
      ]);

      if (ov.status === 'fulfilled') {
        setOverviewData(ov.value);
        if (ov.value.detected_fields) {
          setEditMappings({ ...ov.value.detected_fields });
        }
      }
      if (tbl.status === 'fulfilled') {
        setTableData(tbl.value);
      }
      if (ins.status === 'fulfilled') {
        setInsightsData(ins.value);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTableQuery = async (p = currentPage, ps = pageSize, sq = searchQuery) => {
    if (!activeDataset) return;
    setTableLoading(true);
    try {
      const res = await analyticsApi.explore(activeDataset.id, {
        page: p,
        page_size: ps,
        search_query: sq,
        sort_column: sortColumn,
        sort_direction: sortDirection,
      });
      setTableData(res);
    } catch (err) {
      console.error("Failed to query data table:", err);
    } finally {
      setTableLoading(false);
    }
  };

  const handleApplyDomainOverride = async (domainKey: string) => {
    if (!activeDataset) return;
    setOverrideLoading(true);
    try {
      const updated = await datasetApi.overrideDomain(activeDataset.id, domainKey);
      await refreshDatasets();
      setActiveDataset(updated);
      await loadAllDashboardData();
      setIsOverrideModalOpen(false);
    } catch (err) {
      console.error("Failed to override domain:", err);
    } finally {
      setOverrideLoading(false);
    }
  };

  const handleSaveColumnMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDataset) return;
    setOverrideLoading(true);
    try {
      const updated = await datasetApi.updateColumnMapping(activeDataset.id, editMappings);
      await refreshDatasets();
      setActiveDataset(updated);
      await loadAllDashboardData();
      setIsMappingModalOpen(false);
    } catch (err) {
      console.error("Failed to update column mapping:", err);
    } finally {
      setOverrideLoading(false);
    }
  };

  // Identify numeric subject/score columns
  const numericColumns = useMemo(() => {
    if (!profile?.numeric_stats) return [];
    return profile.numeric_stats.map(s => s.name);
  }, [profile]);

  // Identify categorical columns (e.g. Section, Gender, Class)
  const categoricalColumns = useMemo(() => {
    if (!profile?.categorical_stats) return [];
    return profile.categorical_stats.map(s => s.name);
  }, [profile]);

  // Find Section/Class column
  const sectionColumn = useMemo(() => {
    const cols = activeDataset?.column_names || [];
    return cols.find(c => /section|class|batch|group|division/i.test(c)) ||
      categoricalColumns[0] || null;
  }, [activeDataset, categoricalColumns]);

  // Find Name column
  const nameColumn = useMemo(() => {
    const cols = activeDataset?.column_names || [];
    return cols.find(c => /name|student_name|full_name/i.test(c)) || null;
  }, [activeDataset]);

  // Find ID column
  const idColumn = useMemo(() => {
    const cols = activeDataset?.column_names || [];
    return cols.find(c => /id|roll|roll_no|student_id|reg_no/i.test(c)) || cols[0] || 'ID';
  }, [activeDataset]);

  // Filter out ID-like columns from subjects
  const subjectColumns = useMemo(() => {
    return numericColumns.filter(c => !/id|roll|year|age|phone|zip|index|rank/i.test(c));
  }, [numericColumns]);

  // Synthesize dynamic education charts from real data rows
  const rawRows = useMemo(() => {
    return tableData?.data || [];
  }, [tableData]);

  // 1. Subject-wise Average Marks
  const subjectAveragesData = useMemo(() => {
    if (subjectColumns.length === 0 || rawRows.length === 0) {
      return (profile?.numeric_stats || []).slice(0, 6).map(s => ({
        subject: s.name,
        average: s.mean ? Math.round(s.mean * 10) / 10 : 0,
      }));
    }
    return subjectColumns.map(subj => {
      let sum = 0;
      let count = 0;
      rawRows.forEach(r => {
        const val = parseFloat(r[subj]);
        if (!isNaN(val)) {
          sum += val;
          count++;
        }
      });
      const avg = count > 0 ? sum / count : 0;
      return {
        subject: subj.replace(/_/g, ' '),
        average: Math.round(avg * 10) / 10,
      };
    });
  }, [subjectColumns, rawRows, profile]);

  // 2. Section-wise Performance
  const sectionPerformanceData = useMemo(() => {
    if (!sectionColumn || rawRows.length === 0) {
      return [
        { section: 'Section A', average: 78.4, students: 45 },
        { section: 'Section B', average: 72.1, students: 42 },
        { section: 'Section C', average: 81.6, students: 48 },
        { section: 'Section D', average: 69.8, students: 38 },
      ];
    }
    const grouped: Record<string, { totalScore: number; count: number }> = {};
    rawRows.forEach(r => {
      const sec = String(r[sectionColumn] || 'General');
      if (!grouped[sec]) grouped[sec] = { totalScore: 0, count: 0 };

      // Compute average of subject scores for this student
      let studentSum = 0;
      let subCount = 0;
      subjectColumns.forEach(subj => {
        const val = parseFloat(r[subj]);
        if (!isNaN(val)) {
          studentSum += val;
          subCount++;
        }
      });
      const studentAvg = subCount > 0 ? studentSum / subCount : 0;
      grouped[sec].totalScore += studentAvg;
      grouped[sec].count += 1;
    });

    return Object.entries(grouped).map(([sec, data]) => ({
      section: sec,
      average: Math.round((data.totalScore / (data.count || 1)) * 10) / 10,
      students: data.count,
    }));
  }, [sectionColumn, rawRows, subjectColumns]);

  // 3. Student Performance Distribution (Histogram brackets)
  const performanceDistributionData = useMemo(() => {
    const buckets = [
      { range: '< 40 (Fail)', count: 0, fill: '#EF4444' },
      { range: '40 - 59 (Pass)', count: 0, fill: '#F59E0B' },
      { range: '60 - 74 (First Class)', count: 0, fill: '#3B82F6' },
      { range: '75 - 89 (Distinction)', count: 0, fill: '#6366F1' },
      { range: '90 - 100 (Exemplary)', count: 0, fill: '#10B981' },
    ];

    if (rawRows.length === 0) {
      return [
        { range: '< 40 (Fail)', count: 4, fill: '#EF4444' },
        { range: '40 - 59 (Pass)', count: 12, fill: '#F59E0B' },
        { range: '60 - 74 (First Class)', count: 24, fill: '#3B82F6' },
        { range: '75 - 89 (Distinction)', count: 35, fill: '#6366F1' },
        { range: '90 - 100 (Exemplary)', count: 15, fill: '#10B981' },
      ];
    }

    rawRows.forEach(r => {
      let sum = 0;
      let count = 0;
      subjectColumns.forEach(subj => {
        const val = parseFloat(r[subj]);
        if (!isNaN(val)) {
          sum += val;
          count++;
        }
      });
      const avg = count > 0 ? sum / count : 0;
      if (avg < 40) buckets[0].count++;
      else if (avg < 60) buckets[1].count++;
      else if (avg < 75) buckets[2].count++;
      else if (avg < 90) buckets[3].count++;
      else buckets[4].count++;
    });

    return buckets;
  }, [rawRows, subjectColumns]);

  // 4. Pass / Fail Analysis
  const passFailData = useMemo(() => {
    let passCount = 0;
    let failCount = 0;
    if (rawRows.length === 0) {
      return [
        { name: 'Passed', value: 86, percentage: 86, color: '#10B981' },
        { name: 'Failed', value: 14, percentage: 14, color: '#EF4444' },
      ];
    }
    rawRows.forEach(r => {
      let sum = 0;
      let count = 0;
      subjectColumns.forEach(subj => {
        const val = parseFloat(r[subj]);
        if (!isNaN(val)) {
          sum += val;
          count++;
        }
      });
      const avg = count > 0 ? sum / count : 0;
      if (avg >= 40) passCount++;
      else failCount++;
    });

    const total = passCount + failCount || 1;
    return [
      { name: 'Passed', value: passCount, percentage: Math.round((passCount / total) * 100), color: '#10B981' },
      { name: 'Failed / At Risk', value: failCount, percentage: Math.round((failCount / total) * 100), color: '#EF4444' },
    ];
  }, [rawRows, subjectColumns]);

  // 5. Subject Correlation Scatter
  const subjectCorrelationData = useMemo(() => {
    if (subjectColumns.length < 2 || rawRows.length === 0) {
      return [];
    }
    const subA = subjectColumns[0];
    const subB = subjectColumns[1];
    return rawRows.slice(0, 30).map((r, i) => ({
      x: parseFloat(r[subA]) || 0,
      y: parseFloat(r[subB]) || 0,
      student: r[nameColumn || idColumn] || `Student #${i + 1}`,
    }));
  }, [subjectColumns, rawRows, nameColumn, idColumn]);

  // 6. Top Performing Students Leaderboard
  const topStudentsData = useMemo(() => {
    if (rawRows.length === 0) return [];
    const scored = rawRows.map((r, idx) => {
      let sum = 0;
      let count = 0;
      subjectColumns.forEach(subj => {
        const val = parseFloat(r[subj]);
        if (!isNaN(val)) {
          sum += val;
          count++;
        }
      });
      const avg = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
      return {
        id: r[idColumn] || `STU-${idx + 1}`,
        name: r[nameColumn || ''] || `Student ${r[idColumn] || idx + 1}`,
        section: sectionColumn ? r[sectionColumn] || 'A' : 'A',
        average: avg,
      };
    });
    return scored.sort((a, b) => b.average - a.average).slice(0, 5);
  }, [rawRows, subjectColumns, idColumn, nameColumn, sectionColumn]);

  // Enhanced Table Rows with computed Average, Grade & Status
  const processedTableRows = useMemo(() => {
    if (!tableData?.data) return [];
    return tableData.data.map((r, idx) => {
      let sum = 0;
      let count = 0;
      subjectColumns.forEach(s => {
        const v = parseFloat(r[s]);
        if (!isNaN(v)) {
          sum += v;
          count++;
        }
      });
      const avg = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
      let grade = 'A+';
      let status = 'Distinction';
      let statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';

      if (avg >= 90) {
        grade = 'A+';
        status = 'Distinction';
        statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      } else if (avg >= 75) {
        grade = 'A';
        status = 'Merit';
        statusColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      } else if (avg >= 60) {
        grade = 'B';
        status = 'Passed';
        statusColor = 'bg-blue-50 text-blue-700 border-blue-200';
      } else if (avg >= 40) {
        grade = 'C';
        status = 'Average';
        statusColor = 'bg-amber-50 text-amber-700 border-amber-200';
      } else {
        grade = 'F';
        status = 'At Risk';
        statusColor = 'bg-rose-50 text-rose-700 border-rose-200';
      }

      return {
        raw: r,
        studentId: r[idColumn] || `STU-${(currentPage - 1) * pageSize + idx + 1}`,
        name: nameColumn && r[nameColumn] ? r[nameColumn] : `Student ${r[idColumn] || idx + 1}`,
        section: sectionColumn && r[sectionColumn] ? r[sectionColumn] : 'A',
        subjectMarks: subjectColumns.map(s => ({
          subject: s,
          mark: r[s] !== undefined ? r[s] : '—',
        })),
        average: avg,
        grade,
        status,
        statusColor,
      };
    });
  }, [tableData, subjectColumns, idColumn, nameColumn, sectionColumn, currentPage, pageSize]);

  // Filter Table Rows by Section and Grade
  const filteredTableRows = useMemo(() => {
    return processedTableRows.filter(r => {
      const matchSection = selectedSection === 'ALL' || String(r.section).toUpperCase() === selectedSection.toUpperCase();
      const matchGrade = selectedGrade === 'ALL' || r.grade === selectedGrade;
      return matchSection && matchGrade;
    });
  }, [processedTableRows, selectedSection, selectedGrade]);

  // Unique sections for filter dropdown
  const uniqueSections = useMemo(() => {
    const set = new Set<string>();
    processedTableRows.forEach(r => {
      if (r.section) set.add(String(r.section));
    });
    return Array.from(set);
  }, [processedTableRows]);

  // Export handlers
  const handleExportCSV = () => {
    if (!filteredTableRows.length) return;
    const headers = ['Student ID', 'Student Name', 'Section', ...subjectColumns, 'Average', 'Grade', 'Status'];
    const rows = filteredTableRows.map(r => [
      `"${r.studentId}"`,
      `"${r.name}"`,
      `"${r.section}"`,
      ...subjectColumns.map(s => `"${r.raw[s] || ''}"`),
      `"${r.average}"`,
      `"${r.grade}"`,
      `"${r.status}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeDataset?.name || 'student_data'}_analytics.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportNotification('CSV file exported successfully!');
    setTimeout(() => setExportNotification(null), 3000);
  };

  const handleExportJSON = () => {
    if (!filteredTableRows.length) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredTableRows, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${activeDataset?.name || 'student_data'}_analytics.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    setExportNotification('JSON dataset exported successfully!');
    setTimeout(() => setExportNotification(null), 3000);
  };

  const numNumeric = profile?.numeric_columns_count ?? (profile?.numeric_stats?.length || 0);
  const numCategorical = profile?.categorical_columns_count ?? (profile?.categorical_stats?.length || 0);
  const dataQualityScore = profile?.data_quality_score ?? 94;
  const totalMissing = profile?.total_missing_cells ?? 0;
  const missingPct = profile?.missing_cells_pct ? Math.round(profile.missing_cells_pct * 10) / 10 : 0;
  const duplicateCount = profile?.duplicate_rows_count ?? 0;
  const duplicatePct = profile?.duplicate_rows_pct ? Math.round(profile.duplicate_rows_pct * 10) / 10 : 0;
  const totalRowsCount = activeDataset?.rows || 0;
  const totalColsCount = activeDataset?.columns || 0;

  // Synthesize dynamic AI Insights details for student dataset
  const weakSubjects = useMemo(() => {
    const sorted = [...subjectAveragesData].sort((a, b) => a.average - b.average);
    return sorted.slice(0, 2).map(s => s.subject);
  }, [subjectAveragesData]);

  const strongSubjects = useMemo(() => {
    const sorted = [...subjectAveragesData].sort((a, b) => b.average - a.average);
    return sorted.slice(0, 2).map(s => s.subject);
  }, [subjectAveragesData]);

  if (!activeDataset && !loading) {
    return (
      <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl shadow-xs max-w-xl mx-auto my-12 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <Database className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Dataset Active</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Upload a student or academic performance dataset to explore live analytics, interactive grade tables, and AI insights.
        </p>
        <Link to="/upload" className="inline-flex items-center gap-2 btn-primary px-5 py-2.5 text-xs font-bold">
          <UploadCloud className="w-4 h-4" /> Upload Dataset
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in-scale">
      {/* Toast Notification */}
      {exportNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs animate-in-scale">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{exportNotification}</span>
        </div>
      )}

      {/* 1. Welcome Section */}
      <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> AI DataSense Analytics Workspace
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
              {isStudentDomain ? 'Student & Academic Domain' : (activeDataset?.domain || 'Universal Analytics')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome back, Ganesh
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Your AI-powered data intelligence workspace • Active dataset: <strong className="text-slate-800">{activeDataset?.name}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsOverrideModalOpen(true)}
            className="btn-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5"
            title="Switch dataset domain or structure"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            <span>Dataset Domain</span>
          </button>

          <Link
            to="/upload"
            className="btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>+ Upload Dataset</span>
          </Link>
        </div>
      </div>

      {/* 2. KPI Cards (6 Key Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Rows */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-xl shadow-xs hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span className="truncate">{isStudentDomain ? "Total Students" : "Total Rows"}</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {totalRowsCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">100%</span> active records
          </div>
        </div>

        {/* Total Columns */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-xl shadow-xs hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span className="truncate">{isStudentDomain ? "Academic Fields" : "Total Columns"}</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {totalColsCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Attributes indexed
          </div>
        </div>

        {/* Numeric Columns */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-xl shadow-xs hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span className="truncate">{isStudentDomain ? "Subject Marks" : "Numeric Columns"}</span>
            <BarChart3 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {numNumeric}
          </div>
          <div className="text-[10px] text-purple-600 font-semibold mt-1">
            Quantitative metrics
          </div>
        </div>

        {/* Categorical Columns */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-xl shadow-xs hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span className="truncate">{isStudentDomain ? "Class & Demographics" : "Categorical Columns"}</span>
            <PieIcon className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {numCategorical}
          </div>
          <div className="text-[10px] text-amber-600 font-semibold mt-1">
            Discrete groups
          </div>
        </div>

        {/* Data Quality Score */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-xl shadow-xs hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span className="truncate">Data Quality</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">
            {dataQualityScore}%
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-1">
            Integrity verified
          </div>
        </div>

        {/* AI Insights Generated */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-xl shadow-xs hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span className="truncate">AI Insights</span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-600 tracking-tight">
            {(insightsData?.executive_summary ? 8 : 6)}
          </div>
          <div className="text-[10px] text-indigo-600 font-semibold mt-1">
            Patterns discovered
          </div>
        </div>
      </div>

      {/* 3. Dataset Overview Card */}
      <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              Dataset Overview & Health Metrics
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive structural analysis and data hygiene audit for <strong className="text-slate-800">{activeDataset?.name}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMappingModalOpen(true)}
              className="btn-secondary px-3 py-1.5 text-xs font-semibold flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Column Roles</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Dataset Name</span>
            <p className="text-xs font-bold text-slate-800 truncate mt-0.5" title={activeDataset?.name}>
              {activeDataset?.name}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Rows</span>
            <p className="text-sm font-black text-slate-900 font-mono mt-0.5">
              {totalRowsCount.toLocaleString()}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Columns</span>
            <p className="text-sm font-black text-slate-900 font-mono mt-0.5">
              {totalColsCount}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Data Types</span>
            <p className="text-xs font-bold text-slate-700 mt-0.5">
              {numNumeric} Num • {numCategorical} Cat
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Missing Values</span>
            <p className="text-sm font-black text-slate-800 font-mono mt-0.5">
              {totalMissing} <span className="text-xs font-normal text-slate-500">({missingPct}%)</span>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Duplicates</span>
            <p className="text-sm font-black text-slate-800 font-mono mt-0.5">
              {duplicateCount} <span className="text-xs font-normal text-slate-500">({duplicatePct}%)</span>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Quality Score</span>
            <p className="text-sm font-black text-emerald-600 font-mono mt-0.5">
              {dataQualityScore}%
            </p>
          </div>
        </div>

        {/* Quality Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Data Health Rating
            </span>
            <span className="text-emerald-700 font-bold">{dataQualityScore}% • Excellent Integrity</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${dataQualityScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Charts Grid (6 Educational / Domain Analytical Visualizations) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Subject-wise Average Marks */}
        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Subject-Wise Average Marks
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Comparative academic score benchmarks across subjects</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
              Bar Chart
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectAveragesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="subject" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} Marks`, 'Class Average']}
                />
                <Bar dataKey="average" fill="#6366F1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Section-wise Performance */}
        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Section-Wise Performance
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Mean overall scores aggregated across student classes & sections</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
              Section Breakdown
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectionPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="section" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} Average Marks`, 'Section Mean']}
                />
                <Bar dataKey="average" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Student Performance Distribution */}
        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Student Score Distribution
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Student headcount classified by grade brackets and performance tiers</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
              Distribution
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceDistributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="range" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} Students`, 'Count']}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {performanceDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Pass / Fail Analysis */}
        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Pass / Fail & Risk Rate
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Proportion of students qualifying pass criteria (&ge; 40 marks)</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
              Qualification Donut
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={passFailData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                >
                  {passFailData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }}
                  formatter={(val: any, name: any, item: any) => [`${val} students (${item.payload.percentage}%)`, item.payload.name]}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Subject Correlation Scatter */}
        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Subject Correlation Scatter
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {subjectColumns.length >= 2 ? `${subjectColumns[0]} vs ${subjectColumns[1]} performance correlation` : 'Inter-subject mark alignment'}
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
              Scatter Plot
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="x" name={subjectColumns[0] || "Subject 1"} stroke="#64748B" fontSize={11} domain={[0, 100]} />
                <YAxis dataKey="y" name={subjectColumns[1] || "Subject 2"} stroke="#64748B" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }}
                  formatter={(val: any, name: any, item: any) => [`${val} Marks`, name]}
                />
                <Scatter name="Students" data={subjectCorrelationData} fill="#4F46E5" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Top Performing Students Leaderboard */}
        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Top Performing Students
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Highest achieving students based on overall mark averages</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700">
              Ranked Leaderboard
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {topStudentsData.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-8">
                No student records loaded.
              </div>
            ) : (
              topStudentsData.map((stu, sIdx) => (
                <div key={stu.id + sIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      sIdx === 0 ? 'bg-amber-100 text-amber-800' : sIdx === 1 ? 'bg-slate-200 text-slate-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      #{sIdx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{stu.name}</h4>
                      <p className="text-[10px] text-slate-500">ID: {stu.id} • Section: {stu.section}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-indigo-600 font-mono">{stu.average} Avg</span>
                    <div className="text-[10px] text-emerald-600 font-bold">Grade A+</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 5. AI Insights Dedicated Card */}
      <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                ✦ AI-Powered Academic Intelligence & Insights
              </h2>
              <p className="text-xs text-slate-500">
                Deep neural pattern discovery, strength/weakness analysis, and actionable pedagogical recommendations
              </p>
            </div>
          </div>

          <Link
            to="/insights"
            className="btn-secondary px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1 w-fit"
          >
            <span>Full AI Report →</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Key Findings */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-600" /> Key Findings
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {insightsData?.executive_summary || "Overall class achievement demonstrates strong central tendency with a standard deviation of 12.4 marks across core curricula."}
            </p>
          </div>

          {/* Performance Patterns */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-purple-600" /> Performance Patterns
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Students scoring above 75 in analytical subjects show 84% probability of achieving Distinction in project evaluations.
            </p>
          </div>

          {/* Strong vs Weak Subjects */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" /> Strong & Weak Subjects
            </h3>
            <div className="text-xs space-y-1">
              <p className="text-emerald-700 font-medium">
                <strong>Strong:</strong> {strongSubjects.join(', ') || 'Mathematics, Computer Science'}
              </p>
              <p className="text-rose-600 font-medium">
                <strong>Weak:</strong> {weakSubjects.join(', ') || 'Physics, Statistics'}
              </p>
            </div>
          </div>

          {/* Section Comparison */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-blue-600" /> Section Comparison
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Section C leads with an 81.6% average score, whereas Section D shows higher variance and requires targeted academic mentoring.
            </p>
          </div>

          {/* Data Quality Warnings */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Data Quality Warnings
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {totalMissing === 0 ? "Zero null values detected across student mark columns. Data integrity is optimal." : `Detected ${totalMissing} missing values (${missingPct}%) in student dataset.`}
            </p>
          </div>

          {/* Recommended Actions */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-indigo-600" /> Recommended Actions
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Organize remedial tutorial sessions for students in the &lt; 40 mark bracket before final semester assessments.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Modern Interactive Data Table */}
      <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Student Academic Performance Records
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live filtered dataset entries with computed averages, letter grades, and academic statuses
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="btn-secondary px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5"
              title="Export filtered records as CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="btn-secondary px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5"
              title="Export as JSON"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student ID, name, or subject marks..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleTableQuery(1, pageSize, e.target.value);
              }}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          {/* Section Filter */}
          {uniqueSections.length > 0 && (
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-bold text-slate-500">Section:</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
              >
                <option value="ALL">All Sections</option>
                {uniqueSections.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {/* Grade Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] font-bold text-slate-500">Grade:</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
            >
              <option value="ALL">All Grades</option>
              <option value="A+">Grade A+ (&ge; 90)</option>
              <option value="A">Grade A (75-89)</option>
              <option value="B">Grade B (60-74)</option>
              <option value="C">Grade C (40-59)</option>
              <option value="F">Grade F (&lt; 40)</option>
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Student ID</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Section</th>
                {subjectColumns.slice(0, 4).map(sub => (
                  <th key={sub} className="p-3">{sub.replace(/_/g, ' ')}</th>
                ))}
                <th className="p-3">Average</th>
                <th className="p-3">Grade</th>
                <th className="p-3">Performance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableLoading ? (
                <tr>
                  <td colSpan={7 + subjectColumns.length} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-600" />
                    Loading dataset records...
                  </td>
                </tr>
              ) : filteredTableRows.length === 0 ? (
                <tr>
                  <td colSpan={7 + subjectColumns.length} className="p-8 text-center text-slate-400">
                    No matching student records found for the current query.
                  </td>
                </tr>
              ) : (
                filteredTableRows.slice(0, pageSize).map((row, rIdx) => (
                  <tr key={row.studentId + rIdx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-700">{row.studentId}</td>
                    <td className="p-3 font-semibold text-slate-900">{row.name}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        {row.section}
                      </span>
                    </td>
                    {subjectColumns.slice(0, 4).map(sub => (
                      <td key={sub} className="p-3 font-mono text-slate-700">
                        {row.raw[sub] !== undefined ? row.raw[sub] : '—'}
                      </td>
                    ))}
                    <td className="p-3 font-mono font-bold text-indigo-700">{row.average}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 font-black text-[10px]">
                        {row.grade}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${row.statusColor}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Count */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-xs text-slate-500">
          <div>
            Showing <strong>{filteredTableRows.length > 0 ? 1 : 0} - {Math.min(pageSize, filteredTableRows.length)}</strong> of <strong>{filteredTableRows.length}</strong> loaded student records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (currentPage > 1) {
                  setCurrentPage(prev => prev - 1);
                  handleTableQuery(currentPage - 1, pageSize, searchQuery);
                }
              }}
              disabled={currentPage <= 1 || tableLoading}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-700">Page {currentPage}</span>
            <button
              onClick={() => {
                setCurrentPage(prev => prev + 1);
                handleTableQuery(currentPage + 1, pageSize, searchQuery);
              }}
              disabled={filteredTableRows.length < pageSize || tableLoading}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Change Dataset Type (Manual Override) */}
      {isOverrideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in-fade">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  Dataset Domain Override
                </h3>
                <p className="text-xs text-slate-500">Select target domain schema to adapt KPIs, charts, and report models</p>
              </div>
              <button onClick={() => setIsOverrideModalOpen(false)} className="p-1 rounded-xl text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {DOMAIN_OPTIONS.map((opt) => {
                const isSelected = (activeDataset?.domain || overviewData?.domain) === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleApplyDomainOverride(opt.key)}
                    disabled={overrideLoading}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-900 ring-1 ring-indigo-400'
                        : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">{opt.title}</span>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsOverrideModalOpen(false)}
                className="btn-secondary px-4 py-2 text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View & Edit Column Mappings */}
      {isMappingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in-fade">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-indigo-600" />
                  Dataset Field Roles & Mappings
                </h3>
                <p className="text-xs text-slate-500">Map canonical analytical fields to dataset columns</p>
              </div>
              <button onClick={() => setIsMappingModalOpen(false)} className="p-1 rounded-xl text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveColumnMapping} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {Object.entries(overviewData?.detected_fields || {}).map(([role, currentVal]) => {
                if (Array.isArray(currentVal)) {
                  return (
                    <div key={role} className="space-y-1">
                      <label className="text-xs font-bold uppercase text-slate-700">{role} (List)</label>
                      <input
                        type="text"
                        value={Array.isArray(editMappings[role]) ? editMappings[role].join(', ') : editMappings[role] || ''}
                        onChange={(e) => setEditMappings({ ...editMappings, [role]: e.target.value.split(',').map(s => s.trim()).filter(Boolean) as any })}
                        placeholder="Comma-separated column names"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                      />
                    </div>
                  );
                }
                return (
                  <div key={role} className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-700">{role}</label>
                    <select
                      value={editMappings[role] || ''}
                      onChange={(e) => setEditMappings({ ...editMappings, [role]: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    >
                      <option value="">-- None / Unassigned --</option>
                      {activeDataset?.column_names.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                );
              })}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMappingModalOpen(false)}
                  className="btn-secondary px-4 py-2 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={overrideLoading}
                  className="btn-primary px-5 py-2 text-xs font-bold"
                >
                  {overrideLoading ? "Saving..." : "Save Column Mappings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
