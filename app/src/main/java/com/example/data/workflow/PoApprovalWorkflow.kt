package com.example.data.workflow

import com.example.data.entity.PurchaseOrderEntity
import com.example.data.entity.SystemSettingsEntity
import com.example.data.entity.UserEntity
import com.example.data.model.OrderStatus
import com.example.data.model.UserRole
import org.json.JSONArray
import org.json.JSONObject
import java.security.MessageDigest
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Enterprise Hierarchical Approval Value Tiers
 */
enum class PoApprovalTier(
    val tierCode: String,
    val title: String,
    val description: String,
    val requiredSignaturesCount: Int,
    val minThreshold: Double,
    val maxThreshold: Double
) {
    TIER_1_STANDARD(
        tierCode = "TIER-1",
        title = "Tier 1: Standard Line Sign-Off",
        description = "Total Value < ₹25,000 • Single Line Manager Signature Required",
        requiredSignaturesCount = 1,
        minThreshold = 0.0,
        maxThreshold = 25000.0
    ),
    TIER_2_MID_VALUE(
        tierCode = "TIER-2",
        title = "Tier 2: Mid-Value Dual Sign-Off",
        description = "Total Value ₹25,000 - ₹1,00,000 • Dual Department & Procurement Signatures Required",
        requiredSignaturesCount = 2,
        minThreshold = 25000.0,
        maxThreshold = 100000.0
    ),
    TIER_3_HIGH_VALUE(
        tierCode = "TIER-3",
        title = "Tier 3: High-Value Triple Sign-Off",
        description = "Total Value ₹1,00,000 - ₹5,00,000 • Department, Procurement & Finance Director Signatures",
        requiredSignaturesCount = 3,
        minThreshold = 100000.0,
        maxThreshold = 500000.0
    ),
    TIER_4_ENTERPRISE(
        tierCode = "TIER-4",
        title = "Tier 4: Enterprise Executive Board Sign-Off",
        description = "Total Value > ₹5,00,000 • Full 4-Level Executive CFO & Board Authorization",
        requiredSignaturesCount = 4,
        minThreshold = 500000.0,
        maxThreshold = Double.MAX_VALUE
    )
}

/**
 * Individual Signature Level in the Approval Chain
 */
data class PoApprovalStepInfo(
    val level: Int,
    val title: String,
    val shortRoleTitle: String,
    val requiredRole: UserRole,
    val authorityScope: String,
    val isSigned: Boolean = false,
    val signerUserId: String? = null,
    val signerName: String? = null,
    val signerRole: String? = null,
    val signedAt: Long? = null,
    val remarks: String? = null,
    val signatureCertificate: String? = null
)

object PoApprovalWorkflowEngine {

    /**
     * Determines which approval tier applies based on total order amount and settings thresholds
     */
    fun determineTier(
        totalAmount: Double,
        settings: SystemSettingsEntity? = null
    ): PoApprovalTier {
        val t1 = settings?.poThresholdTier1 ?: 25000.0
        val t2 = settings?.poThresholdTier2 ?: 100000.0
        val t3 = settings?.poThresholdTier3 ?: 500000.0

        return when {
            totalAmount <= t1 -> PoApprovalTier.TIER_1_STANDARD
            totalAmount <= t2 -> PoApprovalTier.TIER_2_MID_VALUE
            totalAmount <= t3 -> PoApprovalTier.TIER_3_HIGH_VALUE
            else -> PoApprovalTier.TIER_4_ENTERPRISE
        }
    }

    /**
     * Generates the hierarchical signature chain required for the order amount
     */
    fun buildApprovalChain(
        totalAmount: Double,
        settings: SystemSettingsEntity? = null
    ): List<PoApprovalStepInfo> {
        val tier = determineTier(totalAmount, settings)
        val chain = mutableListOf<PoApprovalStepInfo>()

        // Level 1: Always required (Department / Line Manager)
        chain.add(
            PoApprovalStepInfo(
                level = 1,
                title = "Level 1: Department Manager Sign-Off",
                shortRoleTitle = "Dept Approving Manager",
                requiredRole = UserRole.MANAGER,
                authorityScope = "Requisition & Budget Verification"
            )
        )

        // Level 2: Required for Tier 2 and above
        if (tier.requiredSignaturesCount >= 2) {
            chain.add(
                PoApprovalStepInfo(
                    level = 2,
                    title = "Level 2: Procurement Head Sign-Off",
                    shortRoleTitle = "Procurement Manager",
                    requiredRole = UserRole.PROCUREMENT_MANAGER,
                    authorityScope = "Vendor Pricing & Commercial Compliance"
                )
            )
        }

        // Level 3: Required for Tier 3 and above
        if (tier.requiredSignaturesCount >= 3) {
            chain.add(
                PoApprovalStepInfo(
                    level = 3,
                    title = "Level 3: Finance Director Sign-Off",
                    shortRoleTitle = "Finance Director / VP Ops",
                    requiredRole = UserRole.ADMIN,
                    authorityScope = "CapEx/OpEx Fiscal Authorization"
                )
            )
        }

        // Level 4: Required for Tier 4 (Enterprise Scale)
        if (tier.requiredSignaturesCount >= 4) {
            chain.add(
                PoApprovalStepInfo(
                    level = 4,
                    title = "Level 4: Chief Financial Officer (CFO) Sign-Off",
                    shortRoleTitle = "Executive CFO / Board",
                    requiredRole = UserRole.ADMIN,
                    authorityScope = "Executive Board Governance & Treasury Release"
                )
            )
        }

        return chain
    }

