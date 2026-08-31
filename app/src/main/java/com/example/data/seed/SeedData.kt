package com.example.data.seed

import com.example.data.database.ProcurementDatabase
import com.example.data.entity.AuditLogEntity
import com.example.data.entity.CategoryEntity
import com.example.data.entity.DeliveryEntity
import com.example.data.entity.DeliveryTrackingCheckpointEntity
import com.example.data.entity.InventoryTransactionEntity
import com.example.data.entity.NotificationEntity
import com.example.data.entity.ProductEntity
import com.example.data.entity.PurchaseOrderEntity
import com.example.data.entity.PurchaseOrderItemEntity
import com.example.data.entity.PurchaseRequestEntity
import com.example.data.entity.PurchaseRequestItemEntity
import com.example.data.entity.SupplierEntity
import com.example.data.entity.SupplierPerformanceRatingEntity
import com.example.data.entity.SystemSettingsEntity
import com.example.data.entity.UserEntity
import com.example.data.model.AuditAction
import com.example.data.model.DeliveryStatus
import com.example.data.model.NotificationChannel
import com.example.data.model.NotificationEventType
import com.example.data.model.OrderStatus
import com.example.data.model.Priority
import com.example.data.model.RequestStatus
import com.example.data.model.TransactionType
import com.example.data.model.UserRole
import com.example.data.workflow.PoApprovalStepInfo
import com.example.data.workflow.PoApprovalWorkflowEngine
import kotlinx.coroutines.flow.first

