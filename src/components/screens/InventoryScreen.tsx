import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Priority, Product, TransactionType, AppTab } from '../../types/procurement';
import { InventoryQrScannerModal } from '../modals/InventoryQrScannerModal';
import { InventoryQrLabelViewerModal } from '../modals/InventoryQrLabelViewerModal';
import {
  Boxes,
  AlertTriangle,
  PlusCircle,
  Search,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  History,
  X,
  Sliders,
  CheckCircle2,
  Package,
  ShoppingBag,
  Camera,
  QrCode,
} from 'lucide-react';

export const InventoryScreen: React.FC = () => {
  const {
    products,
    lowStockProducts,
    transactions,
    getReplenishmentRecommendations,
    adjustInventoryManual,
    createPurchaseRequest,
    setActiveTab,
    screenSearchQuery,
    setScreenSearchQuery,
  } = useProcurement();

  const [search, setSearch] = useState(screenSearchQuery || '');

  React.useEffect(() => {
    if (screenSearchQuery !== undefined && screenSearchQuery !== '') {
      setSearch(screenSearchQuery);
    }
  }, [screenSearchQuery]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState<Product | null>(null);
  const [stockDelta, setStockDelta] = useState<number>(10);
  const [adjustNotes, setAdjustNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // QR Code Scanner and QR Label Viewer Modals
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [selectedProductForQr, setSelectedProductForQr] = useState<Product | null>(null);

  const categories = Array.from(
    new Set(products.map((p) => p.categoryName || p.category || 'General'))
  );

  const filteredProducts = products.filter((p) => {
    const cat = (p.categoryName || p.category || '').toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.productCode.toLowerCase().includes(search.toLowerCase()) ||
      cat.includes(search.toLowerCase());

    const matchesCat =
      selectedCategory === 'ALL' ||
      p.categoryName === selectedCategory ||
      p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const replenishmentItems = getReplenishmentRecommendations();

  const handleOpenAdjust = (prod: Product) => {
    setSelectedProductForAdjust(prod);
    setStockDelta(10);
    setAdjustNotes('Physical cycle count discrepancy adjustment');
    setShowAdjustModal(true);
  };

  const handleConfirmAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForAdjust) return;
    setIsSubmitting(true);
    try {
      await adjustInventoryManual(selectedProductForAdjust.id, Number(stockDelta), adjustNotes);
      setShowAdjustModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateReplenishRequisition = async (item: typeof replenishmentItems[0]) => {
    await createPurchaseRequest(
      Priority.HIGH,
      'Inventory Replenishment',
      `Restock low-inventory item ${item.product.name} up to capacity (${item.recommendedQuantity} ${item.product.unit})`,
      [{ product: item.product, quantity: item.recommendedQuantity }]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
            Enterprise Inventory & Automated Inwarding
          </h2>
          <p className="text-xs text-slate-500">
            Real-time warehouse stock balances, low-stock threshold triggers, and inbound receipt ledger
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            id="btn-open-qr-scanner"
            onClick={() => setShowQrScanner(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00639A] hover:bg-[#004B76] text-white font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Scan QR Stock Label</span>
          </button>

          <button
            onClick={() => setActiveTab(AppTab.SHOPPING)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-xs transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-blue-600" />
            <span>Procure Catalog</span>
          </button>
        </div>
      </div>

      {/* Replenishment Recommendations Shelf */}
      {replenishmentItems.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-200" />
              <h3 className="font-bold text-sm uppercase tracking-wider">
                Automated Replenishment Advisories ({replenishmentItems.length} Low-Stock Items)
              </h3>
            </div>
          </div>

          <p className="text-xs text-amber-100 mb-4">
            Safety stock thresholds breached. Reorder to prevent manufacturing and fulfillment downtime:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {replenishmentItems.map((item) => (
              <div
                key={item.product.id}
                className="bg-white text-slate-900 rounded-2xl p-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-xs truncate max-w-[180px]">
                      {item.product.name}
                    </h4>
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                      Deficit
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Available: <strong className="text-rose-600">{item.currentStock}</strong> / Safety: {item.minimumStock} {item.product.unit}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    Recommended Order:{' '}
                    <strong className="text-slate-900">
                      +{item.recommendedQuantity} {item.product.unit}
                    </strong>{' '}
                    (Est. ₹{item.estimatedCost.toLocaleString('en-IN')})
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Pref: {item.preferredSupplier?.companyName || 'Standard'}
                  </span>
                  <button
                    onClick={() => handleCreateReplenishRequisition(item)}
                    className="px-2.5 py-1 bg-[#00639A] hover:bg-[#004B76] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Requisition</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#191C20] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search item SKU, name, or category..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#00639A]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            id="btn-filter-scan-label"
            onClick={() => setShowQrScanner(true)}
            className="text-xs px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#00639A] dark:text-sky-400 font-bold border border-blue-200 dark:border-blue-900 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan Label</span>
          </button>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-[#191C20] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                <th className="pb-3">Product Name / Code</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Unit Price</th>
                <th className="pb-3">Available Stock</th>
                <th className="pb-3">Safety Min / Max</th>
                <th className="pb-3">Stock Level</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredProducts.map((prod) => {
                const isLow = prod.availableQuantity <= prod.minimumStock;
                const percent = Math.min(
                  100,
                  Math.round((prod.availableQuantity / prod.maximumStock) * 100)
                );

                return (
                  <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-medium text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
                          {prod.imageUrl ? (
                            <img
                              src={prod.imageUrl}
                              alt={prod.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-xs sm:text-sm line-clamp-1">{prod.name}</div>
                          <div className="font-mono text-[10px] text-slate-400">{prod.productCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {prod.category}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">
                      ₹{prod.unitPrice.toLocaleString('en-IN')}/{prod.unit}
                    </td>
                    <td className="py-3 font-bold text-slate-900 dark:text-slate-100">
                      <span className={isLow ? 'text-rose-600 font-black' : ''}>
                        {prod.availableQuantity} {prod.unit}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">
                      Min: {prod.minimumStock} | Max: {prod.maximumStock}
                    </td>
                    <td className="py-3">
                      <div className="w-24">
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className={isLow ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                            {percent}%
                          </span>
                          {isLow && (
                            <span className="text-[10px] text-rose-600 font-bold uppercase">
                              Low
                            </span>
                          )}
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isLow ? 'bg-rose-500' : percent > 70 ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedProductForQr(prod)}
                          title="Print / View QR Label"
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-[#00639A] dark:hover:text-sky-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenAdjust(prod)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#00639A] dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          Adjust Stock
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inwarding Transaction History Ledger */}
      <div className="bg-white dark:bg-[#191C20] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-[#00639A]" />
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            Automated Inbound Stock Ledger & Movement Log
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Product Name</th>
                <th className="pb-3">Transaction Type</th>
                <th className="pb-3">Change (Qty)</th>
                <th className="pb-3">Pre / Post Stock</th>
                <th className="pb-3">Reference / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {transactions.slice(0, 8).map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 text-slate-400">
                    {new Date(tx.createdAt).toLocaleTimeString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 font-medium text-slate-900 dark:text-slate-100">
                    {tx.productName}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                        tx.transactionType === TransactionType.PURCHASE_RECEIPT
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : tx.transactionType === TransactionType.ADJUSTMENT
                          ? 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {tx.transactionType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 font-mono font-bold">
                    <span className={tx.quantityChanged > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {tx.quantityChanged > 0 ? `+${tx.quantityChanged}` : tx.quantityChanged}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">
                    {tx.previousStock} → <strong className="text-slate-800 dark:text-slate-200">{tx.newStock}</strong>
                  </td>
                  <td className="py-3 text-slate-500 text-[11px] truncate max-w-[200px]">
                    {tx.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Stock Adjustment Modal */}
      {showAdjustModal && selectedProductForAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#191C20] rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Manual Stock Adjustment
                </h3>
                <p className="text-xs text-slate-500">{selectedProductForAdjust.name}</p>
              </div>
              <button onClick={() => setShowAdjustModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleConfirmAdjust} className="space-y-3.5">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <span className="text-slate-400 block uppercase font-bold text-[10px]">
                  Current Physical Stock
                </span>
                <span className="text-base font-black text-slate-900 dark:text-slate-100">
                  {selectedProductForAdjust.availableQuantity} {selectedProductForAdjust.unit}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Delta Stock Quantity (+ to add, - to deduct)
                </label>
                <input
                  type="number"
                  value={stockDelta}
                  onChange={(e) => setStockDelta(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Audit / Adjustment Reason
                </label>
                <input
                  type="text"
                  required
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="e.g. Broken packaging write-off or cycle audit"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#00639A] hover:bg-[#004B76] text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50"
                >
                  Record Audit Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code & Barcode Camera Scanner Modal */}
      <InventoryQrScannerModal
        isOpen={showQrScanner}
        onClose={() => setShowQrScanner(false)}
      />

      {/* QR Warehouse Stock Label Viewer & Print Modal */}
      <InventoryQrLabelViewerModal
        isOpen={!!selectedProductForQr}
        product={selectedProductForQr}
        onClose={() => setSelectedProductForQr(null)}
      />
    </div>
  );
};
