package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.BrightnessAuto
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.WorkspacePremium
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Analytics
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.DoneAll
import androidx.compose.material.icons.filled.Inventory
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.filled.Store
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.entity.NotificationEntity
import com.example.data.entity.UserEntity
import com.example.data.model.DeliveryStatus
import com.example.data.model.OrderStatus
import com.example.data.model.Priority
import com.example.data.model.RequestStatus
import com.example.data.model.UserRole
import com.example.ui.theme.BluePrimary
import com.example.ui.theme.BluePrimaryDark
import com.example.ui.theme.Navy800
import com.example.ui.theme.Navy900
import com.example.ui.theme.Slate200
import com.example.ui.theme.Slate400
import com.example.ui.theme.Slate600
import com.example.ui.theme.Slate900
import com.example.ui.theme.StatusError
import com.example.ui.theme.StatusErrorContainer
import com.example.ui.theme.StatusInfo
import com.example.ui.theme.StatusInfoContainer
import com.example.ui.theme.StatusSuccess
import com.example.ui.theme.StatusSuccessContainer
import com.example.ui.theme.StatusWarning
import com.example.ui.theme.StatusWarningContainer
import com.example.ui.theme.TealAccent
import com.example.ui.viewmodel.AppTab
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

fun formatCurrency(amount: Double): String {
    return "₹" + String.format(Locale.getDefault(), "%,.2f", amount)
}

fun formatDateTime(timestamp: Long): String {
    val sdf = SimpleDateFormat("dd MMM, hh:mm a", Locale.getDefault())
    return sdf.format(Date(timestamp))
}

