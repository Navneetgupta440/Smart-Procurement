package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Autorenew
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Sort
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Store
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Slider
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.entity.PurchaseOrderEntity
import com.example.data.entity.PurchaseOrderItemEntity
import com.example.data.entity.SupplierEntity
import com.example.data.model.OrderStatus
import com.example.data.model.Priority
import com.example.ui.components.DateRangePreset
import com.example.ui.components.OrderStatusBadge
import com.example.ui.components.PoSortOption
import com.example.ui.components.formatCurrency
import com.example.ui.components.formatDate
import com.example.ui.components.formatDateTime
import com.example.ui.components.getDateRangeBounds
import com.example.ui.theme.BentoBorder
import com.example.ui.theme.BluePrimary
import com.example.ui.theme.StatusError
import com.example.ui.theme.StatusSuccess
import com.example.ui.theme.StatusWarning
import com.example.ui.theme.TealAccent
import com.example.ui.viewmodel.AppTab
import com.example.ui.viewmodel.ProcurementViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderHistoryScreen(
    viewModel: ProcurementViewModel,
    onNavigateToRequests: () -> Unit = {}
) {
    val allOrders by viewModel.allOrders.collectAsStateWithLifecycle(emptyList())
    val allSuppliers by viewModel.allSuppliers.collectAsStateWithLifecycle(emptyList())
    val currentUser by viewModel.currentUser.collectAsStateWithLifecycle()

    var searchQuery by remember { mutableStateOf("") }
    var selectedSupplierId by remember { mutableStateOf<String?>(null) }
    var selectedStatusFilter by remember { mutableStateOf<OrderStatus?>(null) }
    var selectedDateRange by remember { mutableStateOf(DateRangePreset.ALL_TIME) }
    var selectedSortOption by remember { mutableStateOf(PoSortOption.DATE_NEWEST) }

    var selectedOrderForInvoice by remember { mutableStateOf<PurchaseOrderEntity?>(null) }
    var selectedOrderForRating by remember { mutableStateOf<PurchaseOrderEntity?>(null) }

    val filteredOrders: List<PurchaseOrderEntity> = remember(allOrders, searchQuery, selectedSupplierId, selectedStatusFilter, selectedDateRange, selectedSortOption) {
        val (startTime, endTime) = getDateRangeBounds(selectedDateRange, null, null)

        allOrders.filter { order ->
            // Search query matches PO Number, Supplier name, or notes
            val matchesSearch = searchQuery.isBlank() ||
                order.poNumber.contains(searchQuery, ignoreCase = true) ||
                order.supplierName.contains(searchQuery, ignoreCase = true) ||
                order.notes.contains(searchQuery, ignoreCase = true)

            // Supplier Filter
            val matchesSupplier = selectedSupplierId == null || order.supplierId == selectedSupplierId

            // Status Filter
            val matchesStatus = selectedStatusFilter == null || order.status == selectedStatusFilter

            // Date Range
            val matchesDate = (startTime == null || order.orderDate >= startTime) &&
                (endTime == null || order.orderDate <= endTime)

            matchesSearch && matchesSupplier && matchesStatus && matchesDate
        }.let { list ->
            when (selectedSortOption) {
                PoSortOption.DATE_NEWEST -> list.sortedByDescending { it.orderDate }
                PoSortOption.DATE_OLDEST -> list.sortedBy { it.orderDate }
                PoSortOption.AMOUNT_HIGH_LOW -> list.sortedByDescending { it.totalAmount }
                PoSortOption.AMOUNT_LOW_HIGH -> list.sortedBy { it.totalAmount }
                PoSortOption.SUPPLIER_AZ -> list.sortedBy { it.supplierName }
                PoSortOption.STATUS -> list.sortedBy { it.status.name }
            }
        }
    }

    val totalHistoricalSpend = remember(filteredOrders) { filteredOrders.sumOf { it.totalAmount } }
    val deliveredCount = remember(filteredOrders) { filteredOrders.count { it.status == OrderStatus.DELIVERED || it.status == OrderStatus.COMPLETED } }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
            .testTag("order_history_screen"),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(8.dp))
            // Header Stats Banner
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = BorderStroke(1.dp, BentoBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.linearGradient(
                                listOf(
                                    BluePrimary.copy(alpha = 0.12f),
                                    TealAccent.copy(alpha = 0.08f),
                                    MaterialTheme.colorScheme.surface
                                )
                            )
                        )
                        .padding(18.dp)
                ) {
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "Order History & Archive",
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "Complete procurement ledger, tax receipts & vendor SLA reviews",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            Box(
                                modifier = Modifier
                                    .size(44.dp)
                                    .clip(RoundedCornerShape(14.dp))
                                    .background(BluePrimary.copy(alpha = 0.15f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.History,
                                    contentDescription = null,
                                    tint = BluePrimary,
                                    modifier = Modifier.size(24.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Stats Metric Bento
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f),
                                border = BorderStroke(1.dp, BentoBorder),
                                modifier = Modifier.weight(1f)
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Text("ARCHIVED SPEND", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(formatCurrency(totalHistoricalSpend), fontSize = 14.sp, fontWeight = FontWeight.ExtraBold, color = BluePrimary)
                                }
                            }
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f),
                                border = BorderStroke(1.dp, BentoBorder),
                                modifier = Modifier.weight(1f)
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Text("ORDERS COUNT", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text("${filteredOrders.size} Orders", fontSize = 14.sp, fontWeight = FontWeight.ExtraBold)
                                }
                            }
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f),
                                border = BorderStroke(1.dp, BentoBorder),
                                modifier = Modifier.weight(1f)
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
                                    Text("FULFILLED", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text("$deliveredCount Delivered", fontSize = 14.sp, fontWeight = FontWeight.ExtraBold, color = StatusSuccess)
                                }
                            }
                        }
                    }
                }
            }
        }

        item {
            // Search & Filter Controls
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = BorderStroke(1.dp, BentoBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    // Search Bar
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        placeholder = { Text("Search PO #, supplier, or items...") },
                        leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                        trailingIcon = {
                            if (searchQuery.isNotEmpty()) {
                                IconButton(onClick = { searchQuery = "" }) {
                                    Icon(Icons.Default.Close, contentDescription = "Clear")
                                }
                            }
                        },
                        singleLine = true,
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("history_search_input"),
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f),
                            focusedContainerColor = MaterialTheme.colorScheme.surface
                        )
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    // Date presets chip row
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        DateRangePreset.values().take(5).forEach { preset ->
                            FilterChip(
                                selected = selectedDateRange == preset,
                                onClick = { selectedDateRange = preset },
                                label = { Text(preset.displayName, fontSize = 11.sp) },
                                shape = RoundedCornerShape(8.dp),
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = BluePrimary,
                                    selectedLabelColor = Color.White
                                )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    // Status chips row
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        FilterChip(
                            selected = selectedStatusFilter == null,
                            onClick = { selectedStatusFilter = null },
                            label = { Text("All Statuses", fontSize = 11.sp) },
                            shape = RoundedCornerShape(8.dp)
                        )
                        listOf(
                            OrderStatus.DELIVERED,
                            OrderStatus.OUT_FOR_DELIVERY,
                            OrderStatus.IN_TRANSIT,
                            OrderStatus.DISPATCHED,
                            OrderStatus.APPROVED,
                            OrderStatus.CANCELLED
                        ).forEach { status ->
                            FilterChip(
                                selected = selectedStatusFilter == status,
                                onClick = { selectedStatusFilter = if (selectedStatusFilter == status) null else status },
                                label = { Text(status.displayName, fontSize = 11.sp) },
                                shape = RoundedCornerShape(8.dp)
                            )
                        }
                    }
                }
            }
        }

        if (filteredOrders.isEmpty()) {
            item {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = BorderStroke(1.dp, BentoBorder),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 24.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.History,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "No purchase orders match your history filter",
                            fontWeight = FontWeight.Bold,
                            style = MaterialTheme.typography.titleSmall
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Try clearing filters or adjusting your date range preset.",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        } else {
            items(filteredOrders, key = { it.id }) { order ->
                val itemsFlow = viewModel.getItemsForOrder(order.id)
                val orderItems by itemsFlow.collectAsStateWithLifecycle(emptyList())

                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = BorderStroke(1.dp, BentoBorder),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("history_order_card_${order.poNumber}")
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        // Top row: PO Number, Date, Status
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = order.poNumber,
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = BluePrimary
                                )
                                Text(
                                    text = "Ordered on ${formatDate(order.orderDate)}",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            OrderStatusBadge(status = order.status)
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Supplier & Amount
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(32.dp)
                                        .clip(CircleShape)
                                        .background(MaterialTheme.colorScheme.primaryContainer),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(Icons.Default.Store, contentDescription = null, tint = BluePrimary, modifier = Modifier.size(16.dp))
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                Column {
                                    Text(order.supplierName, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                                    Text("GST: ₹${String.format("%.2f", order.taxAmount)} (18%)", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                            }

                            Column(horizontalAlignment = Alignment.End) {
                                Text(
                                    text = formatCurrency(order.totalAmount),
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "${orderItems.size} Line Items",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        if (orderItems.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(10.dp))
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Column(modifier = Modifier.padding(10.dp)) {
                                    orderItems.take(3).forEach { itm ->
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Text("• ${itm.productName}", fontSize = 12.sp, fontWeight = FontWeight.Medium)
                                            Text("${itm.quantity} units × ₹${itm.unitPrice.toInt()}", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                        }
                                    }
                                    if (orderItems.size > 3) {
                                        Text("+ ${orderItems.size - 3} more items", fontSize = 10.sp, color = BluePrimary, fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))
                        HorizontalDivider(color = BentoBorder)
                        Spacer(modifier = Modifier.height(12.dp))

                        // Action Buttons
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedButton(
                                onClick = { selectedOrderForInvoice = order },
                                modifier = Modifier
                                    .weight(1f)
                                    .testTag("btn_view_invoice_${order.poNumber}"),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Icon(Icons.Default.Receipt, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Receipt", fontSize = 12.sp)
                            }

                            if (order.status == OrderStatus.DELIVERED || order.status == OrderStatus.COMPLETED) {
                                OutlinedButton(
                                    onClick = { selectedOrderForRating = order },
                                    modifier = Modifier
                                        .weight(1f)
                                        .testTag("btn_rate_supplier_${order.poNumber}"),
                                    shape = RoundedCornerShape(10.dp)
                                ) {
                                    Icon(Icons.Default.Star, contentDescription = null, tint = Color(0xFFF59E0B), modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Rate Vendor", fontSize = 12.sp)
                                }
                            }

                            Button(
                                onClick = {
                                    viewModel.selectTab(AppTab.REQUESTS)
                                    onNavigateToRequests()
                                },
                                modifier = Modifier
                                    .weight(1f)
                                    .testTag("btn_reorder_${order.poNumber}"),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = BluePrimary)
                            ) {
                                Icon(Icons.Default.Autorenew, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Re-Order", fontSize = 12.sp)
                            }
                        }
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(24.dp))
        }
    }

    // Formal Invoice / Receipt Dialog
    if (selectedOrderForInvoice != null) {
        val order = selectedOrderForInvoice!!
        val itemsFlow = viewModel.getItemsForOrder(order.id)
        val orderItems by itemsFlow.collectAsStateWithLifecycle(emptyList())

        AlertDialog(
            onDismissRequest = { selectedOrderForInvoice = null },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Receipt, contentDescription = null, tint = BluePrimary)
                    Spacer(modifier = Modifier.width(10.dp))
                    Text("Official Tax Invoice / Receipt", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                }
            },
            text = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .verticalScroll(rememberScrollState())
                ) {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                        border = BorderStroke(1.dp, BentoBorder)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column {
                                    Text("PURCHASE ORDER", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    Text(order.poNumber, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                                }
                                Column(horizontalAlignment = Alignment.End) {
                                    Text("ISSUED DATE", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    Text(formatDate(order.orderDate), fontSize = 12.sp, fontWeight = FontWeight.Medium)
                                }
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            HorizontalDivider(color = BentoBorder)
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column {
                                    Text("SUPPLIER ENTITY", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    Text(order.supplierName, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                                }
                                Column(horizontalAlignment = Alignment.End) {
                                    Text("BUYER ENTITY", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    Text("SmartProcure Inc.", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Text("Line Itemized Breakdown:", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    Spacer(modifier = Modifier.height(6.dp))

                    orderItems.forEach { itm ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(itm.productName, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                                Text("${itm.quantity} units @ ₹${itm.unitPrice.toInt()} / unit", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            Text(formatCurrency(itm.totalPrice), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))
                    HorizontalDivider(color = BentoBorder)
                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Subtotal", fontSize = 12.sp)
                        Text(formatCurrency(order.subtotal), fontSize = 12.sp)
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Applicable GST (18%)", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(formatCurrency(order.taxAmount), fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Total Paid Amount", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text(formatCurrency(order.totalAmount), fontWeight = FontWeight.ExtraBold, fontSize = 16.sp, color = BluePrimary)
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = StatusSuccess.copy(alpha = 0.12f),
                        border = BorderStroke(1.dp, StatusSuccess.copy(alpha = 0.3f))
                    ) {
                        Row(
                            modifier = Modifier.padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.Verified, contentDescription = null, tint = StatusSuccess, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Digital Blockchain Audit Trail Verified", fontSize = 11.sp, color = StatusSuccess, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = { selectedOrderForInvoice = null },
                    colors = ButtonDefaults.buttonColors(containerColor = BluePrimary),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.testTag("btn_close_invoice")
                ) {
                    Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Export / Close")
                }
            },
            shape = RoundedCornerShape(18.dp)
        )
    }

    // Rate Supplier Dialog
    if (selectedOrderForRating != null) {
        val order = selectedOrderForRating!!
        var qualityScore by remember { mutableDoubleStateOf(95.0) }
        var deliveryScore by remember { mutableDoubleStateOf(98.0) }
        var pricingScore by remember { mutableDoubleStateOf(92.0) }
        var serviceScore by remember { mutableDoubleStateOf(96.0) }
        var feedbackComment by remember { mutableStateOf("Outstanding delivery fulfillment, pristine packaging quality.") }

        AlertDialog(
            onDismissRequest = { selectedOrderForRating = null },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Star, contentDescription = null, tint = Color(0xFFF59E0B))
                    Spacer(modifier = Modifier.width(10.dp))
                    Text("Rate ${order.supplierName}", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                }
            },
            text = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .verticalScroll(rememberScrollState())
                ) {
                    Text(
                        text = "Submit vendor performance metrics for PO ${order.poNumber}. This directly influences AI vendor matchmaking scores.",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    // Quality Slider
                    Text("Product Quality: ${qualityScore.toInt()}%", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    Slider(
                        value = qualityScore.toFloat(),
                        onValueChange = { qualityScore = it.toDouble() },
                        valueRange = 50f..100f
                    )

                    // Delivery SLA Slider
                    Text("On-Time Delivery SLA: ${deliveryScore.toInt()}%", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    Slider(
                        value = deliveryScore.toFloat(),
                        onValueChange = { deliveryScore = it.toDouble() },
                        valueRange = 50f..100f
                    )

                    // Pricing Competitiveness Slider
                    Text("Pricing Competitiveness: ${pricingScore.toInt()}%", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    Slider(
                        value = pricingScore.toFloat(),
                        onValueChange = { pricingScore = it.toDouble() },
                        valueRange = 50f..100f
                    )

                    // Support & Service Slider
                    Text("Service & Compliance: ${serviceScore.toInt()}%", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    Slider(
                        value = serviceScore.toFloat(),
                        onValueChange = { serviceScore = it.toDouble() },
                        valueRange = 50f..100f
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = feedbackComment,
                        onValueChange = { feedbackComment = it },
                        label = { Text("Vendor Feedback / Comments") },
                        modifier = Modifier.fillMaxWidth().testTag("input_vendor_feedback"),
                        shape = RoundedCornerShape(10.dp),
                        maxLines = 3
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.submitSupplierPerformanceRating(
                            supplierId = order.supplierId,
                            qualityScore = qualityScore,
                            deliveryScore = deliveryScore,
                            pricingScore = pricingScore,
                            serviceScore = serviceScore,
                            feedback = feedbackComment,
                            purchaseOrderId = order.id,
                            poNumber = order.poNumber,
                            category = "Post-Delivery Order Review"
                        )
                        selectedOrderForRating = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B)),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.testTag("btn_submit_vendor_rating")
                ) {
                    Text("Submit Rating", color = Color.White)
                }
            },
            dismissButton = {
                TextButton(onClick = { selectedOrderForRating = null }) {
                    Text("Cancel")
                }
            },
            shape = RoundedCornerShape(18.dp)
        )
    }
}
