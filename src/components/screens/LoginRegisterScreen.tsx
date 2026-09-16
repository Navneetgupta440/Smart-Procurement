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
  } = useProcurement();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('indianavneetgupta33@gmail.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
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
        setLoginError('Invalid credentials. Check email or use quick demo credentials below.');
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
      setRegError('Please fill in name, email, and password');
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
    <div className="max-w-5xl mx-auto py-4 sm:py-8 px-2 sm:px-4">
      {/* Brand Header Banner */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" />
          <span>Enterprise Secure Portal • 3-Tier Multi-Role Authorization Matrix</span>
        </div>
        <div className="flex items-center justify-center gap-3">
          <ProcureLogo size="lg" />
          <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-slate-950 dark:text-slate-50">
            Smart Procurement Platform
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Sign in to access your procurement dashboard, approve multi-tier purchase requisitions, track PO dispatches, and manage vendor catalogs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Auth Card (Login or Register) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#191C20] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-900/80 p-1.5 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setLoginError(null);
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                mode === 'LOGIN'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Sign In to Account
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('REGISTER');
                setRegError(null);
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                mode === 'REGISTER'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Register New Account
            </button>
          </div>

          {/* LOGIN FORM */}
          {mode === 'LOGIN' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100">
                  Welcome Back
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your credentials or pick a demo persona to enter the dashboard.
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00639A]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Demo default: password123
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs sm:text-sm pl-10 pr-10 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00639A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 min-h-[44px] rounded-xl bg-[#00639A] hover:bg-[#004B76] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {isLoggingIn ? (
                  <span>Signing In &amp; Loading Dashboard...</span>
                ) : (
                  <>
                    <span>Sign In &amp; Continue to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleInstantGuestAccess}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 underline"
                >
                  Direct Quick Launch (Skip to Admin Dashboard)
                </button>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100">
                  Create Enterprise Account
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Set up your profile, enterprise role, and department subscription.
                </p>
              </div>

              {regError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
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
                      className="w-full text-xs pl-9 pr-3 py-2 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
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
                      className="w-full text-xs pl-9 pr-3 py-2 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Choose password"
                      className="w-full text-xs pl-9 pr-9 py-2 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Phone / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Department
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      placeholder="e.g. Finance / Logistics"
                      className="w-full text-xs pl-9 pr-3 py-2 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Enterprise Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full text-xs px-3 py-2 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
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
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Membership Tier
                  </label>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                    <span className={regBillingCycle === 'MONTHLY' ? 'text-blue-600 font-bold' : ''}>Monthly</span>
                    <button
                      type="button"
                      onClick={() => setRegBillingCycle(regBillingCycle === 'MONTHLY' ? 'YEARLY' : 'MONTHLY')}
                      className="w-8 h-4 rounded-full bg-slate-300 dark:bg-slate-700 relative transition-colors"
                    >
                      <span
                        className={`block w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform ${
                          regBillingCycle === 'YEARLY' ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                    <span className={regBillingCycle === 'YEARLY' ? 'text-blue-600 font-bold' : ''}>Yearly (-20%)</span>
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
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        regPlan === p.plan
                          ? 'border-[#00639A] bg-blue-50/60 dark:bg-blue-950/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {p.price}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full py-3 min-h-[44px] rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {isRegistering ? (
                  <span>Registering &amp; Opening Dashboard...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Registration &amp; Enter Dashboard</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Side: 1-Click Persona Quick-Logins & Platform Features */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Select Personas */}
          <div className="bg-white dark:bg-[#191C20] rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  1-Click Enterprise Test Accounts
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                7 Personas
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any profile below to immediately fill the credentials and sign in:
            </p>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {allUsers.map((u) => {
                const isSelected = loginEmail.toLowerCase() === u.email.toLowerCase();
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickDemoSelect(u)}
                    className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all min-h-[44px] cursor-pointer ${
                      isSelected
                        ? 'border-[#00639A] bg-blue-50/70 dark:bg-blue-950/40 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#121212] text-white dark:bg-white dark:text-[#121212] flex items-center justify-center font-bold text-xs shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {u.name}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {u.email}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <RoleBadge role={u.role} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Platform Capability Highlights */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>What Unlocks After Sign In</span>
            </h4>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Executive Cockpit with 8 Live Procurement KPIs &amp; Alert Banners</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>3-Tier Dynamic PO Approval Hierarchy with cryptographic audit stamps</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Multi-carrier logistics milestone tracking (BlueDart, FedEx, Delhivery)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Full Postman Multi-Handler API Suite with 55 runnable test endpoints</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
