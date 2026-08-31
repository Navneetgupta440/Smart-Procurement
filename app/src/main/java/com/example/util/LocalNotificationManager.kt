package com.example.util

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.example.MainActivity
import java.text.NumberFormat
import java.util.Locale
import java.util.UUID

/**
 * Data model for high-value purchase order alerts in the UI and notification center.
 */
data class HighValueOrderAlert(
    val id: String = UUID.randomUUID().toString(),
    val poNumber: String,
    val amount: Double,
    val isApproved: Boolean,
    val isFullyApproved: Boolean = true,
    val actorName: String,
    val actorRole: String = "Approver",
    val remarksOrReason: String = "",
    val currentLevel: Int = 1,
    val requiredLevel: Int = 1,
    val timestamp: Long = System.currentTimeMillis()
)

object LocalNotificationManager {

    const val CHANNEL_ID = "procurement_high_value_channel"
    private const val CHANNEL_NAME = "High-Value Order Alerts"
    private const val CHANNEL_DESCRIPTION = "Alerts triggered when high-value purchase orders are approved or rejected."
    
    // Threshold above which an order is treated as high-value (₹50,000)
    const val HIGH_VALUE_THRESHOLD: Double = 50000.0

    fun isHighValue(amount: Double): Boolean = amount >= HIGH_VALUE_THRESHOLD

    /**
     * Initializes the Notification Channel for Android Oreo (API 26) and above.
     */
    fun initNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(CHANNEL_ID, CHANNEL_NAME, importance).apply {
                description = CHANNEL_DESCRIPTION
                enableLights(true)
                lightColor = Color.BLUE
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 300, 200, 300)
                setShowBadge(true)
            }
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
            notificationManager?.createNotificationChannel(channel)
        }
    }

    /**
     * Displays a system-level local notification for high-value purchase order approval or rejection.
     */
    fun showHighValueOrderNotification(
        context: Context,
        poNumber: String,
        amount: Double,
        isApproved: Boolean,
        isFullyApproved: Boolean,
        actorName: String,
        actorRole: String = "Approver",
        remarksOrReason: String = "",
        currentLevel: Int = 1,
        requiredLevel: Int = 1
    ): Int {
        initNotificationChannel(context)

        // Check POST_NOTIFICATIONS permission on Android 13+ (API 33)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED
            ) {
                Log.w("LocalNotificationManager", "POST_NOTIFICATIONS permission not granted; skipping system tray notification")
                return -1
            }
        }

        val formattedAmount = formatCurrency(amount)
        val notificationId = (System.currentTimeMillis() % 100000).toInt() + 1000

        val (title, summaryText, iconColor) = when {
            isApproved && isFullyApproved -> Triple(
                "🚨 High-Value PO Approved: $poNumber",
                "PO $poNumber for $formattedAmount was fully approved by $actorName ($actorRole) and released to supplier.",
                0xFF10B981.toInt() // Emerald Green
            )
            isApproved -> Triple(
                "✍️ High-Value PO Signed: $poNumber",
                "Tier $currentLevel/$requiredLevel signed by $actorName ($actorRole) for $formattedAmount. Awaiting next authorization level.",
                0xFF0284C7.toInt() // Ocean Blue
            )
            else -> Triple(
                "⚠️ High-Value PO Rejected: $poNumber",
                "PO $poNumber for $formattedAmount was REJECTED by $actorName ($actorRole). Reason: ${remarksOrReason.ifBlank { "Budget or policy conflict" }}",
                0xFFEF4444.toInt() // Crimson Red
            )
        }

        val bigText = buildString {
            append("• Order Total: $formattedAmount\n")
            append("• Authorized By: $actorName ($actorRole)\n")
            if (isApproved) {
                append("• Status: ${if (isFullyApproved) "Fully Released & Dispatched to Supplier" else "Level $currentLevel of $requiredLevel Signed"}\n")
                if (remarksOrReason.isNotBlank()) {
                    append("• Remarks: $remarksOrReason")
                }
            } else {
                append("• Status: Cancelled / Rejected\n")
                append("• Reason: ${remarksOrReason.ifBlank { "Budget or compliance hold" }}")
            }
        }

        // Tap action opens MainActivity
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("EXTRA_PO_NUMBER", poNumber)
            putExtra("EXTRA_NAV_TAB", "ORDERS")
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            notificationId,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val smallIconRes = if (isApproved) {
            android.R.drawable.stat_notify_chat
        } else {
            android.R.drawable.stat_notify_error
        }

        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(smallIconRes)
            .setContentTitle(title)
            .setContentText(summaryText)
            .setStyle(NotificationCompat.BigTextStyle().bigText(bigText).setSummaryText("Smart Procurement • High-Value Alert"))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setDefaults(NotificationCompat.DEFAULT_ALL)
            .setAutoCancel(true)
            .setColor(iconColor)
            .setContentIntent(pendingIntent)

        try {
            val notificationManagerCompat = NotificationManagerCompat.from(context)
            if (notificationManagerCompat.areNotificationsEnabled()) {
                notificationManagerCompat.notify(notificationId, builder.build())
            }
        } catch (e: SecurityException) {
            Log.e("LocalNotificationManager", "SecurityException posting notification: ${e.message}")
        } catch (e: Exception) {
            Log.e("LocalNotificationManager", "Failed to post notification: ${e.message}")
        }

        return notificationId
    }

    private fun formatCurrency(amount: Double): String {
        return try {
            val formatter = NumberFormat.getCurrencyInstance(Locale("en", "IN"))
            formatter.maximumFractionDigits = 0
            formatter.format(amount)
        } catch (e: Exception) {
            "₹${String.format("%,.0f", amount)}"
        }
    }
}
