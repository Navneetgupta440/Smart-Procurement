package com.example.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
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
import com.example.data.entity.UserEntity
import com.example.data.model.DeliveryStatus
import com.example.data.model.OrderStatus
import com.example.data.model.Priority
import com.example.data.model.RequestStatus
import com.example.data.model.UserRole
import com.example.data.repository.ApiResponseResult
import com.example.data.repository.ProcurementRepository
import com.example.data.repository.ReplenishmentRecommendation
import com.example.data.repository.SupplierRecommendation
import com.example.data.repository.TopSupplierPerformance
import com.example.data.seed.SeedData
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

import com.example.data.model.MembershipPlan
import com.example.data.preferences.AppThemeMode
import com.example.data.preferences.UserPreferencesRepository
import com.example.util.HighValueOrderAlert
import com.example.util.LocalNotificationManager

enum class AppTab(val title: String, val iconName: String) {
    DASHBOARD("Dashboard", "Dashboard"),
    REQUESTS("Requests", "Description"),
    ORDERS("Purchase Orders", "ShoppingCart"),
    HISTORY("Order History", "History"),
    MEMBERSHIP("Membership", "WorkspacePremium"),
    SUPPLIERS("Suppliers", "Store"),
    DELIVERY("Logistics", "LocalShipping"),
    INVENTORY("Inventory", "Inventory"),
    ANALYTICS("Analytics & Audit", "Analytics"),
    API_CONSOLE("API Console", "Code")
}

data class DashboardKpis(
    val totalProcurementSpend: Double = 0.0,
    val pendingApprovalsCount: Int = 0,
    val activeOrdersCount: Int = 0,
    val inTransitCount: Int = 0,
    val deliveredOrdersCount: Int = 0,
    val lowStockCount: Int = 0,
    val totalSuppliersCount: Int = 0,
    val poConversionRate: Double = 0.0
)

class ProcurementViewModel(application: Application) : AndroidViewModel(application) {

    private val db = ProcurementDatabase.getDatabase(application)
    private val userPrefs = UserPreferencesRepository(application)
    val repository = ProcurementRepository(db, userPrefs)

    private val _currentTab = MutableStateFlow(AppTab.DASHBOARD)
    val currentTab: StateFlow<AppTab> = _currentTab.asStateFlow()

    private val _selectedRequest = MutableStateFlow<PurchaseRequestEntity?>(null)
    val selectedRequest: StateFlow<PurchaseRequestEntity?> = _selectedRequest.asStateFlow()

    private val _selectedOrder = MutableStateFlow<PurchaseOrderEntity?>(null)
    val selectedOrder: StateFlow<PurchaseOrderEntity?> = _selectedOrder.asStateFlow()

    private val _selectedDelivery = MutableStateFlow<DeliveryEntity?>(null)
    val selectedDelivery: StateFlow<DeliveryEntity?> = _selectedDelivery.asStateFlow()

    private val _selectedProductForSupplierComparison = MutableStateFlow<ProductEntity?>(null)
    val selectedProductForSupplierComparison: StateFlow<ProductEntity?> = _selectedProductForSupplierComparison.asStateFlow()

    private val _supplierRecommendations = MutableStateFlow<List<SupplierRecommendation>>(emptyList())
    val supplierRecommendations: StateFlow<List<SupplierRecommendation>> = _supplierRecommendations.asStateFlow()

    private val _replenishmentRecommendations = MutableStateFlow<List<ReplenishmentRecommendation>>(emptyList())
    val replenishmentRecommendations: StateFlow<List<ReplenishmentRecommendation>> = _replenishmentRecommendations.asStateFlow()

    private val _apiConsoleResponse = MutableStateFlow<ApiResponseResult?>(null)
    val apiConsoleResponse: StateFlow<ApiResponseResult?> = _apiConsoleResponse.asStateFlow()

    private val _toastMessage = MutableStateFlow<String?>(null)
    val toastMessage: StateFlow<String?> = _toastMessage.asStateFlow()

    private val _highValueOrderAlert = MutableStateFlow<HighValueOrderAlert?>(null)
    val highValueOrderAlert: StateFlow<HighValueOrderAlert?> = _highValueOrderAlert.asStateFlow()

    private val _demoLifecycleStep = MutableStateFlow(1)
    val demoLifecycleStep: StateFlow<Int> = _demoLifecycleStep.asStateFlow()

