import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { AppTab, OrderStatus, Priority, RequestStatus } from '../../types/procurement';
import {
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Award,
  ArrowRight,
  Truck,
  Package,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  ShoppingBag,
} from 'lucide-react';
import { OrderStatusBadge, PriorityBadge } from '../common/StatusBadges';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const DashboardScreen: React.FC = () => {
  const {
    currentUser,
    orders,
    requests,
    lowStockProducts,
    topPerformingSupplier,
    deliveries,
    setActiveTab,
    createPurchaseRequest,
    advanceDemoLifecycle,
  } = useProcurement();

  // Metrics Calculations
  const totalSpend = orders.reduce((sum, o) => {
    if (o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.SUPPLIER_REJECTED) {
      return sum + o.totalAmount;
    }
    return sum;
  }, 0);

  const pendingApprovalsCount =
    requests.filter((r) => r.status === RequestStatus.PENDING_APPROVAL).length +
    orders.filter((o) => o.status === OrderStatus.PENDING_APPROVAL).length;

  const activeDeliveriesCount = deliveries.filter(
    (d) => d.status !== 'DELIVERED' && d.status !== 'FAILED'
  ).length;

  // Chart Data: Spend by Category
  const categorySpendMap: Record<string, number> = {
    Electronics: 285000,
    IT: 395000,
    Packaging: 54000,
    Office: 42000,
  };

  orders.forEach((o) => {
    if (o.items) {
      o.items.forEach((it) => {
        const cat = it.productName.includes('Laptop') || it.productName.includes('Server')
          ? 'IT'
          : it.productName.includes('Microcontroller') || it.productName.includes('IC')
          ? 'Electronics'
          : it.productName.includes('Box') || it.productName.includes('Tape')
          ? 'Packaging'
          : 'Office';
        categorySpendMap[cat] = (categorySpendMap[cat] || 0) + it.totalPrice;
      });
    }
  });

  const categoryChartData = Object.entries(categorySpendMap).map(([name, value]) => ({
    name,
    value: Math.round(value),
  }));

  const COLORS = ['#00639A', '#00A896', '#E28743', '#8E44AD'];

  // Recent POs
  const recentOrders = orders.slice(0, 5);

  const handleQuickReplenish = async (product: typeof lowStockProducts[0]) => {
    const qty = Math.max(1, product.maximumStock - product.availableQuantity);
    await createPurchaseRequest(
      Priority.HIGH,
      'Automated Inventory Replenishment',
      `Auto-generated requisition for stock below safety limit (${product.availableQuantity}/${product.minimumStock})`,
      [{ product, quantity: qty }]
    );
    setActiveTab(AppTab.REQUESTS);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#00639A] to-[#004B76] text-white rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-blue-100">
            Enterprise Operations Cockpit
          </span>
          <h2 className="text-2xl font-black tracking-tight mt-1">
            Welcome back, {currentUser.name}
          </h2>
          <p className="text-sm text-blue-100 mt-0.5">
            Active Role: <strong className="text-white">{currentUser.role.replace('_', ' ')}</strong> | Department: {currentUser.department}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab(AppTab.SHOPPING)}
            className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Procure Store</span>
          </button>
          <button
            onClick={() => setActiveTab(AppTab.REQUESTS)}
            className="px-4 py-2.5 bg-white text-[#00639A] font-bold text-xs rounded-xl shadow-xs hover:bg-blue-50 transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            New Requisition
          </button>
          <button
            onClick={() => advanceDemoLifecycle()}
            className="px-4 py-2.5 bg-blue-900/40 hover:bg-blue-900/60 border border-white/20 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <span>Run Demo Workflow</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spend */}
        <div className="bg-white dark:bg-[#191C20] rounded-2xl p-5 border border-[#E2E2E6] dark:border-[#33363A] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total PO Volume</span>
            <TrendingUp className="w-4 h-4 text-[#00639A]" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
            ₹{totalSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
            <span>↑ 12.4%</span>
            <span className="text-slate-400">vs last cycle</span>
          </p>
        </div>

        {/* Pending Signatures */}
        <div
          onClick={() => setActiveTab(AppTab.ORDERS)}
          className="bg-white dark:bg-[#191C20] rounded-2xl p-5 border border-[#E2E2E6] dark:border-[#33363A] shadow-xs cursor-pointer hover:border-[#00639A] transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Sign-offs</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span>{pendingApprovalsCount}</span>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#00639A] group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
            Hierarchical multi-tier approvals awaiting review
          </p>
        </div>

        {/* Active Logistics */}
        <div
          onClick={() => setActiveTab(AppTab.DELIVERY)}
          className="bg-white dark:bg-[#191C20] rounded-2xl p-5 border border-[#E2E2E6] dark:border-[#33363A] shadow-xs cursor-pointer hover:border-[#00639A] transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Shipments</span>
            <Truck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span>{activeDeliveriesCount}</span>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#00639A] group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
            Live checkpoint tracking & dock inwarding
          </p>
        </div>

        {/* Low Stock Items */}
        <div
          onClick={() => setActiveTab(AppTab.INVENTORY)}
          className="bg-white dark:bg-[#191C20] rounded-2xl p-5 border border-[#E2E2E6] dark:border-[#33363A] shadow-xs cursor-pointer hover:border-[#00639A] transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Inventory Alerts</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span className={lowStockProducts.length > 0 ? 'text-rose-600' : ''}>
              {lowStockProducts.length}
            </span>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#00639A] group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1">
            Items below safety reorder threshold
          </p>
        </div>
      </div>

      {/* Bento Middle Row: Top Performing Supplier & Spend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Supplier Spotlight Card */}
        {topPerformingSupplier && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {topPerformingSupplier.tierBadge}
                </span>
                <Award className="w-5 h-5 text-amber-400" />
              </div>

              <h3 className="text-xl font-black mt-3">
                {topPerformingSupplier.supplier.companyName}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Category: {topPerformingSupplier.supplier.category} | Lead: {topPerformingSupplier.supplier.averageLeadDays} Days
              </p>

              {/* Performance Score Matrix */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-700/60 text-xs">
                <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Quality SLA</span>
                  <span className="text-base font-bold text-emerald-400">
                    {topPerformingSupplier.qualityScore}%
                  </span>
                </div>
                <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">On-Time Delivery</span>
                  <span className="text-base font-bold text-sky-400">
                    {topPerformingSupplier.onTimeDeliveryRate}%
                  </span>
                </div>
              </div>

              <div className="mt-3 text-xs bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-slate-300 italic">
                "{topPerformingSupplier.latestFeedback}"
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                ★ {topPerformingSupplier.ratingStars.toFixed(1)} / 5.0 Rating
              </span>
              <button
                onClick={() => setActiveTab(AppTab.SUPPLIERS)}
                className="text-xs font-semibold text-white/90 hover:text-white flex items-center gap-1"
              >
                <span>View Supplier Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Spend by Category Bar/Pie Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#191C20] rounded-3xl p-6 border border-[#E2E2E6] dark:border-[#33363A] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Procurement Allocation by Category
              </h3>
              <p className="text-xs text-slate-500">Live expenditure breakdown across departments</p>
            </div>
            <button
              onClick={() => setActiveTab(AppTab.ANALYTICS)}
              className="text-xs font-semibold text-[#00639A] dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Expenditure']}
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" fill="#00639A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Low Stock Immediate Attention Shelf */}
      {lowStockProducts.length > 0 && (
        <div className="bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-sm text-rose-900 dark:text-rose-200">
                Critical Inventory Stock Depletion ({lowStockProducts.length} Items)
              </h3>
            </div>
            <button
              onClick={() => setActiveTab(AppTab.INVENTORY)}
              className="text-xs font-bold text-rose-700 dark:text-rose-300 hover:underline"
            >
              Manage Inventory
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white dark:bg-[#191C20] p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/50 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate max-w-[180px]">
                    {prod.name}
                  </h4>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Stock: <strong className="text-rose-600">{prod.availableQuantity}</strong> / Safety: {prod.minimumStock} {prod.unit}
                  </div>
                </div>
                <button
                  onClick={() => handleQuickReplenish(prod)}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Reorder
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Purchase Orders Table */}
      <div className="bg-white dark:bg-[#191C20] rounded-3xl p-6 border border-[#E2E2E6] dark:border-[#33363A] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Active Enterprise Purchase Orders
            </h3>
            <p className="text-xs text-slate-500">Latest POs with digital verification signatures</p>
          </div>
          <button
            onClick={() => setActiveTab(AppTab.ORDERS)}
            className="text-xs font-semibold text-[#00639A] dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="pb-3 font-semibold">PO Number</th>
                <th className="pb-3 font-semibold">Supplier</th>
                <th className="pb-3 font-semibold">Approval Tier</th>
                <th className="pb-3 font-semibold">Total Value</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 font-mono font-bold text-[#00639A] dark:text-sky-400">
                    {order.poNumber}
                  </td>
                  <td className="py-3 font-medium text-slate-900 dark:text-slate-100">
                    {order.supplierName}
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-300">
                    {order.approvalTierName}
                  </td>
                  <td className="py-3 font-bold text-slate-900 dark:text-slate-100">
                    ₹{order.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => setActiveTab(AppTab.ORDERS)}
                      className="text-xs font-semibold text-[#00639A] hover:underline"
                    >
                      Inspect
                    </button>
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
