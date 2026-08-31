package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.RadioButtonUnchecked
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
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
import com.example.data.entity.DeliveryEntity
import com.example.data.entity.DeliveryTrackingCheckpointEntity
import com.example.data.model.DeliveryStatus
import com.example.data.model.UserRole
import com.example.ui.components.DeliveryStatusBadge
import com.example.ui.components.formatDateTime
import com.example.ui.theme.BentoBorder
import com.example.ui.theme.BentoMintContainer
import com.example.ui.theme.BentoMintOnContainer
import com.example.ui.theme.BluePrimary
import com.example.ui.theme.Slate200
import com.example.ui.theme.Slate400
import com.example.ui.theme.Slate600
import com.example.ui.theme.StatusSuccess
import com.example.ui.theme.StatusWarning
import com.example.ui.theme.TealAccent
import com.example.ui.viewmodel.ProcurementViewModel

@Composable
fun DeliveryScreen(viewModel: ProcurementViewModel) {
    val deliveries by viewModel.allDeliveries.collectAsStateWithLifecycle(emptyList())
    val currentUser by viewModel.currentUser.collectAsStateWithLifecycle()

    var searchQuery by remember { mutableStateOf("") }
    var selectedDelivery by remember { mutableStateOf<DeliveryEntity?>(null) }

    val filteredDeliveries = if (searchQuery.isBlank()) {
        deliveries
    } else {
        deliveries.filter {
            it.trackingNumber.contains(searchQuery, ignoreCase = true) ||
                it.poNumber.contains(searchQuery, ignoreCase = true) ||
                it.carrier.contains(searchQuery, ignoreCase = true)
        }
    }

    // Auto-select first delivery if none selected
    if (selectedDelivery == null && filteredDeliveries.isNotEmpty()) {
        selectedDelivery = filteredDeliveries.first()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
    ) {
        Spacer(modifier = Modifier.height(8.dp))

        // Search Bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search by Tracking #, PO #, Carrier...") },
            shape = RoundedCornerShape(16.dp),
            leadingIcon = {
                Icon(Icons.Default.LocalShipping, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
            },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(14.dp))

        if (filteredDeliveries.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "No active deliveries in transit",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(14.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(filteredDeliveries) { del ->
                    val isExpanded = selectedDelivery?.id == del.id
                    DeliveryTrackingCard(
                        delivery = del,
                        viewModel = viewModel,
                        isExpanded = isExpanded,
                        currentUserRole = currentUser?.role,
                        onToggleExpand = {
                            selectedDelivery = if (isExpanded) null else del
                        },
                        onAdvanceStatus = { nextStatus, notes ->
                            viewModel.advanceDelivery(del.id, nextStatus, notes)
                        }
                    )
                }
                item { Spacer(modifier = Modifier.height(80.dp)) }
            }
        }
    }
}