    init {
        viewModelScope.launch {
            SeedData.seedDatabaseIfEmpty(db)
            refreshRecommendations()
        }
    }

    val currentUser: StateFlow<UserEntity?> = repository.currentUser
    val allUsers: Flow<List<UserEntity>> = repository.allUsers
    val allProducts: Flow<List<ProductEntity>> = repository.allProducts
    val lowStockProducts: Flow<List<ProductEntity>> = repository.lowStockProducts
    val allSuppliers: Flow<List<SupplierEntity>> = repository.allSuppliers
    val allRequests: Flow<List<PurchaseRequestEntity>> = repository.allRequests
    val allOrders: Flow<List<PurchaseOrderEntity>> = repository.allOrders
    val allDeliveries: Flow<List<DeliveryEntity>> = repository.allDeliveries
    val allTransactions: Flow<List<InventoryTransactionEntity>> = repository.allTransactions
    val allNotifications: Flow<List<NotificationEntity>> = repository.allNotifications
    val unreadNotificationCount: Flow<Int> = repository.unreadNotificationCount
    val allAuditLogs: Flow<List<AuditLogEntity>> = repository.allAuditLogs
    val allSupplierRatings: Flow<List<SupplierPerformanceRatingEntity>> = repository.allSupplierRatings

    fun getItemsForRequest(requestId: String): Flow<List<PurchaseRequestItemEntity>> =
        repository.getItemsForRequest(requestId)

    fun getItemsForOrder(orderId: String): Flow<List<PurchaseOrderItemEntity>> =
        repository.getItemsForOrder(orderId)

    fun getCheckpointsForDelivery(deliveryId: String): Flow<List<DeliveryTrackingCheckpointEntity>> =
        repository.getCheckpointsForDelivery(deliveryId)

    fun getRatingsForSupplier(supplierId: String): Flow<List<SupplierPerformanceRatingEntity>> =
        repository.getRatingsForSupplier(supplierId)

