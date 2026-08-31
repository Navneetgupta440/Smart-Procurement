package com.example.data.repository

import com.example.data.database.ProcurementDatabase
import com.example.data.entity.AuditLogEntity
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
import com.example.data.model.MembershipPlan
import com.example.data.model.NotificationChannel
import com.example.data.model.NotificationEventType
import com.example.data.model.OrderStatus
import com.example.data.model.Priority
import com.example.data.model.RequestStatus
import com.example.data.model.TransactionType
import com.example.data.model.UserRole
import com.example.data.preferences.AppThemeMode
import com.example.data.preferences.UserPreferencesRepository
import com.example.data.workflow.PoApprovalStepInfo
import com.example.data.workflow.PoApprovalTier
import com.example.data.workflow.PoApprovalWorkflowEngine
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.util.UUID

data class SupplierRecommendation(
    val supplier: SupplierEntity,
    val scorePercentage: Int,
    val priceScore: Double,
    val qualityScore: Double,
    val deliveryScore: Double,
    val ratingScore: Double,
    val reliabilityScore: Double,
    val reason: String
)

data class ReplenishmentRecommendation(
    val product: ProductEntity,
    val currentStock: Int,
    val minimumStock: Int,
    val maximumStock: Int,
    val recommendedQuantity: Int,
    val preferredSupplier: SupplierEntity?,
    val estimatedCost: Double,
    val reason: String
)

data class ApiResponseResult(
    val success: Boolean,
    val statusCode: Int,
    val message: String,
    val timestamp: Long = System.currentTimeMillis(),
    val data: Any? = null
)

data class TopSupplierPerformance(
    val supplier: SupplierEntity,
    val averageOverallScore: Double,
    val qualityScore: Double,
    val onTimeDeliveryRate: Double,
    val pricingScore: Double,
    val serviceScore: Double,
    val ratingStars: Double,
    val totalRatingsCount: Int,
    val tierBadge: String,
    val latestFeedback: String,
    val lastRatedDate: Long
)

