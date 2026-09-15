import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { AppTab } from '../../types/procurement';
import { ProcureLogo } from '../common/ProcureLogo';
import {
  Code,
  GraduationCap,
  Briefcase,
  Award,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Database,
  Cpu,
  Server,
  Layers,
  FileCheck,
  Terminal,
  FolderGit2,
  User,
  ArrowRight,
  Workflow,
  Boxes,
  Truck,
  Building2,
  Calendar,
  Zap,
  Download,
} from 'lucide-react';

export const AboutScreen: React.FC = () => {
  const { setActiveTab } = useProcurement();
  const [activeSection, setActiveSection] = useState<'PROJECT' | 'FOUNDER'>('PROJECT');

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl bg-[#121212] text-white p-6 sm:p-10 relative overflow-hidden shadow-md">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute left-1/2 bottom-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-mono text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Procurement Platform Documentation & Creator Profile</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-white leading-tight">
              Enterprise Procurement Engine &amp; Creator Architecture
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              An enterprise-grade, multi-tenant procurement and purchase order orchestration system engineered with
              role-based governance, 3-tier dynamic approval hierarchies, algorithmic supplier evaluation,
              linehaul milestone tracking, and automated inventory reconciliation.
            </p>

            {/* Section Switcher Tabs */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveSection('PROJECT')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  activeSection === 'PROJECT'
                    ? 'bg-amber-400 text-[#121212] shadow-sm'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Workflow className="w-4 h-4" />
                <span>Project Architecture &amp; Capabilities</span>
              </button>

              <button
                onClick={() => setActiveSection('FOUNDER')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  activeSection === 'FOUNDER'
                    ? 'bg-amber-400 text-[#121212] shadow-sm'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Founder &amp; Creator: Navneet Gupta</span>
              </button>

              <button
                onClick={() => setActiveTab(AppTab.SHOPPING)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white/10 text-white hover:bg-white/20 border border-white/10"
              >
                <span>Explore Procure Store</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Official Project Brand Card */}
          <div className="shrink-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 max-w-xs shadow-xl">
            <ProcureLogo size="xl" />
            <div className="text-center">
              <div className="font-serif font-bold text-lg text-white">Smart Procurement</div>
              <div className="font-mono text-[10px] text-emerald-400 tracking-widest uppercase mt-0.5">
                Source • Simplify • Save
              </div>
            </div>
            <div className="text-[11px] text-slate-400 border-t border-white/10 pt-2.5 w-full">
              Official Project Identity
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: PROJECT ARCHITECTURE */}
      {activeSection === 'PROJECT' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Executive Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-[#191C20] rounded-2xl p-6 border border-[#121212]/10 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                3-Tier Dynamic Approvals
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Automated threshold routing: &lt;₹15,000 (Department Manager), ₹15,000–₹1,00,000 (Dept Manager + Procurement Officer), and &gt;₹1,00,000 (Dept Manager + Procurement + Executive Admin).
              </p>
            </div>

            <div className="bg-white dark:bg-[#191C20] rounded-2xl p-6 border border-[#121212]/10 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-400 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                Algorithmic Sourcing Engine
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Weighted multi-criteria supplier evaluation matrix balancing Pricing (35%), Quality (20%), Delivery SLA (20%), Rating (15%), and Reliability (10%).
              </p>
            </div>

            <div className="bg-white dark:bg-[#191C20] rounded-2xl p-6 border border-[#121212]/10 dark:border-slate-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                Linehaul &amp; Auto-Inwarding
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Live waypoint geotracking with BlueDart/SpeedExpress waybills and automated inventory stock balance reconciliation upon dock receiving confirmation.
              </p>
            </div>
          </div>

          {/* 7 Enterprise Role-Based Personas Matrix */}
          <div className="bg-white dark:bg-[#191C20] rounded-2xl p-6 sm:p-8 border border-[#121212]/10 dark:border-slate-800 shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>Enterprise Governance Structure</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 mt-1">
                7 Role-Based Enterprise Personas
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                The platform features a multi-tenant authentication matrix where every role possesses strict access boundaries and custom operation flows.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#F9F7F2] dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-300">
                  Administrator
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Navneet Gupta</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Universal governance, system settings, Tier 3 approval sign-offs, and compliance audit trail inspection.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F9F7F2] dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300">
                  Procurement Manager
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Priya Sharma</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  RFQ dispatch, RFQ comparison, automated PO creation, Tier 2 approvals, and vendor performance scoring.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F9F7F2] dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300">
                  Approving Manager
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Marcus Vance</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Departmental budget oversight, cost-center justification reviews, and Tier 1 sign-off authorization.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F9F7F2] dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                  Requisitioner
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Sarah Jenkins</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Internal staff initiating purchase requests, browsing enterprise Procure catalog, tracking requisition status.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F9F7F2] dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-900 dark:text-cyan-300">
                  Supplier / Vendor
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">ABC Tech Innovations</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  PO acceptance or rejection, production scheduling, tax invoice uploads, and carrier dispatch generation.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F9F7F2] dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950 text-orange-900 dark:text-orange-300">
                  Delivery Agent
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Rajesh Kumar (SpeedExpress)</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  AWB tracking, route checkpoints, electronic proof of delivery (e-POD), and dock handover sign-off.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F9F7F2] dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300">
                  Internal Client / Store
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Ananya Sharma</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Store manager requesting replenishment orders, receiving physical packages, and filing quality feedback.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                  Instant Switching
                </span>
                <h4 className="font-bold text-sm text-amber-950 dark:text-amber-200">Role Switcher in Header</h4>
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  Click the avatar dropdown at the top right to switch between all 7 personas instantly without logging out.
                </p>
              </div>
            </div>
          </div>

          {/* Technical Specifications & Production Stack */}
          <div className="bg-white dark:bg-[#191C20] rounded-2xl p-6 sm:p-8 border border-[#121212]/10 dark:border-slate-800 shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                <Cpu className="w-4 h-4 text-amber-600" />
                <span>Full-Stack Architecture</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 mt-1">
                Technology Stack &amp; Exportable Backend
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                  <Code className="w-4 h-4 text-blue-600" />
                  <span>Frontend Client</span>
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-4">
                  <li><strong>React 18 &amp; TypeScript</strong> with functional hooks &amp; modular context</li>
                  <li><strong>Tailwind CSS</strong> with custom parchment editorial theme palette</li>
                  <li><strong>Lucide Icons</strong> vector icon library across all actions</li>
                  <li><strong>Recharts</strong> for procurement spend &amp; category analytics visualizers</li>
                  <li><strong>Vite Bundler</strong> for rapid modular builds</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                  <Server className="w-4 h-4 text-emerald-600" />
                  <span>Spring Boot 3.3.x Backend</span>
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-4">
                  <li><strong>Spring Data JPA &amp; Hibernate</strong> object-relational mapping</li>
                  <li><strong>Spring Security &amp; JWT</strong> token verification and role guards</li>
                  <li><strong>Lombok &amp; Bean Validation</strong> for clean entity modeling</li>
                  <li><strong>Spring Boot Actuator</strong> for production health telemetry</li>
                  <li>Exportable as a single complete ZIP archive</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                  <Database className="w-4 h-4 text-purple-600" />
                  <span>PostgreSQL &amp; Flyway</span>
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-4">
                  <li><strong>26 Relational Tables</strong> normalized for transactions &amp; audits</li>
                  <li><strong>Flyway V1 Migration</strong> (<code className="font-mono">V1__init_schema.sql</code>)</li>
                  <li><strong>Docker Compose</strong> config with containerized PostgreSQL 16</li>
                  <li><strong>Postman v2.1.0 Collection</strong> with 20+ automated API test endpoints</li>
                  <li>Deterministic SHA-256 digital signatures</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Attached Multi-Handler API Postman Collection Showcase */}
          <div className="bg-white dark:bg-[#191C20] rounded-2xl p-6 sm:p-8 border border-orange-200 dark:border-orange-950/60 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  <Terminal className="w-4 h-4" />
                  <span>Attached REST API Specification</span>
                </div>
                <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 mt-1">
                  Multi-Handler API Postman Collection (v2.1.0)
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Full enterprise collection attached with 55 endpoints across 7 modules, pre-configured with test scripts and environment variables.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href="/postman_collection.json"
                  download="multi-handler-api.postman_collection.json"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-xs transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Collection (.json)</span>
                </a>

                <button
                  onClick={() => setActiveTab(AppTab.API_CONSOLE)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-xs transition-all"
                >
                  <span>Launch Live API Console</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              {[
                { name: 'Auth & User', count: '7 APIs', color: 'emerald' },
                { name: 'Admin RBAC', count: '8 APIs', color: 'purple' },
                { name: 'Requests', count: '7 APIs', color: 'blue' },
                { name: 'Payments', count: '6 APIs', color: 'amber' },
                { name: 'Shop & Orders', count: '12 APIs', color: 'teal' },
                { name: 'Storage Vault', count: '6 APIs', color: 'indigo' },
                { name: 'Approvals', count: '9 APIs', color: 'rose' },
              ].map((m, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center space-y-1">
                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">{m.name}</div>
                  <div className="text-[10px] font-mono text-orange-600 dark:text-orange-400 font-semibold">{m.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: FOUNDER & CREATOR PROFILE (NAVNEET GUPTA) */}
      {activeSection === 'FOUNDER' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Hero Profile Card */}
          <div className="bg-white dark:bg-[#191C20] rounded-3xl p-6 sm:p-10 border border-[#121212]/10 dark:border-slate-800 shadow-xs relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 sm:gap-8">
              {/* Avatar / Portrait */}
              <div className="relative">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-tr from-slate-900 to-amber-700 p-1 shadow-md">
                  <div className="w-full h-full rounded-xl bg-white dark:bg-[#121212] flex flex-col items-center justify-center text-[#121212] dark:text-white font-serif font-bold text-4xl sm:text-5xl">
                    NG
                    <span className="text-[10px] font-mono font-normal tracking-widest text-amber-600 uppercase mt-1">
                      Architect
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full ring-4 ring-white dark:ring-[#191C20]" title="Verified Creator">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>

              {/* Bio & Details */}
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-slate-100">
                    Navneet Gupta
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-mono text-xs font-bold border border-amber-200 dark:border-amber-900">
                    Full Stack Developer &amp; System Architect
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                  Full Stack Developer with 6+ months of hands-on experience building REST APIs, full-stack web applications, and data preprocessing pipelines. Automated preprocessing workflows for 3 ML datasets and integrated SQL/NoSQL databases using Python, SQL, and Java. Comfortable across the stack, from schema design and API architecture to model training and evaluation.
                </p>

                {/* Contact Pill Bar */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                  <a
                    href="mailto:indianavneetgupta33@gmail.com"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4F0E8] dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-medium hover:bg-slate-200 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-600" />
                    <span>indianavneetgupta33@gmail.com</span>
                  </a>

                  <a
                    href="tel:+917317567350"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4F0E8] dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-medium hover:bg-slate-200 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>+91-7317567350</span>
                  </a>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4F0E8] dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>Greater Noida, India</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Education & Technical Skills Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Education */}
            <div className="bg-white dark:bg-[#191C20] rounded-2xl p-6 sm:p-7 border border-[#121212]/10 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                    Education &amp; Academic Credentials
                  </h3>
                  <p className="text-xs text-slate-500">Degree &amp; Alma Mater</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F9F7F2] dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                    Oct. 2023 – Aug. 2027
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    Current
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Bachelor of Technology (B.Tech) in Computer Science &amp; Engineering
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Accurate Institute of Management and Technology (AKTU)
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <MapPin className="w-3 h-3" />
                  <span>Greater Noida, Uttar Pradesh, India</span>
                </div>
              </div>
            </div>

            {/* Technical Skills Matrix */}
            <div className="bg-white dark:bg-[#191C20] rounded-2xl p-6 sm:p-7 border border-[#121212]/10 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold">
                  <Code className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                    Technical Skills &amp; Stack
                  </h3>
                  <p className="text-xs text-slate-500">Languages, Frameworks, DBs &amp; ML</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider block mb-1">
                    Programming Languages
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Java', 'Python', 'SQL', 'JavaScript', 'TypeScript'].map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-[#F4F0E8] dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-medium text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider block mb-1">
                    Web &amp; Backend Engineering
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['React.js', 'Node.js', 'Express.js', 'REST APIs', 'JWT Authentication', 'Spring Boot'].map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-[#F4F0E8] dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-medium text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider block mb-1">
                    Databases &amp; Storage
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Flyway'].map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-[#F4F0E8] dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-medium text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider block mb-1">
                    Data Science, ML &amp; DevOps Tools
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Pandas', 'NumPy', 'TensorFlow', 'Scikit-Learn', 'Git / GitHub', 'GitHub Actions', 'AWS', 'Docker', 'Agile / Scrum'].map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-[#F4F0E8] dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-medium text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Experience Timeline */}
          <div className="bg-white dark:bg-[#191C20] rounded-2xl p-6 sm:p-8 border border-[#121212]/10 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-slate-100">
                  Professional Experience
                </h3>
                <p className="text-xs text-slate-500">Internship Roles &amp; Engineering Contributions</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Experience 1 */}
              <div className="p-5 rounded-2xl bg-[#F9F7F2] dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      MERN Stack Developer Intern
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Codec Technologies Pvt. Ltd. • <span className="text-amber-700 dark:text-amber-400">Remote</span>
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
                    Sep. 2025 – Dec. 2025
                  </span>
                </div>

                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
                  <li>
                    Developed and maintained <strong>5+ full-stack modules</strong> using React.js, Node.js, Express.js, and MongoDB, improving data storage and retrieval efficiency by <strong>20%</strong>.
                  </li>
                  <li>
                    Designed and implemented <strong>10+ RESTful API endpoints</strong> handling structured data flow, authentication, and authorization using JWT.
                  </li>
                  <li>
                    Optimized database queries (indexing and query restructuring), reducing average application response time by <strong>25%</strong> and improving system reliability.
                  </li>
                  <li>
                    Collaborated with a 4-member Agile team across 6 sprint cycles, actively participating in code reviews and sprint planning.
                  </li>
                </ul>
              </div>

              {/* Experience 2 */}
              <div className="p-5 rounded-2xl bg-[#F9F7F2] dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                        Python &amp; Machine Learning Intern
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300">
                        Grade A++ (Top Rating)
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Softpro India Computer Technologies Pvt. Ltd. • <span className="text-blue-700 dark:text-blue-400">Hybrid</span>
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
                    Sep. 2024 – Nov. 2024
                  </span>
                </div>

                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc pl-4 leading-relaxed">
                  <li>
                    Automated data preprocessing pipelines for <strong>3 real-world datasets</strong> using Python, Pandas, and NumPy, cutting manual processing time by <strong>30%</strong>.
                  </li>
                  <li>
                    Trained and evaluated <strong>4 machine learning models</strong> with TensorFlow and Scikit-Learn, achieving up to <strong>90% accuracy</strong> in model evaluation on held-out test data.
                  </li>
                  <li>
                    Built <strong>5+ Power BI dashboards</strong> to visualize processed data, enabling faster business decision-making for stakeholders.
                  </li>
                  <li>
                    Validated data quality with senior team members through consistency checks and outlier review, reducing data inconsistencies by <strong>15%</strong> across analysis workflows.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Key Projects & Certifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Projects */}
            <div className="bg-white dark:bg-[#191C20] rounded-2xl p-6 sm:p-7 border border-[#121212]/10 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 flex items-center justify-center font-bold">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                    Notable Engineering Projects
                  </h3>
                  <p className="text-xs text-slate-500">Software &amp; Deep Learning Implementations</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-[#F9F7F2] dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900 dark:text-slate-100">
                      Smart Procurement &amp; Purchase Order System
                    </h5>
                    <span className="font-mono text-[10px] text-amber-600 font-bold">Active System</span>
                  </div>
                  <p className="text-slate-500 font-mono text-[11px]">
                    React, TypeScript, Tailwind CSS, Spring Boot 3.3.x, PostgreSQL, Flyway
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                    Multi-tier dynamic approval hierarchies, weighted supplier scoring, BlueDart courier geotracking, dock auto-inwarding, and SHA-256 certificate generation.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#F9F7F2] dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900 dark:text-slate-100">
                      Pneumonia Detection Using Chest X-Rays
                    </h5>
                    <span className="font-mono text-[10px] text-blue-600 font-bold">GitHub</span>
                  </div>
                  <p className="text-slate-500 font-mono text-[11px]">
                    Python, TensorFlow, Keras, OpenCV, CNN
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                    Engineered end-to-end data pipeline for medical image classification using CNNs, processing 5,000+ chest X-ray images with 4 modular stages.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#F9F7F2] dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900 dark:text-slate-100">
                      E-Commerce Platform with REST APIs
                    </h5>
                    <span className="font-mono text-[10px] text-blue-600 font-bold">GitHub</span>
                  </div>
                  <p className="text-slate-500 font-mono text-[11px]">
                    React.js, Node.js, Express.js, MongoDB, JWT
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                    Architected full-stack e-commerce with secure JWT auth, role access controls, product catalog, cart, and normalized MongoDB collections.
                  </p>
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white dark:bg-[#191C20] rounded-2xl p-6 sm:p-7 border border-[#121212]/10 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                    Certifications &amp; Accreditations
                  </h3>
                  <p className="text-xs text-slate-500">Verified Technical Achievements</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  {
                    title: 'AICTE & ICAC Approved MERN Stack Development Certification',
                    issuer: 'AICTE & ICAC Technical Council',
                  },
                  {
                    title: 'Deloitte Australia Data Analytics Job Simulation',
                    issuer: 'Deloitte Australia / Forage',
                  },
                  {
                    title: 'Data Science Certification',
                    issuer: 'Advanced Analytics Institute',
                  },
                  {
                    title: 'Python Programming Certification',
                    issuer: 'National Technical Board',
                  },
                  {
                    title: 'C Programming Certification',
                    issuer: 'Standard Systems Programming Authority',
                  },
                  {
                    title: 'Full Stack Development Internship Certificate',
                    issuer: 'Bharat Intern',
                  },
                ].map((cert, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#F9F7F2] dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-slate-100">{cert.title}</h5>
                      <p className="text-[11px] text-slate-500">{cert.issuer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
