package com.example.ui.components

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
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Draw
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.FactCheck
import androidx.compose.material.icons.filled.Gavel
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Pending
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.entity.PurchaseOrderEntity
import com.example.data.entity.UserEntity
import com.example.data.model.OrderStatus
import com.example.data.workflow.PoApprovalStepInfo
import com.example.data.workflow.PoApprovalTier
import com.example.data.workflow.PoApprovalWorkflowEngine
import com.example.ui.theme.BentoBorder
import com.example.ui.theme.BentoBlueContainer
import com.example.ui.theme.BentoBlueOnContainer
import com.example.ui.theme.BluePrimary
import com.example.ui.theme.StatusError
import com.example.ui.theme.StatusSuccess
import com.example.ui.theme.StatusWarning
import com.example.ui.theme.TealAccent

/**
 * Compact Hierarchical Approval Progress Summary shown on PO Cards
 */
@Composable
fun PoHierarchicalApprovalSummary(
    order: PurchaseOrderEntity,
    modifier: Modifier = Modifier
) {
    val steps = PoApprovalWorkflowEngine.parseSignatures(order.approvalSignaturesJson, order.totalAmount)
    val signedCount = steps.count { it.isSigned }
    val totalSteps = steps.size
    val tier = PoApprovalWorkflowEngine.determineTier(order.totalAmount)

    Surface(
        shape = RoundedCornerShape(10.dp),
        color = if (order.isFullyApproved) {
            Color(0xFFE8F5E9)
        } else if (order.status == OrderStatus.CANCELLED) {
            Color(0xFFFFEBEE)
        } else {
            Color(0xFFEDE7F6)
        },
        border = BorderStroke(
            1.dp,
            if (order.isFullyApproved) StatusSuccess.copy(alpha = 0.4f)
            else if (order.status == OrderStatus.CANCELLED) StatusError.copy(alpha = 0.4f)
            else Color(0xFF673AB7).copy(alpha = 0.3f)
        ),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(10.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = if (order.isFullyApproved) Icons.Default.VerifiedUser
                        else if (order.status == OrderStatus.CANCELLED) Icons.Default.ErrorOutline
                        else Icons.Default.Security,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = if (order.isFullyApproved) StatusSuccess
                        else if (order.status == OrderStatus.CANCELLED) StatusError
                        else Color(0xFF512DA8)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = tier.tierCode,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (order.isFullyApproved) Color(0xFF2E7D32) else Color(0xFF512DA8)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "• ${tier.title.split(":").getOrNull(1)?.trim() ?: tier.title}",
                        fontSize = 11.sp,
                        color = Color(0xFF424242)
                    )
                }

                Surface(
                    shape = RoundedCornerShape(50),
                    color = if (order.isFullyApproved) Color(0xFFC8E6C9) else Color(0xFFD1C4E9)
                ) {
                    Text(
                        text = if (order.isFullyApproved) "Fully Signed ($signedCount/$totalSteps)"
                        else if (order.status == OrderStatus.CANCELLED) "Rejected"
                        else "$signedCount of $totalSteps Signed",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (order.isFullyApproved) Color(0xFF1B5E20) else Color(0xFF311B92),
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            // Signature Steps Mini Stepper
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                steps.forEachIndexed { index, step ->
                    val isCurrentPending = !order.isFullyApproved && !step.isSigned && (index == 0 || steps[index - 1].isSigned)
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(6.dp)
                            .clip(RoundedCornerShape(3.dp))
                            .background(
                                when {
                                    step.isSigned -> StatusSuccess
                                    isCurrentPending -> Color(0xFFFFA000)
                                    else -> Color(0xFFE0E0E0)
                                }
                            )
                    )
                }
            }

            if (!order.isFullyApproved && order.status == OrderStatus.PENDING_APPROVAL) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Awaiting: Level ${order.currentApprovalLevel} (${order.pendingRoleName})",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFFD84315)
                )
            }
        }
    }
}

/**
 * Detailed Hierarchical Signature Chain & Authorization Panel
 */
