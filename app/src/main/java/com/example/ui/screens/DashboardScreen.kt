package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.FactCheck
import androidx.compose.material.icons.filled.Inventory
import androidx.compose.material.icons.filled.Inventory2
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Store
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.entity.ProductEntity
import com.example.data.entity.PurchaseOrderEntity
import com.example.data.entity.PurchaseRequestEntity
import com.example.data.model.OrderStatus
import com.example.data.model.Priority
import com.example.data.model.RequestStatus
import com.example.data.model.UserRole
import com.example.ui.components.DeliveryStatusBadge
import com.example.ui.components.MetricKpiCard
import com.example.ui.components.OrderStatusBadge
import com.example.ui.components.PriorityBadge
import com.example.ui.components.PurchaseOrderStatusTrackerCompact
import com.example.ui.components.RequestStatusBadge
import com.example.ui.components.formatCurrency
import com.example.ui.components.formatDateTime
import com.example.ui.theme.BentoAmberContainer
import com.example.ui.theme.BentoAmberOnContainer
import com.example.ui.theme.BentoBlueContainer
import com.example.ui.theme.BentoBlueOnContainer
import com.example.ui.theme.BentoBorder
import com.example.ui.theme.BentoCoralContainer
import com.example.ui.theme.BentoCoralOnContainer
import com.example.ui.theme.BentoDarkHero
import com.example.ui.theme.BentoDarkHeroOn
import com.example.ui.theme.BentoLavenderContainer
import com.example.ui.theme.BentoLavenderOnContainer
import com.example.ui.theme.BentoMintContainer
import com.example.ui.theme.BentoMintOnContainer
import com.example.ui.theme.BentoPinkContainer
import com.example.ui.theme.BentoPinkOnContainer
import com.example.ui.theme.BentoSurface
import com.example.ui.theme.BentoTealContainer
import com.example.ui.theme.BentoTealOnContainer
import com.example.ui.theme.BentoTextPrimary
import com.example.ui.theme.BentoTextSecondary
import com.example.ui.theme.BluePrimary
import com.example.ui.theme.BluePrimaryDark
import com.example.ui.theme.Slate200
import com.example.ui.theme.Slate400
import com.example.ui.theme.Slate600
import com.example.ui.theme.StatusError
import com.example.ui.theme.StatusSuccess
import com.example.ui.theme.StatusWarning
import com.example.ui.theme.TealAccent
import com.example.ui.viewmodel.AppTab
import com.example.ui.viewmodel.ProcurementViewModel

