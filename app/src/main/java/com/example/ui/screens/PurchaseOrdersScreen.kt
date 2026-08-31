package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Draw
import androidx.compose.material.icons.filled.Gavel
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.entity.PurchaseOrderEntity
import com.example.data.entity.PurchaseOrderItemEntity
import com.example.data.entity.PurchaseRequestEntity
import com.example.data.entity.SupplierEntity
import com.example.data.entity.UserEntity
import com.example.data.model.OrderStatus
import com.example.data.model.UserRole
import com.example.data.workflow.PoApprovalStepInfo
import com.example.data.workflow.PoApprovalWorkflowEngine
import com.example.ui.components.DateRangePreset
import com.example.ui.components.OrderStatusBadge
import com.example.ui.components.PoApprovalMatrixInfoCard
import com.example.ui.components.PoDigitalSignatureDialog
import com.example.ui.components.PoFilterState
import com.example.ui.components.PoHierarchicalApprovalDetailChain
import com.example.ui.components.PoHierarchicalApprovalSummary
import com.example.ui.components.PoRejectionDialog
import com.example.ui.components.PoSearchAndFilterHeader
import com.example.ui.components.PoSortOption
import com.example.ui.components.PurchaseOrderStatusTimeline
import com.example.ui.components.PurchaseOrderStatusTracker
import com.example.ui.components.PurchaseOrderStatusTrackerCompact
import com.example.ui.components.formatCurrency
import com.example.ui.components.formatDate
import com.example.ui.components.formatDateTime
import com.example.ui.components.getDateRangeBounds
import com.example.ui.theme.BentoBorder
import com.example.ui.theme.BentoBlueContainer
import com.example.ui.theme.BentoBlueOnContainer
import com.example.ui.theme.BluePrimary
import com.example.ui.theme.StatusError
import com.example.ui.theme.StatusSuccess
import com.example.ui.theme.TealAccent
import com.example.ui.viewmodel.ProcurementViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PurchaseOrdersScreen(
    viewModel: ProcurementViewModel,
    preselectedRequestForPo: PurchaseRequestEntity? = null,
    onClearPreselectedRequest: () -> Unit = {}
) {
    val orders by viewModel.allOrders.collectAsStateWithLifecycle(emptyList())
    val suppliers by viewModel.allSuppliers.collectAsStateWithLifecycle(emptyList())
    val currentUser by viewModel.currentUser.collectAsStateWithLifecycle()

    var selectedOrderDetails by remember { mutableStateOf<PurchaseOrderEntity?>(null) }
    var showConvertDialog by remember { mutableStateOf(preselectedRequestForPo != null) }
    var filterState by remember { mutableStateOf(PoFilterState()) }
    var showMatrixCard by remember { mutableStateOf(false) }

    var signingStepOrder by remember { mutableStateOf<Pair<PurchaseOrderEntity, PoApprovalStepInfo>?>(null) }
    var rejectingOrder by remember { mutableStateOf<PurchaseOrderEntity?>(null) }

    val (dateStart, dateEnd) = remember(filterState.dateRangePreset, filterState.customStartDate, filterState.customEndDate) {
        getDateRangeBounds(filterState.dateRangePreset, filterState.customStartDate, filterState.customEndDate)
    }

    val filteredOrders = remember(orders, filterState, dateStart, dateEnd, currentUser) {
        orders.filter { order ->
            // 1. Search Query filter (PO Number, Supplier Name, Request Number, Notes, Tracking Number, Carrier)
            val matchesQuery = if (filterState.searchQuery.isBlank()) true else {
                val q = filterState.searchQuery.trim().lowercase()
                order.poNumber.lowercase().contains(q) ||
                    order.supplierName.lowercase().contains(q) ||
                    order.requestNumber.lowercase().contains(q) ||
                    order.notes.lowercase().contains(q) ||
                    (order.trackingNumber?.lowercase()?.contains(q) == true) ||
                    (order.carrier?.lowercase()?.contains(q) == true)
            }

            // 2. Supplier filter
            val matchesSupplier = if (filterState.selectedSupplierName == null) true else {
                order.supplierName.equals(filterState.selectedSupplierName, ignoreCase = true)
            }

            // 3. Status filter
            val matchesStatus = if (filterState.selectedStatus == null) true else {
                order.status == filterState.selectedStatus
            }

            // 4. Workflow Category filter
            val matchesCategory = when (filterState.selectedWorkflowCategory) {
                "MY_APPROVAL" -> {
                    if (order.status != OrderStatus.PENDING_APPROVAL || order.isFullyApproved || currentUser == null) false
                    else {
                        val steps = PoApprovalWorkflowEngine.parseSignatures(order.approvalSignaturesJson, order.totalAmount)
                        val currIndex = (order.currentApprovalLevel - 1).coerceIn(0, steps.lastIndex)
                        val currStep = steps.getOrNull(currIndex)
                        PoApprovalWorkflowEngine.canUserSignCurrentLevel(order, currentUser!!, currStep)
                    }
                }
                "PENDING_APPROVAL" -> order.status == OrderStatus.PENDING_APPROVAL && !order.isFullyApproved
                "IN_FULFILLMENT" -> order.status in listOf(
                    OrderStatus.SENT_TO_SUPPLIER,
                    OrderStatus.SUPPLIER_ACCEPTED,
                    OrderStatus.DISPATCHED,
                    OrderStatus.IN_TRANSIT,
                    OrderStatus.OUT_FOR_DELIVERY
                )
                "DELIVERED" -> order.status in listOf(OrderStatus.DELIVERED, OrderStatus.COMPLETED)
                else -> true
            }

            // 5. Date Range filter
            val matchesDateRange = if (dateStart != null && dateEnd != null) {
                order.orderDate in dateStart..dateEnd || order.createdAt in dateStart..dateEnd
            } else true

            matchesQuery && matchesSupplier && matchesStatus && matchesCategory && matchesDateRange
        }.let { list ->
            when (filterState.sortBy) {
                PoSortOption.DATE_NEWEST -> list.sortedByDescending { it.orderDate }
                PoSortOption.DATE_OLDEST -> list.sortedBy { it.orderDate }
                PoSortOption.AMOUNT_HIGH_LOW -> list.sortedByDescending { it.totalAmount }
                PoSortOption.AMOUNT_LOW_HIGH -> list.sortedBy { it.totalAmount }
                PoSortOption.SUPPLIER_AZ -> list.sortedBy { it.supplierName.lowercase() }
                PoSortOption.STATUS -> list.sortedBy { it.status.name }
            }
        }
    }

    val filteredSum = remember(filteredOrders) {
        filteredOrders.sumOf { it.totalAmount }
    }

    val myPendingCount = orders.count { order ->
        if (order.status != OrderStatus.PENDING_APPROVAL || order.isFullyApproved || currentUser == null) false
        else {
            val steps = PoApprovalWorkflowEngine.parseSignatures(order.approvalSignaturesJson, order.totalAmount)
            val currIndex = (order.currentApprovalLevel - 1).coerceIn(0, steps.lastIndex)
            val currStep = steps.getOrNull(currIndex)
            PoApprovalWorkflowEngine.canUserSignCurrentLevel(order, currentUser!!, currStep)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
    ) {
        Spacer(modifier = Modifier.height(8.dp))

        // 1. Search Bar & Advanced Filter Interface
        PoSearchAndFilterHeader(
            filterState = filterState,
            onFilterChange = { filterState = it },
            suppliers = suppliers,
            totalOrdersCount = orders.size,
            filteredOrdersCount = filteredOrders.size,
            filteredOrdersSum = filteredSum
        )

        Spacer(modifier = Modifier.height(8.dp))

        // 2. Hierarchical Policy Matrix Header Banner (Collapsible)
        Surface(
            shape = RoundedCornerShape(12.dp),
            color = Color(0xFFEDE7F6),
            border = BorderStroke(1.dp, Color(0xFFD1C4E9)),
            modifier = Modifier
                .fillMaxWidth()
                .clickable { showMatrixCard = !showMatrixCard }
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.AccountBalance,
                        contentDescription = null,
                        tint = Color(0xFF512DA8),
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Value-Based Approval Hierarchy",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF311B92)
                    )
                }

                Surface(
                    shape = RoundedCornerShape(50),
                    color = Color(0xFFD1C4E9)
                ) {
                    Text(
                        text = if (showMatrixCard) "Hide Matrix ▲" else "View Policy Matrix ▼",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF311B92),
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                    )
                }
            }
        }

        AnimatedVisibility(visible = showMatrixCard) {
            Column {
                Spacer(modifier = Modifier.height(8.dp))
                PoApprovalMatrixInfoCard(
                    onDismiss = { showMatrixCard = false }
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // 3. Quick Workflow Stage Category Pills
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // All
            val isAll = filterState.selectedWorkflowCategory == "ALL"
            Surface(
                shape = RoundedCornerShape(50),
                color = if (isAll) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface,
                border = BorderStroke(1.dp, if (isAll) MaterialTheme.colorScheme.primary else BentoBorder),
                modifier = Modifier.clickable { filterState = filterState.copy(selectedWorkflowCategory = "ALL") }
            ) {
                Text(
                    text = "All Stages (${orders.size})",
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.Bold,
                    color = if (isAll) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 7.dp)
                )
            }

            // Pending My Approval
            val isMyApproval = filterState.selectedWorkflowCategory == "MY_APPROVAL"
            Surface(
                shape = RoundedCornerShape(50),
                color = if (isMyApproval) Color(0xFFD84315) else if (myPendingCount > 0) Color(0xFFFFCCBC) else MaterialTheme.colorScheme.surface,
                border = BorderStroke(1.dp, if (isMyApproval) Color(0xFFD84315) else BentoBorder),
                modifier = Modifier.clickable { filterState = filterState.copy(selectedWorkflowCategory = "MY_APPROVAL") }
            ) {
                Text(
                    text = "Pending My Sign-Off ($myPendingCount)",
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.Bold,
                    color = if (isMyApproval) Color.White else if (myPendingCount > 0) Color(0xFFBF360C) else MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 7.dp)
                )
            }

            // In Approval Queue (All)
            val isApprovalQueue = filterState.selectedWorkflowCategory == "PENDING_APPROVAL"
            val allPendingApprovalCount = orders.count { it.status == OrderStatus.PENDING_APPROVAL && !it.isFullyApproved }
            Surface(
                shape = RoundedCornerShape(50),
                color = if (isApprovalQueue) Color(0xFF673AB7) else MaterialTheme.colorScheme.surface,
                border = BorderStroke(1.dp, if (isApprovalQueue) Color(0xFF673AB7) else BentoBorder),
                modifier = Modifier.clickable { filterState = filterState.copy(selectedWorkflowCategory = "PENDING_APPROVAL") }
            ) {
                Text(
                    text = "In Approval Queue ($allPendingApprovalCount)",
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.Bold,
                    color = if (isApprovalQueue) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 7.dp)
                )
            }

            // In Fulfillment
            val isFulfillment = filterState.selectedWorkflowCategory == "IN_FULFILLMENT"
            val inFulfillmentCount = orders.count { it.status in listOf(OrderStatus.SENT_TO_SUPPLIER, OrderStatus.SUPPLIER_ACCEPTED, OrderStatus.DISPATCHED, OrderStatus.IN_TRANSIT, OrderStatus.OUT_FOR_DELIVERY) }
            Surface(
                shape = RoundedCornerShape(50),
                color = if (isFulfillment) BluePrimary else MaterialTheme.colorScheme.surface,
                border = BorderStroke(1.dp, if (isFulfillment) BluePrimary else BentoBorder),
                modifier = Modifier.clickable { filterState = filterState.copy(selectedWorkflowCategory = "IN_FULFILLMENT") }
            ) {
                Text(
                    text = "In Fulfillment ($inFulfillmentCount)",
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.Bold,
                    color = if (isFulfillment) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 7.dp)
                )
            }

            // Delivered
            val isDelivered = filterState.selectedWorkflowCategory == "DELIVERED"
            val deliveredCount = orders.count { it.status == OrderStatus.DELIVERED }
            Surface(
                shape = RoundedCornerShape(50),
                color = if (isDelivered) StatusSuccess else MaterialTheme.colorScheme.surface,
                border = BorderStroke(1.dp, if (isDelivered) StatusSuccess else BentoBorder),
                modifier = Modifier.clickable { filterState = filterState.copy(selectedWorkflowCategory = "DELIVERED") }
            ) {
                Text(
                    text = "Delivered ($deliveredCount)",
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.Bold,
                    color = if (isDelivered) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 7.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // 4. Orders List or Empty State
        if (filteredOrders.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.ShoppingCart,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
                        modifier = Modifier.size(54.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = if (filterState.selectedWorkflowCategory == "MY_APPROVAL") {
                            "No orders currently pending your signature"
                        } else if (filterState.hasActiveFilters) {
                            "No matching purchase orders found"
                        } else {
                            "No purchase orders recorded yet"
                        },
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = if (filterState.hasActiveFilters) {
                            "Try clearing your search query, supplier, status, or date range filters."
                        } else {
                            "Convert approved purchase requests to generate purchase orders."
                        },
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )

                    if (filterState.hasActiveFilters) {
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = {
                                filterState = PoFilterState()
                            },
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                            modifier = Modifier.testTag("empty_state_reset_filters_button")
                        ) {
                            Text("Reset All Filters", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(filteredOrders) { po ->
                    PurchaseOrderCard(
                        order = po,
                        onClick = { selectedOrderDetails = po }
                    )
                }
                item { Spacer(modifier = Modifier.height(80.dp)) }
            }
        }
    }

    // Convert PR to PO Dialog
    if (showConvertDialog && preselectedRequestForPo != null) {
        ConvertPrToPoDialog(
            request = preselectedRequestForPo,
            suppliers = suppliers,
            onDismiss = {
                showConvertDialog = false
                onClearPreselectedRequest()
            },
            onConfirm = { supplierId, notes ->
                viewModel.convertRequestToPo(preselectedRequestForPo.id, supplierId, notes)
                showConvertDialog = false
                onClearPreselectedRequest()
            }
        )
    }

    // PO Details & Action Dialog
    selectedOrderDetails?.let { po ->
        PurchaseOrderDetailsDialog(
            order = po,
            viewModel = viewModel,
            currentUser = currentUser,
            onDismiss = { selectedOrderDetails = null },
            onInitiateSign = { order, step ->
                signingStepOrder = Pair(order, step)
            },
            onInitiateReject = { order ->
                rejectingOrder = order
            },
            onAccept = {
                viewModel.supplierAcceptPo(po.id)
                selectedOrderDetails = null
            },
            onReject = { reason ->
                viewModel.supplierRejectPo(po.id, reason)
                selectedOrderDetails = null
            },
            onDispatch = { carrier, track ->
                viewModel.supplierDispatchPo(po.id, carrier, track)
                selectedOrderDetails = null
            }
        )
    }

    // Digital Signature Modal
    signingStepOrder?.let { (order, step) ->
        if (currentUser != null) {
            PoDigitalSignatureDialog(
                order = order,
                step = step,
                currentUser = currentUser!!,
                onDismiss = { signingStepOrder = null },
                onConfirmSign = { remarks ->
                    viewModel.approvePoLevel(order.id, remarks)
                    signingStepOrder = null
                    selectedOrderDetails = null
                }
            )
        }
    }

    // Hierarchical Rejection Modal
    rejectingOrder?.let { order ->
        PoRejectionDialog(
            order = order,
            onDismiss = { rejectingOrder = null },
            onConfirmReject = { reason ->
                viewModel.rejectPoApproval(order.id, reason)
                rejectingOrder = null
                selectedOrderDetails = null
            }
        )
    }
}

@Composable
fun PurchaseOrderCard(
    order: PurchaseOrderEntity,
    onClick: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(1.dp, BentoBorder),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .testTag("po_card_${order.poNumber.lowercase()}")
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = order.poNumber,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
                OrderStatusBadge(status = order.status)
            }

            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "Supplier: ${order.supplierName}",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.SemiBold
            )

            if (order.requestNumber.isNotEmpty()) {
                Text(
                    text = "Ref: ${order.requestNumber}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Hierarchical Approval Summary Mini Widget
            PoHierarchicalApprovalSummary(order = order)

            Spacer(modifier = Modifier.height(10.dp))

            // Lifecycle Progression Step-Tracker
            PurchaseOrderStatusTrackerCompact(order = order)

            Spacer(modifier = Modifier.height(10.dp))
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column {
                    Text(
                        text = "Total Order Value",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = formatCurrency(order.totalAmount),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }

                if (order.trackingNumber != null) {
                    Column(horizontalAlignment = Alignment.End) {
                        Text(
                            text = "Tracking ID",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = order.trackingNumber,
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold,
                            color = TealAccent
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "Created: ${formatDate(order.orderDate)}",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = "Exp. Delivery: ${formatDate(order.expectedDeliveryDate)}",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ConvertPrToPoDialog(
    request: PurchaseRequestEntity,
    suppliers: List<SupplierEntity>,
    onDismiss: () -> Unit,
    onConfirm: (supplierId: String, notes: String) -> Unit
) {
    var selectedSupplier by remember { mutableStateOf(suppliers.firstOrNull()) }
    var notes by remember { mutableStateOf("Standard commercial terms with 18% GST and priority dispatch") }
    var expandedDropdown by remember { mutableStateOf(false) }

    val subtotal = request.estimatedAmount
    val tax = subtotal * 0.18
    val discount = if (subtotal > 50000) 1500.0 else 0.0
    val shipping = 600.0
    val grandTotal = subtotal + tax - discount + shipping

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(text = "Generate Purchase Order", fontWeight = FontWeight.Bold)
        },
        text = {
            Column(
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(text = "From Request: ${request.requestNumber} (${formatCurrency(request.estimatedAmount)})", style = MaterialTheme.typography.bodyMedium)

                // Supplier Selector
                Text(text = "Select Fulfillment Supplier / Vendor:", fontWeight = FontWeight.SemiBold)
                ExposedDropdownMenuBox(
                    expanded = expandedDropdown,
                    onExpandedChange = { expandedDropdown = !expandedDropdown }
                ) {
                    OutlinedTextField(
                        value = selectedSupplier?.companyName ?: "Choose supplier",
                        onValueChange = {},
                        readOnly = true,
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedDropdown) },
                        modifier = Modifier
                            .menuAnchor()
                            .fillMaxWidth()
                    )
                    ExposedDropdownMenu(
                        expanded = expandedDropdown,
                        onDismissRequest = { expandedDropdown = false }
                    ) {
                        suppliers.forEach { sup ->
                            DropdownMenuItem(
                                text = {
                                    Column {
                                        Text(sup.companyName, fontWeight = FontWeight.SemiBold)
                                        Text("${sup.rating} ★ • ${sup.city} • Lead: ${sup.averageLeadDays} days", style = MaterialTheme.typography.labelSmall)
                                    }
                                },
                                onClick = {
                                    selectedSupplier = sup
                                    expandedDropdown = false
                                }
                            )
                        }
                    }
                }

                // Financial Breakdown Preview
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Subtotal:", style = MaterialTheme.typography.bodySmall)
                            Text(formatCurrency(subtotal), style = MaterialTheme.typography.bodySmall)
                        }
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("GST (18%):", style = MaterialTheme.typography.bodySmall)
                            Text(formatCurrency(tax), style = MaterialTheme.typography.bodySmall)
                        }
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Volume Discount:", style = MaterialTheme.typography.bodySmall)
                            Text("-${formatCurrency(discount)}", style = MaterialTheme.typography.bodySmall, color = StatusSuccess)
                        }
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Logistics & Shipping:", style = MaterialTheme.typography.bodySmall)
                            Text(formatCurrency(shipping), style = MaterialTheme.typography.bodySmall)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Grand Total PO Value:", fontWeight = FontWeight.Bold)
                            Text(formatCurrency(grandTotal), fontWeight = FontWeight.ExtraBold, color = MaterialTheme.colorScheme.primary)
                        }
                    }
                }

                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text("PO Notes & Commercial Terms") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    selectedSupplier?.let { sup ->
                        onConfirm(sup.id, notes)
                    }
                },
                modifier = Modifier.testTag("confirm_create_po_button")
            ) {
                Text("Issue PO to Supplier")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Composable
fun PurchaseOrderDetailsDialog(
    order: PurchaseOrderEntity,
    viewModel: ProcurementViewModel,
    currentUser: UserEntity?,
    onDismiss: () -> Unit,
    onInitiateSign: (order: PurchaseOrderEntity, step: PoApprovalStepInfo) -> Unit,
    onInitiateReject: (order: PurchaseOrderEntity) -> Unit,
    onAccept: () -> Unit,
    onReject: (reason: String) -> Unit,
    onDispatch: (carrier: String, trackingNumber: String) -> Unit
) {
    val items by viewModel.getItemsForOrder(order.id).collectAsStateWithLifecycle(emptyList())
    var isRejectMode by remember { mutableStateOf(false) }
    var isDispatchMode by remember { mutableStateOf(false) }
    var rejectReason by remember { mutableStateOf("Production capacity exceeded this quarter") }
    var carrier by remember { mutableStateOf("BlueDart Express") }
    var trackingNumber by remember { mutableStateOf("BD-EXP-${(1000000..9999999).random()}") }

    val isSupplierRole = currentUser?.role in listOf(UserRole.SUPPLIER, UserRole.ADMIN)

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(text = order.poNumber, fontWeight = FontWeight.Bold)
                OrderStatusBadge(status = order.status)
            }
        },
        text = {
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(490.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // 1. Hierarchical Value-Based Approval Workflow Chain
                item {
                    PoHierarchicalApprovalDetailChain(
                        order = order,
                        currentUser = currentUser,
                        onApproveClick = { step ->
                            onInitiateSign(order, step)
                        },
                        onRejectClick = { ord ->
                            onInitiateReject(ord)
                        }
                    )
                }

                // 2. Live Order Status Progression Tracker
                item {
                    PurchaseOrderStatusTracker(
                        order = order,
                        showContainerCard = true
                    )
                }

                // 3. Vendor & Commercial Details
                item {
                    Text(text = "Vendor & Commercial Information", fontWeight = FontWeight.Bold)
                    Text("Supplier: ${order.supplierName}", style = MaterialTheme.typography.bodyMedium)
                    Text("Created By: ${order.createdByName} on ${formatDate(order.orderDate)}", style = MaterialTheme.typography.bodySmall)
                }

                // 4. Line Items
                item {
                    Text(text = "Procurement Items", fontWeight = FontWeight.Bold)
                }

                if (items.isEmpty()) {
                    item {
                        Text("• Commercial procurement lines totaling ${formatCurrency(order.subtotal)}", style = MaterialTheme.typography.bodySmall)
                    }
                } else {
                    items(items) { itm: PurchaseOrderItemEntity ->
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(itm.productName, style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.SemiBold)
                                Text("${itm.quantity} units @ ${formatCurrency(itm.unitPrice)}", style = MaterialTheme.typography.labelSmall)
                            }
                            Text(formatCurrency(itm.totalPrice), fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }

                // Invoice Financial Summary Box
                item {
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Subtotal:", style = MaterialTheme.typography.bodySmall)
                                Text(formatCurrency(order.subtotal), style = MaterialTheme.typography.bodySmall)
                            }
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("GST (${order.taxRate}%):", style = MaterialTheme.typography.bodySmall)
                                Text(formatCurrency(order.taxAmount), style = MaterialTheme.typography.bodySmall)
                            }
                            if (order.discountAmount > 0) {
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text("Volume Discount:", style = MaterialTheme.typography.bodySmall)
                                    Text("-${formatCurrency(order.discountAmount)}", style = MaterialTheme.typography.bodySmall, color = StatusSuccess)
                                }
                            }
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Grand Total Value:", fontWeight = FontWeight.Bold)
                                Text(formatCurrency(order.totalAmount), fontWeight = FontWeight.ExtraBold, color = MaterialTheme.colorScheme.primary)
                            }
                        }
                    }
                }

                if (order.trackingNumber != null) {
                    item {
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = MaterialTheme.colorScheme.primaryContainer,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Text("Logistics & Tracking Info", fontWeight = FontWeight.Bold)
                                Text("Carrier: ${order.carrier}", style = MaterialTheme.typography.bodySmall)
                                Text("Tracking #: ${order.trackingNumber}", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                            }
                        }
                    }
                }

                // 5. Vertical Milestones Pipeline Timeline
                item {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                        border = BorderStroke(1.dp, BentoBorder),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Box(modifier = Modifier.padding(12.dp)) {
                            PurchaseOrderStatusTimeline(order = order)
                        }
                    }
                }

                // Supplier Action Forms
                if (isSupplierRole && order.status == OrderStatus.SENT_TO_SUPPLIER && isRejectMode) {
                    item {
                        OutlinedTextField(
                            value = rejectReason,
                            onValueChange = { rejectReason = it },
                            label = { Text("Reason for Rejection") },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }

                if (isSupplierRole && order.status == OrderStatus.SUPPLIER_ACCEPTED && isDispatchMode) {
                    item {
                        OutlinedTextField(
                            value = carrier,
                            onValueChange = { carrier = it },
                            label = { Text("Logistics Carrier") },
                            modifier = Modifier.fillMaxWidth()
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        OutlinedTextField(
                            value = trackingNumber,
                            onValueChange = { trackingNumber = it },
                            label = { Text("Air Waybill / Tracking #") },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
        },
        confirmButton = {
            if (isSupplierRole && order.status == OrderStatus.SENT_TO_SUPPLIER) {
                if (!isRejectMode) {
                    Row {
                        OutlinedButton(
                            onClick = { isRejectMode = true },
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = StatusError)
                        ) {
                            Text("Decline")
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Button(
                            onClick = onAccept,
                            colors = ButtonDefaults.buttonColors(containerColor = StatusSuccess),
                            modifier = Modifier.testTag("supplier_accept_po_button")
                        ) {
                            Text("Accept PO")
                        }
                    }
                } else {
                    Button(
                        onClick = { onReject(rejectReason) },
                        colors = ButtonDefaults.buttonColors(containerColor = StatusError)
                    ) {
                        Text("Confirm Decline")
                    }
                }
            } else if (isSupplierRole && order.status == OrderStatus.SUPPLIER_ACCEPTED) {
                if (!isDispatchMode) {
                    Button(
                        onClick = { isDispatchMode = true },
                        colors = ButtonDefaults.buttonColors(containerColor = BluePrimary),
                        modifier = Modifier.testTag("supplier_dispatch_po_button")
                    ) {
                        Icon(Icons.Default.LocalShipping, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Dispatch Shipment")
                    }
                } else {
                    Button(
                        onClick = { onDispatch(carrier, trackingNumber) },
                        colors = ButtonDefaults.buttonColors(containerColor = BluePrimary)
                    ) {
                        Text("Confirm Dispatch")
                    }
                }
            } else {
                Button(onClick = onDismiss) {
                    Text("Close")
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
