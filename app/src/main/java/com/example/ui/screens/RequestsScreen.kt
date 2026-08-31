package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.FilterList
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
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.entity.ProductEntity
import com.example.data.entity.PurchaseRequestEntity
import com.example.data.entity.PurchaseRequestItemEntity
import com.example.data.entity.UserEntity
import com.example.data.model.Priority
import com.example.data.model.RequestStatus
import com.example.data.model.UserRole
import com.example.ui.components.PriorityBadge
import com.example.ui.components.RequestStatusBadge
import com.example.ui.components.formatCurrency
import com.example.ui.components.formatDateTime
import com.example.ui.theme.BentoBorder
import com.example.ui.theme.BentoBlueContainer
import com.example.ui.theme.BentoBlueOnContainer
import com.example.ui.theme.Slate200
import com.example.ui.theme.StatusError
import com.example.ui.theme.StatusSuccess
import com.example.ui.viewmodel.ProcurementViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RequestsScreen(
    viewModel: ProcurementViewModel,
    onConvertToPo: (PurchaseRequestEntity) -> Unit
) {
    val requests by viewModel.allRequests.collectAsStateWithLifecycle(emptyList())
    val products by viewModel.allProducts.collectAsStateWithLifecycle(emptyList())
    val currentUser by viewModel.currentUser.collectAsStateWithLifecycle()

    var selectedStatusFilter by remember { mutableStateOf<RequestStatus?>(null) }
    var showCreateDialog by remember { mutableStateOf(false) }
    var selectedRequestDetails by remember { mutableStateOf<PurchaseRequestEntity?>(null) }

    val filteredRequests = if (selectedStatusFilter == null) {
        requests
    } else {
        requests.filter { it.status == selectedStatusFilter }
    }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showCreateDialog = true },
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = Color.White,
                shape = RoundedCornerShape(18.dp),
                modifier = Modifier.testTag("create_request_fab")
            ) {
                Icon(imageVector = Icons.Default.Add, contentDescription = "New Purchase Request")
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp)
        ) {
            Spacer(modifier = Modifier.height(8.dp))

            // Filter Chips
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Surface(
                    shape = RoundedCornerShape(50),
                    color = if (selectedStatusFilter == null) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface,
                    border = androidx.compose.foundation.BorderStroke(1.dp, if (selectedStatusFilter == null) MaterialTheme.colorScheme.primary else BentoBorder),
                    modifier = Modifier.clickable { selectedStatusFilter = null }
                ) {
                    Text(
                        text = "All (${requests.size})",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        color = if (selectedStatusFilter == null) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 7.dp)
                    )
                }

                RequestStatus.values().forEach { status ->
                    val count = requests.count { it.status == status }
                    if (count > 0) {
                        Surface(
                            shape = RoundedCornerShape(50),
                            color = if (selectedStatusFilter == status) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface,
                            border = androidx.compose.foundation.BorderStroke(1.dp, if (selectedStatusFilter == status) MaterialTheme.colorScheme.primary else BentoBorder),
                            modifier = Modifier.clickable { selectedStatusFilter = status }
                        ) {
                            Text(
                                text = "${status.displayName} ($count)",
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Bold,
                                color = if (selectedStatusFilter == status) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 7.dp)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            if (filteredRequests.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = Icons.Default.Description,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "No purchase requests found",
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(filteredRequests) { req ->
                        PurchaseRequestCard(
                            request = req,
                            onClick = { selectedRequestDetails = req }
                        )
                    }
                    item { Spacer(modifier = Modifier.height(80.dp)) }
                }
            }
        }
    }

    // Create Purchase Request Dialog
    if (showCreateDialog) {
        CreateRequestDialog(
            availableProducts = products,
            onDismiss = { showCreateDialog = false },
            onSubmit = { department, priority, reason, items ->
                viewModel.submitNewRequest(department, priority, reason, items)
                showCreateDialog = false
            }
        )
    }

    // Request Details Dialog / Sheet
    selectedRequestDetails?.let { req ->
        RequestDetailsDialog(
            request = req,
            viewModel = viewModel,
            currentUser = currentUser,
            onDismiss = { selectedRequestDetails = null },
            onApprove = { remarks ->
                viewModel.approveRequest(req.id, remarks)
                selectedRequestDetails = null
            },
            onReject = { reason ->
                viewModel.rejectRequest(req.id, reason)
                selectedRequestDetails = null
            },
            onConvertToPo = {
                onConvertToPo(req)
                selectedRequestDetails = null
            }
        )
    }
}

