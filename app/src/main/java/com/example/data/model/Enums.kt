package com.example.data.model

enum class UserRole(val displayName: String, val badgeColor: Long) {
    ADMIN("Admin", 0xFF6366F1),
    PROCUREMENT_MANAGER("Procurement Mgr", 0xFF0284C7),
    MANAGER("Approving Manager", 0xFF0D9488),
    EMPLOYEE("Employee", 0xFF8B5CF6),
    CUSTOMER("Customer", 0xFFEC4899),
    SUPPLIER("Supplier / Vendor", 0xFFF59E0B),
    DELIVERY_AGENT("Delivery Agent", 0xFF10B981)
}

enum class Priority(val displayName: String) {
    LOW("Low"),
    MEDIUM("Medium"),
    HIGH("High"),
    URGENT("Urgent")
}

enum class RequestStatus(val displayName: String) {
    DRAFT("Draft"),
    SUBMITTED("Submitted"),
    PENDING_APPROVAL("Pending Approval"),
    APPROVED("Approved"),
    REJECTED("Rejected"),
    CANCELLED("Cancelled"),
    CONVERTED_TO_PO("Converted to PO")
}

enum class OrderStatus(val displayName: String) {
    DRAFT("Draft"),
    PENDING_APPROVAL("Pending Approval"),
    APPROVED("Approved"),
    SENT_TO_SUPPLIER("Sent to Supplier"),
    SUPPLIER_ACCEPTED("Supplier Accepted"),
    SUPPLIER_REJECTED("Supplier Rejected"),
    PROCESSING("Processing"),
    DISPATCHED("Dispatched"),
    IN_TRANSIT("In Transit"),
    OUT_FOR_DELIVERY("Out for Delivery"),
    DELIVERED("Delivered"),
    COMPLETED("Completed"),
    CANCELLED("Cancelled")
}

enum class DeliveryStatus(val displayName: String) {
    CREATED("Created"),
    PICKED_UP("Picked Up"),
    IN_TRANSIT("In Transit"),
    OUT_FOR_DELIVERY("Out for Delivery"),
    DELIVERED("Delivered"),
    FAILED("Failed"),
    RETURNED("Returned")
}

enum class TransactionType(val displayName: String) {
    PURCHASE_RECEIPT("Purchase Receipt"),
    RESERVATION("Stock Reservation"),
    RELEASE("Stock Release"),
    ADJUSTMENT("Inventory Adjustment"),
    SALE("Direct Issue / Sale")
}

enum class NotificationChannel {
    IN_APP,
    EMAIL,
    SMS
}

enum class NotificationEventType(val title: String) {
    PO_CREATED("Purchase Order Created"),
    PO_APPROVAL_REQUIRED("Purchase Order Signature Required"),
    PO_LEVEL_APPROVED("Purchase Order Level Approved"),
    PO_FULLY_APPROVED("Purchase Order Fully Approved & Released"),
    PO_REJECTED("Purchase Order Rejected"),
    REQUEST_SUBMITTED("Purchase Request Submitted"),
    REQUEST_APPROVED("Purchase Request Approved"),
    REQUEST_REJECTED("Purchase Request Rejected"),
    SUPPLIER_ACCEPTED("Supplier Accepted Order"),
    SUPPLIER_REJECTED("Supplier Rejected Order"),
    ORDER_DISPATCHED("Order Dispatched"),
    ORDER_IN_TRANSIT("Shipment In Transit"),
    OUT_FOR_DELIVERY("Out for Delivery"),
    ORDER_DELIVERED("Order Delivered & Stock Updated"),
    LOW_STOCK("Low Stock Warning"),
    SYSTEM("System Notification")
}

enum class AuditAction(val description: String) {
    LOGIN("User Login"),
    CREATE_PRODUCT("Create Product"),
    UPDATE_PRODUCT("Update Product"),
    CREATE_SUPPLIER("Create Supplier"),
    CREATE_REQUEST("Create Purchase Request"),
    SUBMIT_REQUEST("Submit Purchase Request"),
    APPROVE_REQUEST("Approve Purchase Request"),
    REJECT_REQUEST("Reject Purchase Request"),
    CREATE_PO("Create Purchase Order"),
    APPROVE_PO_LEVEL("Approve PO Hierarchical Signature"),
    REJECT_PO_LEVEL("Reject PO Hierarchical Signature"),
    FULLY_APPROVE_PO("PO Fully Authorized & Released"),
    SEND_PO("Send PO to Supplier"),
    ACCEPT_PO("Supplier Accepted PO"),
    REJECT_PO("Supplier Rejected PO"),
    DISPATCH_ORDER("Dispatch Order"),
    UPDATE_DELIVERY("Update Delivery Checkpoint"),
    MARK_DELIVERED("Delivery Completed & Inventory Inwarded"),
    UPDATE_INVENTORY("Manual Inventory Adjustment"),
    WORKFLOW_ACTION("Workflow Engine Execution"),
    SIGN_UP("User Registration"),
    LOGOUT("User Logout"),
    UPGRADE_MEMBERSHIP("Membership Plan Change")
}

