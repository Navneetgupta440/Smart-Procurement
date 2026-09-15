import React from 'react';
import { OrderStatus } from '../../types/procurement';
import { Check, Clock, Truck, Package, Store, CheckCircle2 } from 'lucide-react';

interface PoStatusTrackerProps {
  status: OrderStatus;
  isCompact?: boolean;
}

const STAGES = [
  { key: 'APPROVAL', label: 'Authorized', icon: CheckCircle2 },
  { key: 'SUPPLIER', label: 'Supplier Accepted', icon: Store },
  { key: 'DISPATCHED', label: 'Dispatched', icon: Package },
  { key: 'TRANSIT', label: 'In Transit', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: Check },
];

export const PoStatusTracker: React.FC<PoStatusTrackerProps> = ({ status, isCompact = false }) => {
  const getStageIndex = (s: OrderStatus): number => {
    switch (s) {
      case OrderStatus.PENDING_APPROVAL:
        return 0;
      case OrderStatus.APPROVED:
      case OrderStatus.SENT_TO_SUPPLIER:
        return 1;
      case OrderStatus.SUPPLIER_ACCEPTED:
        return 2;
      case OrderStatus.DISPATCHED:
        return 3;
      case OrderStatus.IN_TRANSIT:
        return 4;
      case OrderStatus.OUT_FOR_DELIVERY:
        return 4.5;
      case OrderStatus.DELIVERED:
      case OrderStatus.COMPLETED:
        return 5;
      case OrderStatus.CANCELLED:
      case OrderStatus.SUPPLIER_REJECTED:
        return -1;
      default:
        return 0;
    }
  };

  const currentIndex = getStageIndex(status);
  const isCancelled = status === OrderStatus.CANCELLED || status === OrderStatus.SUPPLIER_REJECTED;

  if (isCancelled) {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl p-3 text-xs text-rose-700 dark:text-rose-300 font-medium">
        Order processing terminated: {status === OrderStatus.CANCELLED ? 'Cancelled / Rejected' : 'Declined by Supplier'}
      </div>
    );
  }

  return (
    <div className={`w-full ${isCompact ? 'py-1' : 'py-3'}`}>
      <div className="relative flex items-center justify-between">
        {/* Progress Line */}
        <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-700 -z-0">
          <div
            className="h-full bg-[#00639A] transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, ((currentIndex - 0.5) / 4.5) * 100))}%` }}
          />
        </div>

        {STAGES.map((stage, idx) => {
          const stepNum = idx + 1;
          const isDone = currentIndex >= stepNum;
          const isCurrent = Math.floor(currentIndex) === stepNum - 1;
          const Icon = stage.icon;

          return (
            <div key={stage.key} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isDone
                    ? 'bg-[#00639A] text-white shadow-sm'
                    : isCurrent
                    ? 'bg-amber-500 text-white ring-4 ring-amber-100 dark:ring-amber-950'
                    : 'bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-300 dark:border-slate-600'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
              </div>
              {!isCompact && (
                <span
                  className={`mt-1.5 text-[11px] whitespace-nowrap font-medium ${
                    isDone
                      ? 'text-[#00639A] dark:text-blue-300 font-semibold'
                      : isCurrent
                      ? 'text-amber-600 dark:text-amber-400 font-bold'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {stage.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
