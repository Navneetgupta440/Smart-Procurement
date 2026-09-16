import React, { useState, useEffect, useRef } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  Priority,
  Product,
  PurchaseRequest,
  RequestStatus,
  UserRole,
} from '../../types/procurement';
import {
  PlusCircle,
  Search,
  CheckCircle2,
  XCircle,
  FileCheck,
  ArrowRight,
  Filter,
  X,
  Trash2,
  Layers,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  LayoutList,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckSquare,
  Save,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import { PriorityBadge, RequestStatusBadge } from '../common/StatusBadges';

const PR_DRAFT_STORAGE_KEY = 'smart_procurement_pr_draft_v1';

interface PrFormDraft {
  priority: Priority;
  department: string;
  reason: string;
  items: { productId: string; quantity: number }[];
  updatedAt: number;
}

type PrSortKey =
  | 'requestNumber'
  | 'requesterName'
  | 'department'
  | 'priority'
  | 'status'
  | 'estimatedAmount'
  | 'createdAt'
  | 'currentApprovalLevel';

type SortDirection = 'asc' | 'desc';

type PrLineItemSortKey = 'productName' | 'quantity' | 'estimatedUnitPrice' | 'estimatedTotal';

const PRIORITY_ORDER: Record<Priority, number> = {
  [Priority.URGENT]: 4,
  [Priority.HIGH]: 3,
  [Priority.MEDIUM]: 2,
  [Priority.LOW]: 1,
};

export const PurchaseRequestsScreen: React.FC = () => {
  const {
    currentUser,
    requests,
    products,
    suppliers,
    settings,
    createPurchaseRequest,
    approvePurchaseRequest,
    rejectPurchaseRequest,
    convertRequestToPo,
    addToast,
  } = useProcurement();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Sorting & View States
  const [sortKey, setSortKey] = useState<PrSortKey>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const [lineItemSortMap, setLineItemSortMap] = useState<
    Record<string, { key: PrLineItemSortKey; direction: SortDirection }>
  >({});

  // New Request Form State
  const [selectedPriority, setSelectedPriority] = useState<Priority>(Priority.MEDIUM);
  const [department, setDepartment] = useState(currentUser.department);
  const [reason, setReason] = useState('');
  const [formItems, setFormItems] = useState<{ product: Product; quantity: number }[]>([
    { product: products[0], quantity: 1 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-Save as Draft State
  const [hasDraft, setHasDraft] = useState(false);
  const [draftLastSaved, setDraftLastSaved] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const isInitialDraftLoaded = useRef(false);

  // Check for existing draft on initial mount
  useEffect(() => {
    try {
      const savedDraftRaw = localStorage.getItem(PR_DRAFT_STORAGE_KEY);
      if (savedDraftRaw) {
        const parsed: PrFormDraft = JSON.parse(savedDraftRaw);
        if (parsed && (parsed.reason || (parsed.items && parsed.items.length > 0))) {
          setHasDraft(true);
          setDraftLastSaved(parsed.updatedAt || Date.now());
        }
      }
    } catch {
      // ignore JSON parse errors
    }
  }, []);

  // Restore draft into active form state
  const handleRestoreDraft = () => {
    try {
      const savedDraftRaw = localStorage.getItem(PR_DRAFT_STORAGE_KEY);
      if (!savedDraftRaw) return;
      const parsed: PrFormDraft = JSON.parse(savedDraftRaw);
      if (parsed.priority) setSelectedPriority(parsed.priority);
      if (parsed.department) setDepartment(parsed.department);
      if (parsed.reason !== undefined) setReason(parsed.reason);
      if (parsed.items && parsed.items.length > 0) {
        const restoredItems = parsed.items.map((item) => {
          const prod = products.find((p) => p.id === item.productId) || products[0];
          return { product: prod, quantity: item.quantity || 1 };
        });
        setFormItems(restoredItems);
      }
      setHasDraft(true);
      setDraftLastSaved(parsed.updatedAt || Date.now());
      addToast(
        'info',
        'Draft Restored',
        'Your saved requisition draft was successfully restored into the form.'
      );
    } catch (e) {
      console.error('Failed to restore draft', e);
    }
  };

  // Clear/Discard draft manually
  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(PR_DRAFT_STORAGE_KEY);
      setHasDraft(false);
      setDraftLastSaved(null);
      setSaveStatus('idle');
      setSelectedPriority(Priority.MEDIUM);
      setDepartment(currentUser.department);
      setReason('');
      setFormItems([{ product: products[0], quantity: 1 }]);
      addToast('info', 'Draft Discarded', 'Your saved requisition draft has been cleared.');
    } catch (e) {
      console.error('Failed to discard draft', e);
    }
  };

  // Auto-save effect: saves form whenever priority, department, reason, or formItems change
  useEffect(() => {
    // If not in create modal and no draft exists yet, don't write default empty values
    const hasMeaningfulContent =
      reason.trim().length > 0 ||
      formItems.length > 1 ||
      (formItems.length === 1 && formItems[0].quantity > 1);

    if (!hasMeaningfulContent && !hasDraft) {
      return;
    }

    setSaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        if (!hasMeaningfulContent && !reason) {
          // If content was cleared completely
          localStorage.removeItem(PR_DRAFT_STORAGE_KEY);
          setHasDraft(false);
          setDraftLastSaved(null);
          setSaveStatus('idle');
          return;
        }

        const draftData: PrFormDraft = {
          priority: selectedPriority,
          department,
          reason,
          items: formItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          updatedAt: Date.now(),
        };

        localStorage.setItem(PR_DRAFT_STORAGE_KEY, JSON.stringify(draftData));
        setHasDraft(true);
        setDraftLastSaved(draftData.updatedAt);
        setSaveStatus('saved');
      } catch (err) {
        console.error('Auto-save draft failed', err);
        setSaveStatus('idle');
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [selectedPriority, department, reason, formItems, hasDraft]);

  // Convert to PO Modal
  const [convertToPoReq, setConvertToPoReq] = useState<PurchaseRequest | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [poNotes, setPoNotes] = useState('');

  // Rejection Modal
  const [rejectReq, setRejectReq] = useState<PurchaseRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Bulk Selection & Moderation State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkApproveModal, setShowBulkApproveModal] = useState(false);
  const [bulkApproveRemarks, setBulkApproveRemarks] = useState('');
  const [showBulkRejectModal, setShowBulkRejectModal] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState('');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Filtering
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.requestNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.requesterName.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSort = (key: PrSortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection(
        key === 'estimatedAmount' || key === 'createdAt' || key === 'priority' ? 'desc' : 'asc'
      );
    }
  };

  const handleResetSort = () => {
    setSortKey('createdAt');
    setSortDirection('desc');
  };

  const handleSortLineItem = (requestId: string, key: PrLineItemSortKey) => {
    setLineItemSortMap((prev) => {
      const current = prev[requestId];
      if (current && current.key === key) {
        return {
          ...prev,
          [requestId]: {
            key,
            direction: current.direction === 'asc' ? 'desc' : 'asc',
          },
        };
      }
      return {
        ...prev,
        [requestId]: {
          key,
          direction:
            key === 'quantity' || key === 'estimatedUnitPrice' || key === 'estimatedTotal'
              ? 'desc'
              : 'asc',
        },
      };
    });
  };

  const getSortedLineItems = (req: PurchaseRequest) => {
    const items = [...(req.items || [])];
    const sortConfig = lineItemSortMap[req.id];
    if (!sortConfig) return items;

    return items.sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.key) {
        case 'productName':
          comparison = a.productName.localeCompare(b.productName);
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'estimatedUnitPrice':
          comparison = a.estimatedUnitPrice - b.estimatedUnitPrice;
          break;
        case 'estimatedTotal':
          comparison = a.estimatedTotal - b.estimatedTotal;
          break;
        default:
          comparison = 0;
      }
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  };

  // Sort filtered requests
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    let comparison = 0;
    switch (sortKey) {
      case 'requestNumber':
        comparison = a.requestNumber.localeCompare(b.requestNumber);
        break;
      case 'requesterName':
        comparison = a.requesterName.localeCompare(b.requesterName);
        break;
      case 'department':
        comparison = a.department.localeCompare(b.department);
        break;
      case 'priority':
        comparison = (PRIORITY_ORDER[a.priority] || 0) - (PRIORITY_ORDER[b.priority] || 0);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'estimatedAmount':
        comparison = a.estimatedAmount - b.estimatedAmount;
        break;
      case 'currentApprovalLevel':
        comparison = a.currentApprovalLevel - b.currentApprovalLevel;
        break;
      case 'createdAt':
        comparison = a.createdAt - b.createdAt;
        break;
      default:
        comparison = 0;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const getSortLabel = () => {
    switch (sortKey) {
      case 'requestNumber':
        return 'Requisition #';
      case 'requesterName':
        return 'Requester';
      case 'department':
        return 'Department';
      case 'priority':
        return 'Priority';
      case 'status':
        return 'Status';
      case 'estimatedAmount':
        return 'Estimated Amount';
      case 'currentApprovalLevel':
        return 'Approval Stage';
      case 'createdAt':
        return 'Date Created';
      default:
        return sortKey;
    }
  };

  const handleAddItemRow = () => {
    setFormItems((prev) => [...prev, { product: products[0], quantity: 1 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    setFormItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, productId: string, quantity: number) => {
    const prod = products.find((p) => p.id === productId) || products[0];
    setFormItems((prev) =>
      prev.map((item, idx) => (idx === index ? { product: prod, quantity: Math.max(1, quantity) } : item))
    );
  };

  const formEstimatedTotal = formItems.reduce(
    (sum, item) => sum + item.product.unitPrice * item.quantity,
    0
  );

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formItems.length === 0 || !reason.trim()) return;
    setIsSubmitting(true);
    try {
      await createPurchaseRequest(selectedPriority, department, reason, formItems);
      // Clear localStorage draft upon successful submission
      try {
        localStorage.removeItem(PR_DRAFT_STORAGE_KEY);
      } catch {
        // ignore
      }
      setHasDraft(false);
      setDraftLastSaved(null);
      setSaveStatus('idle');
      setShowCreateModal(false);
      setReason('');
      setFormItems([{ product: products[0], quantity: 1 }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmConvert = async () => {
    if (!convertToPoReq) return;
    setIsSubmitting(true);
    try {
      await convertRequestToPo(convertToPoReq.id, selectedSupplierId, poNotes);
      setConvertToPoReq(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectReq || !rejectionReason.trim()) return;
    setIsSubmitting(true);
    try {
      await rejectPurchaseRequest(rejectReq.id, rejectionReason);
      setRejectReq(null);
      setRejectionReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bulk Selection Computed Values and Handlers
  const selectedRequests = requests.filter((r) => selectedIds.includes(r.id));
  const pendingSelectedRequests = selectedRequests.filter(
    (r) => r.status === RequestStatus.PENDING_APPROVAL
  );
  const selectedTotalAmount = selectedRequests.reduce((sum, r) => sum + r.estimatedAmount, 0);

  const canUserModerate =
    currentUser.role === UserRole.APPROVING_MANAGER ||
    currentUser.role === UserRole.PROCUREMENT_MANAGER ||
    currentUser.role === UserRole.ADMIN;

  const isSelected = (id: string) => selectedIds.includes(id);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const isAllVisibleSelected =
    sortedRequests.length > 0 &&
    sortedRequests.every((r) => selectedIds.includes(r.id));

  const isSomeVisibleSelected =
    sortedRequests.some((r) => selectedIds.includes(r.id)) && !isAllVisibleSelected;

  const handleToggleSelectAllVisible = () => {
    if (isAllVisibleSelected) {
      const visibleIdSet = new Set(sortedRequests.map((r) => r.id));
      setSelectedIds((prev) => prev.filter((id) => !visibleIdSet.has(id)));
    } else {
      const visibleIds = sortedRequests.map((r) => r.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleConfirmBulkApprove = async () => {
    if (pendingSelectedRequests.length === 0) return;
    setIsBulkProcessing(true);
    try {
      let successCount = 0;
      const remarks = bulkApproveRemarks.trim() || `Bulk approved by ${currentUser.name} (${currentUser.role})`;
      for (const req of pendingSelectedRequests) {
        await approvePurchaseRequest(req.id, remarks);
        successCount++;
      }
      addToast(
        'success',
        'Bulk Approval Completed',
        `Successfully approved ${successCount} purchase requisition${successCount > 1 ? 's' : ''}.`
      );
      setSelectedIds([]);
      setShowBulkApproveModal(false);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleConfirmBulkReject = async () => {
    if (pendingSelectedRequests.length === 0 || !bulkRejectReason.trim()) return;
    setIsBulkProcessing(true);
    try {
      let successCount = 0;
      for (const req of pendingSelectedRequests) {
        await rejectPurchaseRequest(req.id, bulkRejectReason.trim());
        successCount++;
      }
      addToast(
        'info',
        'Bulk Rejection Completed',
        `Declined ${successCount} purchase requisition${successCount > 1 ? 's' : ''}.`
      );
      setSelectedIds([]);
      setShowBulkRejectModal(false);
      setBulkRejectReason('');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
            Purchase Requisitions (PR)
          </h2>
          <p className="text-xs text-slate-500">
            Internal procurement demand capture and multi-level manager approvals
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          {/* View Switcher: Table vs Cards */}
          <div className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl flex items-center border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-white dark:bg-slate-700 text-[#00639A] dark:text-sky-400 shadow-xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('CARDS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'CARDS'
                  ? 'bg-white dark:bg-slate-700 text-[#00639A] dark:text-sky-400 shadow-xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Card View</span>
            </button>
          </div>

          {/* Draft Notification Badge & Quick Restore */}
          {hasDraft && (
            <button
              type="button"
              onClick={() => {
                handleRestoreDraft();
                setShowCreateModal(true);
              }}
              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-bold text-xs rounded-xl border border-amber-200 dark:border-amber-850 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="You have an auto-saved draft. Click to restore and continue editing."
            >
              <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Resume Saved Draft</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </button>
          )}

          <button
            onClick={() => {
              if (hasDraft && !reason && formItems.length <= 1) {
                handleRestoreDraft();
              }
              setShowCreateModal(true);
            }}
            className="px-4 py-2.5 bg-[#00639A] hover:bg-[#004B76] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Requisition</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#191C20] p-4 rounded-2xl border border-[#E2E2E6] dark:border-[#33363A] flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requisition #, requester, or dept..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#00639A]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {['ALL', 'PENDING_APPROVAL', 'APPROVED', 'CONVERTED_TO_PO', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#00639A] text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Sort Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500">
        <div className="flex items-center gap-2 flex-wrap">
          <span>Showing {sortedRequests.length} purchase requisitions</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <div className="flex items-center gap-1.5 bg-blue-50/80 dark:bg-blue-950/30 text-[#00639A] dark:text-sky-300 px-2.5 py-1 rounded-lg border border-blue-200/50 dark:border-blue-900/40">
            <ArrowUpDown className="w-3 h-3" />
            <span>
              Sorted by: <strong className="font-bold">{getSortLabel()}</strong> ({sortDirection === 'asc' ? 'Ascending' : 'Descending'})
            </span>
          </div>
          {(sortKey !== 'createdAt' || sortDirection !== 'desc') && (
            <button
              type="button"
              onClick={handleResetSort}
              className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Sort</span>
            </button>
          )}

          {/* Active Selection Indicator */}
          {selectedIds.length > 0 && (
            <>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="flex items-center gap-1.5 bg-sky-50 dark:bg-sky-950/40 text-[#00639A] dark:text-sky-300 px-2 py-0.5 rounded-lg border border-sky-200 dark:border-sky-800 text-[11px] font-bold">
                <CheckSquare className="w-3 h-3" />
                <span>
                  {selectedIds.length} of {sortedRequests.length} selected
                </span>
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="ml-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                  title="Clear selection"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </>
          )}
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Click column headers to sort ascending or descending
        </span>
      </div>

      {/* Requisitions List / Table */}
      <div className="space-y-4">
        {sortedRequests.length === 0 ? (
          <div className="bg-white dark:bg-[#191C20] rounded-3xl p-12 text-center border border-[#E2E2E6] dark:border-[#33363A]">
            <FileCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">
              No purchase requests match your criteria
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Create a new requisition or adjust your search and filters.
            </p>
          </div>
        ) : viewMode === 'TABLE' ? (
          /* Interactive Data Table View */
          <div className="bg-white dark:bg-[#191C20] rounded-3xl border border-[#E2E2E6] dark:border-[#33363A] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[720px]">
                <thead className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    {/* Select All Checkbox Column */}
                    <th scope="col" className="w-10 p-3.5 text-center select-none">
                      <input
                        type="checkbox"
                        aria-label="Select all visible purchase requests"
                        checked={isAllVisibleSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isSomeVisibleSelected;
                        }}
                        onChange={handleToggleSelectAllVisible}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[#00639A] focus:ring-[#00639A] cursor-pointer"
                      />
                    </th>

                    {/* Requisition # */}
                    <th
                      scope="col"
                      onClick={() => handleSort('requestNumber')}
                      className={`p-3.5 select-none cursor-pointer transition-colors group font-semibold uppercase text-[10px] tracking-wider ${
                        sortKey === 'requestNumber'
                          ? 'text-[#00639A] dark:text-sky-400 bg-blue-50/70 dark:bg-blue-950/30'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>PR #</span>
                        {sortKey === 'requestNumber' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" /> : <ArrowDown className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>

                    {/* Requester */}
                    <th
                      scope="col"
                      onClick={() => handleSort('requesterName')}
                      className={`p-3.5 select-none cursor-pointer transition-colors group font-semibold uppercase text-[10px] tracking-wider ${
                        sortKey === 'requesterName'
                          ? 'text-[#00639A] dark:text-sky-400 bg-blue-50/70 dark:bg-blue-950/30'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Requester</span>
                        {sortKey === 'requesterName' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" /> : <ArrowDown className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>

                    {/* Department */}
                    <th
                      scope="col"
                      onClick={() => handleSort('department')}
                      className={`p-3.5 select-none cursor-pointer transition-colors group font-semibold uppercase text-[10px] tracking-wider ${
                        sortKey === 'department'
                          ? 'text-[#00639A] dark:text-sky-400 bg-blue-50/70 dark:bg-blue-950/30'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Department</span>
                        {sortKey === 'department' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" /> : <ArrowDown className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>

                    {/* Priority */}
                    <th
                      scope="col"
                      onClick={() => handleSort('priority')}
                      className={`p-3.5 select-none cursor-pointer transition-colors group font-semibold uppercase text-[10px] tracking-wider ${
                        sortKey === 'priority'
                          ? 'text-[#00639A] dark:text-sky-400 bg-blue-50/70 dark:bg-blue-950/30'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Priority</span>
                        {sortKey === 'priority' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" /> : <ArrowDown className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>

                    {/* Status */}
                    <th
                      scope="col"
                      onClick={() => handleSort('status')}
                      className={`p-3.5 select-none cursor-pointer transition-colors group font-semibold uppercase text-[10px] tracking-wider ${
                        sortKey === 'status'
                          ? 'text-[#00639A] dark:text-sky-400 bg-blue-50/70 dark:bg-blue-950/30'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Status</span>
                        {sortKey === 'status' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" /> : <ArrowDown className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>

                    {/* Estimated Total */}
                    <th
                      scope="col"
                      onClick={() => handleSort('estimatedAmount')}
                      className={`p-3.5 text-right select-none cursor-pointer transition-colors group font-semibold uppercase text-[10px] tracking-wider ${
                        sortKey === 'estimatedAmount'
                          ? 'text-[#00639A] dark:text-sky-400 bg-blue-50/70 dark:bg-blue-950/30'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Est. Total (₹)</span>
                        {sortKey === 'estimatedAmount' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" /> : <ArrowDown className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>

                    {/* Approval Stage */}
                    <th
                      scope="col"
                      onClick={() => handleSort('currentApprovalLevel')}
                      className={`p-3.5 select-none cursor-pointer transition-colors group font-semibold uppercase text-[10px] tracking-wider ${
                        sortKey === 'currentApprovalLevel'
                          ? 'text-[#00639A] dark:text-sky-400 bg-blue-50/70 dark:bg-blue-950/30'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Stage</span>
                        {sortKey === 'currentApprovalLevel' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" /> : <ArrowDown className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>

                    {/* Date Created */}
                    <th
                      scope="col"
                      onClick={() => handleSort('createdAt')}
                      className={`p-3.5 select-none cursor-pointer transition-colors group font-semibold uppercase text-[10px] tracking-wider ${
                        sortKey === 'createdAt'
                          ? 'text-[#00639A] dark:text-sky-400 bg-blue-50/70 dark:bg-blue-950/30'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Date</span>
                        {sortKey === 'createdAt' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" /> : <ArrowDown className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </th>

                    {/* Expand Trigger */}
                    <th className="p-3.5 text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Inspect
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {sortedRequests.map((req) => {
                    const isExpanded = expandedRequestId === req.id;
                    const isRowSelected = isSelected(req.id);
                    const sortedItems = getSortedLineItems(req);
                    const lineSort = lineItemSortMap[req.id];

                    const canApprove =
                      req.status === RequestStatus.PENDING_APPROVAL &&
                      (currentUser.role === UserRole.APPROVING_MANAGER ||
                        currentUser.role === UserRole.PROCUREMENT_MANAGER ||
                        currentUser.role === UserRole.ADMIN);

                    const canConvert =
                      req.status === RequestStatus.APPROVED &&
                      (currentUser.role === UserRole.PROCUREMENT_MANAGER ||
                        currentUser.role === UserRole.ADMIN);

                    return (
                      <React.Fragment key={req.id}>
                        <tr
                          onClick={() => setExpandedRequestId(isExpanded ? null : req.id)}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${
                            isRowSelected
                              ? 'bg-blue-50/70 dark:bg-blue-950/35'
                              : isExpanded
                              ? 'bg-blue-50/20 dark:bg-blue-950/15'
                              : ''
                          }`}
                        >
                          {/* Row Checkbox */}
                          <td
                            className="p-3.5 text-center select-none"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              aria-label={`Select requisition ${req.requestNumber}`}
                              checked={isRowSelected}
                              onChange={() => handleToggleSelect(req.id)}
                              className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[#00639A] focus:ring-[#00639A] cursor-pointer"
                            />
                          </td>

                          {/* PR # */}
                          <td className="p-3.5 font-mono font-black text-[#00639A] dark:text-sky-400 whitespace-nowrap">
                            {req.requestNumber}
                          </td>

                          {/* Requester */}
                          <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200 max-w-[160px] truncate">
                            {req.requesterName}
                          </td>

                          {/* Department */}
                          <td className="p-3.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                              {req.department}
                            </span>
                          </td>

                          {/* Priority */}
                          <td className="p-3.5 whitespace-nowrap">
                            <PriorityBadge priority={req.priority} />
                          </td>

                          {/* Status */}
                          <td className="p-3.5 whitespace-nowrap">
                            <RequestStatusBadge status={req.status} />
                          </td>

                          {/* Estimated Amount */}
                          <td className="p-3.5 text-right font-mono font-black text-slate-900 dark:text-slate-100 whitespace-nowrap">
                            ₹{req.estimatedAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </td>

                          {/* Approval Stage */}
                          <td className="p-3.5 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#00639A] dark:text-sky-300 font-bold text-[11px]">
                              Stage {req.currentApprovalLevel}/{req.requiredApprovalLevel}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="p-3.5 whitespace-nowrap text-slate-500">
                            {new Date(req.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>

                          {/* Expand Trigger */}
                          <td className="p-3.5 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedRequestId(isExpanded ? null : req.id);
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
                              title={isExpanded ? 'Collapse' : 'Expand requisition details'}
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Details Row */}
                        {isExpanded && (
                          <tr className="bg-slate-50/40 dark:bg-slate-900/30">
                            <td colSpan={10} className="p-5 border-t border-b border-slate-200 dark:border-slate-800">
                              <div className="space-y-4 max-w-5xl mx-auto">
                                {/* Business Justification */}
                                <div className="text-xs bg-white dark:bg-[#191C20] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                                  <span className="font-bold text-slate-500 mr-1.5">Business Justification:</span>
                                  {req.reason}
                                </div>

                                {/* Line Items Table with Column Sorting */}
                                <div className="bg-white dark:bg-[#191C20] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                      Requested Products & Specifications ({req.items?.length || 0})
                                    </h4>
                                    <span className="text-[10px] text-slate-400">
                                      Click column headers to sort line items
                                    </span>
                                  </div>

                                  <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                                    <table className="w-full text-left text-xs min-w-[460px]">
                                      <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-400 font-semibold uppercase text-[10px]">
                                        <tr>
                                          <th
                                            onClick={() => handleSortLineItem(req.id, 'productName')}
                                            className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                          >
                                            <div className="flex items-center gap-1">
                                              <span>Product Description</span>
                                              {lineSort?.key === 'productName' ? (
                                                lineSort.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-[#00639A]" /> : <ArrowDown className="w-3 h-3 text-[#00639A]" />
                                              ) : (
                                                <ArrowUpDown className="w-3 h-3 text-slate-300" />
                                              )}
                                            </div>
                                          </th>
                                          <th
                                            onClick={() => handleSortLineItem(req.id, 'quantity')}
                                            className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                          >
                                            <div className="flex items-center gap-1">
                                              <span>Qty</span>
                                              {lineSort?.key === 'quantity' ? (
                                                lineSort.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-[#00639A]" /> : <ArrowDown className="w-3 h-3 text-[#00639A]" />
                                              ) : (
                                                <ArrowUpDown className="w-3 h-3 text-slate-300" />
                                              )}
                                            </div>
                                          </th>
                                          <th
                                            onClick={() => handleSortLineItem(req.id, 'estimatedUnitPrice')}
                                            className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                          >
                                            <div className="flex items-center gap-1">
                                              <span>Unit Est. Price</span>
                                              {lineSort?.key === 'estimatedUnitPrice' ? (
                                                lineSort.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-[#00639A]" /> : <ArrowDown className="w-3 h-3 text-[#00639A]" />
                                              ) : (
                                                <ArrowUpDown className="w-3 h-3 text-slate-300" />
                                              )}
                                            </div>
                                          </th>
                                          <th
                                            onClick={() => handleSortLineItem(req.id, 'estimatedTotal')}
                                            className="p-3 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                          >
                                            <div className="flex items-center justify-end gap-1">
                                              <span>Subtotal</span>
                                              {lineSort?.key === 'estimatedTotal' ? (
                                                lineSort.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-[#00639A]" /> : <ArrowDown className="w-3 h-3 text-[#00639A]" />
                                              ) : (
                                                <ArrowUpDown className="w-3 h-3 text-slate-300" />
                                              )}
                                            </div>
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                        {sortedItems.map((it) => (
                                          <tr key={it.id}>
                                            <td className="p-3 font-medium text-slate-900 dark:text-slate-100">
                                              {it.productName}{' '}
                                              <span className="text-[10px] text-slate-400 font-mono">
                                                ({it.productCode})
                                              </span>
                                            </td>
                                            <td className="p-3 text-slate-700 dark:text-slate-300 font-bold">
                                              {it.quantity}
                                            </td>
                                            <td className="p-3 text-slate-500">
                                              ₹{it.estimatedUnitPrice.toLocaleString('en-IN')}
                                            </td>
                                            <td className="p-3 text-right font-bold text-slate-900 dark:text-slate-100">
                                              ₹{it.estimatedTotal.toLocaleString('en-IN')}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>

                                {/* Approval Metadata and Action Controls */}
                                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="font-semibold text-slate-500">Approval Level:</span>
                                    <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#00639A] dark:text-sky-300 font-bold">
                                      Stage {req.currentApprovalLevel} of {req.requiredApprovalLevel}
                                    </span>
                                    {req.approvedBy && (
                                      <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px] flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Signed by: {req.approvedBy}
                                      </span>
                                    )}
                                    {req.rejectionReason && (
                                      <span className="text-rose-600 dark:text-rose-400 font-medium text-[11px] flex items-center gap-1">
                                        <XCircle className="w-3.5 h-3.5" />
                                        Rejected: {req.rejectionReason}
                                      </span>
                                    )}
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-2">
                                    {canApprove && (
                                      <>
                                        <button
                                          onClick={() => setRejectReq(req)}
                                          className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                                        >
                                          Reject
                                        </button>
                                        <button
                                          onClick={() =>
                                            approvePurchaseRequest(req.id, 'Budget allocation verified by department approver')
                                          }
                                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                                        >
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                          Approve Level {req.currentApprovalLevel}
                                        </button>
                                      </>
                                    )}

                                    {canConvert && (
                                      <button
                                        onClick={() => {
                                          setConvertToPoReq(req);
                                          setSelectedSupplierId(suppliers[0]?.id || '');
                                        }}
                                        className="px-4 py-1.5 rounded-xl bg-[#00639A] hover:bg-[#004B76] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                                      >
                                        <FileCheck className="w-3.5 h-3.5" />
                                        Convert to Purchase Order
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Cards View (strictly respecting sortedRequests) */
          sortedRequests.map((req) => {
            const isCardSelected = isSelected(req.id);
            const sortedItems = getSortedLineItems(req);
            const lineSort = lineItemSortMap[req.id];

            const canApprove =
              req.status === RequestStatus.PENDING_APPROVAL &&
              (currentUser.role === UserRole.APPROVING_MANAGER ||
                currentUser.role === UserRole.PROCUREMENT_MANAGER ||
                currentUser.role === UserRole.ADMIN);

            const canConvert =
              req.status === RequestStatus.APPROVED &&
              (currentUser.role === UserRole.PROCUREMENT_MANAGER ||
                currentUser.role === UserRole.ADMIN);

            return (
              <div
                key={req.id}
                className={`bg-white dark:bg-[#191C20] rounded-3xl p-5 sm:p-6 border shadow-xs space-y-4 transition-all ${
                  isCardSelected
                    ? 'border-[#00639A] ring-1 ring-[#00639A]/40 bg-blue-50/15 dark:bg-blue-950/20'
                    : 'border-[#E2E2E6] dark:border-[#33363A] hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Top Row: Requisition #, Priority, Status, Date */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      aria-label={`Select requisition ${req.requestNumber}`}
                      checked={isCardSelected}
                      onChange={() => handleToggleSelect(req.id)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[#00639A] focus:ring-[#00639A] cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-[#00639A] dark:text-sky-400">
                          {req.requestNumber}
                        </span>
                        <PriorityBadge priority={req.priority} />
                        <RequestStatusBadge status={req.status} />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Submitted by <strong className="text-slate-800 dark:text-slate-200">{req.requesterName}</strong> ({req.requesterRole}) | Dept: {req.department}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">Estimated Total</div>
                    <div className="text-base font-black text-slate-900 dark:text-slate-100">
                      ₹{req.estimatedAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Justification / Reason */}
                <div className="text-xs bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-500 mr-1.5">Business Justification:</span>
                  {req.reason}
                </div>

                {/* Line Items Table with Interactive Column Sorting */}
                {req.items && req.items.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Products ({req.items.length})</span>
                      <span>Click headers to sort</span>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <table className="w-full text-left text-xs min-w-[460px]">
                        <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 uppercase font-semibold text-[10px]">
                          <tr>
                            <th
                              onClick={() => handleSortLineItem(req.id, 'productName')}
                              className="p-2.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <div className="flex items-center gap-1">
                                <span>Product</span>
                                {lineSort?.key === 'productName' ? (
                                  lineSort.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-[#00639A]" /> : <ArrowDown className="w-3 h-3 text-[#00639A]" />
                                ) : (
                                  <ArrowUpDown className="w-3 h-3 text-slate-300" />
                                )}
                              </div>
                            </th>
                            <th
                              onClick={() => handleSortLineItem(req.id, 'quantity')}
                              className="p-2.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <div className="flex items-center gap-1">
                                <span>Qty</span>
                                {lineSort?.key === 'quantity' ? (
                                  lineSort.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-[#00639A]" /> : <ArrowDown className="w-3 h-3 text-[#00639A]" />
                                ) : (
                                  <ArrowUpDown className="w-3 h-3 text-slate-300" />
                                )}
                              </div>
                            </th>
                            <th
                              onClick={() => handleSortLineItem(req.id, 'estimatedUnitPrice')}
                              className="p-2.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <div className="flex items-center gap-1">
                                <span>Unit Est. Price</span>
                                {lineSort?.key === 'estimatedUnitPrice' ? (
                                  lineSort.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-[#00639A]" /> : <ArrowDown className="w-3 h-3 text-[#00639A]" />
                                ) : (
                                  <ArrowUpDown className="w-3 h-3 text-slate-300" />
                                )}
                              </div>
                            </th>
                            <th
                              onClick={() => handleSortLineItem(req.id, 'estimatedTotal')}
                              className="p-2.5 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <div className="flex items-center justify-end gap-1">
                                <span>Subtotal</span>
                                {lineSort?.key === 'estimatedTotal' ? (
                                  lineSort.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-[#00639A]" /> : <ArrowDown className="w-3 h-3 text-[#00639A]" />
                                ) : (
                                  <ArrowUpDown className="w-3 h-3 text-slate-300" />
                                )}
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                          {sortedItems.map((it) => (
                            <tr key={it.id}>
                              <td className="p-2.5 font-medium text-slate-900 dark:text-slate-100">
                                {it.productName} <span className="text-[10px] text-slate-400 font-mono">({it.productCode})</span>
                              </td>
                              <td className="p-2.5 text-slate-700 dark:text-slate-300 font-bold">{it.quantity}</td>
                              <td className="p-2.5 text-slate-500">₹{it.estimatedUnitPrice.toLocaleString('en-IN')}</td>
                              <td className="p-2.5 text-right font-semibold text-slate-900 dark:text-slate-100">
                                ₹{it.estimatedTotal.toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Approval Progress & Signatures */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-500">Approval Level:</span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#00639A] dark:text-sky-300 font-bold">
                      Stage {req.currentApprovalLevel} of {req.requiredApprovalLevel}
                    </span>
                    {req.approvedBy && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Signed by: {req.approvedBy}
                      </span>
                    )}
                    {req.rejectionReason && (
                      <span className="text-rose-600 dark:text-rose-400 font-medium text-[11px] flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        Rejected: {req.rejectionReason}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {canApprove && (
                      <>
                        <button
                          onClick={() => setRejectReq(req)}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() =>
                            approvePurchaseRequest(req.id, 'Budget allocation verified by department approver')
                          }
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve Level {req.currentApprovalLevel}
                        </button>
                      </>
                    )}

                    {canConvert && (
                      <button
                        onClick={() => {
                          setConvertToPoReq(req);
                          setSelectedSupplierId(suppliers[0]?.id || '');
                        }}
                        className="px-4 py-1.5 rounded-xl bg-[#00639A] hover:bg-[#004B76] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        Convert to Purchase Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Requisition Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#191C20] rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-[#00639A] dark:text-sky-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      Create Purchase Requisition
                    </h3>
                    {/* Real-time auto-save indicator badge */}
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                      {saveStatus === 'saving' ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-[#00639A]" />
                          <span>Auto-saving draft...</span>
                        </>
                      ) : hasDraft ? (
                        <>
                          <Save className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                            Draft saved
                          </span>
                          {draftLastSaved && (
                            <span className="text-slate-400 dark:text-slate-500 text-[10px] hidden sm:inline">
                              ({new Date(draftLastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-400">Auto-save ready</span>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Draft is automatically preserved locally in case you navigate away
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Close modal (draft stays saved)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* In-Modal Draft Notification & Actions */}
            {hasDraft && draftLastSaved && (
              <div className="px-5 py-2.5 bg-blue-50/70 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00639A] dark:text-sky-400" />
                  <span>
                    Auto-saved draft from{' '}
                    <strong>{new Date(draftLastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong>{' '}
                    is active.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRestoreDraft}
                    className="text-[11px] font-bold text-[#00639A] dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    Reload Draft
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <button
                    type="button"
                    onClick={handleDiscardDraft}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                  >
                    Discard Draft
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitRequest} className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value as Priority)}
                    className="w-full text-xs px-3 py-2 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  >
                    {Object.values(Priority).map((p) => (
                      <option key={p} value={p}>
                        {p} Priority
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-xs px-3 py-2 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Business Justification (Required)
                </label>
                <textarea
                  required
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Specify intended project, client deliverable, or operational requirement..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-[44px]"
                />
              </div>

              {/* Line Items Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Line Items ({formItems.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs font-bold text-[#00639A] dark:text-sky-400 hover:underline flex items-center gap-1 min-h-[44px] sm:min-h-0"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Add Another Product
                  </button>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto">
                  {formItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800"
                    >
                      <div className="flex-1 min-w-0">
                        <select
                          value={item.product.id}
                          onChange={(e) => handleItemChange(idx, e.target.value, item.quantity)}
                          className="w-full text-xs px-2.5 py-2 min-h-[44px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (₹{p.unitPrice.toLocaleString('en-IN')}/{p.unit})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-slate-500">Qty:</span>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, item.product.id, parseInt(e.target.value) || 1)}
                            className="w-16 text-xs px-2 py-2 min-h-[44px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-bold"
                          />
                        </div>

                        <div className="w-24 text-right text-xs font-bold text-slate-900 dark:text-slate-100">
                          ₹{(item.product.unitPrice * item.quantity).toLocaleString('en-IN')}
                        </div>

                        {formItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="text-slate-400 hover:text-rose-600 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
                            title="Remove line item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation & Tier Preview */}
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 block">
                    Estimated Requisition Value
                  </span>
                  <span className="text-xs text-slate-400">
                    Threshold Tier:{' '}
                    {formEstimatedTotal < settings.approvalLimitManager
                      ? 'Tier 1 (Single Sign-off)'
                      : formEstimatedTotal <= settings.approvalLimitProcurementManager
                      ? 'Tier 2 (Manager + Procurement)'
                      : 'Tier 3 (Executive Multi-Level)'}
                  </span>
                </div>
                <div className="text-xl font-black text-[#00639A] dark:text-sky-300">
                  ₹{formEstimatedTotal.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  {hasDraft && (
                    <button
                      type="button"
                      onClick={handleDiscardDraft}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 p-1 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Discard Draft</span>
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
                    title="Close and keep your draft saved in localStorage"
                  >
                    Close & Keep Draft
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || formItems.length === 0}
                    className="px-5 py-2.5 bg-[#00639A] hover:bg-[#004B76] text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Submit Requisition</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert to PO Modal */}
      {convertToPoReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#191C20] rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Convert Requisition to Purchase Order
              </h3>
              <button onClick={() => setConvertToPoReq(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Generating Purchase Order for{' '}
              <strong className="text-slate-900 dark:text-slate-100">{convertToPoReq.requestNumber}</strong>{' '}
              (Total: ₹{convertToPoReq.estimatedAmount.toLocaleString('en-IN')}). Select preferred supplier for order transmission.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Designated Supplier
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.companyName} ({s.rating}★ | SLA: {s.onTimeDeliveryRate}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Procurement Notes / Contract Reference
              </label>
              <input
                type="text"
                value={poNotes}
                onChange={(e) => setPoNotes(e.target.value)}
                placeholder="e.g. Master Services Agreement #MSA-2026/08"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setConvertToPoReq(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmConvert}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-[#00639A] hover:bg-[#004B76] text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50"
              >
                Generate & Route PO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#191C20] rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-rose-600">
                Reject Purchase Requisition
              </h3>
              <button onClick={() => setRejectReq(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Provide formal justification for rejecting {rejectReq.requestNumber}:
            </p>

            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="State reason (budget constraint, duplicate request, wrong spec)..."
              className="w-full text-xs p-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setRejectReq(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectionReason.trim() || isSubmitting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Selection & Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div
          id="bulk-actions-toolbar"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-3xl animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          <div className="bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white p-3.5 sm:px-5 sm:py-3.5 rounded-2xl shadow-2xl border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            {/* Left: Info */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#00639A] text-white text-xs font-black shadow-xs">
                  {selectedIds.length}
                </span>
                <div className="text-xs">
                  <span className="font-bold text-white">
                    {selectedIds.length} Requisition{selectedIds.length > 1 ? 's' : ''} Selected
                  </span>
                  <span className="text-slate-300 text-[11px] ml-2 hidden sm:inline">
                    (Est. Value:{' '}
                    <strong className="text-white font-mono font-bold">
                      ₹{selectedTotalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </strong>
                    )
                  </span>
                </div>
              </div>

              {pendingSelectedRequests.length > 0 ? (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-semibold">
                  {pendingSelectedRequests.length} pending
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 text-[11px]">
                  0 pending approval
                </span>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
              {canUserModerate ? (
                <>
                  <button
                    type="button"
                    id="btn-bulk-approve"
                    disabled={pendingSelectedRequests.length === 0}
                    onClick={() => {
                      setBulkApproveRemarks(
                        `Bulk approved by ${currentUser.name} (${currentUser.role})`
                      );
                      setShowBulkApproveModal(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                    title={
                      pendingSelectedRequests.length === 0
                        ? 'No pending requisitions in selection'
                        : `Approve ${pendingSelectedRequests.length} pending requisitions`
                    }
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>Bulk Approve ({pendingSelectedRequests.length})</span>
                  </button>

                  <button
                    type="button"
                    id="btn-bulk-reject"
                    disabled={pendingSelectedRequests.length === 0}
                    onClick={() => {
                      setBulkRejectReason('');
                      setShowBulkRejectModal(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                    title={
                      pendingSelectedRequests.length === 0
                        ? 'No pending requisitions in selection'
                        : `Reject ${pendingSelectedRequests.length} pending requisitions`
                    }
                  >
                    <XCircle className="w-3.5 h-3.5 text-white" />
                    <span>Bulk Reject ({pendingSelectedRequests.length})</span>
                  </button>
                </>
              ) : (
                <span className="text-[11px] text-amber-300/90 italic px-2">
                  Approvals require Approver role
                </span>
              )}

              <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

              <button
                type="button"
                id="btn-clear-selection"
                onClick={handleClearSelection}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Deselect all requisitions"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Approve Confirmation Modal */}
      {showBulkApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#191C20] rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    Bulk Approve Requisitions
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sign off on {pendingSelectedRequests.length} selected requisition{pendingSelectedRequests.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkApproveModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected items summary */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Requisitions to Approve:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {pendingSelectedRequests.length}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Total Commitment (Est.):</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                  ₹{pendingSelectedRequests.reduce((sum, r) => sum + r.estimatedAmount, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
              {selectedRequests.length > pendingSelectedRequests.length && (
                <div className="text-[11px] text-amber-600 dark:text-amber-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                  Note: {selectedRequests.length - pendingSelectedRequests.length} selected requisition(s) already approved or processed will be skipped.
                </div>
              )}
            </div>

            {/* List of PRs */}
            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {pendingSelectedRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#00639A] dark:text-sky-400">
                      {req.requestNumber}
                    </span>
                    <span className="text-slate-500 text-[11px]">({req.department})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-[11px]">{req.requesterName}</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      ₹{req.estimatedAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Approval Remarks */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Approval Sign-off Remarks
              </label>
              <input
                type="text"
                value={bulkApproveRemarks}
                onChange={(e) => setBulkApproveRemarks(e.target.value)}
                placeholder="e.g. Approved in weekly budget review"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowBulkApproveModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkApprove}
                disabled={isBulkProcessing}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isBulkProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Bulk Approve ({pendingSelectedRequests.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Reject Confirmation Modal */}
      {showBulkRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#191C20] rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-rose-600 dark:text-rose-400">
                    Bulk Reject Requisitions
                  </h3>
                  <p className="text-xs text-slate-500">
                    Decline {pendingSelectedRequests.length} selected requisition{pendingSelectedRequests.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkRejectModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-rose-50/70 dark:bg-rose-950/30 p-3.5 rounded-2xl border border-rose-200/60 dark:border-rose-900/50 text-xs text-rose-900 dark:text-rose-200 space-y-1">
              <p className="font-bold">Important Notice:</p>
              <p className="text-rose-700 dark:text-rose-300">
                You are about to reject {pendingSelectedRequests.length} requisition(s) totaling{' '}
                <strong>₹{pendingSelectedRequests.reduce((sum, r) => sum + r.estimatedAmount, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>.
                Requesters will receive formal notification of this action.
              </p>
            </div>

            {/* List of PRs being rejected */}
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {pendingSelectedRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                      {req.requestNumber}
                    </span>
                    <span className="text-slate-500 text-[11px]">({req.department})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-[11px]">{req.requesterName}</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      ₹{req.estimatedAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Reason Presets */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                Quick Reason Presets (click to apply):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Budget allocation depleted for current quarter',
                  'Duplicate requisition submitted',
                  'Specifications require revision with department head',
                  'Deferred to next fiscal cycle',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setBulkRejectReason(preset)}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Rejection Reason textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Formal Rejection Justification <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={bulkRejectReason}
                onChange={(e) => setBulkRejectReason(e.target.value)}
                placeholder="State specific reason for rejecting the selected requisitions..."
                className="w-full text-xs p-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowBulkRejectModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkReject}
                disabled={!bulkRejectReason.trim() || isBulkProcessing}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isBulkProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Confirm Bulk Rejection ({pendingSelectedRequests.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
