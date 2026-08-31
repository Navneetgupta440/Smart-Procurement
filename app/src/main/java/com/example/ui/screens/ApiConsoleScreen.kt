package com.example.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.compose.ui.draw.clip
import com.example.ui.components.formatDateTime
import com.example.ui.theme.BentoBorder
import com.example.ui.theme.BentoLavenderContainer
import com.example.ui.theme.BentoLavenderOnContainer
import com.example.ui.theme.BluePrimary
import com.example.ui.theme.Slate900
import com.example.ui.theme.StatusSuccess
import com.example.ui.theme.StatusWarning
import com.example.ui.viewmodel.ProcurementViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ApiConsoleScreen(viewModel: ProcurementViewModel) {
    val response by viewModel.apiConsoleResponse.collectAsStateWithLifecycle()
    val requests by viewModel.allRequests.collectAsStateWithLifecycle(emptyList())
    val orders by viewModel.allOrders.collectAsStateWithLifecycle(emptyList())
    val deliveries by viewModel.allDeliveries.collectAsStateWithLifecycle(emptyList())

    val actions = listOf(
        "APPROVE_REQUEST" to "Approve Purchase Request (Manager)",
        "REJECT_REQUEST" to "Reject Purchase Request (Manager)",
        "CREATE_PURCHASE_ORDER" to "Generate PO from Approved PR (Procurement)",
        "ACCEPT_ORDER" to "Supplier Accept PO (Vendor)",
        "DISPATCH_ORDER" to "Supplier Dispatch Shipment (Vendor)",
        "MARK_DELIVERED" to "Mark Delivered & Inward Inventory (Logistics)"
    )

    var selectedAction by remember { mutableStateOf(actions.first()) }
    var entityId by remember { mutableStateOf("PR-2026-000101") }
    var payload by remember { mutableStateOf("Automated workflow execution via REST console") }
    var expandedDropdown by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(8.dp))
            Card(
                shape = RoundedCornerShape(28.dp),
                colors = CardDefaults.cardColors(containerColor = BentoLavenderContainer),
                border = androidx.compose.foundation.BorderStroke(1.dp, BentoBorder),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(BentoLavenderOnContainer.copy(alpha = 0.12f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Code,
                                contentDescription = null,
                                tint = BentoLavenderOnContainer,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "REST API Workflow Runner",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = BentoLavenderOnContainer
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Simulate automated backend webhooks, ERP integrations, and programmatic state transitions directly.",
                        style = MaterialTheme.typography.bodySmall,
                        color = BentoLavenderOnContainer
                    )
                }
            }
        }

        item {
            Card(
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = androidx.compose.foundation.BorderStroke(1.dp, BentoBorder),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(text = "Target Action / Endpoint:", fontWeight = FontWeight.Bold, style = MaterialTheme.typography.labelMedium)

                    ExposedDropdownMenuBox(
                        expanded = expandedDropdown,
                        onExpandedChange = { expandedDropdown = !expandedDropdown }
                    ) {
                        OutlinedTextField(
                            value = "${selectedAction.first} - ${selectedAction.second}",
                            onValueChange = {},
                            readOnly = true,
                            shape = RoundedCornerShape(14.dp),
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedDropdown) },
                            modifier = Modifier
                                .menuAnchor()
                                .fillMaxWidth()
                        )
                        ExposedDropdownMenu(
                            expanded = expandedDropdown,
                            onDismissRequest = { expandedDropdown = false }
                        ) {
                            actions.forEach { act ->
                                DropdownMenuItem(
                                    text = {
                                        Column {
                                            Text(act.first, fontWeight = FontWeight.Bold)
                                            Text(act.second, style = MaterialTheme.typography.labelSmall)
                                        }
                                    },
                                    onClick = {
                                        selectedAction = act
                                        expandedDropdown = false
                                        // Auto-populate entity ID based on action
                                        entityId = when (act.first) {
                                            "APPROVE_REQUEST", "REJECT_REQUEST" -> requests.firstOrNull()?.id ?: "PR-2026-000101"
                                            "CREATE_PURCHASE_ORDER" -> requests.firstOrNull()?.id ?: "PR-2026-000101"
                                            "ACCEPT_ORDER", "DISPATCH_ORDER" -> orders.firstOrNull()?.id ?: "PO-2026-000501"
                                            "MARK_DELIVERED" -> deliveries.firstOrNull()?.id ?: "DEL-001"
                                            else -> entityId
                                        }
                                    }
                                )
                            }
                        }
                    }

                    OutlinedTextField(
                        value = entityId,
                        onValueChange = { entityId = it },
                        label = { Text("Target Entity ID / Number") },
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = payload,
                        onValueChange = { payload = it },
                        label = { Text("JSON Payload / Remarks") },
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Button(
                        onClick = {
                            viewModel.runWorkflowCommand(selectedAction.first, entityId, payload)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("execute_api_command_button")
                    ) {
                        Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("POST /api/v1/workflow/${selectedAction.first.lowercase()}", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Response Inspector Card
        item {
            Card(
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Slate900),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155)),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = "HTTP Response Inspector",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        if (response != null) {
                            Surface(
                                shape = RoundedCornerShape(50),
                                color = if (response?.success == true) StatusSuccess else StatusWarning
                            ) {
                                Text(
                                    text = "${response?.statusCode} ${if (response?.success == true) "OK" else "ERROR"}",
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = Color.White,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 3.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    val jsonText = if (response != null) {
                        """
{
  "status": ${response?.statusCode},
  "success": ${response?.success},
  "message": "${response?.message}",
  "timestamp": ${response?.timestamp},
  "datetime": "${formatDateTime(response?.timestamp ?: System.currentTimeMillis())}"
}
                        """.trimIndent()
                    } else {
                        """
// Ready to execute. Select an endpoint above and click Execute POST.
{
  "status": 200,
  "service": "SmartProcurementWorkflowEngine",
  "version": "1.0.0",
  "health": "UP"
}
                        """.trimIndent()
                    }

                    Text(
                        text = jsonText,
                        fontFamily = FontFamily.Monospace,
                        fontSize = 12.sp,
                        color = Color(0xFF38BDF8),
                        lineHeight = 18.sp
                    )
                }
            }
        }

        item { Spacer(modifier = Modifier.height(80.dp)) }
    }
}