@Composable
fun PurchaseRequestCard(
    request: PurchaseRequestEntity,
    onClick: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = androidx.compose.foundation.BorderStroke(1.dp, BentoBorder),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .testTag("request_card_${request.requestNumber.lowercase()}")
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = request.requestNumber,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
                RequestStatusBadge(status = request.status)
            }

            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = request.reason,
                style = MaterialTheme.typography.bodyMedium,
                maxLines = 2
            )

            Spacer(modifier = Modifier.height(10.dp))
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column {
                    Text(
                        text = "Estimated Amount",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = formatCurrency(request.estimatedAmount),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }
                PriorityBadge(priority = request.priority)
            }

            Spacer(modifier = Modifier.height(8.dp))
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "By ${request.requesterName} (${request.department})",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = formatDateTime(request.createdAt),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            // Approval level bar
            if (request.status == RequestStatus.PENDING_APPROVAL || request.status == RequestStatus.APPROVED) {
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "Approval: Lvl ${request.currentApprovalLevel}/${request.requiredApprovalLevel}",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.width(110.dp)
                    )
                    LinearProgressIndicator(
                        progress = { (request.currentApprovalLevel.toFloat() / request.requiredApprovalLevel.toFloat()).coerceIn(0f, 1f) },
                        modifier = Modifier
                            .weight(1f)
                            .height(6.dp)
                            .clip(RoundedCornerShape(3.dp)),
                        color = StatusSuccess
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateRequestDialog(
    availableProducts: List<ProductEntity>,
    onDismiss: () -> Unit,
    onSubmit: (department: String, priority: Priority, reason: String, items: List<Pair<ProductEntity, Int>>) -> Unit
) {
    var department by remember { mutableStateOf("Engineering & R&D") }
    var priority by remember { mutableStateOf(Priority.HIGH) }
    var reason by remember { mutableStateOf("") }
    val selectedItems = remember { mutableStateListOf<Pair<ProductEntity, Int>>() }

    val totalEstimate = selectedItems.sumOf { (prod, qty) -> prod.unitPrice * qty }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(text = "Create Purchase Request", fontWeight = FontWeight.Bold)
        },
        text = {
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(420.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                item {
                    OutlinedTextField(
                        value = department,
                        onValueChange = { department = it },
                        label = { Text("Department") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
                item {
                    OutlinedTextField(
                        value = reason,
                        onValueChange = { reason = it },
                        label = { Text("Business Justification / Reason") },
                        placeholder = { Text("e.g. Workstation upgrades for cloud team") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                // Add Items Section
                item {
                    Text(text = "Add Requisition Line Items", fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(4.dp))
                    Card(
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            // Product Picker
                            availableProducts.take(4).forEach { prod ->
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 4.dp)
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(prod.name, style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.SemiBold)
                                        Text(formatCurrency(prod.unitPrice), style = MaterialTheme.typography.labelSmall)
                                    }
                                    Button(
                                        onClick = {
                                            selectedItems.add(prod to 2)
                                        },
                                        modifier = Modifier.height(30.dp)
                                    ) {
                                        Text("Add 2", fontSize = 11.sp)
                                    }
                                }
                            }
                        }
                    }
                }

                // Selected items list
                if (selectedItems.isNotEmpty()) {
                    item {
                        Text(text = "Selected Items (${selectedItems.size})", fontWeight = FontWeight.Bold)
                    }
                    items(selectedItems) { (prod, qty) ->
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 2.dp)
                        ) {
                            Text("${qty}x ${prod.name}", style = MaterialTheme.typography.bodySmall, modifier = Modifier.weight(1f))
                            Text(formatCurrency(prod.unitPrice * qty), fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodySmall)
                            IconButton(
                                onClick = { selectedItems.remove(prod to qty) },
                                modifier = Modifier.size(24.dp)
                            ) {
                                Icon(Icons.Default.Close, contentDescription = "Remove", modifier = Modifier.size(16.dp))
                            }
                        }
                    }
                }

                item {
                    Spacer(modifier = Modifier.height(8.dp))
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = MaterialTheme.colorScheme.primaryContainer,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Total Estimated Budget:", fontWeight = FontWeight.Bold)
                            Text(formatCurrency(totalEstimate), fontWeight = FontWeight.ExtraBold, color = MaterialTheme.colorScheme.primary)
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (selectedItems.isEmpty() && availableProducts.isNotEmpty()) {
                        selectedItems.add(availableProducts.first() to 2)
                    }
                    onSubmit(department, priority, reason.ifBlank { "Requisition for department hardware" }, selectedItems)
                },
                modifier = Modifier.testTag("submit_request_button")
            ) {
                Text("Submit Request")
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
fun RequestDetailsDialog(
    request: PurchaseRequestEntity,
    viewModel: ProcurementViewModel,
    currentUser: UserEntity?,
    onDismiss: () -> Unit,
    onApprove: (remarks: String) -> Unit,
    onReject: (reason: String) -> Unit,
    onConvertToPo: () -> Unit
) {
    val items by viewModel.getItemsForRequest(request.id).collectAsStateWithLifecycle(emptyList())
    var remarks by remember { mutableStateOf("Approved as per budget requirements") }
    var rejectionReason by remember { mutableStateOf("Budget constraint") }
    var isRejectMode by remember { mutableStateOf(false) }

    val canApprove = currentUser?.role in listOf(UserRole.MANAGER, UserRole.PROCUREMENT_MANAGER, UserRole.ADMIN) &&
        (request.status == RequestStatus.PENDING_APPROVAL || request.status == RequestStatus.SUBMITTED)

    val canConvertToPo = currentUser?.role in listOf(UserRole.PROCUREMENT_MANAGER, UserRole.ADMIN) &&
        request.status == RequestStatus.APPROVED

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(text = request.requestNumber, fontWeight = FontWeight.Bold)
                RequestStatusBadge(status = request.status)
            }
        },
        text = {
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(380.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                item {
                    Text(text = "Requester Details", fontWeight = FontWeight.Bold)
                    Text("${request.requesterName} • ${request.department} (${request.requesterRole.displayName})", style = MaterialTheme.typography.bodySmall)
                    Text("Reason: ${request.reason}", style = MaterialTheme.typography.bodyMedium)
                }

                item {
                    Text(text = "Line Items", fontWeight = FontWeight.Bold)
                }

                if (items.isEmpty()) {
                    item {
                        Text("• Estimated requisition lines amounting to ${formatCurrency(request.estimatedAmount)}", style = MaterialTheme.typography.bodySmall)
                    }
                } else {
                    items(items) { item: PurchaseRequestItemEntity ->
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(item.productName, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                                Text("${item.quantity} units @ ${formatCurrency(item.estimatedUnitPrice)}", style = MaterialTheme.typography.labelSmall)
                            }
                            Text(formatCurrency(item.estimatedTotal), fontWeight = FontWeight.Bold)
                        }
                    }
                }

                item {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(10.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Total Requisition Value:")
                            Text(formatCurrency(request.estimatedAmount), fontWeight = FontWeight.Bold)
                        }
                    }
                }

                if (request.approvedBy != null) {
                    item {
                        Text(text = "Approval Audit:", fontWeight = FontWeight.Bold)
                        Text(request.approvedBy, style = MaterialTheme.typography.bodySmall, color = StatusSuccess)
                    }
                }

                if (canApprove) {
                    item {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(text = "Multi-Level Approval Action", fontWeight = FontWeight.Bold)
                        if (!isRejectMode) {
                            OutlinedTextField(
                                value = remarks,
                                onValueChange = { remarks = it },
                                label = { Text("Approval Remarks") },
                                modifier = Modifier.fillMaxWidth()
                            )
                        } else {
                            OutlinedTextField(
                                value = rejectionReason,
                                onValueChange = { rejectionReason = it },
                                label = { Text("Mandatory Rejection Reason") },
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            if (canApprove) {
                if (!isRejectMode) {
                    Row {
                        OutlinedButton(
                            onClick = { isRejectMode = true },
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = StatusError)
                        ) {
                            Text("Reject")
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Button(
                            onClick = { onApprove(remarks) },
                            colors = ButtonDefaults.buttonColors(containerColor = StatusSuccess),
                            modifier = Modifier.testTag("dialog_approve_request_button")
                        ) {
                            Text("Approve PR")
                        }
                    }
                } else {
                    Row {
                        TextButton(onClick = { isRejectMode = false }) {
                            Text("Back")
                        }
                        Button(
                            onClick = { onReject(rejectionReason) },
                            colors = ButtonDefaults.buttonColors(containerColor = StatusError)
                        ) {
                            Text("Confirm Reject")
                        }
                    }
                }
            } else if (canConvertToPo) {
                Button(
                    onClick = onConvertToPo,
                    modifier = Modifier.testTag("dialog_convert_to_po_button")
                ) {
                    Text("Generate Purchase Order")
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
