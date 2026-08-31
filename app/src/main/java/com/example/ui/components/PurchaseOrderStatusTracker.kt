package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Inventory
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Store
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.entity.PurchaseOrderEntity
import com.example.data.model.OrderStatus
import com.example.ui.theme.BentoBorder
import com.example.ui.theme.BentoBlueContainer
import com.example.ui.theme.BentoBlueOnContainer
import com.example.ui.theme.BentoMintContainer
import com.example.ui.theme.BentoMintOnContainer
import com.example.ui.theme.BentoTextPrimary
import com.example.ui.theme.BentoTextSecondary
import com.example.ui.theme.BluePrimary
import com.example.ui.theme.BluePrimaryLight
import com.example.ui.theme.Slate200
import com.example.ui.theme.Slate300
import com.example.ui.theme.Slate400
import com.example.ui.theme.Slate600
import com.example.ui.theme.Slate900
import com.example.ui.theme.StatusError
import com.example.ui.theme.StatusErrorContainer
import com.example.ui.theme.StatusSuccess
import com.example.ui.theme.StatusSuccessContainer
import com.example.ui.theme.StatusWarning
import com.example.ui.theme.TealAccent

/**
 * 5 Standard Progression Milestones for Purchase Orders
 */
enum class PoLifecycleStep(
    val stepNumber: Int,
    val title: String,
    val shortLabel: String,
    val icon: ImageVector,
    val description: String
) {
    REQUESTED(
        stepNumber = 1,
        title = "Requested",
        shortLabel = "Requested",
        icon = Icons.Default.Description,
        description = "Requisition created & PR approved"
    ),
    APPROVED(
        stepNumber = 2,
        title = "PO Issued",
        shortLabel = "PO Issued",
        icon = Icons.Default.Verified,
        description = "Purchase order approved & sent to vendor"
    ),
    CONFIRMED(
        stepNumber = 3,
        title = "Confirmed",
        shortLabel = "Vendor Confirmed",
        icon = Icons.Default.Store,
        description = "Supplier accepted order & preparing batch"
    ),
    DISPATCHED(
        stepNumber = 4,
        title = "Dispatched",
        shortLabel = "In Transit",
        icon = Icons.Default.LocalShipping,
        description = "Shipment in transit with logistics carrier"
    ),
    DELIVERED(
        stepNumber = 5,
        title = "Delivered",
        shortLabel = "Delivered",
        icon = Icons.Default.CheckCircle,
        description = "Received at dock & inventory inwarded"
    )
}

enum class StepProgressState {
    COMPLETED,
    CURRENT_ACTIVE,
    PENDING,
    ERROR_CANCELLED
}

data class PoStepStatusInfo(
    val currentStep: PoLifecycleStep,
    val currentStepIndex: Int, // 0..4
    val progressPercentage: Float, // 0.0f..1.0f
    val isCancelledOrRejected: Boolean,
    val statusHeadline: String,
    val statusSubtext: String,
    val stepStates: List<StepProgressState>
)

/**
 * Calculate the step progression data for any OrderStatus
 */
