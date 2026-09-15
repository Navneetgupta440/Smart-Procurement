import React, { useEffect, useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { AppTab } from '../../types/procurement';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Package,
  Building,
  Truck,
  ShieldCheck,
  FileText,
  UserCheck,
  X,
  Download,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { exportProjectZip, triggerBlobDownload } from '../../utils/projectZipExport';
import { ProcureLogo } from '../common/ProcureLogo';

interface WalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalkthroughModal: React.FC<WalkthroughModalProps> = ({ isOpen, onClose }) => {
  const {
    demoLifecycleStep,
    advanceDemoLifecycle,
    resetDemoLifecycle,
    setActiveTab,
    addToast,
  } = useProcurement();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const STAGES = [
    {
      step: 1,
      title: '1. Initiate Requisition',
      persona: 'Sarah Jenkins',
      role: 'Employee',
      tab: AppTab.REQUESTS,
      icon: FileText,
      badge: 'Draft ➔ Submitted',
      description:
        'Employee Sarah Jenkins creates Purchase Requisition for hardware components. Automatic 18% GST and budget threshold checks are triggered.',
    },
    {
      step: 2,
      title: '2. Tier 1 Departmental Approval',
      persona: 'Marcus Vance',
      role: 'Department Manager',
      tab: AppTab.REQUESTS,
      icon: UserCheck,
      badge: 'Tier 1 Signed',
      description:
        'Department Manager Marcus Vance reviews justification, project codes, and approves Requisition within the departmental expense limit.',
    },
    {
      step: 3,
      title: '3. Algorithmic Supplier Selection & PO',
      persona: 'Priya Sharma',
      role: 'Procurement Officer',
      tab: AppTab.ORDERS,
      icon: Building,
      badge: 'PO Generated',
      description:
        'Procurement Officer Priya Sharma converts approved requisition into PO, applying multi-factor supplier scoring (Price 35%, Quality 20%, Lead Time 20%, Rating 15%, Reliability 10%).',
    },
    {
      step: 4,
      title: '4. Executive Governance & Signature',
      persona: 'Navneet Gupta',
      role: 'Executive Admin & Architect',
      tab: AppTab.ORDERS,
      icon: ShieldCheck,
      badge: 'Cryptographic Signoff',
      description:
        'Executive Admin Navneet Gupta executes Tier 2/3 sign-off with SHA-256 digital certificate audit stamp. PO status transitions to SENT_TO_SUPPLIER.',
    },
    {
      step: 5,
      title: '5. Supplier Acceptance & AWB Dispatch',
      persona: 'ABC Tech Innovations',
      role: 'Supplier / Vendor',
      tab: AppTab.ORDERS,
      icon: Package,
      badge: 'Order Dispatched',
      description:
        'Vendor accepts purchase order, assigns production batch, generates Airway Bill (AWB) and hands consignment to linehaul courier.',
    },
    {
      step: 6,
      title: '6. Live Logistics & Transit Milestones',
      persona: 'Rajesh Kumar (SpeedExpress)',
      role: 'Delivery Personnel',
      tab: AppTab.DELIVERY,
      icon: Truck,
      badge: 'Out for Delivery',
      description:
        'Carrier logs real-time waybill checkpoints (Hub Arrival ➔ Linehaul Dispatch ➔ Out for Delivery) with barcode scans.',
    },
    {
      step: 7,
      title: '7. Dock Delivery & Automated Inwarding',
      persona: 'Rajesh Kumar (SpeedExpress)',
      role: 'Delivery Personnel',
      tab: AppTab.INVENTORY,
      icon: CheckCircle2,
      badge: 'Stock Inwarded',
      description:
        'Consignment marked DELIVERED at warehouse dock. Warehouse ledger automatically increments inventory levels and logs forensic audit entry!',
    },
  ];

  // Auto play timer
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setTimeout(async () => {
        if (demoLifecycleStep === 7) {
          await advanceDemoLifecycle();
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
          });
          setIsPlaying(false);
        } else {
          await advanceDemoLifecycle();
        }
      }, 2200);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, demoLifecycleStep, advanceDemoLifecycle]);

  if (!isOpen) return null;

  const currentStage = STAGES[demoLifecycleStep - 1] || STAGES[0];

  const handleStepClick = async () => {
    await advanceDemoLifecycle();
    if (demoLifecycleStep === 7) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  const handleExportZip = async () => {
    setIsExporting(true);
    setExportProgress(10);
    try {
      const blob = await exportProjectZip((p) => setExportProgress(p));
      triggerBlobDownload(blob, 'smart-procurement-spring-boot-postgres.zip');
      addToast('success', 'Project Exported', 'Downloaded Spring Boot 3.3.x & PostgreSQL bundle');
    } catch (err) {
      addToast('error', 'Export Failed', 'Could not generate project archive');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FFFFFF] dark:bg-[#191C20] rounded-3xl border border-[#121212]/15 dark:border-slate-700 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#F9F7F2] dark:bg-[#1E2128] border-b border-[#121212]/10 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ProcureLogo size="md" />
            <div>
              <h2 className="font-serif text-lg font-bold text-[#121212] dark:text-white flex items-center gap-2">
                <span>7-Stage Interactive Walkthrough</span>
                <span className="text-xs font-sans font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                  Step {demoLifecycleStep} of 7
                </span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-sans">
                Simulating full procure-to-pay lifecycle across 7 enterprise roles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Progress Timeline Stepper */}
          <div className="grid grid-cols-7 gap-1.5">
            {STAGES.map((s) => {
              const isPast = s.step < demoLifecycleStep;
              const isCurrent = s.step === demoLifecycleStep;
              return (
                <div
                  key={s.step}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isPast
                      ? 'bg-emerald-500'
                      : isCurrent
                      ? 'bg-[#121212] dark:bg-sky-400 ring-2 ring-amber-400'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              );
            })}
          </div>

          {/* Current Active Step Spotlight Card */}
          <div className="p-5 rounded-2xl border-2 border-[#121212] dark:border-sky-400/60 bg-[#F4F0E8]/50 dark:bg-slate-800/40 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#121212] text-white">
                    Stage {currentStage.step}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200">
                    {currentStage.badge}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#121212] dark:text-white">
                  {currentStage.title}
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-xl">
                  {currentStage.description}
                </p>
              </div>

              {/* Persona Pill */}
              <div className="bg-white dark:bg-[#191C20] rounded-2xl p-3 border border-slate-200 dark:border-slate-700 sm:w-56 shrink-0 shadow-xs">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Active Persona
                </div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  {currentStage.persona}
                </div>
                <div className="text-xs text-[#00639A] dark:text-sky-400 font-semibold">
                  {currentStage.role}
                </div>
                <button
                  onClick={() => {
                    setActiveTab(currentStage.tab);
                    onClose();
                  }}
                  className="mt-2.5 w-full text-[11px] font-semibold py-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 transition-colors"
                >
                  <span>Open Screen</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* All 7 Stages List */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
              Full Requisition-to-Inventory Lifecycle
            </h4>
            <div className="space-y-2">
              {STAGES.map((st) => {
                const isCurrent = st.step === demoLifecycleStep;
                const isCompleted = st.step < demoLifecycleStep;
                const Icon = st.icon;

                return (
                  <div
                    key={st.step}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                      isCurrent
                        ? 'border-[#121212] dark:border-sky-400 bg-white dark:bg-slate-900 font-bold shadow-xs'
                        : isCompleted
                        ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 text-slate-700 dark:text-slate-300'
                        : 'border-slate-100 dark:border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isCompleted
                            ? 'bg-emerald-500 text-white'
                            : isCurrent
                            ? 'bg-[#121212] dark:bg-sky-400 text-white dark:text-[#121212]'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {st.title}
                        </div>
                        <div className="text-[11px] text-slate-500 font-normal">
                          {st.persona} ({st.role})
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {st.badge}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#F9F7F2] dark:bg-[#1E2128] border-t border-[#121212]/10 dark:border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                isPlaying
                  ? 'bg-amber-500 text-white shadow-sm animate-pulse'
                  : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isPlaying ? 'Pause Auto-Play' : 'Auto-Play Lifecycle'}</span>
            </button>
            <button
              onClick={resetDemoLifecycle}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Spring Boot Zip */}
            <button
              onClick={handleExportZip}
              disabled={isExporting}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-500 flex items-center gap-1.5 shadow-xs transition-colors"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00639A]" />
                  <span>Exporting ({exportProgress}%)...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Spring Boot & DB ZIP</span>
                </>
              )}
            </button>

            {/* Advance Step */}
            <button
              onClick={handleStepClick}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#121212] text-white hover:bg-slate-800 dark:bg-sky-400 dark:text-[#121212] flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <span>{demoLifecycleStep === 7 ? 'Complete Cycle' : `Advance to Step ${demoLifecycleStep + 1}`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
