import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  X,
  ShieldCheck,
  RotateCw,
  Sparkles,
} from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  onSuccessReset?: (email: string, newPassword: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialEmail = '',
  onSuccessReset,
}) => {
  const { allUsers, resetPassword, addToast } = useProcurement();

  const [step, setStep] = useState<'REQUEST' | 'VERIFY' | 'SUCCESS'>('REQUEST');
  const [email, setEmail] = useState(initialEmail || 'indianavneetgupta33@gmail.com');
  const [generatedOtp, setGeneratedOtp] = useState('739204');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendRecoveryOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMsg('Please provide your corporate work email.');
      return;
    }

    const found = allUsers.find((u) => u.email.toLowerCase() === trimmed.toLowerCase());
    if (!found) {
      setErrorMsg(`No user record found for "${trimmed}". Verify the email or select from registered demo personas.`);
      return;
    }

    setIsLoading(true);
    // Simulate generation of OTP security token
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setIsLoading(false);
      setStep('VERIFY');
      addToast(
        'info',
        'Verification Code Dispatched',
        `Recovery security code ${code} generated for ${trimmed}.`
      );
    }, 600);
  };

  const handleAutoFillOtp = () => {
    setEnteredOtp(generatedOtp);
    addToast('info', 'Code Auto-Filled', `Applied security verification token ${generatedOtp}`);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setErrorMsg('Invalid verification token. Please verify the 6-digit OTP code.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPassword(email, newPassword);
      if (res.success) {
        setStep('SUCCESS');
        if (onSuccessReset) {
          onSuccessReset(email, newPassword);
        }
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg('Failed to update credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('REQUEST');
    setErrorMsg(null);
    setNewPassword('');
    setConfirmPassword('');
    setEnteredOtp('');
    onClose();
  };

  return (
    <div
      id="modal-forgot-password"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-title"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-[#191C20] rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-[#00639A]/10 text-[#00639A] dark:text-sky-400 border border-[#00639A]/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="forgot-password-title"
                className="text-lg sm:text-xl font-serif font-bold text-slate-950 dark:text-slate-50"
              >
                Account Password Recovery
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Self-service verification and enterprise credential reset
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-forgot-modal"
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: REQUEST OTP */}
        {step === 'REQUEST' && (
          <form onSubmit={handleSendRecoveryOtp} className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Enter your registered corporate email. A one-time verification token will be generated to authenticate your identity.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  id="input-forgot-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00639A]"
                />
              </div>
            </div>

            {/* Quick Demo Accounts Pill Selector */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Or select known account:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {allUsers.slice(0, 4).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setEmail(u.email)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      email === u.email
                        ? 'bg-[#00639A] text-white border-[#00639A]'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {u.name} ({u.role})
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              id="btn-send-otp"
              disabled={isLoading}
              className="w-full py-3.5 min-h-[46px] rounded-xl bg-[#00639A] hover:bg-[#004B76] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#00639A]/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-60"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <RotateCw className="w-4 h-4 animate-spin text-sky-200" />
                  <span>Generating Verification Token...</span>
                </span>
              ) : (
                <>
                  <span>Send Recovery Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: VERIFY CODE & SET NEW PASSWORD */}
        {step === 'VERIFY' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* Demo Code Banner */}
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-2">
              <div>
                <div className="text-[11px] font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Simulated OTP Dispatched</span>
                </div>
                <div className="text-xs font-mono text-amber-800 dark:text-amber-300 mt-0.5">
                  Security Code: <strong className="text-sm font-black tracking-widest">{generatedOtp}</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAutoFillOtp}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100 hover:bg-amber-300 transition-colors cursor-pointer"
              >
                Auto-Fill Code
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                6-Digit Security Token
              </label>
              <input
                type="text"
                required
                maxLength={6}
                id="input-otp-code"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit code"
                className="w-full text-center tracking-widest font-mono text-base py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00639A]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                New Password (Minimum 8 Characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  id="input-new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Create new password"
                  className="w-full text-xs sm:text-sm pl-10 pr-10 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00639A] font-mono"
                />
                <button
                  type="button"
                  id="btn-toggle-new-pw"
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  id="input-confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full text-xs sm:text-sm pl-10 pr-10 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00639A] font-mono"
                />
                <button
                  type="button"
                  id="btn-toggle-confirm-pw"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('REQUEST')}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                id="btn-submit-reset-password"
                disabled={isLoading}
                className="flex-1 py-3 px-4 rounded-xl bg-[#00639A] hover:bg-[#004B76] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#00639A]/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <RotateCw className="w-4 h-4 animate-spin text-sky-200" />
                    <span>Updating Credentials...</span>
                  </span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Reset &amp; Save Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 'SUCCESS' && (
          <div className="text-center space-y-4 py-3 animate-in fade-in">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-slate-100">
                Password Successfully Reset!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                Your enterprise credentials have been updated and synchronized with the authorization matrix. You can now log in securely.
              </p>
            </div>

            <button
              type="button"
              id="btn-finish-recovery"
              onClick={handleClose}
              className="w-full py-3.5 px-4 rounded-xl bg-[#00639A] hover:bg-[#004B76] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Return to Sign In Screen</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
