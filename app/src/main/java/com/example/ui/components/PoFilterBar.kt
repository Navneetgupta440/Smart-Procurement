package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
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
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.FilterAlt
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.RestartAlt
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Sort
import androidx.compose.material.icons.filled.Store
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.SelectableDates
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberDatePickerState
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
import com.example.data.entity.PurchaseOrderEntity
import com.example.data.entity.SupplierEntity
import com.example.data.model.OrderStatus
import com.example.ui.theme.BentoBorder
import com.example.ui.theme.BluePrimary
import com.example.ui.theme.StatusError
import com.example.ui.theme.StatusSuccess
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

/**
 * Predefined Date Range Filters
 */
enum class DateRangePreset(val displayName: String) {
    ALL_TIME("All Time"),
    TODAY("Today"),
    LAST_7_DAYS("Last 7 Days"),
    LAST_30_DAYS("Last 30 Days"),
    THIS_MONTH("This Month"),
    LAST_90_DAYS("Last 90 Days"),
    CUSTOM("Custom Range")
}

/**
 * PO Sorting Options
 */
enum class PoSortOption(val displayName: String) {
    DATE_NEWEST("Newest First"),
    DATE_OLDEST("Oldest First"),
    AMOUNT_HIGH_LOW("Amount: High to Low"),
    AMOUNT_LOW_HIGH("Amount: Low to High"),
    SUPPLIER_AZ("Supplier: A to Z"),
    STATUS("Status")
}

/**
 * Full state encapsulating all PO search, filter, and sorting preferences
 */
data class PoFilterState(
    val searchQuery: String = "",
    val selectedSupplierName: String? = null,
    val selectedStatus: OrderStatus? = null,
    val selectedWorkflowCategory: String = "ALL", // "ALL", "MY_APPROVAL", "PENDING_APPROVAL", "IN_FULFILLMENT", "DELIVERED", "CANCELLED"
    val dateRangePreset: DateRangePreset = DateRangePreset.ALL_TIME,
    val customStartDate: Long? = null,
    val customEndDate: Long? = null,
    val sortBy: PoSortOption = PoSortOption.DATE_NEWEST
) {
    val activeFilterCount: Int
        get() {
            var count = 0
            if (searchQuery.isNotBlank()) count++
            if (selectedSupplierName != null) count++
            if (selectedStatus != null) count++
            if (selectedWorkflowCategory != "ALL") count++
            if (dateRangePreset != DateRangePreset.ALL_TIME) count++
            return count
        }

    val hasActiveFilters: Boolean
        get() = activeFilterCount > 0

    fun getDateRangeText(): String {
        return when (dateRangePreset) {
            DateRangePreset.ALL_TIME -> "All Time"
            DateRangePreset.TODAY -> "Today"
            DateRangePreset.LAST_7_DAYS -> "Last 7 Days"
            DateRangePreset.LAST_30_DAYS -> "Last 30 Days"
            DateRangePreset.THIS_MONTH -> "This Month"
            DateRangePreset.LAST_90_DAYS -> "Last 90 Days"
            DateRangePreset.CUSTOM -> {
                if (customStartDate != null && customEndDate != null) {
                    "${formatSimpleDate(customStartDate)} - ${formatSimpleDate(customEndDate)}"
                } else if (customStartDate != null) {
                    "From ${formatSimpleDate(customStartDate)}"
                } else if (customEndDate != null) {
                    "Until ${formatSimpleDate(customEndDate)}"
                } else {
                    "Custom Range"
                }
            }
        }
    }

    private fun formatSimpleDate(time: Long): String {
        return SimpleDateFormat("dd MMM", Locale.getDefault()).format(Date(time))
    }
}

/**
 * Helper to compute start & end timestamps for a DateRangePreset
 */
