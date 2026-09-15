import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  BarChart3,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle,
  FileCheck,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

export const AnalyticsAuditScreen: React.FC = () => {
  const { allAuditLogs, orders, requests, suppliers } = useProcurement();

  const [search, setSearch] = useState('');
  const [selectedEntityType, setSelectedEntityType] = useState('ALL');

  const filteredLogs = allAuditLogs.filter((log) => {
    const matchesSearch =
      log.summary.toLowerCase().includes(search.toLowerCase()) ||
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.entityId.toLowerCase().includes(search.toLowerCase());

    const matchesEntity = selectedEntityType === 'ALL' || log.entityType === selectedEntityType;
    return matchesSearch && matchesEntity;
  });

  // Monthly Spend Trend Data
  const monthlyData = [
    { month: 'Apr', spend: 210000 },
    { month: 'May', spend: 320000 },
    { month: 'Jun', spend: 280000 },
    { month: 'Jul', spend: 450000 },
    { month: 'Aug', spend: 390000 },
    { month: 'Sep', spend: 520000 },
  ];

  // Status Distribution Data
  const statusCounts: Record<string, number> = {};
  orders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    status: status.replace(/_/g, ' '),
    count,
  }));

  // Supplier Breakdown
  const supplierSpend: Record<string, number> = {};
  orders.forEach((o) => {
    supplierSpend[o.supplierName] = (supplierSpend[o.supplierName] || 0) + o.totalAmount;
  });

  const supplierPieData = Object.entries(supplierSpend).map(([name, val]) => ({
    name: name.split(' ')[0],
    value: Math.round(val),
  }));

  const COLORS = ['#00639A', '#00A896', '#E28743', '#8E44AD', '#34495E'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
          Executive Analytics & Cryptographic Audit Trail
        </h2>
        <p className="text-xs text-slate-500">
          Expenditure trends, departmental SLA governance, and immutable event logging
        </p>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spend Growth */}
        <div className="bg-white dark:bg-[#191C20] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Monthly Spend Trajectory
              </h3>
              <p className="text-xs text-slate-500">Gross purchase order capital outflow (INR)</p>
            </div>
            <TrendingUp className="w-4 h-4 text-[#00639A]" />
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00639A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00639A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Spend']}
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="spend"
                  stroke="#00639A"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#spendGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PO Status Breakdown */}
        <div className="bg-white dark:bg-[#191C20] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Purchase Order Status Distribution
              </h3>
              <p className="text-xs text-slate-500">Active pipeline breakdown across all lifecycle stages</p>
            </div>
            <BarChart3 className="w-4 h-4 text-[#00639A]" />
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="status" stroke="#888888" fontSize={10} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#00A896" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Immutable Audit Trail Section */}
      <div className="bg-white dark:bg-[#191C20] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#00639A]" />
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Immutable System Audit Trail
              </h3>
              <p className="text-xs text-slate-500">
                Non-repudiation log of approvals, sign-offs, and stock adjustments
              </p>
            </div>
          </div>

          {/* Filter and Search */}
          <div className="flex items-center gap-2">
            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter logs..."
                className="w-full text-xs pl-8 pr-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
            <select
              value={selectedEntityType}
              onChange={(e) => setSelectedEntityType(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            >
              <option value="ALL">All Entities</option>
              <option value="PURCHASE_REQUEST">Requisitions</option>
              <option value="PURCHASE_ORDER">Purchase Orders</option>
              <option value="DELIVERY">Deliveries</option>
              <option value="INVENTORY">Inventory</option>
              <option value="USER">User / Auth</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Actor / Role</th>
                <th className="pb-3">Action</th>
                <th className="pb-3">Target Entity</th>
                <th className="pb-3">Audit Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {log.userName}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {log.userRole.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-[#00639A] dark:text-sky-400 font-bold">
                    {log.entityId}
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                    {log.summary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
