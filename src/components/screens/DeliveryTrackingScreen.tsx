import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Delivery, DeliveryStatus, UserRole } from '../../types/procurement';
import {
  Truck,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Search,
  ArrowRight,
  Boxes,
  ShieldCheck,
} from 'lucide-react';
import { DeliveryStatusBadge } from '../common/StatusBadges';

export const DeliveryTrackingScreen: React.FC = () => {
  const { deliveries, currentUser, advanceDeliveryStatus, orders } = useProcurement();

  const [search, setSearch] = useState('');
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(
    deliveries[0]?.id || null
  );

  const filteredDeliveries = deliveries.filter(
    (d) =>
      d.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.carrier.toLowerCase().includes(search.toLowerCase())
  );

  const activeDelivery =
    deliveries.find((d) => d.id === selectedDeliveryId) || filteredDeliveries[0] || null;

  const associatedOrder = activeDelivery
    ? orders.find((o) => o.id === activeDelivery.purchaseOrderId || o.poNumber === activeDelivery.poNumber)
    : null;

  const handleAdvanceStatus = async (nextStatus: DeliveryStatus, notes?: string) => {
    if (!activeDelivery) return;
    await advanceDeliveryStatus(activeDelivery.id, nextStatus, notes);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
          Delivery Logistics & Automated Inwarding
        </h2>
        <p className="text-xs text-slate-500">
          Carrier tracking checkpoints, delivery agent dispatch, and automated stock receipting
        </p>
      </div>

      {/* Main Split View: Left List, Right Tracking Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Shipments List */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tracking #, PO, carrier..."
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#191C20] text-slate-900 dark:text-slate-100 shadow-xs"
            />
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto">
            {filteredDeliveries.map((del) => {
              const isSelected = activeDelivery?.id === del.id;
              return (
                <div
                  key={del.id}
                  onClick={() => setSelectedDeliveryId(del.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-[#00639A] dark:border-sky-500 shadow-xs'
                      : 'bg-white dark:bg-[#191C20] border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-black text-xs text-[#00639A] dark:text-sky-400">
                      {del.trackingNumber}
                    </span>
                    <DeliveryStatusBadge status={del.status} />
                  </div>

                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    PO: {del.poNumber}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Truck className="w-3 h-3 text-slate-400" />
                    <span>{del.carrier}</span>
                    <span>•</span>
                    <span>Agent: {del.deliveryAgentName}</span>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/60 p-1.5 rounded-lg truncate">
                    {del.currentCheckpoint}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Shipment Tracking Inspector */}
        <div className="lg:col-span-2 space-y-4">
          {activeDelivery ? (
            <div className="bg-white dark:bg-[#191C20] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              {/* Shipment Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-lg text-[#00639A] dark:text-sky-400">
                      {activeDelivery.trackingNumber}
                    </span>
                    <DeliveryStatusBadge status={activeDelivery.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Assigned Carrier: <strong className="text-slate-800 dark:text-slate-200">{activeDelivery.carrier}</strong> | Reference: {activeDelivery.poNumber}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Estimated Delivery Date</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {new Date(activeDelivery.estimatedDeliveryDate || Date.now()).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              {/* Delivery Agent Card */}
              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-[#00639A] dark:text-sky-300 flex items-center justify-center font-bold">
                    {activeDelivery.deliveryAgentName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {activeDelivery.deliveryAgentName}
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Assigned Field Delivery Executive
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="tel:+919833445566"
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold hover:border-[#00639A] flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call Agent</span>
                  </a>
                </div>
              </div>

              {/* Live Tracking Checkpoints Timeline */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Tracking Milestones & Chain of Custody
                </h4>
                <div className="space-y-4 relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 ml-3">
                  {(activeDelivery.checkpoints || []).map((chk, idx) => (
                    <div key={chk.id} className="relative">
                      <div
                        className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 ${
                          chk.isCompleted
                            ? 'bg-[#00639A] border-white dark:border-slate-900 ring-2 ring-blue-200'
                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600'
                        }`}
                      />
                      <div>
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold ${
                              chk.isCompleted
                                ? 'text-slate-900 dark:text-slate-100'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {chk.stageName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {chk.timestamp ? new Date(chk.timestamp).toLocaleString('en-IN') : 'Scheduled'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{chk.location}</span>
                        </p>
                        {chk.notes && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 italic bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                            "{chk.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipment Line Items Preview */}
              {associatedOrder && associatedOrder.items && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Goods In Transit ({associatedOrder.items.length} Lines)
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                    {associatedOrder.items.map((it) => (
                      <div key={it.id} className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
                        <span>
                          {it.productName} <span className="text-slate-400">({it.productCode})</span>
                        </span>
                        <span className="font-bold">Qty: {it.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Advance Action Controls */}
              {activeDelivery.status !== DeliveryStatus.DELIVERED && (
                <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#00639A] dark:text-sky-300 block">
                      Logistics Dispatch Actions
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">
                      Advance delivery checkpoint or confirm receiving dock delivery
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {activeDelivery.status === DeliveryStatus.PICKED_UP && (
                      <button
                        onClick={() => handleAdvanceStatus(DeliveryStatus.IN_TRANSIT)}
                        className="px-3 py-1.5 bg-[#00639A] hover:bg-[#004B76] text-white text-xs font-semibold rounded-xl shadow-xs"
                      >
                        Advance to In Transit
                      </button>
                    )}

                    {(activeDelivery.status === DeliveryStatus.IN_TRANSIT ||
                      activeDelivery.status === DeliveryStatus.PICKED_UP) && (
                      <button
                        onClick={() => handleAdvanceStatus(DeliveryStatus.OUT_FOR_DELIVERY)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                      >
                        Mark Out for Delivery
                      </button>
                    )}

                    <button
                      onClick={() => handleAdvanceStatus(DeliveryStatus.DELIVERED)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Delivered & Inward Inventory</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Delivered Notice */}
              {activeDelivery.status === DeliveryStatus.DELIVERED && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Boxes className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-emerald-950 dark:text-emerald-200">
                      Delivered & Automatically Inwarded to Inventory
                    </h4>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                      Delivery confirmed. Warehouse stock levels updated and `PURCHASE_RECEIPT` transaction recorded.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#191C20] rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <Truck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No shipment selected
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
