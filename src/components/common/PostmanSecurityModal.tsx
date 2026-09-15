import React, { useState } from 'react';
import { Shield, KeyRound, Lock, Download, X, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

interface PostmanSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const POSTMAN_AUTH_CREDENTIALS = {
  userId: 'Postman_Navneet440_API',
  password: 'Navneet440@postman',
};

export const PostmanSecurityModal: React.FC<PostmanSecurityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [userIdInput, setUserIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isOpen) return null;

  const handleSignInAndDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedUser = userIdInput.trim();
    const trimmedPass = passwordInput.trim();

    if (!trimmedUser || !trimmedPass) {
      setErrorMsg('Please enter both User ID and Password.');
      return;
    }

    setIsAuthenticating(true);

    // Simulate authenticating security credentials
    setTimeout(() => {
      if (
        trimmedUser === POSTMAN_AUTH_CREDENTIALS.userId &&
        trimmedPass === POSTMAN_AUTH_CREDENTIALS.password
      ) {
        setIsAuthenticated(true);
        setIsAuthenticating(false);

        // Trigger secure download of the collection
        const link = document.createElement('a');
        link.href = '/postman_collection.json';
        link.download = 'multi-handler-api.postman_collection.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (onSuccess) {
          onSuccess();
        }

        // Close modal after brief success presentation
        setTimeout(() => {
          onClose();
          setIsAuthenticated(false);
          setUserIdInput('');
          setPasswordInput('');
        }, 1600);
      } else {
        setIsAuthenticating(false);
        setErrorMsg('Invalid User ID or Password. Access denied to API collection.');
      }
    }, 500);
  };

  const handleFillDemoCredentials = () => {
    setUserIdInput(POSTMAN_AUTH_CREDENTIALS.userId);
    setPasswordInput(POSTMAN_AUTH_CREDENTIALS.password);
    setErrorMsg('');
  };

  return (
    <div
      id="postman-security-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-[#191C20] rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header with Security Badge */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight">API Security Authorization</h3>
                <p className="text-xs text-orange-100 font-mono">Restricted Access &bull; Postman v2.1.0</p>
              </div>
            </div>
            <button
              id="close-postman-security-modal"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-black/10 hover:bg-black/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {isAuthenticated ? (
            <div className="py-6 text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Authorization Verified!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Downloading <span className="font-mono font-semibold">multi-handler-api.postman_collection.json</span>...
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Enter authorized security credentials to excess and download the complete 55-endpoint Postman API collection.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSignInAndDownload} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-orange-500" />
                    <span>User ID</span>
                  </label>
                  <input
                    id="postman-user-id-input"
                    type="text"
                    value={userIdInput}
                    onChange={(e) => setUserIdInput(e.target.value)}
                    placeholder="Enter Postman User ID..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
                    autoFocus
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-orange-500" />
                    <span>Password</span>
                  </label>
                  <div className="relative">
                    <input
                      id="postman-password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter security password..."
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Quick Autofill hint for convenience */}
                <div className="p-3 rounded-xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/40 flex items-center justify-between text-[11px]">
                  <div className="text-slate-600 dark:text-slate-400">
                    <div>Authorized Account:</div>
                    <div className="font-mono font-bold text-orange-700 dark:text-orange-400">
                      {POSTMAN_AUTH_CREDENTIALS.userId}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillDemoCredentials}
                    className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-[10px] transition-colors"
                  >
                    Auto-Fill
                  </button>
                </div>

                <div className="pt-2 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    id="submit-postman-auth-btn"
                    type="submit"
                    disabled={isAuthenticating}
                    className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isAuthenticating ? 'Verifying...' : 'Sign In & Download'}</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
