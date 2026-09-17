import React from 'react';
import { ShieldAlert, Clock, LogOut, CheckCircle2 } from 'lucide-react';

interface SessionTimeoutModalProps {
  isOpen: boolean;
  remainingSeconds: number;
  onStayLoggedIn: () => void;
  onLogoutNow: () => void;
}

export const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  isOpen,
  remainingSeconds,
  onStayLoggedIn,
  onLogoutNow,
}) => {
  if (!isOpen) return null;

  const percentage = Math.max(0, Math.min(100, (remainingSeconds / 60) * 100));

  return (
    <div
      id="modal-session-timeout"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-timeout-title"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-[#191C20] rounded-3xl p-6 sm:p-7 shadow-2xl border border-rose-200 dark:border-rose-900/60 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-rose-500/20 blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center text-center space-y-4">
          {/* Animated Warning Badge */}
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800 shadow-inner">
            <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-rose-400 opacity-40" />
            <ShieldAlert className="w-8 h-8 relative z-10" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100/80 dark:bg-rose-900/40 text-[11px] font-mono font-semibold text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              <Clock className="w-3 h-3" />
              <span>Inactivity Security Trigger</span>
            </div>
            <h2
              id="session-timeout-title"
              className="text-xl sm:text-2xl font-serif font-bold text-slate-950 dark:text-slate-50"
            >
              Session Expiring Soon
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
              You have been inactive for a while. To safeguard enterprise procurement orders, approvals, and financial data, your session will automatically terminate.
            </p>
          </div>

          {/* Countdown Clock and Progress Bar */}
          <div className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="font-mono text-3xl font-black text-rose-600 dark:text-rose-400">
                {remainingSeconds}
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                seconds remaining
              </span>
            </div>

            {/* Micro Progress Bar */}
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Click &quot;Stay Logged In&quot; below to resume active workspace privileges.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              id="btn-session-logout-now"
              onClick={onLogoutNow}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out Now</span>
            </button>

            <button
              type="button"
              id="btn-stay-logged-in"
              onClick={onStayLoggedIn}
              className="w-full py-3 px-4 rounded-xl bg-[#00639A] hover:bg-[#004B76] text-white text-xs font-bold shadow-md shadow-[#00639A]/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Stay Logged In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
