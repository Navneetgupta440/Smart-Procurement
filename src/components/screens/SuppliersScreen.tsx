import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Product, Supplier } from '../../types/procurement';
import {
  Store,
  Star,
  Award,
  PlusCircle,
  Search,
  Sparkles,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  X,
  Sliders,
  TrendingUp,
} from 'lucide-react';

export const SuppliersScreen: React.FC = () => {
  const {
    suppliers,
    products,
    submitSupplierRating,
    rankSuppliersForProduct,
    addSupplier,
    currentUser,
    orders,
  } = useProcurement();

  const [search, setSearch] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSupplierForRating, setSelectedSupplierForRating] = useState<Supplier>(suppliers[0]);

  // Scoring calculator
  const [selectedProductForRank, setSelectedProductForRank] = useState<Product>(products[0]);

  // Rating Form State
  const [qualityScore, setQualityScore] = useState(90);
  const [deliveryScore, setDeliveryScore] = useState(95);
  const [pricingScore, setPricingScore] = useState(85);
  const [serviceScore, setServiceScore] = useState(90);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Supplier Form State
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [leadDays, setLeadDays] = useState(4);

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.companyName.toLowerCase().includes(search.toLowerCase()) ||
      (s.category || '').toLowerCase().includes(search.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

  const rankedSuppliers = rankSuppliersForProduct(selectedProductForRank);

  const handleOpenRating = (sup: Supplier) => {
    setSelectedSupplierForRating(sup);
    setQualityScore(sup.qualityScore || 90);
    setDeliveryScore(sup.onTimeDeliveryRate || 95);
    setPricingScore(88);
    setServiceScore(90);
    setFeedback('');
    setShowRatingModal(true);
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitSupplierRating({
        supplierId: selectedSupplierForRating.id,
        qualityScore,
        deliveryScore,
        pricingScore,
        serviceScore,
        feedback: feedback || 'Performance verified in compliance with enterprise SLA thresholds.',
        category: selectedSupplierForRating.category,
      });
      setShowRatingModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactPerson.trim()) return;
    const gstVal = gstin || '27AAAAA0000A1Z5';
    addSupplier({
      companyName,
      contactPerson,
      email,
      phone,
      address,
      gstNumber: gstVal,
      gstin: gstVal,
      category,
      status: 'ACTIVE',
      averageLeadDays: Number(leadDays) || 5,
    });
    setShowAddModal(false);
    setCompanyName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
            Strategic Supplier Directory & Performance
          </h2>
          <p className="text-xs text-slate-500">
            Vendor relationship scoring, SLA compliance metrics, and weighted recommendation engine
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#00639A] hover:bg-[#004B76] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register Supplier</span>
        </button>
      </div>

      {/* AI / Weighted Recommendation Engine Card */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Intelligent Supplier Recommendation Engine
              </h3>
              <p className="text-xs text-blue-200">
                Multi-objective ranking: Price (30%), Quality (25%), Delivery (20%), Rating (15%), Reliability (10%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-200">Evaluate for Item:</span>
            <select
              value={selectedProductForRank.id}
              onChange={(e) => {
                const p = products.find((pr) => pr.id === e.target.value);
                if (p) setSelectedProductForRank(p);
              }}
              className="text-xs px-3 py-1.5 rounded-xl bg-white/15 border border-white/20 text-white font-semibold focus:outline-none"
            >
              {products.map((prod) => (
                <option key={prod.id} value={prod.id} className="bg-slate-900 text-white">
                  {prod.name} (₹{prod.unitPrice.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ranked Results Carousel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {rankedSuppliers.slice(0, 3).map((rec, idx) => (
            <div
              key={rec.supplier.id}
              className={`p-4 rounded-2xl border transition-all ${
                idx === 0
                  ? 'bg-white/15 border-sky-400/60 ring-2 ring-sky-400/30'
                  : 'bg-white/10 border-white/15'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    {idx === 0 && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-900">
                        Top Match
                      </span>
                    )}
                    <span className="text-xs font-bold text-white">
                      {rec.supplier.companyName}
                    </span>
                  </div>
                  <div className="text-[11px] text-blue-200 mt-1">
                    Lead Time: {rec.supplier.averageLeadDays} days | SLA: {rec.supplier.onTimeDeliveryRate}%
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xl font-black text-sky-300">
                    {rec.scorePercentage}%
                  </span>
                  <span className="block text-[10px] text-blue-200 uppercase font-bold">Fit Score</span>
                </div>
              </div>

              <p className="text-[11px] text-blue-100 mt-2.5 bg-black/20 p-2 rounded-lg">
                {rec.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-[#191C20] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vendor, category, or contact..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#00639A]"
          />
        </div>
        <div className="text-xs text-slate-500 font-semibold">
          Active Vendors: {filteredSuppliers.length}
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map((sup) => (
          <div
            key={sup.id}
            className="bg-white dark:bg-[#191C20] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {sup.companyName}
                  </h4>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-[#00639A] dark:text-sky-300 inline-block mt-1">
                    {sup.category}
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 px-2 py-1 rounded-xl text-amber-700 dark:text-amber-300 font-bold text-xs">
                  <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                  <span>{sup.rating.toFixed(1)}</span>
                </div>
              </div>

              {/* Vendor Score Matrix */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Quality SLA</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                    {sup.qualityScore}%
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">On-Time Rate</span>
                  <span className="font-black text-blue-600 dark:text-blue-400">
                    {sup.onTimeDeliveryRate}%
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{sup.contactPerson} (GST: {sup.gstin})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{sup.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{sup.email}</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Avg. Lead: <strong className="text-slate-700 dark:text-slate-300">{sup.averageLeadDays} days</strong>
              </span>
              <button
                onClick={() => handleOpenRating(sup)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-[#00639A] hover:text-white dark:bg-slate-800 dark:hover:bg-[#00639A] text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1"
              >
                <Star className="w-3 h-3" />
                <span>Rate Vendor</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Supplier Performance Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#191C20] rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Rate Supplier SLA Performance
                </h3>
                <p className="text-xs text-slate-500">{selectedSupplierForRating.companyName}</p>
              </div>
              <button onClick={() => setShowRatingModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmitRating} className="space-y-3.5">
              {/* Quality Score Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Product Quality SLA Compliance</span>
                  <span className="font-mono text-emerald-600">{qualityScore}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={qualityScore}
                  onChange={(e) => setQualityScore(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              {/* Delivery Score Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>On-Time Dispatch & Arrival</span>
                  <span className="font-mono text-blue-600">{deliveryScore}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={deliveryScore}
                  onChange={(e) => setDeliveryScore(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              {/* Pricing Score Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Commercial & Pricing Competitiveness</span>
                  <span className="font-mono text-amber-600">{pricingScore}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={pricingScore}
                  onChange={(e) => setPricingScore(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>

              {/* Service Score Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Customer Support & Responsiveness</span>
                  <span className="font-mono text-purple-600">{serviceScore}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={serviceScore}
                  onChange={(e) => setServiceScore(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              {/* Overall Preview */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Calculated Evaluation:
                </span>
                <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-slate-100">
                  <Star className="w-4 h-4 fill-current text-amber-500" />
                  <span>
                    {(
                      (qualityScore * 0.35 +
                        deliveryScore * 0.35 +
                        pricingScore * 0.15 +
                        serviceScore * 0.15) /
                      20.0
                    ).toFixed(1)}{' '}
                    / 5.0
                  </span>
                </div>
              </div>

              {/* Written Feedback */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Performance Remarks / Feedback Notes
                </label>
                <textarea
                  rows={2}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="e.g. Excellent packaging, zero shipment defects, quick turnaround..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowRatingModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#00639A] hover:bg-[#004B76] text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50"
                >
                  Record Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register New Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#191C20] rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Register New Enterprise Supplier
              </h3>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddSupplier} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Precision Components Ltd."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="27ABCDE1234F1Z5"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sales@acmeprecision.com"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98200 11223"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Industry Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Electronics">Electronics & Hardware</option>
                    <option value="IT Equipment">IT Equipment & Computing</option>
                    <option value="Industrial Packaging">Industrial Packaging</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Raw Materials">Raw Materials & Fabrication</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Average Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={leadDays}
                    onChange={(e) => setLeadDays(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Operating Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Plot 45, MIDC Industrial Area, Pune"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#00639A] hover:bg-[#004B76] text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