fun getPoProgressionInfo(order: PurchaseOrderEntity): PoStepStatusInfo {
    val status = order.status
    val isCancelled = status == OrderStatus.CANCELLED
    val isRejected = status == OrderStatus.SUPPLIER_REJECTED

    if (isCancelled || isRejected) {
        val failedStepIndex = if (isRejected) 2 else 1
        val states = List(5) { idx ->
            when {
                idx < failedStepIndex -> StepProgressState.COMPLETED
                idx == failedStepIndex -> StepProgressState.ERROR_CANCELLED
                else -> StepProgressState.PENDING
            }
        }
        return PoStepStatusInfo(
            currentStep = PoLifecycleStep.values()[failedStepIndex],
            currentStepIndex = failedStepIndex,
            progressPercentage = (failedStepIndex) / 4f,
            isCancelledOrRejected = true,
            statusHeadline = if (isRejected) "Supplier Rejected Order" else "Purchase Order Cancelled",
            statusSubtext = if (isRejected) "Order was declined by vendor during review" else "Order was aborted and marked cancelled",
            stepStates = states
        )
    }

    val (stepIndex, headline, subtext) = when (status) {
        OrderStatus.DRAFT -> Triple(
            0,
            "Requisition Drafted",
            "PO draft awaiting submission and manager approval"
        )
        OrderStatus.PENDING_APPROVAL -> Triple(
            1,
            "Manager Approval Pending",
            "Submitted for executive authorization"
        )
        OrderStatus.APPROVED -> Triple(
            1,
            "Approved & Ready to Dispatch",
            "PO approved, transmitting to supplier"
        )
        OrderStatus.SENT_TO_SUPPLIER -> Triple(
            2,
            "Awaiting Supplier Confirmation",
            "Transmitted to ${order.supplierName} • Vendor review pending"
        )
        OrderStatus.SUPPLIER_ACCEPTED -> Triple(
            2,
            "Supplier Confirmed & Accepted",
            "Accepted by ${order.supplierName} • Order in prep"
        )
        OrderStatus.PROCESSING -> Triple(
            2,
            "Order In Production / Packing",
            "Supplier packing order lines at warehouse"
        )
        OrderStatus.DISPATCHED -> Triple(
            3,
            "Dispatched from Vendor Hub",
            if (!order.carrier.isNullOrBlank() && !order.trackingNumber.isNullOrBlank())
                "Shipped via ${order.carrier} (${order.trackingNumber})"
            else
                "Dispatched with logistics carrier"
        )
        OrderStatus.IN_TRANSIT -> Triple(
            3,
            "Shipment In Transit",
            if (!order.trackingNumber.isNullOrBlank())
                "Tracking #${order.trackingNumber} • En route to receiving dock"
            else
                "In transit to receiving facility"
        )
        OrderStatus.OUT_FOR_DELIVERY -> Triple(
            3,
            "Out for Delivery Today",
            "Courier is delivering package to receiving warehouse"
        )
        OrderStatus.DELIVERED, OrderStatus.COMPLETED -> Triple(
            4,
            "Delivered & Inventory Inwarded",
            "Dock verified, QC passed, and inventory updated"
        )
        else -> Triple(
            0,
            status.displayName,
            "Order status: ${status.displayName}"
        )
    }

    val states = List(5) { idx ->
        when {
            idx < stepIndex -> StepProgressState.COMPLETED
            idx == stepIndex -> {
                if (status == OrderStatus.DELIVERED || status == OrderStatus.COMPLETED) {
                    StepProgressState.COMPLETED
                } else {
                    StepProgressState.CURRENT_ACTIVE
                }
            }
            else -> StepProgressState.PENDING
        }
    }

    val progress = if (status == OrderStatus.DELIVERED || status == OrderStatus.COMPLETED) {
        1.0f
    } else {
        (stepIndex + 0.5f) / 5f
    }

    return PoStepStatusInfo(
        currentStep = PoLifecycleStep.values()[stepIndex],
        currentStepIndex = stepIndex,
        progressPercentage = progress,
        isCancelledOrRejected = false,
        statusHeadline = headline,
        statusSubtext = subtext,
        stepStates = states
    )
}

/**
 * -----------------------------------------------------------------------------------------
 * 1. COMPACT STATUS TRACKER COMPONENT (Ideal for Order Cards, Dashboard & Bento Widgets)
 * -----------------------------------------------------------------------------------------
 */
