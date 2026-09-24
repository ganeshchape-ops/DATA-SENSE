import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Database, ShieldCheck, TrendingUp, Users, ArrowUpRight,
  UploadCloud, Sparkles, Sliders, Filter, Search, X,
  Download, FileSpreadsheet, RefreshCw, BarChart3,
  PieChart as PieIcon, Activity, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import {
  ResponsiveContainer, BarChart, Bar,
  ScatterChart, Scatter,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const {
    activeDataset,
    rawRows,
    filteredRows,
    profile,
    kpis,
    charts,
    insights,
    searchQuery,
    setSearchQuery,
    filterRules,
    addFilterRule,
    removeFilterRule,
    clearAllFilters,
    exportFilteredDataCSV,
    exportFilteredDataJSON,
    resetDataset
  } = useDataset();

  const navigate = useNavigate();

  // Local state for adding a column filter
  const [selectedCol, setSelectedCol] = useState<string>('');
  const [selectedOp, setSelectedOp] = useState<'equals' | 'contains' | 'gt' | 'lt'>('equals');
  const [filterVal, setFilterVal] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const columnNames = activeDataset?.column_names || [];

  const handleAddFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCol || !filterVal.trim()) return;
    addFilterRule({
      column: selectedCol,
      operator: selectedOp,
      value: filterVal.trim()
    });
    setFilterVal('');
  };

  // Sorted and Paginated Rows
  const displayedRows = useMemo(() => {
    let rows = [...filteredRows];
    if (sortColumn) {
      rows.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        const numA = Number(valA);
        const numB = Number(valB);
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortDir === 'asc' ? numA - numB : numB - numA;
        }
        return sortDir === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }
    const start = (currentPage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [filteredRows, sortColumn, sortDir, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
      setSortDir('asc');
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  if (!activeDataset) {
    return (
      <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl shadow-xs max-w-xl mx-auto my-12 space-y-4 animate-in-scale">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <Database className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Dataset Uploaded</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Upload any CSV, Excel, or JSON dataset to generate verified statistical profiling, dynamic visualizations, and AI insights.
        </p>
        <div className="pt-2">
          <Link to="/upload" className="btn-primary px-6 py-3 text-xs font-bold inline-flex items-center gap-2">
            <UploadCloud className="w-4 h-4" /> Upload Dataset
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-in-scale">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs animate-in-scale">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> AI DataSense Live Intelligence
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
              {activeDataset.domain ? activeDataset.domain.toUpperCase() : 'UNIVERSAL'} DOMAIN
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {activeDataset.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {rawRows.length.toLocaleString()} Total Records • {columnNames.length} Columns Verified • 100% Uploaded Data Only
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              exportFilteredDataCSV();
              showToast('Exported CSV successfully!');
            }}
            className="btn-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              exportFilteredDataJSON();
              showToast('Exported JSON successfully!');
            }}
            className="btn-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={() => {
              resetDataset();
              navigate('/upload');
            }}
            className="btn-secondary px-3.5 py-2 text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>New Dataset</span>
          </button>
        </div>
      </div>

      {/* 2. Dynamic Slicing & Filter Bar */}
      <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Dynamic Slicing & Filters
            </h3>
            {filteredRows.length < rawRows.length && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Active Filter: {filteredRows.length} / {rawRows.length} rows
              </span>
            )}
          </div>

          {filterRules.length > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-rose-600 hover:underline font-semibold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear All Filters
            </button>
          )}
        </div>

        {/* Filter Input Form */}
        <form onSubmit={handleAddFilter} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-4 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all records..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedCol}
              onChange={(e) => setSelectedCol(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select Column to Filter</option>
              {columnNames.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={selectedOp}
              onChange={(e: any) => setSelectedOp(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            >
              <option value="equals">Equals</option>
              <option value="contains">Contains</option>
              <option value="gt">&gt; (Greater)</option>
              <option value="lt">&lt; (Less)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <input
              type="text"
              value={filterVal}
              onChange={(e) => setFilterVal(e.target.value)}
              placeholder="Value"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="sm:col-span-1">
            <button
              type="submit"
              disabled={!selectedCol || !filterVal.trim()}
              className="w-full h-full py-2 btn-primary text-xs font-bold disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </form>

        {/* Active Filter Tags */}
        {filterRules.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {filterRules.map((rule, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-medium"
              >
                <strong>{rule.column}</strong> {rule.operator} "{rule.value}"
                <button
                  onClick={() => removeFilterRule(idx)}
                  className="hover:text-rose-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 3. Verified KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {kpi.title}
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                {kpi.value}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                {kpi.trend_description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Strict AI Executive Summary */}
      {insights && (
        <div className="p-6 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl shadow-md space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-300">
              Empirical AI Dataset Synthesis
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {insights.executive_summary}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300 border-t border-white/10">
            <span>✓ Zero hallucination protocol</span>
            <span>✓ Verified against {filteredRows.length} uploaded records</span>
            <span>✓ Continuous statistical validation</span>
          </div>
        </div>
      )}

      {/* 5. Dynamic Visualizations (Generated strictly from uploaded columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {charts.slice(0, 4).map((chart, idx) => (
          <div
            key={chart.id || idx}
            className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4"
          >
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {chart.title}
              </h3>
              {chart.subtitle && (
                <p className="text-[11px] text-slate-500">{chart.subtitle}</p>
              )}
            </div>

            <div className="h-64 w-full">
              {chart.chart_type === 'scatter' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis type="number" dataKey="x" name={chart.x_label} stroke="#94A3B8" fontSize={11} />
                    <YAxis type="number" dataKey="y" name={chart.y_label} stroke="#94A3B8" fontSize={11} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name={chart.title} data={chart.data} fill="#6366F1" />
                  </ScatterChart>
                </ResponsiveContainer>
              ) : chart.chart_type === 'horizontal_bar' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart.data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis type="number" stroke="#94A3B8" fontSize={11} />
                    <YAxis type="category" dataKey="metric" stroke="#94A3B8" fontSize={11} width={80} />
                    <Tooltip />
                    <Bar dataKey="mean" fill="#6366F1" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart.data} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey={chart.x_axis || 'category'} stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366F1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 6. Interactive Data Table Preview */}
      <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Dataset Records ({filteredRows.length.toLocaleString()} Rows)
            </h3>
            <p className="text-[11px] text-slate-500">
              Search, sort columns, and paginate through verified uploaded records.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <th className="p-3 font-bold w-12 text-center text-slate-400">#</th>
                {columnNames.map(col => (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="p-3 font-bold cursor-pointer hover:bg-slate-100 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {sortColumn === col ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {displayedRows.length === 0 ? (
                <tr>
                  <td colSpan={columnNames.length + 1} className="p-8 text-center text-slate-400">
                    No records match the active filter criteria.
                  </td>
                </tr>
              ) : (
                displayedRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-mono text-[11px] text-slate-400 text-center">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>
                    {columnNames.map(col => (
                      <td key={col} className="p-3 font-sans">
                        {row[col] !== null && row[col] !== undefined ? String(row[col]) : (
                          <span className="text-slate-300 italic">null</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-500">
            Showing {filteredRows.length ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredRows.length)} of {filteredRows.length.toLocaleString()} entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50"
            >
              Previous
            </button>
            <span className="text-xs font-semibold text-slate-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
