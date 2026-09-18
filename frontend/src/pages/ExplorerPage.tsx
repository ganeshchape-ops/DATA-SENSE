import React, { useState, useEffect } from 'react';
import {
  Binary, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight,
  Download, Plus, Trash2, CheckCircle2, Columns, RefreshCw
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import { analyticsApi } from '../services/api';
import type { FilterCondition, ExploreQueryResponse } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ExplorerPage: React.FC = () => {
  const { activeDataset } = useDataset();

  const [searchQuery, setSearchQuery] = useState('');
  const [conditions, setConditions] = useState<FilterCondition[]>([]);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  const [queryData, setQueryData] = useState<ExploreQueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newCondCol, setNewCondCol] = useState('');
  const [newCondOp, setNewCondOp] = useState('gt');
  const [newCondVal, setNewCondVal] = useState('');

  // Reset pagination when dataset changes
  useEffect(() => {
    if (activeDataset) {
      setSelectedColumns(activeDataset.column_names || []);
      setPage(1);
      setConditions([]);
      setSearchQuery('');
      fetchData(1, 25, '', [], null, 'asc', activeDataset.column_names);
    }
  }, [activeDataset?.id]);

  const fetchData = async (
    p = page,
    ps = pageSize,
    sq = searchQuery,
    conds = conditions,
    sc = sortColumn,
    sd = sortDirection,
    cols = selectedColumns
  ) => {
    if (!activeDataset) return;
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsApi.explore(activeDataset.id, {
        page: p,
        page_size: ps,
        search_query: sq,
        conditions: conds,
        sort_column: sc,
        sort_direction: sd,
        selected_columns: cols.length > 0 ? cols : undefined
      });
      setQueryData(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to fetch filtered dataset.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData(1, pageSize, searchQuery, conditions, sortColumn, sortDirection, selectedColumns);
  };

  const handleAddCondition = () => {
    if (!newCondCol || newCondVal === '') return;
    const nextConds = [...conditions, { column: newCondCol, operator: newCondOp, value: newCondVal }];
    setConditions(nextConds);
    setNewCondVal('');
    setPage(1);
    fetchData(1, pageSize, searchQuery, nextConds, sortColumn, sortDirection, selectedColumns);
  };

  const handleRemoveCondition = (idx: number) => {
    const nextConds = conditions.filter((_, i) => i !== idx);
    setConditions(nextConds);
    setPage(1);
    fetchData(1, pageSize, searchQuery, nextConds, sortColumn, sortDirection, selectedColumns);
  };

  const handleSort = (col: string) => {
    let nextDir: 'asc' | 'desc' = 'asc';
    if (sortColumn === col && sortDirection === 'asc') {
      nextDir = 'desc';
    }
    setSortColumn(col);
    setSortDirection(nextDir);
    fetchData(page, pageSize, searchQuery, conditions, col, nextDir, selectedColumns);
  };

  const handleExportCSV = () => {
    if (!queryData || queryData.data.length === 0) return;
    const headers = queryData.columns.join(',');
    const rows = queryData.data.map(row =>
      queryData.columns.map(c => `"${String(row[c] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeDataset?.name || 'export'}_filtered.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!activeDataset) {
    return <EmptyState title="No Dataset Selected" description="Select a dataset to explore and filter records interactively." />;
  }

  const columns = queryData?.columns || activeDataset.column_names || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Binary className="w-5 h-5 text-indigo-400" />
            Interactive Data Explorer
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Displaying <span className="text-white font-semibold">{queryData?.filtered_rows ?? 0}</span> of <span className="text-white font-semibold">{queryData?.total_rows ?? 0}</span> records
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={!queryData || queryData.data.length === 0}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all hover:scale-105"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          Export Filtered CSV
        </button>
      </div>

      {/* Query Filter Builder Box */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        {/* Search & Action Row */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all fields (e.g. Technology, California, 98052)..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            Search Records
          </button>
        </form>

        {/* Condition Builder */}
        <div className="border-t border-slate-800 pt-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Multi-Condition Expression Builder
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={newCondCol}
              onChange={(e) => setNewCondCol(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select Feature...</option>
              {activeDataset.column_names.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>

            <select
              value={newCondOp}
              onChange={(e) => setNewCondOp(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="gt">Greater Than (&gt;)</option>
              <option value="gte">Greater Than or Equal (&gt;=)</option>
              <option value="lt">Less Than (&lt;)</option>
              <option value="lte">Less Than or Equal (&lt;=)</option>
              <option value="eq">Equals (==)</option>
              <option value="neq">Not Equals (!=)</option>
              <option value="contains">Contains Substring</option>
              <option value="is_null">Is Missing / Null</option>
            </select>

            <input
              type="text"
              value={newCondVal}
              onChange={(e) => setNewCondVal(e.target.value)}
              placeholder="Filter Value (e.g. 50000)..."
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />

            <button
              type="button"
              onClick={handleAddCondition}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Condition
            </button>
          </div>

          {/* Active conditions pills */}
          {conditions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {conditions.map((cond, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-mono"
                >
                  <b>{cond.column}</b> {cond.operator} <i>{String(cond.value)}</i>
                  <button
                    onClick={() => handleRemoveCondition(idx)}
                    className="hover:text-rose-400 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        {loading ? (
          <LoadingSpinner message="Filtering Records..." />
        ) : queryData && queryData.data.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-[500px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 sticky top-0 z-10">
                  <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                    <th className="p-3 font-semibold text-slate-500 w-12 text-center">#</th>
                    {columns.map((col) => (
                      <th
                        key={col}
                        onClick={() => handleSort(col)}
                        className="p-3 font-semibold cursor-pointer hover:text-white transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{col}</span>
                          <ArrowUpDown className={`w-3 h-3 ${sortColumn === col ? 'text-indigo-400' : 'text-slate-600'}`} />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {queryData.data.map((row, idx) => {
                    const rowNum = (page - 1) * pageSize + idx + 1;
                    return (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 text-slate-500 text-center">{rowNum}</td>
                        {columns.map((col) => {
                          const val = row[col];
                          const isNull = val === null || val === undefined;
                          return (
                            <td key={col} className="p-3 text-slate-300 whitespace-nowrap">
                              {isNull ? (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-sans">
                                  NaN
                                </span>
                              ) : (
                                String(val)
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    const newPs = Number(e.target.value);
                    setPageSize(newPs);
                    setPage(1);
                    fetchData(1, newPs);
                  }}
                  className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>
                  Page {page} of {queryData.total_pages}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    if (page > 1) {
                      setPage(page - 1);
                      fetchData(page - 1);
                    }
                  }}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 disabled:opacity-40 text-slate-300 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 font-semibold text-white bg-slate-950 border border-slate-800 rounded-lg">
                  {page}
                </span>
                <button
                  onClick={() => {
                    if (page < queryData.total_pages) {
                      setPage(page + 1);
                      fetchData(page + 1);
                    }
                  }}
                  disabled={page >= queryData.total_pages}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 disabled:opacity-40 text-slate-300 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No matching records found for the applied search or filter conditions.
          </div>
        )}
      </div>
    </div>
  );
};
