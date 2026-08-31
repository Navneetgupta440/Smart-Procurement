package com.example.data.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey
import com.example.data.model.AuditAction
import com.example.data.model.DeliveryStatus
import com.example.data.model.MembershipPlan
import com.example.data.model.NotificationChannel
import com.example.data.model.NotificationEventType
import com.example.data.model.OrderStatus
import com.example.data.model.Priority
import com.example.data.model.RequestStatus
import com.example.data.model.TransactionType
import com.example.data.model.UserRole
import java.util.UUID

@Entity(
    tableName = "users",
    indices = [Index(value = ["email"], unique = true)]
)
data class UserEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val name: String,
    val email: String,
    val phone: String,
    val role: UserRole,
    val department: String,
    val supplierId: String? = null,
    val status: String = "ACTIVE",
    val avatarUrl: String = "",
    val passwordHash: String = "password123",
    val membershipPlan: MembershipPlan = MembershipPlan.ENTERPRISE,
    val planBillingCycle: String = "MONTHLY",
    val planExpiresAt: Long = System.currentTimeMillis() + (365L * 24 * 60 * 60 * 1000L),
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "categories",
    indices = [Index(value = ["code"], unique = true)]
)
data class CategoryEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val name: String,
    val code: String,
    val description: String,
    val iconName: String = "Inventory"
)

@Entity(
    tableName = "products",
    indices = [
        Index(value = ["productCode"], unique = true),
        Index(value = ["categoryId"]),
        Index(value = ["supplierId"])
    ]
)
data class ProductEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val productCode: String,
    val name: String,
    val description: String,
    val categoryId: String,
    val categoryName: String,
    val supplierId: String,
    val supplierName: String,
    val unitPrice: Double,
    val availableQuantity: Int,
    val reservedQuantity: Int = 0,
    val minimumStock: Int,
    val maximumStock: Int,
    val unit: String = "Units",
    val rating: Double = 4.5,
    val status: String = "ACTIVE",
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "suppliers",
    indices = [Index(value = ["email"], unique = true), Index(value = ["gstNumber"], unique = true)]
)
data class SupplierEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val companyName: String,
    val contactPerson: String,
    val email: String,
    val phone: String,
    val address: String,
    val city: String,
    val state: String = "KA",
    val country: String = "India",
    val gstNumber: String,
    val rating: Double = 4.5,
    val qualityScore: Double = 90.0,
    val onTimeDeliveryRate: Double = 95.0,
    val averageLeadDays: Int = 3,
    val status: String = "ACTIVE",
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "purchase_requests",
    indices = [
        Index(value = ["requestNumber"], unique = true),
        Index(value = ["requestedByUserId"]),
        Index(value = ["status"])
    ]
)
data class PurchaseRequestEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val requestNumber: String,
    val requestedByUserId: String,
    val requesterName: String,
    val requesterRole: UserRole,
    val department: String,
    val priority: Priority = Priority.MEDIUM,
    val reason: String,
    val status: RequestStatus = RequestStatus.SUBMITTED,
    val estimatedAmount: Double,
    val currentApprovalLevel: Int = 1,
    val requiredApprovalLevel: Int = 1,
    val rejectionReason: String? = null,
    val approvedBy: String? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "purchase_request_items",
    indices = [Index(value = ["purchaseRequestId"]), Index(value = ["productId"])]
)
data class PurchaseRequestItemEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val purchaseRequestId: String,
    val productId: String,
    val productCode: String,
    val productName: String,
    val quantity: Int,
    val estimatedUnitPrice: Double,
    val estimatedTotal: Double
)

@Entity(
    tableName = "purchase_orders",
    indices = [
        Index(value = ["poNumber"], unique = true),
        Index(value = ["purchaseRequestId"]),
        Index(value = ["supplierId"]),
        Index(value = ["status"])
    ]
)
data class PurchaseOrderEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val poNumber: String,
    val purchaseRequestId: String,
    val requestNumber: String = "",
    val supplierId: String,
    val supplierName: String,
    val createdByUserId: String,
    val createdByName: String,
    val orderDate: Long = System.currentTimeMillis(),
    val expectedDeliveryDate: Long = System.currentTimeMillis() + (4 * 24 * 60 * 60 * 1000L),
    val subtotal: Double,
    val taxRate: Double = 18.0,
    val taxAmount: Double,
    val discountAmount: Double = 0.0,
    val shippingCost: Double = 500.0,
    val totalAmount: Double,
    val status: OrderStatus = OrderStatus.PENDING_APPROVAL,
    val currentApprovalLevel: Int = 1,
    val requiredApprovalLevel: Int = 1,
    val approvalTierName: String = "Tier 1: Standard (< ₹25K)",
    val approvalSignaturesJson: String = "",
    val isFullyApproved: Boolean = false,
    val pendingRoleName: String = "Approving Manager",
    val rejectionReason: String? = null,
    val notes: String = "",
    val trackingNumber: String? = null,
    val carrier: String? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "purchase_order_items",
    indices = [Index(value = ["purchaseOrderId"]), Index(value = ["productId"])]
)
data class PurchaseOrderItemEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val purchaseOrderId: String,
    val productId: String,
    val productCode: String,
    val productName: String,
    val quantity: Int,
    val unitPrice: Double,
    val totalPrice: Double
)

