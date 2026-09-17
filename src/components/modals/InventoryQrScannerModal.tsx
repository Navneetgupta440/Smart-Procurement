import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import { Product } from '../../types/procurement';
import { useProcurement } from '../../context/ProcurementContext';
import {
  Camera,
  CameraOff,
  Flashlight,
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
  Package,
  Plus,
  Minus,
  ArrowRight,
  Upload,
  FileSpreadsheet,
  HelpCircle,
  Sparkles,
  QrCode,
  SlidersHorizontal,
} from 'lucide-react';

interface InventoryQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStockUpdated?: (product: Product, newQuantity: number) => void;
}

// Audio Feedback helper using Web Audio API
function playScanSound(type: 'beep' | 'success' = 'beep') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'beep') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.09);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.28);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch {
    // AudioContext blocked before interaction
  }
}

export const InventoryQrScannerModal: React.FC<InventoryQrScannerModalProps> = ({
  isOpen,
  onClose,
  onStockUpdated,
}) => {
  const { products, adjustInventoryManual, addToast } = useProcurement();

  // Camera & Stream state
  const [cameraState, setCameraState] = useState<
    'IDLE' | 'REQUESTING' | 'ACTIVE' | 'DENIED' | 'UNAVAILABLE' | 'ERROR'
  >('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);

  // Scanned item & update form state
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [rawScannedCode, setRawScannedCode] = useState<string | null>(null);
  const [unrecognizedCode, setUnrecognizedCode] = useState<string | null>(null);

  // Stock Adjustment Form
  const [adjustmentMode, setAdjustmentMode] = useState<'DELTA' | 'EXACT'>('DELTA');
  const [stockDelta, setStockDelta] = useState<number>(5);
  const [exactPhysicalCount, setExactPhysicalCount] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('Physical Cycle Count Audit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState<string | null>(null);

  // Active Tab: Camera Scan vs Sample Labels Helper
  const [activeTab, setActiveTab] = useState<'SCANNER' | 'SAMPLES' | 'UPLOAD'>('SCANNER');

  // Refs for media elements
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isScanningRef = useRef<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Predefined common audit reasons
  const REASON_PRESETS = [
    'Physical Cycle Count Audit',
    'Inbound Stock Inwarding',
    'Production Line Requisition',
    'Damaged / Scrapped Write-Off',
    'Warehouse Shelf Relocation',
  ];

  // Stop camera helper
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsTorchOn(false);
    setHasTorch(false);
  }, []);

  // Match scanned text to a known Product
  const matchProductFromText = useCallback(
    (text: string): Product | null => {
      const trimmed = text.trim();
      if (!trimmed) return null;

      // 1. Try parsing JSON if it's a structured smart label
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object') {
          const sku = parsed.sku || parsed.productCode || parsed.code;
          const id = parsed.id || parsed.productId;
          if (sku) {
            const bySku = products.find((p) => p.productCode.toLowerCase() === String(sku).toLowerCase());
            if (bySku) return bySku;
          }
          if (id) {
            const byId = products.find((p) => p.id.toLowerCase() === String(id).toLowerCase());
            if (byId) return byId;
          }
        }
      } catch {
        // Not JSON, continue with string matching
      }

      // 2. Direct match by productCode
      const byCode = products.find(
        (p) => p.productCode.toLowerCase() === trimmed.toLowerCase()
      );
      if (byCode) return byCode;

      // 3. Direct match by ID
      const byId = products.find((p) => p.id.toLowerCase() === trimmed.toLowerCase());
      if (byId) return byId;

      // 4. Match prefix like "SKU: XYZ" or "PROD: XYZ"
      const cleaned = trimmed.replace(/^(sku|product|code|item|id):\s*/i, '').trim();
      const byCleaned = products.find(
        (p) => p.productCode.toLowerCase() === cleaned.toLowerCase() || p.id.toLowerCase() === cleaned.toLowerCase()
      );
      if (byCleaned) return byCleaned;

      // 5. Case-insensitive substring match on name or code
      const byName = products.find((p) => p.name.toLowerCase() === trimmed.toLowerCase());
      if (byName) return byName;

      return null;
    },
    [products]
  );

  // Handle successful detection of a code
  const handleCodeDetected = useCallback(
    (codeText: string) => {
      if (!isScanningRef.current) return;
      isScanningRef.current = false;

      playScanSound('beep');
      if ('vibrate' in navigator) {
        navigator.vibrate?.([50, 30, 50]);
      }

      setRawScannedCode(codeText);
      const matched = matchProductFromText(codeText);

      if (matched) {
        setScannedProduct(matched);
        setExactPhysicalCount(matched.availableQuantity + 5);
        setStockDelta(5);
        setUnrecognizedCode(null);
        setUpdateSuccessMsg(null);
        addToast(
          'info',
          'Item Label Scanned',
          `Recognized: ${matched.name} (${matched.productCode})`
        );
      } else {
        setScannedProduct(null);
        setUnrecognizedCode(codeText);
        addToast(
          'warning',
          'Unknown Label Code',
          `Scanned "${codeText}", but no matching inventory product found.`
        );
      }
    },
    [matchProductFromText, addToast]
  );

  // Main scan loop using requestAnimationFrame and jsQR
  const startScanLoop = useCallback(() => {
    let lastScanTime = 0;
    const scanInterval = 100; // Scan every 100ms for high responsiveness while preserving CPU

    const tick = (now: number) => {
      if (!isScanningRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        if (now - lastScanTime >= scanInterval) {
          lastScanTime = now;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const qrResult = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });

            if (qrResult && qrResult.data) {
              handleCodeDetected(qrResult.data);
              return;
            }
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);
  }, [handleCodeDetected]);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraState('REQUESTING');
    setErrorMessage(null);
    isScanningRef.current = true;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraState('UNAVAILABLE');
        setErrorMessage('Camera access is not supported by this browser environment or iframe.');
        return;
      }

      // Try preferred facing mode first
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        // Fallback to any available video stream
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS/Safari
        await videoRef.current.play();
      }

      // Check for torch capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities?.() as { torch?: boolean } | undefined;
        if (capabilities && capabilities.torch) {
          setHasTorch(true);
        }
      }

      setCameraState('ACTIVE');
      startScanLoop();
    } catch (err: unknown) {
      console.warn('Camera stream error:', err);
      const errName = (err as Error)?.name || '';
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setCameraState('DENIED');
        setErrorMessage('Camera permission was denied. Please allow camera permissions in your browser bar.');
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setCameraState('UNAVAILABLE');
        setErrorMessage('No physical video input / camera hardware was found on this device.');
      } else {
        setCameraState('ERROR');
        setErrorMessage('Could not initialize video capture. You can also upload a label photo or choose a sample.');
      }
    }
  }, [facingMode, startScanLoop, stopCamera]);

  // Toggle Torch
  const handleToggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextState = !isTorchOn;
      await (track as unknown as { applyConstraints: (c: unknown) => Promise<void> }).applyConstraints({
        advanced: [{ torch: nextState }],
      });
      setIsTorchOn(nextState);
    } catch (err) {
      console.warn('Torch toggle failed', err);
    }
  };

  // Toggle Camera (Front / Rear)
  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Resume Scanning Next Item
  const handleScanNext = () => {
    setScannedProduct(null);
    setRawScannedCode(null);
    setUnrecognizedCode(null);
    setUpdateSuccessMsg(null);
    isScanningRef.current = true;
    startScanLoop();
  };

  // Manual File Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qrResult = jsQR(imageData.data, imageData.width, imageData.height);

        if (qrResult && qrResult.data) {
          handleCodeDetected(qrResult.data);
          setActiveTab('SCANNER');
        } else {
          addToast('error', 'No QR Code Detected', 'Could not find a valid QR code in the uploaded image.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Confirm Stock Adjustment
  const handleConfirmStockUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedProduct) return;

    const delta =
      adjustmentMode === 'EXACT'
        ? exactPhysicalCount - scannedProduct.availableQuantity
        : stockDelta;

    if (delta === 0) {
      addToast('info', 'No Stock Change', 'Current stock and entered count are identical.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adjustInventoryManual(scannedProduct.id, delta, adjustmentReason);
      if (res.success) {
        playScanSound('success');
        const newQty = Math.max(0, scannedProduct.availableQuantity + delta);
        setUpdateSuccessMsg(
          `Stock updated for ${scannedProduct.name}! New physical balance: ${newQty} ${scannedProduct.unitOfMeasure || 'Units'} (${delta > 0 ? `+${delta}` : delta})`
        );
        // Update local scannedProduct reference
        setScannedProduct({
          ...scannedProduct,
          availableQuantity: newQty,
          isLowStock: newQty <= scannedProduct.minimumStock,
        });

        if (onStockUpdated) {
          onStockUpdated(scannedProduct, newQty);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trigger camera on open
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setScannedProduct(null);
      setRawScannedCode(null);
      setUnrecognizedCode(null);
      setUpdateSuccessMsg(null);
      setActiveTab('SCANNER');
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Restart camera when switching facingMode
  useEffect(() => {
    if (isOpen && activeTab === 'SCANNER') {
      startCamera();
    }
  }, [facingMode]);

  if (!isOpen) return null;

  return (
    <div
      id="modal-inventory-qr-scanner"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-scanner-title"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#191C20] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#00639A] dark:text-sky-400 flex items-center justify-center border border-blue-200 dark:border-blue-900 shadow-inner">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 id="qr-scanner-title" className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                Inventory QR &amp; Barcode Scanner
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scan shelf item labels for instant physical stock reconciliation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switchers */}
            <div className="hidden sm:flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('SCANNER');
                  if (cameraState !== 'ACTIVE') startCamera();
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'SCANNER'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Camera View
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('SAMPLES');
                  stopCamera();
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'SAMPLES'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sample Labels
              </button>
            </div>

            <button
              type="button"
              id="btn-close-qr-scanner"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* TAB 1: LIVE CAMERA VIEW */}
          {activeTab === 'SCANNER' && (
            <div className="space-y-4">
              {/* If no product is currently detected: show the Viewfinder */}
              {!scannedProduct ? (
                <div className="relative w-full aspect-4/3 sm:aspect-16/9 bg-black rounded-3xl overflow-hidden shadow-inner border border-slate-800 flex items-center justify-center">
                  {/* Hidden Video and Canvas */}
                  <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    muted
                    autoPlay
                    playsInline
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Viewfinder Overlays when Camera is Active */}
                  {cameraState === 'ACTIVE' && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                      {/* Dark Vignette Overlay */}
                      <div className="absolute inset-0 bg-black/30" />

                      {/* Optical Scan Reticle Area */}
                      <div className="relative w-56 h-56 sm:w-64 sm:h-64 border-2 border-dashed border-sky-400/70 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(56,189,248,0.25)]">
                        {/* 4 Corner Accents */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-sky-400 rounded-tl-lg" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-sky-400 rounded-tr-lg" />
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-sky-400 rounded-bl-lg" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-sky-400 rounded-br-lg" />

                        {/* Animated Laser Scanning Line */}
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-bounce" />

                        <div className="text-center px-4 bg-slate-950/60 backdrop-blur-xs py-1.5 rounded-full border border-white/10">
                          <span className="text-[11px] font-mono text-white/90 uppercase tracking-widest font-semibold">
                            Align label inside frame
                          </span>
                        </div>
                      </div>

                      {/* Bottom Camera Controls Bar */}
                      <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3 pointer-events-auto">
                        {hasTorch && (
                          <button
                            type="button"
                            onClick={handleToggleTorch}
                            className={`p-2.5 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
                              isTorchOn
                                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg'
                                : 'bg-slate-900/70 text-white border-white/20 hover:bg-slate-800'
                            }`}
                            title="Toggle Flashlight"
                          >
                            <Flashlight className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={handleFlipCamera}
                          className="px-3.5 py-2 rounded-xl bg-slate-900/70 hover:bg-slate-800/90 text-white text-xs font-semibold backdrop-blur-md border border-white/20 flex items-center gap-2 cursor-pointer transition-all"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Switch Camera</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-2 rounded-xl bg-slate-900/70 hover:bg-slate-800/90 text-white text-xs font-semibold backdrop-blur-md border border-white/20 flex items-center gap-2 cursor-pointer transition-all"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Image</span>
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  )}

                  {/* Camera Requesting / Permission Waiting */}
                  {cameraState === 'REQUESTING' && (
                    <div className="text-center p-6 space-y-3 z-10 text-white">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto animate-pulse">
                        <Camera className="w-6 h-6 text-sky-400" />
                      </div>
                      <div className="font-bold text-sm">Requesting Camera Access...</div>
                      <p className="text-xs text-slate-400 max-w-xs">
                        Please grant camera permissions when prompted by your browser to scan QR barcodes.
                      </p>
                    </div>
                  )}

                  {/* Camera Permission Denied or Unavailable */}
                  {(cameraState === 'DENIED' ||
                    cameraState === 'UNAVAILABLE' ||
                    cameraState === 'ERROR') && (
                    <div className="text-center p-6 space-y-3.5 z-10 max-w-sm text-white">
                      <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
                        <CameraOff className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-rose-300">
                          {cameraState === 'DENIED'
                            ? 'Camera Permission Blocked'
                            : 'Camera Hardware Unavailable'}
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {errorMessage ||
                            'Could not initialize device camera. You can still scan by uploading an image or simulating sample labels.'}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => startCamera()}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-600 cursor-pointer"
                        >
                          Retry Camera
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Label Image</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('SAMPLES')}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 cursor-pointer"
                        >
                          Use Sample SKUs
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Unrecognized Code Banner */}
              {unrecognizedCode && !scannedProduct && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Unrecognized Label Code: <code className="font-mono">{unrecognizedCode}</code>
                    </div>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300">
                      This label does not match any current product in the catalog. You can scan another label or pick from the sample directory.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleScanNext}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 hover:bg-amber-300"
                  >
                    Rescan
                  </button>
                </div>
              )}

              {/* PRODUCT DETECTED & QUICK STOCK ADJUSTMENT PANEL */}
              {scannedProduct && (
                <div className="space-y-4 animate-in zoom-in-95 duration-200">
                  {/* Success confirmation header */}
                  {updateSuccessMsg ? (
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                          {updateSuccessMsg}
                        </span>
                      </div>
                      <button
                        type="button"
                        id="btn-scan-next-item"
                        onClick={handleScanNext}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Scan Next Item</span>
                      </button>
                    </div>
                  ) : null}

                  {/* Scanned Item Overview Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 p-1 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
                        {scannedProduct.imageUrl ? (
                          <img
                            src={scannedProduct.imageUrl}
                            alt={scannedProduct.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Package className="w-7 h-7 text-slate-400" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-[#00639A] dark:text-sky-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
                            {scannedProduct.productCode}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                            {scannedProduct.categoryName || scannedProduct.category}
                          </span>
                          {scannedProduct.availableQuantity <= scannedProduct.minimumStock ? (
                            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
                              Low Stock Deficit
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                              Stock Normal
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                          {scannedProduct.name}
                        </h3>
                      </div>
                    </div>

                    <div className="text-left sm:text-right bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Recorded Physical Stock
                      </span>
                      <div className="text-lg font-black text-slate-900 dark:text-slate-100">
                        {scannedProduct.availableQuantity}{' '}
                        <span className="text-xs font-normal text-slate-500">
                          {scannedProduct.unitOfMeasure || scannedProduct.unit || 'Units'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Safety Min: {scannedProduct.minimumStock} | Max: {scannedProduct.maximumStock}
                      </div>
                    </div>
                  </div>

                  {/* Stock Update Form */}
                  <form onSubmit={handleConfirmStockUpdate} className="space-y-4 pt-1">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-[#00639A]" />
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Reconcile &amp; Update Stock Quantity
                        </h4>
                      </div>

                      {/* Mode Toggle */}
                      <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => setAdjustmentMode('DELTA')}
                          className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                            adjustmentMode === 'DELTA'
                              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                              : 'text-slate-500'
                          }`}
                        >
                          Quantity Delta (+ / -)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdjustmentMode('EXACT')}
                          className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                            adjustmentMode === 'EXACT'
                              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                              : 'text-slate-500'
                          }`}
                        >
                          Exact Physical Count
                        </button>
                      </div>
                    </div>

                    {adjustmentMode === 'DELTA' ? (
                      <div className="space-y-2.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Adjustment Delta (Positive to Inward, Negative to Write-Off)
                        </label>

                        {/* Quick Presets */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-semibold">Quick Inward:</span>
                          {[1, 5, 10, 25, 50].map((inc) => (
                            <button
                              key={inc}
                              type="button"
                              onClick={() => setStockDelta(inc)}
                              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                stockDelta === inc
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              +{inc}
                            </button>
                          ))}

                          <span className="text-[11px] text-slate-400 font-semibold ml-2">Quick Deduct:</span>
                          {[-1, -5, -10].map((dec) => (
                            <button
                              key={dec}
                              type="button"
                              onClick={() => setStockDelta(dec)}
                              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                stockDelta === dec
                                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {dec}
                            </button>
                          ))}
                        </div>

                        {/* Custom Delta Stepper */}
                        <div className="flex items-center gap-3 pt-1">
                          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900">
                            <button
                              type="button"
                              onClick={() => setStockDelta((prev) => prev - 1)}
                              className="px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input
                              type="number"
                              id="input-stock-delta"
                              value={stockDelta}
                              onChange={(e) => setStockDelta(Number(e.target.value))}
                              className="w-20 text-center font-bold text-sm bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setStockDelta((prev) => prev + 1)}
                              className="px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Calculated Result Preview */}
                          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                            <span>Balance will change:</span>
                            <strong className="text-slate-900 dark:text-slate-100">
                              {scannedProduct.availableQuantity}
                            </strong>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                            <strong
                              className={
                                scannedProduct.availableQuantity + stockDelta < scannedProduct.minimumStock
                                  ? 'text-rose-600'
                                  : 'text-emerald-600'
                              }
                            >
                              {Math.max(0, scannedProduct.availableQuantity + stockDelta)}{' '}
                              {scannedProduct.unitOfMeasure || 'Units'}
                            </strong>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Counted Shelf Balance (Exact Physical Count)
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min="0"
                            id="input-exact-count"
                            value={exactPhysicalCount}
                            onChange={(e) => setExactPhysicalCount(Math.max(0, Number(e.target.value)))}
                            className="w-32 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-base"
                          />
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            Variance Delta:{' '}
                            <strong
                              className={
                                exactPhysicalCount - scannedProduct.availableQuantity >= 0
                                  ? 'text-emerald-600'
                                  : 'text-rose-600'
                              }
                            >
                              {exactPhysicalCount - scannedProduct.availableQuantity >= 0 ? '+' : ''}
                              {exactPhysicalCount - scannedProduct.availableQuantity}{' '}
                              {scannedProduct.unitOfMeasure || 'Units'}
                            </strong>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Audit Reason Selector */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Audit Reason / Movement Note
                      </label>
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {REASON_PRESETS.map((reason) => (
                          <button
                            key={reason}
                            type="button"
                            onClick={() => setAdjustmentReason(reason)}
                            className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                              adjustmentReason === reason
                                ? 'bg-[#00639A] text-white border-[#00639A]'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {reason}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        required
                        value={adjustmentReason}
                        onChange={(e) => setAdjustmentReason(e.target.value)}
                        placeholder="e.g. Scanned QR label - verified cycle audit count"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleScanNext}
                        className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Rescan Label</span>
                      </button>

                      <button
                        type="submit"
                        id="btn-confirm-qr-stock-update"
                        disabled={isSubmitting}
                        className="flex-1 py-3 px-5 rounded-xl bg-[#00639A] hover:bg-[#004B76] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#00639A]/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Stock Update</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAMPLE LABELS DIRECTORY (For Instant Testing / Demo) */}
          {activeTab === 'SAMPLES' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Instant Label Simulator:</span> Click &quot;Simulate Scan&quot; on any item below to trigger the QR decoding workflow, or view its QR code on your phone/screen to test scanning live with your camera!
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.slice(0, 6).map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-[#00639A] dark:text-sky-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {prod.productCode}
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          Stock: {prod.availableQuantity} {prod.unitOfMeasure || 'Units'}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 mt-2 line-clamp-1">
                        {prod.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {prod.categoryName || prod.category}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        Min: {prod.minimumStock} | Max: {prod.maximumStock}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          handleCodeDetected(prod.productCode);
                          setActiveTab('SCANNER');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#00639A] hover:bg-[#004B76] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Simulate Scan</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