fun getDateRangeBounds(
    preset: DateRangePreset,
    customStart: Long?,
    customEnd: Long?
): Pair<Long?, Long?> {
    val cal = Calendar.getInstance()
    return when (preset) {
        DateRangePreset.ALL_TIME -> null to null
        DateRangePreset.TODAY -> {
            cal.set(Calendar.HOUR_OF_DAY, 0)
            cal.set(Calendar.MINUTE, 0)
            cal.set(Calendar.SECOND, 0)
            cal.set(Calendar.MILLISECOND, 0)
            val start = cal.timeInMillis

            cal.set(Calendar.HOUR_OF_DAY, 23)
            cal.set(Calendar.MINUTE, 59)
            cal.set(Calendar.SECOND, 59)
            cal.set(Calendar.MILLISECOND, 999)
            val end = cal.timeInMillis
            start to end
        }
        DateRangePreset.LAST_7_DAYS -> {
            cal.add(Calendar.DAY_OF_YEAR, -7)
            cal.set(Calendar.HOUR_OF_DAY, 0)
            cal.set(Calendar.MINUTE, 0)
            cal.set(Calendar.SECOND, 0)
            cal.set(Calendar.MILLISECOND, 0)
            val start = cal.timeInMillis
            start to System.currentTimeMillis()
        }
        DateRangePreset.LAST_30_DAYS -> {
            cal.add(Calendar.DAY_OF_YEAR, -30)
            cal.set(Calendar.HOUR_OF_DAY, 0)
            cal.set(Calendar.MINUTE, 0)
            cal.set(Calendar.SECOND, 0)
            cal.set(Calendar.MILLISECOND, 0)
            val start = cal.timeInMillis
            start to System.currentTimeMillis()
        }
        DateRangePreset.THIS_MONTH -> {
            cal.set(Calendar.DAY_OF_MONTH, 1)
            cal.set(Calendar.HOUR_OF_DAY, 0)
            cal.set(Calendar.MINUTE, 0)
            cal.set(Calendar.SECOND, 0)
            cal.set(Calendar.MILLISECOND, 0)
            val start = cal.timeInMillis
            start to System.currentTimeMillis()
        }
        DateRangePreset.LAST_90_DAYS -> {
            cal.add(Calendar.DAY_OF_YEAR, -90)
            cal.set(Calendar.HOUR_OF_DAY, 0)
            cal.set(Calendar.MINUTE, 0)
            cal.set(Calendar.SECOND, 0)
            cal.set(Calendar.MILLISECOND, 0)
            val start = cal.timeInMillis
            start to System.currentTimeMillis()
        }
        DateRangePreset.CUSTOM -> {
            val start = customStart?.let {
                val c = Calendar.getInstance().apply { timeInMillis = it }
                c.set(Calendar.HOUR_OF_DAY, 0)
                c.set(Calendar.MINUTE, 0)
                c.set(Calendar.SECOND, 0)
                c.set(Calendar.MILLISECOND, 0)
                c.timeInMillis
            }
            val end = customEnd?.let {
                val c = Calendar.getInstance().apply { timeInMillis = it }
                c.set(Calendar.HOUR_OF_DAY, 23)
                c.set(Calendar.MINUTE, 59)
                c.set(Calendar.SECOND, 59)
                c.set(Calendar.MILLISECOND, 999)
                c.timeInMillis
            }
            start to end
        }
    }
}

/**
 * Top Search Bar and Filter Controls Component for Purchase Orders Dashboard
 */