fun formatDate(timestamp: Long): String {
    val sdf = SimpleDateFormat("dd MMM yyyy", Locale.getDefault())
    return sdf.format(Date(timestamp))
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProcurementTopBar(
    currentUser: UserEntity?,
    unreadCount: Int,
    currentThemeMode: com.example.data.preferences.AppThemeMode = com.example.data.preferences.AppThemeMode.SYSTEM,
    onSetThemeMode: (com.example.data.preferences.AppThemeMode) -> Unit = {},
    onSwitchRole: (UserRole) -> Unit,
    onOpenAuthProfile: () -> Unit = {},
    onOpenMembership: () -> Unit = {},
    onOpenNotifications: () -> Unit
) {
    var showRoleMenu by remember { mutableStateOf(false) }
    var showThemeMenu by remember { mutableStateOf(false) }

    TopAppBar(
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.clickable { onOpenAuthProfile() }
            ) {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(
                            Brush.linearGradient(
                                listOf(Color(0xFF00639A), Color(0xFF006A60))
                            )
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Inventory,
                        contentDescription = "Smart Procurement Logo",
                        tint = Color.White,
                        modifier = Modifier.size(22.dp)
                    )
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "Smart Procurement",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            maxLines = 1
                        )
                    }
                    Text(
                        text = "Enterprise Bento Grid Portal",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 11.sp
                    )
                }
            }
        },
        actions = {
            // Theme Mode Toggle Selector
            Box {
                IconButton(
                    onClick = { showThemeMenu = true },
                    modifier = Modifier.testTag("theme_toggle_button")
                ) {
                    Icon(
                        imageVector = when (currentThemeMode) {
                            com.example.data.preferences.AppThemeMode.LIGHT -> Icons.Default.LightMode
                            com.example.data.preferences.AppThemeMode.DARK -> Icons.Default.DarkMode
                            com.example.data.preferences.AppThemeMode.SYSTEM -> Icons.Default.BrightnessAuto
                        },
                        contentDescription = "Toggle Theme: ${currentThemeMode.displayName}",
                        tint = MaterialTheme.colorScheme.onSurface
                    )
                }

                DropdownMenu(
                    expanded = showThemeMenu,
                    onDismissRequest = { showThemeMenu = false }
                ) {
                    Text(
                        text = "Appearance Theme",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)
                    )
                    com.example.data.preferences.AppThemeMode.values().forEach { mode ->
                        DropdownMenuItem(
                            text = {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = when (mode) {
                                            com.example.data.preferences.AppThemeMode.LIGHT -> Icons.Default.LightMode
                                            com.example.data.preferences.AppThemeMode.DARK -> Icons.Default.DarkMode
                                            com.example.data.preferences.AppThemeMode.SYSTEM -> Icons.Default.BrightnessAuto
                                        },
                                        contentDescription = null,
                                        modifier = Modifier.size(18.dp),
                                        tint = if (currentThemeMode == mode) BluePrimary else MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Text(
                                        text = mode.displayName,
                                        fontWeight = if (currentThemeMode == mode) FontWeight.Bold else FontWeight.Normal
                                    )
                                }
                            },
                            onClick = {
                                onSetThemeMode(mode)
                                showThemeMenu = false
                            }
                        )
                    }
                }
            }

            // Notifications Icon with Badge
            IconButton(
                onClick = onOpenNotifications,
                modifier = Modifier.testTag("notifications_button")
            ) {
                BadgedBox(
                    badge = {
                        if (unreadCount > 0) {
                            Badge(containerColor = StatusError, contentColor = Color.White) {
                                Text(unreadCount.toString())
                            }
                        }
                    }
                ) {
                    Icon(
                        imageVector = Icons.Default.Notifications,
                        contentDescription = "Notifications"
                    )
                }
            }

            // Role & Persona Switcher Bento Pill
            Box {
                Surface(
                    shape = RoundedCornerShape(50),
                    color = MaterialTheme.colorScheme.primaryContainer,
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFE2E2E6)),
                    modifier = Modifier
                        .clickable { showRoleMenu = true }
                        .padding(end = 4.dp)
                        .testTag("role_switcher_button")
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(9.dp)
                                .clip(CircleShape)
                                .background(Color(currentUser?.role?.badgeColor ?: 0xFF00639A))
                        )
                        Spacer(modifier = Modifier.width(5.dp))
                        Text(
                            text = currentUser?.role?.displayName ?: "User",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer,
                            fontSize = 12.sp
                        )
                    }
                }

                DropdownMenu(
                    expanded = showRoleMenu,
                    onDismissRequest = { showRoleMenu = false }
                ) {
                    Text(
                        text = "Switch Active Persona & Role",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                    )
                    UserRole.values().forEach { role ->
                        DropdownMenuItem(
                            text = {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(
                                        modifier = Modifier
                                            .size(8.dp)
                                            .clip(CircleShape)
                                            .background(Color(role.badgeColor))
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = role.displayName,
                                        fontWeight = if (currentUser?.role == role) FontWeight.Bold else FontWeight.Normal
                                    )
                                }
                            },
                            onClick = {
                                onSwitchRole(role)
                                showRoleMenu = false
                            }
                        )
                    }
                    HorizontalDivider(color = Color(0xFFE2E2E6))
                    DropdownMenuItem(
                        text = {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.AccountCircle, contentDescription = null, modifier = Modifier.size(18.dp), tint = BluePrimary)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Login / Account Manager", fontWeight = FontWeight.SemiBold, color = BluePrimary)
                            }
                        },
                        onClick = {
                            showRoleMenu = false
                            onOpenAuthProfile()
                        }
                    )
                    DropdownMenuItem(
                        text = {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.WorkspacePremium, contentDescription = null, modifier = Modifier.size(18.dp), tint = Color(currentUser?.membershipPlan?.badgeColor ?: 0xFF6366F1))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Membership Plans (${currentUser?.membershipPlan?.badgeText ?: "FREE"})", fontWeight = FontWeight.SemiBold)
                            }
                        },
                        onClick = {
                            showRoleMenu = false
                            onOpenMembership()
                        }
                    )
                }
            }

            // User Profile Avatar Clickable
            IconButton(
                onClick = onOpenAuthProfile,
                modifier = Modifier.testTag("btn_topbar_user_profile")
            ) {
                Box(
                    modifier = Modifier
                        .size(30.dp)
                        .clip(CircleShape)
                        .background(Color(currentUser?.membershipPlan?.badgeColor ?: 0xFF6366F1)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = currentUser?.name?.take(1)?.uppercase() ?: "U",
                        color = Color.White,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    )
}

@Composable
fun ProcurementBottomNav(
    currentTab: AppTab,
    onTabSelected: (AppTab) -> Unit
) {
    val mainTabs = listOf(
        AppTab.DASHBOARD,
        AppTab.REQUESTS,
        AppTab.ORDERS,
        AppTab.HISTORY,
        AppTab.MEMBERSHIP,
        AppTab.SUPPLIERS,
        AppTab.DELIVERY,
        AppTab.INVENTORY,
        AppTab.ANALYTICS,
        AppTab.API_CONSOLE
    )

    Surface(
        color = MaterialTheme.colorScheme.surface,
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFE2E2E6).copy(alpha = 0.6f)),
        shadowElevation = 6.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(vertical = 8.dp, horizontal = 8.dp),
            horizontalArrangement = Arrangement.SpaceAround
        ) {
            mainTabs.forEach { tab ->
                val isSelected = currentTab == tab
                val icon = when (tab) {
                    AppTab.DASHBOARD -> Icons.Default.Dashboard
                    AppTab.REQUESTS -> Icons.Default.Description
                    AppTab.ORDERS -> Icons.Default.ShoppingCart
                    AppTab.HISTORY -> Icons.Default.History
                    AppTab.MEMBERSHIP -> Icons.Default.WorkspacePremium
                    AppTab.SUPPLIERS -> Icons.Default.Store
                    AppTab.DELIVERY -> Icons.Default.LocalShipping
                    AppTab.INVENTORY -> Icons.Default.Inventory
                    AppTab.ANALYTICS -> Icons.Default.Analytics
                    AppTab.API_CONSOLE -> Icons.Default.Code
                }

                Surface(
                    shape = RoundedCornerShape(50),
                    color = if (isSelected) MaterialTheme.colorScheme.primaryContainer else Color.Transparent,
                    modifier = Modifier
                        .clickable { onTabSelected(tab) }
                        .padding(horizontal = 3.dp)
                        .testTag("nav_tab_${tab.name.lowercase()}")
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 9.dp)
                    ) {
                        Icon(
                            imageVector = icon,
                            contentDescription = tab.title,
                            tint = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(18.dp)
                        )
                        if (isSelected) {
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = tab.title,
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun MetricKpiCard(
    title: String,
    value: String,
    subtitle: String,
    icon: ImageVector,
    accentColor: Color,
    containerColor: Color? = null,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(
            containerColor = containerColor ?: MaterialTheme.colorScheme.surface
        ),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFE2E2E6)),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
        modifier = modifier
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                    fontWeight = FontWeight.SemiBold,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f)
                )
                Box(
                    modifier = Modifier
                        .size(34.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(accentColor.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = accentColor,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.ExtraBold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontSize = 11.sp
            )
        }
    }
}

