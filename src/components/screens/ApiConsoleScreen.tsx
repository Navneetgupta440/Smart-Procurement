import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { ApiResponseResult } from '../../types/procurement';
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
} from 'lucide-react';

export const ApiConsoleScreen: React.FC = () => {
  const {
    executeWorkflowCommand,
    requests,
    orders,
    deliveries,
    settings,
    updateSettings,
    addToast,
  } = useProcurement();

  const [selectedAction, setSelectedAction] = useState<string>('APPROVE_REQUEST');
  const [entityId, setEntityId] = useState<string>(requests[0]?.id || 'pr-101');
  const [payload, setPayload] = useState<string>('Verified and validated via Central Procurement API');
  const [isExecuting, setIsExecuting] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponseResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Settings Configuration State
  const [autoPo, setAutoPo] = useState(settings.autoPoGeneration);
  const [limitManager, setLimitManager] = useState(settings.approvalLimitManager);
  const [limitProcurement, setLimitProcurement] = useState(settings.approvalLimitProcurementManager);
  const [limitFinance, setLimitFinance] = useState(settings.approvalLimitFinanceDirector);

  const ACTIONS = [
    { value: 'APPROVE_REQUEST', label: 'POST /api/v1/requests/{id}/approve', desc: 'Approve requisition level' },
    { value: 'REJECT_REQUEST', label: 'POST /api/v1/requests/{id}/reject', desc: 'Reject requisition' },
    { value: 'CREATE_PURCHASE_ORDER', label: 'POST /api/v1/requests/{id}/convert-po', desc: 'Convert PR to PO with approval chain' },
    { value: 'ACCEPT_ORDER', label: 'POST /api/v1/orders/{id}/accept', desc: 'Supplier order confirmation' },
    { value: 'REJECT_ORDER', label: 'POST /api/v1/orders/{id}/reject', desc: 'Supplier order rejection' },
    { value: 'DISPATCH_ORDER', label: 'POST /api/v1/orders/{id}/dispatch', desc: 'Supplier dispatch with tracking' },
    { value: 'MARK_DELIVERED', label: 'POST /api/v1/deliveries/{id}/deliver', desc: 'Confirm delivery & auto-inward stock' },
  ];

  const handleExecute = async () => {
    setIsExecuting(true);
    const start = performance.now();
    try {
      const res = await executeWorkflowCommand(selectedAction, entityId, payload);
      const latency = Math.round(performance.now() - start);
      setApiResponse({ ...res, latencyMs: latency } as any);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopy = () => {
    if (!apiResponse) return;
    navigator.clipboard.writeText(JSON.stringify(apiResponse, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast('info', 'Copied', 'API Response JSON copied to clipboard');
  };

  const handleSaveSettings = () => {
    updateSettings({
      autoPoGeneration: autoPo,
      approvalLimitManager: Number(limitManager),
      approvalLimitProcurementManager: Number(limitProcurement),
      approvalLimitFinanceDirector: Number(limitFinance),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Terminal className="w-6 h-6 text-[#00639A]" />
          <span>Interactive REST API Console & Workflow Engine</span>
        </h2>
        <p className="text-xs text-slate-500">
          Execute direct programmatic procurement operations, audit responses, and configure approval thresholds
        </p>
      </div>

      {/* Grid: Console Left, Response Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Command Builder */}
        <div className="bg-white dark:bg-[#191C20] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#00639A]" />
              API Dispatcher
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
                else if (act.includes('ORDER')) setEntityId(orders[0]?.id || 'po-po-2026-000501');
                else if (act.includes('DELIVER')) setEntityId(deliveries[0]?.id || 'del-101');
              }}
              className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            >
              {ACTIONS.map((a) => (
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
            {/* Quick chips */}
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
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>

          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="w-full py-2.5 bg-[#00639A] hover:bg-[#004B76] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Execute API Request</span>
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

              {apiResponse && (
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      apiResponse.success ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                    }`}
                  >
                    HTTP {apiResponse.statusCode}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-1 rounded text-slate-400 hover:text-white"
                    title="Copy Response"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4">
              {apiResponse ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>Latency: {(apiResponse as any).latencyMs || 42}ms</span>
                    <span>•</span>
                    <span>Status: {apiResponse.message}</span>
                  </div>
                  <pre className="font-mono text-xs bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-emerald-300 overflow-x-auto max-h-80">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="py-20 text-center text-slate-500 text-xs">
                  <Code2 className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                  Select an endpoint and click "Execute API Request" to view live server output.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Powered by PoApprovalWorkflowEngine</span>
            <span className="text-emerald-400">● REST Console Active</span>
          </div>
        </div>
      </div>

      {/* Workflow Engine Settings Configuration */}
      <div className="bg-white dark:bg-[#191C20] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Procurement Engine Thresholds & Automation Configuration
            </h3>
            <p className="text-xs text-slate-500">
              Configure financial limits that determine signature tiers and auto-PO issuance
            </p>
          </div>
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-[#00639A] hover:bg-[#004B76] text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Save Parameters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Tier 1 Limit (Manager)
            </label>
            <input
              type="number"
              value={limitManager}
              onChange={(e) => setLimitManager(Number(e.target.value))}
              className="w-full text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Up to ₹{limitManager.toLocaleString('en-IN')} requires single sign-off
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Tier 2 Limit (Procurement)
            </label>
            <input
              type="number"
              value={limitProcurement}
              onChange={(e) => setLimitProcurement(Number(e.target.value))}
              className="w-full text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Up to ₹{limitProcurement.toLocaleString('en-IN')} requires 2 signatures
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Tier 3 Limit (Finance Dir.)
            </label>
            <input
              type="number"
              value={limitFinance}
              onChange={(e) => setLimitFinance(Number(e.target.value))}
              className="w-full text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Up to ₹{(limitFinance || 0).toLocaleString('en-IN')} requires 3 signatures
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                Auto-Generate PO
              </span>
              <span className="text-[10px] text-slate-400">
                On final PR approval sign-off
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoPo}
              onChange={(e) => setAutoPo(e.target.checked)}
              className="w-4 h-4 accent-[#00639A]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
