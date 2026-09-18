import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Users, Database, BrainCircuit, FileText,
  Activity, Cpu, HardDrive, CheckCircle2, XCircle, RefreshCw,
  Search, ShieldAlert, Eye
} from 'lucide-react';
import { adminApi } from '../services/api';
import type { AdminOverview, User, ActivityLog } from '../types';

export const AdminPage: React.FC = () => {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [ov, uList, lList] = await Promise.all([
        adminApi.getOverview(),
        adminApi.getUsers(),
        adminApi.getLogs(),
      ]);
      setOverview(ov);
      setUsers(uList);
      setLogs(lList);
    } catch (err) {
      console.error("Admin load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      await adminApi.toggleUserStatus(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !u.is_active } : u));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.role && u.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12 animate-in-scale">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Role-Based Admin Console
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            System Administration & Control Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Platform governance, user access management, resource telemetry, and security logs.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-slate-400 text-xs font-medium mb-1">Total Users</div>
          <div className="text-xl font-black text-slate-900 dark:text-white">{overview?.total_users || 0}</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-1">100% Active</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-slate-400 text-xs font-medium mb-1">Datasets Managed</div>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">{overview?.datasets_uploaded || 0}</div>
          <div className="text-[10px] text-slate-500 mt-1">Stored in SQLite</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-slate-400 text-xs font-medium mb-1">Analyses Run</div>
          <div className="text-xl font-black text-cyan-600 dark:text-cyan-400">{overview?.total_analyses || 0}</div>
          <div className="text-[10px] text-slate-500 mt-1">Profiling & Tests</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-slate-400 text-xs font-medium mb-1">ML Models Trained</div>
          <div className="text-xl font-black text-purple-600 dark:text-purple-400">{overview?.ml_models_trained || 0}</div>
          <div className="text-[10px] text-slate-500 mt-1">AutoML Leaderboards</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-slate-400 text-xs font-medium mb-1">Reports Generated</div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">{overview?.reports_generated || 0}</div>
          <div className="text-[10px] text-slate-500 mt-1">PDF & Excel</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-slate-400 text-xs font-medium mb-1">System Health</div>
          <div className="text-sm font-black text-emerald-600 flex items-center gap-1 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Operational
          </div>
          <div className="text-[10px] text-slate-500 mt-1">CPU: {overview?.cpu_usage_pct || 14.2}%</div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" /> Platform User Management
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user, email, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3 rounded-l-xl">User</th>
                <th className="p-3">Mobile</th>
                <th className="p-3">Organization</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3 rounded-r-xl text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="p-3">
                    <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                    <div className="text-[11px] text-slate-400">{u.email}</div>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">
                    {u.mobile_number || '—'}
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">
                    {u.company || 'Enterprise'}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                      {u.role || 'Data Analyst'}
                    </span>
                  </td>
                  <td className="p-3">
                    {u.is_active ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-semibold flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950 text-rose-600 font-semibold flex items-center gap-1 w-fit">
                        <XCircle className="w-3 h-3" /> Suspended
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleToggleStatus(u.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                        u.is_active
                          ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 hover:bg-rose-100'
                          : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 hover:bg-emerald-100'
                      }`}
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
        <h2 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-600" /> Platform Security & Audit Activity Logs
        </h2>

        <div className="space-y-2">
          {logs.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No audit activities logged yet.
            </div>
          ) : (
            logs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-bold uppercase text-[10px]">
                    {log.action}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{log.user_name || 'System'}:</span>{' '}
                    <span className="text-slate-600 dark:text-slate-300">{log.details}</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400">
                  {new Date(log.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
