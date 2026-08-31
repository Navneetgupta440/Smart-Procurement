package com.example.data.database

import androidx.room.TypeConverter
import com.example.data.model.AuditAction
import com.example.data.model.DeliveryStatus
import com.example.data.model.MembershipPlan
import com.example.data.model.NotificationChannel
import com.example.data.model.NotificationEventType
import com.example.data.model.OrderStatus
import com.example.data.model.Priority
import com.example.data.model.RequestStatus
import com.example.data.model.TransactionType
import com.example.data.model.UserRole

class Converters {
    @TypeConverter
    fun fromUserRole(value: UserRole): String = value.name

    @TypeConverter
    fun toUserRole(value: String): UserRole = try {
        UserRole.valueOf(value)
    } catch (e: Exception) {
        UserRole.EMPLOYEE
    }

    @TypeConverter
    fun fromPriority(value: Priority): String = value.name

    @TypeConverter
    fun toPriority(value: String): Priority = try {
        Priority.valueOf(value)
    } catch (e: Exception) {
        Priority.MEDIUM
    }

    @TypeConverter
    fun fromRequestStatus(value: RequestStatus): String = value.name

    @TypeConverter
    fun toRequestStatus(value: String): RequestStatus = try {
        RequestStatus.valueOf(value)
    } catch (e: Exception) {
        RequestStatus.DRAFT
    }

    @TypeConverter
    fun fromOrderStatus(value: OrderStatus): String = value.name

    @TypeConverter
    fun toOrderStatus(value: String): OrderStatus = try {
        OrderStatus.valueOf(value)
    } catch (e: Exception) {
        OrderStatus.DRAFT
    }

    @TypeConverter
    fun fromDeliveryStatus(value: DeliveryStatus): String = value.name

    @TypeConverter
    fun toDeliveryStatus(value: String): DeliveryStatus = try {
        DeliveryStatus.valueOf(value)
    } catch (e: Exception) {
        DeliveryStatus.CREATED
    }

    @TypeConverter
    fun fromTransactionType(value: TransactionType): String = value.name

    @TypeConverter
    fun toTransactionType(value: String): TransactionType = try {
        TransactionType.valueOf(value)
    } catch (e: Exception) {
        TransactionType.PURCHASE_RECEIPT
    }

    @TypeConverter
    fun fromNotificationChannel(value: NotificationChannel): String = value.name

    @TypeConverter
    fun toNotificationChannel(value: String): NotificationChannel = try {
        NotificationChannel.valueOf(value)
    } catch (e: Exception) {
        NotificationChannel.IN_APP
    }

    @TypeConverter
    fun fromNotificationEventType(value: NotificationEventType): String = value.name

    @TypeConverter
    fun toNotificationEventType(value: String): NotificationEventType = try {
        NotificationEventType.valueOf(value)
    } catch (e: Exception) {
        NotificationEventType.SYSTEM
    }

    @TypeConverter
    fun fromAuditAction(value: AuditAction): String = value.name

    @TypeConverter
    fun toAuditAction(value: String): AuditAction = try {
        AuditAction.valueOf(value)
    } catch (e: Exception) {
        AuditAction.LOGIN
    }

    @TypeConverter
    fun fromMembershipPlan(value: MembershipPlan): String = value.name

    @TypeConverter
    fun toMembershipPlan(value: String): MembershipPlan = try {
        MembershipPlan.valueOf(value)
    } catch (e: Exception) {
        MembershipPlan.STARTER
    }
}