object SeedData {
    suspend fun seedDatabaseIfEmpty(db: ProcurementDatabase) {
        val existingUsers = db.userDao().getAllUsers().first()
        if (existingUsers.isNotEmpty()) return

        // 1. System Settings
        val settings = SystemSettingsEntity(
            id = "GLOBAL_CONFIG",
            autoPoGeneration = false,
            approvalLimitManager = 15000.0,
            approvalLimitProcurementManager = 100000.0,
            weightPrice = 0.35,
            weightQuality = 0.20,
            weightDelivery = 0.20,
            weightRating = 0.15,
            weightReliability = 0.10
        )
        db.systemSettingsDao().saveSettings(settings)

        // 2. Suppliers
        val sup1 = SupplierEntity(
            id = "sup-001",
            companyName = "Apex Enterprise Solutions",
            contactPerson = "Amitabh Sen",
            email = "sales@apexenterprise.com",
            phone = "+91 98765 43210",
            address = "Plot 12, Whitefield Tech Zone",
            city = "Bangalore",
            state = "Karnataka",
            country = "India",
            gstNumber = "29AABCU9603R1ZM",
            rating = 4.9,
            qualityScore = 96.0,
            onTimeDeliveryRate = 98.0,
            averageLeadDays = 2
        )
        val sup2 = SupplierEntity(
            id = "sup-002",
            companyName = "Global Tech & Hardware Hub",
            contactPerson = "Meera Nambiar",
            email = "b2b@globaltechhub.in",
            phone = "+91 98450 11223",
            address = "Tech Hub, Hinjewadi Phase 2",
            city = "Pune",
            state = "Maharashtra",
            country = "India",
            gstNumber = "27AABCT1234Q1Z8",
            rating = 4.6,
            qualityScore = 92.0,
            onTimeDeliveryRate = 94.0,
            averageLeadDays = 3
        )
        val sup3 = SupplierEntity(
            id = "sup-003",
            companyName = "Nexus Industrial Supplies",
            contactPerson = "Rohan Deshmukh",
            email = "orders@nexusind.com",
            phone = "+91 91234 56789",
            address = "Sector 18, Udyog Vihar",
            city = "Gurugram",
            state = "Haryana",
            country = "India",
            gstNumber = "06AABCN5678P1ZW",
            rating = 4.4,
            qualityScore = 88.0,
            onTimeDeliveryRate = 91.0,
            averageLeadDays = 4
        )
        val sup4 = SupplierEntity(
            id = "sup-004",
            companyName = "Prime Office Systems",
            contactPerson = "Kavita Reddy",
            email = "supply@primeoffice.co.in",
            phone = "+91 99887 76655",
            address = "Banjara Hills Road No. 12",
            city = "Hyderabad",
            state = "Telangana",
            country = "India",
            gstNumber = "36AABCP9876R1Z4",
            rating = 4.7,
            qualityScore = 94.0,
            onTimeDeliveryRate = 95.0,
            averageLeadDays = 3
        )
        val sup5 = SupplierEntity(
            id = "sup-005",
            companyName = "Horizon Electronics India",
            contactPerson = "Siddharth Das",
            email = "corporate@horizonelec.com",
            phone = "+91 97112 33445",
            address = "Salt Lake Sector V",
            city = "Kolkata",
            state = "West Bengal",
            country = "India",
            gstNumber = "19AABCH3322D1ZG",
            rating = 4.3,
            qualityScore = 86.0,
            onTimeDeliveryRate = 89.0,
            averageLeadDays = 5
        )
        db.supplierDao().insertSuppliers(listOf(sup1, sup2, sup3, sup4, sup5))

        // 3. Users for all 7 roles
        val users = listOf(
            UserEntity(
                id = "usr-admin",
                name = "Vikram Malhotra",
                email = "admin@smartprocure.io",
                phone = "+91 98000 00001",
                role = UserRole.ADMIN,
                department = "Executive & Operations"
            ),
            UserEntity(
                id = "usr-proc",
                name = "Ananya Roy",
                email = "ananya.roy@smartprocure.io",
                phone = "+91 98000 00002",
                role = UserRole.PROCUREMENT_MANAGER,
                department = "Supply Chain Management"
            ),
            UserEntity(
                id = "usr-mgr",
                name = "Rajesh Sharma",
                email = "rajesh.sharma@smartprocure.io",
                phone = "+91 98000 00003",
                role = UserRole.MANAGER,
                department = "Engineering & Technology"
            ),
            UserEntity(
                id = "usr-emp",
                name = "Priya Patel",
                email = "priya.patel@smartprocure.io",
                phone = "+91 98000 00004",
                role = UserRole.EMPLOYEE,
                department = "R&D Innovations"
            ),
            UserEntity(
                id = "usr-cust",
                name = "Rahul Verma",
                email = "rahul.verma@smartprocure.io",
                phone = "+91 98000 00005",
                role = UserRole.CUSTOMER,
                department = "Facilities & Infrastructure"
            ),
            UserEntity(
                id = "usr-sup",
                name = "Amitabh Sen (Apex)",
                email = "sales@apexenterprise.com",
                phone = "+91 98765 43210",
                role = UserRole.SUPPLIER,
                department = "Vendor Partner",
                supplierId = "sup-001"
            ),
            UserEntity(
                id = "usr-del",
                name = "Suresh Kumar",
                email = "suresh.logistics@bluedart.com",
                phone = "+91 98000 00007",
                role = UserRole.DELIVERY_AGENT,
                department = "BlueDart Express Logistics"
            )
        )
        db.userDao().insertUsers(users)

        // 4. Categories
        val catIT = CategoryEntity(id = "cat-it", name = "IT & Computing", code = "CAT-IT", description = "Laptops, monitors, workstations and computing accessories")
        val catNet = CategoryEntity(id = "cat-net", name = "Enterprise Networking", code = "CAT-NET", description = "Switches, routers, firewalls, and server racks")
        val catOff = CategoryEntity(id = "cat-off", name = "Office & Ergonomics", code = "CAT-OFF", description = "Executive chairs, standing desks, printers, and accessories")
        val catPower = CategoryEntity(id = "cat-pwr", name = "Power & Infrastructure", code = "CAT-PWR", description = "Online UPS, power distribution units, and backup systems")
        db.categoryDao().insertCategories(listOf(catIT, catNet, catOff, catPower))

        // 5. Products (With low stock examples)
        val products = listOf(
            ProductEntity(
                id = "prd-001",
                productCode = "PRD-LAP-5440",
                name = "Dell Latitude 5440 Enterprise Laptop",
                description = "Intel Core i7-1365U, 32GB DDR5 RAM, 1TB NVMe SSD, 14\" FHD IPS Anti-glare",
                categoryId = "cat-it",
                categoryName = "IT & Computing",
                supplierId = "sup-001",
                supplierName = "Apex Enterprise Solutions",
                unitPrice = 68500.0,
                availableQuantity = 4, // LOW STOCK (min 10)
                minimumStock = 10,
                maximumStock = 50,
                rating = 4.8
            ),
            ProductEntity(
                id = "prd-002",
                productCode = "PRD-MON-274K",
                name = "HP 27-inch 4K UHD Pro Color Monitor",
                description = "3840x2160 IPS, 99% sRGB, 65W USB-C PD Charging, Height-Adjustable Stand",
                categoryId = "cat-it",
                categoryName = "IT & Computing",
                supplierId = "sup-002",
                supplierName = "Global Tech & Hardware Hub",
                unitPrice = 28900.0,
                availableQuantity = 6, // LOW STOCK (min 8)
                minimumStock = 8,
                maximumStock = 40,
                rating = 4.7
            ),
            ProductEntity(
                id = "prd-003",
                productCode = "PRD-MOU-MX3S",
                name = "Logitech MX Master 3S Wireless Mouse",
                description = "8K DPI sensor, Quiet clicks, MagSpeed electromagnetic scroll, Multi-device Flow",
                categoryId = "cat-it",
                categoryName = "IT & Computing",
                supplierId = "sup-001",
                supplierName = "Apex Enterprise Solutions",
                unitPrice = 7990.0,
                availableQuantity = 24,
                minimumStock = 12,
                maximumStock = 80,
                rating = 4.9
            ),
            ProductEntity(
                id = "prd-004",
                productCode = "PRD-KEY-K2PRO",
                name = "Keychron K2 Pro Mechanical Keyboard",
                description = "Wireless/USB-C Bluetooth, Hot-swappable Red switches, RGB Backlight, Mac/Win",
                categoryId = "cat-it",
                categoryName = "IT & Computing",
                supplierId = "sup-002",
                supplierName = "Global Tech & Hardware Hub",
                unitPrice = 8499.0,
                availableQuantity = 18,
                minimumStock = 10,
                maximumStock = 50,
                rating = 4.8
            ),
            ProductEntity(
                id = "prd-005",
                productCode = "PRD-SWI-CAT24",
                name = "Cisco Catalyst 24-Port Gigabit Switch",
                description = "Layer 3 Managed PoE+ Gigabit Switch with 4x 10G SFP+ Uplinks",
                categoryId = "cat-net",
                categoryName = "Enterprise Networking",
                supplierId = "sup-003",
                supplierName = "Nexus Industrial Supplies",
                unitPrice = 45000.0,
                availableQuantity = 2, // LOW STOCK (min 5)
                minimumStock = 5,
                maximumStock = 20,
                rating = 4.6
            ),
            ProductEntity(
                id = "prd-006",
                productCode = "PRD-CHR-AERON",
                name = "Herman Miller Aeron Ergonomic Chair",
                description = "Pellicle mesh suspension, PostureFit SL lumbar support, Fully adjustable arms",
                categoryId = "cat-off",
                categoryName = "Office & Ergonomics",
                supplierId = "sup-004",
                supplierName = "Prime Office Systems",
                unitPrice = 54000.0,
                availableQuantity = 14,
                minimumStock = 8,
                maximumStock = 30,
                rating = 4.9
            ),
            ProductEntity(
                id = "prd-007",
                productCode = "PRD-UPS-1500VA",
                name = "APC Smart-UPS 1500VA LCD 230V",
                description = "Pure Sine Wave, Automatic Voltage Regulation (AVR), SmartSlot Network Card",
                categoryId = "cat-pwr",
                categoryName = "Power & Infrastructure",
                supplierId = "sup-005",
                supplierName = "Horizon Electronics India",
                unitPrice = 32000.0,
                availableQuantity = 5, // LOW STOCK (min 6)
                minimumStock = 6,
                maximumStock = 20,
                rating = 4.5
            ),
            ProductEntity(
                id = "prd-008",
                productCode = "PRD-SCN-DS2208",
                name = "Zebra DS2208 2D Barcode & RFID Scanner",
                description = "Omnidirectional handheld barcode imager with auto-stand and USB cable",
                categoryId = "cat-net",
                categoryName = "Enterprise Networking",
                supplierId = "sup-003",
                supplierName = "Nexus Industrial Supplies",
                unitPrice = 14500.0,
                availableQuantity = 15,
                minimumStock = 6,
                maximumStock = 30,
                rating = 4.6
            )
        )
        db.productDao().insertProducts(products)

        // 6. Purchase Requests
        val pr1 = PurchaseRequestEntity(
            id = "pr-001",
            requestNumber = "PR-2026-000101",
            requestedByUserId = "usr-emp",
            requesterName = "Priya Patel",
            requesterRole = UserRole.EMPLOYEE,
            department = "R&D Innovations",
            priority = Priority.HIGH,
            reason = "New developer onboardings for Cloud AI project requiring high-spec workstations",
            status = RequestStatus.PENDING_APPROVAL,
            estimatedAmount = 137000.0, // >100k -> requires Manager + Procurement Mgr + Admin
            currentApprovalLevel = 1,
            requiredApprovalLevel = 3,
            createdAt = System.currentTimeMillis() - 2 * 3600 * 1000L
        )
        val pr1Items = listOf(
            PurchaseRequestItemEntity(
                id = "pri-001",
                purchaseRequestId = "pr-001",
                productId = "prd-001",
                productCode = "PRD-LAP-5440",
                productName = "Dell Latitude 5440 Enterprise Laptop",
                quantity = 2,
                estimatedUnitPrice = 68500.0,
                estimatedTotal = 137000.0
            )
        )
        db.purchaseRequestDao().insertRequest(pr1)
        db.purchaseRequestDao().insertRequestItems(pr1Items)

        val pr2 = PurchaseRequestEntity(
            id = "pr-002",
            requestNumber = "PR-2026-000102",
            requestedByUserId = "usr-emp",
            requesterName = "Priya Patel",
            requesterRole = UserRole.EMPLOYEE,
            department = "R&D Innovations",
            priority = Priority.MEDIUM,
            reason = "Ergonomic hardware upgrade for testing suite engineers",
            status = RequestStatus.APPROVED,
            estimatedAmount = 57800.0,
            currentApprovalLevel = 2,
            requiredApprovalLevel = 2,
            approvedBy = "Rajesh Sharma (Manager), Ananya Roy (Procurement Mgr)",
            createdAt = System.currentTimeMillis() - 24 * 3600 * 1000L
        )
        val pr2Items = listOf(
            PurchaseRequestItemEntity(
                id = "pri-002",
                purchaseRequestId = "pr-002",
                productId = "prd-002",
                productCode = "PRD-MON-274K",
                productName = "HP 27-inch 4K UHD Pro Color Monitor",
                quantity = 2,
                estimatedUnitPrice = 28900.0,
                estimatedTotal = 57800.0
            )
        )
        db.purchaseRequestDao().insertRequest(pr2)
        db.purchaseRequestDao().insertRequestItems(pr2Items)

        // 7. Purchase Orders (Demonstrating all 4 hierarchical value threshold tiers)
        // PO 1: Tier 2 (₹67,604) - Fully Approved (Dual Sign-off completed) -> In Transit
        val po1Steps = listOf(
            PoApprovalStepInfo(
                level = 1,
                title = "Level 1: Department Manager Sign-Off",
                shortRoleTitle = "Dept Approving Manager",
                requiredRole = UserRole.MANAGER,
                authorityScope = "Requisition & Budget Verification",
                isSigned = true,
                signerUserId = "usr-mgr",
                signerName = "Rajesh Sharma",
                signerRole = "Approving Manager",
                signedAt = System.currentTimeMillis() - 20 * 3600 * 1000L,
                remarks = "Approved. Hardware replacement authorized for engineering workstation setup.",
                signatureCertificate = "CERT-20260830-PO-2026-000501-L1-A89E41B3"
            ),
            PoApprovalStepInfo(
                level = 2,
                title = "Level 2: Procurement Head Sign-Off",
                shortRoleTitle = "Procurement Manager",
                requiredRole = UserRole.PROCUREMENT_MANAGER,
                authorityScope = "Vendor Pricing & Commercial Compliance",
                isSigned = true,
                signerUserId = "usr-proc",
                signerName = "Ananya Roy",
                signerRole = "Procurement Mgr",
                signedAt = System.currentTimeMillis() - 19 * 3600 * 1000L,
                remarks = "Vendor SLA verified with Global Tech Hub. Commercial terms validated.",
                signatureCertificate = "CERT-20260830-PO-2026-000501-L2-F710D2C8"
            )
        )

        val po1 = PurchaseOrderEntity(
            id = "po-001",
            poNumber = "PO-2026-000501",
            purchaseRequestId = "pr-002",
            requestNumber = "PR-2026-000102",
            supplierId = "sup-002",
            supplierName = "Global Tech & Hardware Hub",
            createdByUserId = "usr-proc",
            createdByName = "Ananya Roy",
            orderDate = System.currentTimeMillis() - 18 * 3600 * 1000L,
            expectedDeliveryDate = System.currentTimeMillis() + 2 * 24 * 3600 * 1000L,
            subtotal = 57800.0,
            taxRate = 18.0,
            taxAmount = 10404.0,
            discountAmount = 1200.0,
            shippingCost = 600.0,
            totalAmount = 67604.0,
            status = OrderStatus.IN_TRANSIT,
            currentApprovalLevel = 2,
            requiredApprovalLevel = 2,
            approvalTierName = "Tier 2: Mid-Value Dual Sign-Off (2 Signatures)",
            approvalSignaturesJson = PoApprovalWorkflowEngine.serializeSignatures(po1Steps),
            isFullyApproved = true,
            pendingRoleName = "Fully Authorized",
            trackingNumber = "BD-EXP-8890214",
            carrier = "BlueDart Express",
            notes = "Handle with care - fragile optical display units"
        )
        val po1Items = listOf(
            PurchaseOrderItemEntity(
                id = "poi-001",
                purchaseOrderId = "po-001",
                productId = "prd-002",
                productCode = "PRD-MON-274K",
                productName = "HP 27-inch 4K UHD Pro Color Monitor",
                quantity = 2,
                unitPrice = 28900.0,
                totalPrice = 57800.0
            )
        )
        db.purchaseOrderDao().insertOrder(po1)
        db.purchaseOrderDao().insertOrderItems(po1Items)

        // PO 2: Tier 1 Standard (< ₹25k) - Pending Level 1 Approving Manager Signature
        val po2Steps = listOf(
            PoApprovalStepInfo(
                level = 1,
                title = "Level 1: Department Manager Sign-Off",
                shortRoleTitle = "Dept Approving Manager",
                requiredRole = UserRole.MANAGER,
                authorityScope = "Requisition & Budget Verification",
                isSigned = false
            )
        )
        val po2 = PurchaseOrderEntity(
            id = "po-002",
            poNumber = "PO-2026-000502",
            purchaseRequestId = "pr-001",
            requestNumber = "PR-2026-000101",
            supplierId = "sup-001",
            supplierName = "Zenith Office Solutions Ltd",
            createdByUserId = "usr-emp",
            createdByName = "Rohit Verma",
            orderDate = System.currentTimeMillis() - 4 * 3600 * 1000L,
            expectedDeliveryDate = System.currentTimeMillis() + 4 * 24 * 3600 * 1000L,
            subtotal = 14500.0,
            taxRate = 18.0,
            taxAmount = 2610.0,
            discountAmount = 0.0,
            shippingCost = 400.0,
            totalAmount = 17510.0,
            status = OrderStatus.PENDING_APPROVAL,
            currentApprovalLevel = 1,
            requiredApprovalLevel = 1,
            approvalTierName = "Tier 1: Standard Line Sign-Off (< ₹25K)",
            approvalSignaturesJson = PoApprovalWorkflowEngine.serializeSignatures(po2Steps),
            isFullyApproved = false,
            pendingRoleName = "Dept Approving Manager",
            notes = "Standard departmental desk accessory restock"
        )
        val po2Items = listOf(
            PurchaseOrderItemEntity(
                id = "poi-002",
                purchaseOrderId = "po-002",
                productId = "prd-001",
                productCode = "PRD-CHR-ERG01",
                productName = "Ergonomic High-Back Executive Mesh Chair",
                quantity = 1,
                unitPrice = 14500.0,
                totalPrice = 14500.0
            )
        )
        db.purchaseOrderDao().insertOrder(po2)
        db.purchaseOrderDao().insertOrderItems(po2Items)

        // PO 3: Tier 2 Mid-Value (₹25k - ₹100k) - Level 1 Signed, Pending Level 2 Procurement Manager Signature
        val po3Steps = listOf(
            PoApprovalStepInfo(
                level = 1,
                title = "Level 1: Department Manager Sign-Off",
                shortRoleTitle = "Dept Approving Manager",
                requiredRole = UserRole.MANAGER,
                authorityScope = "Requisition & Budget Verification",
                isSigned = true,
                signerUserId = "usr-mgr",
                signerName = "Rajesh Sharma",
                signerRole = "Approving Manager",
                signedAt = System.currentTimeMillis() - 3 * 3600 * 1000L,
                remarks = "Departmental budget available under Q3 workstation refresh initiative.",
                signatureCertificate = "CERT-20260831-PO-2026-000503-L1-B34D12F0"
            ),
            PoApprovalStepInfo(
                level = 2,
                title = "Level 2: Procurement Head Sign-Off",
                shortRoleTitle = "Procurement Manager",
                requiredRole = UserRole.PROCUREMENT_MANAGER,
                authorityScope = "Vendor Pricing & Commercial Compliance",
                isSigned = false
            )
        )
        val po3 = PurchaseOrderEntity(
            id = "po-003",
            poNumber = "PO-2026-000503",
            purchaseRequestId = "pr-003",
            requestNumber = "PR-2026-000103",
            supplierId = "sup-002",
            supplierName = "Global Tech & Hardware Hub",
            createdByUserId = "usr-emp",
            createdByName = "Rohit Verma",
            orderDate = System.currentTimeMillis() - 3 * 3600 * 1000L,
            expectedDeliveryDate = System.currentTimeMillis() + 5 * 24 * 3600 * 1000L,
            subtotal = 72000.0,
            taxRate = 18.0,
            taxAmount = 12960.0,
            discountAmount = 1500.0,
            shippingCost = 500.0,
            totalAmount = 83960.0,
            status = OrderStatus.PENDING_APPROVAL,
            currentApprovalLevel = 2,
            requiredApprovalLevel = 2,
            approvalTierName = "Tier 2: Mid-Value Dual Sign-Off (₹25K - ₹100K)",
            approvalSignaturesJson = PoApprovalWorkflowEngine.serializeSignatures(po3Steps),
            isFullyApproved = false,
            pendingRoleName = "Procurement Manager",
            notes = "Bulk memory and peripherals order"
        )
        val po3Items = listOf(
            PurchaseOrderItemEntity(
                id = "poi-003",
                purchaseOrderId = "po-003",
                productId = "prd-004",
                productCode = "PRD-DOCK-TB4",
                productName = "Thunderbolt 4 Multi-Display Docking Station 120W",
                quantity = 4,
                unitPrice = 18000.0,
                totalPrice = 72000.0
            )
        )
        db.purchaseOrderDao().insertOrder(po3)
        db.purchaseOrderDao().insertOrderItems(po3Items)

        // PO 4: Tier 3 High-Value (₹100k - ₹500k) - Level 1 & 2 Signed, Pending Level 3 Finance Director / Admin Signature
        val po4Steps = listOf(
            PoApprovalStepInfo(
                level = 1,
                title = "Level 1: Department Manager Sign-Off",
                shortRoleTitle = "Dept Approving Manager",
                requiredRole = UserRole.MANAGER,
                authorityScope = "Requisition & Budget Verification",
                isSigned = true,
                signerUserId = "usr-mgr",
                signerName = "Rajesh Sharma",
                signerRole = "Approving Manager",
                signedAt = System.currentTimeMillis() - 6 * 3600 * 1000L,
                remarks = "Approved for lab infrastructure upgrade.",
                signatureCertificate = "CERT-20260831-PO-2026-000504-L1-77C201A9"
            ),
            PoApprovalStepInfo(
                level = 2,
                title = "Level 2: Procurement Head Sign-Off",
                shortRoleTitle = "Procurement Manager",
                requiredRole = UserRole.PROCUREMENT_MANAGER,
                authorityScope = "Vendor Pricing & Commercial Compliance",
                isSigned = true,
                signerUserId = "usr-proc",
                signerName = "Ananya Roy",
                signerRole = "Procurement Mgr",
                signedAt = System.currentTimeMillis() - 5 * 3600 * 1000L,
                remarks = "Commercial terms negotiate 4% bulk discount. Approved.",
                signatureCertificate = "CERT-20260831-PO-2026-000504-L2-990DF32B"
            ),
            PoApprovalStepInfo(
                level = 3,
                title = "Level 3: Finance Director Sign-Off",
                shortRoleTitle = "Finance Director / VP Ops",
                requiredRole = UserRole.ADMIN,
                authorityScope = "CapEx Fiscal Authorization",
                isSigned = false
            )
        )
        val po4 = PurchaseOrderEntity(
            id = "po-004",
            poNumber = "PO-2026-000504",
            purchaseRequestId = "pr-004",
            requestNumber = "PR-2026-000104",
            supplierId = "sup-004",
            supplierName = "Apex Industrial Machinery Corp",
            createdByUserId = "usr-proc",
            createdByName = "Ananya Roy",
            orderDate = System.currentTimeMillis() - 6 * 3600 * 1000L,
            expectedDeliveryDate = System.currentTimeMillis() + 7 * 24 * 3600 * 1000L,
            subtotal = 210000.0,
            taxRate = 18.0,
            taxAmount = 37800.0,
            discountAmount = 8400.0,
            shippingCost = 1500.0,
            totalAmount = 240900.0,
            status = OrderStatus.PENDING_APPROVAL,
            currentApprovalLevel = 3,
            requiredApprovalLevel = 3,
            approvalTierName = "Tier 3: High-Value Triple Sign-Off (₹100K - ₹500K)",
            approvalSignaturesJson = PoApprovalWorkflowEngine.serializeSignatures(po4Steps),
            isFullyApproved = false,
            pendingRoleName = "Finance Director / VP Ops",
            notes = "Lab test bench instrumentation"
        )
        val po4Items = listOf(
            PurchaseOrderItemEntity(
                id = "poi-004",
                purchaseOrderId = "po-004",
                productId = "prd-008",
                productCode = "PRD-SRV-RACK",
                productName = "42U Enterprise Server Rack Enclosure with PDU",
                quantity = 3,
                unitPrice = 70000.0,
                totalPrice = 210000.0
            )
        )
        db.purchaseOrderDao().insertOrder(po4)
        db.purchaseOrderDao().insertOrderItems(po4Items)

        // 8. Delivery for PO 1
        val delivery1 = DeliveryEntity(
            id = "del-001",
            purchaseOrderId = "po-001",
            poNumber = "PO-2026-000501",
            deliveryAgentId = "usr-del",
            deliveryAgentName = "Suresh Kumar",
            trackingNumber = "BD-EXP-8890214",
            carrier = "BlueDart Express",
            shippingAddress = "Smart Procurement Center, Warehouse Gate 2, Electronic City Phase 1, Bangalore 560100",
            expectedDeliveryDate = System.currentTimeMillis() + 24 * 3600 * 1000L,
            status = DeliveryStatus.IN_TRANSIT,
            currentCheckpoint = "In Transit - Out of Regional Sorting Hub (Bangalore South)"
        )
        val checkpoints1 = listOf(
            DeliveryTrackingCheckpointEntity(
                id = "chk-1",
                deliveryId = "del-001",
                stageName = "Order Manifest Created",
                location = "Pune Fulfillment Warehouse",
                timestamp = System.currentTimeMillis() - 14 * 3600 * 1000L,
                isCompleted = true,
                notes = "Package sealed and shipping label affixed"
            ),
            DeliveryTrackingCheckpointEntity(
                id = "chk-2",
                deliveryId = "del-001",
                stageName = "Picked Up by Carrier",
                location = "BlueDart Pune Central Depot",
                timestamp = System.currentTimeMillis() - 10 * 3600 * 1000L,
                isCompleted = true,
                notes = "Vehicle dispatch ID BD-PN-9921"
            ),
            DeliveryTrackingCheckpointEntity(
                id = "chk-3",
                deliveryId = "del-001",
                stageName = "Arrived at Regional Sorting Facility",
                location = "Bangalore South Hub",
                timestamp = System.currentTimeMillis() - 3 * 3600 * 1000L,
                isCompleted = true,
                notes = "Scanned and queued for last-mile delivery vehicle"
            ),
            DeliveryTrackingCheckpointEntity(
                id = "chk-4",
                deliveryId = "del-001",
                stageName = "Out for Delivery",
                location = "Electronic City Sector 4",
                timestamp = System.currentTimeMillis() + 8 * 3600 * 1000L,
                isCompleted = false,
                notes = "Assigned to Agent Suresh Kumar (+91 98000 00007)"
            ),
            DeliveryTrackingCheckpointEntity(
                id = "chk-5",
                deliveryId = "del-001",
                stageName = "Delivered & Inspected",
                location = "Receiving Dock 2",
                timestamp = System.currentTimeMillis() + 24 * 3600 * 1000L,
                isCompleted = false,
                notes = "Automatic inventory inwarding and stock increase trigger on completion"
            )
        )
        db.deliveryDao().insertDelivery(delivery1)
        db.deliveryDao().insertCheckpoints(checkpoints1)

        // 9. Historical Inventory Transactions
        val invLogs = listOf(
            InventoryTransactionEntity(
                id = "inv-001",
                productId = "prd-003",
                productName = "Logitech MX Master 3S Wireless Mouse",
                transactionType = TransactionType.PURCHASE_RECEIPT,
                quantityChanged = 15,
                previousStock = 9,
                newStock = 24,
                referenceId = "PO-2026-000488",
                notes = "Received from Apex Enterprise Solutions, batch verified",
                timestamp = System.currentTimeMillis() - 48 * 3600 * 1000L
            ),
            InventoryTransactionEntity(
                id = "inv-002",
                productId = "prd-006",
                productName = "Herman Miller Aeron Ergonomic Chair",
                transactionType = TransactionType.PURCHASE_RECEIPT,
                quantityChanged = 5,
                previousStock = 9,
                newStock = 14,
                referenceId = "PO-2026-000492",
                notes = "Delivered to Floor 3 Executive Hall",
                timestamp = System.currentTimeMillis() - 36 * 3600 * 1000L
            )
        )
        invLogs.forEach { db.inventoryDao().insertTransaction(it) }

        // 10. Initial In-App Notifications
        val notifs = listOf(
            NotificationEntity(
                id = "notif-001",
                userId = "usr-mgr",
                title = "Approval Required: PR-2026-000101",
                message = "Priya Patel submitted a High-Priority request for Dell Latitude Laptops (₹1,37,000).",
                eventType = NotificationEventType.REQUEST_SUBMITTED,
                channel = NotificationChannel.IN_APP,
                isRead = false,
                referenceId = "pr-001"
            ),
            NotificationEntity(
                id = "notif-002",
                userId = "usr-proc",
                title = "Low Stock Alert: 4 Items Below Threshold",
                message = "Dell Latitude 5440 (4 left, min 10), HP 4K Monitor (6 left, min 8), Cisco Switch (2 left, min 5) require replenishment.",
                eventType = NotificationEventType.LOW_STOCK,
                channel = NotificationChannel.IN_APP,
                isRead = false,
                referenceId = "prd-001"
            ),
            NotificationEntity(
                id = "notif-003",
                userId = "usr-sup",
                title = "New Purchase Order Assigned: PO-2026-000501",
                message = "Global Tech & Hardware Hub has been assigned PO-2026-000501 for ₹67,604.",
                eventType = NotificationEventType.PO_CREATED,
                channel = NotificationChannel.IN_APP,
                isRead = true,
                referenceId = "po-001"
            )
        )
        notifs.forEach { db.notificationDao().insertNotification(it) }

        // 11. Initial Audit Logs
        val auditLogs = listOf(
            AuditLogEntity(
                id = "aud-001",
                userId = "usr-emp",
                userName = "Priya Patel",
                userRole = UserRole.EMPLOYEE,
                action = AuditAction.SUBMIT_REQUEST,
                entityType = "PURCHASE_REQUEST",
                entityId = "PR-2026-000101",
                summary = "Created and submitted High priority request for 2x Dell Latitude 5440 Enterprise Laptops",
                timestamp = System.currentTimeMillis() - 2 * 3600 * 1000L
            ),
            AuditLogEntity(
                id = "aud-002",
                userId = "usr-proc",
                userName = "Ananya Roy",
                userRole = UserRole.PROCUREMENT_MANAGER,
                action = AuditAction.CREATE_PO,
                entityType = "PURCHASE_ORDER",
                entityId = "PO-2026-000501",
                summary = "Generated Purchase Order PO-2026-000501 from approved PR-2026-000102 with supplier Global Tech",
                timestamp = System.currentTimeMillis() - 18 * 3600 * 1000L
            ),
            AuditLogEntity(
                id = "aud-003",
                userId = "usr-sup",
                userName = "Meera Nambiar (Supplier)",
                userRole = UserRole.SUPPLIER,
                action = AuditAction.ACCEPT_PO,
                entityType = "PURCHASE_ORDER",
                entityId = "PO-2026-000501",
                summary = "Supplier accepted PO-2026-000501 and queued for warehouse packing",
                timestamp = System.currentTimeMillis() - 15 * 3600 * 1000L
            ),
            AuditLogEntity(
                id = "aud-004",
                userId = "usr-del",
                userName = "Suresh Kumar",
                userRole = UserRole.DELIVERY_AGENT,
                action = AuditAction.UPDATE_DELIVERY,
                entityType = "DELIVERY",
                entityId = "BD-EXP-8890214",
                summary = "Shipment scanned at Bangalore South sorting facility - In Transit",
                timestamp = System.currentTimeMillis() - 3 * 3600 * 1000L
            )
        )
        auditLogs.forEach { db.auditDao().insertAuditLog(it) }

        // 12. Supplier Performance Ratings
        val ratings = listOf(
            SupplierPerformanceRatingEntity(
                id = "rat-001",
                supplierId = "sup-001",
                supplierName = "Apex Enterprise Solutions",
                purchaseOrderId = "PO-2026-000502",
                poNumber = "PO-2026-000502",
                ratedByUserId = "usr-proc",
                ratedByName = "Ananya Roy",
                qualityScore = 98.0,
                deliveryScore = 99.0,
                pricingScore = 96.0,
                serviceScore = 97.0,
                overallScore = 97.6,
                ratingStars = 4.9,
                feedbackComments = "Outstanding fulfillment speed. All hardware items passed QC inspection with 0 defects and prompt GST tax invoices.",
                ratingCategory = "IT Infrastructure & Hardware",
                ratingDate = System.currentTimeMillis() - 4 * 24 * 3600 * 1000L
            ),
            SupplierPerformanceRatingEntity(
                id = "rat-002",
                supplierId = "sup-001",
                supplierName = "Apex Enterprise Solutions",
                purchaseOrderId = "PO-2026-000490",
                poNumber = "PO-2026-000490",
                ratedByUserId = "usr-mgr",
                ratedByName = "Rajesh Sharma",
                qualityScore = 97.0,
                deliveryScore = 98.0,
                pricingScore = 95.0,
                serviceScore = 98.0,
                overallScore = 97.0,
                ratingStars = 4.9,
                feedbackComments = "Consistently reliable delivery SLA. Rapid response to technical specifications.",
                ratingCategory = "Enterprise Computing",
                ratingDate = System.currentTimeMillis() - 12 * 24 * 3600 * 1000L
            ),
            SupplierPerformanceRatingEntity(
                id = "rat-003",
                supplierId = "sup-004",
                supplierName = "Prime Office Systems",
                purchaseOrderId = "PO-2026-000498",
                poNumber = "PO-2026-000498",
                ratedByUserId = "usr-proc",
                ratedByName = "Ananya Roy",
                qualityScore = 94.0,
                deliveryScore = 95.0,
                pricingScore = 93.0,
                serviceScore = 94.0,
                overallScore = 94.0,
                ratingStars = 4.7,
                feedbackComments = "Great ergonomics inventory batch, on-time dock delivery and clean packaging.",
                ratingCategory = "Office Furniture & Ergonomics",
                ratingDate = System.currentTimeMillis() - 8 * 24 * 3600 * 1000L
            ),
            SupplierPerformanceRatingEntity(
                id = "rat-004",
                supplierId = "sup-002",
                supplierName = "Global Tech & Hardware Hub",
                purchaseOrderId = "PO-2026-000501",
                poNumber = "PO-2026-000501",
                ratedByUserId = "usr-proc",
                ratedByName = "Ananya Roy",
                qualityScore = 92.0,
                deliveryScore = 94.0,
                pricingScore = 90.0,
                serviceScore = 93.0,
                overallScore = 92.2,
                ratingStars = 4.6,
                feedbackComments = "Good communication during transit. Component specs accurately match PO.",
                ratingCategory = "Electronics & Peripherals",
                ratingDate = System.currentTimeMillis() - 15 * 24 * 3600 * 1000L
            ),
            SupplierPerformanceRatingEntity(
                id = "rat-005",
                supplierId = "sup-003",
                supplierName = "Nexus Industrial Supplies",
                purchaseOrderId = null,
                poNumber = "PO-2026-000480",
                ratedByUserId = "usr-wh",
                ratedByName = "Karan Verma",
                qualityScore = 88.0,
                deliveryScore = 90.0,
                pricingScore = 89.0,
                serviceScore = 86.0,
                overallScore = 88.2,
                ratingStars = 4.4,
                feedbackComments = "Standard industrial packing. Slight delay in dispatch tracking confirmation.",
                ratingCategory = "Warehouse & Logistics Supplies",
                ratingDate = System.currentTimeMillis() - 20 * 24 * 3600 * 1000L
            ),
            SupplierPerformanceRatingEntity(
                id = "rat-006",
                supplierId = "sup-005",
                supplierName = "Horizon Electronics India",
                purchaseOrderId = null,
                poNumber = "PO-2026-000475",
                ratedByUserId = "usr-proc",
                ratedByName = "Ananya Roy",
                qualityScore = 86.0,
                deliveryScore = 88.0,
                pricingScore = 87.0,
                serviceScore = 85.0,
                overallScore = 86.5,
                ratingStars = 4.3,
                feedbackComments = "Acceptable quality. Lead times could be improved for expedited orders.",
                ratingCategory = "Cables & Electronic Accessories",
                ratingDate = System.currentTimeMillis() - 25 * 24 * 3600 * 1000L
            )
        )
        db.supplierRatingDao().insertRatings(ratings)
    }
}
