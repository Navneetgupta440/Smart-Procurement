import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { MembershipPlan, UserRole, USER_ROLE_DETAILS, AppTab } from '../../types/procurement';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  Building,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Briefcase,
  Layers,
  Award,
  Zap,
  Sun,
  Moon,
  Check,
  X,
  Info,
} from 'lucide-react';
import { ProcureLogo } from '../common/ProcureLogo';
import { RoleBadge } from '../common/StatusBadges';

export const LoginRegisterScreen: React.FC = () => {
  const {
    login,
    signUp,
    allUsers,
    switchUserById,
    setActiveTab,
    setIsAuthenticated,
    themeMode,
    toggleTheme,
  } = useProcurement();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('indianavneetgupta33@gmail.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('+91 98765 43210');
  const [regDepartment, setRegDepartment] = useState('Procurement & Supply Chain');
  const [regRole, setRegRole] = useState<UserRole>(UserRole.EMPLOYEE);
  const [regPlan, setRegPlan] = useState<MembershipPlan>(MembershipPlan.STARTER);
  const [regBillingCycle, setRegBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Real-time Password Strength and Validation Rules
  const passwordRules = [
    {
      id: 'length',
      label: 'At least 8 characters',
      valid: regPassword.length >= 8,
    },
    {
      id: 'lowercase',
      label: 'One lowercase letter (a-z)',
      valid: /[a-z]/.test(regPassword),
    },
    {
      id: 'uppercase',
      label: 'One uppercase letter (A-Z)',
      valid: /[A-Z]/.test(regPassword),
    },
    {
      id: 'number',
      label: 'One numeric digit (0-9)',
      valid: /[0-9]/.test(regPassword),
    },
    {
      id: 'special',
      label: 'One special character (!@#$%^&*...)',
      valid: /[^A-Za-z0-9]/.test(regPassword),
    },
  ];

  const passedRulesCount = passwordRules.filter((r) => r.valid).length;
  const isPasswordSecure = passedRulesCount >= 4 && regPassword.length >= 8;

  // Strength score: 0 to 4
  const getPasswordStrength = () => {
    if (!regPassword) return { score: 0, label: 'Empty', color: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-400' };
    if (passedRulesCount <= 2) {
      return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400' };
    }
    if (passedRulesCount === 3) {
      return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' };
    }
    if (passedRulesCount === 4) {
      return { score: 3, label: 'Good', color: 'bg-sky-500', text: 'text-sky-600 dark:text-sky-400' };
    }
    return { score: 4, label: 'Strong & Secure', color: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' };
  };

  const strength = getPasswordStrength();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginEmail.trim()) {
      setLoginError('Please enter your work email');
      return;
    }
    setIsLoggingIn(true);
    try {
      const ok = await login(loginEmail, loginPassword);
      if (!ok) {
        setLoginError('Invalid credentials. Check email or click any 1-Click Demo Persona below.');
      }
    } catch {
      setLoginError('Failed to sign in. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError('Please complete name, email, and password.');
      return;
    }
    if (!isPasswordSecure) {
      setRegError('Password does not meet enterprise security requirements. Please satisfy at least 4 rules including minimum 8 characters.');
      return;
    }
    setIsRegistering(true);
    try {
      const ok = await signUp({
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        department: regDepartment,
        role: regRole,
        membershipPlan: regPlan,
        billingCycle: regBillingCycle,
      });
      if (!ok) {
        setRegError('An account with this email already exists.');
      }
    } catch {
      setRegError('Registration encountered an error. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleQuickDemoSelect = (user: typeof allUsers[0]) => {
    setLoginEmail(user.email);
    setLoginPassword('password123');
    setLoginError(null);
  };

  const handleInstantGuestAccess = () => {
    const admin = allUsers.find((u) => u.role === UserRole.ADMIN) || allUsers[0];
    if (admin) {
      switchUserById(admin.id);
    }
    setIsAuthenticated(true);
    try {
      localStorage.setItem('sp_is_authenticated_v2', 'true');
    } catch {}
    setActiveTab(AppTab.DASHBOARD);
  };

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] py-6 sm:py-10 px-3 sm:px-6">
      {/* Background Architectural Glow and Grid Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-gradient-to-b from-sky-400/10 via-blue-500/5 to-transparent dark:from-sky-500/10 dark:via-blue-600/5 rounded-full blur-3xl opacity-70" />
        <div className="absolute bottom-10 right-10 w-[380px] h-[380px] bg-emerald-500/5 dark:bg-emerald-500/8 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Brand Header Banner with Theme Pill */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs text-xs font-mono text-slate-700 dark:text-slate-300">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Enterprise Secure Access Portal
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-[11px] text-[#00639A] dark:text-sky-400 font-semibold">
                3-Tier RBAC Matrix
              </span>
            </div>

            {/* Quick Theme Switcher */}
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} theme`}
            >
              {themeMode === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-semibold">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                  <span className="text-[11px] font-semibold">Dark Mode</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-col items-center justify-center gap-3">
            <ProcureLogo size="lg" />
            <div>
              <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-slate-950 dark:text-slate-50">
                Smart Procurement
              </h1>
              <p className="text-xs sm:text-sm font-sans text-slate-600 dark:text-slate-400 mt-2 max-w-lg mx-auto leading-relaxed">
                Single pane of glass for multi-tier purchase requisitions, real-time supplier dispatch tracking, and automated warehouse inwarding.
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: Auth Card (Login or Register) */}
          <div className="lg:col-span-7 bg-white/95 dark:bg-[#191C20]/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/40 space-y-6">
            {/* Mode Switcher Tabs */}
            <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-900/90 p-1.5 border border-slate-200/80 dark:border-slate-800">
              <button
                type="button"
                id="tab-btn-signin"
                onClick={() => {
                  setMode('LOGIN');
                  setLoginError(null);
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  mode === 'LOGIN'
                    ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-50 shadow-sm border border-slate-200/50 dark:border-slate-700'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Sign In to Account</span>
              </button>
              <button
                type="button"
                id="tab-btn-register"
                onClick={() => {
                  setMode('REGISTER');
                  setRegError(null);
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  mode === 'REGISTER'
                    ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-50 shadow-sm border border-slate-200/50 dark:border-slate-700'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Register New Account</span>
              </button>
            </div>

            {/* LOGIN FORM */}
            {mode === 'LOGIN' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100">
                    Welcome Back
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Authenticate using your organization email or choose a 1-click test persona.
                  </p>
                </div>

                {loginError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                    <span className="font-medium">{loginError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      id="input-login-email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00639A] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      Demo key: <strong className="text-slate-800 dark:text-slate-200">password123</strong>
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      id="input-login-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs sm:text-sm pl-10 pr-10 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00639A] focus:border-transparent transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[#00639A] focus:ring-[#00639A]"
                    />
                    <span>Remember this device</span>
                  </label>
                  <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                    256-Bit SSL Encrypted
                  </span>
                </div>

                <button
                  type="submit"
                  id="btn-login-submit"
                  disabled={isLoggingIn}
                  className="w-full py-3.5 min-h-[46px] rounded-xl bg-[#00639A] hover:bg-[#004B76] text-white font-bold text-sm shadow-md shadow-[#00639A]/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-60"
                >
                  {isLoggingIn ? (
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4 animate-spin text-sky-200" />
                      <span>Authenticating &amp; Loading Cockpit...</span>
                    </span>
                  ) : (
                    <>
                      <span>Sign In &amp; Launch Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                  <span>Need an immediate overview?</span>
                  <button
                    type="button"
                    onClick={handleInstantGuestAccess}
                    className="font-bold text-[#00639A] dark:text-sky-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Direct Launch (Skip to Admin Cockpit)</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </form>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100">
                    Create Enterprise Account
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Configure your employee profile, organizational role, and workspace subscription.
                  </p>
                </div>

                {regError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                    <span className="font-medium">{regError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full text-xs pl-9 pr-3 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00639A]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Work Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="name@corp.com"
                        className="w-full text-xs pl-9 pr-3 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00639A]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        id="input-register-password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Choose a secure password"
                        className="w-full text-xs pl-9 pr-9 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00639A] font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        title={showRegPassword ? 'Hide password' : 'Show password'}
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Phone / WhatsApp
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full text-xs pl-9 pr-3 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00639A]"
                      />
                    </div>
                  </div>
                </div>

                {/* Real-time Password Strength Meter & Validation Checklist */}
                {regPassword.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3 animate-in fade-in">
                    {/* Strength Level Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Password Strength:
                        </span>
                        <span className={`text-xs font-extrabold ${strength.text}`}>
                          {strength.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        {passedRulesCount}/5 Rules Satisfied
                      </span>
                    </div>

                    {/* Visual Strength Progress Segments */}
                    <div className="grid grid-cols-4 gap-1.5 h-1.5">
                      {[1, 2, 3, 4].map((step) => {
                        const isFilled = strength.score >= step;
                        return (
                          <div
                            key={step}
                            className={`h-full rounded-full transition-all duration-300 ${
                              isFilled ? strength.color : 'bg-slate-200 dark:bg-slate-800'
                            }`}
                          />
                        );
                      })}
                    </div>

                    {/* Dynamic Rule Validation Checklist */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                      {passwordRules.map((rule) => (
                        <div
                          key={rule.id}
                          className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
                            rule.valid
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 text-[9px] ${
                              rule.valid
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                            }`}
                          >
                            {rule.valid ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                          </span>
                          <span className={rule.valid ? 'font-semibold' : ''}>{rule.label}</span>
                        </div>
                      ))}
                    </div>

                    {!isPasswordSecure && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 pt-0.5">
                        <Info className="w-3 h-3 shrink-0" />
                        <span>Enterprise policy requires at least 8 characters and 4 satisfied security criteria.</span>
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Department
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        placeholder="e.g. Finance / Logistics"
                        className="w-full text-xs pl-9 pr-3 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00639A]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Enterprise Role
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className="w-full text-xs px-3 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00639A]"
                    >
                      {Object.values(UserRole).map((r) => (
                        <option key={r} value={r}>
                          {USER_ROLE_DETAILS[r]?.displayName || r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Membership Selection */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Membership Tier
                    </label>
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                      <span className={regBillingCycle === 'MONTHLY' ? 'text-[#00639A] dark:text-sky-400 font-bold' : ''}>Monthly</span>
                      <button
                        type="button"
                        onClick={() => setRegBillingCycle(regBillingCycle === 'MONTHLY' ? 'YEARLY' : 'MONTHLY')}
                        className="w-8 h-4 rounded-full bg-slate-300 dark:bg-slate-700 relative transition-colors cursor-pointer"
                      >
                        <span
                          className={`block w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform ${
                            regBillingCycle === 'YEARLY' ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                      <span className={regBillingCycle === 'YEARLY' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>Yearly (-20%)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { plan: MembershipPlan.STARTER, name: 'Starter Essentials', price: 'Free' },
                      { plan: MembershipPlan.PROFESSIONAL, name: 'Professional Growth', price: regBillingCycle === 'YEARLY' ? '₹24,990/yr' : '₹2,499/mo' },
                      { plan: MembershipPlan.ENTERPRISE, name: 'Enterprise Scale', price: regBillingCycle === 'YEARLY' ? '₹79,990/yr' : '₹7,999/mo' },
                      { plan: MembershipPlan.SUPPLIER_PARTNER, name: 'Supplier Partner', price: regBillingCycle === 'YEARLY' ? '₹14,990/yr' : '₹1,499/mo' },
                    ].map((p) => (
                      <button
                        key={p.plan}
                        type="button"
                        onClick={() => setRegPlan(p.plan)}
                        className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                          regPlan === p.plan
                            ? 'border-[#00639A] bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-[#00639A]'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-900/30'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                          {p.price}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn-register-submit"
                  disabled={isRegistering || (regPassword.length > 0 && !isPasswordSecure)}
                  className="w-full py-3.5 min-h-[46px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRegistering ? (
                    <span>Provisioning Account &amp; Loading...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete Registration &amp; Enter Cockpit</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Side: 1-Click Persona Quick-Logins & Platform Features */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Select Personas Card */}
            <div className="bg-white/95 dark:bg-[#191C20]/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      1-Click Enterprise Personas
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Tap any profile to autofill credentials
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                  7 Roles
                </span>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {allUsers.map((u) => {
                  const isSelected = loginEmail.toLowerCase() === u.email.toLowerCase();
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickDemoSelect(u)}
                      className={`w-full p-2.5 sm:p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all min-h-[46px] cursor-pointer ${
                        isSelected
                          ? 'border-[#00639A] bg-sky-50/80 dark:bg-sky-950/40 ring-1 ring-[#00639A] shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                          {u.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {u.name}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono">
                            {u.email}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <RoleBadge role={u.role} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Platform Feature Capabilities Highlights */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Enterprise Capabilities
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                  v2.4 Production
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Executive Cockpit:</strong> 8 real-time KPI tiles, spend burn-rates, and high-value requisition alert banners.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">3-Tier Approval Flow:</strong> Automated threshold routing with SHA-256 cryptographic sign-offs.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Milestone Waybills:</strong> Live linehaul tracking across BlueDart, Delhivery, DTDC, and FedEx.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Dock Inwarding:</strong> Automated warehouse stock incrementation upon delivery sign-off.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
