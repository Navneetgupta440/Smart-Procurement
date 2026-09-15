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
} from 'lucide-react';
import { OrderStatusBadge } from '../common/StatusBadges';
import { PoStatusTracker } from '../common/PoStatusTracker';
import { PoHierarchicalApprovalView } from '../common/PoHierarchicalApprovalView';

export const PurchaseOrdersScreen: React.FC = () => {
  const {
    currentUser,
    orders,
    supplierAcceptOrder,
    supplierRejectOrder,
    supplierDispatchOrder,
    advanceDeliveryStatus,
    deliveries,
  } = useProcurement();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(orders[0]?.id || null);

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
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
          Purchase Orders & Hierarchical Authorizations
        </h2>
        <p className="text-xs text-slate-500">
          Digital certificate-stamped multi-level approvals, supplier SLAs, and fulfillment
        </p>
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
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-[#00639A] text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-[#191C20] rounded-3xl p-12 text-center border border-[#E2E2E6] dark:border-[#33363A]">
            <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">
              No purchase orders found
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Convert approved purchase requisitions or adjust your search filter.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const deliveryRecord = deliveries.find((d) => d.purchaseOrderId === order.id);

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
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500"
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
                    {/* Line Items Table */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Line Items ({order.items?.length || 0})
                      </h4>
                      <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-400 font-semibold uppercase text-[10px]">
                            <tr>
                              <th className="p-3">Product Description</th>
                              <th className="p-3">Qty</th>
                              <th className="p-3">Unit Price</th>
                              <th className="p-3 text-right">Line Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {(order.items || []).map((it) => (
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
                                <td className="p-3 text-right font-semibold text-slate-900 dark:text-slate-100">
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
                                className="px-3 py-1.5 bg-white text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold hover:bg-rose-50"
                              >
                                Decline Order
                              </button>
                              <button
                                onClick={() => supplierAcceptOrder(order.id)}
                                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Accept Order
                              </button>
                            </>
                          )}

                          {canSupplierDispatch && (
                            <button
                              onClick={() => handleOpenDispatch(order)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
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
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
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
                className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setDispatchOrderObj(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDispatch}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50"
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
