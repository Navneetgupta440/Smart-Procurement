# Smart Procurement — Enterprise Supply Chain & Order Orchestration System

> **Source • Simplify • Save**  
> An enterprise-grade, multi-tenant procurement lifecycle and purchase order orchestration system engineered with role-based governance, 3-tier dynamic approval hierarchies, algorithmic supplier evaluation, carrier milestone tracking, automated inventory inwarding, and a complete 55-endpoint REST API suite.

---

## 📑 Table of Contents
1. [Executive Overview](#-executive-overview)
2. [End-to-End System Architecture & Lifecycle Diagram](#-end-to-end-system-architecture--lifecycle-diagram)
3. [End-to-End Stages (Start to Finish)](#-end-to-end-stages-start-to-finish)
4. [Role-Based Access Control (7 Personas)](#-role-based-access-control-7-personas)
5. [Core Features & Functional Modules](#-core-features--functional-modules)
6. [How It Differs From Other Platforms](#-how-it-differs-from-other-platforms)
7. [System Requirements & Tech Stack](#-system-requirements--tech-stack)
8. [Getting Started & Installation](#-getting-started--installation)
9. [REST API Ecosystem & Postman Suite](#-rest-api-ecosystem--postman-suite)
10. [Project Directory Structure](#-project-directory-structure)
11. [Creator & Engineering Credits](#-creator--engineering-credits)

---

## 🏛️ Executive Overview

Smart Procurement solves the friction, opaque spend, and manual bottlenecks typical in mid-to-large enterprise supply chains. It replaces fragmented emails, spreadsheets, and disconnected tools with a unified single-pane-of-glass application governing:
- **Financial Compliance**: Budget allocation guards and automated approval escalations.
- **Supplier Accountability**: Multi-criteria weighted scoring (Pricing, Quality, Delivery SLA, and Reliability).
- **Logistics Visibility**: Real-time linehaul waybill milestone tracking with BlueDart, Delhivery, DTDC, and FedEx.
- **Stock Synchronization**: Instant automated inventory inwarding upon dock delivery confirmation.

---

## 🔄 End-to-End System Architecture & Lifecycle Diagram

```
+-------------------------------------------------------------------------------------------------------+
|                                    SMART PROCUREMENT WORKFLOW LIFECYCLE                                |
+-------------------------------------------------------------------------------------------------------+

  [1. USER AUTHENTICATION & PERSONA INITIALIZATION]
          |  (JWT-style token, 7 RBAC Personas: Requester, Approver, Procurement, Supplier, Warehouse, etc.)
          v
  [2. REQUISITION CREATION]
          |  Line Items Builder, Tax Calculation (18% GST), Department Budget Checks & Priority Tags
          v
  [3. 3-TIER DYNAMIC APPROVAL ROUTING]
          +---> Tier 1 (< ₹15,000): Department Manager Auto-Signoff
          +---> Tier 2 (₹15,000 – ₹1,00,000): Dept Manager + Senior Procurement Officer
          +---> Tier 3 (> ₹1,00,000): Dept Manager + Procurement + Executive VP / CFO (SHA-256 Signoff)
          |
     [Approved]
          v
  [4. ALGORITHMIC SOURCING & PO CONVERSION]
          |  Weighted Score: Pricing (35%) + Quality (20%) + Delivery SLA (20%) + Reliability (15%) + Trust (10%)
          |  Conversion into Purchase Order (PO-XXXXX) with digital signature & payment terms
          v
  [5. SUPPLIER DISPATCH & WAYBILL GENERATION]
          |  Vendor Order Acceptance ➔ Dispatch Carrier Assignment (BlueDart / Delhivery / FedEx)
          |  Air Waybill (AWB) generated with scheduled delivery estimate
          v
  [6. LINEHAUL MILESTONE LOGISTICS TRACKING]
          |  Dispatched ➔ In Transit ➔ Linehaul Hub ➔ Out for Delivery ➔ Delivered (Dock Arrival)
          v
  [7. GOODS RECEIPT NOTE (GRN) & WAREHOUSE INWARDING]
          |  Dock Receipt Confirmation ➔ Automated Inventory Increment ➔ Safety Stock Auto-Reorder Trigger
          v
  [8. SPEND ANALYTICS & TAMPER-EVIDENT AUDIT TRAILS]
             Department Budget Ledgers, KPI Analytics, and RFC-7807 Audited System Logs
```

---

## 🚀 End-to-End Stages (Start to Finish)

### Stage 1: Authentication & Role Provisioning
- Dedicated **Login & Registration portal** with password verification and persistent session state (`localStorage`).
- Instant persona switching across 7 pre-configured enterprise roles to simulate end-to-end multi-party handoffs in real time.

### Stage 2: Multi-Item Requisition Submission & Auto-Save Draft Engine
- Requisitioners select catalog items with live unit prices and specifications.
- Input quantities, required delivery dates, department cost centers, and business justifications.
- Dynamic subtotal, GST (18%), and estimated grand total calculations.
- **Auto-Save as Draft**: Real-time debounce auto-persistence of input state to `localStorage` prevents data loss if users navigate away or close the modal. Features active draft restoration indicators, timestamped save badges, and one-click draft discarding.

### Stage 3: Dynamic Threshold Approval Engine & Bulk Moderation
Requisitions are routed through a 3-tier financial threshold matrix:
1. **Tier 1 (Routine / Low Value - < ₹15,000)**: Single sign-off by Department Approver.
2. **Tier 2 (Medium Value - ₹15,000 to ₹1,00,000)**: Two sequential approvals: Department Lead followed by Senior Procurement Officer.
3. **Tier 3 (High Value / Capital Expense - > ₹1,00,000)**: Three sequential signoffs: Department Lead, Procurement Officer, and Executive Admin / VP Finance, sealed with a SHA-256 digital approval hash.
- Approvers can approve individually with audit comments or reject with formal rejection reasoning.
- **Bulk Action & Moderation Toolbar**: Approvers and Procurement Managers can multi-select requisitions with a master checkbox and floating bottom toolbar, facilitating bulk one-click sign-offs or bulk rejections with standard justification presets (budget constraints, duplicate request, etc.).
- **Interactive Data Grid**: Column sorting on Requisition #, Estimated Total, Department, Priority, Status, and line items, plus real-time view toggling between Data Table and Card layouts.

### Stage 4: Algorithmic Sourcing & PO Conversion
- Approved requisitions are transformed into binding Purchase Orders (`PO-XXXXX`).
- Sourcing engine ranks suppliers using a weighted multi-factor formula:
  $$\text{Score} = (0.35 \times \text{Price}) + (0.20 \times \text{Quality}) + (0.20 \times \text{SLA}) + (0.15 \times \text{Rating}) + (0.10 \times \text{Reliability})$$
- Generates downloadable digital invoices, tax breakdowns, and payment terms.

### Stage 5: Supplier Acceptance & Logistics Dispatch
- Suppliers review incoming purchase orders directly in their fulfillment queue.
- Supplier accepts or declines with operational remarks.
- Upon acceptance, the supplier dispatches goods, assigning a carrier (BlueDart Express, Delhivery, DTDC, FedEx) and entering an Air Waybill (AWB) number.

### Stage 6: Linehaul Milestone Tracking
- Visual 5-step stepper tracks order progression: `Order Placed` ➔ `Supplier Accepted` ➔ `Dispatched` ➔ `In Transit` ➔ `Delivered`.
- Displays real-time estimated time of arrival (ETA), carrier contact, and geocoded transit checkpoints.

### Stage 7: Dock Receiving & Automated Inventory Inwarding
- Warehouse team inspects incoming consignments and confirms delivery receipt.
- The system automatically triggers **inventory inwarding**, updating warehouse stock balances in real time without manual data entry.
- Re-evaluates safety stock thresholds and alerts if items remain below reorder points.

### Stage 8: Executive Analytics & Audit Ledger
- Real-time spend metrics, monthly burn charts, supplier SLA leaderboards, and category budget consumption.
- Immutable, timestamped audit ledger capturing every approval, state mutation, and actor persona for audit readiness.

---

## 👥 Role-Based Access Control (7 Personas)

| Role | Title | Permissions & Capabilities |
|---|---|---|
| **REQ** | Requisitioner (Staff) | Draft & submit requisitions, track line items, view order history. |
| **APP** | Department Approver | Review department requisitions, approve Tier 1/2 requests, provide rejection remarks. |
| **PRO** | Procurement Officer | Match suppliers, approve Tier 2/3 requests, convert PRs to Purchase Orders. |
| **SUP** | Supplier / Vendor | Accept/decline POs, dispatch orders, provide courier waybill numbers. |
| **WAR** | Warehouse Manager | Track deliveries, confirm dock receiving, adjust inventory, view safety stock alerts. |
| **AUD** | Internal Auditor | Inspect system-wide audit logs, examine digital signoff hashes, export reports. |
| **ADM** | Executive Administrator | Unrestricted authority, Tier-3 executive signoff, configure system thresholds. |

---

## ✨ Core Features & Functional Modules

- **Dynamic Approval Engine**: Real-time evaluation of spending limits with multi-stage sign-offs and digital certificates.
- **Auto-Save Draft Engine**: Automatically preserves in-progress purchase requisitions to browser storage (`localStorage`) so work is never lost if a user navigates away, switches views, or refreshes. Includes visual draft indicators and resume prompts.
- **Interactive Multi-Column Sorting & Table Controls**: Click-to-sort headers with ascending/descending indicators across requisition numbers, estimated values, departments, priorities, creation dates, approval tiers, and nested line items.
- **Bulk Action & Moderation Engine**: Checkbox column with master select-all (including indeterminate states), dynamic selection counter, and a floating moderation toolbar enabling one-click bulk approvals and structured bulk rejections with reason presets.
- **Algorithmic Sourcing**: Automatic vendor ranking based on pricing, SLA compliance, quality index, and track record.
- **Automated Inventory Inwarding**: Synchronizes logistics deliveries with warehouse stock upon delivery confirmation.
- **Postman v2.1 Certified REST API**: 55 interactive endpoints tested and runnable in the built-in API console or Postman.
- **Mobile-First Responsive Layout**: All tables, multi-item forms, and touch targets (≥44px) are optimized for smartphones and tablets, with seamless switching between Data Table and Card views.
- **Bento Card Design System**: Modern, high-contrast dashboard with dark/light mode toggle.
- **Tamper-Evident Audit Trails**: Every state change records user ID, persona, timestamp, and action metadata.

---

## 🏆 How It Differs From Other Platforms

| Feature / Metric | Legacy ERP (SAP / Oracle) | Cloud Suite (Coupa / Tipalti) | Spreadsheets / Trello | Smart Procurement |
|---|---|---|---|---|
| **Deployment Speed** | 6–18 months | 2–4 months | Minutes | **Instant zero-setup (Browser / Container)** |
| **Approval Flexibility** | Complex custom ABAP/Java code | Fixed linear tiers | None / Manual email | **Dynamic 3-tier matrix based on real-time amounts** |
| **Automated Inwarding** | Requires expensive barcode add-on | Separate module license | Manual entry | **Native 1-click dock receipt to stock sync** |
| **Built-in Sourcing Engine** | Extra procurement license | Premium add-on | Not available | **Integrated multi-criteria weighted ranking** |
| **API Accessibility** | Heavy SOAP / OData, gated | Restricted developer tier | None | **55 endpoints with live in-browser API console** |
| **Mobile Responsiveness** | Poor / Legacy WebDynpro | Separate mobile app | Poor mobile view | **Fully responsive PWA-ready web application** |
| **Cost & Overhead** | Hundreds of thousands $ + consultants | High annual per-seat SaaS | Low (error-prone) | **Open, modular, zero mandatory software lock-in** |

---

## 💻 System Requirements & Tech Stack

### Client Environment Requirements
- **Browser**: Modern Chromium browser (Chrome 90+, Edge 90+), Firefox 88+, or Safari 15+.
- **Screen Support**: Mobile (360px+), Tablet (768px+), and Desktop (1024px to 4K).

### Development & Build Prerequisites
- **Node.js**: Version `18.0.0` or later.
- **Package Manager**: `npm` version `9.0.0` or later.

### Technology Stack
- **Core Framework**: React 18+ with TypeScript 5.7+
- **Bundler & Dev Server**: Vite 6
- **Styling**: Tailwind CSS v4 with custom dark mode variants
- **Iconography**: Lucide React
- **Visual Charts**: Recharts & D3-compatible SVG renderers
- **Animations**: Motion (Framer Motion) layout engine
- **State Persistence**: React Context API with LocalStorage caching

---

## 🛠️ Getting Started & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Navneetgupta440/Smart-Procurement.git
cd Smart-Procurement
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```
The server will start at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
```
Production static assets will be output to the `dist/` directory.

---

## 🔌 REST API Ecosystem & Postman Suite

The platform includes a built-in interactive **API Console** accessible directly from the application header, the About screen, or via exportable Postman Collection (`/public/postman_collection.json`).

### 7 Modular API Categories (55 Endpoints)
1. **Authentication & Personas (`/api/v1/auth/*`)**: JWT generation, persona switching, credentials verification.
2. **Purchase Requisitions (`/api/v1/requests/*`)**: PR submission, multi-tier reviews, rejection remarks.
3. **Purchase Orders (`/api/v1/orders/*`)**: Conversion from PR, approval stages, vendor acceptance.
4. **Logistics & Deliveries (`/api/v1/deliveries/*`)**: Carrier dispatch, milestone updates, live tracking.
5. **Supplier Evaluation (`/api/v1/suppliers/*`)**: Vendor ratings, SLA calculations, multi-factor ranking.
6. **Inventory & Replenishment (`/api/v1/inventory/*`)**: Stock queries, adjustments, auto-replenishment triggers.
7. **Analytics & Audit Logs (`/api/v1/analytics/*`)**: Spend metrics, category allocations, tamper-evident logs.

### Sample cURL Request: Submit Requisition
```bash
curl -X POST https://smart-procurement.app/api/v1/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer mock-jwt-token-requester" \
  -d '{
    "department": "Engineering",
    "priority": "HIGH",
    "reason": "Replacement servers for datacenter rack #4",
    "items": [
      { "productId": "prod-1", "quantity": 5 }
    ]
  }'
```

---

## 📁 Project Directory Structure

```
smart-procurement/
├── README.md                          # Comprehensive project documentation & architecture guide
├── index.html                         # Entry HTML with typography & SEO meta tags
├── metadata.json                      # Application metadata & capabilities declaration
├── package.json                       # Dependencies & build scripts
├── public/
│   ├── logo.svg                       # Project brand vector logo
│   └── postman_collection.json        # Certified Postman v2.1 API collection (55 routes)
├── src/
│   ├── App.tsx                        # Application router, global layout & navigation transitions
│   ├── main.tsx                       # React DOM root entry point
│   ├── index.css                      # Tailwind v4 styles & dark mode custom variant
│   ├── types/
│   │   └── procurement.ts             # Complete TypeScript schemas, enums & entity models
│   ├── context/
│   │   └── ProcurementContext.tsx     # Centralized state provider & business logic handlers
│   ├── data/
│   │   └── seedData.ts                # Initial mock dataset (products, suppliers, users, orders)
│   ├── services/
│   │   └── workflowEngine.ts          # 3-tier approval evaluation & SHA-256 digital stamp logic
│   └── components/
│       ├── common/                    # Status badges, approval views & milestone trackers
│       ├── layout/                    # TopBar, BottomNav, Notifications & Alert banners
│       ├── modals/                    # Requisition creator, Postman modal & Walkthrough
│       └── screens/                   # Core application screens:
│           ├── DashboardScreen.tsx    # Executive KPI metrics & spend visualization
│           ├── LoginRegisterScreen.tsx# User authentication & registration portal
│           ├── PurchaseRequestsScreen.tsx # PR management, responsive line-item builder
│           ├── PurchaseOrdersScreen.tsx   # PO tracking, hierarchical approvals & dispatch
│           ├── OrderHistoryScreen.tsx # Order archive with search, filter & invoice modal
│           ├── SuppliersScreen.tsx    # Algorithmic vendor scorecard & ratings matrix
│           ├── DeliveryTrackingScreen.tsx # Waybill lookup & linehaul milestone logs
│           ├── InventoryScreen.tsx    # Stock ledger, safety limits & auto-reorder
│           ├── AnalyticsAuditScreen.tsx # Spend charts & immutable audit trail ledger
│           ├── MembershipScreen.tsx   # SaaS subscription tiers & plan upgrade
│           ├── ApiConsoleScreen.tsx   # In-browser REST runner & endpoint tester
│           └── AboutScreen.tsx        # Project docs, API directory & founder profile
```

---

## 👨‍💻 Creator & Engineering Credits

- **Project Lead & Developer**: **Navneet Gupta**
- **Repository**: [Navneetgupta440/Smart-Procurement](https://github.com/Navneetgupta440/Smart-Procurement)
- **Role**: Full Stack MERN Developer & Systems Engineer
- **Core Competencies**: React.js, Node.js, Express, REST APIs, SQL/NoSQL Databases, Enterprise Workflow Architecture.

---

## 📄 License
Copyright © 2026 Smart Procurement Systems. Open Source under the [MIT License](LICENSE).
