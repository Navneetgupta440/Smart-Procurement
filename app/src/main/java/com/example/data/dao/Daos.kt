package com.example.data.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import androidx.room.Update
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
import com.example.data.model.DeliveryStatus
import com.example.data.model.OrderStatus
import com.example.data.model.RequestStatus
import com.example.data.model.UserRole
import kotlinx.coroutines.flow.Flow

@Dao
interface UserDao {
    @Query("SELECT * FROM users ORDER BY name ASC")
    fun getAllUsers(): Flow<List<UserEntity>>

    @Query("SELECT * FROM users WHERE id = :userId")
    suspend fun getUserById(userId: String): UserEntity?

    @Query("SELECT * FROM users WHERE LOWER(email) = LOWER(:email) LIMIT 1")
    suspend fun getUserByEmail(email: String): UserEntity?

    @Query("SELECT * FROM users WHERE role = :role LIMIT 1")
    suspend fun getFirstUserByRole(role: UserRole): UserEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUsers(users: List<UserEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUser(user: UserEntity)

    @Update
    suspend fun updateUser(user: UserEntity)
}

@Dao
interface ProductDao {
    @Query("SELECT * FROM products ORDER BY name ASC")
    fun getAllProducts(): Flow<List<ProductEntity>>

    @Query("SELECT * FROM products WHERE id = :id")
    suspend fun getProductById(id: String): ProductEntity?

    @Query("SELECT * FROM products WHERE availableQuantity <= minimumStock ORDER BY availableQuantity ASC")
    fun getLowStockProducts(): Flow<List<ProductEntity>>

    @Query("SELECT * FROM products WHERE categoryId = :categoryId")
    fun getProductsByCategory(categoryId: String): Flow<List<ProductEntity>>

    @Query("SELECT * FROM products WHERE supplierId = :supplierId")
    fun getProductsBySupplier(supplierId: String): Flow<List<ProductEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProducts(products: List<ProductEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProduct(product: ProductEntity)

    @Update
    suspend fun updateProduct(product: ProductEntity)

    @Query("UPDATE products SET availableQuantity = availableQuantity + :quantityDelta, updatedAt = :timestamp WHERE id = :productId")
    suspend fun adjustStock(productId: String, quantityDelta: Int, timestamp: Long = System.currentTimeMillis())

    @Query("DELETE FROM products WHERE id = :id")
    suspend fun deleteProduct(id: String)
}

@Dao
interface CategoryDao {
    @Query("SELECT * FROM categories ORDER BY name ASC")
    fun getAllCategories(): Flow<List<CategoryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCategories(categories: List<CategoryEntity>)
}

@Dao
interface SupplierDao {
    @Query("SELECT * FROM suppliers ORDER BY companyName ASC")
    fun getAllSuppliers(): Flow<List<SupplierEntity>>

    @Query("SELECT * FROM suppliers WHERE id = :id")
    suspend fun getSupplierById(id: String): SupplierEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSuppliers(suppliers: List<SupplierEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSupplier(supplier: SupplierEntity)

    @Update
    suspend fun updateSupplier(supplier: SupplierEntity)
}

@Dao
interface PurchaseRequestDao {
    @Query("SELECT * FROM purchase_requests ORDER BY createdAt DESC")
    fun getAllRequests(): Flow<List<PurchaseRequestEntity>>

    @Query("SELECT * FROM purchase_requests WHERE status = :status ORDER BY createdAt DESC")
    fun getRequestsByStatus(status: RequestStatus): Flow<List<PurchaseRequestEntity>>

    @Query("SELECT * FROM purchase_requests WHERE requestedByUserId = :userId ORDER BY createdAt DESC")
    fun getRequestsByUser(userId: String): Flow<List<PurchaseRequestEntity>>

    @Query("SELECT * FROM purchase_requests WHERE id = :id")
    suspend fun getRequestById(id: String): PurchaseRequestEntity?

    @Query("SELECT * FROM purchase_request_items WHERE purchaseRequestId = :requestId")
    fun getItemsForRequest(requestId: String): Flow<List<PurchaseRequestItemEntity>>

    @Query("SELECT * FROM purchase_request_items WHERE purchaseRequestId = :requestId")
    suspend fun getItemsForRequestSync(requestId: String): List<PurchaseRequestItemEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRequest(request: PurchaseRequestEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRequestItems(items: List<PurchaseRequestItemEntity>)

    @Update
    suspend fun updateRequest(request: PurchaseRequestEntity)
}

@Dao
interface PurchaseOrderDao {
    @Query("SELECT * FROM purchase_orders ORDER BY createdAt DESC")
    fun getAllPurchaseOrders(): Flow<List<PurchaseOrderEntity>>

    @Query("SELECT * FROM purchase_orders WHERE supplierId = :supplierId ORDER BY createdAt DESC")
    fun getOrdersBySupplier(supplierId: String): Flow<List<PurchaseOrderEntity>>

