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
| **Language** | Kotlin 1.9+ |
| **UI Framework** | Jetpack Compose (Material 3) |
| **Architecture** | MVVM (Model-View-ViewModel) + Repository Pattern |
| **Local Database** | Room Database (SQLite) with KSP |
| **State Management** | Kotlin Coroutines & `StateFlow` / `collectAsStateWithLifecycle` |
| **Persistence / Prefs** | AndroidX DataStore Preferences |
| **Design System** | Material 3 Color Schemes, Bento Cards, Dynamic Elevation |

---

## 📁 Project Structure

```
app/src/main/java/com/example/
├── MainActivity.kt                      # Main App Entry & Scaffolding
├── data/
│   ├── db/
│   │   ├── AppDatabase.kt               # Room Database & Converters
│   │   └── SeedData.kt                  # Seed Data for Initial Launch
│   ├── entity/
│   │   └── Entities.kt                  # User, Request, PO, Item, Inventory, Supplier, Audit Entities
│   ├── dao/
│   │   └── Daos.kt                      # Type-safe Room DAOs with Flow queries
│   ├── model/
│   │   └── Models.kt                    # Enums, Data classes, Statuses, Tiers & Plans
│   ├── preferences/
│   │   └── UserPreferencesRepository.kt # DataStore for Theme & Session
│   ├── repository/
│   │   └── ProcurementRepository.kt     # Unified Data Orchestrator & Business Logic
│   └── workflow/
│       └── PoApprovalWorkflowEngine.kt  # Multi-tier Hierarchical Approval Matrix Engine
├── ui/
│   ├── components/
│   │   ├── CommonComponents.kt          # TopBar, Navigation, KPI Bento Cards, Status Badges
│   │   ├── AuthDialog.kt                # Login, Registration & User Switcher Modal
│   │   ├── PoFilterBar.kt               # Advanced Filters, Sorters & Date Presets
│   │   ├── PoHierarchicalApprovalView.kt# Multi-tier visual approval steps & actions
│   │   └── PurchaseOrderStatusTracker.kt# Step-by-step milestone delivery stepper
│   ├── screens/
│   │   ├── DashboardScreen.kt           # Executive KPI Bento Dashboard & Fast Actions
│   │   ├── RequestsScreen.kt            # Purchase Requisitions & Creation Forms
│   │   ├── PurchaseOrdersScreen.kt      # PO Management, Approvals & Lifecycle
│   │   ├── OrderHistoryScreen.kt        # Complete History, Invoices & Vendor Rating
│   │   ├── SuppliersScreen.kt           # Vendor Database, SLA Scorecards & RFQ
│   │   ├── DeliveryScreen.kt            # Live Shipments, Waybills & QR Goods Receipt
│   │   ├── InventoryScreen.kt           # Stock Ledger, Safety Stock & Auto-Reorder
│   │   └── MembershipPlanScreen.kt      # SaaS Subscription Upgrade & Tier Breakdown
│   ├── theme/
│   │   ├── Color.kt                     # Modern Material 3 Color Palette
│   │   ├── Theme.kt                     # Dynamic Dark/Light Theme Provider
│   │   └── Type.kt                      # Typography Specs
│   └── viewmodel/
│       └── ProcurementViewModel.kt      # Central State Holder & Coroutine Dispatcher
```

---

## ⚙️ Build & Run

1. Open project in **Android Studio** (Hedgehog or newer recommended).
2. Ensure **JDK 17+** is configured.
3. Sync Gradle project dependencies.
4. Run the app:
   ```bash
   ./gradlew installDebug
   ```
5. Run unit & Robolectric tests:
   ```bash
   ./gradlew testDebugUnitTest
   ```

---

## 📄 License
Copyright © 2026 Smart Procurement Systems. All rights reserved.