@Composable
fun DeliveryTrackingCard(
    delivery: DeliveryEntity,
    viewModel: ProcurementViewModel,
    isExpanded: Boolean,
    currentUserRole: UserRole?,
    onToggleExpand: () -> Unit,
    onAdvanceStatus: (DeliveryStatus, String) -> Unit
) {
    val checkpoints: List<DeliveryTrackingCheckpointEntity> by viewModel.getCheckpointsForDelivery(delivery.id).collectAsStateWithLifecycle(emptyList())

    val canUpdateStatus紧 = currentUserRole in listOf(UserRole.DELIVERY_AGENT, UserRole.PROCUREMENT_MANAGER, UserRole.ADMIN)

    Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = androidx.compose.foundation.BorderStroke(1.dp, BentoBorder),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onToggleExpand() }
            .testTag("delivery_card_${delivery.trackingNumber.lowercase()}")
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(BentoMintContainer),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocalShipping,
                            contentDescription = null,
                            tint = BentoMintOnContainer,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = delivery.trackingNumber,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                        Text(
                            text = "${delivery.carrier} • For ${delivery.poNumber}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
                DeliveryStatusBadge(status = delivery.status)
            }

            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = "Checkpoint: ${delivery.currentCheckpoint}",
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.SemiBold
            )

            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Destination: ${delivery.shippingAddress}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            // Expanded Visual Step Timeline
            AnimatedVisibility(visible = isExpanded) {
                Column(modifier = Modifier.padding(top = 16.dp)) {
                    Text(
                        text = "Shipment Milestones Timeline",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(10.dp))

                    // Stages List
                    val stages = listOf(
                        "Manifest & Dispatched" to (delivery.status != DeliveryStatus.CREATED),
                        "Carrier Pickup & Depots" to (delivery.status in listOf(DeliveryStatus.PICKED_UP, DeliveryStatus.IN_TRANSIT, DeliveryStatus.OUT_FOR_DELIVERY, DeliveryStatus.DELIVERED)),
                        "Regional Linehaul In Transit" to (delivery.status in listOf(DeliveryStatus.IN_TRANSIT, DeliveryStatus.OUT_FOR_DELIVERY, DeliveryStatus.DELIVERED)),
                        "Out for Delivery with Agent" to (delivery.status in listOf(DeliveryStatus.OUT_FOR_DELIVERY, DeliveryStatus.DELIVERED)),
                        "Delivered & Auto-Stock Inwarded" to (delivery.status == DeliveryStatus.DELIVERED)
                    )

                    stages.forEachIndexed { idx, (stageName, isDone) ->
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(22.dp)
                                    .clip(CircleShape)
                                    .background(if (isDone) StatusSuccess else Slate200),
                                contentAlignment = Alignment.Center
                            ) {
                                if (isDone) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = null,
                                        tint = Color.White,
                                        modifier = Modifier.size(12.dp)
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = stageName,
                                style = MaterialTheme.typography.bodySmall,
                                fontWeight = if (isDone) FontWeight.Bold else FontWeight.Normal,
                                color = if (isDone) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    // Delivery Agent Action Buttons
                    if (currentUserRole in listOf(UserRole.DELIVERY_AGENT, UserRole.PROCUREMENT_MANAGER, UserRole.ADMIN) && delivery.status != DeliveryStatus.DELIVERED) {
                        Spacer(modifier = Modifier.height(14.dp))
                        Text(
                            text = "Logistics Agent Quick Updates:",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            if (delivery.status == DeliveryStatus.CREATED || delivery.status == DeliveryStatus.PICKED_UP) {
                                Button(
                                    onClick = { onAdvanceStatus(DeliveryStatus.IN_TRANSIT, "Arrived at regional linehaul hub") },
                                    colors = ButtonDefaults.buttonColors(containerColor = BluePrimary),
                                    shape = RoundedCornerShape(14.dp),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text("Mark In Transit", fontSize = 12.sp)
                                }
                            }
                            if (delivery.status == DeliveryStatus.IN_TRANSIT) {
                                Button(
                                    onClick = { onAdvanceStatus(DeliveryStatus.OUT_FOR_DELIVERY, "Loaded onto agent van") },
                                    colors = ButtonDefaults.buttonColors(containerColor = StatusWarning),
                                    shape = RoundedCornerShape(14.dp),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text("Out for Delivery", fontSize = 12.sp)
                                }
                            }
                            if (delivery.status == DeliveryStatus.OUT_FOR_DELIVERY) {
                                Button(
                                    onClick = { onAdvanceStatus(DeliveryStatus.DELIVERED, "Package received at dock. Auto inwarded.") },
                                    colors = ButtonDefaults.buttonColors(containerColor = StatusSuccess),
                                    shape = RoundedCornerShape(14.dp),
                                    modifier = Modifier
                                        .weight(1f)
                                        .testTag("mark_delivered_button")
                                ) {
                                    Text("Confirm Delivered & Inward", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