    /**
     * Serializes approval steps to JSON
     */
    fun serializeSignatures(steps: List<PoApprovalStepInfo>): String {
        val array = JSONArray()
        steps.forEach { step ->
            val obj = JSONObject()
            obj.put("level", step.level)
            obj.put("title", step.title)
            obj.put("shortRoleTitle", step.shortRoleTitle)
            obj.put("requiredRole", step.requiredRole.name)
            obj.put("authorityScope", step.authorityScope)
            obj.put("isSigned", step.isSigned)
            obj.put("signerUserId", step.signerUserId ?: "")
            obj.put("signerName", step.signerName ?: "")
            obj.put("signerRole", step.signerRole ?: "")
            obj.put("signedAt", step.signedAt ?: 0L)
            obj.put("remarks", step.remarks ?: "")
            obj.put("signatureCertificate", step.signatureCertificate ?: "")
            array.put(obj)
        }
        return array.toString()
    }

    /**
     * Parses approval steps from JSON or builds default chain
     */
    fun parseSignatures(
        json: String?,
        totalAmount: Double,
        settings: SystemSettingsEntity? = null
    ): List<PoApprovalStepInfo> {
        if (json.isNullOrBlank() || json == "[]") {
            return buildApprovalChain(totalAmount, settings)
        }

        return try {
            val array = JSONArray(json)
            val list = mutableListOf<PoApprovalStepInfo>()
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                val roleName = obj.optString("requiredRole", UserRole.MANAGER.name)
                val requiredRole = try {
                    UserRole.valueOf(roleName)
                } catch (e: Exception) {
                    UserRole.MANAGER
                }
                list.add(
                    PoApprovalStepInfo(
                        level = obj.optInt("level", i + 1),
                        title = obj.optString("title", "Level ${i + 1} Sign-Off"),
                        shortRoleTitle = obj.optString("shortRoleTitle", requiredRole.displayName),
                        requiredRole = requiredRole,
                        authorityScope = obj.optString("authorityScope", "Procurement Authorization"),
                        isSigned = obj.optBoolean("isSigned", false),
                        signerUserId = obj.optString("signerUserId").takeIf { it.isNotBlank() },
                        signerName = obj.optString("signerName").takeIf { it.isNotBlank() },
                        signerRole = obj.optString("signerRole").takeIf { it.isNotBlank() },
                        signedAt = obj.optLong("signedAt").takeIf { it > 0L },
                        remarks = obj.optString("remarks").takeIf { it.isNotBlank() },
                        signatureCertificate = obj.optString("signatureCertificate").takeIf { it.isNotBlank() }
                    )
                )
            }
            if (list.isEmpty()) buildApprovalChain(totalAmount, settings) else list
        } catch (e: Exception) {
            buildApprovalChain(totalAmount, settings)
        }
    }

    /**
     * Checks if a user has sufficient hierarchical role authority to sign the current pending step
     */
    fun canUserSignCurrentLevel(
        order: PurchaseOrderEntity,
        user: UserEntity,
        currentStep: PoApprovalStepInfo?
    ): Boolean {
        if (order.status != OrderStatus.PENDING_APPROVAL) return false
        if (order.isFullyApproved) return false
        if (currentStep == null) return false

        // Admin has executive bypass / universal signing authority
        if (user.role == UserRole.ADMIN) return true

        return when (currentStep.level) {
            1 -> user.role == UserRole.MANAGER || user.role == UserRole.PROCUREMENT_MANAGER
            2 -> user.role == UserRole.PROCUREMENT_MANAGER
            3 -> user.role == UserRole.ADMIN // Finance Director
            4 -> user.role == UserRole.ADMIN // CFO
            else -> false
        }
    }

    /**
     * Generates a tamper-evident digital certificate stamp for the signature
     */
    fun generateDigitalCertificate(
        poNumber: String,
        level: Int,
        user: UserEntity,
        timestamp: Long
    ): String {
        val raw = "$poNumber|LVL-$level|${user.id}|${user.role.name}|$timestamp|SMARTPROCURE_SECRET"
        val hash = try {
            val md = MessageDigest.getInstance("SHA-256")
            val bytes = md.digest(raw.toByteArray())
            bytes.joinToString("") { "%02x".format(it) }.take(12).uppercase()
        } catch (e: Exception) {
            "${(100000..999999).random()}"
        }
        val dateStr = SimpleDateFormat("yyyyMMdd", Locale.US).format(Date(timestamp))
        return "CERT-$dateStr-$poNumber-L$level-$hash"
    }
}
