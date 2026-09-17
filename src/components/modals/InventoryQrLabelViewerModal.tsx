import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Product } from '../../types/procurement';
import { X, Printer, Download, QrCode, Tag, Check, Copy } from 'lucide-react';

interface InventoryQrLabelViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const InventoryQrLabelViewerModal: React.FC<InventoryQrLabelViewerModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!product || !isOpen) return;

    // Create a structured payload that encodes SKU, ID, Name, and verification metadata
    const labelPayload = JSON.stringify({
      sku: product.productCode,
      id: product.id,
      name: product.name,
      category: product.categoryName || product.category,
      unit: product.unitOfMeasure || product.unit || 'Units',
      v: '1.0',
    });

    QRCode.toDataURL(labelPayload, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleCopySku = () => {
    navigator.clipboard.writeText(product.productCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="modal-qr-label-viewer"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-label-title"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-[#191C20] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#00639A] dark:text-sky-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 id="qr-label-title" className="font-bold text-base text-slate-900 dark:text-slate-100">
                Warehouse Stock Label
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Printable QR code for physical inventory tracking
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Physical Label Preview */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center text-center space-y-3 print:border-solid print:bg-white">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            <Tag className="w-3 h-3" />
            <span>SmartProcure Inventory Tag</span>
          </div>

          {/* Rendered QR Code Image */}
          <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-200">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR code for ${product.name}`}
                className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                Generating QR...
              </div>
            )}
          </div>

          {/* Product Label Metadata */}
          <div className="w-full space-y-1">
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
              {product.name}
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-xs font-bold text-[#00639A] dark:text-sky-400 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
                SKU: {product.productCode}
              </span>
              <button
                type="button"
                onClick={handleCopySku}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Copy SKU"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="text-[11px] text-slate-500">
              {product.categoryName || product.category} &bull; Unit: {product.unitOfMeasure || product.unit || 'Units'} &bull; Base Price: ₹{product.unitPrice.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Label</span>
          </button>

          {qrDataUrl && (
            <a
              href={qrDataUrl}
              download={`label-${product.productCode}.png`}
              className="w-full py-2.5 px-3 rounded-xl bg-[#00639A] hover:bg-[#004B76] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer text-center"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