@Composable
fun PoHierarchicalApprovalDetailChain(
    order: PurchaseOrderEntity,
    currentUser: UserEntity?,
    onApproveClick: (step: PoApprovalStepInfo) -> Unit,
    onRejectClick: (order: PurchaseOrderEntity) -> Unit,
    modifier: Modifier = Modifier
) {
    val steps = PoApprovalWorkflowEngine.parseSignatures(order.approvalSignaturesJson, order.totalAmount)
    val tier = PoApprovalWorkflowEngine.determineTier(order.totalAmount)
    val currentLevelIndex = (order.currentApprovalLevel - 1).coerceIn(0, steps.lastIndex)
    val currentPendingStep = steps.getOrNull(currentLevelIndex)
    val canUserSign = currentUser != null && PoApprovalWorkflowEngine.canUserSignCurrentLevel(order, currentUser, currentPendingStep)

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(1.dp, BentoBorder),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .background(Color(0xFFEDE7F6), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Gavel,
                            contentDescription = null,
                            tint = Color(0xFF512DA8),
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = "Approval Hierarchy Matrix",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "${tier.title} • ${steps.size} Signature Threshold",
                            fontSize = 11.sp,
                            color = Color(0xFF512DA8),
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = Color(0xFFF3E5F5),
                    border = BorderStroke(1.dp, Color(0xFFBA68C8))
                ) {
                    Text(
                        text = tier.tierCode,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF7B1FA2),
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Value Threshold Notice
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = tier.description,
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Step-by-Step Hierarchical Signatures
            steps.forEachIndexed { index, step ->
                val isCurrent = !order.isFullyApproved && !step.isSigned && (index == 0 || steps[index - 1].isSigned)
                val isUpcoming = !step.isSigned && !isCurrent

                PoApprovalStepRow(
                    step = step,
                    isCurrent = isCurrent,
                    isUpcoming = isUpcoming,
                    isLast = index == steps.lastIndex
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Current Action Bar / Notice
            if (order.status == OrderStatus.PENDING_APPROVAL && !order.isFullyApproved) {
                if (canUserSign && currentPendingStep != null) {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = Color(0xFFE8F5E9),
                        border = BorderStroke(1.dp, StatusSuccess.copy(alpha = 0.5f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.VerifiedUser,
                                    contentDescription = null,
                                    tint = StatusSuccess,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Your Signature is Required (${currentPendingStep.shortRoleTitle})",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF1B5E20)
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "As ${currentUser?.name} (${currentUser?.role?.displayName}), you have delegated signing authority for Level ${currentPendingStep.level}.",
                                fontSize = 11.sp,
                                color = Color(0xFF2E7D32)
                            )
                            Spacer(modifier = Modifier.height(10.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                OutlinedButton(
                                    onClick = { onRejectClick(order) },
                                    colors = ButtonDefaults.outlinedButtonColors(contentColor = StatusError),
                                    border = BorderStroke(1.dp, StatusError.copy(alpha = 0.5f)),
                                    modifier = Modifier
                                        .weight(1f)
                                        .testTag("po_reject_button")
                                ) {
                                    Icon(Icons.Default.Close, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Reject PO", fontSize = 12.sp)
                                }

                                Button(
                                    onClick = { onApproveClick(currentPendingStep) },
                                    colors = ButtonDefaults.buttonColors(containerColor = StatusSuccess),
                                    modifier = Modifier
                                        .weight(1.5f)
                                        .testTag("po_sign_level_button")
                                ) {
                                    Icon(Icons.Default.Draw, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Sign Level ${currentPendingStep.level}", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                } else {
                    // Informative persona switcher guide
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = Color(0xFFFFF3E0),
                        border = BorderStroke(1.dp, Color(0xFFFFB74D)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.Lock,
                                    contentDescription = null,
                                    tint = Color(0xFFE65100),
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Awaiting Level ${order.currentApprovalLevel} Sign-Off",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFFBF360C)
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Current level requires ${currentPendingStep?.requiredRole?.displayName ?: "Authorized Signer"} authority. Switch persona using the profile menu in top bar to test signing.",
                                fontSize = 11.sp,
                                color = Color(0xFFE65100)
                            )
                        }
                    }
                }
            } else if (order.isFullyApproved) {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFFE8F5E9),
                    border = BorderStroke(1.dp, StatusSuccess.copy(alpha = 0.5f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.VerifiedUser,
                            contentDescription = null,
                            tint = StatusSuccess,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Fully Authorized & Released to Supplier",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF1B5E20)
                            )
                            Text(
                                text = "All ${steps.size} threshold levels successfully signed and cryptographically certified.",
                                fontSize = 11.sp,
                                color = Color(0xFF2E7D32)
                            )
                        }
                    }
                }
            }
        }
    }
}

/**
 * Individual Approval Step Row in Hierarchical View
 */
@Composable
private fun PoApprovalStepRow(
    step: PoApprovalStepInfo,
    isCurrent: Boolean,
    isUpcoming: Boolean,
    isLast: Boolean
) {
    Row(
        modifier = Modifier.fillMaxWidth()
    ) {
        // Vertical Timeline Line + Node
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.width(32.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(28.dp)
                    .background(
                        color = when {
                            step.isSigned -> StatusSuccess
                            isCurrent -> Color(0xFFFFA000)
                            else -> MaterialTheme.colorScheme.surfaceVariant
                        },
                        shape = CircleShape
                    )
                    .border(
                        2.dp,
                        if (isCurrent) Color(0xFFFF8F00) else Color.Transparent,
                        CircleShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                if (step.isSigned) {
                    Icon(
                        imageVector = Icons.Default.Check,
                        contentDescription = "Signed",
                        tint = Color.White,
                        modifier = Modifier.size(16.dp)
                    )
                } else if (isCurrent) {
                    Icon(
                        imageVector = Icons.Default.Draw,
                        contentDescription = "Current Pending",
                        tint = Color.White,
                        modifier = Modifier.size(14.dp)
                    )
                } else {
                    Text(
                        text = "${step.level}",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            if (!isLast) {
                Box(
                    modifier = Modifier
                        .width(2.dp)
                        .height(54.dp)
                        .background(
                            if (step.isSigned) StatusSuccess.copy(alpha = 0.5f)
                            else MaterialTheme.colorScheme.outlineVariant
                        )
                )
            }
        }

        Spacer(modifier = Modifier.width(10.dp))

        // Step Content Card
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = if (isLast) 0.dp else 12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = step.title,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (step.isSigned) MaterialTheme.colorScheme.onSurface
                    else if (isCurrent) Color(0xFFE65100)
                    else MaterialTheme.colorScheme.onSurfaceVariant
                )

                Surface(
                    shape = RoundedCornerShape(50),
                    color = when {
                        step.isSigned -> Color(0xFFE8F5E9)
                        isCurrent -> Color(0xFFFFF3E0)
                        else -> MaterialTheme.colorScheme.surfaceVariant
                    }
                ) {
                    Text(
                        text = when {
                            step.isSigned -> "SIGNED"
                            isCurrent -> "ACTION REQUIRED"
                            else -> "PENDING"
                        },
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        color = when {
                            step.isSigned -> Color(0xFF2E7D32)
                            isCurrent -> Color(0xFFE65100)
                            else -> Color(0xFF757575)
                        },
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            Text(
                text = "Delegated Authority: ${step.shortRoleTitle} (${step.authorityScope})",
                fontSize = 11.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            if (step.isSigned) {
                Spacer(modifier = Modifier.height(4.dp))
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = Color(0xFFF1F8E9),
                    border = BorderStroke(1.dp, Color(0xFFC5E1A5)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(8.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "Signed by: ${step.signerName} (${step.signerRole})",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0xFF1B5E20)
                            )
                            if (step.signedAt != null) {
                                Text(
                                    text = formatDateTime(step.signedAt),
                                    fontSize = 10.sp,
                                    color = Color(0xFF558B2F)
                                )
                            }
                        }
                        if (!step.remarks.isNullOrBlank()) {
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "\"${step.remarks}\"",
                                fontSize = 10.sp,
                                color = Color(0xFF33691E)
                            )
                        }
                        if (!step.signatureCertificate.isNullOrBlank()) {
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Digital Certificate: ${step.signatureCertificate}",
                                fontSize = 9.sp,
                                fontFamily = FontFamily.Monospace,
                                color = Color(0xFF37474F)
                            )
                        }
                    }
                }
            }
        }
    }
}

/**
 * Digital Signature Dialog for signing a PO tier level
 */
@Composable
fun PoDigitalSignatureDialog(
    order: PurchaseOrderEntity,
    step: PoApprovalStepInfo,
    currentUser: UserEntity,
    onDismiss: () -> Unit,
    onConfirmSign: (remarks: String) -> Unit
) {
    var remarks by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Draw,
                    contentDescription = null,
                    tint = StatusSuccess,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Sign ${step.title}",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        },
        text = {
            Column {
                Text(
                    text = "You are executing a binding electronic authorization for Purchase Order ${order.poNumber}.",
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(10.dp))

                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = Color(0xFFE8F5E9),
                    border = BorderStroke(1.dp, StatusSuccess.copy(alpha = 0.4f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Text(
                            text = "Signer: ${currentUser.name} (${currentUser.role.displayName})",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF1B5E20)
                        )
                        Text(
                            text = "PO Total: ${formatCurrency(order.totalAmount)}",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFF2E7D32)
                        )
                        Text(
                            text = "Scope: ${step.authorityScope}",
                            fontSize = 11.sp,
                            color = Color(0xFF33691E)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = remarks,
                    onValueChange = { remarks = it },
                    label = { Text("Approval Remarks & Notes") },
                    placeholder = { Text("e.g. Budget verified, vendor compliance confirmed.") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("po_signature_remarks_input"),
                    minLines = 2,
                    maxLines = 4
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onConfirmSign(remarks)
                },
                colors = ButtonDefaults.buttonColors(containerColor = StatusSuccess),
                modifier = Modifier.testTag("confirm_po_signature_button")
            ) {
                Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Execute Signature")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

/**
 * Rejection dialog for rejecting a PO in hierarchy
 */
@Composable
fun PoRejectionDialog(
    order: PurchaseOrderEntity,
    onDismiss: () -> Unit,
    onConfirmReject: (reason: String) -> Unit
) {
    var reason by remember { mutableStateOf("") }
    var hasError by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = null,
                    tint = StatusError,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Reject Purchase Order",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = StatusError
                )
            }
        },
        text = {
            Column {
                Text(
                    text = "Are you sure you want to reject ${order.poNumber}? This will cancel the requisition and notify the creator.",
                    fontSize = 13.sp
                )
                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = reason,
                    onValueChange = {
                        reason = it
                        if (it.isNotBlank()) hasError = false
                    },
                    label = { Text("Reason for Rejection *") },
                    placeholder = { Text("Explain why this PO is being rejected...") },
                    isError = hasError,
                    supportingText = if (hasError) {
                        { Text("Please provide a rejection reason") }
                    } else null,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("po_rejection_reason_input"),
                    minLines = 2,
                    maxLines = 4
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (reason.isBlank()) {
                        hasError = true
                    } else {
                        onConfirmReject(reason)
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = StatusError),
                modifier = Modifier.testTag("confirm_po_rejection_button")
            ) {
                Text("Confirm Rejection")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Back")
            }
        }
    )
}

/**
 * Educational Hierarchical Threshold Matrix Reference Card
 */
@Composable
fun PoApprovalMatrixInfoCard(
    onDismiss: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(1.dp, BentoBorder),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.AccountBalance,
                        contentDescription = null,
                        tint = BluePrimary,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Value-Based Approval Matrix",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                if (onDismiss != null) {
                    TextButton(onClick = onDismiss) {
                        Text("Close", fontSize = 12.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Tier 1
            MatrixTierRow(
                tierCode = "Tier 1: < ₹25,000",
                title = "Standard Line Approval (1 Sign-off)",
                roles = "Approving / Department Manager",
                color = Color(0xFF1976D2)
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Tier 2
            MatrixTierRow(
                tierCode = "Tier 2: ₹25,000 - ₹1,00,000",
                title = "Mid-Value Dual Sign-off (2 Signatures)",
                roles = "Level 1: Dept Manager  ➔  Level 2: Procurement Head",
                color = Color(0xFF7B1FA2)
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Tier 3
            MatrixTierRow(
                tierCode = "Tier 3: ₹1,00,000 - ₹5,00,000",
                title = "High-Value Triple Sign-off (3 Signatures)",
                roles = "L1: Dept Mgr  ➔  L2: Procurement Head  ➔  L3: Finance Director",
                color = Color(0xFFE65100)
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Tier 4
            MatrixTierRow(
                tierCode = "Tier 4: > ₹5,00,000",
                title = "Enterprise Scale (4-Level Executive Sign-off)",
                roles = "L1: Dept Mgr  ➔  L2: Proc Head  ➔  L3: Finance Dir  ➔  L4: CFO & Board",
                color = Color(0xFFC2185B)
            )
        }
    }
}

@Composable
private fun MatrixTierRow(
    tierCode: String,
    title: String,
    roles: String,
    color: Color
) {
    Surface(
        shape = RoundedCornerShape(10.dp),
        color = color.copy(alpha = 0.08f),
        border = BorderStroke(1.dp, color.copy(alpha = 0.25f)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(10.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = tierCode,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = color
                )
                Text(
                    text = title,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
            Spacer(modifier = Modifier.height(3.dp))
            Text(
                text = roles,
                fontSize = 10.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
