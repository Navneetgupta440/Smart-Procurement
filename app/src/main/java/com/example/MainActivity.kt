package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.Crossfade
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.data.entity.PurchaseRequestEntity
import com.example.data.preferences.AppThemeMode
import com.example.ui.components.AuthDialog
import com.example.ui.components.NotificationsModal
import com.example.ui.components.ProcurementBottomNav
import com.example.ui.components.ProcurementTopBar
import com.example.ui.screens.AnalyticsAndAuditScreen
import com.example.ui.screens.ApiConsoleScreen
import com.example.ui.screens.DashboardScreen
import com.example.ui.screens.DeliveryScreen
import com.example.ui.screens.InventoryScreen
import com.example.ui.screens.MembershipPlanScreen
import com.example.ui.screens.OrderHistoryScreen
import com.example.ui.screens.PurchaseOrdersScreen
import com.example.ui.screens.RequestsScreen
import com.example.ui.screens.SuppliersScreen
import com.example.ui.theme.SmartProcurementTheme
import com.example.ui.viewmodel.AppTab
import com.example.ui.viewmodel.ProcurementViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val viewModel: ProcurementViewModel = viewModel()
            val themeMode by viewModel.themeMode.collectAsStateWithLifecycle(AppThemeMode.SYSTEM)
            val isDark = when (themeMode) {
                AppThemeMode.DARK -> true
                AppThemeMode.LIGHT -> false
                AppThemeMode.SYSTEM -> isSystemInDarkTheme()
            }

            SmartProcurementTheme(darkTheme = isDark) {
                SmartProcurementApp(viewModel = viewModel, themeMode = themeMode)
            }
        }
    }
}

@Composable
fun SmartProcurementApp(
    viewModel: ProcurementViewModel = viewModel(),
    themeMode: AppThemeMode = AppThemeMode.SYSTEM
) {
    val currentTab by viewModel.currentTab.collectAsStateWithLifecycle()
    val currentUser by viewModel.currentUser.collectAsStateWithLifecycle()
    val allUsers by viewModel.allUsers.collectAsStateWithLifecycle(emptyList())
    val unreadCount by viewModel.unreadNotificationCount.collectAsStateWithLifecycle(0)
    val notifications by viewModel.allNotifications.collectAsStateWithLifecycle(emptyList())
    val toastMessage by viewModel.toastMessage.collectAsStateWithLifecycle()

    var showNotificationsDialog by remember { mutableStateOf(false) }
    var showAuthDialog by remember { mutableStateOf(false) }
    var preselectedRequestForPo by remember { mutableStateOf<PurchaseRequestEntity?>(null) }
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(toastMessage) {
        toastMessage?.let { msg ->
            snackbarHostState.showSnackbar(
                message = msg,
                duration = SnackbarDuration.Short
            )
            viewModel.clearToast()
        }
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            ProcurementTopBar(
                currentUser = currentUser,
                unreadCount = unreadCount,
                currentThemeMode = themeMode,
                onSetThemeMode = { mode -> viewModel.setThemeMode(mode) },
                onSwitchRole = { role -> viewModel.switchRole(role) },
                onOpenAuthProfile = { showAuthDialog = true },
                onOpenMembership = { viewModel.selectTab(AppTab.MEMBERSHIP) },
                onOpenNotifications = { showNotificationsDialog = true }
            )
        },
        bottomBar = {
            ProcurementBottomNav(
                currentTab = currentTab,
                onTabSelected = { tab -> viewModel.selectTab(tab) }
            )
        },
        snackbarHost = {
            SnackbarHost(hostState = snackbarHostState)
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            Crossfade(targetState = currentTab, label = "tab_transition") { tab ->
                when (tab) {
                    AppTab.DASHBOARD -> DashboardScreen(
                        viewModel = viewModel,
                        onNavigate = { targetTab -> viewModel.selectTab(targetTab) }
                    )
                    AppTab.REQUESTS -> RequestsScreen(
                        viewModel = viewModel,
                        onConvertToPo = { pr ->
                            preselectedRequestForPo = pr
                            viewModel.selectTab(AppTab.ORDERS)
                        }
                    )
                    AppTab.ORDERS -> PurchaseOrdersScreen(
                        viewModel = viewModel,
                        preselectedRequestForPo = preselectedRequestForPo,
                        onClearPreselectedRequest = { preselectedRequestForPo = null }
                    )
                    AppTab.HISTORY -> OrderHistoryScreen(
                        viewModel = viewModel,
                        onNavigateToRequests = { viewModel.selectTab(AppTab.REQUESTS) }
                    )
                    AppTab.MEMBERSHIP -> MembershipPlanScreen(viewModel = viewModel)
                    AppTab.SUPPLIERS -> SuppliersScreen(viewModel = viewModel)
                    AppTab.DELIVERY -> DeliveryScreen(viewModel = viewModel)
                    AppTab.INVENTORY -> InventoryScreen(viewModel = viewModel)
                    AppTab.ANALYTICS -> AnalyticsAndAuditScreen(viewModel = viewModel)
                    AppTab.API_CONSOLE -> ApiConsoleScreen(viewModel = viewModel)
                }
            }
        }
    }

    if (showNotificationsDialog) {
        NotificationsModal(
            notifications = notifications,
            onDismiss = { showNotificationsDialog = false },
            onMarkAllRead = { viewModel.markAllAsRead() },
            onMarkRead = { id -> viewModel.markAsRead(id) },
            onDelete = { id -> viewModel.deleteNotification(id) }
        )
    }

    if (showAuthDialog) {
        AuthDialog(
            currentUser = currentUser,
            allUsers = allUsers,
            onDismiss = { showAuthDialog = false },
            onLogin = { email, pwd, cb ->
                viewModel.login(email, pwd, cb)
            },
            onSignUp = { name, email, pwd, phone, dept, role, supId, plan, cycle, cb ->
                viewModel.signUp(name, email, pwd, phone, dept, role, supId, plan, cycle, cb)
            },
            onLogout = { viewModel.logout() },
            onSwitchUser = { userId -> viewModel.switchUserById(userId) },
            onOpenMembership = { viewModel.selectTab(AppTab.MEMBERSHIP) }
        )
    }
}