@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun PoSearchAndFilterHeader(
    filterState: PoFilterState,
    onFilterChange: (PoFilterState) -> Unit,
    suppliers: List<SupplierEntity>,
    totalOrdersCount: Int,
    filteredOrdersCount: Int,
    filteredOrdersSum: Double,
    modifier: Modifier = Modifier
) {
    var isFilterPanelExpanded by remember { mutableStateOf(false) }
    var showCustomDateDialog by remember { mutableStateOf(false) }
    var showSupplierDropdown by remember { mutableStateOf(false) }
    var showStatusDropdown by remember { mutableStateOf(false) }
    var showSortDropdown by remember { mutableStateOf(false) }

    Column(modifier = modifier.fillMaxWidth()) {
        // Main Search Bar + Filter Toggle Button
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedTextField(
                value = filterState.searchQuery,
                onValueChange = { onFilterChange(filterState.copy(searchQuery = it)) },
                placeholder = {
                    Text(
                        text = "Search PO#, supplier, notes...",
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                    )
                },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Search POs",
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(20.dp)
                    )
                },
                trailingIcon = {
                    if (filterState.searchQuery.isNotEmpty()) {
                        IconButton(
                            onClick = { onFilterChange(filterState.copy(searchQuery = "")) },
                            modifier = Modifier.size(28.dp).testTag("clear_po_search_button")
                        ) {
                            Icon(
                                imageVector = Icons.Default.Clear,
                                contentDescription = "Clear search",
                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                },
                singleLine = true,
                shape = RoundedCornerShape(14.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = MaterialTheme.colorScheme.primary,
                    unfocusedBorderColor = BentoBorder,
                    focusedContainerColor = MaterialTheme.colorScheme.surface,
                    unfocusedContainerColor = MaterialTheme.colorScheme.surface
                ),
                modifier = Modifier
                    .weight(1f)
                    .height(52.dp)
                    .testTag("po_search_input")
            )

            // Filter Expand Toggle Button with Active Badge
            Surface(
                shape = RoundedCornerShape(14.dp),
                color = if (isFilterPanelExpanded || filterState.hasActiveFilters) {
                    MaterialTheme.colorScheme.primaryContainer
                } else {
                    MaterialTheme.colorScheme.surface
                },
                border = BorderStroke(
                    1.dp,
                    if (isFilterPanelExpanded || filterState.hasActiveFilters) MaterialTheme.colorScheme.primary
                    else BentoBorder
                ),
                modifier = Modifier
                    .height(52.dp)
                    .clickable { isFilterPanelExpanded = !isFilterPanelExpanded }
                    .testTag("toggle_po_filter_panel_button")
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(horizontal = 12.dp)
                ) {
                    BadgedBox(
                        badge = {
                            if (filterState.activeFilterCount > 0) {
                                Badge(
                                    containerColor = MaterialTheme.colorScheme.primary,
                                    contentColor = Color.White
                                ) {
                                    Text(
                                        text = filterState.activeFilterCount.toString(),
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    ) {
                        Icon(
                            imageVector = if (isFilterPanelExpanded) Icons.Default.Tune else Icons.Default.FilterList,
                            contentDescription = "Filter Purchase Orders",
                            tint = if (isFilterPanelExpanded || filterState.hasActiveFilters) {
                                MaterialTheme.colorScheme.primary
                            } else {
                                MaterialTheme.colorScheme.onSurfaceVariant
                            },
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = if (isFilterPanelExpanded) "Close" else "Filters",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = if (isFilterPanelExpanded || filterState.hasActiveFilters) {
                            MaterialTheme.colorScheme.primary
                        } else {
                            MaterialTheme.colorScheme.onSurfaceVariant
                        }
                    )
                }
            }
        }

        // Expandable Filter Drawer / Panel
        AnimatedVisibility(
            visible = isFilterPanelExpanded,
            enter = fadeIn() + expandVertically(),
            exit = fadeOut() + shrinkVertically()
        ) {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = BorderStroke(1.dp, BentoBorder),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 10.dp)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    // Header of Filter Panel
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Tune,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Refine & Filter Orders",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }

                        if (filterState.hasActiveFilters) {
                            TextButton(
                                onClick = {
                                    onFilterChange(
                                        PoFilterState(
                                            searchQuery = "",
                                            selectedSupplierName = null,
                                            selectedStatus = null,
                                            selectedWorkflowCategory = "ALL",
                                            dateRangePreset = DateRangePreset.ALL_TIME,
                                            customStartDate = null,
                                            customEndDate = null,
                                            sortBy = PoSortOption.DATE_NEWEST
                                        )
                                    )
                                },
                                modifier = Modifier.testTag("reset_all_filters_btn")
                            ) {
                                Icon(
                                    imageVector = Icons.Default.RestartAlt,
                                    contentDescription = null,
                                    modifier = Modifier.size(14.dp),
                                    tint = StatusError
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Reset All", fontSize = 11.sp, color = StatusError, fontWeight = FontWeight.Bold)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // 1. Supplier Filter Section
                    Text(
                        text = "FILTER BY SUPPLIER",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    
                    Box(modifier = Modifier.fillMaxWidth()) {
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = if (filterState.selectedSupplierName != null) MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                            border = BorderStroke(1.dp, if (filterState.selectedSupplierName != null) MaterialTheme.colorScheme.primary else BentoBorder),
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { showSupplierDropdown = true }
                                .testTag("supplier_filter_dropdown_trigger")
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 12.dp, vertical = 10.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.Store,
                                        contentDescription = null,
                                        tint = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = filterState.selectedSupplierName ?: "All Suppliers (No filter)",
                                        fontSize = 12.sp,
                                        fontWeight = if (filterState.selectedSupplierName != null) FontWeight.Bold else FontWeight.Normal,
                                        color = if (filterState.selectedSupplierName != null) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface
                                    )
                                }
                                Icon(
                                    imageVector = Icons.Default.ArrowDropDown,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        DropdownMenu(
                            expanded = showSupplierDropdown,
                            onDismissRequest = { showSupplierDropdown = false },
                            modifier = Modifier.fillMaxWidth(0.85f)
                        ) {
                            DropdownMenuItem(
                                text = { Text("All Suppliers", fontWeight = FontWeight.Bold) },
                                onClick = {
                                    onFilterChange(filterState.copy(selectedSupplierName = null))
                                    showSupplierDropdown = false
                                },
                                leadingIcon = {
                                    if (filterState.selectedSupplierName == null) {
                                        Icon(Icons.Default.Check, contentDescription = null, tint = StatusSuccess, modifier = Modifier.size(16.dp))
                                    }
                                }
                            )
                            suppliers.forEach { supp ->
                                DropdownMenuItem(
                                    text = {
                                        Column {
                                            Text(supp.companyName, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                                            Text("${supp.city} • Rating: ${supp.rating}★", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                        }
                                    },
                                    onClick = {
                                        onFilterChange(filterState.copy(selectedSupplierName = supp.companyName))
                                        showSupplierDropdown = false
                                    },
                                    leadingIcon = {
                                        if (filterState.selectedSupplierName == supp.companyName) {
                                            Icon(Icons.Default.Check, contentDescription = null, tint = StatusSuccess, modifier = Modifier.size(16.dp))
                                        }
                                    }
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // 2. Specific Status Filter Section
                    Text(
                        text = "FILTER BY ORDER STATUS",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(6.dp))

                    Box(modifier = Modifier.fillMaxWidth()) {
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = if (filterState.selectedStatus != null) MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                            border = BorderStroke(1.dp, if (filterState.selectedStatus != null) MaterialTheme.colorScheme.primary else BentoBorder),
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { showStatusDropdown = true }
                                .testTag("status_filter_dropdown_trigger")
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 12.dp, vertical = 10.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.FilterAlt,
                                        contentDescription = null,
                                        tint = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = filterState.selectedStatus?.displayName ?: "Any Status (All)",
                                        fontSize = 12.sp,
                                        fontWeight = if (filterState.selectedStatus != null) FontWeight.Bold else FontWeight.Normal,
                                        color = if (filterState.selectedStatus != null) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface
                                    )
                                }
                                Icon(
                                    imageVector = Icons.Default.ArrowDropDown,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        DropdownMenu(
                            expanded = showStatusDropdown,
                            onDismissRequest = { showStatusDropdown = false },
                            modifier = Modifier.fillMaxWidth(0.85f)
                        ) {
                            DropdownMenuItem(
                                text = { Text("Any Status (All)", fontWeight = FontWeight.Bold) },
                                onClick = {
                                    onFilterChange(filterState.copy(selectedStatus = null))
                                    showStatusDropdown = false
                                },
                                leadingIcon = {
                                    if (filterState.selectedStatus == null) {
                                        Icon(Icons.Default.Check, contentDescription = null, tint = StatusSuccess, modifier = Modifier.size(16.dp))
                                    }
                                }
                            )
                            OrderStatus.values().forEach { st ->
                                DropdownMenuItem(
                                    text = { Text(st.displayName, fontSize = 13.sp) },
                                    onClick = {
                                        onFilterChange(filterState.copy(selectedStatus = st))
                                        showStatusDropdown = false
                                    },
                                    leadingIcon = {
                                        if (filterState.selectedStatus == st) {
                                            Icon(Icons.Default.Check, contentDescription = null, tint = StatusSuccess, modifier = Modifier.size(16.dp))
                                        }
                                    }
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // 3. Date Range Filter Section
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "DATE RANGE",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        if (filterState.dateRangePreset != DateRangePreset.ALL_TIME) {
                            Text(
                                text = filterState.getDateRangeText(),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = BluePrimary
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(6.dp))

                    // Date range presets pills
                    FlowRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        DateRangePreset.values().forEach { preset ->
                            val isSelected = filterState.dateRangePreset == preset
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = if (isSelected) BluePrimary else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f),
                                border = BorderStroke(1.dp, if (isSelected) BluePrimary else BentoBorder),
                                modifier = Modifier
                                    .clickable {
                                        if (preset == DateRangePreset.CUSTOM) {
                                            showCustomDateDialog = true
                                        } else {
                                            onFilterChange(
                                                filterState.copy(
                                                    dateRangePreset = preset,
                                                    customStartDate = null,
                                                    customEndDate = null
                                                )
                                            )
                                        }
                                    }
                                    .testTag("date_preset_${preset.name.lowercase()}")
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    if (preset == DateRangePreset.CUSTOM) {
                                        Icon(
                                            imageVector = Icons.Default.CalendarMonth,
                                            contentDescription = null,
                                            tint = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                                            modifier = Modifier.size(12.dp)
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                    }
                                    Text(
                                        text = preset.displayName,
                                        fontSize = 11.sp,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                        color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // 4. Sort By Section
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "SORT BY",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )

                        Box {
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                                border = BorderStroke(1.dp, BentoBorder),
                                modifier = Modifier.clickable { showSortDropdown = true }
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Sort,
                                        contentDescription = null,
                                        tint = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.size(14.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = filterState.sortBy.displayName,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Icon(
                                        imageVector = Icons.Default.ArrowDropDown,
                                        contentDescription = null,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }

                            DropdownMenu(
                                expanded = showSortDropdown,
                                onDismissRequest = { showSortDropdown = false }
                            ) {
                                PoSortOption.values().forEach { opt ->
                                    DropdownMenuItem(
                                        text = { Text(opt.displayName, fontSize = 12.sp) },
                                        onClick = {
                                            onFilterChange(filterState.copy(sortBy = opt))
                                            showSortDropdown = false
                                        },
                                        leadingIcon = {
                                            if (filterState.sortBy == opt) {
                                                Icon(Icons.Default.Check, contentDescription = null, tint = StatusSuccess, modifier = Modifier.size(16.dp))
                                            }
                                        }
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Apply / Done button
                    Button(
                        onClick = { isFilterPanelExpanded = false },
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("apply_po_filters_button")
                    ) {
                        Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Show $filteredOrdersCount Matching Orders", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Active Filter Chips Bar (rendered when filters are applied)
        if (filterState.hasActiveFilters) {
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Active:",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                // Search Query Chip
                if (filterState.searchQuery.isNotBlank()) {
                    ActiveFilterRemovableChip(
                        label = "\"${filterState.searchQuery}\"",
                        onRemove = { onFilterChange(filterState.copy(searchQuery = "")) },
                        testTag = "remove_search_filter_chip"
                    )
                }

                // Supplier Chip
                if (filterState.selectedSupplierName != null) {
                    ActiveFilterRemovableChip(
                        label = "Supplier: ${filterState.selectedSupplierName}",
                        onRemove = { onFilterChange(filterState.copy(selectedSupplierName = null)) },
                        testTag = "remove_supplier_filter_chip"
                    )
                }

                // Status Chip
                if (filterState.selectedStatus != null) {
                    ActiveFilterRemovableChip(
                        label = "Status: ${filterState.selectedStatus.displayName}",
                        onRemove = { onFilterChange(filterState.copy(selectedStatus = null)) },
                        testTag = "remove_status_filter_chip"
                    )
                }

                // Date Range Chip
                if (filterState.dateRangePreset != DateRangePreset.ALL_TIME) {
                    ActiveFilterRemovableChip(
                        label = "Date: ${filterState.getDateRangeText()}",
                        onRemove = {
                            onFilterChange(
                                filterState.copy(
                                    dateRangePreset = DateRangePreset.ALL_TIME,
                                    customStartDate = null,
                                    customEndDate = null
                                )
                            )
                        },
                        testTag = "remove_date_filter_chip"
                    )
                }

                // Clear All Button
                Surface(
                    shape = RoundedCornerShape(50),
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f),
                    modifier = Modifier.clickable {
                        onFilterChange(
                            PoFilterState(
                                searchQuery = "",
                                selectedSupplierName = null,
                                selectedStatus = null,
                                selectedWorkflowCategory = filterState.selectedWorkflowCategory,
                                dateRangePreset = DateRangePreset.ALL_TIME,
                                customStartDate = null,
                                customEndDate = null,
                                sortBy = filterState.sortBy
                            )
                        )
                    }
                ) {
                    Text(
                        text = "Clear All",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = StatusError,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }
        }

        // Summary Bar (Count + Value sum)
        Spacer(modifier = Modifier.height(6.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Showing $filteredOrdersCount of $totalOrdersCount purchase orders",
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            if (filteredOrdersCount > 0) {
                Text(
                    text = "Total Value: ${formatCurrency(filteredOrdersSum)}",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
    }

    // Custom Date Range Modal Dialog
    if (showCustomDateDialog) {
        PoCustomDateRangeDialog(
            initialStart = filterState.customStartDate ?: (System.currentTimeMillis() - 14 * 86400000L),
            initialEnd = filterState.customEndDate ?: System.currentTimeMillis(),
            onDismiss = { showCustomDateDialog = false },
            onConfirm = { start, end ->
                onFilterChange(
                    filterState.copy(
                        dateRangePreset = DateRangePreset.CUSTOM,
                        customStartDate = start,
                        customEndDate = end
                    )
                )
                showCustomDateDialog = false
            }
        )
    }
}

/**
 * Removable Pill Chip for active filters
 */
@Composable
private fun ActiveFilterRemovableChip(
    label: String,
    onRemove: () -> Unit,
    testTag: String
) {
    Surface(
        shape = RoundedCornerShape(50),
        color = MaterialTheme.colorScheme.primaryContainer,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.4f)),
        modifier = Modifier.testTag(testTag)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(start = 8.dp, end = 4.dp, top = 2.dp, bottom = 2.dp)
        ) {
            Text(
                text = label,
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onPrimaryContainer
            )
            Spacer(modifier = Modifier.width(4.dp))
            Box(
                modifier = Modifier
                    .size(16.dp)
                    .clip(CircleShape)
                    .clickable { onRemove() }
                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "Remove filter",
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(10.dp)
                )
            }
        }
    }
}

/**
 * Custom Start/End Date Range Selection Dialog
 */
@Composable
fun PoCustomDateRangeDialog(
    initialStart: Long,
    initialEnd: Long,
    onDismiss: () -> Unit,
    onConfirm: (start: Long, end: Long) -> Unit
) {
    var startDateMillis by remember { mutableStateOf(initialStart) }
    var endDateMillis by remember { mutableStateOf(initialEnd) }

    val sdf = remember { SimpleDateFormat("dd MMMM yyyy", Locale.getDefault()) }

    androidx.compose.material3.AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.DateRange,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("Select Date Range", fontSize = 18.sp, fontWeight = FontWeight.Bold)
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Text(
                    text = "Filter purchase orders by order date.",
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                // Start Date Selector Card
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                    border = BorderStroke(1.dp, BentoBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(
                            text = "START DATE",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = sdf.format(Date(startDateMillis)),
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            OutlinedButton(
                                onClick = { startDateMillis -= (7 * 86400000L) },
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("-7 Days", fontSize = 10.sp)
                            }
                            OutlinedButton(
                                onClick = { startDateMillis -= (30 * 86400000L) },
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("-30 Days", fontSize = 10.sp)
                            }
                            Button(
                                onClick = { startDateMillis = System.currentTimeMillis() },
                                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("Today", fontSize = 10.sp)
                            }
                        }
                    }
                }

                // End Date Selector Card
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                    border = BorderStroke(1.dp, BentoBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(
                            text = "END DATE",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = sdf.format(Date(endDateMillis)),
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            OutlinedButton(
                                onClick = { endDateMillis -= (7 * 86400000L) },
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("-7 Days", fontSize = 10.sp)
                            }
                            OutlinedButton(
                                onClick = { endDateMillis += (7 * 86400000L) },
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("+7 Days", fontSize = 10.sp)
                            }
                            Button(
                                onClick = { endDateMillis = System.currentTimeMillis() },
                                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("Today", fontSize = 10.sp)
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val start = minOf(startDateMillis, endDateMillis)
                    val end = maxOf(startDateMillis, endDateMillis)
                    onConfirm(start, end)
                },
                modifier = Modifier.testTag("confirm_custom_date_range_button")
            ) {
                Text("Apply Range")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