@Composable
fun PurchaseOrderStatusTrackerCompact(
    order: PurchaseOrderEntity,
    modifier: Modifier = Modifier
) {
    val progressInfo = getPoProgressionInfo(order)
    val steps = PoLifecycleStep.values()

    Surface(
        shape = RoundedCornerShape(14.dp),
        color = if (progressInfo.isCancelledOrRejected) StatusErrorContainer.copy(alpha = 0.4f) else BentoBlueContainer.copy(alpha = 0.35f),
        border = BorderStroke(1.dp, if (progressInfo.isCancelledOrRejected) StatusError.copy(alpha = 0.3f) else BentoBorder),
        modifier = modifier
            .fillMaxWidth()
            .testTag("po_status_tracker_compact_${order.poNumber.lowercase()}")
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 10.dp)
        ) {
            // Header Row: Status Label & Stage Count
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(
                                when {
                                    progressInfo.isCancelledOrRejected -> StatusError
                                    order.status == OrderStatus.DELIVERED || order.status == OrderStatus.COMPLETED -> StatusSuccess
                                    else -> BluePrimary
                                }
                            )
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = progressInfo.statusHeadline,
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        color = if (progressInfo.isCancelledOrRejected) StatusError else BentoTextPrimary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                Text(
                    text = if (progressInfo.isCancelledOrRejected) "Declined" else "Step ${progressInfo.currentStepIndex + 1} of 5",
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.ExtraBold,
                    color = if (progressInfo.isCancelledOrRejected) StatusError else BluePrimary,
                    fontSize = 11.sp
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Step Indicator Segmented Track
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                steps.forEachIndexed { index, step ->
                    val state = progressInfo.stepStates[index]
                    val segmentColor = when (state) {
                        StepProgressState.COMPLETED -> StatusSuccess
                        StepProgressState.CURRENT_ACTIVE -> BluePrimary
                        StepProgressState.ERROR_CANCELLED -> StatusError
                        StepProgressState.PENDING -> Slate200
                    }

                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(6.dp)
                            .clip(RoundedCornerShape(50))
                            .background(segmentColor)
                            .testTag("po_compact_step_${step.name.lowercase()}_${state.name.lowercase()}")
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            // Step Labels Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "1. Requested",
                    style = MaterialTheme.typography.labelSmall,
                    fontSize = 10.sp,
                    color = if (progressInfo.currentStepIndex >= 0) BentoTextPrimary else Slate400,
                    fontWeight = if (progressInfo.currentStepIndex == 0) FontWeight.Bold else FontWeight.Normal
                )
                Text(
                    text = "3. Confirmed",
                    style = MaterialTheme.typography.labelSmall,
                    fontSize = 10.sp,
                    color = if (progressInfo.currentStepIndex >= 2) BentoTextPrimary else Slate400,
                    fontWeight = if (progressInfo.currentStepIndex == 2) FontWeight.Bold else FontWeight.Normal
                )
                Text(
                    text = "5. Delivered",
                    style = MaterialTheme.typography.labelSmall,
                    fontSize = 10.sp,
                    color = if (progressInfo.currentStepIndex >= 4 || order.status == OrderStatus.DELIVERED) StatusSuccess else Slate400,
                    fontWeight = if (progressInfo.currentStepIndex == 4) FontWeight.Bold else FontWeight.Normal
                )
            }
        }
    }
}

/**
 * -----------------------------------------------------------------------------------------
 * 2. FULL INTERACTIVE STATUS TRACKER COMPONENT (Horizontal Step-Indicator with Connected Nodes)
 * -----------------------------------------------------------------------------------------
 */