@Composable
fun StatusBadge(
    statusText: String,
    containerColor: Color,
    contentColor: Color
) {
    Surface(
        shape = RoundedCornerShape(50),
        color = containerColor
    ) {
        Text(
            text = statusText,
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Bold,
            color = contentColor,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
        )
    }
}

@Composable
fun PriorityBadge(priority: Priority) {
    val (bgColor, textColor) = when (priority) {
        Priority.LOW -> Slate200 to Slate900
        Priority.MEDIUM -> StatusInfoContainer to StatusInfo
        Priority.HIGH -> StatusWarningContainer to StatusWarning
        Priority.URGENT -> StatusErrorContainer to StatusError
    }
    StatusBadge(
        statusText = "${priority.displayName} Priority",
        containerColor = bgColor,
        contentColor = textColor
    )
}

@Composable
fun RequestStatusBadge(status: RequestStatus) {
    val (bgColor, textColor) = when (status) {
        RequestStatus.DRAFT -> Slate200 to Slate600
        RequestStatus.SUBMITTED -> StatusInfoContainer to StatusInfo
        RequestStatus.PENDING_APPROVAL -> StatusWarningContainer to StatusWarning
        RequestStatus.APPROVED -> StatusSuccessContainer to StatusSuccess
        RequestStatus.REJECTED -> StatusErrorContainer to StatusError
        RequestStatus.CANCELLED -> StatusErrorContainer to StatusError
        RequestStatus.CONVERTED_TO_PO -> Color(0xFFE0E7FF) to Color(0xFF4338CA)
    }
    StatusBadge(
        statusText = status.displayName,
        containerColor = bgColor,
        contentColor = textColor
    )
}

