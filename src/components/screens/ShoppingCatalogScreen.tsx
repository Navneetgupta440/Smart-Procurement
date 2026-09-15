import React, { useState, useMemo } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { Product, AppTab, Priority } from '../../types/procurement';
import { ProcureLogo } from '../common/ProcureLogo';
import {
  Search,
  Filter,
  ShoppingCart,
  Check,
  Star,
  ShieldCheck,
  Truck,
  Sparkles,
  Zap,
  Info,
  X,
  Plus,
  Minus,
  ArrowRight,
  SlidersHorizontal,
  Grid,
  List,
  Tag,
  Building,
  CheckCircle2,
  Package,
  Layers,
  FileSpreadsheet,
  AlertTriangle,
  Eye,
} from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
}

// Curated high-resolution 16:9 product photography placeholders (800x450, 16:9 ratio)
export const DEFAULT_PRODUCT_16X9_IMAGES: Record<string, string> = {
  // IT & Laptops & Workstations
  'IT-TP-X1-C11': 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=900&h=506&q=85',
  'IT-MBP-16-M3': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&h=506&q=85',
  'IT-HP-Z4-G5': 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=900&h=506&q=85',
  // Datacenter & Servers & Storage
  'SRV-DL-R760': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&h=506&q=85',
  'NAS-SYN-1821': 'https://images.unsplash.com/photo-1597852074816-d933c4d2b988?auto=format&fit=crop&w=900&h=506&q=85',
  'SRV-APC-42U': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&h=506&q=85',
  // Networking, Security & Switching
  'NET-CS-C9300': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&h=506&q=85',
  'SEC-FG-100F': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&h=506&q=85',
  'NET-UBI-UDMSE': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&h=506&q=85',
  'NET-ARU-6200': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&h=506&q=85',
  // Ergonomic Furniture & Desks
  'ERG-CH-PRO': 'https://images.unsplash.com/photo-1580481077197-2a62886f4a86?auto=format&fit=crop&w=900&h=506&q=85',
  'ERG-SC-GEST': 'https://images.unsplash.com/photo-1580481077197-2a62886f4a86?auto=format&fit=crop&w=900&h=506&q=85',
  'ERG-ERG-TX': 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&h=506&q=85',
  // Power & Smart-UPS
  'PWR-APC-3000': 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=900&h=506&q=85',
  'PWR-VRT-5000': 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=900&h=506&q=85',
  'PWR-ETN-9PX3K': 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=900&h=506&q=85',
  // Peripherals & Accessories
  'ACC-LOG-MX3S': 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&h=506&q=85',
  // Displays & Monitors
  'DISP-SAM-34C': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&h=506&q=85',
  'DISP-DEL-43U': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&h=506&q=85',
  // Structured Cabling & Tools
  'CAB-CAT6-305M': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&h=506&q=85',
  'IND-FLK-DSX602': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&h=506&q=85',
  'IND-BSH-GLL380': 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=900&h=506&q=85',
  // Audio & Video Conference
  'AUD-SNY-WH1000': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&h=506&q=85',
  'AUD-PLY-X50': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&h=506&q=85',
  'AUD-LOG-RALLY': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&h=506&q=85',
  // Generic Tech Fallback
  'DEFAULT': 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=900&h=506&q=85',
};