@Composable
fun PurchaseOrderStatusTracker(
    order: PurchaseOrderEntity,
    modifier: Modifier = Modifier,
    showContainerCard: Boolean = true
) {
    val progressInfo = getPoProgressionInfo(order)
    val steps = PoLifecycleStep.values()

    val content = @Composable {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .testTag("po_status_tracker_${order.poNumber.lowercase()}")
        ) {
            // Milestone Header
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column {
                    Text(
                        text = "Order Lifecycle Progress",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.Bold,
                        color = BentoTextPrimary
                    )
                    Text(
                        text = "From Requisition to Dock Inwarding",
                        style = MaterialTheme.typography.bodySmall,
                        color = BentoTextSecondary,
                        fontSize = 11.sp
                    )
                }

                Surface(
                    shape = RoundedCornerShape(50),
                    color = if (progressInfo.isCancelledOrRejected) StatusErrorContainer else BentoMintContainer,
                    border = BorderStroke(1.dp, if (progressInfo.isCancelledOrRejected) StatusError.copy(alpha = 0.2f) else BentoBorder)
                ) {
                    Text(
                        text = if (progressInfo.isCancelledOrRejected) "TERMINATED" else "${(progressInfo.progressPercentage * 100).toInt()}% COMPLETE",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.ExtraBold,
                        color = if (progressInfo.isCancelledOrRejected) StatusError else BentoMintOnContainer,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Step Indicator Nodes with Connecting Lines
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                steps.forEachIndexed { index, step ->
                    val state = progressInfo.stepStates[index]

                    // Step Node (Circle with Icon / Number)
                    StepNodeIndicator(
                        step = step,
                        state = state,
                        isFinalStep = index == steps.lastIndex,
                        modifier = Modifier.testTag("po_step_node_${step.name.lowercase()}")
                    )

                    // Connecting Line (between nodes)
                    if (index < steps.lastIndex) {
                        val nextState = progressInfo.stepStates[index + 1]
                        val lineActive = state == StepProgressState.COMPLETED
                        val isLineFailed = state == StepProgressState.ERROR_CANCELLED || nextState == StepProgressState.ERROR_CANCELLED

                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .height(3.dp)
                                .padding(horizontal = 2.dp)
                                .clip(RoundedCornerShape(50))
                                .background(
                                    when {
                                        isLineFailed -> StatusError.copy(alpha = 0.5f)
                                        lineActive -> StatusSuccess
                                        state == StepProgressState.CURRENT_ACTIVE -> BluePrimary.copy(alpha = 0.4f)
                                        else -> Slate200
                                    }
                                )
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Step Labels & Titles Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                steps.forEachIndexed { index, step ->
                    val state = progressInfo.stepStates[index]
                    val textColor = when (state) {
                        StepProgressState.COMPLETED -> StatusSuccess
                        StepProgressState.CURRENT_ACTIVE -> BluePrimary
                        StepProgressState.ERROR_CANCELLED -> StatusError
                        StepProgressState.PENDING -> Slate400
                    }
                    val isBold = state == StepProgressState.CURRENT_ACTIVE || state == StepProgressState.COMPLETED

                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.width(58.dp)
                    ) {
                        Text(
                            text = step.shortLabel,
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = if (isBold) FontWeight.ExtraBold else FontWeight.Medium,
                            color = textColor,
                            fontSize = 10.sp,
                            textAlign = TextAlign.Center,
                            maxLines = 1
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Active Stage Callout Card
            Surface(
                shape = RoundedCornerShape(14.dp),
                color = when {
                    progressInfo.isCancelledOrRejected -> StatusErrorContainer.copy(alpha = 0.5f)
                    order.status == OrderStatus.DELIVERED || order.status == OrderStatus.COMPLETED -> StatusSuccessContainer.copy(alpha = 0.45f)
                    else -> BentoBlueContainer.copy(alpha = 0.5f)
                },
                border = BorderStroke(
                    1.dp,
                    when {
                        progressInfo.isCancelledOrRejected -> StatusError.copy(alpha = 0.3f)
                        order.status == OrderStatus.DELIVERED || order.status == OrderStatus.COMPLETED -> StatusSuccess.copy(alpha = 0.3f)
                        else -> BluePrimary.copy(alpha = 0.2f)
                    }
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(34.dp)
                            .clip(CircleShape)
                            .background(
                                when {
                                    progressInfo.isCancelledOrRejected -> StatusError
                                    order.status == OrderStatus.DELIVERED || order.status == OrderStatus.COMPLETED -> StatusSuccess
                                    else -> BluePrimary
                                }
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = when {
                                progressInfo.isCancelledOrRejected -> Icons.Default.Close
                                order.status == OrderStatus.DELIVERED || order.status == OrderStatus.COMPLETED -> Icons.Default.Check
                                else -> progressInfo.currentStep.icon
                            },
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(10.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = progressInfo.statusHeadline,
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            color = when {
                                progressInfo.isCancelledOrRejected -> StatusError
                                order.status == OrderStatus.DELIVERED || order.status == OrderStatus.COMPLETED -> StatusSuccess
                                else -> BentoBlueOnContainer
                            }
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = progressInfo.statusSubtext,
                            style = MaterialTheme.typography.bodySmall,
                            color = BentoTextSecondary,
                            fontSize = 11.sp,
                            lineHeight = 15.sp
                        )
                    }
                }
            }
        }
    }

    if (showContainerCard) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            border = BorderStroke(1.dp, BentoBorder),
            elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
            modifier = modifier.fillMaxWidth()
        ) {
            Box(modifier = Modifier.padding(16.dp)) {
                content()
            }
        }
    } else {
        content()
    }
}

/**
 * Individual Node in the Horizontal Step Indicator
 */
@Composable
fun StepNodeIndicator(
    step: PoLifecycleStep,
    state: StepProgressState,
    isFinalStep: Boolean,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1.0f,
        targetValue = 1.12f,
        animationSpec = infiniteRepeatable(
            animation = tween(900, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scale"
    )

    val nodeScale = if (state == StepProgressState.CURRENT_ACTIVE) pulseScale else 1.0f

    Box(
        modifier = modifier
            .size(36.dp)
            .scale(nodeScale)
            .clip(CircleShape)
            .background(
                when (state) {
                    StepProgressState.COMPLETED -> StatusSuccess
                    StepProgressState.CURRENT_ACTIVE -> BluePrimary
                    StepProgressState.ERROR_CANCELLED -> StatusError
                    StepProgressState.PENDING -> Slate200
                }
            )
            .border(
                width = if (state == StepProgressState.CURRENT_ACTIVE) 2.dp else 1.dp,
                color = when (state) {
                    StepProgressState.CURRENT_ACTIVE -> BluePrimaryLight
                    StepProgressState.COMPLETED -> StatusSuccess
                    StepProgressState.ERROR_CANCELLED -> StatusError
                    StepProgressState.PENDING -> Slate300
                },
                shape = CircleShape
            ),
        contentAlignment = Alignment.Center
    ) {
        when (state) {
            StepProgressState.COMPLETED -> {
                Icon(
                    imageVector = Icons.Default.Check,
                    contentDescription = "Completed ${step.title}",
                    tint = Color.White,
                    modifier = Modifier.size(18.dp)
                )
            }
            StepProgressState.ERROR_CANCELLED -> {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "Cancelled",
                    tint = Color.White,
                    modifier = Modifier.size(18.dp)
                )
            }
            StepProgressState.CURRENT_ACTIVE -> {
                Icon(
                    imageVector = step.icon,
                    contentDescription = "Active ${step.title}",
                    tint = Color.White,
                    modifier = Modifier.size(18.dp)
                )
            }
            StepProgressState.PENDING -> {
                Text(
                    text = "${step.stepNumber}",
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.Bold,
                    color = Slate600
                )
            }
        }
    }
}

/**
 * -----------------------------------------------------------------------------------------
 * 3. DETAILED VERTICAL TIMELINE STATUS TRACKER (Ideal for PO Details Dialogs & In-Depth Views)
 * -----------------------------------------------------------------------------------------
 */
@Composable
fun PurchaseOrderStatusTimeline(
    order: PurchaseOrderEntity,
    modifier: Modifier = Modifier
) {
    val progressInfo = getPoProgressionInfo(order)
    val steps = PoLifecycleStep.values()

    Column(
        modifier = modifier
            .fillMaxWidth()
            .testTag("po_status_tracker_timeline_${order.poNumber.lowercase()}"),
        verticalArrangement = Arrangement.spacedBy(0.dp)
    ) {
        Text(
            text = "Fulfillment Pipeline Steps",
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold,
            color = BentoTextPrimary
        )
        Spacer(modifier = Modifier.height(10.dp))

        steps.forEachIndexed { index, step ->
            val state = progressInfo.stepStates[index]
            val isLast = index == steps.lastIndex

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.Top
            ) {
                // Left Column: Node & Vertical Line
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.width(32.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(24.dp)
                            .clip(CircleShape)
                            .background(
                                when (state) {
                                    StepProgressState.COMPLETED -> StatusSuccess
                                    StepProgressState.CURRENT_ACTIVE -> BluePrimary
                                    StepProgressState.ERROR_CANCELLED -> StatusError
                                    StepProgressState.PENDING -> Slate200
                                }
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        when (state) {
                            StepProgressState.COMPLETED -> {
                                Icon(Icons.Default.Check, contentDescription = null, tint = Color.White, modifier = Modifier.size(14.dp))
                            }
                            StepProgressState.CURRENT_ACTIVE -> {
                                Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(Color.White))
                            }
                            StepProgressState.ERROR_CANCELLED -> {
                                Icon(Icons.Default.Close, contentDescription = null, tint = Color.White, modifier = Modifier.size(14.dp))
                            }
                            StepProgressState.PENDING -> {
                                Text("${step.stepNumber}", fontSize = 10.sp, color = Slate600, fontWeight = FontWeight.Bold)
                            }
                        }
                    }

                    if (!isLast) {
                        Box(
                            modifier = Modifier
                                .width(2.dp)
                                .height(44.dp)
                                .background(
                                    if (state == StepProgressState.COMPLETED) StatusSuccess else Slate200
                                )
                        )
                    }
                }

                Spacer(modifier = Modifier.width(10.dp))

                // Right Column: Milestone Details
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .padding(bottom = if (isLast) 0.dp else 12.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = "${step.stepNumber}. ${step.title}",
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = if (state == StepProgressState.CURRENT_ACTIVE) FontWeight.ExtraBold else FontWeight.SemiBold,
                            color = when (state) {
                                StepProgressState.COMPLETED -> StatusSuccess
                                StepProgressState.CURRENT_ACTIVE -> BluePrimary
                                StepProgressState.ERROR_CANCELLED -> StatusError
                                StepProgressState.PENDING -> Slate400
                            }
                        )

                        Surface(
                            shape = RoundedCornerShape(50),
                            color = when (state) {
                                StepProgressState.COMPLETED -> StatusSuccessContainer
                                StepProgressState.CURRENT_ACTIVE -> BentoBlueContainer
                                StepProgressState.ERROR_CANCELLED -> StatusErrorContainer
                                StepProgressState.PENDING -> Slate200
                            }
                        ) {
                            Text(
                                text = when (state) {
                                    StepProgressState.COMPLETED -> "Done"
                                    StepProgressState.CURRENT_ACTIVE -> "In Progress"
                                    StepProgressState.ERROR_CANCELLED -> "Failed"
                                    StepProgressState.PENDING -> "Pending"
                                },
                                style = MaterialTheme.typography.labelSmall,
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                color = when (state) {
                                    StepProgressState.COMPLETED -> StatusSuccess
                                    StepProgressState.CURRENT_ACTIVE -> BluePrimary
                                    StepProgressState.ERROR_CANCELLED -> StatusError
                                    StepProgressState.PENDING -> Slate600
                                },
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(2.dp))

                    Text(
                        text = when (step) {
                            PoLifecycleStep.REQUESTED -> "Requisition approved & converted from PR (${order.requestNumber.ifEmpty { "Direct PO" }})"
                            PoLifecycleStep.APPROVED -> "Approved by procurement manager on ${formatDate(order.orderDate)}"
                            PoLifecycleStep.CONFIRMED -> "Supplier: ${order.supplierName} • Commercial terms accepted"
                            PoLifecycleStep.DISPATCHED -> if (!order.trackingNumber.isNullOrBlank())
                                "Carrier: ${order.carrier ?: "Standard Logistics"} • AWB: ${order.trackingNumber}"
                            else
                                "Shipment dispatch & tracking generation"
                            PoLifecycleStep.DELIVERED -> "Dock receipt inspection & stock inwarding (Exp: ${formatDate(order.expectedDeliveryDate)})"
                        },
                        style = MaterialTheme.typography.bodySmall,
                        color = if (state == StepProgressState.PENDING) Slate400 else BentoTextSecondary,
                        fontSize = 11.sp
                    )
                }
            }
        }
    }
}
