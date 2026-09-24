import React, { useState, useMemo } from 'react';
import {
  Binary, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight,
  Download, FileSpreadsheet, RefreshCw, Database, Sparkles, Layers
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';

export const ExplorerPage: React.FC = () => {
  const {
    activeDataset,
    rawRows,
    filteredRows,
    profile,
    searchQuery,
    setSearchQuery,
    filterRules,
    addFilterRule,
    removeFilterRule,
    clearAllFilters,
    exportFilteredDataCSV,
    exportFilteredDataJSON
  } = useDataset();

  const [activeTab, setActiveTab] = useState<'preview' | 'first10' | 'last10' | 'schema'>('preview');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Filter form state
  const [newCol, setNewCol] = useState('');
  const [newOp, setNewOp] = useState<'equals' | 'contains' | 'gt' | 'lt'>('equals');
  const [newVal, setNewVal] = useState('');

  const columns = activeDataset?.column_names || [];

  const handleAddCondition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCol || !newVal.trim()) return;
    addFilterRule({
      column: newCol,
      operator: newOp,
      value: newVal.trim()
    });
    setNewVal('');
    setPage(1);
  };

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  // Sort & Paginate
  const sortedRows = useMemo(() => {
    let rows = [...filteredRows];
    if (sortCol) {
      rows.sort((a, b) => {
        const vA = a[sortCol];
        const vB = b[sortCol];
        if (vA === vB) return 0;
        if (vA === null || vA === undefined) return 1;
        if (vB === null || vB === undefined) return -1;
        const nA = Number(vA);
        const nB = Number(vB);
        if (!isNaN(nA) && !isNaN(nB)) {
          return sortDir === 'asc' ? nA - nB : nB - nA;
        }
        return sortDir === 'asc'
          ? String(vA).localeCompare(String(vB))
          : String(vB).localeCompare(String(vA));
      });
    }
    return rows;
  }, [filteredRows, sortCol, sortDir]);

  const displayedRows = useMemo(() => {
    if (activeTab === 'first10') return sortedRows.slice(0, 10);
    if (activeTab === 'last10') return sortedRows.slice(-10);
    const start = (page - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, activeTab, page, pageSize]);

  const totalPages = Math.ceil(sortedRows.length / pageSize) || 1;

  if (!activeDataset) {
    return (
      <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl shadow-xs max-w-xl mx-auto my-12 space-y-4 animate-in-scale">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <Database className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Dataset Uploaded</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Upload a dataset to explore raw tables, inspect schema datatypes, and filter records.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-in-scale">
      {/* Header */}
      <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5 mb-1">
            <Binary className="w-4 h-4" /> Tabular Dataset Preview
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Data Preview & Grid Explorer
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Displaying <strong className="text-slate-800">{filteredRows.length.toLocaleString()}</strong> of <strong className="text-slate-600">{rawRows.length.toLocaleString()}</strong> rows • {columns.length} Columns Verified
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportFilteredDataCSV}
            className="btn-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportFilteredDataJSON}
            className="btn-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Tabs for First 10, Last 10, Full Grid, Schema */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'preview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Full Dataset ({filteredRows.length.toLocaleString()})
        </button>
        <button
          onClick={() => setActiveTab('first10')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'first10'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          First 10 Rows
        </button>
        <button
          onClick={() => setActiveTab('last10')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'last10'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Last 10 Rows
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'schema'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Schema & Column Types ({columns.length})
        </button>
      </div>

      {activeTab === 'schema' ? (
        /* Schema Summary View */
        <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Column Structure & Data Types Summary
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <th className="p-3 font-bold">#</th>
                  <th className="p-3 font-bold">Column Name</th>
                  <th className="p-3 font-bold">Inferred Type</th>
                  <th className="p-3 font-bold">Missing Values</th>
                  <th className="p-3 font-bold">Missing %</th>
                  <th className="p-3 font-bold">Distinct Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {columns.map((col, idx) => {
                  const dtype = activeDataset.column_types[col] || 'unknown';
                  const missing = profile?.missing_per_column?.[col] ?? 0;
                  const missingPct = rawRows.length > 0 ? Math.round((missing / rawRows.length) * 1000) / 10 : 0;
                  const distinct = new Set(rawRows.map(r => r[col])).size;
                  return (
                    <tr key={col} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{col}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {dtype}
                        </span>
                      </td>
                      <td className="p-3 font-mono">{missing}</td>
                      <td className="p-3 font-mono">{missingPct}%</td>
                      <td className="p-3 font-mono">{distinct}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-4">
          {activeTab === 'preview' && (
            <div className="space-y-3">
              <form onSubmit={handleAddCondition} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-4 relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search across all fields..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={newCol}
                    onChange={(e) => setNewCol(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Filter by column...</option>
                    {columns.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <select
                    value={newOp}
                    onChange={(e: any) => setNewOp(e.target.value)}
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
                    value={newVal}
                    onChange={(e) => setNewVal(e.target.value)}
                    placeholder="Value..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-1">
                  <button
                    type="submit"
                    disabled={!newCol || !newVal.trim()}
                    className="w-full h-full py-2 btn-primary text-xs font-bold disabled:opacity-40"
                  >
                    Filter
                  </button>
                </div>
              </form>

              {filterRules.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {filterRules.map((rule, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-medium"
                    >
                      <b>{rule.column}</b> {rule.operator} "{rule.value}"
                      <button onClick={() => removeFilterRule(idx)} className="hover:text-rose-600">×</button>
                    </span>
                  ))}
                  <button onClick={clearAllFilters} className="text-xs text-rose-600 hover:underline ml-2">
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <th className="p-3 font-bold w-12 text-center text-slate-400">#</th>
                  {columns.map(col => (
                    <th
                      key={col}
                      onClick={() => handleSort(col)}
                      className="p-3 font-bold cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col}</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {displayedRows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="p-8 text-center text-slate-400">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  displayedRows.map((row, idx) => {
                    const rowNum = activeTab === 'first10'
                      ? idx + 1
                      : activeTab === 'last10'
                      ? sortedRows.length - 10 + idx + 1
                      : (page - 1) * pageSize + idx + 1;
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-[11px] text-slate-400 text-center">
                          {rowNum}
                        </td>
                        {columns.map(col => (
                          <td key={col} className="p-3 whitespace-nowrap">
                            {row[col] !== null && row[col] !== undefined ? String(row[col]) : (
                              <span className="text-slate-300 italic">null</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination for Full Dataset View */}
          {activeTab === 'preview' && (
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-500">
                Showing {sortedRows.length ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, sortedRows.length)} of {sortedRows.length.toLocaleString()} entries
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