    val topPerformingSupplier: StateFlow<TopSupplierPerformance?> = combine(
        allSuppliers,
        allSupplierRatings
    ) { suppliers, ratings ->
        if (suppliers.isEmpty()) return@combine null

        val scoredSuppliers = suppliers.map { sup ->
            val supRatings = ratings.filter { it.supplierId == sup.id }
            val avgOverall = if (supRatings.isNotEmpty()) {
                supRatings.map { it.overallScore }.average()
            } else {
                ((sup.qualityScore * 0.35) + (sup.onTimeDeliveryRate * 0.35) + (95.0 * 0.15) + (96.0 * 0.15))
            }
            val avgQuality = if (supRatings.isNotEmpty()) {
                supRatings.map { it.qualityScore }.average()
            } else {
                sup.qualityScore
            }
            val avgDelivery = if (supRatings.isNotEmpty()) {
                supRatings.map { it.deliveryScore }.average()
            } else {
                sup.onTimeDeliveryRate
            }
            val avgPricing = if (supRatings.isNotEmpty()) {
                supRatings.map { it.pricingScore }.average()
            } else {
                95.0
            }
            val avgService = if (supRatings.isNotEmpty()) {
                supRatings.map { it.serviceScore }.average()
            } else {
                96.0
            }
            val stars = (avgOverall / 20.0).coerceIn(1.0, 5.0)
            val tier = when {
                avgOverall >= 96.0 -> "TIER 1 PLATINUM"
                avgOverall >= 92.0 -> "PREFERRED PARTNER"
                avgOverall >= 85.0 -> "VERIFIED VENDOR"
                else -> "STANDARD SUPPLIER"
            }
            val latestFeedback = supRatings.maxByOrNull { it.ratingDate }?.feedbackComments
                ?: "Exceptional delivery SLA with 98%+ quality compliance and fast dispatch."
            val lastRatedDate = supRatings.maxByOrNull { it.ratingDate }?.ratingDate
                ?: System.currentTimeMillis()

            TopSupplierPerformance(
                supplier = sup,
                averageOverallScore = Math.round(avgOverall * 10.0) / 10.0,
                qualityScore = Math.round(avgQuality * 10.0) / 10.0,
                onTimeDeliveryRate = Math.round(avgDelivery * 10.0) / 10.0,
                pricingScore = Math.round(avgPricing * 10.0) / 10.0,
                serviceScore = Math.round(avgService * 10.0) / 10.0,
                ratingStars = Math.round(stars * 10.0) / 10.0,
                totalRatingsCount = supRatings.size,
                tierBadge = tier,
                latestFeedback = latestFeedback,
                lastRatedDate = lastRatedDate
            )
        }

        scoredSuppliers.maxByOrNull { it.averageOverallScore }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val kpis: StateFlow<DashboardKpis> = combine(
        allOrders,
        allRequests,
        allDeliveries,
        lowStockProducts,
        allSuppliers
    ) { orders, requests, deliveries, lowStock, suppliers ->
        val totalSpend = orders.filter { it.status != OrderStatus.CANCELLED && it.status != OrderStatus.SUPPLIER_REJECTED }
            .sumOf { it.totalAmount }
        val reqApprovals = requests.count { it.status == RequestStatus.PENDING_APPROVAL || it.status == RequestStatus.SUBMITTED }
        val poApprovals = orders.count { it.status == OrderStatus.PENDING_APPROVAL && !it.isFullyApproved }
        val pendingApprovals = reqApprovals + poApprovals
        val activeOrders = orders.count { it.status != OrderStatus.DELIVERED && it.status != OrderStatus.COMPLETED && it.status != OrderStatus.CANCELLED }
        val inTransit = deliveries.count { it.status == DeliveryStatus.IN_TRANSIT || it.status == DeliveryStatus.OUT_FOR_DELIVERY }
        val delivered = deliveries.count { it.status == DeliveryStatus.DELIVERED }
        val conversion = if (requests.isNotEmpty()) (orders.size.toDouble() / requests.size.toDouble()) * 100.0 else 0.0

        DashboardKpis(
            totalProcurementSpend = totalSpend,
            pendingApprovalsCount = pendingApprovals,
            activeOrdersCount = activeOrders,
            inTransitCount = inTransit,
            deliveredOrdersCount = delivered,
            lowStockCount = lowStock.size,
            totalSuppliersCount = suppliers.size,
            poConversionRate = conversion
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), DashboardKpis())

    fun selectTab(tab: AppTab) {
        _currentTab.value = tab
    }

    fun switchRole(role: UserRole) {
        viewModelScope.launch {
            repository.switchUserRole(role)
            _toastMessage.value = "Switched persona to ${role.displayName}"
        }
    }

    fun selectRequest(request: PurchaseRequestEntity?) {
        _selectedRequest.value = request
    }

    fun selectOrder(order: PurchaseOrderEntity?) {
        _selectedOrder.value = order
    }

    fun selectDelivery(delivery: DeliveryEntity?) {
        _selectedDelivery.value = delivery
    }

    fun compareSuppliersForProduct(product: ProductEntity) {
        _selectedProductForSupplierComparison.value = product
        viewModelScope.launch {
            _supplierRecommendations.value = repository.rankSuppliersForProduct(product)
        }
    }

    fun clearSupplierComparison() {
        _selectedProductForSupplierComparison.value = null
        _supplierRecommendations.value = emptyList()
    }

    fun refreshRecommendations() {
        viewModelScope.launch {
            _replenishmentRecommendations.value = repository.getReplenishmentRecommendations()
        }
    }

    fun clearToast() {
        _toastMessage.value = null
    }

    fun dismissHighValueAlert() {
        _highValueOrderAlert.value = null
    }

    fun triggerTestHighValueNotification(isApproved: Boolean) {
        viewModelScope.launch {
            val user = currentUser.value ?: repository.allUsers.first().firstOrNull() ?: return@launch
            val testPoNumber = "PO-2026-9999"
            val testAmount = 145000.0
            val remarks = if (isApproved) "Test approval for high-capacity datacenter server stack" else "Budget freeze review required"

            LocalNotificationManager.showHighValueOrderNotification(
                context = getApplication(),
                poNumber = testPoNumber,
                amount = testAmount,
                isApproved = isApproved,
                isFullyApproved = isApproved,
                actorName = user.name,
                actorRole = user.role.displayName,
                remarksOrReason = remarks,
                currentLevel = 2,
                requiredLevel = 2
            )

            _highValueOrderAlert.value = HighValueOrderAlert(
                poNumber = testPoNumber,
                amount = testAmount,
                isApproved = isApproved,
                isFullyApproved = isApproved,
                actorName = user.name,
                actorRole = user.role.displayName,
                remarksOrReason = remarks,
                currentLevel = 2,
                requiredLevel = 2
            )

            _toastMessage.value = if (isApproved) "Triggered High-Value Approval Alert" else "Triggered High-Value Rejection Alert"
        }
    }

    // Purchase Request Submission
    fun submitNewRequest(
        department: String,
        priority: Priority,
        reason: String,
        items: List<Pair<ProductEntity, Int>>
    ) {
        viewModelScope.launch {
            val user = currentUser.value ?: return@launch
            val req = repository.createPurchaseRequest(user, department, priority, reason, items)
            _toastMessage.value = "Created Purchase Request ${req.requestNumber}"
            refreshRecommendations()
        }
    }

    // Multi-Level Approval
    fun approveRequest(requestId: String, remarks: String) {
        viewModelScope.launch {
            val user = currentUser.value ?: return@launch
            val res = repository.approvePurchaseRequest(requestId, user, remarks)
            _toastMessage.value = res.message

            if (res.success && res.data is PurchaseRequestEntity) {
                val req = res.data
                if (LocalNotificationManager.isHighValue(req.estimatedAmount)) {
                    val isFullyApproved = req.status == RequestStatus.APPROVED || req.status == RequestStatus.CONVERTED_TO_PO
                    LocalNotificationManager.showHighValueOrderNotification(
                        context = getApplication(),
                        poNumber = req.requestNumber,
                        amount = req.estimatedAmount,
                        isApproved = true,
                        isFullyApproved = isFullyApproved,
                        actorName = user.name,
                        actorRole = user.role.displayName,
                        remarksOrReason = remarks,
                        currentLevel = req.currentApprovalLevel,
                        requiredLevel = req.requiredApprovalLevel
                    )
                    _highValueOrderAlert.value = HighValueOrderAlert(
                        poNumber = req.requestNumber,
                        amount = req.estimatedAmount,
                        isApproved = true,
                        isFullyApproved = isFullyApproved,
                        actorName = user.name,
                        actorRole = user.role.displayName,
                        remarksOrReason = remarks,
                        currentLevel = req.currentApprovalLevel,
                        requiredLevel = req.requiredApprovalLevel
                    )
                }
            }
            refreshRecommendations()
        }
    }

    fun rejectRequest(requestId: String, reason: String) {
        viewModelScope.launch {
            val user = currentUser.value ?: return@launch
            val res = repository.rejectPurchaseRequest(requestId, user, reason)
            _toastMessage.value = res.message

            val req = db.purchaseRequestDao().getRequestById(requestId)
            if (req != null && LocalNotificationManager.isHighValue(req.estimatedAmount)) {
                LocalNotificationManager.showHighValueOrderNotification(
                    context = getApplication(),
                    poNumber = req.requestNumber,
                    amount = req.estimatedAmount,
                    isApproved = false,
                    isFullyApproved = false,
                    actorName = user.name,
                    actorRole = user.role.displayName,
                    remarksOrReason = reason,
                    currentLevel = req.currentApprovalLevel,
                    requiredLevel = req.requiredApprovalLevel
                )
                _highValueOrderAlert.value = HighValueOrderAlert(
                    poNumber = req.requestNumber,
                    amount = req.estimatedAmount,
                    isApproved = false,
                    isFullyApproved = false,
                    actorName = user.name,
                    actorRole = user.role.displayName,
                    remarksOrReason = reason,
                    currentLevel = req.currentApprovalLevel,
                    requiredLevel = req.requiredApprovalLevel
                )
            }
            refreshRecommendations()
        }
    }

    // Purchase Order Conversion & Hierarchical Approval
    fun convertRequestToPo(requestId: String, supplierId: String, notes: String) {
        viewModelScope.launch {
            val user = currentUser.value ?: return@launch
            val res = repository.createPurchaseOrderFromRequest(requestId, supplierId, user, notes)
            _toastMessage.value = res.message
            refreshRecommendations()
        }
    }

    fun approvePoLevel(orderId: String, remarks: String) {
        viewModelScope.launch {
            val user = currentUser.value ?: return@launch
            val res = repository.approvePurchaseOrderLevel(orderId, user, remarks)
            _toastMessage.value = res.message

            if (res.success && res.data is PurchaseOrderEntity) {
                val order = res.data
                if (LocalNotificationManager.isHighValue(order.totalAmount)) {
                    val isFully = order.isFullyApproved || order.status == OrderStatus.SENT_TO_SUPPLIER
                    LocalNotificationManager.showHighValueOrderNotification(
                        context = getApplication(),
                        poNumber = order.poNumber,
                        amount = order.totalAmount,
                        isApproved = true,
                        isFullyApproved = isFully,
                        actorName = user.name,
                        actorRole = user.role.displayName,
                        remarksOrReason = remarks,
                        currentLevel = order.currentApprovalLevel,
                        requiredLevel = order.requiredApprovalLevel
                    )
                    _highValueOrderAlert.value = HighValueOrderAlert(
                        poNumber = order.poNumber,
                        amount = order.totalAmount,
                        isApproved = true,
                        isFullyApproved = isFully,
                        actorName = user.name,
                        actorRole = user.role.displayName,
                        remarksOrReason = remarks,
                        currentLevel = order.currentApprovalLevel,
                        requiredLevel = order.requiredApprovalLevel
                    )
                }
            }
            refreshRecommendations()
        }
    }

    fun rejectPoApproval(orderId: String, reason: String) {
        viewModelScope.launch {
            val user = currentUser.value ?: return@launch
            val res = repository.rejectPurchaseOrder(orderId, user, reason)
            _toastMessage.value = res.message

            if (res.success && res.data is PurchaseOrderEntity) {
                val order = res.data
                if (LocalNotificationManager.isHighValue(order.totalAmount)) {
                    LocalNotificationManager.showHighValueOrderNotification(
                        context = getApplication(),
                        poNumber = order.poNumber,
                        amount = order.totalAmount,
                        isApproved = false,
                        isFullyApproved = false,
                        actorName = user.name,
                        actorRole = user.role.displayName,
                        remarksOrReason = reason,
                        currentLevel = order.currentApprovalLevel,
                        requiredLevel = order.requiredApprovalLevel
                    )
                    _highValueOrderAlert.value = HighValueOrderAlert(
                        poNumber = order.poNumber,
                        amount = order.totalAmount,
                        isApproved = false,
                        isFullyApproved = false,
                        actorName = user.name,
                        actorRole = user.role.displayName,
                        remarksOrReason = reason,
                        currentLevel = order.currentApprovalLevel,
                        requiredLevel = order.requiredApprovalLevel
                    )
                }
            }
            refreshRecommendations()
        }
    }

    // Supplier Actions
    fun supplierAcceptPo(orderId: String) {
        viewModelScope.launch {
            val user = currentUser.value ?: return@launch
            val res = repository.supplierAcceptOrder(orderId, user)
            _toastMessage.value = res.message
        }
    }

    fun supplierRejectPo(orderId: String, reason: String) {
        viewModelScope.launch {
            val user = currentUser.value ?: return@launch
            val res = repository.supplierRejectOrder(orderId, user, reason)
            _toastMessage.value = res.message
        }
    }

    fun supplierDispatchPo(orderId: String, carrier: String, trackingNumber: String) {
        viewModelScope.launch {
            val user = currentUser.value ?: return@launch
            val res = repository.supplierDispatchOrder(orderId, user, carrier, trackingNumber)
            _toastMessage.value = res.message
        }
    }

    // Delivery Agent Status Progress
    fun advanceDelivery(deliveryId: String, nextStatus: DeliveryStatus, notes: String) {
        viewModelScope.launch {
            val user = currentUser.value ?: return@launch
            val res = repository.advanceDeliveryStatus(deliveryId, user, nextStatus, notes)
            _toastMessage.value = res.message
            refreshRecommendations()
        }
    }

    // Manual Inventory Adjustment
    fun adjustStock(productId: String, delta: Int, notes: String) {
        viewModelScope.launch {
            val user = currentUser.value ?: return@launch
            val res = repository.adjustInventoryManual(productId, delta, user, notes)
            _toastMessage.value = res.message
            refreshRecommendations()
        }
    }

    // Submit Supplier Performance Rating
    fun submitSupplierPerformanceRating(
        supplierId: String,
        qualityScore: Double,
        deliveryScore: Double,
        pricingScore: Double,
        serviceScore: Double,
        feedback: String,
        purchaseOrderId: String? = null,
        poNumber: String? = null,
        category: String = "Performance Review"
    ) {
        viewModelScope.launch {
            val user = currentUser.value ?: return@launch
            val res = repository.submitSupplierRating(
                supplierId = supplierId,
                user = user,
                qualityScore = qualityScore,
                deliveryScore = deliveryScore,
                pricingScore = pricingScore,
                serviceScore = serviceScore,
                feedback = feedback,
                purchaseOrderId = purchaseOrderId,
                poNumber = poNumber,
                category = category
            )
            _toastMessage.value = res.message
        }
    }

    // Workflow Engine API runner
    fun runWorkflowCommand(action: String, entityId: String, payload: String = "") {
        viewModelScope.launch {
            val res = repository.executeWorkflowCommand(action, entityId, payload)
            _apiConsoleResponse.value = res
            _toastMessage.value = "Workflow [${action}] executed: ${res.statusCode} ${res.message}"
            refreshRecommendations()
        }
    }

    // Interactive Demo Lifecycle Runner
    fun advanceDemoLifecycle() {
        viewModelScope.launch {
            val currentStep = _demoLifecycleStep.value
            when (currentStep) {
                1 -> {
                    // Step 1: Employee creates new PR for 2x Dell Laptops
                    repository.switchUserRole(UserRole.EMPLOYEE)
                    val emp = repository.currentUser.value ?: return@launch
                    val prods = db.productDao().getAllProducts().first()
                    val laptop = prods.firstOrNull { it.productCode == "PRD-LAP-5440" } ?: prods.first()
                    val pr = repository.createPurchaseRequest(
                        emp,
                        "R&D Lab 4",
                        Priority.HIGH,
                        "Urgent hardware requisition for AI inference workstation batch",
                        listOf(laptop to 2)
                    )
                    _toastMessage.value = "Demo Step 1: Employee created ${pr.requestNumber} (₹1,37,000)"
                    _demoLifecycleStep.value = 2
                }
                2 -> {
                    // Step 2: Approving Manager approves PR
                    repository.switchUserRole(UserRole.MANAGER)
                    val mgr = repository.currentUser.value ?: return@launch
                    val pending = db.purchaseRequestDao().getRequestsByStatus(RequestStatus.PENDING_APPROVAL).first()
                    val req = pending.firstOrNull()
                    if (req != null) {
                        repository.approvePurchaseRequest(req.id, mgr, "Approved budget allocation for R&D AI project")
                        _toastMessage.value = "Demo Step 2: Manager approved ${req.requestNumber}"
                    }
                    _demoLifecycleStep.value = 3
                }
                3 -> {
                    // Step 3: Procurement Manager converts to PO
                    repository.switchUserRole(UserRole.PROCUREMENT_MANAGER)
                    val proc = repository.currentUser.value ?: return@launch
                    val approved = db.purchaseRequestDao().getRequestsByStatus(RequestStatus.APPROVED).first()
                    val req = approved.firstOrNull()
                    if (req != null) {
                        repository.createPurchaseOrderFromRequest(req.id, "sup-001", proc, "Issued to Apex Enterprise with 18% GST")
                        _toastMessage.value = "Demo Step 3: Generated Purchase Order"
                    }
                    _demoLifecycleStep.value = 4
                }
                4 -> {
                    // Step 4: Supplier accepts PO
                    repository.switchUserRole(UserRole.SUPPLIER)
                    val sup = repository.currentUser.value ?: return@launch
                    val sentOrders = db.purchaseOrderDao().getOrdersByStatus(OrderStatus.SENT_TO_SUPPLIER).first()
                    val order = sentOrders.firstOrNull()
                    if (order != null) {
                        repository.supplierAcceptOrder(order.id, sup)
                        _toastMessage.value = "Demo Step 4: Supplier accepted ${order.poNumber}"
                    }
                    _demoLifecycleStep.value = 5
                }
                5 -> {
                    // Step 5: Supplier dispatches order
                    repository.switchUserRole(UserRole.SUPPLIER)
                    val sup = repository.currentUser.value ?: return@launch
                    val accepted = db.purchaseOrderDao().getOrdersByStatus(OrderStatus.SUPPLIER_ACCEPTED).first()
                    val order = accepted.firstOrNull()
                    if (order != null) {
                        val track = "BD-EXP-${(1000000..9999999).random()}"
                        repository.supplierDispatchOrder(order.id, sup, "BlueDart Express", track)
                        _toastMessage.value = "Demo Step 5: Dispatched with tracking #$track"
                    }
                    _demoLifecycleStep.value = 6
                }
                6 -> {
                    // Step 6: Delivery Agent updates to OUT_FOR_DELIVERY
                    repository.switchUserRole(UserRole.DELIVERY_AGENT)
                    val del = repository.currentUser.value ?: return@launch
                    val activeDel = db.deliveryDao().getAllDeliveries().first().firstOrNull { it.status == DeliveryStatus.PICKED_UP || it.status == DeliveryStatus.IN_TRANSIT }
                    if (activeDel != null) {
                        repository.advanceDeliveryStatus(activeDel.id, del, DeliveryStatus.OUT_FOR_DELIVERY, "Shipment loaded in last-mile van")
                        _toastMessage.value = "Demo Step 6: Out for Delivery with agent Suresh"
                    }
                    _demoLifecycleStep.value = 7
                }
                7 -> {
                    // Step 7: Delivery Agent marks DELIVERED -> Auto stock inwarding & audit log!
                    repository.switchUserRole(UserRole.DELIVERY_AGENT)
                    val del = repository.currentUser.value ?: return@launch
                    val outDel = db.deliveryDao().getAllDeliveries().first().firstOrNull { it.status == DeliveryStatus.OUT_FOR_DELIVERY }
                    if (outDel != null) {
                        repository.advanceDeliveryStatus(outDel.id, del, DeliveryStatus.DELIVERED, "Package received at dock. Stock inwarded.")
                        _toastMessage.value = "Demo Step 7: Delivered! Stock auto-updated & audit recorded."
                    }
                    repository.switchUserRole(UserRole.ADMIN)
                    _demoLifecycleStep.value = 1
                }
            }
            refreshRecommendations()
        }
    }

    // Theme Management
    val themeMode: Flow<AppThemeMode> = repository.themeMode

    fun setThemeMode(mode: AppThemeMode) {
        viewModelScope.launch {
            repository.setThemeMode(mode)
            _toastMessage.value = "Theme switched to ${mode.displayName}"
        }
    }

    // Authentication & Account Management
    fun login(email: String, password: String, onResult: (Boolean, String?) -> Unit) {
        viewModelScope.launch {
            val result = repository.login(email, password)
            if (result.isSuccess) {
                val user = result.getOrNull()
                _toastMessage.value = "Welcome back, ${user?.name}!"
                onResult(true, null)
            } else {
                val error = result.exceptionOrNull()?.message ?: "Login failed"
                _toastMessage.value = error
                onResult(false, error)
            }
        }
    }

    fun signUp(
        name: String,
        email: String,
        password: String,
        phone: String,
        department: String,
        role: UserRole,
        supplierId: String? = null,
        membershipPlan: MembershipPlan = MembershipPlan.STARTER,
        billingCycle: String = "MONTHLY",
        onResult: (Boolean, String?) -> Unit
    ) {
        viewModelScope.launch {
            val result = repository.signUp(
                name = name,
                email = email,
                password = password,
                phone = phone,
                department = department,
                role = role,
                supplierId = supplierId,
                membershipPlan = membershipPlan,
                billingCycle = billingCycle
            )
            if (result.isSuccess) {
                val user = result.getOrNull()
                _toastMessage.value = "Account created for ${user?.name}!"
                onResult(true, null)
            } else {
                val error = result.exceptionOrNull()?.message ?: "Sign up failed"
                _toastMessage.value = error
                onResult(false, error)
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            repository.logout()
            _toastMessage.value = "Logged out successfully"
        }
    }

    fun switchUserById(userId: String) {
        viewModelScope.launch {
            repository.switchUserById(userId)
            val user = repository.currentUser.value
            _toastMessage.value = "Active session: ${user?.name} (${user?.role?.displayName})"
        }
    }

    // Membership Plan Upgrades
    fun upgradeMembership(newPlan: MembershipPlan, billingCycle: String = "MONTHLY", onComplete: (() -> Unit)? = null) {
        viewModelScope.launch {
            val current = currentUser.value ?: return@launch
            val result = repository.upgradeMembership(current.id, newPlan, billingCycle)
            if (result.isSuccess) {
                _toastMessage.value = "Successfully activated ${newPlan.badgeText} (${billingCycle.lowercase()} billing)"
                onComplete?.invoke()
            } else {
                _toastMessage.value = result.exceptionOrNull()?.message ?: "Upgrade failed"
            }
        }
    }

    // Notifications
    fun markAsRead(id: String) = viewModelScope.launch { repository.markNotificationAsRead(id) }
    fun markAllAsRead() = viewModelScope.launch { repository.markAllNotificationsAsRead() }
    fun deleteNotification(id: String) = viewModelScope.launch { repository.deleteNotification(id) }
}
