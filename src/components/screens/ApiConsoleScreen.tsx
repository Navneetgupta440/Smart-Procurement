import React, { useState, useMemo } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import {
  POSTMAN_COLLECTION_FOLDERS,
  RAW_POSTMAN_COLLECTION_METADATA,
  DEFAULT_POSTMAN_ENVIRONMENT,
  PostmanRequestItem,
  PostmanEnvironment,
  PostmanFolder,
  substituteVariables,
} from '../../data/postmanCollection';
import { executePostmanRequest, PostmanExecutionResponse } from '../../services/multiHandlerApiDispatcher';
import { ApiResponseResult } from '../../types/procurement';
import { PostmanCollectionRunnerModal } from '../modals/PostmanCollectionRunnerModal';
import { PostmanImportModal } from '../modals/PostmanImportModal';
import {
  Terminal,
  Play,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  Code2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Search,
  Sliders,
  ShieldCheck,
  CreditCard,
  ShoppingBag,
  HardDrive,
  CheckSquare,
  FileText,
  KeyRound,
  ExternalLink,
  ChevronRight,
  Database,
  RefreshCw,
  Info,
  Lock,
} from 'lucide-react';

export const ApiConsoleScreen: React.FC = () => {
  const {
    executeWorkflowCommand,
    requests,
    orders,
    deliveries,
    products,
    settings,
    updateSettings,
    addToast,
    openPostmanSecurityModal,
  } = useProcurement();

  const totalSpend = useMemo(() => {
    return orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  }, [orders]);

  // Mode: Postman Collection vs Procurement Workflow Console
  const [consoleMode, setConsoleMode] = useState<'POSTMAN' | 'WORKFLOW'>('POSTMAN');

  // ===================== POSTMAN COLLECTION STATE =====================
  const [collectionFolders, setCollectionFolders] = useState<PostmanFolder[]>(POSTMAN_COLLECTION_FOLDERS);
  const [collectionMetadata, setCollectionMetadata] = useState(RAW_POSTMAN_COLLECTION_METADATA);
  const [showRunnerModal, setShowRunnerModal] = useState(false);
  const [runnerInitialFolder, setRunnerInitialFolder] = useState<string>('ALL');
  const [showImportModal, setShowImportModal] = useState(false);

  const [activeFolderId, setActiveFolderId] = useState<string>(collectionFolders[0]?.id || 'auth-user');
  const [selectedRequestItem, setSelectedRequestItem] = useState<PostmanRequestItem>(
    collectionFolders[0]?.items[1] || collectionFolders[0]?.items[0] // Default to "Login"
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [requestBodyText, setRequestBodyText] = useState<string>(
    collectionFolders[0]?.items[1]?.body?.raw || ''
  );
  const [envVariables, setEnvVariables] = useState<PostmanEnvironment>(DEFAULT_POSTMAN_ENVIRONMENT);
  const [showEnvDrawer, setShowEnvDrawer] = useState(false);
  const [isExecutingPostman, setIsExecutingPostman] = useState(false);
  const [postmanResponse, setPostmanResponse] = useState<PostmanExecutionResponse | null>(null);
  const [activeResponseTab, setActiveResponseTab] = useState<'BODY' | 'TESTS' | 'HEADERS'>('BODY');
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [copiedCollection, setCopiedCollection] = useState(false);
  const [lastAutoUpdatedEnvKey, setLastAutoUpdatedEnvKey] = useState<string | null>(null);

  // ===================== WORKFLOW ENGINE STATE =====================
  const [selectedAction, setSelectedAction] = useState<string>('APPROVE_REQUEST');
  const [entityId, setEntityId] = useState<string>(requests[0]?.id || 'pr-101');
  const [workflowPayload, setWorkflowPayload] = useState<string>(
    'Verified and validated via Central Procurement API'
  );
  const [isExecutingWorkflow, setIsExecutingWorkflow] = useState(false);
  const [workflowResponse, setWorkflowResponse] = useState<ApiResponseResult | null>(null);
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);

  // Settings
  const [autoPo, setAutoPo] = useState(settings.autoPoGeneration);
  const [limitManager, setLimitManager] = useState(settings.approvalLimitManager);
  const [limitProcurement, setLimitProcurement] = useState(settings.approvalLimitProcurementManager);
  const [limitFinance, setLimitFinance] = useState(settings.approvalLimitFinanceDirector);

  const WORKFLOW_ACTIONS = [
    { value: 'APPROVE_REQUEST', label: 'POST /api/v1/requests/{id}/approve', desc: 'Approve requisition level' },
    { value: 'REJECT_REQUEST', label: 'POST /api/v1/requests/{id}/reject', desc: 'Reject requisition' },
    { value: 'CREATE_PURCHASE_ORDER', label: 'POST /api/v1/requests/{id}/convert-po', desc: 'Convert PR to PO with approval chain' },
    { value: 'ACCEPT_ORDER', label: 'POST /api/v1/orders/{id}/accept', desc: 'Supplier order confirmation' },
    { value: 'REJECT_ORDER', label: 'POST /api/v1/orders/{id}/reject', desc: 'Supplier order rejection' },
    { value: 'DISPATCH_ORDER', label: 'POST /api/v1/orders/{id}/dispatch', desc: 'Supplier dispatch with tracking' },
    { value: 'MARK_DELIVERED', label: 'POST /api/v1/deliveries/{id}/deliver', desc: 'Confirm delivery & auto-inward stock' },
  ];

  // Filtered requests list across all folders or active folder
  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) {
      const currentFolder = collectionFolders.find((f) => f.id === activeFolderId);
      return currentFolder ? currentFolder.items : [];
    }
    const q = searchQuery.toLowerCase();
    const allItems: PostmanRequestItem[] = [];
    collectionFolders.forEach((folder) => {
      folder.items.forEach((item) => {
        if (
          item.name.toLowerCase().includes(q) ||
          item.path.toLowerCase().includes(q) ||
          item.method.toLowerCase().includes(q) ||
          item.folderName.toLowerCase().includes(q)
        ) {
          allItems.push(item);
        }
      });
    });
    return allItems;
  }, [activeFolderId, searchQuery, collectionFolders]);

  const handleImportSuccess = (newFolders: PostmanFolder[], metadata: any) => {
    setCollectionFolders(newFolders);
    setCollectionMetadata(metadata);
    if (newFolders.length > 0) {
      setActiveFolderId(newFolders[0].id);
      if (newFolders[0].items.length > 0) {
        handleSelectRequest(newFolders[0].items[0]);
      }
    }
    addToast(
      'success',
      'Collection Imported',
      `Loaded "${metadata.name}" with ${metadata.totalEndpoints} endpoints across ${newFolders.length} categories.`
    );
  };

  // Handle select endpoint
  const handleSelectRequest = (item: PostmanRequestItem) => {
    setSelectedRequestItem(item);
    setRequestBodyText(item.body?.raw || '');
    setPostmanResponse(null);
  };

  // Execute Postman Request
  const handleExecutePostman = async () => {
    setIsExecutingPostman(true);
    try {
      const resp = await executePostmanRequest(
        selectedRequestItem,
        envVariables,
        requestBodyText,
        { requests, orders, deliveries, products, kpis: { totalSpend } }
      );
      setPostmanResponse(resp);

      // Auto update environment variables if script extracted them (e.g. login)
      if (resp.environmentUpdates && Object.keys(resp.environmentUpdates).length > 0) {
        setEnvVariables((prev) => ({
          ...prev,
          ...resp.environmentUpdates,
        }));
        const updatedKeys = Object.keys(resp.environmentUpdates).join(', ');
        setLastAutoUpdatedEnvKey(updatedKeys);
        addToast(
          'success',
          'Environment Auto-Updated',
          `Postman test script set: {{${updatedKeys}}}`
        );
      } else {
        setLastAutoUpdatedEnvKey(null);
      }

      if (resp.testResults.length > 0) {
        const passCount = resp.testResults.filter((t) => t.passed).length;
        addToast(
          'info',
          `HTTP ${resp.statusCode} ${resp.statusText}`,
          `${passCount}/${resp.testResults.length} Postman tests passed (${resp.responseTimeMs}ms)`
        );
      }
    } catch {
      addToast('error', 'Execution Error', 'Failed to execute endpoint');
    } finally {
      setIsExecutingPostman(false);
    }
  };

  // Download Postman Collection JSON with Security Authentication
  const handleDownloadCollection = () => {
    openPostmanSecurityModal();
  };

  // Copy Collection JSON
  const handleCopyCollection = async () => {
    try {
      const res = await fetch('/postman_collection.json');
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopiedCollection(true);
      setTimeout(() => setCopiedCollection(false), 2000);
      addToast('success', 'Copied', 'Full Postman Collection v2.1.0 JSON copied to clipboard');
    } catch {
      addToast('error', 'Copy Failed', 'Unable to copy collection JSON');
    }
  };

  // Copy Response JSON
  const handleCopyResponse = () => {
    if (!postmanResponse) return;
    navigator.clipboard.writeText(JSON.stringify(postmanResponse.body, null, 2));
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
    addToast('info', 'Copied', 'Response JSON copied to clipboard');
  };

  // Execute Workflow
  const handleExecuteWorkflow = async () => {
    setIsExecutingWorkflow(true);
    const start = performance.now();
    try {
      const res = await executeWorkflowCommand(selectedAction, entityId, workflowPayload);
      const latency = Math.round(performance.now() - start);
      setWorkflowResponse({ ...res, latencyMs: latency } as any);
    } finally {
      setIsExecutingWorkflow(false);
    }
  };

  const handleCopyWorkflow = () => {
    if (!workflowResponse) return;
    navigator.clipboard.writeText(JSON.stringify(workflowResponse, null, 2));
    setCopiedWorkflow(true);
    setTimeout(() => setCopiedWorkflow(false), 2000);
    addToast('info', 'Copied', 'Workflow API Response copied');
  };

  const handleSaveSettings = () => {
    updateSettings({
      autoPoGeneration: autoPo,
      approvalLimitManager: Number(limitManager),
      approvalLimitProcurementManager: Number(limitProcurement),
      approvalLimitFinanceDirector: Number(limitFinance),
    });
    addToast('success', 'Settings Saved', 'Approval limits updated');
  };

  // Method Badge Helper
  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'POST':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'PUT':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'DELETE':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200';
    }
  };

  // Folder Icon Helper
  const renderFolderIcon = (name: string) => {
    switch (name) {
      case 'Auth & User Management':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'Admin':
        return <Sliders className="w-4 h-4 text-purple-600" />;
      case 'Requests & Responses':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'Payments (Paid)':
        return <CreditCard className="w-4 h-4 text-amber-600" />;
      case 'Shop':
        return <ShoppingBag className="w-4 h-4 text-teal-600" />;
      case 'Storage':
        return <HardDrive className="w-4 h-4 text-indigo-600" />;
      case 'Approval & Rejection':
        return <CheckSquare className="w-4 h-4 text-rose-600" />;
      default:
        return <Layers className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Hero Card with Collection Metadata & Attachment Highlights */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                Postman Collection v2.1.0 Attached
              </span>
              <span className="text-xs font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                ID: {RAW_POSTMAN_COLLECTION_METADATA.id.slice(0, 8)}...
              </span>
              <span className="text-xs font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                Exporter: {RAW_POSTMAN_COLLECTION_METADATA.exporterId}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-white flex items-center gap-3">
              <Terminal className="w-8 h-8 text-orange-400 shrink-0" />
              <span>Multi-Handler API Console &amp; Runner</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Complete, live REST API suite with <strong className="text-white">55 endpoints</strong> covering Authentication, Admin RBAC, Requisition Ticketing, Paid Transactions, Catalog Store, Document Storage, and Approval Workflows.
            </p>

            {/* Mode Switcher Tabs */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setConsoleMode('POSTMAN')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  consoleMode === 'POSTMAN'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>Postman Collection (55 APIs)</span>
              </button>

              <button
                onClick={() => setConsoleMode('WORKFLOW')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  consoleMode === 'WORKFLOW'
                    ? 'bg-[#00639A] text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Procurement Workflow Engine</span>
              </button>
            </div>
          </div>

          {/* Quick Action Badges / Download / Runner / Import */}
          <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => {
                setRunnerInitialFolder('ALL');
                setShowRunnerModal(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              title="Run automated sequential test runner for all endpoints"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Collection ({collectionMetadata.totalEndpoints} APIs)</span>
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all"
              title="Paste or upload custom Postman Collection JSON"
            >
              <Download className="w-3.5 h-3.5 rotate-180" />
              <span>Import Collection JSON</span>
            </button>

            <button
              onClick={handleDownloadCollection}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all"
              title="Requires ID & Password authentication to access"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Download Postman (.json)</span>
            </button>

            <button
              onClick={handleCopyCollection}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all"
              title="Copy Raw Collection JSON to Clipboard"
            >
              {copiedCollection ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCollection ? 'Copied to Clipboard!' : 'Copy Collection JSON'}</span>
            </button>

            <button
              onClick={() => setShowEnvDrawer(!showEnvDrawer)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                showEnvDrawer
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-700'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Environment Variables ({Object.keys(envVariables).length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Environment Variables Drawer (Collapsible) */}
      {showEnvDrawer && (
        <div className="bg-white dark:bg-[#191C20] rounded-3xl p-6 border border-amber-200 dark:border-amber-900/50 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Postman Environment &amp; Session Variables
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                Auto-updated on Auth &amp; Responses
              </span>
            </div>
            <button
              onClick={() => setEnvVariables(DEFAULT_POSTMAN_ENVIRONMENT)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(envVariables).map(([key, val]) => (
              <div key={key} className="space-y-1">
                <label className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>{`{{${key}}}`}</span>
                  {lastAutoUpdatedEnvKey?.includes(key) && (
                    <span className="text-[9px] font-bold text-emerald-600 animate-pulse">JUST UPDATED</span>
                  )}
                </label>
                <input
                  type="text"
                  value={val}
                  onChange={(e) =>
                    setEnvVariables((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                  className="w-full text-xs font-mono px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 truncate"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================= TAB 1: POSTMAN COLLECTION EXPLORER ======================= */}
      {consoleMode === 'POSTMAN' && (
        <div className="space-y-6">
          {/* Folders Nav Pills & Global Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Folder Horizontal Scroll */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {collectionFolders.map((folder) => {
                const isActive = activeFolderId === folder.id && !searchQuery.trim();
                return (
                  <button
                    key={folder.id}
                    onClick={() => {
                      setActiveFolderId(folder.id);
                      setSearchQuery('');
                      if (folder.items[0]) handleSelectRequest(folder.items[0]);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                        : 'bg-white dark:bg-[#191C20] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {renderFolderIcon(folder.name)}
                    <span>{folder.name}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-white/20 dark:bg-black/20 text-white dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {folder.items.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Action: Run Folder Suite + Search */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setRunnerInitialFolder(activeFolderId);
                  setShowRunnerModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-900/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 text-xs font-bold transition-all shrink-0"
                title="Run test suite for currently active category"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Folder</span>
              </button>

              <div className="relative shrink-0 w-full md:w-56">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={`Search ${collectionMetadata.totalEndpoints} endpoints...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#191C20] text-slate-900 dark:text-slate-100"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main 3-Column Studio Grid: Left Endpoints List, Center Request Builder, Right Response Runner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Endpoint List (4 cols) */}
            <div className="lg:col-span-4 bg-white dark:bg-[#191C20] rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col h-[650px]">
              <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {searchQuery.trim()
                    ? `Results (${filteredRequests.length})`
                    : collectionFolders.find((f) => f.id === activeFolderId)?.name}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {filteredRequests.length} endpoints
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {filteredRequests.map((item) => {
                  const isSelected = selectedRequestItem.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectRequest(item)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 border ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 shadow-xs'
                          : 'bg-slate-50/50 dark:bg-slate-900/40 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded shrink-0 border ${getMethodBadge(
                          item.method
                        )}`}
                      >
                        {item.method}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 dark:text-slate-100 truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 truncate">{item.path}</div>
                      </div>
                      <ChevronRight
                        className={`w-3.5 h-3.5 shrink-0 mt-1 transition-transform ${
                          isSelected ? 'text-[#00639A] translate-x-0.5' : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Center: Request Inspector & Builder (4 cols) */}
            <div className="lg:col-span-4 bg-white dark:bg-[#191C20] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col h-[650px]">
              {/* Endpoint Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold font-mono px-2 py-0.5 rounded border ${getMethodBadge(
                      selectedRequestItem.method
                    )}`}
                  >
                    {selectedRequestItem.method}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {selectedRequestItem.name}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-500 break-all bg-slate-100 dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  {substituteVariables(selectedRequestItem.rawUrl, envVariables)}
                </div>
              </div>

              {/* Headers display */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Headers</span>
                  <span className="text-[10px] font-normal text-slate-400">
                    {selectedRequestItem.headers.length} configured
                  </span>
                </label>
                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-2 border border-slate-200 dark:border-slate-800 space-y-1 text-[11px] font-mono">
                  {selectedRequestItem.headers.map((h, i) => (
                    <div key={i} className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">{h.key}:</span>
                      <span className="truncate max-w-[200px]">{substituteVariables(h.value, envVariables)}</span>
                    </div>
                  ))}
                  {selectedRequestItem.headers.length === 0 && (
                    <div className="text-slate-400 text-[10px] italic">None (Public Endpoint)</div>
                  )}
                </div>
              </div>

              {/* Request Body Editor */}
              <div className="flex-1 flex flex-col space-y-1 min-h-0">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Request Body (JSON)
                  </label>
                  {selectedRequestItem.body?.raw && (
                    <button
                      onClick={() => setRequestBodyText(selectedRequestItem.body?.raw || '')}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Schema</span>
                    </button>
                  )}
                </div>

                <textarea
                  value={requestBodyText}
                  onChange={(e) => setRequestBodyText(e.target.value)}
                  placeholder="No request body required for this method"
                  disabled={!selectedRequestItem.body?.raw && selectedRequestItem.method === 'GET'}
                  className="flex-1 w-full text-xs font-mono p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 resize-none"
                />
              </div>

              {/* Test Script Indicator */}
              {selectedRequestItem.testScript && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Includes Postman tests (auto-evaluates tokens &amp; latency)</span>
                </div>
              )}

              {/* Execution Button */}
              <button
                onClick={handleExecutePostman}
                disabled={isExecutingPostman}
                className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isExecutingPostman ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
                <span>{isExecutingPostman ? 'Executing Request...' : 'Send API Request'}</span>
              </button>
            </div>

            {/* Right: Response Output & Test Assertions (4 cols) */}
            <div className="lg:col-span-4 bg-slate-950 text-white rounded-3xl p-5 border border-slate-800 shadow-xs flex flex-col h-[650px] justify-between">
              <div>
                {/* Header with status code & latency */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs text-slate-200">Live Response</span>
                  </div>

                  {postmanResponse && (
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          postmanResponse.statusCode >= 200 && postmanResponse.statusCode < 300
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {postmanResponse.statusCode} {postmanResponse.statusText}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        {postmanResponse.responseTimeMs}ms
                      </span>
                    </div>
                  )}
                </div>

                {/* Sub tabs: Body, Tests, Headers */}
                {postmanResponse && (
                  <div className="flex items-center gap-2 pt-2 border-b border-slate-800/80 pb-2">
                    <button
                      onClick={() => setActiveResponseTab('BODY')}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all ${
                        activeResponseTab === 'BODY'
                          ? 'bg-slate-800 text-white font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Body JSON
                    </button>
                    <button
                      onClick={() => setActiveResponseTab('TESTS')}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                        activeResponseTab === 'TESTS'
                          ? 'bg-slate-800 text-white font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>Postman Tests</span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-950 text-emerald-300">
                        {postmanResponse.testResults.filter((t) => t.passed).length}/
                        {postmanResponse.testResults.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveResponseTab('HEADERS')}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all ${
                        activeResponseTab === 'HEADERS'
                          ? 'bg-slate-800 text-white font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Headers
                    </button>
                  </div>
                )}

                {/* Body Content */}
                <div className="mt-3">
                  {postmanResponse ? (
                    <>
                      {activeResponseTab === 'BODY' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>application/json</span>
                            <button
                              onClick={handleCopyResponse}
                              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white"
                            >
                              {copiedResponse ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span>{copiedResponse ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <pre className="font-mono text-xs bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 text-emerald-300 overflow-x-auto max-h-[430px] leading-relaxed">
                            {JSON.stringify(postmanResponse.body, null, 2)}
                          </pre>
                        </div>
                      )}

                      {activeResponseTab === 'TESTS' && (
                        <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                          <div className="text-[11px] text-slate-400 mb-2">
                            Postman assertions executed in sandbox runtime:
                          </div>
                          {postmanResponse.testResults.map((t, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-xl border text-xs font-mono flex items-start gap-2.5 ${
                                t.passed
                                  ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                                  : 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                              }`}
                            >
                              {t.passed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                              )}
                              <div>
                                <div className="font-bold">{t.title}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  {t.passed ? 'Assertion passed successfully' : t.error}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeResponseTab === 'HEADERS' && (
                        <div className="space-y-1.5 max-h-[440px] overflow-y-auto">
                          {Object.entries(postmanResponse.headers).map(([k, v]) => (
                            <div
                              key={k}
                              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono flex items-center justify-between"
                            >
                              <span className="text-slate-400">{k}</span>
                              <span className="text-slate-200">{v}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="py-28 text-center text-slate-500 text-xs space-y-3">
                      <Code2 className="w-10 h-10 text-slate-700 mx-auto" />
                      <p className="max-w-[200px] mx-auto text-slate-400 leading-relaxed">
                        Select an endpoint and click &quot;Send API Request&quot; to inspect response headers, body, and test runner assertions.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer info */}
              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Enterprise API Gateway</span>
                <span className="font-mono text-emerald-400">TLS 1.3 Secure</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 2: WORKFLOW ENGINE & LIMITS ======================= */}
      {consoleMode === 'WORKFLOW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Command Builder */}
            <div className="bg-white dark:bg-[#191C20] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#00639A]" />
                  Internal Workflow Command Dispatcher
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  v1.4-enterprise
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Endpoint / Action
                </label>
                <select
                  value={selectedAction}
                  onChange={(e) => {
                    const act = e.target.value;
                    setSelectedAction(act);
                    if (act.includes('REQUEST')) setEntityId(requests[0]?.id || 'pr-101');
                    else if (act.includes('ORDER')) setEntityId(orders[0]?.id || 'po-2026-000501');
                    else if (act.includes('DELIVER')) setEntityId(deliveries[0]?.id || 'del-101');
                  }}
                  className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  {WORKFLOW_ACTIONS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label} ({a.desc})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Entity ID / Reference Number
                </label>
                <input
                  type="text"
                  value={entityId}
                  onChange={(e) => setEntityId(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400">Quick Select:</span>
                  {selectedAction.includes('REQUEST') &&
                    requests.slice(0, 3).map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setEntityId(r.id)}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      >
                        {r.requestNumber}
                      </button>
                    ))}
                  {selectedAction.includes('ORDER') &&
                    orders.slice(0, 3).map((o) => (
                      <button
                        key={o.id}
                        onClick={() => setEntityId(o.id)}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      >
                        {o.poNumber}
                      </button>
                    ))}
                  {selectedAction.includes('DELIVER') &&
                    deliveries.slice(0, 3).map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setEntityId(d.id)}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      >
                        {d.trackingNumber}
                      </button>
                    ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  JSON Body / Reason Payload
                </label>
                <textarea
                  rows={3}
                  value={workflowPayload}
                  onChange={(e) => setWorkflowPayload(e.target.value)}
                  className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <button
                onClick={handleExecuteWorkflow}
                disabled={isExecutingWorkflow}
                className="w-full py-2.5 bg-[#00639A] hover:bg-[#004B76] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Execute Workflow Request</span>
              </button>
            </div>

            {/* Right: Response Viewer */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-sm text-slate-200">REST Response Payload</h3>
                  </div>

                  {workflowResponse && (
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          workflowResponse.success ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                        }`}
                      >
                        HTTP {workflowResponse.statusCode}
                      </span>
                      <button
                        onClick={handleCopyWorkflow}
                        className="p-1 rounded text-slate-400 hover:text-white"
                        title="Copy Response"
                      >
                        {copiedWorkflow ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  {workflowResponse ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>Latency: {(workflowResponse as any).latencyMs || 42}ms</span>
                        <span>•</span>
                        <span>Status: {workflowResponse.message}</span>
                      </div>
                      <pre className="font-mono text-xs bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-emerald-300 overflow-x-auto max-h-80">
                        {JSON.stringify(workflowResponse, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="py-20 text-center text-slate-500 text-xs">
                      <Code2 className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                      Select an action and click &quot;Execute Workflow Request&quot; to inspect state transitions.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Procurement Engine v1.4</span>
                <span className="font-mono text-emerald-400">Ready</span>
              </div>
            </div>
          </div>

          {/* Bottom Settings Card */}
          <div className="bg-white dark:bg-[#191C20] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#00639A]" />
              Enterprise Approval Threshold Policies
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Manager Max Limit ($)
                </label>
                <input
                  type="number"
                  value={limitManager}
                  onChange={(e) => setLimitManager(Number(e.target.value))}
                  className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Procurement Mgr Limit ($)
                </label>
                <input
                  type="number"
                  value={limitProcurement}
                  onChange={(e) => setLimitProcurement(Number(e.target.value))}
                  className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Finance Director Limit ($)
                </label>
                <input
                  type="number"
                  value={limitFinance}
                  onChange={(e) => setLimitFinance(Number(e.target.value))}
                  className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="autoPoCheck"
                  checked={autoPo}
                  onChange={(e) => setAutoPo(e.target.checked)}
                  className="w-4 h-4 rounded text-[#00639A]"
                />
                <label htmlFor="autoPoCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Auto-Convert Approved PR to PO
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveSettings}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                Save Policies
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Postman Automated Collection Runner Modal */}
      {showRunnerModal && (
        <PostmanCollectionRunnerModal
          isOpen={showRunnerModal}
          onClose={() => setShowRunnerModal(false)}
          folders={collectionFolders}
          environment={envVariables}
          onUpdateEnvironment={(updates) => setEnvVariables((prev) => ({ ...prev, ...updates }))}
          initialFolderId={runnerInitialFolder}
          appContextData={{ requests, orders, deliveries, products, kpis: { totalSpend } }}
        />
      )}

      {/* Postman Import Modal */}
      {showImportModal && (
        <PostmanImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImportSuccess={handleImportSuccess}
        />
      )}
    </div>
  );
};
