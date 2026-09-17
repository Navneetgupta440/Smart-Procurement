import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { AppTab, Priority, Product, PurchaseOrder, PurchaseRequest } from '../../types/procurement';
import { RequestStatusBadge, OrderStatusBadge, PriorityBadge } from '../common/StatusBadges';
import {
  Search,
  X,
  FileText,
  ShoppingCart,
  Package,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Building2,
  Tag,
  Boxes,
  Truck,
  CheckCircle2,
  CornerDownLeft,
} from 'lucide-react';

type SearchCategory = 'ALL' | 'REQUESTS' | 'ORDERS' | 'INVENTORY';

interface SearchResultItem {
  id: string;
  category: 'REQUEST' | 'ORDER' | 'INVENTORY';
  title: string;
  subtitle: string;
  badgeText: string;
  secondaryText?: string;
  amountText?: string;
  statusBadge?: React.ReactNode;
  priorityBadge?: React.ReactNode;
  icon: React.ReactNode;
  targetTab: AppTab;
  filterQuery: string;
  data: PurchaseRequest | PurchaseOrder | Product;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const {
    requests,
    orders,
    products,
    navigateToEntity,
    addToast,
  } = useProcurement();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Platform detection for keyboard shortcut hint
  const isMac = useMemo(() => {
    if (typeof navigator === 'undefined') return true;
    return /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveCategory('ALL');
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Global ESC handler while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Index search entities
  const allResults = useMemo<SearchResultItem[]>(() => {
    const q = query.trim().toLowerCase();

    // 1. Purchase Requests
    const reqResults: SearchResultItem[] = requests
      .filter((r) => {
        if (!q) return true;
        const matchesNum = r.requestNumber.toLowerCase().includes(q);
        const matchesUser = r.requesterName.toLowerCase().includes(q);
        const matchesDept = r.department.toLowerCase().includes(q);
        const matchesReason = r.reason.toLowerCase().includes(q);
        const matchesStatus = r.status.toLowerCase().includes(q);
        const matchesPriority = r.priority.toLowerCase().includes(q);
        const matchesItems = r.items?.some(
          (it) =>
            it.productName.toLowerCase().includes(q) ||
            it.productCode.toLowerCase().includes(q)
        );
        return (
          matchesNum ||
          matchesUser ||
          matchesDept ||
          matchesReason ||
          matchesStatus ||
          matchesPriority ||
          matchesItems
        );
      })
      .map((r) => ({
        id: `req-${r.id}`,
        category: 'REQUEST' as const,
        title: `${r.requestNumber} • ${r.department}`,
        subtitle: r.reason || 'Procurement requisition',
        badgeText: 'Purchase Request',
        secondaryText: `Requested by ${r.requesterName}`,
        amountText: `₹${r.estimatedAmount.toLocaleString('en-IN')}`,
        statusBadge: <RequestStatusBadge status={r.status} />,
        priorityBadge: <PriorityBadge priority={r.priority} />,
        icon: <FileText className="w-4 h-4 text-blue-600 dark:text-sky-400" />,
        targetTab: AppTab.REQUESTS,
        filterQuery: r.requestNumber,
        data: r,
      }));

    // 2. Purchase Orders
    const orderResults: SearchResultItem[] = orders
      .filter((o) => {
        if (!q) return true;
        const matchesPoNum = o.poNumber.toLowerCase().includes(q);
        const matchesSupplier = o.supplierName.toLowerCase().includes(q);
        const matchesReqNum = (o.requestNumber || '').toLowerCase().includes(q);
        const matchesCreatedBy = o.createdByName.toLowerCase().includes(q);
        const matchesTracking = (o.trackingNumber || '').toLowerCase().includes(q);
        const matchesStatus = o.status.toLowerCase().includes(q);
        const matchesItems = o.items?.some(
          (it) =>
            it.productName.toLowerCase().includes(q) ||
            it.productCode.toLowerCase().includes(q)
        );
        return (
          matchesPoNum ||
          matchesSupplier ||
          matchesReqNum ||
          matchesCreatedBy ||
          matchesTracking ||
          matchesStatus ||
          matchesItems
        );
      })
      .map((o) => ({
        id: `ord-${o.id}`,
        category: 'ORDER' as const,
        title: `${o.poNumber} • ${o.supplierName}`,
        subtitle: o.trackingNumber ? `Tracking: ${o.trackingNumber} (${o.carrier || 'Logistics'})` : (o.approvalTierName || 'Standard Order'),
        badgeText: 'Purchase Order',
        secondaryText: `Created by ${o.createdByName}`,
        amountText: `₹${o.totalAmount.toLocaleString('en-IN')}`,
        statusBadge: <OrderStatusBadge status={o.status} />,
        icon: <ShoppingCart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        targetTab: AppTab.ORDERS,
        filterQuery: o.poNumber,
        data: o,
      }));

    // 3. Inventory Products
    const inventoryResults: SearchResultItem[] = products
      .filter((p) => {
        if (!q) return true;
        const matchesCode = p.productCode.toLowerCase().includes(q);
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCat = (p.categoryName || p.category || '').toLowerCase().includes(q);
        const matchesDesc = (p.description || '').toLowerCase().includes(q);
        const matchesBrand = (p.brand || '').toLowerCase().includes(q);
        return matchesCode || matchesName || matchesCat || matchesDesc || matchesBrand;
      })
      .map((p) => ({
        id: `prod-${p.id}`,
        category: 'INVENTORY' as const,
        title: `${p.productCode} • ${p.name}`,
        subtitle: p.categoryName || p.category || 'General Stock',
        badgeText: 'Warehouse Item',
        secondaryText: p.isLowStock
          ? `Deficit: ${p.availableQuantity} in stock (Min safety: ${p.minimumStock})`
          : `Available: ${p.availableQuantity} ${p.unitOfMeasure || 'units'}`,
        amountText: `₹${p.unitPrice.toLocaleString('en-IN')}/${p.unitOfMeasure || 'unit'}`,
        statusBadge: p.isLowStock ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            <AlertTriangle className="w-3 h-3" />
            <span>Low Stock</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
            <CheckCircle2 className="w-3 h-3" />
            <span>In Stock</span>
          </span>
        ),
        icon: <Package className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
        targetTab: AppTab.INVENTORY,
        filterQuery: p.productCode,
        data: p,
      }));

    return [...reqResults, ...orderResults, ...inventoryResults];
  }, [query, requests, orders, products]);

  // Filter based on selected category tab
  const filteredResults = useMemo(() => {
    if (activeCategory === 'ALL') return allResults;
    if (activeCategory === 'REQUESTS') return allResults.filter((r) => r.category === 'REQUEST');
    if (activeCategory === 'ORDERS') return allResults.filter((r) => r.category === 'ORDER');
    if (activeCategory === 'INVENTORY') return allResults.filter((r) => r.category === 'INVENTORY');
    return allResults;
  }, [allResults, activeCategory]);

  // Reset selected index when results or category change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory]);

  // Scroll selected item into view
  useEffect(() => {
    if (!resultsContainerRef.current) return;
    const selectedElem = resultsContainerRef.current.querySelector(
      `[data-result-index="${selectedIndex}"]`
    );
    if (selectedElem) {
      selectedElem.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Navigate to selected result
  const handleSelectResult = (item: SearchResultItem) => {
    navigateToEntity(item.targetTab, item.filterQuery);
    addToast(
      'info',
      `Opened ${item.badgeText}`,
      `Viewing ${item.title.split('•')[0].trim()} in ${item.targetTab}`
    );
    onClose();
  };

  // Keyboard navigation within the input / modal
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredResults.length === 0) return;
      setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredResults.length === 0) return;
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleSelectResult(filteredResults[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  // Counts for category badges
  const reqCount = allResults.filter((r) => r.category === 'REQUEST').length;
  const orderCount = allResults.filter((r) => r.category === 'ORDER').length;
  const inventoryCount = allResults.filter((r) => r.category === 'INVENTORY').length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white dark:bg-[#191C20] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[82vh] transition-all transform animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        id="global-search-command-palette"
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <Search className="w-5 h-5 text-blue-600 dark:text-sky-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            id="global-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search purchase requests, orders, inventory items, SKUs, suppliers..."
            className="w-full bg-transparent text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
            autoComplete="off"
            spellCheck="false"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0 text-slate-400 text-xs">
              <kbd className="font-mono text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 shadow-2xs">
                ESC
              </kbd>
            </div>
          )}
        </div>

        {/* Filter Category Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#191C20] overflow-x-auto text-xs no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveCategory('ALL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 cursor-pointer ${
              activeCategory === 'ALL'
                ? 'bg-[#121212] text-white dark:bg-white dark:text-[#121212]'
                : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>All Results</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20">
              {allResults.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('REQUESTS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 cursor-pointer ${
              activeCategory === 'REQUESTS'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Purchase Requests</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100">
              {reqCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('ORDERS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 cursor-pointer ${
              activeCategory === 'ORDERS'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Purchase Orders</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100">
              {orderCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('INVENTORY')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 cursor-pointer ${
              activeCategory === 'INVENTORY'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Inventory Items</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-950 dark:text-amber-100">
              {inventoryCount}
            </span>
          </button>
        </div>

        {/* Results List */}
        <div
          ref={resultsContainerRef}
          className="flex-1 overflow-y-auto p-2 sm:p-3 divide-y divide-slate-100 dark:divide-slate-800/60"
        >
          {filteredResults.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                No matching records found
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                No requisitions, purchase orders, or inventory items matched &ldquo;{query}&rdquo;. Try
                searching by PO number (e.g. PO-), Requisition (REQ-), or SKU.
              </p>
            </div>
          ) : (
            filteredResults.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  data-result-index={index}
                  onClick={() => handleSelectResult(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`group relative p-3 rounded-xl cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-slate-800/90 shadow-2xs border border-blue-200 dark:border-blue-900/80'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 transition-colors ${
                        item.category === 'REQUEST'
                          ? 'bg-blue-100/70 dark:bg-blue-950/80'
                          : item.category === 'ORDER'
                          ? 'bg-emerald-100/70 dark:bg-emerald-950/80'
                          : 'bg-amber-100/70 dark:bg-amber-950/80'
                      }`}
                    >
                      {item.icon}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold tracking-tight text-slate-900 dark:text-slate-100">
                          {item.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                            item.category === 'REQUEST'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                              : item.category === 'ORDER'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                          }`}
                        >
                          {item.badgeText}
                        </span>
                        {item.priorityBadge}
                        {item.statusBadge}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-1 font-medium">
                        {item.subtitle}
                      </p>

                      {item.secondaryText && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {item.secondaryText}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 pl-2">
                    {item.amountText && (
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">
                        {item.amountText}
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-sky-400 mt-1 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Jump</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Suggestions & Keyboard Hint Footer */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#121418] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="font-semibold text-slate-400 hidden sm:inline">Try:</span>
            <button
              type="button"
              onClick={() => setQuery('REQ-')}
              className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-colors cursor-pointer text-slate-700 dark:text-slate-300"
            >
              REQ-
            </button>
            <button
              type="button"
              onClick={() => setQuery('PO-')}
              className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-colors cursor-pointer text-slate-700 dark:text-slate-300"
            >
              PO-
            </button>
            <button
              type="button"
              onClick={() => setQuery('SRV')}
              className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 transition-colors cursor-pointer text-slate-700 dark:text-slate-300"
            >
              Servers
            </button>
            <button
              type="button"
              onClick={() => setQuery('URGENT')}
              className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-rose-400 transition-colors cursor-pointer text-slate-700 dark:text-slate-300"
            >
              Urgent
            </button>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1">
              <kbd className="font-mono text-[10px] px-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                ↑
              </kbd>
              <kbd className="font-mono text-[10px] px-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                ↓
              </kbd>
              <span className="text-[10px]">Navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="font-mono text-[10px] px-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                ↵
              </kbd>
              <span className="text-[10px]">Select</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="font-mono text-[10px] px-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {isMac ? '⌘K' : 'Ctrl+K'}
              </kbd>
              <span className="text-[10px]">Toggle</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
