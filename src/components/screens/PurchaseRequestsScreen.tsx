import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  Priority,
  Product,
  PurchaseRequest,
  RequestStatus,
  UserRole,
} from '../../types/procurement';
import {
  PlusCircle,
  Search,
  CheckCircle2,
  XCircle,
  FileCheck,
  ArrowRight,
  Filter,
  X,
  Trash2,
  Layers,
} from 'lucide-react';
import { PriorityBadge, RequestStatusBadge } from '../common/StatusBadges';

export const PurchaseRequestsScreen: React.FC = () => {
  const {
    currentUser,
    requests,
    products,
    suppliers,
    settings,
    createPurchaseRequest,
    approvePurchaseRequest,
    rejectPurchaseRequest,
    convertRequestToPo,
  } = useProcurement();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Request Form State
  const [selectedPriority, setSelectedPriority] = useState<Priority>(Priority.MEDIUM);
  const [department, setDepartment] = useState(currentUser.department);
  const [reason, setReason] = useState('');
  const [formItems, setFormItems] = useState<{ product: Product; quantity: number }[]>([
    { product: products[0], quantity: 1 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert to PO Modal
  const [convertToPoReq, setConvertToPoReq] = useState<PurchaseRequest | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [poNotes, setPoNotes] = useState('');

  // Rejection Modal
  const [rejectReq, setRejectReq] = useState<PurchaseRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Filtering
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.requestNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.requesterName.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddItemRow = () => {
    setFormItems((prev) => [...prev, { product: products[0], quantity: 1 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    setFormItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, productId: string, quantity: number) => {
    const prod = products.find((p) => p.id === productId) || products[0];
    setFormItems((prev) =>
      prev.map((item, idx) => (idx === index ? { product: prod, quantity: Math.max(1, quantity) } : item))
    );
  };

  const formEstimatedTotal = formItems.reduce(
    (sum, item) => sum + item.product.unitPrice * item.quantity,
    0
  );

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formItems.length === 0 || !reason.trim()) return;
    setIsSubmitting(true);
    try {
      await createPurchaseRequest(selectedPriority, department, reason, formItems);
      setShowCreateModal(false);
      setReason('');
      setFormItems([{ product: products[0], quantity: 1 }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmConvert = async () => {
    if (!convertToPoReq) return;
    setIsSubmitting(true);
    try {
      await convertRequestToPo(convertToPoReq.id, selectedSupplierId, poNotes);
      setConvertToPoReq(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectReq || !rejectionReason.trim()) return;
    setIsSubmitting(true);
    try {
      await rejectPurchaseRequest(rejectReq.id, rejectionReason);
      setRejectReq(null);
      setRejectionReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
            Purchase Requisitions (PR)
          </h2>
          <p className="text-xs text-slate-500">
            Internal procurement demand capture and multi-level manager approvals
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-[#00639A] hover:bg-[#004B76] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Requisition</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#191C20] p-4 rounded-2xl border border-[#E2E2E6] dark:border-[#33363A] flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requisition #, requester, or dept..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#00639A]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {['ALL', 'PENDING_APPROVAL', 'APPROVED', 'CONVERTED_TO_PO', 'REJECTED'].map((st) => (
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

      {/* Requisitions List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white dark:bg-[#191C20] rounded-3xl p-12 text-center border border-[#E2E2E6] dark:border-[#33363A]">
            <FileCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">
              No purchase requests match your criteria
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Create a new requisition or adjust your filter filters.
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const canApprove =
              req.status === RequestStatus.PENDING_APPROVAL &&
              (currentUser.role === UserRole.APPROVING_MANAGER ||
                currentUser.role === UserRole.PROCUREMENT_MANAGER ||
                currentUser.role === UserRole.ADMIN);

            const canConvert =
              req.status === RequestStatus.APPROVED &&
              (currentUser.role === UserRole.PROCUREMENT_MANAGER ||
                currentUser.role === UserRole.ADMIN);

            return (
              <div
                key={req.id}
                className="bg-white dark:bg-[#191C20] rounded-3xl p-5 sm:p-6 border border-[#E2E2E6] dark:border-[#33363A] shadow-xs space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                {/* Top Row: Requisition #, Priority, Status, Date */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-[#00639A] dark:text-sky-400">
                        {req.requestNumber}
                      </span>
                      <PriorityBadge priority={req.priority} />
                      <RequestStatusBadge status={req.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Submitted by <strong className="text-slate-800 dark:text-slate-200">{req.requesterName}</strong> ({req.requesterRole}) | Dept: {req.department}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">Estimated Total</div>
                    <div className="text-base font-black text-slate-900 dark:text-slate-100">
                      ₹{req.estimatedAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Justification / Reason */}
                <div className="text-xs bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-500 mr-1.5">Business Justification:</span>
                  {req.reason}
                </div>

                {/* Line Items Table */}
                {req.items && req.items.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                          <th className="pb-2">Product</th>
                          <th className="pb-2">Qty</th>
                          <th className="pb-2">Unit Est. Price</th>
                          <th className="pb-2 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {req.items.map((it) => (
                          <tr key={it.id}>
                            <td className="py-2 font-medium text-slate-900 dark:text-slate-100">
                              {it.productName} <span className="text-[10px] text-slate-400 font-mono">({it.productCode})</span>
                            </td>
                            <td className="py-2 text-slate-700 dark:text-slate-300 font-bold">{it.quantity}</td>
                            <td className="py-2 text-slate-500">₹{it.estimatedUnitPrice.toLocaleString('en-IN')}</td>
                            <td className="py-2 text-right font-semibold text-slate-900 dark:text-slate-100">
                              ₹{it.estimatedTotal.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Approval Progress & Signatures */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-500">Approval Level:</span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#00639A] dark:text-sky-300 font-bold">
                      Stage {req.currentApprovalLevel} of {req.requiredApprovalLevel}
                    </span>
                    {req.approvedBy && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Signed by: {req.approvedBy}
                      </span>
                    )}
                    {req.rejectionReason && (
                      <span className="text-rose-600 dark:text-rose-400 font-medium text-[11px] flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        Rejected: {req.rejectionReason}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {canApprove && (
                      <>
                        <button
                          onClick={() => setRejectReq(req)}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() =>
                            approvePurchaseRequest(req.id, 'Budget allocation verified by department approver')
                          }
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve Level {req.currentApprovalLevel}
                        </button>
                      </>
                    )}

                    {canConvert && (
                      <button
                        onClick={() => {
                          setConvertToPoReq(req);
                          setSelectedSupplierId(suppliers[0]?.id || '');
                        }}
                        className="px-4 py-1.5 rounded-xl bg-[#00639A] hover:bg-[#004B76] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        Convert to Purchase Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Requisition Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#191C20] rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Create Purchase Requisition
                </h3>
                <p className="text-xs text-slate-500">
                  Submit items for managerial review and approval thresholds
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value as Priority)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  >
                    {Object.values(Priority).map((p) => (
                      <option key={p} value={p}>
                        {p} Priority
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Business Justification (Required)
                </label>
                <textarea
                  required
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Specify intended project, client deliverable, or operational requirement..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Line Items Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Line Items ({formItems.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs font-bold text-[#00639A] dark:text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Add Another Product
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {formItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800"
                    >
                      <select
                        value={item.product.id}
                        onChange={(e) => handleItemChange(idx, e.target.value, item.quantity)}
                        className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (₹{p.unitPrice.toLocaleString('en-IN')}/{p.unit})
                          </option>
                        ))}
                      </select>

                      <div className="w-20">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, item.product.id, parseInt(e.target.value) || 1)}
                          className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center"
                        />
                      </div>

                      <div className="w-28 text-right text-xs font-bold text-slate-900 dark:text-slate-100">
                        ₹{(item.product.unitPrice * item.quantity).toLocaleString('en-IN')}
                      </div>

                      {formItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation & Tier Preview */}
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 block">
                    Estimated Requisition Value
                  </span>
                  <span className="text-xs text-slate-400">
                    Threshold Tier:{' '}
                    {formEstimatedTotal < settings.approvalLimitManager
                      ? 'Tier 1 (Single Sign-off)'
                      : formEstimatedTotal <= settings.approvalLimitProcurementManager
                      ? 'Tier 2 (Manager + Procurement)'
                      : 'Tier 3 (Executive Multi-Level)'}
                  </span>
                </div>
                <div className="text-xl font-black text-[#00639A] dark:text-sky-300">
                  ₹{formEstimatedTotal.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || formItems.length === 0}
                  className="px-5 py-2.5 bg-[#00639A] hover:bg-[#004B76] text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50 transition-all"
                >
                  Submit Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert to PO Modal */}
      {convertToPoReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#191C20] rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Convert Requisition to Purchase Order
              </h3>
              <button onClick={() => setConvertToPoReq(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Generating Purchase Order for{' '}
              <strong className="text-slate-900 dark:text-slate-100">{convertToPoReq.requestNumber}</strong>{' '}
              (Total: ₹{convertToPoReq.estimatedAmount.toLocaleString('en-IN')}). Select preferred supplier for order transmission.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Designated Supplier
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.companyName} ({s.rating}★ | SLA: {s.onTimeDeliveryRate}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Procurement Notes / Contract Reference
              </label>
              <input
                type="text"
                value={poNotes}
                onChange={(e) => setPoNotes(e.target.value)}
                placeholder="e.g. Master Services Agreement #MSA-2026/08"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setConvertToPoReq(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmConvert}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-[#00639A] hover:bg-[#004B76] text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50"
              >
                Generate & Route PO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#191C20] rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-rose-600">
                Reject Purchase Requisition
              </h3>
              <button onClick={() => setRejectReq(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Provide formal justification for rejecting {rejectReq.requestNumber}:
            </p>

            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="State reason (budget constraint, duplicate request, wrong spec)..."
              className="w-full text-xs p-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setRejectReq(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectionReason.trim() || isSubmitting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
