import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { ShieldAlert, CheckCircle, X, ExternalLink } from 'lucide-react';
import { AppTab } from '../../types/procurement';

export const HighValueAlertBanner: React.FC = () => {
  const { highValueAlert, dismissHighValueAlert, setActiveTab } = useProcurement();

  if (!highValueAlert) return null;

  const { order, isApproved, message } = highValueAlert;

  return (
    <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white px-4 py-3 shadow-md animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            {isApproved ? (
              <CheckCircle className="w-5 h-5 text-emerald-200" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-white animate-bounce" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded text-amber-100">
                {isApproved ? 'Executive Clearance Granted' : 'Capital Expenditure Alert (> ₹1,00,000)'}
              </span>
              <span className="font-mono text-xs font-semibold">{order.poNumber}</span>
            </div>
            <p className="text-xs text-amber-50 mt-0.5 line-clamp-1">{message}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setActiveTab(AppTab.ORDERS);
              dismissHighValueAlert();
            }}
            className="px-3 py-1 bg-white text-amber-900 rounded-lg text-xs font-bold hover:bg-amber-50 transition-colors flex items-center gap-1"
          >
            <span>Inspect PO</span>
            <ExternalLink className="w-3 h-3" />
          </button>
          <button
            onClick={dismissHighValueAlert}
            className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