export const getProduct16x9Image = (product: Product): string => {
  // 1. Exact match by productCode
  if (product.productCode && DEFAULT_PRODUCT_16X9_IMAGES[product.productCode]) {
    return DEFAULT_PRODUCT_16X9_IMAGES[product.productCode];
  }

  // 2. Unsplash URL optimization for 16:9 ratio
  if (product.imageUrl && product.imageUrl.startsWith('http')) {
    if (product.imageUrl.includes('images.unsplash.com')) {
      const base = product.imageUrl.split('?')[0];
      return `${base}?auto=format&fit=crop&w=900&h=506&q=85`;
    }
    return product.imageUrl;
  }

  // 3. Keyword / Category heuristic match
  const searchStr = `${product.name} ${product.categoryName || ''} ${product.description || ''} ${product.brand || ''}`.toLowerCase();
  if (searchStr.includes('laptop') || searchStr.includes('thinkpad') || searchStr.includes('lenovo')) {
    return DEFAULT_PRODUCT_16X9_IMAGES['IT-TP-X1-C11'];
  }
  if (searchStr.includes('macbook') || searchStr.includes('apple') || searchStr.includes('notebook')) {
    return DEFAULT_PRODUCT_16X9_IMAGES['IT-MBP-16-M3'];
  }
  if (searchStr.includes('workstation') || searchStr.includes('hp z4') || searchStr.includes('cad')) {
    return DEFAULT_PRODUCT_16X9_IMAGES['IT-HP-Z4-G5'];
  }
  if (searchStr.includes('server') || searchStr.includes('poweredge') || searchStr.includes('rack') || searchStr.includes('xeon')) {
    return DEFAULT_PRODUCT_16X9_IMAGES['SRV-DL-R760'];
  }
  if (searchStr.includes('nas') || searchStr.includes('synology') || searchStr.includes('diskstation')) {
    return DEFAULT_PRODUCT_16X9_IMAGES['NAS-SYN-1821'];
  }
  if (searchStr.includes('firewall') || searchStr.includes('fortinet') || searchStr.includes('fortigate') || searchStr.includes('security')) {
    return DEFAULT_PRODUCT_16X9_IMAGES['SEC-FG-100F'];
  }
  if (searchStr.includes('switch') || searchStr.includes('cisco') || searchStr.includes('aruba') || searchStr.includes('unifi') || searchStr.includes('network') || searchStr.includes('router')) {
    return DEFAULT_PRODUCT_16X9_IMAGES['NET-CS-C9300'];
  }
  if (searchStr.includes('chair') || searchStr.includes('gesture') || searchStr.includes('steelcase') || searchStr.includes('ergonomic')) {
    return DEFAULT_PRODUCT_16X9_IMAGES['ERG-CH-PRO'];
  }
  if (searchStr.includes('standing desk') || searchStr.includes('ergotron') || searchStr.includes('converter')) {
    return DEFAULT_PRODUCT_16X9_IMAGES['ERG-ERG-TX'];
  }
  if (searchStr.includes('ups') || searchStr.includes('power') || searchStr.includes('battery') || searchStr.includes('apc') || searchStr.includes('vertiv') || searchStr.includes('eaton')) {
    return DEFAULT_PRODUCT_16X9_IMAGES['PWR-APC-3000'];
  }
  if (searchStr.includes('mouse') || searchStr.includes('keyboard') || searchStr.includes('logitech') || searchStr.includes('peripheral')) {
    return DEFAULT_PRODUCT_16X9_IMAGES['ACC-LOG-MX3S'];
  }
  if (searchStr.includes('monitor') || searchStr.includes('display') || searchStr.includes('curved') || searchStr.includes('screen') || searchStr.includes('ultrasharp')) {
    return DEFAULT_PRODUCT_16X9_IMAGES['DISP-SAM-34C'];
  }
  if (searchStr.includes('cable') || searchStr.includes('cat6') || searchStr.includes('utp') || searchStr.includes('wire')) {
    return DEFAULT_PRODUCT_16X9_IMAGES['CAB-CAT6-305M'];
  }
  if (searchStr.includes('fluke') || searchStr.includes('cableanalyzer') || searchStr.includes('certifier')) {
    return DEFAULT_PRODUCT_16X9_IMAGES['IND-FLK-DSX602'];
  }
  if (searchStr.includes('laser') || searchStr.includes('bosch') || searchStr.includes('level')) {
    return DEFAULT_PRODUCT_16X9_IMAGES['IND-BSH-GLL380'];
  }
  if (searchStr.includes('video') || searchStr.includes('poly') || searchStr.includes('rally') || searchStr.includes('conference')) {
    return DEFAULT_PRODUCT_16X9_IMAGES['AUD-PLY-X50'];
  }
  if (searchStr.includes('audio') || searchStr.includes('headphone') || searchStr.includes('sound') || searchStr.includes('sony')) {
    return DEFAULT_PRODUCT_16X9_IMAGES['AUD-SNY-WH1000'];
  }

  return DEFAULT_PRODUCT_16X9_IMAGES['DEFAULT'];
};

