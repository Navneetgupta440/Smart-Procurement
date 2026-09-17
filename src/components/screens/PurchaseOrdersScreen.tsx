import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { OrderStatus, PurchaseOrder, UserRole } from '../../types/procurement';
import {
  Search,
  Filter,
  Receipt,
  Store,
  Truck,
  CheckCircle2,
  XCircle,
  Package,
  Clock,
  Send,
  Building,
  FileText,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  LayoutList,
  LayoutGrid,
  RotateCcw,
} from 'lucide-react';
import { OrderStatusBadge } from '../common/StatusBadges';
import { PoStatusTracker } from '../common/PoStatusTracker';
import { PoHierarchicalApprovalView } from '../common/PoHierarchicalApprovalView';

export type PoSortKey =
  | 'poNumber'
  | 'supplierName'
  | 'requestNumber'
  | 'createdByName'
  | 'createdAt'
  | 'status'
  | 'totalAmount';

export type SortDirection = 'asc' | 'desc';

export const PurchaseOrdersScreen: React.FC = () => {
  const {
    currentUser,
    orders,
    supplierAcceptOrder,
    supplierRejectOrder,
    supplierDispatchOrder,
    advanceDeliveryStatus,
    deliveries,
    screenSearchQuery,
    setScreenSearchQuery,
  } = useProcurement();

  const [search, setSearch] = useState(screenSearchQuery || '');

  React.useEffect(() => {
    if (screenSearchQuery !== undefined && screenSearchQuery !== '') {
      setSearch(screenSearchQuery);
    }
  }, [screenSearchQuery]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(orders[0]?.id || null);

  // Interactive sorting state
  const [sortKey, setSortKey] = useState<PoSortKey>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');

  // Line item sorting per order
  const [lineItemSortMap, setLineItemSortMap] = useState<
    Record<string, { key: 'productName' | 'quantity' | 'unitPrice' | 'totalPrice'; direction: SortDirection }>
  >({});

  // Dispatch modal state
  const [dispatchOrderObj, setDispatchOrderObj] = useState<PurchaseOrder | null>(null);
  const [carrierName, setCarrierName] = useState('BlueDart Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.supplierName.toLowerCase().includes(search.toLowerCase()) ||
      (o.requestNumber || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSort = (key: PoSortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection(key === 'createdAt' || key === 'totalAmount' ? 'desc' : 'asc');
    }
  };

  const handleResetSort = () => {
    setSortKey('createdAt');
    setSortDirection('desc');
  };

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let comp = 0;
    if (sortKey === 'createdAt' || sortKey === 'totalAmount') {
      comp = (a[sortKey] || 0) - (b[sortKey] || 0);
    } else {
      const valA = (a[sortKey] || '').toString().toLowerCase();
      const valB = (b[sortKey] || '').toString().toLowerCase();
      comp = valA.localeCompare(valB);
    }
    return sortDirection === 'asc' ? comp : -comp;
  });

  const handleSortLineItem = (
    orderId: string,
    key: 'productName' | 'quantity' | 'unitPrice' | 'totalPrice'
  ) => {
    setLineItemSortMap((prev) => {
      const current = prev[orderId];
      if (current && current.key === key) {
        return {
          ...prev,
          [orderId]: { key, direction: current.direction === 'asc' ? 'desc' : 'asc' },
        };
      }
      return {
        ...prev,
        [orderId]: { key, direction: key === 'quantity' || key === 'unitPrice' || key === 'totalPrice' ? 'desc' : 'asc' },
      };
    });
  };

  const getSortedLineItems = (order: PurchaseOrder) => {
    const items = order.items || [];
    const sortConfig = lineItemSortMap[order.id];
    if (!sortConfig) return items;

    return [...items].sort((a, b) => {
      let comp = 0;
      if (sortConfig.key === 'quantity' || sortConfig.key === 'unitPrice' || sortConfig.key === 'totalPrice') {
        comp = (a[sortConfig.key] || 0) - (b[sortConfig.key] || 0);
      } else {
        comp = (a.productName || '').localeCompare(b.productName || '');
      }
      return sortConfig.direction === 'asc' ? comp : -comp;
    });
  };

  const getSortLabel = () => {
    switch (sortKey) {
      case 'poNumber':
        return 'PO Number';
      case 'supplierName':
        return 'Supplier';
      case 'requestNumber':
        return 'PR Ref';
      case 'createdByName':
        return 'Initiator';
      case 'createdAt':
        return 'Date Created';
      case 'status':
        return 'Status';
      case 'totalAmount':
        return 'Total Amount';
      default:
        return sortKey;
    }
  };

  const handleOpenDispatch = (order: PurchaseOrder) => {
    setDispatchOrderObj(order);
    setCarrierName('BlueDart Express');
    setTrackingNumber(`BD-EXP-${Math.floor(1000000 + Math.random() * 9000000)}`);
  };

  const handleConfirmDispatch = async () => {
    if (!dispatchOrderObj) return;
    setIsSubmitting(true);
    try {
      await supplierDispatchOrder(dispatchOrderObj.id, carrierName, trackingNumber);
      setDispatchOrderObj(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
            Purchase Orders & Hierarchical Authorizations
          </h2>
          <p className="text-xs text-slate-500">
            Digital certificate-stamped multi-level approvals, supplier SLAs, and fulfillment
          </p>
        </div>

        {/* View Switcher: Table vs Cards */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl flex items-center border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-white dark:bg-slate-700 text-[#00639A] dark:text-sky-400 shadow-xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('CARDS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'CARDS'
                  ? 'bg-white dark:bg-slate-700 text-[#00639A] dark:text-sky-400 shadow-xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Card View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#191C20] p-4 rounded-2xl border border-[#E2E2E6] dark:border-[#33363A] flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search PO #, supplier name, PR ref..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#00639A]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {[
            'ALL',
            'PENDING_APPROVAL',
            'SENT_TO_SUPPLIER',
            'SUPPLIER_ACCEPTED',
            'DISPATCHED',
            'DELIVERED',
          ].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#00639A] text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Sort Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500">
        <div className="flex items-center gap-2 flex-wrap">
          <span>Showing {sortedOrders.length} purchase orders</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <div className="flex items-center gap-1.5 bg-blue-50/80 dark:bg-blue-950/30 text-[#00639A] dark:text-sky-300 px-2.5 py-1 rounded-lg border border-blue-200/50 dark:border-blue-900/40">
            <ArrowUpDown className="w-3 h-3" />
            <span>
              Sorted by: <strong className="font-bold">{getSortLabel()}</strong> ({sortDirection === 'asc' ? 'Ascending' : 'Descending'})
            </span>
          </div>
          {(sortKey !== 'createdAt' || sortDirection !== 'desc') && (
            <button
              type="button"
              onClick={handleResetSort}
              className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Sort</span>
            </button>
          )}
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Click column headers in the table to toggle sorting direction
        </span>
      </div>

      {/* Orders List / Table */}
      <div className="space-y-4">
        {sortedOrders.length === 0 ? (
          <div className="bg-white dark:bg-[#191C20] rounded-3xl p-12 text-center border border-[#E2E2E6] dark:border-[#33363A]">
            <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">
              No purchase orders found
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Convert approved purchase requisitions or adjust your search filter.
            </p>
          </div>
        ) : viewMode === 'TABLE' ? (
          /* Interactive Data Table View */
          <div className="bg-white dark:bg-[#191C20] rounded-3xl border border-[#E2E2E6] dark:border-[#33363A] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[720px]">
                <thead className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    {/* PO Number */}
                    <th
                      scope="col"
                      onClick={() => handleSort('poNumber')}
                      className={`p-3.5 select-none cursor-pointer transition-colors group font-semibold uppercase text-[10px] tracking-wider ${
                        sortKey === 'poNumber'
                          ? 'text-[#00639A] dark:text-sky-400 bg-blue-50/70 dark:bg-blue-950/30'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>PO Number</span>
                        {sortKey === 'poNumber' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" /> : <ArrowDown className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>

                    {/* Supplier */}
                    <th
                      scope="col"
                      onClick={() => handleSort('supplierName')}
                      className={`p-3.5 select-none cursor-pointer transition-colors group font-semibold uppercase text-[10px] tracking-wider ${
                        sortKey === 'supplierName'
                          ? 'text-[#00639A] dark:text-sky-400 bg-blue-50/70 dark:bg-blue-950/30'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Supplier</span>
                        {sortKey === 'supplierName' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" /> : <ArrowDown className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>

                    {/* PR Ref */}
                    <th
                      scope="col"
                      onClick={() => handleSort('requestNumber')}
                      className={`p-3.5 select-none cursor-pointer transition-colors group font-semibold uppercase text-[10px] tracking-wider ${
                        sortKey === 'requestNumber'
                          ? 'text-[#00639A] dark:text-sky-400 bg-blue-50/70 dark:bg-blue-950/30'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>PR Ref</span>
                        {sortKey === 'requestNumber' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" /> : <ArrowDown className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>

                    {/* Date Created */}
                    <th
                      scope="col"
                      onClick={() => handleSort('createdAt')}
                      className={`p-3.5 select-none cursor-pointer transition-colors group font-semibold uppercase text-[10px] tracking-wider ${
                        sortKey === 'createdAt'
                          ? 'text-[#00639A] dark:text-sky-400 bg-blue-50/70 dark:bg-blue-950/30'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Date Created</span>
                        {sortKey === 'createdAt' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" /> : <ArrowDown className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>

                    {/* Status */}
                    <th
                      scope="col"
                      onClick={() => handleSort('status')}
                      className={`p-3.5 select-none cursor-pointer transition-colors group font-semibold uppercase text-[10px] tracking-wider ${
                        sortKey === 'status'
                          ? 'text-[#00639A] dark:text-sky-400 bg-blue-50/70 dark:bg-blue-950/30'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Status</span>
                        {sortKey === 'status' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" /> : <ArrowDown className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>

                    {/* Total Amount */}
                    <th
                      scope="col"
                      onClick={() => handleSort('totalAmount')}
                      className={`p-3.5 text-right select-none cursor-pointer transition-colors group font-semibold uppercase text-[10px] tracking-wider ${
                        sortKey === 'totalAmount'
                          ? 'text-[#00639A] dark:text-sky-400 bg-blue-50/70 dark:bg-blue-950/30'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Total Value (₹)</span>
                        {sortKey === 'totalAmount' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" /> : <ArrowDown className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>

                    {/* Initiator */}
                    <th
                      scope="col"
                      onClick={() => handleSort('createdByName')}
                      className={`p-3.5 select-none cursor-pointer transition-colors group font-semibold uppercase text-[10px] tracking-wider ${
                        sortKey === 'createdByName'
                          ? 'text-[#00639A] dark:text-sky-400 bg-blue-50/70 dark:bg-blue-950/30'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Initiator</span>
                        {sortKey === 'createdByName' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" /> : <ArrowDown className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>

                    {/* Expand / Details */}
                    <th className="p-3.5 text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Inspect
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {sortedOrders.map((order) => {
                    const isExpanded = expandedOrderId === order.id;
                    const sortedItems = getSortedLineItems(order);
                    const lineSort = lineItemSortMap[order.id];

                    // Supplier action eligibility
                    const isSupplierUser =
                      currentUser.role === UserRole.SUPPLIER || currentUser.role === UserRole.ADMIN;
                    const canSupplierAccept =
                      order.status === OrderStatus.SENT_TO_SUPPLIER && isSupplierUser;
                    const canSupplierDispatch =
                      order.status === OrderStatus.SUPPLIER_ACCEPTED && isSupplierUser;

                    return (
                      <React.Fragment key={order.id}>
                        <tr
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${
                            isExpanded ? 'bg-blue-50/20 dark:bg-blue-950/15' : ''
                          }`}
                        >
                          {/* PO Number */}
                          <td className="p-3.5 font-mono font-black text-[#00639A] dark:text-sky-400 whitespace-nowrap">
                            {order.poNumber}
                          </td>

                          {/* Supplier */}
                          <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200 max-w-[180px] truncate">
                            {order.supplierName}
                          </td>

                          {/* PR Ref */}
                          <td className="p-3.5 whitespace-nowrap">
                            <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {order.requestNumber || '—'}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="p-3.5 whitespace-nowrap text-slate-500">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>

                          {/* Status Badge */}
                          <td className="p-3.5 whitespace-nowrap">
                            <OrderStatusBadge status={order.status} />
                          </td>

                          {/* Total Amount */}
                          <td className="p-3.5 text-right font-mono font-black text-slate-900 dark:text-slate-100 whitespace-nowrap">
                            ₹{order.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </td>

                          {/* Initiator */}
                          <td className="p-3.5 text-slate-600 dark:text-slate-400 whitespace-nowrap max-w-[140px] truncate">
                            {order.createdByName}
                          </td>

                          {/* Expand Trigger */}
                          <td className="p-3.5 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedOrderId(isExpanded ? null : order.id);
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
                              title={isExpanded ? 'Collapse order' : 'Expand order details'}
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Details Row */}
                        {isExpanded && (
                          <tr className="bg-slate-50/40 dark:bg-slate-900/30">
                            <td colSpan={8} className="p-5 border-t border-b border-slate-200 dark:border-slate-800">
                              <div className="space-y-4 max-w-5xl mx-auto">
                                {/* Visual Order Lifecycle Status Tracker */}
                                <div className="bg-white dark:bg-[#191C20] rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs">
                                  <PoStatusTracker status={order.status} />
                                </div>

                                {/* Line Items Table with Interactive Column Sorting */}
                                <div className="bg-white dark:bg-[#191C20] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                      Line Items ({order.items?.length || 0})
                                    </h4>
                                    <span className="text-[10px] text-slate-400">
                                      Click column headers to sort line items
                                    </span>
                                  </div>
                                  <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                                    <table className="w-full text-left text-xs min-w-[460px]">
                                      <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-400 font-semibold uppercase text-[10px]">
                                        <tr>
                                          <th
                                            onClick={() => handleSortLineItem(order.id, 'productName')}
                                            className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                          >
                                            <div className="flex items-center gap-1">
                                              <span>Product Description</span>
                                              {lineSort?.key === 'productName' ? (
                                                lineSort.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-[#00639A]" /> : <ArrowDown className="w-3 h-3 text-[#00639A]" />
                                              ) : (
                                                <ArrowUpDown className="w-3 h-3 text-slate-300" />
                                              )}
                                            </div>
                                          </th>
                                          <th
                                            onClick={() => handleSortLineItem(order.id, 'quantity')}
                                            className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                          >
                                            <div className="flex items-center gap-1">
                                              <span>Qty</span>
                                              {lineSort?.key === 'quantity' ? (
                                                lineSort.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-[#00639A]" /> : <ArrowDown className="w-3 h-3 text-[#00639A]" />
                                              ) : (
                                                <ArrowUpDown className="w-3 h-3 text-slate-300" />
                                              )}
                                            </div>
                                          </th>
                                          <th
                                            onClick={() => handleSortLineItem(order.id, 'unitPrice')}
                                            className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                          >
                                            <div className="flex items-center gap-1">
                                              <span>Unit Price</span>
                                              {lineSort?.key === 'unitPrice' ? (
                                                lineSort.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-[#00639A]" /> : <ArrowDown className="w-3 h-3 text-[#00639A]" />
                                              ) : (
                                                <ArrowUpDown className="w-3 h-3 text-slate-300" />
                                              )}
                                            </div>
                                          </th>
                                          <th
                                            onClick={() => handleSortLineItem(order.id, 'totalPrice')}
                                            className="p-3 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                          >
                                            <div className="flex items-center justify-end gap-1">
                                              <span>Line Total</span>
                                              {lineSort?.key === 'totalPrice' ? (
                                                lineSort.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-[#00639A]" /> : <ArrowDown className="w-3 h-3 text-[#00639A]" />
                                              ) : (
                                                <ArrowUpDown className="w-3 h-3 text-slate-300" />
                                              )}
                                            </div>
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                        {sortedItems.map((it) => (
                                          <tr key={it.id}>
                                            <td className="p-3 font-medium text-slate-900 dark:text-slate-100">
                                              {it.productName}{' '}
                                              <span className="text-[10px] text-slate-400 font-mono">
                                                ({it.productCode})
                                              </span>
                                            </td>
                                            <td className="p-3 text-slate-700 dark:text-slate-300 font-bold">
                                              {it.quantity}
                                            </td>
                                            <td className="p-3 text-slate-500">
                                              ₹{it.unitPrice.toLocaleString('en-IN')}
                                            </td>
                                            <td className="p-3 text-right font-bold text-slate-900 dark:text-slate-100">
                                              ₹{it.totalPrice.toLocaleString('en-IN')}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>

                                {/* Financial Summary & Breakdown */}
                                <div className="bg-white dark:bg-[#191C20] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div className="text-xs text-slate-500 space-y-1">
                                    <div>
                                      Contract Notes:{' '}
                                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                                        {order.notes || 'Standard Terms & Conditions'}
                                      </span>
                                    </div>
                                    <div>
                                      Tax Category:{' '}
                                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                                        GST @ {order.taxRate}% (₹{order.taxAmount.toLocaleString('en-IN')})
                                      </span>
                                    </div>
                                    {order.trackingNumber && (
                                      <div className="flex items-center gap-1 text-[#00639A] dark:text-sky-400 font-semibold">
                                        <Truck className="w-3.5 h-3.5" />
                                        Carrier: {order.carrier} | Tracking: {order.trackingNumber}
                                      </div>
                                    )}
                                  </div>

                                  <div className="text-xs space-y-1 text-right min-w-[180px]">
                                    <div className="flex justify-between text-slate-500">
                                      <span>Subtotal:</span>
                                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                                        ₹{order.subtotal.toLocaleString('en-IN')}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                      <span>GST (18%):</span>
                                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                                        +₹{order.taxAmount.toLocaleString('en-IN')}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                      <span>Shipping Freight:</span>
                                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                                        +₹{order.shippingCost.toLocaleString('en-IN')}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-base font-black text-slate-900 dark:text-slate-100 pt-1.5 border-t border-slate-200 dark:border-slate-700">
                                      <span>Grand Total:</span>
                                      <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Multi-Level Hierarchical Approval Engine Component */}
                                <PoHierarchicalApprovalView order={order} />

                                {/* Supplier Operations Controls */}
                                {isSupplierUser && (canSupplierAccept || canSupplierDispatch) && (
                                  <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <div>
                                      <h4 className="font-bold text-xs text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                                        <Store className="w-4 h-4 text-indigo-600" />
                                        Supplier Fulfillment Controls ({order.supplierName})
                                      </h4>
                                      <p className="text-xs text-indigo-800 dark:text-indigo-300 mt-0.5">
                                        Review authorized order and dispatch logistics payload
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {canSupplierAccept && (
                                        <>
                                          <button
                                            onClick={() => supplierRejectOrder(order.id, 'Capacity full')}
                                            className="px-3 py-1.5 bg-white text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold hover:bg-rose-50 cursor-pointer"
                                          >
                                            Decline Order
                                          </button>
                                          <button
                                            onClick={() => supplierAcceptOrder(order.id)}
                                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                                          >
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Accept Order
                                          </button>
                                        </>
                                      )}

                                      {canSupplierDispatch && (
                                        <button
                                          onClick={() => handleOpenDispatch(order)}
                                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                                        >
                                          <Truck className="w-4 h-4" />
                                          Dispatch Shipment & Generate Tracking
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Cards View (also strictly respecting sortedOrders) */
          sortedOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const deliveryRecord = deliveries.find((d) => d.purchaseOrderId === order.id);
            const sortedItems = getSortedLineItems(order);
            const lineSort = lineItemSortMap[order.id];

            // Supplier action eligibility
            const isSupplierUser =
              currentUser.role === UserRole.SUPPLIER || currentUser.role === UserRole.ADMIN;

            const canSupplierAccept =
              order.status === OrderStatus.SENT_TO_SUPPLIER && isSupplierUser;

            const canSupplierDispatch =
              order.status === OrderStatus.SUPPLIER_ACCEPTED && isSupplierUser;

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-[#191C20] rounded-3xl p-5 sm:p-6 border border-[#E2E2E6] dark:border-[#33363A] shadow-xs space-y-4 transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-black text-base text-[#00639A] dark:text-sky-400">
                        {order.poNumber}
                      </span>
                      <OrderStatusBadge status={order.status} />
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        Ref: {order.requestNumber}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <span>
                        Supplier: <strong className="text-slate-800 dark:text-slate-200">{order.supplierName}</strong>
                      </span>
                      <span>•</span>
                      <span>Initiated by: {order.createdByName}</span>
                      <span>•</span>
                      <span>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Total Purchase Value</div>
                      <div className="text-lg font-black text-slate-900 dark:text-slate-100">
                        ₹{order.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Visual Order Lifecycle Status Tracker */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3 border border-slate-100 dark:border-slate-800/80">
                  <PoStatusTracker status={order.status} />
                </div>

                {/* Collapsible Inspection Details */}
                {isExpanded && (
                  <div className="space-y-5 pt-2 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
                    {/* Line Items Table with Column Sorting */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Line Items ({order.items?.length || 0})
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          Click headers to sort line items
                        </span>
                      </div>
                      <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                        <table className="w-full text-left text-xs min-w-[460px]">
                          <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-400 font-semibold uppercase text-[10px]">
                            <tr>
                              <th
                                onClick={() => handleSortLineItem(order.id, 'productName')}
                                className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <div className="flex items-center gap-1">
                                  <span>Product Description</span>
                                  {lineSort?.key === 'productName' ? (
                                    lineSort.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-[#00639A]" /> : <ArrowDown className="w-3 h-3 text-[#00639A]" />
                                  ) : (
                                    <ArrowUpDown className="w-3 h-3 text-slate-300" />
                                  )}
                                </div>
                              </th>
                              <th
                                onClick={() => handleSortLineItem(order.id, 'quantity')}
                                className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <div className="flex items-center gap-1">
                                  <span>Qty</span>
                                  {lineSort?.key === 'quantity' ? (
                                    lineSort.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-[#00639A]" /> : <ArrowDown className="w-3 h-3 text-[#00639A]" />
                                  ) : (
                                    <ArrowUpDown className="w-3 h-3 text-slate-300" />
                                  )}
                                </div>
                              </th>
                              <th
                                onClick={() => handleSortLineItem(order.id, 'unitPrice')}
                                className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <div className="flex items-center gap-1">
                                  <span>Unit Price</span>
                                  {lineSort?.key === 'unitPrice' ? (
                                    lineSort.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-[#00639A]" /> : <ArrowDown className="w-3 h-3 text-[#00639A]" />
                                  ) : (
                                    <ArrowUpDown className="w-3 h-3 text-slate-300" />
                                  )}
                                </div>
                              </th>
                              <th
                                onClick={() => handleSortLineItem(order.id, 'totalPrice')}
                                className="p-3 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <div className="flex items-center justify-end gap-1">
                                  <span>Line Total</span>
                                  {lineSort?.key === 'totalPrice' ? (
                                    lineSort.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-[#00639A]" /> : <ArrowDown className="w-3 h-3 text-[#00639A]" />
                                  ) : (
                                    <ArrowUpDown className="w-3 h-3 text-slate-300" />
                                  )}
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {sortedItems.map((it) => (
                              <tr key={it.id}>
                                <td className="p-3 font-medium text-slate-900 dark:text-slate-100">
                                  {it.productName}{' '}
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    ({it.productCode})
                                  </span>
                                </td>
                                <td className="p-3 text-slate-700 dark:text-slate-300 font-bold">
                                  {it.quantity}
                                </td>
                                <td className="p-3 text-slate-500">
                                  ₹{it.unitPrice.toLocaleString('en-IN')}
                                </td>
                                <td className="p-3 text-right font-bold text-slate-900 dark:text-slate-100">
                                  ₹{it.totalPrice.toLocaleString('en-IN')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Financial Summary & Breakdown */}
                    <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="text-xs text-slate-500 space-y-1">
                        <div>
                          Contract Notes:{' '}
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {order.notes || 'Standard Terms & Conditions'}
                          </span>
                        </div>
                        <div>
                          Tax Category:{' '}
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            GST @ {order.taxRate}% (₹{order.taxAmount.toLocaleString('en-IN')})
                          </span>
                        </div>
                        {order.trackingNumber && (
                          <div className="flex items-center gap-1 text-[#00639A] dark:text-sky-400 font-semibold">
                            <Truck className="w-3.5 h-3.5" />
                            Carrier: {order.carrier} | Tracking: {order.trackingNumber}
                          </div>
                        )}
                      </div>

                      <div className="text-xs space-y-1 text-right min-w-[180px]">
                        <div className="flex justify-between text-slate-500">
                          <span>Subtotal:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            ₹{order.subtotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>GST (18%):</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            +₹{order.taxAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Shipping Freight:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            +₹{order.shippingCost.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between text-base font-black text-slate-900 dark:text-slate-100 pt-1.5 border-t border-slate-200 dark:border-slate-700">
                          <span>Grand Total:</span>
                          <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Multi-Level Hierarchical Approval Engine Component */}
                    <PoHierarchicalApprovalView order={order} />

                    {/* Supplier Operations Controls */}
                    {isSupplierUser && (canSupplierAccept || canSupplierDispatch) && (
                      <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-xs text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                            <Store className="w-4 h-4 text-indigo-600" />
                            Supplier Fulfillment Controls ({order.supplierName})
                          </h4>
                          <p className="text-xs text-indigo-800 dark:text-indigo-300 mt-0.5">
                            Review authorized order and dispatch logistics payload
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {canSupplierAccept && (
                            <>
                              <button
                                onClick={() => supplierRejectOrder(order.id, 'Capacity full')}
                                className="px-3 py-1.5 bg-white text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold hover:bg-rose-50 cursor-pointer"
                              >
                                Decline Order
                              </button>
                              <button
                                onClick={() => supplierAcceptOrder(order.id)}
                                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Accept Order
                              </button>
                            </>
                          )}

                          {canSupplierDispatch && (
                            <button
                              onClick={() => handleOpenDispatch(order)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Truck className="w-4 h-4" />
                              Dispatch Shipment & Generate Tracking
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Dispatch Shipment Modal */}
      {dispatchOrderObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#191C20] rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#00639A]" />
                Dispatch PO {dispatchOrderObj.poNumber}
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Shipment for {dispatchOrderObj.supplierName}. Provide logistics carrier details:
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Logistics Carrier
              </label>
              <select
                value={carrierName}
                onChange={(e) => setCarrierName(e.target.value)}
                className="w-full text-xs px-3 py-2 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                <option value="BlueDart Express">BlueDart Express (Air Logistics)</option>
                <option value="Delhivery Surface">Delhivery Surface Cargo</option>
                <option value="DTDC Premium">DTDC Premium Express</option>
                <option value="FedEx India">FedEx India Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Air Waybill / Tracking Number
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setDispatchOrderObj(null)}
                className="px-4 py-2.5 min-h-[44px] text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDispatch}
                disabled={isSubmitting}
                className="px-5 py-2.5 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50 flex items-center justify-center"
              >
                Confirm Dispatch & Handover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