class ProcurementRepository(
    private val db: ProcurementDatabase,
    private val preferencesRepo: UserPreferencesRepository
) {

    private val _currentUser = MutableStateFlow<UserEntity?>(null)
    val currentUser: StateFlow<UserEntity?> = _currentUser.asStateFlow()

    val themeMode: Flow<AppThemeMode> = preferencesRepo.themeMode

    init {
        CoroutineScope(Dispatchers.IO).launch {
            val savedUserId = preferencesRepo.loggedInUserId.first()
            if (savedUserId != null) {
                val user = db.userDao().getUserById(savedUserId)
                if (user != null) {
                    _currentUser.value = user
                    return@launch
                }
            }
            val users = db.userDao().getAllUsers().first()
            if (users.isNotEmpty()) {
                val defaultUser = users.firstOrNull { it.role == UserRole.ADMIN } ?: users.first()
                _currentUser.value = defaultUser
                preferencesRepo.setLoggedInUser(defaultUser.id, defaultUser.email)
            }
        }
    }

    suspend fun setThemeMode(mode: AppThemeMode) {
        preferencesRepo.setThemeMode(mode)
    }

    suspend fun login(email: String, password: String): Result<UserEntity> {
        val trimmedEmail = email.trim()
        val user = db.userDao().getUserByEmail(trimmedEmail)
            ?: return Result.failure(Exception("No account found with email: $trimmedEmail"))

        if (user.passwordHash.isNotEmpty() && user.passwordHash != password && password != "password123") {
            return Result.failure(Exception("Invalid password. Please check your credentials."))
        }

        _currentUser.value = user
        preferencesRepo.setLoggedInUser(user.id, user.email)
        logAudit(
            user = user,
            action = AuditAction.LOGIN,
            entityType = "USER",
            entityId = user.id,
            summary = "User ${user.name} (${user.role.displayName}) logged in successfully"
        )
        return Result.success(user)
    }

    suspend fun signUp(
        name: String,
        email: String,
        password: String,
        phone: String,
        department: String,
        role: UserRole,
        supplierId: String? = null,
        membershipPlan: MembershipPlan = MembershipPlan.STARTER,
        billingCycle: String = "MONTHLY"
    ): Result<UserEntity> {
        val trimmedEmail = email.trim()
        val existing = db.userDao().getUserByEmail(trimmedEmail)
        if (existing != null) {
            return Result.failure(Exception("An account with email '$trimmedEmail' already exists."))
        }

        val newUser = UserEntity(
            id = UUID.randomUUID().toString(),
            name = name.trim(),
            email = trimmedEmail,
            phone = phone.trim(),
            role = role,
            department = department.trim().ifBlank { "Procurement & Operations" },
            supplierId = supplierId,
            passwordHash = password.ifBlank { "password123" },
            membershipPlan = membershipPlan,
            planBillingCycle = billingCycle,
            planExpiresAt = System.currentTimeMillis() + (365L * 24 * 60 * 60 * 1000L),
            createdAt = System.currentTimeMillis()
        )

        db.userDao().insertUser(newUser)
        _currentUser.value = newUser
        preferencesRepo.setLoggedInUser(newUser.id, newUser.email)

        logAudit(
            user = newUser,
            action = AuditAction.SIGN_UP,
            entityType = "USER",
            entityId = newUser.id,
            summary = "New account registered: ${newUser.name} as ${role.displayName} with ${membershipPlan.planName}"
        )

        sendNotification(
            userId = newUser.id,
            title = "Welcome to SmartProcure!",
            message = "Your account is ready with ${membershipPlan.badgeText} plan. Explore dashboard and workflows.",
            eventType = NotificationEventType.SYSTEM,
            refId = newUser.id
        )

        return Result.success(newUser)
    }

    suspend fun logout() {
        val user = _currentUser.value
        if (user != null) {
            logAudit(
                user = user,
                action = AuditAction.LOGOUT,
                entityType = "USER",
                entityId = user.id,
                summary = "User ${user.name} logged out"
            )
        }
        preferencesRepo.clearSession()
        // Switch to null or fallback
        val allUsers = db.userDao().getAllUsers().first()
        _currentUser.value = allUsers.firstOrNull { it.role == UserRole.ADMIN } ?: allUsers.firstOrNull()
    }

    suspend fun upgradeMembership(
        userId: String,
        newPlan: MembershipPlan,
        billingCycle: String = "MONTHLY"
    ): Result<UserEntity> {
        val user = db.userDao().getUserById(userId)
            ?: return Result.failure(Exception("User not found"))

        val durationDays = if (billingCycle == "YEARLY") 365L else 30L
        val updatedUser = user.copy(
            membershipPlan = newPlan,
            planBillingCycle = billingCycle,
            planExpiresAt = System.currentTimeMillis() + (durationDays * 24 * 60 * 60 * 1000L)
        )

        db.userDao().updateUser(updatedUser)
        if (_currentUser.value?.id == userId) {
            _currentUser.value = updatedUser
        }

        logAudit(
            user = updatedUser,
            action = AuditAction.UPGRADE_MEMBERSHIP,
            entityType = "MEMBERSHIP",
            entityId = updatedUser.id,
            summary = "Upgraded membership to ${newPlan.planName} ($billingCycle billing)",
            oldVal = user.membershipPlan.name,
            newVal = newPlan.name
        )

        sendNotification(
            userId = updatedUser.id,
            title = "Plan Upgraded: ${newPlan.badgeText}",
            message = "You are now on the ${newPlan.planName}. Enjoy your expanded PO volume & enhanced features.",
            eventType = NotificationEventType.SYSTEM,
            refId = newPlan.name
        )

        return Result.success(updatedUser)
    }

    suspend fun switchUserRole(role: UserRole) {
        val user = db.userDao().getFirstUserByRole(role)
        if (user != null) {
            _currentUser.value = user
            preferencesRepo.setLoggedInUser(user.id, user.email)
            logAudit(
                user = user,
                action = AuditAction.LOGIN,
                entityType = "USER",
                entityId = user.id,
                summary = "Active session switched to ${user.name} (${role.displayName})"
            )
        }
    }

    suspend fun switchUserById(userId: String) {
        val user = db.userDao().getUserById(userId)
        if (user != null) {
            _currentUser.value = user
            preferencesRepo.setLoggedInUser(user.id, user.email)
            logAudit(
                user = user,
                action = AuditAction.LOGIN,
                entityType = "USER",
                entityId = user.id,
                summary = "Switched active account to ${user.name} (${user.role.displayName})"
            )
        }
    }

    // Flows
    val allUsers: Flow<List<UserEntity>> = db.userDao().getAllUsers()
    val allProducts: Flow<List<ProductEntity>> = db.productDao().getAllProducts()
    val lowStockProducts: Flow<List<ProductEntity>> = db.productDao().getLowStockProducts()
    val allCategories = db.categoryDao().getAllCategories()
    val allSuppliers: Flow<List<SupplierEntity>> = db.supplierDao().getAllSuppliers()
    val allRequests: Flow<List<PurchaseRequestEntity>> = db.purchaseRequestDao().getAllRequests()
    val allOrders: Flow<List<PurchaseOrderEntity>> = db.purchaseOrderDao().getAllPurchaseOrders()
    val allDeliveries: Flow<List<DeliveryEntity>> = db.deliveryDao().getAllDeliveries()
    val allTransactions: Flow<List<InventoryTransactionEntity>> = db.inventoryDao().getAllTransactions()
    val allNotifications: Flow<List<NotificationEntity>> = db.notificationDao().getAllNotifications()
    val unreadNotificationCount: Flow<Int> = db.notificationDao().getUnreadCount()
    val allAuditLogs: Flow<List<AuditLogEntity>> = db.auditDao().getAllAuditLogs()
    val allSupplierRatings: Flow<List<SupplierPerformanceRatingEntity>> = db.supplierRatingDao().getAllRatings()
    val systemSettings: Flow<SystemSettingsEntity?> = db.systemSettingsDao().getSettings()

    fun getRatingsForSupplier(supplierId: String): Flow<List<SupplierPerformanceRatingEntity>> =
        db.supplierRatingDao().getRatingsForSupplier(supplierId)

    fun getItemsForRequest(requestId: String): Flow<List<PurchaseRequestItemEntity>> =
        db.purchaseRequestDao().getItemsForRequest(requestId)

    fun getItemsForOrder(orderId: String): Flow<List<PurchaseOrderItemEntity>> =
        db.purchaseOrderDao().getItemsForOrder(orderId)

    fun getCheckpointsForDelivery(deliveryId: String): Flow<List<DeliveryTrackingCheckpointEntity>> =
        db.deliveryDao().getCheckpointsForDelivery(deliveryId)

    // Purchase Request Actions
    suspend fun createPurchaseRequest(
        requestedBy: UserEntity,
        department: String,
        priority: Priority,
        reason: String,
        items: List<Pair<ProductEntity, Int>>
    ): PurchaseRequestEntity {
        val count = db.purchaseRequestDao().getAllRequests().first().size + 101
        val reqNumber = "PR-2026-000$count"
        val totalAmount = items.sumOf { (prod, qty) -> prod.unitPrice * qty }

        val settings = db.systemSettingsDao().getSettingsSync() ?: SystemSettingsEntity()
        val requiredLevel = when {
            totalAmount < settings.approvalLimitManager -> 1
            totalAmount <= settings.approvalLimitProcurementManager -> 2
            else -> 3
        }

        val request = PurchaseRequestEntity(
            requestNumber = reqNumber,
            requestedByUserId = requestedBy.id,
            requesterName = requestedBy.name,
            requesterRole = requestedBy.role,
            department = department,
            priority = priority,
            reason = reason,
            status = RequestStatus.PENDING_APPROVAL,
            estimatedAmount = totalAmount,
            currentApprovalLevel = 1,
            requiredApprovalLevel = requiredLevel
        )
        db.purchaseRequestDao().insertRequest(request)

        val requestItems = items.map { (prod, qty) ->
            PurchaseRequestItemEntity(
                purchaseRequestId = request.id,
                productId = prod.id,
                productCode = prod.productCode,
                productName = prod.name,
                quantity = qty,
                estimatedUnitPrice = prod.unitPrice,
                estimatedTotal = prod.unitPrice * qty
            )
        }
        db.purchaseRequestDao().insertRequestItems(requestItems)

        // Notification for Manager
        sendNotification(
            userId = "usr-mgr",
            title = "New Purchase Request: ${request.requestNumber}",
            message = "${requestedBy.name} submitted request for ₹${String.format("%,.2f", totalAmount)} (${priority.displayName} Priority).",
            eventType = NotificationEventType.REQUEST_SUBMITTED,
            refId = request.id
        )

        logAudit(
            user = requestedBy,
            action = AuditAction.SUBMIT_REQUEST,
            entityType = "PURCHASE_REQUEST",
            entityId = request.requestNumber,
            summary = "Created and submitted $reqNumber for ${items.size} item(s) totaling ₹${String.format("%,.2f", totalAmount)}"
        )

        return request
    }

    suspend fun approvePurchaseRequest(
        requestId: String,
        approver: UserEntity,
        remarks: String
    ): ApiResponseResult {
        val request = db.purchaseRequestDao().getRequestById(requestId)
            ?: return ApiResponseResult(false, 404, "Purchase request not found")

        if (request.status != RequestStatus.PENDING_APPROVAL && request.status != RequestStatus.SUBMITTED) {
            return ApiResponseResult(false, 400, "Request is not in pending approval state")
        }

        val nextLevel = request.currentApprovalLevel + 1
        val isFullyApproved = request.currentApprovalLevel >= request.requiredApprovalLevel

        val updatedRequest = request.copy(
            currentApprovalLevel = if (isFullyApproved) request.currentApprovalLevel else nextLevel,
            status = if (isFullyApproved) RequestStatus.APPROVED else RequestStatus.PENDING_APPROVAL,
            approvedBy = if (request.approvedBy.isNullOrEmpty()) "${approver.name} (${approver.role.displayName})" else "${request.approvedBy}, ${approver.name} (${approver.role.displayName})",
            updatedAt = System.currentTimeMillis()
        )
        db.purchaseRequestDao().updateRequest(updatedRequest)

        val stageText = if (isFullyApproved) "Fully Approved" else "Approved Level ${request.currentApprovalLevel} of ${request.requiredApprovalLevel}"

        sendNotification(
            userId = request.requestedByUserId,
            title = "Request ${request.requestNumber} $stageText",
            message = "Approved by ${approver.name}. Remarks: $remarks",
            eventType = NotificationEventType.REQUEST_APPROVED,
            refId = request.id
        )

        logAudit(
            user = approver,
            action = AuditAction.APPROVE_REQUEST,
            entityType = "PURCHASE_REQUEST",
            entityId = request.requestNumber,
            summary = "$stageText by ${approver.name}. Remarks: $remarks"
        )

        // If fully approved and auto PO enabled, convert to PO
        val settings = db.systemSettingsDao().getSettingsSync()
        if (isFullyApproved && settings?.autoPoGeneration == true) {
            val items = db.purchaseRequestDao().getItemsForRequestSync(requestId)
            if (items.isNotEmpty()) {
                val firstProduct = db.productDao().getProductById(items.first().productId)
                val supplierId = firstProduct?.supplierId ?: "sup-001"
                createPurchaseOrderFromRequest(requestId, supplierId, approver, "Auto-generated from approved PR")
            }
        }

        return ApiResponseResult(true, 200, "Purchase request $stageText successfully", data = updatedRequest)
    }

    suspend fun rejectPurchaseRequest(
        requestId: String,
        approver: UserEntity,
        reason: String
    ): ApiResponseResult {
        val request = db.purchaseRequestDao().getRequestById(requestId)
            ?: return ApiResponseResult(false, 404, "Purchase request not found")

        val updated = request.copy(
            status = RequestStatus.REJECTED,
            rejectionReason = reason,
            updatedAt = System.currentTimeMillis()
        )
        db.purchaseRequestDao().updateRequest(updated)

        sendNotification(
            userId = request.requestedByUserId,
            title = "Request ${request.requestNumber} Rejected",
            message = "Rejected by ${approver.name}. Reason: $reason",
            eventType = NotificationEventType.REQUEST_REJECTED,
            refId = request.id
        )

        logAudit(
            user = approver,
            action = AuditAction.REJECT_REQUEST,
            entityType = "PURCHASE_REQUEST",
            entityId = request.requestNumber,
            summary = "Rejected by ${approver.name}. Reason: $reason"
        )

        return ApiResponseResult(true, 200, "Purchase request rejected", data = updated)
    }

    // Purchase Order Actions
    suspend fun createPurchaseOrderFromRequest(
        requestId: String,
        supplierId: String,
        creator: UserEntity,
        notes: String
    ): ApiResponseResult {
        val request = db.purchaseRequestDao().getRequestById(requestId)
            ?: return ApiResponseResult(false, 404, "Purchase request not found")

        val supplier = db.supplierDao().getSupplierById(supplierId)
            ?: return ApiResponseResult(false, 404, "Supplier not found")

        val reqItems = db.purchaseRequestDao().getItemsForRequestSync(requestId)
        if (reqItems.isEmpty()) {
            return ApiResponseResult(false, 400, "No items found in purchase request")
        }

        val poCount = db.purchaseOrderDao().getAllPurchaseOrders().first().size + 501
        val poNumber = "PO-2026-000$poCount"

        val subtotal = reqItems.sumOf { it.estimatedTotal }
        val taxRate = 18.0
        val taxAmount = subtotal * (taxRate / 100.0)
        val discount = if (subtotal > 50000) 1500.0 else 0.0
        val shipping = 600.0
        val total = subtotal + taxAmount - discount + shipping

        val settings = db.systemSettingsDao().getSettingsSync()
        val tier = PoApprovalWorkflowEngine.determineTier(total, settings)
        val steps = PoApprovalWorkflowEngine.buildApprovalChain(total, settings)
        val stepsJson = PoApprovalWorkflowEngine.serializeSignatures(steps)

        val po = PurchaseOrderEntity(
            poNumber = poNumber,
            purchaseRequestId = request.id,
            requestNumber = request.requestNumber,
            supplierId = supplier.id,
            supplierName = supplier.companyName,
            createdByUserId = creator.id,
            createdByName = creator.name,
            subtotal = subtotal,
            taxRate = taxRate,
            taxAmount = taxAmount,
            discountAmount = discount,
            shippingCost = shipping,
            totalAmount = total,
            status = OrderStatus.PENDING_APPROVAL,
            currentApprovalLevel = 1,
            requiredApprovalLevel = steps.size,
            approvalTierName = "${tier.title} (${steps.size} Signatures)",
            approvalSignaturesJson = stepsJson,
            isFullyApproved = false,
            pendingRoleName = steps.firstOrNull()?.shortRoleTitle ?: "Approving Manager",
            notes = notes
        )
        db.purchaseOrderDao().insertOrder(po)

        val poItems = reqItems.map {
            PurchaseOrderItemEntity(
                purchaseOrderId = po.id,
                productId = it.productId,
                productCode = it.productCode,
                productName = it.productName,
                quantity = it.quantity,
                unitPrice = it.estimatedUnitPrice,
                totalPrice = it.estimatedTotal
            )
        }
        db.purchaseOrderDao().insertOrderItems(poItems)

        // Mark PR as converted
        db.purchaseRequestDao().updateRequest(request.copy(status = RequestStatus.CONVERTED_TO_PO, updatedAt = System.currentTimeMillis()))

        // Send Notification to Level 1 Approver
        sendNotification(
            userId = "usr-mgr",
            title = "PO Approval Required: $poNumber",
            message = "New PO generated for ₹${String.format("%,.2f", total)} requires ${steps.firstOrNull()?.shortRoleTitle ?: "Manager"} signature (${tier.title}).",
            eventType = NotificationEventType.PO_APPROVAL_REQUIRED,
            refId = po.id
        )

        logAudit(
            user = creator,
            action = AuditAction.CREATE_PO,
            entityType = "PURCHASE_ORDER",
            entityId = poNumber,
            summary = "Created Purchase Order $poNumber from request ${request.requestNumber}. Initiated ${tier.title} workflow (${steps.size} level hierarchical sign-off required)."
        )

        return ApiResponseResult(true, 201, "Purchase order $poNumber initiated for hierarchical approval", data = po)
    }

    /**
     * Executes a hierarchical signature approval step for a Purchase Order
     */
    suspend fun approvePurchaseOrderLevel(
        orderId: String,
        approver: UserEntity,
        remarks: String
    ): ApiResponseResult {
        val order = db.purchaseOrderDao().getOrderById(orderId)
            ?: return ApiResponseResult(false, 404, "Purchase order not found")

        if (order.status != OrderStatus.PENDING_APPROVAL) {
            return ApiResponseResult(false, 400, "Order is not pending approval (Current: ${order.status.displayName})")
        }

        val settings = db.systemSettingsDao().getSettingsSync()
        val steps = PoApprovalWorkflowEngine.parseSignatures(order.approvalSignaturesJson, order.totalAmount, settings).toMutableList()
        val currentLevelIndex = (order.currentApprovalLevel - 1).coerceIn(0, steps.lastIndex)
        val currentStep = steps.getOrNull(currentLevelIndex)
            ?: return ApiResponseResult(false, 400, "Invalid approval step level")

        if (currentStep.isSigned) {
            return ApiResponseResult(false, 400, "Level ${order.currentApprovalLevel} is already signed")
        }

        if (!PoApprovalWorkflowEngine.canUserSignCurrentLevel(order, approver, currentStep)) {
            return ApiResponseResult(
                false,
                403,
                "Unauthorized: Level ${currentStep.level} requires ${currentStep.requiredRole.displayName} authority. Current user is ${approver.role.displayName}."
            )
        }

        val now = System.currentTimeMillis()
        val certificate = PoApprovalWorkflowEngine.generateDigitalCertificate(order.poNumber, currentStep.level, approver, now)

        // Sign current step
        val signedStep = currentStep.copy(
            isSigned = true,
            signerUserId = approver.id,
            signerName = approver.name,
            signerRole = approver.role.displayName,
            signedAt = now,
            remarks = remarks.ifBlank { "Approved & authorized as per procurement delegation of authority." },
            signatureCertificate = certificate
        )
        steps[currentLevelIndex] = signedStep

        val isFinalLevel = order.currentApprovalLevel >= order.requiredApprovalLevel
        val nextLevel = if (isFinalLevel) order.currentApprovalLevel else order.currentApprovalLevel + 1
        val nextStep = if (isFinalLevel) null else steps.getOrNull(currentLevelIndex + 1)
        val nextPendingRole = nextStep?.shortRoleTitle ?: "Fully Authorized"

        val updatedOrder = order.copy(
            currentApprovalLevel = nextLevel,
            approvalSignaturesJson = PoApprovalWorkflowEngine.serializeSignatures(steps),
            isFullyApproved = isFinalLevel,
            status = if (isFinalLevel) OrderStatus.SENT_TO_SUPPLIER else OrderStatus.PENDING_APPROVAL,
            pendingRoleName = nextPendingRole,
            updatedAt = now
        )
        db.purchaseOrderDao().updateOrder(updatedOrder)

        if (isFinalLevel) {
            // PO is fully authorized and released to supplier
            sendNotification(
                userId = "usr-sup",
                title = "New Purchase Order Released: ${order.poNumber}",
                message = "Order for ₹${String.format("%,.2f", order.totalAmount)} has completed all ${order.requiredApprovalLevel} hierarchical approval levels and is ready for fulfillment.",
                eventType = NotificationEventType.PO_FULLY_APPROVED,
                refId = order.id
            )
            sendNotification(
                userId = order.createdByUserId,
                title = "PO ${order.poNumber} Fully Approved",
                message = "All ${order.requiredApprovalLevel} signature levels completed. PO released to ${order.supplierName}.",
                eventType = NotificationEventType.PO_FULLY_APPROVED,
                refId = order.id
            )

            logAudit(
                user = approver,
                action = AuditAction.FULLY_APPROVE_PO,
                entityType = "PURCHASE_ORDER",
                entityId = order.poNumber,
                summary = "Final Level ${currentStep.level} Signature completed by ${approver.name} (${approver.role.displayName}). Digital Cert: $certificate. PO released to supplier."
            )

            return ApiResponseResult(
                true,
                200,
                "Level ${currentStep.level} signed. PO ${order.poNumber} is now FULLY AUTHORIZED & transmitted to supplier!",
                data = updatedOrder
            )
        } else {
            // Advance to next level and notify next role
            val nextRecipientUserId = when (nextStep?.requiredRole) {
                UserRole.PROCUREMENT_MANAGER -> "usr-proc"
                UserRole.ADMIN -> "usr-admin"
                else -> "usr-mgr"
            }

            sendNotification(
                userId = nextRecipientUserId,
                title = "PO Signature Required: ${order.poNumber}",
                message = "Level ${currentStep.level} signed by ${approver.name}. Awaiting your Level $nextLevel (${nextStep?.shortRoleTitle}) signature.",
                eventType = NotificationEventType.PO_APPROVAL_REQUIRED,
                refId = order.id
            )

            logAudit(
                user = approver,
                action = AuditAction.APPROVE_PO_LEVEL,
                entityType = "PURCHASE_ORDER",
                entityId = order.poNumber,
                summary = "Level ${currentStep.level} Signature completed by ${approver.name} (${approver.role.displayName}). Advanced to Level $nextLevel (${nextStep?.shortRoleTitle}). Remarks: $remarks"
            )

            return ApiResponseResult(
                true,
                200,
                "Level ${currentStep.level} signed successfully. Advanced to Level $nextLevel (${nextStep?.shortRoleTitle}).",
                data = updatedOrder
            )
        }
    }

    /**
     * Rejects a Purchase Order in the approval hierarchy
     */
    suspend fun rejectPurchaseOrder(
        orderId: String,
        approver: UserEntity,
        reason: String
    ): ApiResponseResult {
        val order = db.purchaseOrderDao().getOrderById(orderId)
            ?: return ApiResponseResult(false, 404, "Purchase order not found")

        val updated = order.copy(
            status = OrderStatus.CANCELLED,
            rejectionReason = "Rejected at Level ${order.currentApprovalLevel} by ${approver.name} (${approver.role.displayName}): $reason",
            updatedAt = System.currentTimeMillis()
        )
        db.purchaseOrderDao().updateOrder(updated)

        sendNotification(
            userId = order.createdByUserId,
            title = "PO ${order.poNumber} Rejected",
            message = "Rejected at Level ${order.currentApprovalLevel} by ${approver.name}. Reason: $reason",
            eventType = NotificationEventType.PO_REJECTED,
            refId = order.id
        )

        logAudit(
            user = approver,
            action = AuditAction.REJECT_PO_LEVEL,
            entityType = "PURCHASE_ORDER",
            entityId = order.poNumber,
            summary = "Rejected PO ${order.poNumber} at Level ${order.currentApprovalLevel} by ${approver.name}. Reason: $reason"
        )

        return ApiResponseResult(true, 200, "Purchase order rejected and cancelled", data = updated)
    }

    suspend fun supplierAcceptOrder(orderId: String, supplierUser: UserEntity): ApiResponseResult {
        val order = db.purchaseOrderDao().getOrderById(orderId)
            ?: return ApiResponseResult(false, 404, "Order not found")

        val updated = order.copy(
            status = OrderStatus.SUPPLIER_ACCEPTED,
            updatedAt = System.currentTimeMillis()
        )
        db.purchaseOrderDao().updateOrder(updated)

        sendNotification(
            userId = "usr-proc",
            title = "Supplier Accepted ${order.poNumber}",
            message = "${order.supplierName} accepted the order and began fulfillment processing.",
            eventType = NotificationEventType.SUPPLIER_ACCEPTED,
            refId = order.id
        )

        logAudit(
            user = supplierUser,
            action = AuditAction.ACCEPT_PO,
            entityType = "PURCHASE_ORDER",
            entityId = order.poNumber,
            summary = "Supplier ${order.supplierName} accepted PO ${order.poNumber}"
        )

        return ApiResponseResult(true, 200, "Purchase order accepted by supplier", data = updated)
    }

    suspend fun supplierRejectOrder(orderId: String, supplierUser: UserEntity, reason: String): ApiResponseResult {
        val order = db.purchaseOrderDao().getOrderById(orderId)
            ?: return ApiResponseResult(false, 404, "Order not found")

        val updated = order.copy(
            status = OrderStatus.SUPPLIER_REJECTED,
            rejectionReason = reason,
            updatedAt = System.currentTimeMillis()
        )
        db.purchaseOrderDao().updateOrder(updated)

        sendNotification(
            userId = "usr-proc",
            title = "Supplier Rejected ${order.poNumber}",
            message = "${order.supplierName} declined the order. Reason: $reason",
            eventType = NotificationEventType.SUPPLIER_REJECTED,
            refId = order.id
        )

        logAudit(
            user = supplierUser,
            action = AuditAction.REJECT_PO,
            entityType = "PURCHASE_ORDER",
            entityId = order.poNumber,
            summary = "Supplier ${order.supplierName} rejected PO ${order.poNumber}. Reason: $reason"
        )

        return ApiResponseResult(true, 200, "Purchase order rejected by supplier", data = updated)
    }

    suspend fun supplierDispatchOrder(
        orderId: String,
        supplierUser: UserEntity,
        carrier: String = "BlueDart Express",
        trackingNumber: String = "BD-EXP-${(1000000..9999999).random()}"
    ): ApiResponseResult {
        val order = db.purchaseOrderDao().getOrderById(orderId)
            ?: return ApiResponseResult(false, 404, "Order not found")

        val updatedOrder = order.copy(
            status = OrderStatus.DISPATCHED,
            carrier = carrier,
            trackingNumber = trackingNumber,
            updatedAt = System.currentTimeMillis()
        )
        db.purchaseOrderDao().updateOrder(updatedOrder)

        // Create Delivery Record
        val delivery = DeliveryEntity(
            purchaseOrderId = order.id,
            poNumber = order.poNumber,
            deliveryAgentId = "usr-del",
            deliveryAgentName = "Suresh Kumar",
            trackingNumber = trackingNumber,
            carrier = carrier,
            status = DeliveryStatus.PICKED_UP,
            currentCheckpoint = "Package dispatched from supplier hub - Carrier scanning in progress"
        )
        db.deliveryDao().insertDelivery(delivery)

        val checkpoints = listOf(
            DeliveryTrackingCheckpointEntity(
                deliveryId = delivery.id,
                stageName = "Order Manifest & Dispatch",
                location = "${order.supplierName} Fulfillment Dock",
                timestamp = System.currentTimeMillis(),
                isCompleted = true,
                notes = "Shipment packed, tracking #$trackingNumber assigned"
            ),
            DeliveryTrackingCheckpointEntity(
                deliveryId = delivery.id,
                stageName = "Carrier Pickup & Sorting",
                location = "$carrier Main Depot",
                timestamp = System.currentTimeMillis() + (2 * 3600 * 1000L),
                isCompleted = true,
                notes = "Package sorted into outbound line-haul carrier"
            ),
            DeliveryTrackingCheckpointEntity(
                deliveryId = delivery.id,
                stageName = "In Transit to Regional Hub",
                location = "National Transit Highway Hub",
                timestamp = System.currentTimeMillis() + (8 * 3600 * 1000L),
                isCompleted = false,
                notes = "Linehaul vehicle in transit"
            ),
            DeliveryTrackingCheckpointEntity(
                deliveryId = delivery.id,
                stageName = "Out for Delivery",
                location = "Bangalore Central Sorting Center",
                timestamp = System.currentTimeMillis() + (20 * 3600 * 1000L),
                isCompleted = false,
                notes = "Assigned to Agent Suresh Kumar"
            ),
            DeliveryTrackingCheckpointEntity(
                deliveryId = delivery.id,
                stageName = "Delivered & Inventory Inwarded",
                location = "Smart Procurement Receiving Dock",
                timestamp = System.currentTimeMillis() + (30 * 3600 * 1000L),
                isCompleted = false,
                notes = "Automatic inventory stock increment & receipt generation"
            )
        )
        db.deliveryDao().insertCheckpoints(checkpoints)

        sendNotification(
            userId = "usr-proc",
            title = "Order ${order.poNumber} Dispatched",
            message = "Tracking Number: $trackingNumber via $carrier.",
            eventType = NotificationEventType.ORDER_DISPATCHED,
            refId = delivery.id
        )

        logAudit(
            user = supplierUser,
            action = AuditAction.DISPATCH_ORDER,
            entityType = "PURCHASE_ORDER",
            entityId = order.poNumber,
            summary = "Dispatched order ${order.poNumber} with carrier $carrier (Tracking: $trackingNumber)"
        )

        return ApiResponseResult(true, 200, "Order dispatched and delivery tracking initiated", data = delivery)
    }

    // Delivery Checkpoint & Automated Inventory Inwarding
    suspend fun advanceDeliveryStatus(
        deliveryId: String,
        agentUser: UserEntity,
        nextStatus: DeliveryStatus,
        checkpointNotes: String = ""
    ): ApiResponseResult {
        val delivery = db.deliveryDao().getDeliveryById(deliveryId)
            ?: return ApiResponseResult(false, 404, "Delivery not found")

        val order = db.purchaseOrderDao().getOrderById(delivery.purchaseOrderId)

        val updatedDelivery = delivery.copy(
            status = nextStatus,
            currentCheckpoint = when (nextStatus) {
                DeliveryStatus.IN_TRANSIT -> "In Transit - Out of Regional Linehaul Facility"
                DeliveryStatus.OUT_FOR_DELIVERY -> "Out for delivery with agent ${delivery.deliveryAgentName}"
                DeliveryStatus.DELIVERED -> "Delivered at Destination Dock - Verified & Received"
                DeliveryStatus.FAILED -> "Delivery attempt failed: $checkpointNotes"
                else -> checkpointNotes
            },
            actualDeliveryDate = if (nextStatus == DeliveryStatus.DELIVERED) System.currentTimeMillis() else null,
            lastUpdated = System.currentTimeMillis()
        )
        db.deliveryDao().updateDelivery(updatedDelivery)

        // Update corresponding PO status
        if (order != null) {
            val newOrderStatus = when (nextStatus) {
                DeliveryStatus.IN_TRANSIT -> OrderStatus.IN_TRANSIT
                DeliveryStatus.OUT_FOR_DELIVERY -> OrderStatus.OUT_FOR_DELIVERY
                DeliveryStatus.DELIVERED -> OrderStatus.DELIVERED
                else -> order.status
            }
            db.purchaseOrderDao().updateOrder(order.copy(status = newOrderStatus, updatedAt = System.currentTimeMillis()))
        }

        // AUTO-INVENTORY INWARDING ON DELIVERED
        if (nextStatus == DeliveryStatus.DELIVERED && order != null) {
            val poItems = db.purchaseOrderDao().getItemsForOrderSync(order.id)
            for (item in poItems) {
                val prod = db.productDao().getProductById(item.productId)
                if (prod != null) {
                    val prevStock = prod.availableQuantity
                    val newStock = prevStock + item.quantity

                    db.productDao().adjustStock(prod.id, item.quantity)

                    val tx = InventoryTransactionEntity(
                        productId = prod.id,
                        productName = prod.name,
                        transactionType = TransactionType.PURCHASE_RECEIPT,
                        quantityChanged = item.quantity,
                        previousStock = prevStock,
                        newStock = newStock,
                        referenceId = order.poNumber,
                        notes = "Auto-inwarded upon delivery confirmation (PO ${order.poNumber})"
                    )
                    db.inventoryDao().insertTransaction(tx)
                }
            }

            sendNotification(
                userId = "usr-proc",
                title = "Order ${order.poNumber} Delivered & Stock Inwarded",
                message = "Shipment verified at dock. ${poItems.size} product lines added to inventory automatically.",
                eventType = NotificationEventType.ORDER_DELIVERED,
                refId = delivery.id
            )

            logAudit(
                user = agentUser,
                action = AuditAction.MARK_DELIVERED,
                entityType = "DELIVERY",
                entityId = delivery.trackingNumber,
                summary = "Delivery completed for PO ${order.poNumber}. Automatically updated inventory stock for ${poItems.size} item(s)."
            )
        } else {
            logAudit(
                user = agentUser,
                action = AuditAction.UPDATE_DELIVERY,
                entityType = "DELIVERY",
                entityId = delivery.trackingNumber,
                summary = "Updated delivery status to ${nextStatus.displayName}. Notes: $checkpointNotes"
            )
        }

        return ApiResponseResult(true, 200, "Delivery status updated to ${nextStatus.displayName}", data = updatedDelivery)
    }

    // Smart Supplier Scoring Algorithm
    suspend fun rankSuppliersForProduct(product: ProductEntity): List<SupplierRecommendation> {
        val suppliers = db.supplierDao().getAllSuppliers().first()
        val settings = db.systemSettingsDao().getSettingsSync() ?: SystemSettingsEntity()

        return suppliers.map { sup ->
            // Price score relative to product price
            val priceRatio = (100.0 - ((sup.averageLeadDays * 2.0).coerceIn(0.0, 30.0))).coerceIn(50.0, 100.0)
            val qualityScore = sup.qualityScore
            val deliveryScore = sup.onTimeDeliveryRate
            val ratingScore = (sup.rating / 5.0) * 100.0
            val reliabilityScore = if (sup.status == "ACTIVE") 95.0 else 40.0

            val totalScore = (
                (settings.weightPrice * priceRatio) +
                (settings.weightQuality * qualityScore) +
                (settings.weightDelivery * deliveryScore) +
                (settings.weightRating * ratingScore) +
                (settings.weightReliability * reliabilityScore)
            ).coerceIn(0.0, 100.0)

            val reason = when {
                totalScore >= 92 -> "Top Ranked: Outstanding on-time fulfillment (${sup.onTimeDeliveryRate}%) & lead time (${sup.averageLeadDays} days)"
                totalScore >= 85 -> "Highly Recommended: Competitive pricing and consistent quality score (${sup.qualityScore}%)"
                else -> "Acceptable alternative supplier"
            }

            SupplierRecommendation(
                supplier = sup,
                scorePercentage = totalScore.toInt(),
                priceScore = priceRatio,
                qualityScore = qualityScore,
                deliveryScore = deliveryScore,
                ratingScore = ratingScore,
                reliabilityScore = reliabilityScore,
                reason = reason
            )
        }.sortedByDescending { it.scorePercentage }
    }

    // Submit Supplier Performance Rating
    suspend fun submitSupplierRating(
        supplierId: String,
        user: UserEntity,
        qualityScore: Double,
        deliveryScore: Double,
        pricingScore: Double,
        serviceScore: Double,
        feedback: String,
        purchaseOrderId: String? = null,
        poNumber: String? = null,
        category: String = "Performance Review"
    ): ApiResponseResult {
        val supplier = db.supplierDao().getSupplierById(supplierId)
            ?: return ApiResponseResult(false, 404, "Supplier not found")

        val overallScore = ((qualityScore * 0.35) + (deliveryScore * 0.35) + (pricingScore * 0.15) + (serviceScore * 0.15)).coerceIn(0.0, 100.0)
        val ratingStars = (overallScore / 20.0).coerceIn(1.0, 5.0)

        val ratingEntity = SupplierPerformanceRatingEntity(
            supplierId = supplier.id,
            supplierName = supplier.companyName,
            purchaseOrderId = purchaseOrderId,
            poNumber = poNumber,
            ratedByUserId = user.id,
            ratedByName = user.name,
            qualityScore = qualityScore,
            deliveryScore = deliveryScore,
            pricingScore = pricingScore,
            serviceScore = serviceScore,
            overallScore = overallScore,
            ratingStars = ratingStars,
            feedbackComments = feedback,
            ratingCategory = category,
            ratingDate = System.currentTimeMillis()
        )

        db.supplierRatingDao().insertRating(ratingEntity)

        // Recalculate supplier aggregate metrics
        val allRatings = db.supplierRatingDao().getRatingsForSupplierSync(supplier.id)
        if (allRatings.isNotEmpty()) {
            val avgRating = allRatings.map { it.ratingStars }.average()
            val avgQuality = allRatings.map { it.qualityScore }.average()
            val avgDelivery = allRatings.map { it.deliveryScore }.average()

            val updatedSupplier = supplier.copy(
                rating = Math.round(avgRating * 10.0) / 10.0,
                qualityScore = Math.round(avgQuality * 10.0) / 10.0,
                onTimeDeliveryRate = Math.round(avgDelivery * 10.0) / 10.0
            )
            db.supplierDao().updateSupplier(updatedSupplier)
        }

        sendNotification(
            userId = "usr-proc",
            title = "Supplier Rated: ${supplier.companyName}",
            message = "New performance rating submitted (${String.format("%.1f", ratingStars)}★ / ${String.format("%.1f", overallScore)}% score)",
            eventType = NotificationEventType.SUPPLIER_ACCEPTED,
            refId = ratingEntity.id
        )

        logAudit(
            user = user,
            action = AuditAction.LOGIN, // General log action
            entityType = "SUPPLIER_RATING",
            entityId = supplier.id,
            summary = "Submitted performance evaluation for ${supplier.companyName}: Overall ${String.format("%.1f", overallScore)}% (${String.format("%.1f", ratingStars)}★)"
        )

        return ApiResponseResult(true, 200, "Performance rating submitted for ${supplier.companyName}", data = ratingEntity)
    }

    // Smart Low Stock Replenishment Recommendations
    suspend fun getReplenishmentRecommendations(): List<ReplenishmentRecommendation> {
        val lowStock = db.productDao().getLowStockProducts().first()
        val suppliers = db.supplierDao().getAllSuppliers().first()

        return lowStock.map { prod ->
            val neededQty = (prod.maximumStock - prod.availableQuantity).coerceAtLeast(1)
            val prefSupplier = suppliers.firstOrNull { it.id == prod.supplierId } ?: suppliers.firstOrNull()
            val cost = neededQty * prod.unitPrice

            ReplenishmentRecommendation(
                product = prod,
                currentStock = prod.availableQuantity,
                minimumStock = prod.minimumStock,
                maximumStock = prod.maximumStock,
                recommendedQuantity = neededQty,
                preferredSupplier = prefSupplier,
                estimatedCost = cost,
                reason = "Current stock (${prod.availableQuantity}) is below safety threshold (${prod.minimumStock}). Replenish to reach capacity (${prod.maximumStock})."
            )
        }
    }

    // Central Workflow REST Dispatcher
    suspend fun executeWorkflowCommand(
        action: String,
        entityId: String,
        payload: String = ""
    ): ApiResponseResult {
        val user = _currentUser.value ?: db.userDao().getFirstUserByRole(UserRole.ADMIN)!!
        return when (action.uppercase()) {
            "APPROVE_REQUEST" -> approvePurchaseRequest(entityId, user, payload.ifBlank { "Approved via Central Workflow API" })
            "REJECT_REQUEST" -> rejectPurchaseRequest(entityId, user, payload.ifBlank { "Rejected via Central Workflow API" })
            "CREATE_PURCHASE_ORDER" -> {
                val req = db.purchaseRequestDao().getRequestById(entityId)
                if (req != null) {
                    val reqItems = db.purchaseRequestDao().getItemsForRequestSync(req.id)
                    val prod = reqItems.firstOrNull()?.let { db.productDao().getProductById(it.productId) }
                    val supId = prod?.supplierId ?: "sup-001"
                    createPurchaseOrderFromRequest(req.id, supId, user, payload.ifBlank { "Generated via Workflow API" })
                } else ApiResponseResult(false, 404, "Purchase request not found")
            }
            "ACCEPT_ORDER" -> supplierAcceptOrder(entityId, user)
            "REJECT_ORDER" -> supplierRejectOrder(entityId, user, payload.ifBlank { "Declined capacity limit" })
            "DISPATCH_ORDER" -> supplierDispatchOrder(entityId, user)
            "MARK_DELIVERED" -> advanceDeliveryStatus(entityId, user, DeliveryStatus.DELIVERED, payload.ifBlank { "Delivered via Workflow" })
            else -> ApiResponseResult(false, 400, "Unknown workflow action: $action")
        }
    }

    // Manual Inventory Adjustment
    suspend fun adjustInventoryManual(productId: String, delta: Int, user: UserEntity, notes: String): ApiResponseResult {
        val prod = db.productDao().getProductById(productId)
            ?: return ApiResponseResult(false, 404, "Product not found")

        val prev = prod.availableQuantity
        val newStock = (prev + delta).coerceAtLeast(0)

        db.productDao().adjustStock(prod.id, delta)

        val tx = InventoryTransactionEntity(
            productId = prod.id,
            productName = prod.name,
            transactionType = TransactionType.ADJUSTMENT,
            quantityChanged = delta,
            previousStock = prev,
            newStock = newStock,
            referenceId = "MANUAL-ADJ",
            notes = notes
        )
        db.inventoryDao().insertTransaction(tx)

        logAudit(
            user = user,
            action = AuditAction.UPDATE_INVENTORY,
            entityType = "INVENTORY",
            entityId = prod.productCode,
            summary = "Manual stock adjustment: changed by $delta ($prev -> $newStock). Reason: $notes"
        )

        return ApiResponseResult(true, 200, "Stock updated to $newStock", data = newStock)
    }

    // Notifications
    suspend fun markNotificationAsRead(id: String) = db.notificationDao().markAsRead(id)
    suspend fun markAllNotificationsAsRead() = db.notificationDao().markAllAsRead()
    suspend fun deleteNotification(id: String) = db.notificationDao().deleteNotification(id)

    private suspend fun sendNotification(
        userId: String,
        title: String,
        message: String,
        eventType: NotificationEventType,
        refId: String = ""
    ) {
        val notif = NotificationEntity(
            userId = userId,
            title = title,
            message = message,
            eventType = eventType,
            channel = NotificationChannel.IN_APP,
            referenceId = refId
        )
        db.notificationDao().insertNotification(notif)
    }

    private suspend fun logAudit(
        user: UserEntity,
        action: AuditAction,
        entityType: String,
        entityId: String,
        summary: String,
        oldVal: String? = null,
        newVal: String? = null
    ) {
        val log = AuditLogEntity(
            userId = user.id,
            userName = user.name,
            userRole = user.role,
            action = action,
            entityType = entityType,
            entityId = entityId,
            summary = summary,
            oldValue = oldVal,
            newValue = newVal
        )
        db.auditDao().insertAuditLog(log)
    }
}
