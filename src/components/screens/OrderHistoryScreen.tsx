import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  History,
  Search,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { OrderStatusBadge } from '../common/StatusBadges';

export const OrderHistoryScreen: React.FC = () => {
  const { orders, addToast } = useProcurement();
  const [search, setSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('ALL');

  const completedOrders = orders.filter((o) =>
    ['DELIVERED', 'COMPLETED', 'DISPATCHED', 'CANCELLED'].includes(o.status)
  );

  const suppliersList = Array.from(new Set(completedOrders.map((o) => o.supplierName)));

  const filteredOrders = completedOrders.filter((o) => {
    const matchesSearch =
      o.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.supplierName.toLowerCase().includes(search.toLowerCase()) ||
      (o.requestNumber || '').toLowerCase().includes(search.toLowerCase());

    const matchesSup = selectedSupplier === 'ALL' || o.supplierName === selectedSupplier;
    return matchesSearch && matchesSup;
  });

  const totalArchivedSpend = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const handleExportCsv = () => {
    const headers = ['PO Number', 'PR Ref', 'Supplier', 'Created By', 'Subtotal', 'Tax', 'Total', 'Status', 'Date'];
    const rows = filteredOrders.map((o) => [
      o.poNumber,
      o.requestNumber,
      `"${o.supplierName}"`,
      `"${o.createdByName}"`,
      o.subtotal,
      o.taxAmount,
      o.totalAmount,
      o.status,
      new Date(o.createdAt).toISOString().split('T')[0],
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SmartProcure_Order_History_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'CSV Exported', 'Order history CSV generated successfully');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
            Order History & Archive
          </h2>
          <p className="text-xs text-slate-500">
            Historical audit logs of fulfilled, delivered, and reconciled purchase orders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-white dark:bg-[#191C20] border border-slate-200 dark:border-slate-700 hover:border-[#00639A] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-white dark:bg-[#191C20] border border-slate-200 dark:border-slate-700 hover:border-[#00639A] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#191C20] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Fulfilled Volume</span>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {filteredOrders.length} Orders
          </div>
        </div>
        <div className="bg-white dark:bg-[#191C20] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Historical Spend</span>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
            ₹{totalArchivedSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="bg-white dark:bg-[#191C20] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">SLA Compliance</span>
          <div className="text-xl font-black text-emerald-600 mt-1">96.8% On-Time</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-[#191C20] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search PO #, supplier, or PR ref..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#00639A]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          >
            <option value="ALL">All Suppliers</option>
            {suppliersList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-[#191C20] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
                <th className="pb-3">PO Number</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Supplier</th>
                <th className="pb-3">Requisition Ref</th>
                <th className="pb-3">Items</th>
                <th className="pb-3">Total Amount</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No historical orders match the criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-[#00639A] dark:text-sky-400">
                      {order.poNumber}
                    </td>
                    <td className="py-3.5 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 font-medium text-slate-900 dark:text-slate-100">
                      {order.supplierName}
                    </td>
                    <td className="py-3.5 font-mono text-slate-500">{order.requestNumber}</td>
                    <td className="py-3.5 text-slate-600 dark:text-slate-300">
                      {order.items?.length || 1} line item(s)
                    </td>
                    <td className="py-3.5 font-bold text-slate-900 dark:text-slate-100">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5">
                      <OrderStatusBadge status={order.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
