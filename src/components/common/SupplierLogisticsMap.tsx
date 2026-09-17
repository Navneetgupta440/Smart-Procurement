import React, { useState, useMemo } from 'react';
import { Supplier } from '../../types/procurement';
import {
  MapPin,
  Truck,
  Layers,
  Compass,
  Zap,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Globe,
  ArrowRight,
  Anchor,
  Train,
  Plane,
  Leaf,
  Factory,
  Navigation,
  Info,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export interface RawMaterialOrigin {
  id: string;
  materialName: string;
  category: 'Metals' | 'Semiconductors' | 'Polymers' | 'Wood/Mesh' | 'Power/Cabling' | 'Chemicals';
  originLocation: string;
  originCoords: { x: number; y: number }; // percentage on map canvas
  distanceKm: number;
  transitMode: 'Rail' | 'Road' | 'Maritime' | 'Air';
  inboundLeadDays: number;
  carbonScore: 'Low' | 'Medium' | 'High';
  logisticsAdvice: string;
}

export interface SupplierLogisticsProfile {
  supplierId: string;
  facilityLocation: string;
  state: string;
  region: 'WEST' | 'SOUTH' | 'NORTH' | 'EAST';
  coords: { x: number; y: number }; // percentage on map canvas
  primaryCorridor: string;
  logisticsOptimizationScore: number;
  rawMaterials: RawMaterialOrigin[];
  keyLogisticsAdvantage: string;
  suggestedOptimization: string;
}

// Comprehensive geographical supply chain & raw material origin dataset
export const SUPPLIER_LOGISTICS_PROFILES: Record<string, SupplierLogisticsProfile> = {
  'sup-001': {
    supplierId: 'sup-001',
    facilityLocation: 'Bandra-Kurla Complex (BKC), Mumbai',
    state: 'Maharashtra',
    region: 'WEST',
    coords: { x: 30, y: 56 },
    primaryCorridor: 'Western Dedicated Freight Corridor (WDFC) & NH48',
    logisticsOptimizationScore: 96,
    keyLogisticsAdvantage: 'Direct 35km transit to JNPT Deepwater Port; high-frequency bonded customs clearance.',
    suggestedOptimization: 'Consolidate ocean freight container loads with Southern linehaul routes to cut carbon emissions by 28%.',
    rawMaterials: [
      {
        id: 'rm-101',
        materialName: 'High-Density Silicon Wafers & Chipsets',
        category: 'Semiconductors',
        originLocation: 'Hsinchu Science Park via JNPT Port, Mumbai',
        originCoords: { x: 25, y: 58 },
        distanceKm: 42,
        transitMode: 'Maritime',
        inboundLeadDays: 3,
        carbonScore: 'Low',
        logisticsAdvice: 'JNPT green channel customs clearance ensures 4-hour port turnaround.',
      },
      {
        id: 'rm-102',
        materialName: 'Aircraft-Grade Aluminum Extrusions',
        category: 'Metals',
        originLocation: 'Ratnagiri Metal Smelting Cluster, Maharashtra',
        originCoords: { x: 31, y: 64 },
        distanceKm: 320,
        transitMode: 'Rail',
        inboundLeadDays: 2,
        carbonScore: 'Low',
        logisticsAdvice: 'Konkan electrified freight rail reduces transport bottlenecks by 40%.',
      },
    ],
  },
  'sup-002': {
    supplierId: 'sup-002',
    facilityLocation: 'Electronics City Phase 1, Bengaluru',
    state: 'Karnataka',
    region: 'SOUTH',
    coords: { x: 41, y: 76 },
    primaryCorridor: 'NH44 South-North Trunk Corridor & Bengaluru Air Cargo',
    logisticsOptimizationScore: 93,
    keyLogisticsAdvantage: 'Proximity to Kempegowda International Air Cargo (BLR) and Hosur electronics industrial belt.',
    suggestedOptimization: 'Utilize overnight multi-modal container trains to Chennai harbor instead of interstate diesel trucking.',
    rawMaterials: [
      {
        id: 'rm-201',
        materialName: 'Optical Transceivers & ASIC Controllers',
        category: 'Semiconductors',
        originLocation: 'Penang / Singapore via Chennai Air Freight Hub',
        originCoords: { x: 50, y: 77 },
        distanceKm: 345,
        transitMode: 'Air',
        inboundLeadDays: 2,
        carbonScore: 'Medium',
        logisticsAdvice: 'Consolidated air cargo shipments cut linehaul dwell times from 72h to 18h.',
      },
      {
        id: 'rm-202',
        materialName: 'Sintered NdFeB Rare Earth Magnets',
        category: 'Metals',
        originLocation: 'Mysuru High-Precision Mineral Zone, Karnataka',
        originCoords: { x: 38, y: 80 },
        distanceKm: 145,
        transitMode: 'Road',
        inboundLeadDays: 1,
        carbonScore: 'Low',
        logisticsAdvice: 'Direct expressway transport enables JIT (Just-In-Time) zero-inventory feeder lines.',
      },
    ],
  },
  'sup-003': {
    supplierId: 'sup-003',
    facilityLocation: 'Udyog Vihar Phase IV, Gurugram',
    state: 'Haryana',
    region: 'NORTH',
    coords: { x: 40, y: 29 },
    primaryCorridor: 'Delhi-Mumbai Industrial Corridor (DMIC) & Western Freight Link',
    logisticsOptimizationScore: 88,
    keyLogisticsAdvantage: 'Direct access to Western DFC Rewari container depot & NH48 multi-axle freight highway.',
    suggestedOptimization: 'Shift heavy steel inbound shipments from interstate road trucks to dedicated freight rail cars to save 19% in freight tariff.',
    rawMaterials: [
      {
        id: 'rm-301',
        materialName: 'Cold-Rolled Structural Stainless Steel',
        category: 'Metals',
        originLocation: 'Tata Steel Works, Jamshedpur, Jharkhand',
        originCoords: { x: 67, y: 46 },
        distanceKm: 1240,
        transitMode: 'Rail',
        inboundLeadDays: 5,
        carbonScore: 'Low',
        logisticsAdvice: 'Bulk rail wagons prevent highway toll congestion and reduce cargo dent risk.',
      },
      {
        id: 'rm-302',
        materialName: 'Engineered Flame-Retardant Polymer Resins',
        category: 'Polymers',
        originLocation: 'PCPIR Petrochemical Complex, Dahej, Gujarat',
        originCoords: { x: 26, y: 49 },
        distanceKm: 980,
        transitMode: 'Road',
        inboundLeadDays: 4,
        carbonScore: 'Medium',
        logisticsAdvice: 'Pre-scheduled linehaul schedules reduce transit variance to under 6 hours.',
      },
    ],
  },
  'sup-004': {
    supplierId: 'sup-004',
    facilityLocation: 'Barakhamba Road & Okhla, New Delhi',
    state: 'Delhi NCR',
    region: 'NORTH',
    coords: { x: 43, y: 27 },
    primaryCorridor: 'Golden Quadrilateral (GQ) Northern Route & Taj Expressway',
    logisticsOptimizationScore: 90,
    keyLogisticsAdvantage: 'Centrally situated distribution warehouse serving Northern enterprise operations in under 24 hours.',
    suggestedOptimization: 'Maintain regional buffer stock in Manesar hub to counteract seasonal fog transit delays in winter.',
    rawMaterials: [
      {
        id: 'rm-401',
        materialName: 'FSC-Certified Plantation Teak & Ergonomic Mesh',
        category: 'Wood/Mesh',
        originLocation: 'Nilgiris Sustainable Agroforestry Belt, Kerala',
        originCoords: { x: 39, y: 84 },
        distanceKm: 2180,
        transitMode: 'Rail',
        inboundLeadDays: 6,
        carbonScore: 'Low',
        logisticsAdvice: 'Direct container rail links provide moisture-controlled transit across long distances.',
      },
      {
        id: 'rm-402',
        materialName: 'Recycled Aluminum Cast Bases & Gas Cylinders',
        category: 'Metals',
        originLocation: 'Alang Circular Metallurgy Hub, Bhavnagar, Gujarat',
        originCoords: { x: 23, y: 48 },
        distanceKm: 1120,
        transitMode: 'Road',
        inboundLeadDays: 4,
        carbonScore: 'Low',
        logisticsAdvice: 'Circular economy sourcing reduces raw material cost by 22% with equivalent strength.',
      },
    ],
  },
  'sup-005': {
    supplierId: 'sup-005',
    facilityLocation: 'Guindy Industrial Estate, Chennai',
    state: 'Tamil Nadu',
    region: 'SOUTH',
    coords: { x: 50, y: 78 },
    primaryCorridor: 'Chennai-Bengaluru-Hyderabad Industrial Corridor (CBHIC)',
    logisticsOptimizationScore: 92,
    keyLogisticsAdvantage: 'Direct connectivity to Chennai Port and Kamarajar Ennore terminal for coastal logistics.',
    suggestedOptimization: 'Leverage coastal shipping feeders between Chennai and JNPT Mumbai to bypass road freight bottlenecks.',
    rawMaterials: [
      {
        id: 'rm-501',
        materialName: 'Electrolytic Oxygen-Free Copper Wire Rods',
        category: 'Power/Cabling',
        originLocation: 'Tuticorin Industrial Port Complex, Tamil Nadu',
        originCoords: { x: 45, y: 91 },
        distanceKm: 610,
        transitMode: 'Road',
        inboundLeadDays: 2,
        carbonScore: 'Low',
        logisticsAdvice: 'Dedicated express cargo freight line hauls ensure unhindered copper coil deliveries.',
      },
      {
        id: 'rm-502',
        materialName: 'Industrial Lithium-Ion & LiFePO4 Cells',
        category: 'Power/Cabling',
        originLocation: 'Sri City Electronics SEZ, Andhra Pradesh',
        originCoords: { x: 51, y: 74 },
        distanceKm: 85,
        transitMode: 'Road',
        inboundLeadDays: 1,
        carbonScore: 'Low',
        logisticsAdvice: 'Short 85km highway proximity allows twice-daily replenishment without storage overhead.',
      },
    ],
  },
};

interface SupplierLogisticsMapProps {
  suppliers: Supplier[];
  onSelectSupplierTrends?: (supplierId: string) => void;
  onRateSupplier?: (supplier: Supplier) => void;
}

export const SupplierLogisticsMap: React.FC<SupplierLogisticsMapProps> = ({
  suppliers,
  onSelectSupplierTrends,
  onRateSupplier,
}) => {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || 'sup-001');
  const [regionFilter, setRegionFilter] = useState<'ALL' | 'WEST' | 'SOUTH' | 'NORTH'>('ALL');
  const [showRawMaterialOrigins, setShowRawMaterialOrigins] = useState<boolean>(true);
  const [showFreightRoutes, setShowFreightRoutes] = useState<boolean>(true);

  // Selected supplier and associated logistics profile
  const activeSupplier = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];
  const activeProfile = SUPPLIER_LOGISTICS_PROFILES[activeSupplier?.id] || SUPPLIER_LOGISTICS_PROFILES['sup-001'];

  // Filtered suppliers based on selected region
  const filteredSuppliers = useMemo(() => {
    if (regionFilter === 'ALL') return suppliers;
    return suppliers.filter((s) => {
      const profile = SUPPLIER_LOGISTICS_PROFILES[s.id];
      return profile?.region === regionFilter;
    });
  }, [suppliers, regionFilter]);

  // Aggregate metrics
  const aggregateMetrics = useMemo(() => {
    let totalScore = 0;
    let totalLeadDays = 0;
    let totalRawMaterialsCount = 0;
    let railCount = 0;

    suppliers.forEach((s) => {
      const p = SUPPLIER_LOGISTICS_PROFILES[s.id];
      if (p) {
        totalScore += p.logisticsOptimizationScore;
        totalRawMaterialsCount += p.rawMaterials.length;
        p.rawMaterials.forEach((rm) => {
          totalLeadDays += rm.inboundLeadDays;
          if (rm.transitMode === 'Rail' || rm.transitMode === 'Maritime') railCount++;
        });
      }
    });

    const avgOptimization = suppliers.length > 0 ? Math.round(totalScore / suppliers.length) : 92;
    const avgLead = totalRawMaterialsCount > 0 ? (totalLeadDays / totalRawMaterialsCount).toFixed(1) : '2.8';
    const ecoPercent = totalRawMaterialsCount > 0 ? Math.round((railCount / totalRawMaterialsCount) * 100) : 65;

    return {
      avgOptimization,
      avgLead,
      ecoPercent,
      totalHubs: suppliers.length,
    };
  }, [suppliers]);

  // Helper for mode icons
  const getModeIcon = (mode: RawMaterialOrigin['transitMode']) => {
    switch (mode) {
      case 'Rail':
        return <Train className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />;
      case 'Air':
        return <Plane className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
      case 'Maritime':
        return <Anchor className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />;
      case 'Road':
      default:
        return <Truck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-[#191C20] rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
      {/* Top Header & Context Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#00639A] dark:text-sky-300">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Geographical Origin & Supplier Logistics Network</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Logistics Optimization
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Visualizing raw material extraction hubs, manufacturing facilities, and freight corridors to minimize transit bottlenecks
              </p>
            </div>
          </div>
        </div>

        {/* Region & Visibility Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Region Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
            {(['ALL', 'WEST', 'SOUTH', 'NORTH'] as const).map((reg) => (
              <button
                key={reg}
                onClick={() => setRegionFilter(reg)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  regionFilter === reg
                    ? 'bg-white dark:bg-[#191C20] text-[#00639A] dark:text-sky-300 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {reg === 'ALL' ? 'All Zones' : `${reg}`}
              </button>
            ))}
          </div>

          {/* Layer Toggles */}
          <button
            onClick={() => setShowFreightRoutes((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showFreightRoutes
                ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800 text-[#00639A] dark:text-sky-300'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
            }`}
            title="Toggle Freight Corridors"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Corridors</span>
          </button>

          <button
            onClick={() => setShowRawMaterialOrigins((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showRawMaterialOrigins
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
            }`}
            title="Toggle Raw Material Origin Pins"
          >
            <Factory className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Origins</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Network Efficiency</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {aggregateMetrics.avgOptimization}%
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              Low Congestion
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Sourcing proximity & multi-modal routing</p>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Avg Inbound Lead</span>
            <Truck className="w-4 h-4 text-[#00639A] dark:text-sky-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {aggregateMetrics.avgLead} Days
            </span>
            <span className="text-[11px] text-slate-400">Mine/Port to Facility</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Automated customs & green linehaul</p>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Green Freight</span>
            <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {aggregateMetrics.ecoPercent}%
            </span>
            <span className="text-[11px] text-slate-400">Electrified Rail / Sea</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Target: &gt;60% low-carbon transit</p>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Active Logistics Hubs</span>
            <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {aggregateMetrics.totalHubs} Hubs
            </span>
            <span className="text-[11px] text-slate-400">Pan-India Network</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Mumbai, Bengaluru, Gurugram, Delhi, Chennai</p>
        </div>
      </div>

      {/* Main Map Visualizer & Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left / Center: Interactive SVG Map Canvas (7 cols on lg) */}
        <div className="lg:col-span-7 bg-slate-950 rounded-3xl p-4 sm:p-5 text-white border border-slate-800 shadow-md relative overflow-hidden flex flex-col">
          {/* Map Top Bar with Quick Legend */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00639A] animate-ping" />
              <span className="font-bold text-slate-200">Logistics Geography Stage</span>
            </div>
            {/* Map Legend */}
            <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00639A] border border-white" />
                <span>Supplier Facility</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
                <span>Raw Material</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-0.5 bg-sky-400 border-dashed" />
                <span>Route</span>
              </span>
            </div>
          </div>

          {/* SVG Map Canvas Container */}
          <div className="relative w-full aspect-4/3 sm:aspect-16/11 flex items-center justify-center my-2">
            <svg
              viewBox="0 0 800 650"
              className="w-full h-full select-none"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
            >
              <defs>
                {/* Gradients */}
                <linearGradient id="mapBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0B1118" />
                  <stop offset="100%" stopColor="#0F172A" />
                </linearGradient>

                <linearGradient id="corridorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0284C7" stopOpacity="0.3" />
                </linearGradient>

                <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="originGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#34D399" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                </radialGradient>

                {/* Marker Arrow */}
                <marker
                  id="routeArrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#38BDF8" />
                </marker>
              </defs>

              {/* Geographical Background Plate */}
              <rect width="800" height="650" rx="20" fill="url(#mapBgGrad)" />

              {/* Coordinate Grid Lines */}
              <g stroke="#1E293B" strokeWidth="1" strokeDasharray="4 6" opacity="0.6">
                <line x1="100" y1="0" x2="100" y2="650" />
                <line x1="250" y1="0" x2="250" y2="650" />
                <line x1="400" y1="0" x2="400" y2="650" />
                <line x1="550" y1="0" x2="550" y2="650" />
                <line x1="700" y1="0" x2="700" y2="650" />
                <line x1="0" y1="120" x2="800" y2="120" />
                <line x1="0" y1="240" x2="800" y2="240" />
                <line x1="0" y1="360" x2="800" y2="360" />
                <line x1="0" y1="480" x2="800" y2="480" />
                <line x1="0" y1="600" x2="800" y2="600" />
              </g>

              {/* Stylized Geo Silhouette of Indian Subcontinent & Trade Corridors */}
              <path
                d="M 320 60 
                   Q 380 50 430 80 
                   Q 460 120 480 140 
                   Q 510 160 550 170 
                   Q 620 180 670 190 
                   Q 720 220 740 270 
                   Q 710 320 660 350 
                   Q 600 360 560 390 
                   Q 530 420 500 480 
                   Q 470 540 430 610 
                   Q 390 630 360 600 
                   Q 320 540 300 480 
                   Q 270 410 240 370 
                   Q 210 350 180 320 
                   Q 150 280 190 240 
                   Q 230 200 250 160 
                   Q 270 110 320 60 Z"
                fill="#131E2D"
                stroke="#334155"
                strokeWidth="2"
                strokeLinejoin="round"
              />

              {/* Major Maritime & Inland Waterway Coastlines */}
              <path
                d="M 180 320 Q 220 380 270 440 Q 340 560 390 620"
                fill="none"
                stroke="#0284C7"
                strokeWidth="1.5"
                strokeDasharray="2 4"
                opacity="0.5"
              />
              <path
                d="M 390 620 Q 450 560 510 450 Q 560 380 660 350"
                fill="none"
                stroke="#0284C7"
                strokeWidth="1.5"
                strokeDasharray="2 4"
                opacity="0.5"
              />

              {/* Regional Zone Labels */}
              <text x="360" y="100" fill="#64748B" fontSize="11" fontWeight="700" letterSpacing="1">
                NORTHERN INDUSTRIAL CORRIDOR
              </text>
              <text x="170" y="380" fill="#64748B" fontSize="11" fontWeight="700" letterSpacing="1">
                WESTERN DFC CORRIDOR
              </text>
              <text x="440" y="520" fill="#64748B" fontSize="11" fontWeight="700" letterSpacing="1">
                SOUTHERN TECH BELT
              </text>
              <text x="560" y="310" fill="#64748B" fontSize="11" fontWeight="700" letterSpacing="1">
                EASTERN MINERAL BELT
              </text>

              {/* Freight Corridors (Highways / Rail Trunks) */}
              {showFreightRoutes && (
                <g stroke="#38BDF8" strokeWidth="2" strokeDasharray="6 4" opacity="0.45">
                  {/* Western DFC (Delhi/Gurugram -> Mumbai) */}
                  <line x1="340" y1="180" x2="240" y2="370" />
                  {/* Golden Quadrilateral (Mumbai -> Bengaluru -> Chennai) */}
                  <line x1="240" y1="370" x2="330" y2="500" />
                  <line x1="330" y1="500" x2="410" y2="510" />
                  {/* North-South Trunk (Delhi -> Chennai) */}
                  <line x1="340" y1="180" x2="410" y2="510" strokeDasharray="3 3" opacity="0.3" />
                  {/* Eastern Mineral Route (Jamshedpur -> Delhi) */}
                  <line x1="540" y1="300" x2="340" y2="180" stroke="#F59E0B" strokeDasharray="4 4" opacity="0.4" />
                </g>
              )}

              {/* Dynamic Connecting Vectors for Active Selected Supplier */}
              {activeProfile && showRawMaterialOrigins && (
                <g>
                  {activeProfile.rawMaterials.map((rm) => {
                    const originX = (rm.originCoords.x / 100) * 800;
                    const originY = (rm.originCoords.y / 100) * 650;
                    const facilityX = (activeProfile.coords.x / 100) * 800;
                    const facilityY = (activeProfile.coords.y / 100) * 650;

                    // Curvature control point
                    const midX = (originX + facilityX) / 2 + (originY - facilityY) * 0.15;
                    const midY = (originY + facilityY) / 2 - (originX - facilityX) * 0.15;

                    return (
                      <g key={rm.id}>
                        {/* Transit Arc */}
                        <path
                          d={`M ${originX} ${originY} Q ${midX} ${midY} ${facilityX} ${facilityY}`}
                          fill="none"
                          stroke="#34D399"
                          strokeWidth="2.5"
                          strokeDasharray="5 3"
                          markerEnd="url(#routeArrow)"
                          className="animate-pulse"
                        />
                        {/* Midpoint badge distance */}
                        <rect
                          x={midX - 32}
                          y={midY - 10}
                          width="64"
                          height="18"
                          rx="9"
                          fill="#0F172A"
                          stroke="#34D399"
                          strokeWidth="1"
                        />
                        <text
                          x={midX}
                          y={midY + 3}
                          fill="#34D399"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {rm.distanceKm} km
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* Raw Material Origins Pins */}
              {showRawMaterialOrigins &&
                activeProfile &&
                activeProfile.rawMaterials.map((rm) => {
                  const x = (rm.originCoords.x / 100) * 800;
                  const y = (rm.originCoords.y / 100) * 650;

                  return (
                    <g key={rm.id} className="cursor-pointer">
                      <circle cx={x} cy={y} r="16" fill="url(#originGlow)" />
                      <circle cx={x} cy={y} r="7" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                      {/* Label box */}
                      <g transform={`translate(${x + 12}, ${y - 12})`}>
                        <rect
                          width="140"
                          height="24"
                          rx="6"
                          fill="#022C22"
                          stroke="#059669"
                          strokeWidth="1"
                          opacity="0.95"
                        />
                        <text x="6" y="11" fill="#A7F3D0" fontSize="8.5" fontWeight="bold">
                          {rm.category}: {rm.materialName.slice(0, 18)}...
                        </text>
                        <text x="6" y="20" fill="#6EE7B7" fontSize="7.5">
                          {rm.transitMode} • {rm.inboundLeadDays}d lead
                        </text>
                      </g>
                    </g>
                  );
                })}

              {/* Supplier Facility Hub Pins */}
              {suppliers.map((s) => {
                const profile = SUPPLIER_LOGISTICS_PROFILES[s.id];
                if (!profile) return null;

                const isSelected = s.id === selectedSupplierId;
                const isRegionMatch = regionFilter === 'ALL' || profile.region === regionFilter;
                const x = (profile.coords.x / 100) * 800;
                const y = (profile.coords.y / 100) * 650;

                return (
                  <g
                    key={s.id}
                    onClick={() => setSelectedSupplierId(s.id)}
                    className="cursor-pointer transition-all"
                    opacity={isRegionMatch ? 1 : 0.25}
                  >
                    {/* Pulsing selection aura */}
                    {isSelected && (
                      <>
                        <circle cx={x} cy={y} r="28" fill="url(#hubGlow)" className="animate-ping" />
                        <circle cx={x} cy={y} r="20" fill="#0284C7" opacity="0.3" />
                      </>
                    )}

                    {/* Pin Center */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 10 : 8}
                      fill={isSelected ? '#00639A' : '#1E293B'}
                      stroke={isSelected ? '#38BDF8' : '#94A3B8'}
                      strokeWidth={isSelected ? 3 : 2}
                    />
                    <circle cx={x} cy={y} r={isSelected ? 4 : 3} fill="#FFFFFF" />

                    {/* Facility Callout */}
                    <g transform={`translate(${x - 70}, ${y + (isSelected ? 16 : 14)})`}>
                      <rect
                        width="140"
                        height="32"
                        rx="8"
                        fill={isSelected ? '#0F172A' : '#1E293B'}
                        stroke={isSelected ? '#38BDF8' : '#475569'}
                        strokeWidth={isSelected ? 1.5 : 1}
                        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))"
                      />
                      <text
                        x="70"
                        y="14"
                        fill={isSelected ? '#FFFFFF' : '#E2E8F0'}
                        fontSize="9.5"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {s.companyName.split(' ')[0]} {s.companyName.split(' ')[1] || ''}
                      </text>
                      <text
                        x="70"
                        y="26"
                        fill={isSelected ? '#38BDF8' : '#94A3B8'}
                        fontSize="8"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        {profile.facilityLocation.split(',')[1] || profile.state} • {s.averageLeadDays}d lead
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Quick Hub Selector Badges below Map */}
          <div className="pt-3 border-t border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-[11px] text-slate-400 font-semibold shrink-0">Focus Hub:</span>
            {suppliers.map((s) => {
              const isSelected = s.id === selectedSupplierId;
              const p = SUPPLIER_LOGISTICS_PROFILES[s.id];
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSupplierId(s.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#00639A] text-white shadow-xs font-bold ring-1 ring-sky-400'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <MapPin className="w-3 h-3 text-sky-300" />
                  <span>{s.companyName.split(' ')[0]}</span>
                  <span className="text-[10px] text-slate-300 font-mono">({p?.state || 'IN'})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Logistics & Raw Material Breakdown (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Supplier Overview Card */}
          <div className="bg-slate-50 dark:bg-slate-900/90 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-[#00639A] dark:text-sky-300">
                  {activeProfile?.region} Logistics Corridor
                </span>
                <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-1">
                  {activeSupplier?.companyName}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{activeSupplier?.address}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-2xl font-black text-[#00639A] dark:text-sky-400 font-mono">
                  {activeProfile?.logisticsOptimizationScore}%
                </span>
                <span className="block text-[10px] uppercase font-bold text-slate-400">
                  Efficiency SLA
                </span>
              </div>
            </div>

            {/* Corridor & Advantage Badge */}
            <div className="p-3 bg-white dark:bg-[#191C20] rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-1.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-[#00639A]" />
                <span>Primary Logistics Line</span>
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {activeProfile?.primaryCorridor}
              </p>
              <p className="text-[11px] text-slate-500 italic">
                {activeProfile?.keyLogisticsAdvantage}
              </p>
            </div>

            {/* Raw Material Inbound Origins List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1">
                  <Factory className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Raw Material Sourcing Origins ({activeProfile?.rawMaterials.length})</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">Mine & Port Links</span>
              </div>

              <div className="space-y-2">
                {activeProfile?.rawMaterials.map((rm) => (
                  <div
                    key={rm.id}
                    className="p-3 bg-white dark:bg-[#191C20] rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1.5 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <strong className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {rm.materialName}
                          </strong>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{rm.originLocation}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg shrink-0">
                        {getModeIcon(rm.transitMode)}
                        <span>{rm.transitMode}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                      <span className="text-slate-500">
                        Transit Distance: <strong className="text-slate-800 dark:text-slate-200">{rm.distanceKm} km</strong>
                      </span>
                      <span className="text-slate-500">
                        Inbound Lead: <strong className="text-slate-800 dark:text-slate-200">{rm.inboundLeadDays} Days</strong>
                      </span>
                      <span
                        className={`font-semibold px-1.5 py-0.2 rounded text-[10px] ${
                          rm.carbonScore === 'Low'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {rm.carbonScore} Carbon
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-xl">
                      💡 {rm.logisticsAdvice}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Optimization Recommendation Box */}
            <div className="p-3.5 bg-gradient-to-r from-blue-950 to-indigo-950 text-white rounded-2xl border border-sky-800/60 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Logistics Optimization Opportunity</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {activeProfile?.suggestedOptimization}
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  if (onSelectSupplierTrends && activeSupplier) {
                    onSelectSupplierTrends(activeSupplier.id);
                  }
                }}
                className="px-3 py-2 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/70 dark:hover:bg-sky-900/80 text-[#00639A] dark:text-sky-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>View 6-Mo Trends</span>
              </button>

              {onRateSupplier && activeSupplier && (
                <button
                  type="button"
                  onClick={() => onRateSupplier(activeSupplier)}
                  className="px-3 py-2 bg-[#00639A] hover:bg-[#004B76] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-200" />
                  <span>Rate Logistics SLA</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
