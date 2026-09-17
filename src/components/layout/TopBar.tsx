import React, { useState, useEffect, useMemo } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { UserRole, AppTab } from '../../types/procurement';
import {
  Bell,
  Sun,
  Moon,
  ShieldAlert,
  Play,
  RotateCcw,
  UserCheck,
  ChevronDown,
  Building2,
  Download,
  Loader2,
  Sparkles,
  ShoppingBag,
  Info,
  LogIn,
  LogOut,
  Search,
} from 'lucide-react';
import { RoleBadge } from '../common/StatusBadges';
import { ProcureLogo } from '../common/ProcureLogo';
import { exportProjectZip, triggerBlobDownload } from '../../utils/projectZipExport';
import { GlobalSearchModal } from './GlobalSearchModal';

interface TopBarProps {
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
  onOpenWalkthrough: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenNotifications,
  onOpenAuth,
  onOpenWalkthrough,
}) => {
  const {
    currentUser,
    allUsers,
    switchUserById,
    themeMode,
    toggleTheme,
    unreadNotificationCount,
    demoLifecycleStep,
    resetDemoLifecycle,
    triggerTestHighValueAlert,
    addToast,
    setActiveTab,
    activeTab,
    isAuthenticated,
    logout,
    globalSearchOpen,
    setGlobalSearchOpen,
  } = useProcurement();

  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Platform detection for keyboard shortcut display (⌘K vs Ctrl+K)
  const isMac = useMemo(() => {
    if (typeof navigator === 'undefined') return true;
    return /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  }, []);

  // Keyboard shortcut listener for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setGlobalSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setGlobalSearchOpen]);

  const handleExportZip = async () => {
    setIsExporting(true);
    try {
      const blob = await exportProjectZip();
      triggerBlobDownload(blob, 'smart-procurement-spring-boot-postgres.zip');
      addToast('success', 'ZIP Exported', 'Spring Boot 3.3.x, Flyway & Docker package downloaded');
    } catch {
      addToast('error', 'Export Failed', 'Could not compile project ZIP');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 dark:bg-[#191C20]/95 backdrop-blur-md border-b border-[#121212]/10 dark:border-[#33363A] px-4 lg:px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => setActiveTab(AppTab.DASHBOARD)}>
          <ProcureLogo size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold tracking-tight text-[#121212] dark:text-[#E2E2E6]">
                Smart Procurement
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#F4F0E8] dark:bg-slate-800 text-[#121212] dark:text-slate-200 border border-[#121212]/10 dark:border-slate-700">
                Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 hidden sm:block">
              SOURCE • SIMPLIFY • SAVE
            </p>
          </div>
        </div>

        {/* Global Search Component Trigger (Desktop & Tablet) */}
        <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-md mx-2">
          <button
            type="button"
            id="topbar-global-search-btn"
            onClick={() => setGlobalSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500 dark:text-slate-400 text-xs transition-all shadow-2xs group cursor-pointer"
            title={`Search requests, orders, inventory items (${isMac ? '⌘K' : 'Ctrl+K'})`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors shrink-0" />
              <span className="truncate text-slate-500 dark:text-slate-400 font-medium">
                Search requests, orders, stock...
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <kbd className="inline-flex items-center font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 shadow-2xs">
                {isMac ? '⌘K' : 'Ctrl+K'}
              </kbd>
            </div>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search Button (< md) */}
          <button
            type="button"
            id="topbar-mobile-search-btn"
            onClick={() => setGlobalSearchOpen(true)}
            className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={`Quick Search (${isMac ? '⌘K' : 'Ctrl+K'})`}
            aria-label="Global Search"
          >
            <Search className="w-4 h-4" />
          </button>
          {/* Shopping Procure Store Quick Button */}
          <button
            onClick={() => setActiveTab(AppTab.SHOPPING)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === AppTab.SHOPPING
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-900 hover:bg-blue-100'
            }`}
            title="Browse Procure E-Procurement Catalog"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Procure Store</span>
          </button>

          {/* About Project & Creator Quick Button */}
          <button
            onClick={() => setActiveTab(AppTab.ABOUT)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === AppTab.ABOUT
                ? 'bg-amber-400 text-[#121212] shadow-xs'
                : 'bg-[#F4F0E8] text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
            title="About Project Architecture & Founder Profile"
          >
            <Info className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">About</span>
          </button>

          {/* 7-Stage Interactive Walkthrough Button */}
          <button
            onClick={onOpenWalkthrough}
            className="flex items-center gap-2 bg-[#121212] text-white hover:bg-slate-800 dark:bg-amber-400 dark:text-[#121212] dark:hover:bg-amber-300 rounded-xl px-3 py-1.5 text-xs font-bold shadow-xs transition-all active:scale-95"
            title="Open 7-Stage Interactive Walkthrough"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-[#121212]" />
            <span className="hidden sm:inline">7-Stage Interactive Walkthrough</span>
            <span className="sm:hidden">Walkthrough</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 dark:bg-black/20">
              {demoLifecycleStep}/7
            </span>
          </button>

          {/* Export Project ZIP */}
          <button
            onClick={handleExportZip}
            disabled={isExporting}
            className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1E2128] text-slate-800 dark:text-slate-200 hover:border-[#121212] transition-colors"
            title="Download Spring Boot 3.3.x, Flyway Migrations (26 tables) & Docker Compose"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00639A]" />
            ) : (
              <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            )}
            <span>Export ZIP</span>
          </button>

          {/* Test High Value Alert trigger */}
          <button
            onClick={() => triggerTestHighValueAlert(true)}
            className="hidden xl:flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-amber-200 dark:border-amber-900 bg-[#F4F0E8] dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100 transition-colors"
            title="Trigger executive high-value PO alert banner"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
            <span>High-Value Alert</span>
          </button>

          {/* System-Wide Theme Toggle */}
          <button
            id="theme-toggle-btn"
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all shadow-2xs group cursor-pointer active:scale-95"
            title={themeMode === 'dark' ? 'Switch to Light Mode (currently Dark)' : 'Switch to Dark Mode (currently Light)'}
            aria-label={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <div className="relative w-4 h-4 flex items-center justify-center">
              {themeMode === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300 transition-transform duration-300 group-hover:-rotate-12" />
              )}
            </div>
            <span className="text-xs font-semibold hidden md:inline capitalize">
              {themeMode === 'dark' ? 'Dark' : 'Light'}
            </span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="View In-App Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#191C20] hover:border-[#121212] transition-all text-left shadow-2xs"
            >
              <div className="w-7 h-7 rounded-lg bg-[#121212] dark:bg-white text-white dark:text-[#121212] flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {currentUser.role.replace('_', ' ')}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Persona Switcher Menu */}
            {showPersonaMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowPersonaMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#191C20] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      7 Enterprise Personas
                    </p>
                    <span className="text-[10px] text-slate-500">Click to switch</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                    {allUsers.map((u) => {
                      const isSelected = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUserById(u.id);
                            setShowPersonaMenu(false);
                          }}
                          className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                            isSelected ? 'bg-amber-50/60 dark:bg-amber-950/20' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                                isSelected
                                  ? 'bg-[#121212] text-white dark:bg-white dark:text-[#121212]'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                {u.name}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {u.department}
                              </div>
                            </div>
                          </div>
                          <RoleBadge role={u.role} />
                        </button>
                      );
                    })}
                  </div>
                  <div className="p-2 border-t border-slate-100 dark:border-slate-800 mt-1 space-y-1">
                    <button
                      onClick={() => {
                        setShowPersonaMenu(false);
                        setActiveTab(AppTab.AUTH);
                      }}
                      className="w-full py-1.5 px-3 text-xs font-semibold text-[#00639A] dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-lg flex items-center justify-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Open Dedicated Login / Register Page
                    </button>
                    <button
                      onClick={() => {
                        setShowPersonaMenu(false);
                        logout();
                      }}
                      className="w-full py-1.5 px-3 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {!isAuthenticated && (
            <button
              onClick={() => setActiveTab(AppTab.AUTH)}
              className="px-3 py-1.5 rounded-xl bg-[#00639A] hover:bg-[#004B76] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Global Search Command Palette (Cmd+K / Ctrl+K) */}
      <GlobalSearchModal
        isOpen={globalSearchOpen}
        onClose={() => setGlobalSearchOpen(false)}
      />
    </header>
  );
};