@Entity(
    tableName = "deliveries",
    indices = [
        Index(value = ["purchaseOrderId"], unique = true),
        Index(value = ["trackingNumber"], unique = true),
        Index(value = ["deliveryAgentId"]),
        Index(value = ["status"])
    ]
)
data class DeliveryEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val purchaseOrderId: String,
    val poNumber: String,
    val deliveryAgentId: String,
    val deliveryAgentName: String,
    val trackingNumber: String,
    val carrier: String = "BlueDart Express",
    val shippingAddress: String = "Main Logistics Hub, Building 4B, Electronic City, Bangalore - 560100",
    val expectedDeliveryDate: Long = System.currentTimeMillis() + (3 * 24 * 60 * 60 * 1000L),
    val actualDeliveryDate: Long? = null,
    val status: DeliveryStatus = DeliveryStatus.CREATED,
    val currentCheckpoint: String = "Order ready at fulfillment facility",
    val failureReason: String? = null,
    val lastUpdated: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "delivery_tracking_checkpoints",
    indices = [Index(value = ["deliveryId"])]
)
data class DeliveryTrackingCheckpointEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val deliveryId: String,
    val stageName: String,
    val location: String,
    val timestamp: Long = System.currentTimeMillis(),
    val isCompleted: Boolean = false,
    val notes: String = ""
)

@Entity(
    tableName = "inventory_transactions",
    indices = [Index(value = ["productId"]), Index(value = ["timestamp"])]
)
data class InventoryTransactionEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val productId: String,
    val productName: String,
    val transactionType: TransactionType,
    val quantityChanged: Int,
    val previousStock: Int,
    val newStock: Int,
    val referenceId: String = "",
    val notes: String = "",
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "notifications",
    indices = [Index(value = ["userId"]), Index(value = ["isRead"]), Index(value = ["timestamp"])]
)
data class NotificationEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val userId: String,
    val title: String,
    val message: String,
    val eventType: NotificationEventType,
    val channel: NotificationChannel = NotificationChannel.IN_APP,
    val isRead: Boolean = false,
    val referenceId: String = "",
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(
    tableName = "audit_logs",
    indices = [Index(value = ["userId"]), Index(value = ["entityType"]), Index(value = ["timestamp"])]
)
data class AuditLogEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val userId: String,
    val userName: String,
    val userRole: UserRole,
    val action: AuditAction,
    val entityType: String,
    val entityId: String,
    val summary: String,
    val oldValue: String? = null,
    val newValue: String? = null,
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "system_settings")
data class SystemSettingsEntity(
    @PrimaryKey val id: String = "GLOBAL_CONFIG",
    val autoPoGeneration: Boolean = false,
    val approvalLimitManager: Double = 15000.0,
    val approvalLimitProcurementManager: Double = 100000.0,
    val poThresholdTier1: Double = 25000.0, // Up to 25k -> 1 Signature (Dept Manager)
    val poThresholdTier2: Double = 100000.0, // 25k to 100k -> 2 Signatures (Dept Mgr + Procurement Mgr)
    val poThresholdTier3: Double = 500000.0, // 100k to 500k -> 3 Signatures (Dept Mgr + Procurement Mgr + Finance Director)
    // Over 500k -> 4 Signatures (Dept Mgr + Procurement Mgr + Finance Dir + CFO/Board)
    val weightPrice: Double = 0.35,
    val weightQuality: Double = 0.20,
    val weightDelivery: Double = 0.20,
    val weightRating: Double = 0.15,
    val weightReliability: Double = 0.10
)

@Entity(
    tableName = "supplier_ratings",
    indices = [
        Index(value = ["supplierId"]),
        Index(value = ["ratedByUserId"]),
        Index(value = ["ratingDate"])
    ]
)
data class SupplierPerformanceRatingEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val supplierId: String,
    val supplierName: String,
    val purchaseOrderId: String? = null,
    val poNumber: String? = null,
    val ratedByUserId: String,
    val ratedByName: String,
    val qualityScore: Double, // 0.0 - 100.0
    val deliveryScore: Double, // 0.0 - 100.0 (On-time Delivery & SLA)
    val pricingScore: Double, // 0.0 - 100.0 (Pricing Competitiveness & Invoicing)
    val serviceScore: Double, // 0.0 - 100.0 (Responsiveness & Support)
    val overallScore: Double, // Weighted or Arithmetic average 0.0 - 100.0
    val ratingStars: Double = (overallScore / 20.0).coerceIn(1.0, 5.0),
    val feedbackComments: String = "",
    val ratingCategory: String = "PO Fulfillment",
    val ratingDate: Long = System.currentTimeMillis()
)
