import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Users, Database, FileText, Activity,
  Cpu, CheckCircle2, XCircle, RefreshCw, Search,
  Lock, KeyRound, AlertTriangle, Shield, Check, Code
} from 'lucide-react';
import { adminApi, authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { AdminOverview, User, ActivityLog } from '../types';

export const AdminPage: React.FC = () => {
  const { user, login } = useAuth();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Developer security gateway state
  const DEVELOPER_EMAIL = 'ganeshchape@gmail.com';
  const DEVELOPER_PASS = 'Ganesh@11';

  const [devEmail, setDevEmail] = useState('');
  const [devPassword, setDevPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUnlockedLocally, setIsUnlockedLocally] = useState(false);

  const isDeveloperAuthorized = (user?.email?.toLowerCase() === DEVELOPER_EMAIL.toLowerCase()) || isUnlockedLocally;

  useEffect(() => {
    if (isDeveloperAuthorized) {
      loadAdminData();
    } else {
      setLoading(false);
    }
  }, [isDeveloperAuthorized]);

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

  const handleDeveloperUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsVerifying(true);

    if (devEmail.trim().toLowerCase() === DEVELOPER_EMAIL.toLowerCase() && devPassword === DEVELOPER_PASS) {
      try {
        // Try logging in with developer credentials to update auth context
        await login(devEmail.trim(), devPassword);
      } catch {
        // If login backend user doesn't exist yet, unlock locally
        setIsUnlockedLocally(true);
      }
      setIsUnlockedLocally(true);
      setIsVerifying(false);
    } else {
      setIsVerifying(false);
      setAuthError('Access Denied: Invalid developer credentials. The Admin Panel is restricted exclusively to Ganesh Chape.');
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

  // If not authorized as developer, render Developer Security Lock Screen
  if (!isDeveloperAuthorized) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-slate-200/90 rounded-2xl shadow-xl space-y-6 text-center animate-in-scale">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Developer Access Only
          </span>
          <h1 className="text-xl font-black text-slate-900 tracking-tight pt-1">
            Admin Panel Security Gateway
          </h1>
          <p className="text-xs text-slate-500">
            This administrative dashboard is restricted strictly to the platform developer.
          </p>
        </div>

        {authError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-left flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleDeveloperUnlock} className="space-y-3.5 text-left">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Developer Email</label>
            <input
              type="email"
              required
              value={devEmail}
              onChange={(e) => setDevEmail(e.target.value)}
              placeholder="ganeshchape@gmail.com"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Developer Password</label>
            <input
              type="password"
              required
              value={devPassword}
              onChange={(e) => setDevPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{isVerifying ? "Verifying Developer Security..." : "Unlock Developer Console"}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <Code className="w-3.5 h-3.5 text-indigo-600" />
          <span>Developed by <strong>Ganesh Chape</strong></span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in-scale">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Developer Administration Console
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">
              Authorized: <strong>ganeshchape@gmail.com</strong>
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            System Administration & Control Center
          </h1>
          <p className="text-xs text-slate-500">
            Platform governance, user access management, resource telemetry, and security audit logs.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl btn-secondary text-xs font-bold"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <div className="text-slate-500 text-xs font-medium mb-1">Total Users</div>
          <div className="text-2xl font-black text-slate-900">{overview?.total_users || users.length || 1}</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-1">100% Active</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <div className="text-slate-500 text-xs font-medium mb-1">Datasets Managed</div>
          <div className="text-2xl font-black text-indigo-600">{overview?.datasets_uploaded || 0}</div>
          <div className="text-[10px] text-slate-400 mt-1">Stored in SQLite</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <div className="text-slate-500 text-xs font-medium mb-1">Analyses Run</div>
          <div className="text-2xl font-black text-blue-600">{overview?.total_analyses || 0}</div>
          <div className="text-[10px] text-slate-400 mt-1">Profiling & Tests</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <div className="text-slate-500 text-xs font-medium mb-1">ML Models</div>
          <div className="text-2xl font-black text-purple-600">{overview?.ml_models_trained || 0}</div>
          <div className="text-[10px] text-slate-400 mt-1">AutoML Pipelines</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <div className="text-slate-500 text-xs font-medium mb-1">Reports Generated</div>
          <div className="text-2xl font-black text-amber-600">{overview?.reports_generated || 0}</div>
          <div className="text-[10px] text-slate-400 mt-1">PDF & Excel</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <div className="text-slate-500 text-xs font-medium mb-1">System Health</div>
          <div className="text-sm font-black text-emerald-600 flex items-center gap-1 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Operational
          </div>
          <div className="text-[10px] text-slate-400 mt-1">CPU: {overview?.cpu_usage_pct || 14.2}%</div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" /> Platform User Management
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user, email, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Mobile</th>
                <th className="p-3">Organization</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-400">
                    No users found matching current filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="p-3 text-slate-600">
                      {u.mobile_number || '—'}
                    </td>
                    <td className="p-3 text-slate-600">
                      {u.company || 'AI DataSense'}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                        {u.role || 'Analyst'}
                      </span>
                    </td>
                    <td className="p-3">
                      {u.is_active ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold flex items-center gap-1 w-fit text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-semibold flex items-center gap-1 w-fit text-[10px]">
                          <XCircle className="w-3 h-3" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                          u.is_active
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
          <Activity className="w-4 h-4 text-indigo-600" /> Platform Security & Audit Activity Logs
        </h2>

        <div className="space-y-2">
          {logs.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No audit activities logged yet.
            </div>
          ) : (
            logs.slice(0, 8).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold uppercase text-[9px]">
                    {log.action}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">{log.user_name || 'System'}:</span>{' '}
                    <span className="text-slate-600">{log.details}</span>
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
