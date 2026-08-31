package com.example.data.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.example.data.dao.AuditDao
import com.example.data.dao.CategoryDao
import com.example.data.dao.DeliveryDao
import com.example.data.dao.InventoryDao
import com.example.data.dao.NotificationDao
import com.example.data.dao.ProductDao
import com.example.data.dao.PurchaseOrderDao
import com.example.data.dao.PurchaseRequestDao
import com.example.data.dao.SupplierDao
import com.example.data.dao.SupplierRatingDao
import com.example.data.dao.SystemSettingsDao
import com.example.data.dao.UserDao
import com.example.data.entity.AuditLogEntity
import com.example.data.entity.CategoryEntity
import com.example.data.entity.DeliveryEntity
import com.example.data.entity.DeliveryTrackingCheckpointEntity
import com.example.data.entity.InventoryTransactionEntity
import com.example.data.entity.NotificationEntity
import com.example.data.entity.ProductEntity
import com.example.data.entity.PurchaseOrderEntity
import com.example.data.entity.PurchaseOrderItemEntity
import com.example.data.entity.PurchaseRequestEntity
import com.example.data.entity.PurchaseRequestItemEntity
import com.example.data.entity.SupplierEntity
import com.example.data.entity.SupplierPerformanceRatingEntity
import com.example.data.entity.SystemSettingsEntity
import com.example.data.entity.UserEntity

@Database(
    entities = [
        UserEntity::class,
        CategoryEntity::class,
        ProductEntity::class,
        SupplierEntity::class,
        SupplierPerformanceRatingEntity::class,
        PurchaseRequestEntity::class,
        PurchaseRequestItemEntity::class,
        PurchaseOrderEntity::class,
        PurchaseOrderItemEntity::class,
        DeliveryEntity::class,
        DeliveryTrackingCheckpointEntity::class,
        InventoryTransactionEntity::class,
        NotificationEntity::class,
        AuditLogEntity::class,
        SystemSettingsEntity::class
    ],
    version = 3,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class ProcurementDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
    abstract fun categoryDao(): CategoryDao
    abstract fun productDao(): ProductDao
    abstract fun supplierDao(): SupplierDao
    abstract fun supplierRatingDao(): SupplierRatingDao
    abstract fun purchaseRequestDao(): PurchaseRequestDao
    abstract fun purchaseOrderDao(): PurchaseOrderDao
    abstract fun deliveryDao(): DeliveryDao
    abstract fun inventoryDao(): InventoryDao
    abstract fun notificationDao(): NotificationDao
    abstract fun auditDao(): AuditDao
    abstract fun systemSettingsDao(): SystemSettingsDao

    companion object {
        @Volatile
        private var INSTANCE: ProcurementDatabase? = null

        fun getDatabase(context: Context): ProcurementDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    ProcurementDatabase::class.java,
                    "smart_procurement.db"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}
