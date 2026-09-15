import React from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { AppTab, OrderStatus, RequestStatus } from '../../types/procurement';
import {
  LayoutDashboard,
  FileSpreadsheet,
  ClipboardCheck,
  History,
  Store,
  Truck,
  Boxes,
  BarChart3,
  Award,
  Terminal,
  ShoppingBag,
  Info,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, requests, orders, deliveries, lowStockProducts } = useProcurement();

  const pendingRequestsCount = requests.filter(
    (r) => r.status === RequestStatus.PENDING_APPROVAL || r.status === RequestStatus.SUBMITTED
  ).length;

  const pendingOrdersCount = orders.filter((o) => o.status === OrderStatus.PENDING_APPROVAL).length;

  const activeDeliveriesCount = deliveries.filter(
    (d) => d.status !== 'DELIVERED' && d.status !== 'FAILED'
  ).length;

  const navItems = [
    { tab: AppTab.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { tab: AppTab.SHOPPING, label: 'Procure Store', icon: ShoppingBag },
    { tab: AppTab.REQUESTS, label: 'Requisitions', icon: FileSpreadsheet, badge: pendingRequestsCount },
    { tab: AppTab.ORDERS, label: 'Purchase Orders', icon: ClipboardCheck, badge: pendingOrdersCount },
    { tab: AppTab.HISTORY, label: 'Order History', icon: History },
    { tab: AppTab.SUPPLIERS, label: 'Suppliers', icon: Store },
    { tab: AppTab.DELIVERY, label: 'Logistics', icon: Truck, badge: activeDeliveriesCount },
    { tab: AppTab.INVENTORY, label: 'Inventory', icon: Boxes, badge: lowStockProducts.length, badgeVariant: 'warning' },
    { tab: AppTab.ANALYTICS, label: 'Analytics & Audit', icon: BarChart3 },
    { tab: AppTab.MEMBERSHIP, label: 'Plans', icon: Award },
    { tab: AppTab.API_CONSOLE, label: 'REST API', icon: Terminal },
    { tab: AppTab.ABOUT, label: 'About & Founder', icon: Info },
  ];

  return (
    <nav className="bg-white/95 dark:bg-[#191C20]/95 backdrop-blur-md border-b border-[#E2E2E6] dark:border-[#33363A] shadow-xs px-4">
      <div className="max-w-7xl mx-auto overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 sm:gap-2 py-2 min-w-max">
          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            const Icon = item.icon;

            return (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative ${
                  isActive
                    ? 'bg-[#00639A] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-white text-[#00639A]'
                        : item.badgeVariant === 'warning'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
