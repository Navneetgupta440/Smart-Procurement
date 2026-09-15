import React from 'react';
import { ProcurementProvider, useProcurement } from './context/ProcurementContext';
import { AppTab } from './types/procurement';
import { TopBar } from './components/layout/TopBar';
import { BottomNav } from './components/layout/BottomNav';
import { HighValueAlertBanner } from './components/layout/HighValueAlertBanner';
import { NotificationsModal } from './components/layout/NotificationsModal';
import { AuthDialog } from './components/layout/AuthDialog';
import { WalkthroughModal } from './components/modals/WalkthroughModal';

import { DashboardScreen } from './components/screens/DashboardScreen';
import { PurchaseRequestsScreen } from './components/screens/PurchaseRequestsScreen';
import { PurchaseOrdersScreen } from './components/screens/PurchaseOrdersScreen';
import { OrderHistoryScreen } from './components/screens/OrderHistoryScreen';
import { SuppliersScreen } from './components/screens/SuppliersScreen';
import { DeliveryTrackingScreen } from './components/screens/DeliveryTrackingScreen';
import { InventoryScreen } from './components/screens/InventoryScreen';
import { AnalyticsAuditScreen } from './components/screens/AnalyticsAuditScreen';
import { MembershipScreen } from './components/screens/MembershipScreen';
import { ApiConsoleScreen } from './components/screens/ApiConsoleScreen';
import { ShoppingCatalogScreen } from './components/screens/ShoppingCatalogScreen';
import { AboutScreen } from './components/screens/AboutScreen';
import { PostmanSecurityModal } from './components/common/PostmanSecurityModal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    showNotificationsModal,
    setShowNotificationsModal,
    showAuthDialog,
    setShowAuthDialog,
    showPostmanSecurityModal,
    setShowPostmanSecurityModal,
    toasts,
    removeToast,
  } = useProcurement();

  const [showWalkthroughModal, setShowWalkthroughModal] = React.useState(false);

  const renderActiveScreen = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD:
        return <DashboardScreen />;
      case AppTab.SHOPPING:
        return <ShoppingCatalogScreen />;
      case AppTab.REQUESTS:
        return <PurchaseRequestsScreen />;
      case AppTab.ORDERS:
        return <PurchaseOrdersScreen />;
      case AppTab.HISTORY:
        return <OrderHistoryScreen />;
      case AppTab.SUPPLIERS:
        return <SuppliersScreen />;
      case AppTab.DELIVERY:
        return <DeliveryTrackingScreen />;
      case AppTab.INVENTORY:
        return <InventoryScreen />;
      case AppTab.ANALYTICS:
        return <AnalyticsAuditScreen />;
      case AppTab.MEMBERSHIP:
        return <MembershipScreen />;
      case AppTab.API_CONSOLE:
        return <ApiConsoleScreen />;
      case AppTab.ABOUT:
        return <AboutScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] dark:bg-[#111318] text-[#121212] dark:text-[#E2E2E6] flex flex-col font-sans transition-colors duration-200">
      {/* Top Application Bar */}
      <TopBar
        onOpenNotifications={() => setShowNotificationsModal(true)}
        onOpenAuth={() => setShowAuthDialog(true)}
        onOpenWalkthrough={() => setShowWalkthroughModal(true)}
      />

      {/* Navigation Bar */}
      <BottomNav />

      {/* High-Value Procurement Alert Banner */}
      <HighValueAlertBanner />

      {/* Main Workspace Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {renderActiveScreen()}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#121212]/10 dark:border-[#33363A] bg-white/70 dark:bg-[#191C20]/70 py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <div>
          <strong className="text-slate-800 dark:text-slate-200 font-serif">Smart Procurement Platform</strong> — Multi-Tier Dynamic Approvals, Algorithmic Sourcing &amp; Automated Inwarding
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span>GST 18% Engine</span>
          <span>•</span>
          <span>3-Tier Authorization Matrix</span>
          <span>•</span>
          <span>SLA Tracking</span>
        </div>
      </footer>

      {/* 7-Stage Walkthrough Modal */}
      <WalkthroughModal
        isOpen={showWalkthroughModal}
        onClose={() => setShowWalkthroughModal(false)}
      />

      {/* Notifications Drawer/Modal */}
      {showNotificationsModal && (
        <NotificationsModal
          isOpen={showNotificationsModal}
          onClose={() => setShowNotificationsModal(false)}
        />
      )}

      {/* User Persona & Profile Switcher Modal */}
      {showAuthDialog && (
        <AuthDialog isOpen={showAuthDialog} onClose={() => setShowAuthDialog(false)} />
      )}

      {/* Postman API File Access & Download Security Authentication Modal */}
      {showPostmanSecurityModal && (
        <PostmanSecurityModal
          isOpen={showPostmanSecurityModal}
          onClose={() => setShowPostmanSecurityModal(false)}
        />
      )}

      {/* Floating System Toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl shadow-xl border flex items-start gap-3 backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-700/60'
                : toast.type === 'error'
                ? 'bg-rose-950/90 text-rose-100 border-rose-700/60'
                : 'bg-slate-900/90 text-slate-100 border-slate-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            )}

            <div className="flex-1">
              <div className="text-xs font-bold">{toast.title}</div>
              <div className="text-[11px] opacity-90 mt-0.5">{toast.message}</div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export function App() {
  return (
    <ProcurementProvider>
      <MainLayout />
    </ProcurementProvider>
  );
}

export default App;