@Composable
fun DashboardScreen(
    viewModel: ProcurementViewModel,
    onNavigate: (AppTab) -> Unit
) {
    val kpis by viewModel.kpis.collectAsStateWithLifecycle()
    val currentUser by viewModel.currentUser.collectAsStateWithLifecycle()
    val allRequests by viewModel.allRequests.collectAsStateWithLifecycle(emptyList())
    val allOrders by viewModel.allOrders.collectAsStateWithLifecycle(emptyList())
    val allProducts by viewModel.allProducts.collectAsStateWithLifecycle(emptyList())
    val lowStockProducts by viewModel.lowStockProducts.collectAsStateWithLifecycle(emptyList())
    val recentAuditLogs by viewModel.allAuditLogs.collectAsStateWithLifecycle(emptyList())
    val topSupplier by viewModel.topPerformingSupplier.collectAsStateWithLifecycle()
    val demoStep by viewModel.demoLifecycleStep.collectAsStateWithLifecycle()

    val pendingRequests = allRequests.filter {
        it.status == RequestStatus.PENDING_APPROVAL || it.status == RequestStatus.SUBMITTED
    }
    val pendingAmount = pendingRequests.sumOf { it.estimatedAmount }

    val activeOrders = allOrders.filter {
        it.status != OrderStatus.DELIVERED && it.status != OrderStatus.COMPLETED && it.status != OrderStatus.CANCELLED
    }
    val activeOrdersTotalAmount = activeOrders.sumOf { it.totalAmount }

    val totalStockUnits = allProducts.sumOf { it.availableQuantity }
    val totalCapacityUnits = allProducts.sumOf { it.maximumStock }.coerceAtLeast(1)
    val inventoryHealthPercentage = if (allProducts.isNotEmpty()) {
        (((allProducts.size - lowStockProducts.size).toFloat() / allProducts.size.toFloat()) * 100f).toInt()
    } else 100

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. Bento Hero Card - Welcome & Active Persona
        item {
            Spacer(modifier = Modifier.height(4.dp))
            Card(
                shape = RoundedCornerShape(28.dp),
                colors = CardDefaults.cardColors(containerColor = BentoDarkHero),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("executive_hero_bento_card")
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Surface(
                            shape = RoundedCornerShape(50),
                            color = Color(0xFF22C55E).copy(alpha = 0.2f),
                            modifier = Modifier.padding(bottom = 2.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(6.dp)
                                        .clip(CircleShape)
                                        .background(Color(0xFF4ADE80))
                                )
                                Spacer(modifier = Modifier.width(5.dp))
                                Text(
                                    text = "ACTIVE PERSONA: ${currentUser?.role?.displayName?.uppercase() ?: "ADMIN"}",
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = Color(0xFF86EFAC),
                                    fontSize = 10.sp
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Welcome, ${currentUser?.name ?: "Vikram"}",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold,
                            color = BentoDarkHeroOn
                        )
                        Text(
                            text = "${currentUser?.department} • Enterprise Procurement System",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF94A3B8)
                        )
                    }
                }
            }
        }

        // 2. Bento Lifecycle Interactive Stepper Card
        item {
            Card(
                shape = RoundedCornerShape(28.dp),
                colors = CardDefaults.cardColors(containerColor = BentoLavenderContainer),
                border = BorderStroke(1.dp, BentoBorder),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("lifecycle_stepper_card")
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
                                    .size(32.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(BentoLavenderOnContainer.copy(alpha = 0.12f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.PlayArrow,
                                    contentDescription = null,
                                    tint = BentoLavenderOnContainer,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Procurement Lifecycle",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = BentoLavenderOnContainer
                            )
                        }
                        Surface(
                            shape = RoundedCornerShape(50),
                            color = BentoLavenderOnContainer
                        ) {
                            Text(
                                text = "Phase $demoStep / 7",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))
                    LinearProgressIndicator(
                        progress = { demoStep / 7.0f },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .clip(RoundedCornerShape(4.dp)),
                        color = BentoLavenderOnContainer,
                        trackColor = Color.White.copy(alpha = 0.6f)
                    )

                    Spacer(modifier = Modifier.height(12.dp))
                    val stepDescription = when (demoStep) {
                        1 -> "1. Employee Requisition: Create High-Priority Purchase Request for 2x Dell Latitude Laptops (₹1,37,000)."
                        2 -> "2. Manager Approval: Approving Manager evaluates budget & executes multi-level sign-off."
                        3 -> "3. PO Generation: Procurement Manager creates PO with 18% GST for supplier Apex Enterprise."
                        4 -> "4. Supplier Acceptance: Vendor accepts the purchase order & begins packaging."
                        5 -> "5. Order Dispatch: Vendor dispatches shipment via BlueDart Express with real tracking number."
                        6 -> "6. Last-Mile Logistics: Delivery Agent scans package out for delivery to destination warehouse."
                        7 -> "7. Delivery Confirmation: Dock receiving confirmation automatically increases stock & records audit trail!"
                        else -> "Lifecycle complete! Restart scenario."
                    }

                    Text(
                        text = stepDescription,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium,
                        color = BentoLavenderOnContainer
                    )

                    Spacer(modifier = Modifier.height(14.dp))
                    Button(
                        onClick = { viewModel.advanceDemoLifecycle() },
                        colors = ButtonDefaults.buttonColors(containerColor = BentoLavenderOnContainer),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("advance_demo_lifecycle_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.PlayArrow,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (demoStep == 7) "Execute Final Delivery & Inward Stock" else "Step $demoStep: Advance Next Stage",
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        // 3. Bento KPI Row: 4 Metric Cards
        item {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    MetricKpiCard(
                        title = "Procurement Spend",
                        value = formatCurrency(kpis.totalProcurementSpend),
                        subtitle = "Active committed orders",
                        icon = Icons.Default.AccountBalance,
                        accentColor = BentoBlueOnContainer,
                        containerColor = BentoBlueContainer,
                        modifier = Modifier.weight(1f)
                    )
                    MetricKpiCard(
                        title = "Pending Approvals",
                        value = "${kpis.pendingApprovalsCount} Requests",
                        subtitle = "Requires Manager/Admin",
                        icon = Icons.Default.Description,
                        accentColor = BentoAmberOnContainer,
                        containerColor = BentoAmberContainer,
                        modifier = Modifier.weight(1f)
                    )
                }
                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    MetricKpiCard(
                        title = "In-Transit",
                        value = "${kpis.inTransitCount} Active",
                        subtitle = "${kpis.deliveredOrdersCount} Delivered to date",
                        icon = Icons.Default.LocalShipping,
                        accentColor = BentoMintOnContainer,
                        containerColor = BentoMintContainer,
                        modifier = Modifier.weight(1f)
                    )
                    MetricKpiCard(
                        title = "Low Stock Alerts",
                        value = "${kpis.lowStockCount} Products",
                        subtitle = "Below min threshold",
                        icon = Icons.Default.Warning,
                        accentColor = BentoPinkOnContainer,
                        containerColor = BentoPinkContainer,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // -------------------------------------------------------------
        // 4. BENTO SUMMARY CARD 1: PENDING APPROVALS
        // -------------------------------------------------------------
        item {
            Card(
                shape = RoundedCornerShape(28.dp),
                colors = CardDefaults.cardColors(containerColor = BentoAmberContainer),
                border = BorderStroke(1.dp, BentoBorder),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("pending_approvals_bento_card")
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    // Header Row
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
                                    .background(BentoAmberOnContainer.copy(alpha = 0.12f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.FactCheck,
                                    contentDescription = null,
                                    tint = BentoAmberOnContainer,
                                    modifier = Modifier.size(22.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    text = "Pending Approvals",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = BentoAmberOnContainer
                                )
                                Text(
                                    text = "Awaiting Multi-Tier Authorization",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = BentoAmberOnContainer.copy(alpha = 0.8f)
                                )
                            }
                        }

                        Surface(
                            shape = RoundedCornerShape(50),
                            color = BentoAmberOnContainer,
                            border = BorderStroke(1.dp, BentoAmberOnContainer)
                        ) {
                            Text(
                                text = "${pendingRequests.size} WAITING",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color.White,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Value Highlight Sub-bar
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = Color.White.copy(alpha = 0.85f),
                        border = BorderStroke(1.dp, BentoBorder),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 14.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(
                                    text = "Total Pending Value",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = BentoTextSecondary
                                )
                                Text(
                                    text = formatCurrency(pendingAmount),
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = BentoAmberOnContainer
                                )
                            }
                            Surface(
                                shape = RoundedCornerShape(50),
                                color = BentoAmberContainer,
                                border = BorderStroke(1.dp, BentoBorder)
                            ) {
                                Text(
                                    text = if (pendingRequests.any { it.priority == Priority.URGENT }) "⚡ Urgent Action Required" else "✓ Normal SLA Queue",
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = BentoAmberOnContainer,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // List of Pending Requests (up to 3)
                    if (pendingRequests.isEmpty()) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 12.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "All purchase requests have been reviewed and approved!",
                                style = MaterialTheme.typography.bodyMedium,
                                color = BentoAmberOnContainer,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    } else {
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            pendingRequests.take(3).forEach { req ->
                                PendingApprovalBentoItem(
                                    request = req,
                                    onClick = { onNavigate(AppTab.REQUESTS) }
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Primary Action
                    Button(
                        onClick = { onNavigate(AppTab.REQUESTS) },
                        colors = ButtonDefaults.buttonColors(containerColor = BentoAmberOnContainer),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("review_pending_approvals_button")
                    ) {
                        Icon(Icons.Default.FactCheck, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Review & Authorize Requests", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // -------------------------------------------------------------
        // 5. BENTO SUMMARY CARD 2: INVENTORY LEVELS
        // -------------------------------------------------------------
        item {
            Card(
                shape = RoundedCornerShape(28.dp),
                colors = CardDefaults.cardColors(containerColor = BentoMintContainer),
                border = BorderStroke(1.dp, BentoBorder),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("inventory_levels_bento_card")
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    // Header Row
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
                                    .background(BentoMintOnContainer.copy(alpha = 0.12f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Inventory2,
                                    contentDescription = null,
                                    tint = BentoMintOnContainer,
                                    modifier = Modifier.size(22.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    text = "Inventory Levels",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = BentoMintOnContainer
                                )
                                Text(
                                    text = "${allProducts.size} Monitored Stock Items",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = BentoMintOnContainer.copy(alpha = 0.8f)
                                )
                            }
                        }

                        Surface(
                            shape = RoundedCornerShape(50),
                            color = if (lowStockProducts.isEmpty()) BentoMintOnContainer else StatusError,
                            border = BorderStroke(1.dp, BentoBorder)
                        ) {
                            Text(
                                text = if (lowStockProducts.isEmpty()) "$inventoryHealthPercentage% HEALTHY" else "${lowStockProducts.size} REORDER ALERTS",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color.White,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Inventory Health & Capacity Grid
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Surface(
                            shape = RoundedCornerShape(16.dp),
                            color = Color.White.copy(alpha = 0.85f),
                            border = BorderStroke(1.dp, BentoBorder),
                            modifier = Modifier.weight(1f)
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text("Total Units in Stock", style = MaterialTheme.typography.labelSmall, color = BentoTextSecondary)
                                Spacer(modifier = Modifier.height(2.dp))
                                Text("$totalStockUnits units", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold, color = BentoMintOnContainer)
                            }
                        }
                        Surface(
                            shape = RoundedCornerShape(16.dp),
                            color = Color.White.copy(alpha = 0.85f),
                            border = BorderStroke(1.dp, BentoBorder),
                            modifier = Modifier.weight(1f)
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text("Catalog Health", style = MaterialTheme.typography.labelSmall, color = BentoTextSecondary)
                                Spacer(modifier = Modifier.height(2.dp))
                                Text("$inventoryHealthPercentage% Optimal", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold, color = BentoMintOnContainer)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Stock Capacity Bar
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .background(Color.White.copy(alpha = 0.85f))
                            .border(1.dp, BentoBorder, RoundedCornerShape(16.dp))
                            .padding(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "Warehouse Fulfillment Capacity",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = BentoMintOnContainer
                            )
                            Text(
                                text = "$totalStockUnits / $totalCapacityUnits units",
                                style = MaterialTheme.typography.labelSmall,
                                color = BentoTextSecondary
                            )
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        LinearProgressIndicator(
                            progress = { (totalStockUnits.toFloat() / totalCapacityUnits.toFloat()).coerceIn(0f, 1f) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(7.dp)
                                .clip(RoundedCornerShape(4.dp)),
                            color = BentoMintOnContainer,
                            trackColor = BentoMintContainer
                        )
                    }

                    if (lowStockProducts.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(14.dp))
                        Text(
                            text = "Critical Items Requiring Restock:",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = BentoMintOnContainer
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            lowStockProducts.take(3).forEach { prod ->
                                InventoryAlertBentoItem(product = prod)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Primary Action
                    Button(
                        onClick = { onNavigate(AppTab.INVENTORY) },
                        colors = ButtonDefaults.buttonColors(containerColor = BentoMintOnContainer),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("manage_inventory_bento_button")
                    ) {
                        Icon(Icons.Default.Inventory, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Manage Inventory & Auto-Reorder", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // -------------------------------------------------------------
        // 6. BENTO SUMMARY CARD 3: ACTIVE PURCHASE ORDERS
        // -------------------------------------------------------------
        item {
            Card(
                shape = RoundedCornerShape(28.dp),
                colors = CardDefaults.cardColors(containerColor = BentoBlueContainer),
                border = BorderStroke(1.dp, BentoBorder),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("active_orders_bento_card")
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    // Header Row
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
                                    .background(BentoBlueOnContainer.copy(alpha = 0.12f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.ReceiptLong,
                                    contentDescription = null,
                                    tint = BentoBlueOnContainer,
                                    modifier = Modifier.size(22.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    text = "Active Purchase Orders",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = BentoBlueOnContainer
                                )
                                Text(
                                    text = "Vendor Fulfillment & Shipments",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = BentoBlueOnContainer.copy(alpha = 0.8f)
                                )
                            }
                        }

                        Surface(
                            shape = RoundedCornerShape(50),
                            color = BentoBlueOnContainer,
                            border = BorderStroke(1.dp, BentoBorder)
                        ) {
                            Text(
                                text = "${activeOrders.size} ACTIVE",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color.White,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Spend & Active Summary Row
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = Color.White.copy(alpha = 0.85f),
                        border = BorderStroke(1.dp, BentoBorder),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 14.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(
                                    text = "Committed Active Value",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = BentoTextSecondary
                                )
                                Text(
                                    text = formatCurrency(activeOrdersTotalAmount),
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = BentoBlueOnContainer
                                )
                            }
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Surface(
                                    shape = RoundedCornerShape(50),
                                    color = BentoBlueContainer,
                                    border = BorderStroke(1.dp, BentoBorder)
                                ) {
                                    Text(
                                        text = "${kpis.inTransitCount} In Transit",
                                        style = MaterialTheme.typography.labelSmall,
                                        fontWeight = FontWeight.Bold,
                                        color = BentoBlueOnContainer,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                    )
                                }
                                Surface(
                                    shape = RoundedCornerShape(50),
                                    color = BentoMintContainer,
                                    border = BorderStroke(1.dp, BentoBorder)
                                ) {
                                    Text(
                                        text = "${kpis.deliveredOrdersCount} Inwarded",
                                        style = MaterialTheme.typography.labelSmall,
                                        fontWeight = FontWeight.Bold,
                                        color = BentoMintOnContainer,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // List of Active POs (up to 3)
                    if (activeOrders.isEmpty()) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 12.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "No purchase orders currently in progress.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = BentoBlueOnContainer,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    } else {
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            activeOrders.take(3).forEach { order ->
                                ActiveOrderBentoItem(
                                    order = order,
                                    onClick = { onNavigate(AppTab.ORDERS) }
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Primary Action
                    Button(
                        onClick = { onNavigate(AppTab.ORDERS) },
                        colors = ButtonDefaults.buttonColors(containerColor = BentoBlueOnContainer),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("track_active_orders_button")
                    ) {
                        Icon(Icons.Default.ShoppingCart, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Track & Manage Purchase Orders", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // -------------------------------------------------------------
        // 7. BENTO SUMMARY CARD 4: TOP-PERFORMING SUPPLIER
        // -------------------------------------------------------------
        item {
            Card(
                shape = RoundedCornerShape(28.dp),
                colors = CardDefaults.cardColors(containerColor = BentoTealContainer),
                border = BorderStroke(1.dp, BentoBorder),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("top_supplier_bento_card")
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    // Header Row
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
                                    .background(BentoTealOnContainer.copy(alpha = 0.12f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Store,
                                    contentDescription = null,
                                    tint = BentoTealOnContainer,
                                    modifier = Modifier.size(22.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    text = "Top-Performing Supplier",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = BentoTealOnContainer
                                )
                                Text(
                                    text = "Performance Analytics & Quality Scores",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = BentoTealOnContainer.copy(alpha = 0.8f)
                                )
                            }
                        }

                        Surface(
                            shape = RoundedCornerShape(50),
                            color = BentoTealOnContainer,
                            border = BorderStroke(1.dp, BentoBorder)
                        ) {
                            Text(
                                text = topSupplier?.tierBadge ?: "TIER 1 PLATINUM",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color.White,
                                modifier = Modifier
                                    .padding(horizontal = 10.dp, vertical = 5.dp)
                                    .testTag("top_supplier_tier_badge")
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Top Supplier Profile & Overall Rating Banner
                    Surface(
                        shape = RoundedCornerShape(18.dp),
                        color = Color.White.copy(alpha = 0.88f),
                        border = BorderStroke(1.dp, BentoBorder),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = topSupplier?.supplier?.companyName ?: "Apex Enterprise Solutions",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = BentoTextPrimary,
                                    modifier = Modifier.testTag("top_supplier_name")
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = "${topSupplier?.supplier?.contactPerson ?: "Amitabh Sen"} • ${topSupplier?.supplier?.city ?: "Bangalore"}, ${topSupplier?.supplier?.state ?: "Karnataka"}",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = BentoTextSecondary
                                )
                                if (topSupplier?.supplier?.gstNumber?.isNotBlank() == true) {
                                    Text(
                                        text = "GSTIN: ${topSupplier?.supplier?.gstNumber}",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = BentoTextSecondary.copy(alpha = 0.7f),
                                        fontSize = 10.sp
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            // Overall Score Pill
                            Column(
                                horizontalAlignment = Alignment.End
                            ) {
                                Surface(
                                    shape = RoundedCornerShape(14.dp),
                                    color = BentoTealContainer,
                                    border = BorderStroke(1.dp, BentoBorder)
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        modifier = Modifier
                                            .padding(horizontal = 10.dp, vertical = 6.dp)
                                            .testTag("top_supplier_score_badge")
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Star,
                                            contentDescription = null,
                                            tint = Color(0xFFD97706),
                                            modifier = Modifier.size(16.dp)
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(
                                            text = "${topSupplier?.averageOverallScore ?: 97.6}%",
                                            style = MaterialTheme.typography.titleMedium,
                                            fontWeight = FontWeight.ExtraBold,
                                            color = BentoTealOnContainer
                                        )
                                    }
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "${topSupplier?.ratingStars ?: 4.9} ★ (${topSupplier?.totalRatingsCount ?: 2} reviews)",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = BentoTextSecondary,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // 4-Quadrant Metric Breakdown Grid
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        // Quality Score
                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = Color.White.copy(alpha = 0.85f),
                            border = BorderStroke(1.dp, BentoBorder),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("top_supplier_quality_score")
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        Icons.Default.CheckCircle,
                                        contentDescription = null,
                                        tint = StatusSuccess,
                                        modifier = Modifier.size(14.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = "Quality",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = BentoTextSecondary,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "${topSupplier?.qualityScore ?: 98.0}%",
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = BentoTextPrimary
                                )
                            }
                        }

                        // On-Time Delivery Score
                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = Color.White.copy(alpha = 0.85f),
                            border = BorderStroke(1.dp, BentoBorder),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("top_supplier_delivery_score")
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        Icons.Default.LocalShipping,
                                        contentDescription = null,
                                        tint = BluePrimary,
                                        modifier = Modifier.size(14.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = "On-Time",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = BentoTextSecondary,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "${topSupplier?.onTimeDeliveryRate ?: 99.0}%",
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = BentoTextPrimary
                                )
                            }
                        }

                        // Pricing Competitiveness
                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = Color.White.copy(alpha = 0.85f),
                            border = BorderStroke(1.dp, BentoBorder),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("top_supplier_pricing_score")
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        Icons.Default.FactCheck,
                                        contentDescription = null,
                                        tint = BentoTealOnContainer,
                                        modifier = Modifier.size(14.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = "Pricing",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = BentoTextSecondary,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "${topSupplier?.pricingScore ?: 96.0}%",
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = BentoTextPrimary
                                )
                            }
                        }

                        // Average Lead Days
                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = Color.White.copy(alpha = 0.85f),
                            border = BorderStroke(1.dp, BentoBorder),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("top_supplier_lead_time")
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        Icons.Default.Timer,
                                        contentDescription = null,
                                        tint = Color(0xFFD97706),
                                        modifier = Modifier.size(14.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = "Lead Time",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = BentoTextSecondary,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "${topSupplier?.supplier?.averageLeadDays ?: 2} Days",
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = BentoTextPrimary
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Latest Audit Feedback Snippet
                    topSupplier?.latestFeedback?.let { feedback ->
                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = BentoTealOnContainer.copy(alpha = 0.08f),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
                                verticalAlignment = Alignment.Top
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Star,
                                    contentDescription = null,
                                    tint = BentoTealOnContainer,
                                    modifier = Modifier
                                        .size(16.dp)
                                        .padding(top = 1.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "\"$feedback\"",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = BentoTealOnContainer,
                                    fontWeight = FontWeight.Medium,
                                    lineHeight = 16.sp
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Primary Action Button
                    Button(
                        onClick = { onNavigate(AppTab.SUPPLIERS) },
                        colors = ButtonDefaults.buttonColors(containerColor = BentoTealOnContainer),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("view_top_supplier_button")
                    ) {
                        Icon(Icons.Default.Store, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("View Supplier Scorecard & All Ratings", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // 8. Quick Navigation Bento Module Shortcuts
        item {
            Text(
                text = "Procurement Modules",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                item {
                    ModuleQuickButton(
                        title = "Requests",
                        desc = "Create & Approve",
                        icon = Icons.Default.Description,
                        onClick = { onNavigate(AppTab.REQUESTS) }
                    )
                }
                item {
                    ModuleQuickButton(
                        title = "Orders (PO)",
                        desc = "PO Lifecycle",
                        icon = Icons.Default.ShoppingCart,
                        onClick = { onNavigate(AppTab.ORDERS) }
                    )
                }
                item {
                    ModuleQuickButton(
                        title = "Suppliers",
                        desc = "Score & Rank",
                        icon = Icons.Default.Store,
                        onClick = { onNavigate(AppTab.SUPPLIERS) }
                    )
                }
                item {
                    ModuleQuickButton(
                        title = "Logistics",
                        desc = "Carrier Milestones",
                        icon = Icons.Default.LocalShipping,
                        onClick = { onNavigate(AppTab.DELIVERY) }
                    )
                }
                item {
                    ModuleQuickButton(
                        title = "Inventory",
                        desc = "Stock & Reorders",
                        icon = Icons.Default.Inventory,
                        onClick = { onNavigate(AppTab.INVENTORY) }
                    )
                }
                item {
                    ModuleQuickButton(
                        title = "Analytics",
                        desc = "Spend & Audit",
                        icon = Icons.Default.AccountBalance,
                        onClick = { onNavigate(AppTab.ANALYTICS) }
                    )
                }
                item {
                    ModuleQuickButton(
                        title = "API Console",
                        desc = "REST Endpoints",
                        icon = Icons.Default.Security,
                        onClick = { onNavigate(AppTab.API_CONSOLE) }
                    )
                }
            }
        }

        // 8. Live Audit Trail Stream Preview in Bento Card
        item {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "Live Audit Trail",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "View All",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.clickable { onNavigate(AppTab.ANALYTICS) }
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            Card(
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = BorderStroke(1.dp, BentoBorder),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    recentAuditLogs.take(4).forEach { log ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 6.dp),
                            verticalAlignment = Alignment.Top
                        ) {
                            Box(
                                modifier = Modifier
                                    .padding(top = 5.dp)
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(BluePrimary)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text(
                                        text = log.summary,
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                }
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = "${log.userName} (${log.userRole.displayName}) • ${formatDateTime(log.timestamp)}",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }
            }
            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}

// -------------------------------------------------------------
// BENTO SUB-COMPONENTS
// -------------------------------------------------------------

@Composable
fun PendingApprovalBentoItem(
    request: PurchaseRequestEntity,
    onClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = Color.White.copy(alpha = 0.95f),
        border = BorderStroke(1.dp, BentoBorder),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = request.requestNumber,
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.ExtraBold,
                        color = BentoTextPrimary
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    PriorityBadge(priority = request.priority)
                }
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "${request.department} • Requester: ${request.requesterName}",
                    style = MaterialTheme.typography.bodySmall,
                    color = BentoTextSecondary,
                    maxLines = 1
                )
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = formatCurrency(request.estimatedAmount),
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = "Tap to Review",
                    style = MaterialTheme.typography.labelSmall,
                    fontSize = 10.sp,
                    color = BentoAmberOnContainer,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }
    }
}

@Composable
fun InventoryAlertBentoItem(
    product: ProductEntity
) {
    Surface(
        shape = RoundedCornerShape(14.dp),
        color = Color.White.copy(alpha = 0.95f),
        border = BorderStroke(1.dp, BentoBorder),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = product.name,
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.Bold,
                    color = BentoTextPrimary,
                    maxLines = 1
                )
                Text(
                    text = "Code: ${product.productCode} • Min Level: ${product.minimumStock}",
                    style = MaterialTheme.typography.labelSmall,
                    color = BentoTextSecondary,
                    fontSize = 11.sp
                )
            }
            Surface(
                shape = RoundedCornerShape(50),
                color = BentoCoralContainer,
                border = BorderStroke(1.dp, BentoBorder)
            ) {
                Text(
                    text = "${product.availableQuantity} Left",
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.ExtraBold,
                    color = BentoCoralOnContainer,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                )
            }
        }
    }
}

@Composable
fun ActiveOrderBentoItem(
    order: PurchaseOrderEntity,
    onClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(18.dp),
        color = Color.White.copy(alpha = 0.95f),
        border = BorderStroke(1.dp, BentoBorder),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = order.poNumber,
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.ExtraBold,
                            color = BentoTextPrimary
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        OrderStatusBadge(status = order.status)
                    }
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "Supplier: ${order.supplierName}",
                        style = MaterialTheme.typography.bodySmall,
                        color = BentoTextSecondary,
                        maxLines = 1
                    )
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = formatCurrency(order.totalAmount),
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = BentoBlueOnContainer
                    )
                    Text(
                        text = "View Details",
                        style = MaterialTheme.typography.labelSmall,
                        fontSize = 10.sp,
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Step Indicator Visual Tracker
            PurchaseOrderStatusTrackerCompact(order = order)
        }
    }
}

@Composable
fun ModuleQuickButton(
    title: String,
    desc: String,
    icon: ImageVector,
    onClick: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(1.dp, BentoBorder),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
        modifier = Modifier
            .width(160.dp)
            .clickable { onClick() }
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(BentoBlueContainer),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = BentoBlueOnContainer,
                    modifier = Modifier.size(20.dp)
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = title,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                maxLines = 1
            )
            Text(
                text = desc,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontSize = 11.sp
            )
        }
    }
}