@Composable
fun OrderStatusBadge(status: OrderStatus) {
    val (bgColor, textColor) = when (status) {
        OrderStatus.DRAFT -> Slate200 to Slate600
        OrderStatus.PENDING_APPROVAL -> StatusWarningContainer to StatusWarning
        OrderStatus.APPROVED -> StatusInfoContainer to StatusInfo
        OrderStatus.SENT_TO_SUPPLIER -> Color(0xFFFEF3C7) to Color(0xFFB45309)
        OrderStatus.SUPPLIER_ACCEPTED -> Color(0xFFCCFBF1) to Color(0xFF0F766E)
        OrderStatus.SUPPLIER_REJECTED -> StatusErrorContainer to StatusError
        OrderStatus.PROCESSING -> Color(0xFFE0F2FE) to Color(0xFF0369A1)
        OrderStatus.DISPATCHED -> Color(0xFFDDD6FE) to Color(0xFF6D28D9)
        OrderStatus.IN_TRANSIT -> Color(0xFFDBEAFE) to Color(0xFF1D4ED8)
        OrderStatus.OUT_FOR_DELIVERY -> Color(0xFFFEF08A) to Color(0xFF854D0E)
        OrderStatus.DELIVERED, OrderStatus.COMPLETED -> StatusSuccessContainer to StatusSuccess
        OrderStatus.CANCELLED -> StatusErrorContainer to StatusError
    }
    StatusBadge(
        statusText = status.displayName,
        containerColor = bgColor,
        contentColor = textColor
    )
}

@Composable
fun DeliveryStatusBadge(status: DeliveryStatus) {
    val (bgColor, textColor) = when (status) {
        DeliveryStatus.CREATED -> Slate200 to Slate600
        DeliveryStatus.PICKED_UP -> Color(0xFFE0F2FE) to Color(0xFF0369A1)
        DeliveryStatus.IN_TRANSIT -> Color(0xFFDBEAFE) to Color(0xFF1D4ED8)
        DeliveryStatus.OUT_FOR_DELIVERY -> Color(0xFFFEF08A) to Color(0xFF854D0E)
        DeliveryStatus.DELIVERED -> StatusSuccessContainer to StatusSuccess
        DeliveryStatus.FAILED, DeliveryStatus.RETURNED -> StatusErrorContainer to StatusError
    }
    StatusBadge(
        statusText = status.displayName,
        containerColor = bgColor,
        contentColor = textColor
    )
}

@Composable
fun NotificationsModal(
    notifications: List<NotificationEntity>,
    onDismiss: () -> Unit,
    onMarkAllRead: () -> Unit,
    onMarkRead: (String) -> Unit,
    onDelete: (String) -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(text = "System Notifications", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                if (notifications.any { !it.isRead }) {
                    TextButton(onClick = onMarkAllRead) {
                        Text("Mark all read", fontSize = 12.sp)
                    }
                }
            }
        },
        text = {
            if (notifications.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = "No notifications yet", color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(350.dp)
                ) {
                    items(notifications) { notif ->
                        Card(
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = if (notif.isRead) MaterialTheme.colorScheme.surface else MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f)
                            ),
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                                .clickable { onMarkRead(notif.id) }
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text(
                                        text = notif.title,
                                        style = MaterialTheme.typography.titleSmall,
                                        fontWeight = if (notif.isRead) FontWeight.SemiBold else FontWeight.Bold,
                                        modifier = Modifier.weight(1f)
                                    )
                                    IconButton(
                                        onClick = { onDelete(notif.id) },
                                        modifier = Modifier.size(20.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Close,
                                            contentDescription = "Delete",
                                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                            modifier = Modifier.size(14.dp)
                                        )
                                    }
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = notif.message,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = formatDateTime(notif.timestamp),
                                    style = MaterialTheme.typography.labelSmall,
                                    color = Slate400,
                                    fontSize = 10.sp
                                )
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(onClick = onDismiss) {
                Text("Close")
            }
        }
    )
}
