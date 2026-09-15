# Smart Procurement — Enterprise Procurement & Supply Chain System

**Smart Procurement** is a modern, enterprise-grade Android application built with **Kotlin** and **Jetpack Compose (Material 3)**. It streamlines the end-to-end procurement lifecycle — from purchase requisitions and multi-tier approval workflows to automated purchase orders, supplier SLA evaluations, live delivery verification, automated inventory management, and audit logging.

---

## 🚀 Key Highlights & Capabilities

### 1. 👥 Multi-Persona Role-Based Access Control (RBAC)
- **Requisitioner / Department Staff:** Create requests, track requisition status, view approved orders.
- **Department Approver / Manager:** Multi-tier budget approvals with conditional threshold logic.
- **Purchasing / Procurement Officer:** Vendor matching, RFQ generation, PO conversion, and price negotiations.
- **Supplier / Vendor Entity:** Acknowledge orders, update dispatch schedules, generate ASN / Waybills.
- **Warehouse & Inventory Manager:** GRN (Goods Received Notes), QR code scanning verification, stock adjustments.
- **System Admin / Finance Lead:** Audit trail compliance, enterprise settings, membership tier management.

---

### 2. 📋 Purchase Requisition Management
- Itemized line items with dynamic unit calculations, tax breakdown (18% GST), and total pricing.
- Priority tagging (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) with deadline SLA indicators.
- Budget allocation checks per department with automated warnings for over-budget items.
- Attachment & quotation metadata linkage.

---

### 3. 🛡️ Multi-Tier Approval Workflow Engine
- **Tier 1 (Department Lead):** Requests up to ₹50,000.
- **Tier 2 (Finance Director):** Requests up to ₹2,50,000.
- **Tier 3 (Executive / VP Procurement):** High-value purchases exceeding ₹2,50,000.
- Instant digital stamp, rejection reasons, budget override notes, and step-by-step visual approval breadcrumbs.

---

### 4. 🛒 Purchase Order (PO) & Digital Receipt Generation
- Automated transition from Approved Requisitions into official Purchase Orders with unique PO IDs (`PO-XXXXX`).
- Itemized line items, subtotal, tax computations, and delivery terms.
- Official digital invoices with QR code verification and download/export simulation.
- Re-order shortcuts for recurring inventory replenishments.

---

### 5. 🚚 Live Delivery & Shipment Milestone Tracking
- Real-time carrier tracking (`FedEx Express`, `BlueDart`, `Delhivery`, `DHL Cargo`).
- Waybill number lookup, temperature/fragile handling flags, and estimated arrival windows.
- Milestone tracking: `Order Placed` ➔ `Dispatched` ➔ `In Transit` ➔ `Out for Delivery` ➔ `Delivered`.
- Proof of Delivery (PoD) with GRN creation and inventory auto-sync.

---

### 6. 📦 Smart Inventory & Auto-Reorder Automation
- Real-time stock levels, allocated stock, and available units.
- **Safety Stock Thresholds:** Visual indicators for Low Stock, Critical, Out of Stock, and Overstocked items.
- Automated 1-tap re-order requisition creation when stock falls below safety levels.
- SKU search, warehouse bin locations, and total stock valuation calculations.

---

### 7. ⭐ Vendor Performance SLA & AI Matchmaking
- Supplier database with rating scorecards across 4 key dimensions:
  - **Product Quality (40%)**
  - **On-Time Delivery SLA (30%)**
  - **Pricing Competitiveness (20%)**
  - **Service & Compliance (10%)**
- Post-delivery rating feedback submissions directly impacting vendor performance index.
- Smart vendor recommendations based on item category and historical reliability.

---

### 8. 📜 Order History Archive & Audit Ledger
- Complete immutable history of all executed purchase orders with date range presets (`Today`, `This Week`, `This Month`, `This Quarter`, `This Year`, `All Time`).
- Multi-dimensional sorting (Date, Total Amount, Vendor Name, Order Status).
- Comprehensive search across PO numbers, vendor names, and item specifications.
- Tamper-proof digital audit log tracking every action, user timestamp, and status change.

---

