import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  PostmanFolder,
  PostmanRequestItem,
  PostmanEnvironment,
  substituteVariables,
} from '../../data/postmanCollection';
import { executePostmanRequest, PostmanExecutionResponse } from '../../services/multiHandlerApiDispatcher';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  X,
  ChevronRight,
  ChevronDown,
  Layers,
  Terminal,
  Activity,
  Check,
  Copy,
  ExternalLink,
  Filter,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface TestRunResultItem {
  id: string;
  item: PostmanRequestItem;
  folderName: string;
  executedAt: number;
  status: 'PENDING' | 'RUNNING' | 'PASSED' | 'FAILED';
  response?: PostmanExecutionResponse;
  error?: string;
}

interface PostmanCollectionRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: PostmanFolder[];
  environment: PostmanEnvironment;
  onUpdateEnvironment: (updates: Partial<PostmanEnvironment>) => void;
  initialFolderId?: string;
  appContextData?: any;
}

export const PostmanCollectionRunnerModal: React.FC<PostmanCollectionRunnerModalProps> = ({
  isOpen,
  onClose,
  folders,
  environment,
  onUpdateEnvironment,
  initialFolderId,
  appContextData,
}) => {
  const [selectedFolderScope, setSelectedFolderScope] = useState<string>(initialFolderId || 'ALL');
  const [requestDelayMs, setRequestDelayMs] = useState<number>(80);
  const [stopOnError, setStopOnError] = useState<boolean>(false);
  const [autoUpdateEnv, setAutoUpdateEnv] = useState<boolean>(true);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [runResults, setRunResults] = useState<TestRunResultItem[]>([]);
  const [selectedResultItem, setSelectedResultItem] = useState<TestRunResultItem | null>(null);
  const [filterMode, setFilterMode] = useState<'ALL' | 'PASSED' | 'FAILED'>('ALL');
  const [copiedReport, setCopiedReport] = useState(false);

  // Active execution ref for cancel/pause logic
  const isCancelledRef = useRef(false);
  const isPausedRef = useRef(false);
  const currentEnvRef = useRef<PostmanEnvironment>(environment);

  useEffect(() => {
    currentEnvRef.current = environment;
  }, [environment]);

  // Flatten items based on scope
  const targetItems = useMemo(() => {
    const list: Array<{ item: PostmanRequestItem; folderName: string }> = [];
    folders.forEach((f) => {
      if (selectedFolderScope === 'ALL' || selectedFolderScope === f.id) {
        f.items.forEach((item) => {
          list.push({ item, folderName: f.name });
        });
      }
    });
    return list;
  }, [folders, selectedFolderScope]);

  // Reset or initialize runner queue
  useEffect(() => {
    if (isOpen) {
      const initialQueue: TestRunResultItem[] = targetItems.map(({ item, folderName }) => ({
        id: item.id,
        item,
        folderName,
        executedAt: 0,
        status: 'PENDING',
      }));
      setRunResults(initialQueue);
      setCurrentIndex(0);
      setIsRunning(false);
      setIsPaused(false);
      setSelectedResultItem(null);
      isCancelledRef.current = false;
      isPausedRef.current = false;
    }
  }, [isOpen, targetItems]);

  if (!isOpen) return null;

  // Execution engine
  const startRunner = async () => {
    if (isRunning && !isPaused) return;

    if (isPaused) {
      isPausedRef.current = false;
      setIsPaused(false);
      setIsRunning(true);
      return;
    }

    // New run start
    isCancelledRef.current = false;
    isPausedRef.current = false;
    setIsRunning(true);
    setIsPaused(false);

    // Prepare fresh queue
    const queue: TestRunResultItem[] = targetItems.map(({ item, folderName }) => ({
      id: item.id,
      item,
      folderName,
      executedAt: 0,
      status: 'PENDING',
    }));
    setRunResults(queue);

    let currentEnv = { ...currentEnvRef.current };
    let passedTotal = 0;
    let failedTotal = 0;

    for (let i = 0; i < queue.length; i++) {
      if (isCancelledRef.current) break;

      while (isPausedRef.current) {
        await new Promise((r) => setTimeout(r, 200));
        if (isCancelledRef.current) break;
      }
      if (isCancelledRef.current) break;

      setCurrentIndex(i);
      const target = queue[i];

      // Set running state
      setRunResults((prev) => {
        const copy = [...prev];
        copy[i] = { ...copy[i], status: 'RUNNING', executedAt: Date.now() };
        return copy;
      });

      try {
        const resp = await executePostmanRequest(
          target.item,
          currentEnv,
          target.item.body?.raw,
          appContextData
        );

        // Check if all test assertions passed
        const allTestsPassed =
          resp.statusCode >= 200 &&
          resp.statusCode < 400 &&
          (resp.testResults.length === 0 || resp.testResults.every((t) => t.passed));

        if (allTestsPassed) {
          passedTotal++;
        } else {
          failedTotal++;
        }

        // Apply environment updates from scripts (e.g., token, user_id)
        if (autoUpdateEnv && resp.environmentUpdates && Object.keys(resp.environmentUpdates).length > 0) {
          currentEnv = { ...currentEnv, ...resp.environmentUpdates };
          currentEnvRef.current = currentEnv;
          onUpdateEnvironment(resp.environmentUpdates);
        }

        setRunResults((prev) => {
          const copy = [...prev];
          copy[i] = {
            ...copy[i],
            status: allTestsPassed ? 'PASSED' : 'FAILED',
            response: resp,
          };
          return copy;
        });

        if (!allTestsPassed && stopOnError) {
          break;
        }
      } catch (err: any) {
        failedTotal++;
        setRunResults((prev) => {
          const copy = [...prev];
          copy[i] = {
            ...copy[i],
            status: 'FAILED',
            error: err.message || 'Execution error',
          };
          return copy;
        });

        if (stopOnError) break;
      }

      if (requestDelayMs > 0 && i < queue.length - 1) {
        await new Promise((r) => setTimeout(r, requestDelayMs));
      }
    }

    setIsRunning(false);
    setIsPaused(false);

    // If all passed without cancellation, trigger celebration!
    if (!isCancelledRef.current && failedTotal === 0 && passedTotal > 0) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  };

  const pauseRunner = () => {
    isPausedRef.current = true;
    setIsPaused(true);
  };

  const stopRunner = () => {
    isCancelledRef.current = true;
    isPausedRef.current = false;
    setIsRunning(false);
    setIsPaused(false);
  };

  // Metrics
  const completedCount = runResults.filter((r) => r.status === 'PASSED' || r.status === 'FAILED').length;
  const passedCount = runResults.filter((r) => r.status === 'PASSED').length;
  const failedCount = runResults.filter((r) => r.status === 'FAILED').length;
  const progressPercent = runResults.length > 0 ? Math.round((completedCount / runResults.length) * 100) : 0;

  const totalTimeMs = runResults.reduce(
    (acc, r) => acc + (r.response ? r.response.responseTimeMs : 0),
    0
  );
  const avgLatency = completedCount > 0 ? Math.round(totalTimeMs / completedCount) : 0;

  // Filtered results list
  const displayedResults = useMemo(() => {
    if (filterMode === 'PASSED') return runResults.filter((r) => r.status === 'PASSED');
    if (filterMode === 'FAILED') return runResults.filter((r) => r.status === 'FAILED');
    return runResults;
  }, [runResults, filterMode]);

  const handleCopyReport = () => {
    const report = {
      collection: 'Multi-Handler API',
      timestamp: new Date().toISOString(),
      summary: {
        total: runResults.length,
        completed: completedCount,
        passed: passedCount,
        failed: failedCount,
        avgLatencyMs: avgLatency,
      },
      endpoints: runResults.map((r) => ({
        method: r.item.method,
        path: r.item.path,
        name: r.item.name,
        category: r.folderName,
        status: r.status,
        statusCode: r.response?.statusCode,
        latencyMs: r.response?.responseTimeMs,
        tests: r.response?.testResults || [],
      })),
    };

    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const getMethodBadgeClass = (method: string) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#191C20] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-6xl h-[90vh] max-h-[850px] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 dark:text-slate-100">
                  Postman Collection Runner
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-800">
                  v2.1.0 Suite
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automated regression &amp; integration test runner for all 55 endpoints
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedReport ? 'Report Copied' : 'Export Report'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configuration & Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white dark:bg-[#191C20]">
          {/* Scope selection */}
          <div className="md:col-span-4 flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 shrink-0">Suite Scope:</label>
            <select
              value={selectedFolderScope}
              onChange={(e) => setSelectedFolderScope(e.target.value)}
              disabled={isRunning}
              className="flex-1 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">Entire Collection (55 APIs)</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.items.length} APIs)
                </option>
              ))}
            </select>
          </div>

          {/* Settings toggles */}
          <div className="md:col-span-4 flex items-center justify-start sm:justify-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoUpdateEnv}
                onChange={(e) => setAutoUpdateEnv(e.target.checked)}
                disabled={isRunning}
                className="rounded text-orange-600 focus:ring-orange-500"
              />
              <span>Chain Env Tokens</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={stopOnError}
                onChange={(e) => setStopOnError(e.target.checked)}
                disabled={isRunning}
                className="rounded text-orange-600 focus:ring-orange-500"
              />
              <span>Stop on Fail</span>
            </label>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Delay:</span>
              <select
                value={requestDelayMs}
                onChange={(e) => setRequestDelayMs(Number(e.target.value))}
                disabled={isRunning}
                className="text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
              >
                <option value="0">0ms</option>
                <option value="80">80ms</option>
                <option value="200">200ms</option>
                <option value="500">500ms</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="md:col-span-4 flex items-center justify-end gap-2">
            {!isRunning ? (
              <button
                onClick={startRunner}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 w-full sm:w-auto"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Run {targetItems.length} Tests</span>
              </button>
            ) : isPaused ? (
              <button
                onClick={startRunner}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume</span>
              </button>
            ) : (
              <button
                onClick={pauseRunner}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </button>
            )}

            {isRunning && (
              <button
                onClick={stopRunner}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                <X className="w-4 h-4" />
                <span>Stop</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Metrics & Progress Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-500" />
              Progress: {completedCount} / {runResults.length} ({progressPercent}%)
            </span>
            <span className="text-slate-500">
              Avg Latency: <strong className="text-slate-800 dark:text-slate-200">{avgLatency}ms</strong> • Total: {(totalTimeMs / 1000).toFixed(1)}s
            </span>
          </div>

          {/* Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${(passedCount / runResults.length) * 100}%` }}
            />
            <div
              className="bg-rose-500 h-full transition-all duration-300"
              style={{ width: `${(failedCount / runResults.length) * 100}%` }}
            />
          </div>

          {/* Metric Badges and Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterMode === 'ALL'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                All ({runResults.length})
              </button>
              <button
                onClick={() => setFilterMode('PASSED')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  filterMode === 'PASSED'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Passed ({passedCount})</span>
              </button>
              <button
                onClick={() => setFilterMode('FAILED')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  filterMode === 'FAILED'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Failed ({failedCount})</span>
              </button>
            </div>

            {isRunning && (
              <span className="text-xs font-mono text-orange-600 dark:text-orange-400 flex items-center gap-1.5 animate-pulse font-bold">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                Executing: {targetItems[currentIndex]?.item.name}
              </span>
            )}
          </div>
        </div>

        {/* Main Content Area: Split List & Inspector */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          {/* Left Results List */}
          <div className="lg:col-span-7 border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-3 sm:p-4 space-y-1.5">
            {displayedResults.map((r, index) => {
              const isSelected = selectedResultItem?.id === r.id;

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedResultItem(r)}
                  className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 shadow-xs'
                      : r.status === 'RUNNING'
                      ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800 animate-pulse'
                      : r.status === 'PASSED'
                      ? 'bg-white dark:bg-[#191C20] border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      : r.status === 'FAILED'
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                      : 'bg-slate-50/60 dark:bg-slate-900/20 border-transparent text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Status Icon */}
                    <div className="shrink-0">
                      {r.status === 'PASSED' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                      {r.status === 'FAILED' && (
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                      )}
                      {r.status === 'RUNNING' && (
                        <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      )}
                      {r.status === 'PENDING' && (
                        <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" />
                      )}
                    </div>

                    {/* Method Badge */}
                    <span
                      className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border shrink-0 ${getMethodBadgeClass(
                        r.item.method
                      )}`}
                    >
                      {r.item.method}
                    </span>

                    {/* Name & Route */}
                    <div className="min-w-0 flex-1">
                      <div className="font-bold truncate text-slate-800 dark:text-slate-200">
                        {r.item.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 truncate">
                        {r.item.path}
                      </div>
                    </div>
                  </div>

                  {/* Latency & Status */}
                  <div className="flex items-center gap-2 text-right shrink-0">
                    {r.response && (
                      <>
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            r.response.statusCode >= 200 && r.response.statusCode < 300
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {r.response.statusCode}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {r.response.responseTimeMs}ms
                        </span>
                      </>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Result Detail Inspector */}
          <div className="lg:col-span-5 p-4 sm:p-5 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between">
            {selectedResultItem ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded border ${getMethodBadgeClass(
                        selectedResultItem.item.method
                      )}`}
                    >
                      {selectedResultItem.item.method}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {selectedResultItem.item.name}
                    </h3>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-1 break-all">
                    {selectedResultItem.item.rawUrl}
                  </div>
                </div>

                {/* Assertion Badges */}
                {selectedResultItem.response && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Test Assertions ({selectedResultItem.response.testResults.length})
                    </label>
                    <div className="space-y-1.5">
                      {selectedResultItem.response.testResults.map((t, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border text-xs font-mono flex items-start gap-2 ${
                            t.passed
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                          }`}
                        >
                          {t.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="font-bold">{t.title}</div>
                            {t.error && <div className="text-[10px] text-rose-500">{t.error}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* JSON Response Preview */}
                {selectedResultItem.response && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>Response Payload</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {selectedResultItem.response.responseTimeMs}ms • application/json
                      </span>
                    </div>
                    <pre className="text-xs font-mono bg-slate-900 text-emerald-300 p-3 rounded-2xl overflow-x-auto max-h-64 border border-slate-800">
                      {JSON.stringify(selectedResultItem.response.body, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                <Terminal className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                <div className="text-xs font-medium">Select any endpoint on the left to inspect its test assertions &amp; live payload response.</div>
              </div>
            )}

            {/* Bottom Footer inside Inspector */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Environment: Local Container Host</span>
              <span>Schema: Postman v2.1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
