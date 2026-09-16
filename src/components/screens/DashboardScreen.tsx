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
  Terminal,
  Calendar,
  BarChart3,
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
  Legend,
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

  // Purchase Requests Analytics for Current Fiscal Quarter (Pending vs. Approved)
  const [prChartMetric, setPrChartMetric] = React.useState<'count' | 'value'>('count');
  const [prChartGrouping, setPrChartGrouping] = React.useState<'month' | 'department'>('month');

  // Compute fiscal quarter information (e.g. Q3 2026: Jul - Sep)
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthIdx = currentDate.getMonth();
  const quarterIndex = Math.floor(currentMonthIdx / 3);
  const quarterNumber = quarterIndex + 1;
  const quarterStartMonth = quarterIndex * 3;
  const quarterEndMonth = quarterStartMonth + 2;

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const fullMonthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const quarterMonths = [
    monthNames[quarterStartMonth],
    monthNames[quarterStartMonth + 1],
    monthNames[quarterStartMonth + 2],
  ];

  const quarterLabel = `Q${quarterNumber} ${currentYear} (${quarterMonths[0]} - ${quarterMonths[2]})`;

  const quarterStartMs = new Date(currentYear, quarterStartMonth, 1, 0, 0, 0).getTime();
  const quarterEndMs = new Date(currentYear, quarterEndMonth + 1, 0, 23, 59, 59, 999).getTime();

  // Filter requests for current quarter (fallback to active requests if mock dates differ)
  const quarterReqs = requests.filter(
    (r) => r.createdAt >= quarterStartMs && r.createdAt <= quarterEndMs
  );
  const activeQuarterRequests = quarterReqs.length > 0 ? quarterReqs : requests;

  // Filter purchase orders for current quarter
  const quarterOrders = orders.filter(
    (o) => o.createdAt >= quarterStartMs && o.createdAt <= quarterEndMs
  );
  const activeQuarterOrders = quarterOrders.length > 0 ? quarterOrders : orders;

  const pendingQuarterReqs = activeQuarterRequests.filter(
    (r) =>
      r.status === RequestStatus.PENDING_APPROVAL ||
      r.status === RequestStatus.SUBMITTED ||
      r.status === RequestStatus.DRAFT
  );
  const approvedQuarterReqs = activeQuarterRequests.filter(
    (r) =>
      r.status === RequestStatus.APPROVED ||
      r.status === RequestStatus.CONVERTED_TO_PO
  );

  const pendingQuarterOrders = activeQuarterOrders.filter(
    (o) => o.status === OrderStatus.PENDING_APPROVAL || o.status === OrderStatus.DRAFT
  );
  const approvedQuarterOrders = activeQuarterOrders.filter(
    (o) =>
      o.status !== OrderStatus.CANCELLED &&
      o.status !== OrderStatus.SUPPLIER_REJECTED &&
      o.status !== OrderStatus.PENDING_APPROVAL &&
      o.status !== OrderStatus.DRAFT
  );

  const pendingQuarterCount = pendingQuarterReqs.length;
  const pendingQuarterValue = pendingQuarterReqs.reduce((sum, r) => sum + (r.estimatedAmount || 0), 0);

  const approvedQuarterCount = approvedQuarterReqs.length;
  const approvedQuarterValue = approvedQuarterReqs.reduce((sum, r) => sum + (r.estimatedAmount || 0), 0);

  const pendingQuarterOrdersCount = pendingQuarterOrders.length;
  const pendingQuarterOrdersValue = Math.round(
    pendingQuarterOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  );

  const approvedQuarterOrdersCount = approvedQuarterOrders.length;
  const approvedQuarterOrdersValue = Math.round(
    approvedQuarterOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  );

  const totalPendingMonetaryValue = pendingQuarterValue + pendingQuarterOrdersValue;
  const totalApprovedMonetaryValue = approvedQuarterValue + approvedQuarterOrdersValue;

  const totalQuarterCount = pendingQuarterCount + approvedQuarterCount;
  const totalQuarterValue = pendingQuarterValue + approvedQuarterValue;
  const approvalRatePercent =
    totalQuarterCount > 0 ? Math.round((approvedQuarterCount / totalQuarterCount) * 100) : 0;

  // Helper to resolve order department
  const resolveOrderDepartment = (o: typeof orders[0]) => {
    if (o.purchaseRequestId) {
      const match = requests.find((r) => r.id === o.purchaseRequestId);
      if (match?.department) return match.department;
    }
    if (o.requestNumber) {
      const match = requests.find((r) => r.requestNumber === o.requestNumber);
      if (match?.department) return match.department;
    }
    return 'Engineering & Infrastructure';
  };

  // Monthly breakdown data for Grouped Bar Chart
  const monthlyQuarterChartData = [0, 1, 2].map((offset) => {
    const mIdx = quarterStartMonth + offset;
    const inMonth = activeQuarterRequests.filter((r) => {
      const d = new Date(r.createdAt);
      return d.getMonth() === mIdx;
    });

    const pending = inMonth.filter(
      (r) =>
        r.status === RequestStatus.PENDING_APPROVAL ||
        r.status === RequestStatus.SUBMITTED ||
        r.status === RequestStatus.DRAFT
    );
    const approved = inMonth.filter(
      (r) =>
        r.status === RequestStatus.APPROVED ||
        r.status === RequestStatus.CONVERTED_TO_PO
    );

    const ordersInMonth = activeQuarterOrders.filter((o) => {
      const d = new Date(o.createdAt);
      return d.getMonth() === mIdx;
    });

    const pendingOrdersInMonth = ordersInMonth.filter(
      (o) => o.status === OrderStatus.PENDING_APPROVAL || o.status === OrderStatus.DRAFT
    );
    const approvedOrdersInMonth = ordersInMonth.filter(
      (o) =>
        o.status !== OrderStatus.CANCELLED &&
        o.status !== OrderStatus.SUPPLIER_REJECTED &&
        o.status !== OrderStatus.PENDING_APPROVAL &&
        o.status !== OrderStatus.DRAFT
    );

    const pendingCount = pending.length;
    const approvedCount = approved.length;
    const pendingValue = Math.round(pending.reduce((sum, r) => sum + (r.estimatedAmount || 0), 0));
    const approvedValue = Math.round(approved.reduce((sum, r) => sum + (r.estimatedAmount || 0), 0));

    const pendingOrderCount = pendingOrdersInMonth.length;
    const approvedOrderCount = approvedOrdersInMonth.length;
    const pendingOrderValue = Math.round(
      pendingOrdersInMonth.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    );
    const approvedOrderValue = Math.round(
      approvedOrdersInMonth.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    );

    return {
      name: monthNames[mIdx],
      fullName: fullMonthNames[mIdx],
      pendingCount,
      approvedCount,
      pendingValue,
      approvedValue,
      pendingOrderCount,
      approvedOrderCount,
      pendingOrderValue,
      approvedOrderValue,
      totalPendingMonetary: pendingValue + pendingOrderValue,
      totalApprovedMonetary: approvedValue + approvedOrderValue,
    };
  });

  // Departmental breakdown data for Grouped Bar Chart
  const departmentList = Array.from(
    new Set(activeQuarterRequests.map((r) => r.department || 'General'))
  );
  const departmentQuarterChartData = departmentList.map((dept) => {
    const inDept = activeQuarterRequests.filter((r) => (r.department || 'General') === dept);
    const pending = inDept.filter(
      (r) =>
        r.status === RequestStatus.PENDING_APPROVAL ||
        r.status === RequestStatus.SUBMITTED ||
        r.status === RequestStatus.DRAFT
    );
    const approved = inDept.filter(
      (r) =>
        r.status === RequestStatus.APPROVED ||
        r.status === RequestStatus.CONVERTED_TO_PO
    );

    const ordersInDept = activeQuarterOrders.filter((o) => resolveOrderDepartment(o) === dept);
    const pendingOrdersInDept = ordersInDept.filter(
      (o) => o.status === OrderStatus.PENDING_APPROVAL || o.status === OrderStatus.DRAFT
    );
    const approvedOrdersInDept = ordersInDept.filter(
      (o) =>
        o.status !== OrderStatus.CANCELLED &&
        o.status !== OrderStatus.SUPPLIER_REJECTED &&
        o.status !== OrderStatus.PENDING_APPROVAL &&
        o.status !== OrderStatus.DRAFT
    );

    const pendingCount = pending.length;
    const approvedCount = approved.length;
    const pendingValue = Math.round(pending.reduce((sum, r) => sum + (r.estimatedAmount || 0), 0));
    const approvedValue = Math.round(approved.reduce((sum, r) => sum + (r.estimatedAmount || 0), 0));

    const pendingOrderCount = pendingOrdersInDept.length;
    const approvedOrderCount = approvedOrdersInDept.length;
    const pendingOrderValue = Math.round(
      pendingOrdersInDept.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    );
    const approvedOrderValue = Math.round(
      approvedOrdersInDept.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    );

    return {
      name: dept.length > 15 ? dept.split(' ')[0] : dept,
      fullName: dept,
      pendingCount,
      approvedCount,
      pendingValue,
      approvedValue,
      pendingOrderCount,
      approvedOrderCount,
      pendingOrderValue,
      approvedOrderValue,
      totalPendingMonetary: pendingValue + pendingOrderValue,
      totalApprovedMonetary: approvedValue + approvedOrderValue,
    };
  });

  const activeBarData =
    prChartGrouping === 'month' ? monthlyQuarterChartData : departmentQuarterChartData;

  // Donut chart data for Pending vs. Approved
  const pendingVsApprovedDonutData = [
    {
      name: 'Approved / Converted',
      count: approvedQuarterCount,
      value: approvedQuarterValue,
      orderCount: approvedQuarterOrdersCount,
      orderValue: approvedQuarterOrdersValue,
      totalCombinedValue: approvedQuarterValue + approvedQuarterOrdersValue,
      color: '#10B981',
    },
    {
      name: 'Pending Approval',
      count: pendingQuarterCount,
      value: pendingQuarterValue,
      orderCount: pendingQuarterOrdersCount,
      orderValue: pendingQuarterOrdersValue,
      totalCombinedValue: pendingQuarterValue + pendingQuarterOrdersValue,
      color: '#F59E0B',
    },
  ];

  // Custom Detailed Tooltip for Grouped Bar Chart
  const QuarterSummaryBarTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0]?.payload;
    if (!data) return null;

    const title = data.fullName || label || data.name;
    const reqApprovedVal = Number(data.approvedValue) || 0;
    const reqPendingVal = Number(data.pendingValue) || 0;
    const orderApprovedVal = Number(data.approvedOrderValue) || 0;
    const orderPendingVal = Number(data.pendingOrderValue) || 0;

    const totalApprovedMonetary = reqApprovedVal + orderApprovedVal;
    const totalPendingMonetary = reqPendingVal + orderPendingVal;
    const combinedMonetary = totalApprovedMonetary + totalPendingMonetary;
    const approvedShare =
      combinedMonetary > 0 ? Math.round((totalApprovedMonetary / combinedMonetary) * 100) : 0;

    return (
      <div className="bg-slate-900/95 dark:bg-[#15181C]/95 backdrop-blur-md text-white border border-slate-700/80 rounded-2xl shadow-2xl p-4 min-w-[310px] max-w-[360px] text-xs space-y-3 z-50">
        {/* Tooltip Header */}
        <div className="border-b border-slate-700/60 pb-2.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-white">{title}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-sky-300 border border-blue-400/30">
              {quarterLabel.split(' ')[0]} Breakdown
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Monetary commitments: Pending vs. Approved orders & requests
          </p>
        </div>

        {/* Approved Breakdown Card */}
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="font-bold text-emerald-300">Approved Commitments</span>
            </div>
            <span className="font-mono font-black text-emerald-300 text-sm">
              ₹{totalApprovedMonetary.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1.5 border-t border-emerald-900/50">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">
                Approved Orders (POs)
              </span>
              <span className="font-mono font-bold text-white">
                ₹{orderApprovedVal.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-400/90 ml-1 block">
                {data.approvedOrderCount} POs signed
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">
                Approved Requests (PRs)
              </span>
              <span className="font-mono font-bold text-white">
                ₹{reqApprovedVal.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-400/90 ml-1 block">
                {data.approvedCount} PRs cleared
              </span>
            </div>
          </div>
        </div>

        {/* Pending Breakdown Card */}
        <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="font-bold text-amber-300">Pending Review</span>
            </div>
            <span className="font-mono font-black text-amber-300 text-sm">
              ₹{totalPendingMonetary.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1.5 border-t border-amber-900/50">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">
                Pending Orders (POs)
              </span>
              <span className="font-mono font-bold text-white">
                ₹{orderPendingVal.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-amber-400/90 ml-1 block">
                {data.pendingOrderCount} POs awaiting
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">
                Pending Requests (PRs)
              </span>
              <span className="font-mono font-bold text-white">
                ₹{reqPendingVal.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-amber-400/90 ml-1 block">
                {data.pendingCount} PRs in queue
              </span>
            </div>
          </div>
        </div>

        {/* Aggregate Net Total and Ratio Bar */}
        <div className="border-t border-slate-700/60 pt-2 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Combined Total Value:</span>
            <span className="font-mono font-black text-white text-xs">
              ₹{combinedMonetary.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span className="text-emerald-300">Approved: {approvedShare}%</span>
            <span className="text-amber-300">Pending: {100 - approvedShare}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${approvedShare}%` }}
            />
            <div
              className="bg-amber-500 h-full transition-all duration-300"
              style={{ width: `${100 - approvedShare}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  // Custom Detailed Tooltip for Donut Pie Chart
  const QuarterDonutTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0]?.payload;
    if (!item) return null;

    const isApproved = item.name.includes('Approved');
    const orderVal = Number(item.orderValue) || 0;
    const reqVal = Number(item.value) || 0;
    const totalVal = reqVal + orderVal;
    const allTotalQuarter = totalApprovedMonetaryValue + totalPendingMonetaryValue;
    const sharePercent = allTotalQuarter > 0 ? Math.round((totalVal / allTotalQuarter) * 100) : 0;

    return (
      <div className="bg-slate-900/95 dark:bg-[#15181C]/95 backdrop-blur-md text-white border border-slate-700/80 rounded-2xl shadow-2xl p-3.5 min-w-[280px] max-w-[320px] text-xs space-y-2.5 z-50">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-black text-sm text-white">{item.name}</span>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isApproved
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
            }`}
          >
            {sharePercent}% of Pipeline
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Total Monetary Value:</span>
            <span className="font-mono font-black text-white text-sm">
              ₹{totalVal.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-slate-800/70 rounded-xl p-2.5 space-y-1.5 border border-slate-700/50">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Purchase Orders Value:</span>
              <span className="font-mono font-bold text-emerald-300">
                ₹{orderVal.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between">
              <span>Orders volume:</span>
              <span className="text-slate-300 font-medium">{item.orderCount} POs</span>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-700/60">
              <span className="text-slate-400">Purchase Requests Value:</span>
              <span className="font-mono font-bold text-sky-300">
                ₹{reqVal.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between">
              <span>Requisitions volume:</span>
              <span className="text-slate-300 font-medium">{item.count} PRs</span>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 italic">
          Fiscal Quarter {quarterLabel.split(' ')[0]} cumulative governance totals
        </div>
      </div>
    );
  };

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
            onClick={() => setActiveTab(AppTab.API_CONSOLE)}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all duration-200 ease-out hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
            title="Open Postman API Console & 55-Endpoint Test Suite"
          >
            <Terminal className="w-4 h-4" />
            <span>Postman APIs (55)</span>
          </button>
          <button
            onClick={() => setActiveTab(AppTab.SHOPPING)}
            className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all duration-200 ease-out hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Procure Store</span>
          </button>
          <button
            onClick={() => setActiveTab(AppTab.REQUESTS)}
            className="px-4 py-2.5 bg-white text-[#00639A] font-bold text-xs rounded-xl shadow-xs hover:bg-blue-50 transition-all duration-200 ease-out hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            New Requisition
          </button>
          <button
            onClick={() => advanceDemoLifecycle()}
            className="px-4 py-2.5 bg-blue-900/40 hover:bg-blue-900/60 border border-white/20 text-white font-bold text-xs rounded-xl transition-all duration-200 ease-out hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
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
          className="bg-white dark:bg-[#191C20] rounded-2xl p-5 border border-[#E2E2E6] dark:border-[#33363A] shadow-xs cursor-pointer hover:border-[#00639A] transition-all duration-200 ease-out hover:scale-[1.03] hover:shadow-md active:scale-[0.98] group"
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
          className="bg-white dark:bg-[#191C20] rounded-2xl p-5 border border-[#E2E2E6] dark:border-[#33363A] shadow-xs cursor-pointer hover:border-[#00639A] transition-all duration-200 ease-out hover:scale-[1.03] hover:shadow-md active:scale-[0.98] group"
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
          className="bg-white dark:bg-[#191C20] rounded-2xl p-5 border border-[#E2E2E6] dark:border-[#33363A] shadow-xs cursor-pointer hover:border-[#00639A] transition-all duration-200 ease-out hover:scale-[1.03] hover:shadow-md active:scale-[0.98] group"
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
                className="text-xs font-semibold text-white/90 hover:text-white flex items-center gap-1 transition-all duration-200 ease-out hover:scale-105 active:scale-95 cursor-pointer"
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
              className="text-xs font-semibold text-[#00639A] dark:text-sky-400 hover:underline flex items-center gap-1 transition-all duration-200 ease-out hover:scale-105 active:scale-95 cursor-pointer"
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

      {/* Current Fiscal Quarter: Pending vs. Approved Requisitions Summary Chart */}
      <div className="bg-white dark:bg-[#191C20] rounded-3xl p-6 border border-[#E2E2E6] dark:border-[#33363A] shadow-xs space-y-5">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/50 text-[#00639A] dark:text-sky-400 border border-blue-200 dark:border-blue-800/60">
                <Calendar className="w-3 h-3" />
                <span>{quarterLabel}</span>
              </span>
              <span className="text-[11px] font-medium text-slate-400">Current Fiscal Quarter</span>
            </div>
            <h3 className="font-black text-lg text-slate-900 dark:text-slate-100 mt-1.5">
              Purchase Requests: Pending vs. Approved
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comparative requisition pipeline volume and authorized spend velocity
            </p>
          </div>

          {/* Interactive Metric and Grouping Toggles */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Metric Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setPrChartMetric('count')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ease-out cursor-pointer ${
                  prChartMetric === 'count'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                By Count
              </button>
              <button
                type="button"
                onClick={() => setPrChartMetric('value')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ease-out cursor-pointer ${
                  prChartMetric === 'value'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                By Value (₹)
              </button>
            </div>

            {/* Grouping Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setPrChartGrouping('month')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ease-out cursor-pointer ${
                  prChartGrouping === 'month'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setPrChartGrouping('department')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ease-out cursor-pointer ${
                  prChartGrouping === 'department'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                By Department
              </button>
            </div>

            {/* Quick Link to Requisitions */}
            <button
              onClick={() => setActiveTab(AppTab.REQUESTS)}
              className="px-3 py-1.5 text-xs font-semibold text-[#00639A] dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl border border-blue-200/60 dark:border-blue-900/60 transition-all duration-200 ease-out hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <span>Manage Requisitions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Metric Summary Cards Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Quarter Requisitions
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900 dark:text-slate-100">{totalQuarterCount}</span>
              <span className="text-xs text-slate-500">requests</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 block font-mono">
              ₹{totalQuarterValue.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-emerald-50/70 dark:bg-emerald-950/20 p-3.5 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Approved Commitments
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">{approvedQuarterCount}</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                ({approvalRatePercent}%)
              </span>
            </div>
            <div className="mt-0.5 space-y-0.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                  ₹{totalApprovedMonetaryValue.toLocaleString('en-IN')}
                </span>
                <span className="text-[9px] uppercase font-bold text-emerald-600/80">Total</span>
              </div>
              <div className="text-[10px] text-emerald-600/90 dark:text-emerald-400/90 flex justify-between">
                <span>Orders (POs):</span>
                <span className="font-mono">₹{approvedQuarterOrdersValue.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50/70 dark:bg-amber-950/20 p-3.5 rounded-2xl border border-amber-200/60 dark:border-amber-900/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                Pending Review
              </span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-black text-amber-700 dark:text-amber-300">{pendingQuarterCount}</span>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                ({totalQuarterCount > 0 ? 100 - approvalRatePercent : 0}%)
              </span>
            </div>
            <div className="mt-0.5 space-y-0.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-amber-700 dark:text-amber-300 font-mono font-bold">
                  ₹{totalPendingMonetaryValue.toLocaleString('en-IN')}
                </span>
                <span className="text-[9px] uppercase font-bold text-amber-600/80">Total</span>
              </div>
              <div className="text-[10px] text-amber-600/90 dark:text-amber-400/90 flex justify-between">
                <span>Orders (POs):</span>
                <span className="font-mono">₹{pendingQuarterOrdersValue.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/70 dark:bg-blue-950/20 p-3.5 rounded-2xl border border-blue-200/60 dark:border-blue-900/40">
            <span className="text-[11px] font-bold text-[#00639A] dark:text-sky-300 uppercase tracking-wider block">
              Approval Velocity
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-black text-[#00639A] dark:text-sky-300">{approvalRatePercent}%</span>
              <span className="text-xs text-slate-500">cleared</span>
            </div>
            <div className="w-full bg-blue-200/60 dark:bg-blue-900/50 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className="bg-[#00639A] dark:bg-sky-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, approvalRatePercent))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Dual Chart Area: Comparative Grouped Bar Chart + Donut Ratio Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Grouped Bar Chart */}
          <div className="lg:col-span-2 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-[#00639A] dark:text-sky-400" />
                {prChartGrouping === 'month' ? 'Monthly Comparison' : 'Departmental Breakdown'} (
                {prChartMetric === 'count' ? 'Requisition Volume' : 'Total Value in ₹'})
              </span>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  Approved
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  Pending
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activeBarData}
                  margin={{ top: 10, right: 10, left: prChartMetric === 'value' ? 0 : -20, bottom: 5 }}
                >
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    allowDecimals={false}
                    tickFormatter={(val) =>
                      prChartMetric === 'value' ? `₹${(val / 1000).toFixed(0)}k` : `${val}`
                    }
                  />
                  <Tooltip content={<QuarterSummaryBarTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={24}
                    formatter={(val) =>
                      val === 'approvedCount' || val === 'approvedValue'
                        ? 'Approved Requisitions'
                        : 'Pending Requisitions'
                    }
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  />
                  <Bar
                    dataKey={prChartMetric === 'count' ? 'approvedCount' : 'approvedValue'}
                    fill="#10B981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  />
                  <Bar
                    dataKey={prChartMetric === 'count' ? 'pendingCount' : 'pendingValue'}
                    fill="#F59E0B"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Chart: Pending vs Approved Proportion */}
          <div className="bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Status Share ({quarterLabel.split(' ')[0]})
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {totalQuarterCount} total
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Proportion of requests cleared vs. awaiting sign-off
              </p>
            </div>

            <div className="h-48 w-full relative flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pendingVsApprovedDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={74}
                    paddingAngle={4}
                    dataKey={prChartMetric === 'count' ? 'count' : 'value'}
                  >
                    {pendingVsApprovedDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<QuarterDonutTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Centered Donut Stat Readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {approvalRatePercent}%
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Cleared
                </span>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="space-y-2 border-t border-slate-200/60 dark:border-slate-800 pt-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">Approved</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {prChartMetric === 'count'
                    ? `${approvedQuarterCount} reqs`
                    : `₹${(approvedQuarterValue / 1000).toFixed(0)}k`}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">Pending</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {prChartMetric === 'count'
                    ? `${pendingQuarterCount} reqs`
                    : `₹${(pendingQuarterValue / 1000).toFixed(0)}k`}
                </span>
              </div>
            </div>
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
              className="text-xs font-bold text-rose-700 dark:text-rose-300 hover:underline transition-all duration-200 ease-out hover:scale-105 active:scale-95 cursor-pointer"
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
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-all duration-200 ease-out hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1"
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
            className="text-xs font-semibold text-[#00639A] dark:text-sky-400 hover:underline flex items-center gap-1 transition-all duration-200 ease-out hover:scale-105 active:scale-95 cursor-pointer"
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
                      className="text-xs font-semibold text-[#00639A] hover:underline transition-all duration-200 ease-out hover:scale-110 active:scale-95 cursor-pointer inline-block"
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