### 9. 💎 SaaS Membership & Subscription Plans
- Flexible procurement subscription tiers:
  - **Starter (Free):** Up to 25 POs/month, single approver level, standard support.
  - **Professional (Growth):** Unlimited POs, 3-tier approvals, automated reorders, vendor analytics.
  - **Enterprise (Scale):** Custom approval matrices, SLA monitoring, multi-warehouse sync, dedicated account manager.
  - **Custom Scale:** Bespoke ERP integration and 24/7 dedicated engineering SLA.
- Monthly and annual billing toggles with discounted pricing badges.

---

### 10. 🎨 Design & Accessibility Excellence
- **Material Design 3 (M3):** Clean Bento-grid layout, high contrast typography, and smooth micro-interactions.
- **Theme Options:** Dark Mode, Light Mode, and System Default Theme switching.
- **Accessibility:** 48dp+ touch targets, semantic labels, and test tags (`Modifier.testTag`) for test automation.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Language** | TypeScript 5.7+ |
| **UI Framework** | React 18+ with Vite 6 |
| **Styling** | Tailwind CSS v4 with Bento Card design tokens |
| **Icons & UI** | Lucide React |
| **Motion** | Motion (Framer Motion) layout & transition engine |
| **Charts & Metrics** | Recharts (Spend trends, category breakdowns, SLA comparisons) |
| **State Management** | React Context + LocalStorage Persistence (`ProcurementContext`) |
| **Workflow Engine** | `PoApprovalWorkflowEngine` multi-tier approval matrix |

---

## 📁 Project Structure

```
src/
├── App.tsx                          # App Shell, Routing, Modals & Toast Manager
├── main.tsx                         # React Client Entry Point
├── index.css                        # Tailwind CSS imports & custom styling
├── types/
│   └── procurement.ts               # Complete TypeScript domain interfaces & enums
├── data/
│   └── seedData.ts                  # Enterprise initial datasets (products, suppliers, users)
├── services/
│   └── workflowEngine.ts            # 4-tier approval matrix, limits & crypto hash certs
├── context/
│   └── ProcurementContext.tsx       # Central state orchestrator, persistent storage & actions
└── components/
    ├── common/
    │   ├── StatusBadges.tsx         # Role, Status, Priority & Delivery badges
    │   ├── PoHierarchicalApprovalView.tsx # Visual approval progress & signoff actions
    │   ├── PurchaseOrderStatusTracker.tsx # Milestone stepper (Dispatched -> Delivered)
    │   └── PoFilterBar.tsx          # Search & status filtering controls
    ├── layout/
    │   ├── TopBar.tsx               # Header, persona switcher, notifications, theme toggle
    │   ├── BottomNav.tsx            # Tab navigation for all 10 core screens
    │   └── HighValueAlertBanner.tsx # Dynamic alert banner for high-value purchases
    ├── modals/
    │   ├── AuthDialog.tsx           # Persona selection, login & registration modal
    │   ├── NewRequisitionModal.tsx  # Dynamic multi-item purchase requisition modal
    │   └── NotificationsModal.tsx   # Enterprise notification center
    └── screens/
        ├── DashboardScreen.tsx      # Bento KPI dashboard, spend charts & quick actions
        ├── PurchaseRequestsScreen.tsx # PR management, approval signoffs & PO conversion
        ├── PurchaseOrdersScreen.tsx # PO list, hierarchical approvals & dispatch modal
        ├── OrderHistoryScreen.tsx   # Historical orders, search & invoice details
        ├── SuppliersScreen.tsx      # Vendor scorecard, SLA rankings & RFQ recommendation
        ├── DeliveryTrackingScreen.tsx # Live BlueDart/FedEx tracking & dock checkpoints
        ├── InventoryScreen.tsx      # Stock ledger, safety thresholds & auto-replenishment
        ├── AnalyticsAuditScreen.tsx # Multi-metric spend analytics & immutable audit log
        ├── MembershipScreen.tsx     # Enterprise subscription plans & feature matrix
        └── ApiConsoleScreen.tsx     # REST simulator, threshold config & lifecycle test
```

---

## ⚙️ Build & Run

1. Ensure **Node.js 18+** is installed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

---

## 📄 License
Copyright © 2026 Smart Procurement Systems. All rights reserved.
