import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { UserRole } from '../../types/procurement';
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
  Sliders,
} from 'lucide-react';
import { RoleBadge } from '../common/StatusBadges';

interface TopBarProps {
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenNotifications, onOpenAuth }) => {
  const {
    currentUser,
    allUsers,
    switchUserById,
    themeMode,
    toggleTheme,
    unreadNotificationCount,
    demoLifecycleStep,
    advanceDemoLifecycle,
    resetDemoLifecycle,
    triggerTestHighValueAlert,
  } = useProcurement();

  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#191C20]/95 backdrop-blur-md border-b border-[#E2E2E6] dark:border-[#33363A] px-4 lg:px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00639A] text-white flex items-center justify-center font-extrabold shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-[#191C20] dark:text-[#E2E2E6]">
                SmartProcure
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-[#00639A] dark:text-sky-300">
                Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Multi-Tier Procurement & Order Management
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Interactive Demo Lifecycle Stepper button */}
          <div className="hidden md:flex items-center gap-1 bg-[#D3E4FF]/60 dark:bg-[#004A77]/30 border border-blue-200 dark:border-blue-900 rounded-xl px-2.5 py-1 text-xs">
            <button
              onClick={() => advanceDemoLifecycle()}
              className="flex items-center gap-1.5 font-semibold text-[#001C3B] dark:text-sky-200 hover:text-[#00639A] transition-colors"
              title="Click to advance the full 7-step procurement lifecycle"
            >
              <Play className="w-3.5 h-3.5 fill-current text-[#00639A] dark:text-sky-400" />
              <span>Demo Step {demoLifecycleStep}/7</span>
            </button>
            <button
              onClick={resetDemoLifecycle}
              className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              title="Reset demo cycle"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Test High Value Alert trigger */}
          <button
            onClick={() => triggerTestHighValueAlert(true)}
            className="hidden lg:flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors"
            title="Trigger executive high-value PO alert banner"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>High-Value Alert</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
              className="flex items-center gap-2 p-1.5 sm:px-2.5 rounded-xl border border-[#E2E2E6] dark:border-[#33363A] bg-white dark:bg-[#191C20] hover:border-[#00639A] transition-all text-left shadow-xs"
            >
              <div className="w-7 h-7 rounded-lg bg-[#D3E4FF] dark:bg-[#004A77] text-[#001C3B] dark:text-sky-200 flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
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
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#191C20] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Switch Role Persona (7 Roles)
                    </p>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                    {allUsers.map((u) => {
                      const isSelected = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUserById(u.id);
                            setShowPersonaMenu(false);
                          }}
                          className={`w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                            isSelected ? 'bg-blue-50/70 dark:bg-blue-950/40' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                                isSelected
                                  ? 'bg-[#00639A] text-white'
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
                  <div className="p-2 border-t border-slate-100 dark:border-slate-800 mt-1">
                    <button
                      onClick={() => {
                        setShowPersonaMenu(false);
                        onOpenAuth();
                      }}
                      className="w-full py-1.5 px-3 text-xs font-semibold text-[#00639A] dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Account Profile & Sign Up
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
