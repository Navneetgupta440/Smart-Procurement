import React, { useState } from 'react';
import { PoApprovalStepInfo, PurchaseOrder, UserRole } from '../../types/procurement';
import { PoApprovalWorkflowEngine } from '../../services/workflowEngine';
import { useProcurement } from '../../context/ProcurementContext';
import { CheckCircle2, ShieldCheck, Clock, Key, AlertTriangle, FileSignature } from 'lucide-react';

interface PoHierarchicalApprovalViewProps {
  order: PurchaseOrder;
  onSignedSuccess?: () => void;
}

export const PoHierarchicalApprovalView: React.FC<PoHierarchicalApprovalViewProps> = ({
  order,
  onSignedSuccess,
}) => {
  const { currentUser, settings, approvePurchaseOrderLevel, rejectPurchaseOrder } = useProcurement();
  const [remarks, setRemarks] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps: PoApprovalStepInfo[] = PoApprovalWorkflowEngine.parseSignatures(
    order.approvalSignaturesJson,
    order.totalAmount,
    settings
  );

  const currentLevelIndex = Math.min(order.currentApprovalLevel - 1, steps.length - 1);
  const currentStep = steps[currentLevelIndex];

  const canSign =
    order.status === 'PENDING_APPROVAL' &&
    currentStep &&
    !currentStep.isSigned &&
    PoApprovalWorkflowEngine.canUserSignCurrentLevel(order, currentUser, currentStep);

  const handleSign = async () => {
    setIsSubmitting(true);
    try {
      const res = await approvePurchaseOrderLevel(
        order.id,
        remarks || 'Approved and certified as per company authority matrix.'
      );
      if (res.success) {
        setRemarks('');
        onSignedSuccess?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await rejectPurchaseOrder(order.id, rejectReason);
      if (res.success) {
        setShowRejectBox(false);
        setRejectReason('');
        onSignedSuccess?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#00639A] dark:text-sky-400" />
          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
            Hierarchical Multi-Level Approval Chain
          </h4>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
          {order.approvalTierName}
        </span>
      </div>

      {/* Signature Steps Timeline */}
      <div className="space-y-3">
        {steps.map((step) => {
          const isCurrentActive =
            order.status === 'PENDING_APPROVAL' &&
            step.level === order.currentApprovalLevel &&
            !step.isSigned;

          return (
            <div
              key={step.level}
              className={`rounded-xl p-3.5 border transition-all ${
                step.isSigned
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                  : isCurrentActive
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 ring-2 ring-amber-200 dark:ring-amber-900/50'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                      step.isSigned
                        ? 'bg-emerald-600 text-white'
                        : isCurrentActive
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {step.isSigned ? <CheckCircle2 className="w-4 h-4" /> : `L${step.level}`}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        {step.shortRoleTitle}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        ({step.requiredRole.replace('_', ' ')})
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {step.stepDescription}
                    </p>

                    {/* Signed metadata */}
                    {step.isSigned && (
                      <div className="mt-2 text-xs space-y-1 bg-white/70 dark:bg-slate-900/60 rounded-lg p-2 border border-emerald-100 dark:border-emerald-900/30">
                        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                          <span className="font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Signed by {step.signerName} ({step.signerRole})
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {step.signedAt ? new Date(step.signedAt).toLocaleString('en-IN') : ''}
                          </span>
                        </div>
                        {step.remarks && (
                          <p className="text-slate-600 dark:text-slate-300 italic text-[11px]">
                            "{step.remarks}"
                          </p>
                        )}
                        {step.signatureCertificate && (
                          <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                            <Key className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate">Cert: {step.signatureCertificate}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status chip */}
                <div className="shrink-0">
                  {step.isSigned ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3" /> Signed
                    </span>
                  ) : isCurrentActive ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-950 px-2 py-0.5 rounded-md animate-pulse">
                      <Clock className="w-3 h-3" /> Pending Signature
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400 px-2 py-0.5">
                      Queued
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Signature Action Card */}
      {canSign && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-3.5 border-2 border-[#00639A] dark:border-sky-500 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSignature className="w-4 h-4 text-[#00639A] dark:text-sky-400" />
              <span className="font-semibold text-xs text-slate-800 dark:text-slate-100">
                Action Required: Sign Level {currentStep.level} ({currentStep.shortRoleTitle})
              </span>
            </div>
            <span className="text-xs text-slate-500">
              Logged in as: <strong className="text-slate-700 dark:text-slate-200">{currentUser.name}</strong>
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Sign-off Remarks / Authorization Notes (Optional)
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g., Budget cleared and technical specifications verified."
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#00639A]"
            />
          </div>

          {showRejectBox ? (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-900 space-y-2">
              <label className="block text-xs font-semibold text-rose-800 dark:text-rose-300">
                Reason for Rejection (Required)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="State specific non-compliance, budget overrun, or alternative specification..."
                rows={2}
                className="w-full text-xs p-2 rounded border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowRejectBox(false)}
                  className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || isSubmitting}
                  className="px-3 py-1 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowRejectBox(true)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400"
              >
                Reject Order...
              </button>
              <button
                type="button"
                onClick={handleSign}
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#00639A] hover:bg-[#004B76] text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Key className="w-3.5 h-3.5" />
                Sign Digitally with Certificate
              </button>
            </div>
          )}
        </div>
      )}

      {/* Notice if user cannot sign */}
      {!canSign && order.status === 'PENDING_APPROVAL' && (
        <div className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 p-2.5 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            Level {order.currentApprovalLevel} signature requires{' '}
            <strong className="text-slate-800 dark:text-slate-200">{currentStep?.shortRoleTitle}</strong>{' '}
            ({currentStep?.requiredRole}). Switch user persona to sign.
          </span>
        </div>
      )}
    </div>
  );
};