enum class MembershipPlan(
    val planName: String,
    val tierCode: String,
    val monthlyPrice: Double,
    val yearlyPrice: Double,
    val maxMonthlyPoVolume: Int,
    val maxUsers: Int,
    val maxApprovalLevels: Int,
    val prioritySupport: Boolean,
    val analyticsAccess: Boolean,
    val autoRfqMatching: Boolean,
    val badgeText: String,
    val badgeColor: Long,
    val description: String,
    val features: List<String>
) {
    STARTER(
        planName = "Starter Essentials",
        tierCode = "STARTER",
        monthlyPrice = 0.0,
        yearlyPrice = 0.0,
        maxMonthlyPoVolume = 25,
        maxUsers = 5,
        maxApprovalLevels = 1,
        prioritySupport = false,
        analyticsAccess = false,
        autoRfqMatching = false,
        badgeText = "FREE / STARTER",
        badgeColor = 0xFF64748B,
        description = "Ideal for small teams and initial procurement trial.",
        features = listOf(
            "Up to 25 Purchase Orders / month",
            "Single-tier Approval Workflow",
            "5 Active Team Members",
            "Standard In-App Notifications",
            "Basic Inventory Tracking"
        )
    ),
    PROFESSIONAL(
        planName = "Professional Growth",
        tierCode = "PRO",
        monthlyPrice = 2499.0,
        yearlyPrice = 24990.0,
        maxMonthlyPoVolume = 150,
        maxUsers = 25,
        maxApprovalLevels = 3,
        prioritySupport = true,
        analyticsAccess = true,
        autoRfqMatching = true,
        badgeText = "PRO TIER",
        badgeColor = 0xFF0284C7,
        description = "For growing businesses requiring multi-tier approvals and real-time vendor scoring.",
        features = listOf(
            "Up to 150 Purchase Orders / month",
            "3-Tier Hierarchical Approvals & Digital Certificates",
            "25 Team Members with Role-Based Access",
            "Full Analytics, Spend Charts & Audit Logs",
            "Smart AI Supplier Recommendations",
            "Priority SLA & BlueDart Logistics Tracking"
        )
    ),
    ENTERPRISE(
        planName = "Enterprise Global",
        tierCode = "ENTERPRISE",
        monthlyPrice = 7999.0,
        yearlyPrice = 79990.0,
        maxMonthlyPoVolume = 10000,
        maxUsers = 500,
        maxApprovalLevels = 4,
        prioritySupport = true,
        analyticsAccess = true,
        autoRfqMatching = true,
        badgeText = "ENTERPRISE ELITE",
        badgeColor = 0xFF6366F1,
        description = "Full enterprise capability with unlimited volume, 4-tier C-suite workflows, and automated replenishment.",
        features = listOf(
            "Unlimited Purchase Orders & RFQ Matchmaking",
            "4-Tier Board & CFO Approval Workflows",
            "500+ Cross-Department Users & Multi-Entity",
            "Predictive AI Replenishment Engine",
            "Automated GRN & Real-Time Stock Reconciliation",
            "24/7 Dedicated Procurement Concierge",
            "Custom REST API & Webhook Integrations"
        )
    ),
    SUPPLIER_VERIFIED(
        planName = "Verified Supplier Partner",
        tierCode = "VENDOR_GOLD",
        monthlyPrice = 1999.0,
        yearlyPrice = 19990.0,
        maxMonthlyPoVolume = 10000,
        maxUsers = 15,
        maxApprovalLevels = 1,
        prioritySupport = true,
        analyticsAccess = true,
        autoRfqMatching = true,
        badgeText = "VERIFIED VENDOR",
        badgeColor = 0xFF10B981,
        description = "For accredited suppliers wanting top catalog placement and verified buyer RFQ access.",
        features = listOf(
            "Verified Vendor Trust Badge & Catalog Boost",
            "Instant Order Acceptance & Dispatch Portal",
            "Live Delivery Checkpoint Updation",
            "Automated Invoicing & Payment Reminders",
            "Quality & SLA Performance Dashboard"
        )
    )
}