    @Query("SELECT * FROM purchase_orders WHERE status = :status ORDER BY createdAt DESC")
    fun getOrdersByStatus(status: OrderStatus): Flow<List<PurchaseOrderEntity>>

    @Query("SELECT * FROM purchase_orders WHERE id = :id")
    suspend fun getOrderById(id: String): PurchaseOrderEntity?

    @Query("SELECT * FROM purchase_order_items WHERE purchaseOrderId = :orderId")
    fun getItemsForOrder(orderId: String): Flow<List<PurchaseOrderItemEntity>>

    @Query("SELECT * FROM purchase_order_items WHERE purchaseOrderId = :orderId")
    suspend fun getItemsForOrderSync(orderId: String): List<PurchaseOrderItemEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrder(order: PurchaseOrderEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrderItems(items: List<PurchaseOrderItemEntity>)

    @Update
    suspend fun updateOrder(order: PurchaseOrderEntity)
}

@Dao
interface DeliveryDao {
    @Query("SELECT * FROM deliveries ORDER BY lastUpdated DESC")
    fun getAllDeliveries(): Flow<List<DeliveryEntity>>

    @Query("SELECT * FROM deliveries WHERE purchaseOrderId = :poId LIMIT 1")
    suspend fun getDeliveryByOrderId(poId: String): DeliveryEntity?

    @Query("SELECT * FROM deliveries WHERE id = :id")
    suspend fun getDeliveryById(id: String): DeliveryEntity?

    @Query("SELECT * FROM delivery_tracking_checkpoints WHERE deliveryId = :deliveryId ORDER BY timestamp ASC")
    fun getCheckpointsForDelivery(deliveryId: String): Flow<List<DeliveryTrackingCheckpointEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDelivery(delivery: DeliveryEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCheckpoints(checkpoints: List<DeliveryTrackingCheckpointEntity>)

    @Update
    suspend fun updateDelivery(delivery: DeliveryEntity)
}

@Dao
interface InventoryDao {
    @Query("SELECT * FROM inventory_transactions ORDER BY timestamp DESC")
    fun getAllTransactions(): Flow<List<InventoryTransactionEntity>>

    @Query("SELECT * FROM inventory_transactions WHERE productId = :productId ORDER BY timestamp DESC")
    fun getTransactionsByProduct(productId: String): Flow<List<InventoryTransactionEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransaction(transaction: InventoryTransactionEntity)
}

@Dao
interface NotificationDao {
    @Query("SELECT * FROM notifications ORDER BY timestamp DESC")
    fun getAllNotifications(): Flow<List<NotificationEntity>>

    @Query("SELECT COUNT(*) FROM notifications WHERE isRead = 0")
    fun getUnreadCount(): Flow<Int>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNotification(notification: NotificationEntity)

    @Query("UPDATE notifications SET isRead = 1 WHERE id = :id")
    suspend fun markAsRead(id: String)

    @Query("UPDATE notifications SET isRead = 1")
    suspend fun markAllAsRead()

    @Query("DELETE FROM notifications WHERE id = :id")
    suspend fun deleteNotification(id: String)
}

@Dao
interface AuditDao {
    @Query("SELECT * FROM audit_logs ORDER BY timestamp DESC")
    fun getAllAuditLogs(): Flow<List<AuditLogEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAuditLog(log: AuditLogEntity)
}

@Dao
interface SystemSettingsDao {
    @Query("SELECT * FROM system_settings WHERE id = 'GLOBAL_CONFIG' LIMIT 1")
    fun getSettings(): Flow<SystemSettingsEntity?>

    @Query("SELECT * FROM system_settings WHERE id = 'GLOBAL_CONFIG' LIMIT 1")
    suspend fun getSettingsSync(): SystemSettingsEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveSettings(settings: SystemSettingsEntity)
}

@Dao
interface SupplierRatingDao {
    @Query("SELECT * FROM supplier_ratings ORDER BY ratingDate DESC")
    fun getAllRatings(): Flow<List<SupplierPerformanceRatingEntity>>

    @Query("SELECT * FROM supplier_ratings WHERE supplierId = :supplierId ORDER BY ratingDate DESC")
    fun getRatingsForSupplier(supplierId: String): Flow<List<SupplierPerformanceRatingEntity>>

    @Query("SELECT * FROM supplier_ratings WHERE supplierId = :supplierId")
    suspend fun getRatingsForSupplierSync(supplierId: String): List<SupplierPerformanceRatingEntity>

    @Query("SELECT AVG(overallScore) FROM supplier_ratings WHERE supplierId = :supplierId")
    fun getAverageScoreForSupplier(supplierId: String): Flow<Double?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRating(rating: SupplierPerformanceRatingEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRatings(ratings: List<SupplierPerformanceRatingEntity>)

    @Query("DELETE FROM supplier_ratings WHERE id = :id")
    suspend fun deleteRating(id: String)
}