export const ShoppingCatalogScreen: React.FC = () => {
  const {
    products,
    currentUser,
    createPurchaseRequest,
    setActiveTab,
    suppliers,
  } = useProcurement();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilterMode, setSearchFilterMode] = useState<'ALL' | 'NAME' | 'CATEGORY'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'POPULARITY' | 'PRICE_ASC' | 'PRICE_DESC' | 'RATING' | 'DISCOUNT'>('POPULARITY');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');

  // Shopping Cart / Requisition Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [requisitionReason, setRequisitionReason] = useState('');
  const [requisitionDepartment, setRequisitionDepartment] = useState(currentUser?.department || 'IT Operations');
  const [requisitionPriority, setRequisitionPriority] = useState<Priority>(Priority.MEDIUM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Categories extraction
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.categoryName) set.add(p.categoryName);
    });
    return Array.from(set);
  }, [products]);

  // Brands extraction
  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set);
  }, [products]);

  // Filtered & Sorted Products with Real-Time Name & Category Matching
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let list = products.filter((p) => {
      let matchesSearch = true;

      if (query) {
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesCategoryName = (p.categoryName || '').toLowerCase().includes(query);
        const matchesCategoryId = (p.categoryId || '').toLowerCase().includes(query);
        const matchesBrand = (p.brand || '').toLowerCase().includes(query);
        const matchesCode = (p.productCode || '').toLowerCase().includes(query);
        const matchesDescription = (p.description || '').toLowerCase().includes(query);

        if (searchFilterMode === 'NAME') {
          matchesSearch = matchesName || matchesBrand || matchesCode;
        } else if (searchFilterMode === 'CATEGORY') {
          matchesSearch = matchesCategoryName || matchesCategoryId;
        } else {
          // 'ALL': Real-time filter by product name OR category (also checking brand, specs & code)
          matchesSearch =
            matchesName ||
            matchesCategoryName ||
            matchesCategoryId ||
            matchesBrand ||
            matchesCode ||
            matchesDescription;
        }
      }

      const matchesCategory = selectedCategory === 'ALL' || p.categoryName === selectedCategory;
      const matchesBrand = selectedBrand === 'ALL' || p.brand === selectedBrand;

      return matchesSearch && matchesCategory && matchesBrand;
    });

    switch (sortBy) {
      case 'PRICE_ASC':
        return list.sort((a, b) => a.unitPrice - b.unitPrice);
      case 'PRICE_DESC':
        return list.sort((a, b) => b.unitPrice - a.unitPrice);
      case 'RATING':
        return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'DISCOUNT':
        return list.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
      case 'POPULARITY':
      default:
        return list.sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0));
    }
  }, [products, searchQuery, searchFilterMode, selectedCategory, selectedBrand, sortBy]);

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.unitPrice * item.quantity, 0);
  const cartEstimatedTax = cartSubtotal * 0.18; // 18% GST standard
  const cartGrandTotal = cartSubtotal + cartEstimatedTax;

  // Convert Cart into formal Purchase Requisition
  const handleCheckoutRequisition = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const items = cart.map((item) => ({
        productId: item.product.id,
        productCode: item.product.productCode,
        productName: item.product.name,
        quantity: item.quantity,
        estimatedUnitPrice: item.product.unitPrice,
        estimatedTotal: item.product.unitPrice * item.quantity,
      }));

      const defaultReason =
        requisitionReason.trim() ||
        `Procured ${cartTotalItems} item(s) via Procure E-Procurement Catalog for ${requisitionDepartment}`;

      await createPurchaseRequest(
        requisitionPriority,
        requisitionDepartment,
        defaultReason,
        cart.map((item) => ({ product: item.product, quantity: item.quantity }))
      );

      setCart([]);
      setShowCartDrawer(false);
      setRequisitionReason('');
      setActiveTab(AppTab.REQUESTS);
    } catch (err) {
      console.error('Failed to create purchase requisition from cart', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Procure Brand Strip / Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md">
        <div className="absolute right-0 top-0 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono text-yellow-300">
              <ProcureLogo size="sm" />
              <span>Procure E-Procurement System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
              Enterprise Shopping Catalog &amp; Requisition Cart
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
              Explore enterprise-grade hardware, networking racks, power systems, and executive furnishings.
              Add verified items directly to your Requisition Cart and auto-generate Purchase Requests with 1-click.
            </p>
          </div>

          {/* Cart Floating / Sticky Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCartDrawer(true)}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-sm shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartTotalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 text-white text-[11px] font-mono flex items-center justify-center font-bold">
                    {cartTotalItems}
                  </span>
                )}
              </div>
              <div className="text-left">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-800">Requisition Cart</div>
                <div className="font-bold text-sm">{formatINR(cartSubtotal)}</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Category Horizontal Quick Bar (Procure) */}
      <div className="bg-white dark:bg-[#191C20] rounded-2xl p-3 border border-[#121212]/10 dark:border-slate-800 shadow-xs flex items-center gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            selectedCategory === 'ALL'
              ? 'bg-[#121212] text-white dark:bg-white dark:text-slate-900'
              : 'bg-[#F9F7F2] dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          All Items ({products.length})
        </button>

        {categories.map((cat) => {
          const count = products.filter((p) => p.categoryName === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#F9F7F2] dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span>{cat}</span>
              <span className="opacity-70 text-[10px]">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search, Filter & Sort Bar */}
      <div className="bg-white dark:bg-[#191C20] rounded-2xl p-4 sm:p-5 border border-[#121212]/10 dark:border-slate-800 shadow-xs space-y-3.5">
        {/* Main Row: Real-Time Search input + Filter Target Mode + Brand + Sort + View */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Primary Real-Time Search Bar */}
          <div className="relative flex-1 flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={
                searchFilterMode === 'NAME'
                  ? 'Filter by product name in real-time (e.g. ThinkPad, MacBook, FortiGate, UPS)...'
                  : searchFilterMode === 'CATEGORY'
                  ? 'Filter by category in real-time (e.g. Networking, IT, Office, Power, Tools)...'
                  : 'Filter products by name or category in real-time...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 rounded-xl text-xs sm:text-sm bg-[#F9F7F2] dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
            />
            {/* Live Indicator / Clear Button */}
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md font-semibold border border-emerald-200/50 dark:border-emerald-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Filter
                </span>
              )}
            </div>
          </div>

          {/* Real-Time Filter Target Selector */}
          <div className="flex items-center bg-[#F9F7F2] dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold self-start lg:self-auto">
            <span className="text-[11px] text-slate-400 px-2 hidden xl:inline">Filter By:</span>
            <button
              onClick={() => setSearchFilterMode('ALL')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                searchFilterMode === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Filter by both name and category"
            >
              Name & Category
            </button>
            <button
              onClick={() => setSearchFilterMode('NAME')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                searchFilterMode === 'NAME'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Filter only by product name"
            >
              Name Only
            </button>
            <button
              onClick={() => setSearchFilterMode('CATEGORY')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                searchFilterMode === 'CATEGORY'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Filter only by category"
            >
              Category Only
            </button>
          </div>

          {/* Brand & Sort Filters & View Mode */}
          <div className="flex flex-wrap items-center gap-2.5 justify-between lg:justify-end">
            {/* Brand Filter */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl bg-[#F9F7F2] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs px-3 py-2 rounded-xl bg-[#F9F7F2] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="POPULARITY">Popularity / Ratings</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
              <option value="RATING">Highest Rated</option>
              <option value="DISCOUNT">Discount %</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#F9F7F2] dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'GRID'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('LIST')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'LIST'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Clickable Suggestions / Popular Filter Chips */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1 text-[11px]">
            <Tag className="w-3 h-3" /> Real-Time Suggestions:
          </span>

          {/* Category Suggestions */}
          {categories.slice(0, 4).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSearchFilterMode('CATEGORY');
                setSearchQuery(cat);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                searchQuery === cat && searchFilterMode === 'CATEGORY'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60'
              }`}
            >
              Category: {cat}
            </button>
          ))}

          {/* Product Name Suggestions */}
          {['ThinkPad', 'FortiGate', 'MacBook', 'PowerEdge', 'Smart-UPS', 'Fluke'].map((name) => (
            <button
              key={name}
              onClick={() => {
                setSearchFilterMode('NAME');
                setSearchQuery(name);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                searchQuery === name && searchFilterMode === 'NAME'
                  ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Name: {name}
            </button>
          ))}

          {(searchQuery || selectedCategory !== 'ALL' || selectedBrand !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchFilterMode('ALL');
                setSelectedCategory('ALL');
                setSelectedBrand('ALL');
              }}
              className="ml-auto text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 py-1"
            >
              <X className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Status Indicator Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500">
        <div>
          Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredProducts.length}</span> of{' '}
          <span className="font-bold text-slate-800 dark:text-slate-200">{products.length}</span> products in catalog
          {searchQuery && (
            <span className="ml-2 inline-flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200/50 dark:border-blue-900/50">
              Live filtered by {searchFilterMode === 'CATEGORY' ? 'category' : searchFilterMode === 'NAME' ? 'product name' : 'name or category'}: &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>
      </div>

      {/* Product Grid View (Procure Cards) */}
      {viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const inCart = cart.find((item) => item.product.id === product.id);
            const supplier = suppliers.find((s) => s.id === product.supplierId);
            const productPhotoUrl = getProduct16x9Image(product);

            return (
              <div
                key={product.id}
                className="bg-white dark:bg-[#191C20] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-blue-500/40 dark:hover:border-blue-500/30 hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* 16:9 Product Photo Container above details */}
                <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                  <img
                    src={productPhotoUrl}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== DEFAULT_PRODUCT_16X9_IMAGES.DEFAULT) {
                        target.src = DEFAULT_PRODUCT_16X9_IMAGES.DEFAULT;
                      }
                    }}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                  />

                  {/* Subtle catalogue vignette on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Discount Badge */}
                  {product.discountPercent && (
                    <div className="absolute top-2.5 left-2.5 bg-emerald-600/95 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs backdrop-blur-xs tracking-wide">
                      {product.discountPercent}% OFF
                    </div>
                  )}

                  {/* Procure Assured Badge */}
                  {product.assuredBadge && (
                    <div className="absolute top-2.5 right-2.5 bg-blue-600/95 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs border border-blue-400/30 backdrop-blur-xs">
                      <Zap className="w-2.5 h-2.5 text-yellow-300 fill-current" />
                      <span>Assured</span>
                    </div>
                  )}

                  {/* Stock Notice */}
                  {product.isLowStock && (
                    <div className="absolute bottom-2.5 left-2.5 group-hover:opacity-0 transition-opacity duration-200 bg-amber-500/95 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs backdrop-blur-xs">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Only {product.availableQuantity} left</span>
                    </div>
                  )}

                  {/* Hover Quick Action Pill */}
                  <div className="absolute inset-x-0 bottom-2.5 px-3 flex items-center justify-between opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickViewProduct(product);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 text-xs font-semibold shadow-md backdrop-blur-xs hover:bg-white dark:hover:bg-slate-900 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Quick Specs</span>
                    </button>
                    <span className="text-[10px] font-mono text-white/90 bg-black/50 backdrop-blur-xs px-2 py-1 rounded-md">
                      {product.categoryName || 'Enterprise'}
                    </span>
                  </div>
                </div>

                {/* Card Content & Details */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    {/* Brand & Category */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        {product.brand || 'Enterprise'}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">{product.productCode}</span>
                    </div>

                    {/* Product Name */}
                    <h3
                      onClick={() => setQuickViewProduct(product)}
                      className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors leading-snug pt-0.5"
                      title={product.name}
                    >
                      {product.name}
                    </h3>

                    {/* Rating Pill & Delivery */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-700 text-white text-[11px] font-bold">
                        <span>{product.rating || 4.7}</span>
                        <Star className="w-3 h-3 fill-current text-white" />
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        ({product.ratingCount || 1200})
                      </span>
                      <span className="text-[10px] text-slate-400">• Free Delivery</span>
                    </div>

                    {/* Price Section */}
                    <div className="pt-1 flex items-baseline gap-2">
                      <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {formatINR(product.unitPrice)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatINR(product.originalPrice)}
                        </span>
                      )}
                      {product.discountPercent && (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {product.discountPercent}% off
                        </span>
                      )}
                    </div>

                    {/* Procure Spec Highlights */}
                    {product.features && product.features.length > 0 && (
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 pt-1">
                        <p className="line-clamp-1">• {product.features[0]}</p>
                        <p className="line-clamp-1">• {product.features[1] || product.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions Area */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    {inCart ? (
                      <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/40 p-1.5 rounded-lg border border-blue-200 dark:border-blue-900">
                        <button
                          onClick={() => updateCartQuantity(product.id, inCart.quantity - 1)}
                          className="w-7 h-7 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-mono font-bold text-blue-900 dark:text-blue-200">
                          {inCart.quantity} in Requisition Cart
                        </span>
                        <button
                          onClick={() => updateCartQuantity(product.id, inCart.quantity + 1)}
                          className="w-7 h-7 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setQuickViewProduct(product)}
                          className="py-2 px-2.5 rounded-lg text-xs font-medium bg-[#F9F7F2] dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-center"
                        >
                          Specs / Details
                        </button>
                        <button
                          onClick={() => addToCart(product, 1)}
                          className="py-2 px-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white transition-all flex items-center justify-center gap-1 shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Product List View (Procure Search Results) */
        <div className="space-y-4">
          {filteredProducts.map((product) => {
            const inCart = cart.find((item) => item.product.id === product.id);

            return (
              <div
                key={product.id}
                className="bg-white dark:bg-[#191C20] rounded-2xl border border-[#121212]/10 dark:border-slate-800 p-4 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start"
              >
                {/* Left: 16:9 Image */}
                <div className="w-full md:w-56 aspect-[16/9] md:h-auto bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden shrink-0 relative border border-slate-200/80 dark:border-slate-800">
                  <img
                    src={getProduct16x9Image(product)}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== DEFAULT_PRODUCT_16X9_IMAGES.DEFAULT) {
                        target.src = DEFAULT_PRODUCT_16X9_IMAGES.DEFAULT;
                      }
                    }}
                    className="w-full h-full object-cover object-center"
                  />
                  {product.discountPercent && (
                    <div className="absolute top-2 left-2 bg-emerald-600/95 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs backdrop-blur-xs">
                      {product.discountPercent}% OFF
                    </div>
                  )}
                </div>

                {/* Center: Specs & Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                      {product.brand || 'Enterprise'}
                    </span>
                    <span className="text-xs font-mono text-slate-400">• {product.productCode}</span>
                    {product.assuredBadge && (
                      <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Zap className="w-2.5 h-2.5 fill-current text-yellow-300" />
                        Assured
                      </span>
                    )}
                  </div>

                  <h3
                    onClick={() => setQuickViewProduct(product)}
                    className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 cursor-pointer transition-colors"
                  >
                    {product.name}
                  </h3>

                  {/* Ratings */}
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-700 text-white text-xs font-bold">
                      <span>{product.rating || 4.7}</span>
                      <Star className="w-3 h-3 fill-current text-white" />
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {product.ratingCount || 1200} Ratings &amp; Reviews
                    </span>
                  </div>

                  {/* Bullet Highlights */}
                  {product.features && (
                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-1 list-disc pl-4">
                      {product.features.map((feat, idx) => (
                        <li key={idx}>{feat}</li>
                      ))}
                    </ul>
                  )}

                  <p className="text-xs text-slate-500 pt-1">
                    Warranty: {product.warranty || '1 Year Standard Enterprise Warranty'}
                  </p>
                </div>

                {/* Right: Price & CTA */}
                <div className="w-full md:w-60 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-6 pt-4 md:pt-0 space-y-3">
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {formatINR(product.unitPrice)}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {product.originalPrice && (
                        <span className="text-slate-400 line-through">
                          {formatINR(product.originalPrice)}
                        </span>
                      )}
                      {product.discountPercent && (
                        <span className="font-bold text-emerald-600">{product.discountPercent}% off</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Available Stock: <span className="font-bold font-mono">{product.availableQuantity} Units</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-lg border border-emerald-200 dark:border-emerald-900">
                    ⚡ Free Delivery by Tomorrow, 5 PM
                  </div>

                  {inCart ? (
                    <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/40 p-2 rounded-xl border border-blue-200 dark:border-blue-900">
                      <button
                        onClick={() => updateCartQuantity(product.id, inCart.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-mono font-bold text-blue-900 dark:text-blue-200">
                        {inCart.quantity} in Cart
                      </span>
                      <button
                        onClick={() => updateCartQuantity(product.id, inCart.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(product, 1)}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add to Requisition</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State when no products match real-time query */}
      {filteredProducts.length === 0 && (
        <div className="bg-white dark:bg-[#191C20] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 sm:p-14 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/50">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              No products found {searchQuery ? `matching "${searchQuery}"` : ''}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              We couldn&apos;t find any enterprise items matching your real-time search for{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {searchFilterMode === 'CATEGORY'
                  ? 'categories'
                  : searchFilterMode === 'NAME'
                  ? 'product names'
                  : 'names or categories'}
              </span>
              . Try searching by another product name or category, or clear your filters.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
              >
                Clear Search Query
              </button>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchFilterMode('ALL');
                setSelectedCategory('ALL');
                setSelectedBrand('ALL');
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Reset All Filters (View All {products.length} Products)
            </button>
          </div>
        </div>
      )}

      {/* QUICK VIEW MODAL */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#191C20] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#121212]/10 dark:border-slate-800 p-6 sm:p-8 space-y-6 relative shadow-lg">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* 16:9 Image Preview */}
              <div className="bg-slate-100 dark:bg-slate-900 rounded-xl aspect-[16/9] w-full flex items-center justify-center relative overflow-hidden border border-slate-200/80 dark:border-slate-800">
                <img
                  src={getProduct16x9Image(quickViewProduct)}
                  alt={quickViewProduct.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== DEFAULT_PRODUCT_16X9_IMAGES.DEFAULT) {
                      target.src = DEFAULT_PRODUCT_16X9_IMAGES.DEFAULT;
                    }
                  }}
                  className="w-full h-full object-cover object-center"
                />
                {quickViewProduct.discountPercent && (
                  <div className="absolute top-3 left-3 bg-emerald-600/95 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs backdrop-blur-xs">
                    {quickViewProduct.discountPercent}% OFF
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600 uppercase">
                      {quickViewProduct.brand || 'Enterprise'}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      • {quickViewProduct.productCode}
                    </span>
                  </div>
                  <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {quickViewProduct.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-700 text-white text-xs font-bold">
                      <span>{quickViewProduct.rating || 4.7}</span>
                      <Star className="w-3 h-3 fill-current text-white" />
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      ({quickViewProduct.ratingCount || 1400} Customer Ratings)
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {formatINR(quickViewProduct.unitPrice)}
                  </div>
                  {quickViewProduct.originalPrice && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 line-through">
                        {formatINR(quickViewProduct.originalPrice)}
                      </span>
                      <span className="font-bold text-emerald-600">
                        {quickViewProduct.discountPercent}% off
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {quickViewProduct.description}
                </p>

                {quickViewProduct.features && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                      Key Technical Specifications:
                    </span>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
                      {quickViewProduct.features.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => {
                      addToCart(quickViewProduct, 1);
                      setQuickViewProduct(null);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Requisition Cart</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REQUISITION CART DRAWER (RIGHT PANEL) */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white dark:bg-[#191C20] h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-slate-100">
                  Requisition Cart ({cartTotalItems} items)
                </h3>
              </div>
              <button
                onClick={() => setShowCartDrawer(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
                  <ShoppingCart className="w-12 h-12 text-slate-300" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Your Requisition Cart is empty
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Browse the Procure catalog and add computing, network, or facility assets to request purchasing approval.
                  </p>
                </div>
              ) : (
                cart.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="p-3.5 rounded-2xl bg-[#F9F7F2] dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex gap-3.5 items-center"
                  >
                    <div className="w-16 h-12 rounded-lg bg-white dark:bg-slate-900 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                      <img
                        src={getProduct16x9Image(product)}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {formatINR(product.unitPrice)} each
                      </p>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Line Total: {formatINR(product.unitPrice * quantity)}
                      </p>
                    </div>

                    {/* Quantity Modifier */}
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                      <button
                        onClick={() => updateCartQuantity(product.id, quantity - 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono font-bold px-1.5">{quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(product.id, quantity + 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Requisition Meta Inputs (Department & Justification) */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-[#FBF9F5] dark:bg-slate-900/50 space-y-4">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        value={requisitionDepartment}
                        onChange={(e) => setRequisitionDepartment(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        placeholder="e.g. IT Operations"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Urgency Priority
                      </label>
                      <select
                        value={requisitionPriority}
                        onChange={(e) => setRequisitionPriority(e.target.value as Priority)}
                        className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                      >
                        <option value={Priority.LOW}>Low Priority</option>
                        <option value={Priority.MEDIUM}>Medium Priority</option>
                        <option value={Priority.HIGH}>High Priority</option>
                        <option value={Priority.URGENT}>Urgent Priority</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Business Reason / Justification
                    </label>
                    <textarea
                      rows={2}
                      value={requisitionReason}
                      onChange={(e) => setRequisitionReason(e.target.value)}
                      placeholder="e.g. Q3 engineering team expansion and server hardware renewal"
                      className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal ({cartTotalItems} items)</span>
                    <span>{formatINR(cartSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Applicable GST (18% Standard)</span>
                    <span>{formatINR(cartEstimatedTax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-slate-100 pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span>Estimated Requisition Total</span>
                    <span className="text-blue-600 dark:text-blue-400">{formatINR(cartGrandTotal)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckoutRequisition}
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-yellow-400 hover:bg-yellow-300 text-slate-950 shadow-md transition-transform flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Submit Official Purchase Requisition</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
