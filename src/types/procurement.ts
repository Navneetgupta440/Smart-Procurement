export enum UserRole {
  ADMIN = 'ADMIN',
  PROCUREMENT_MANAGER = 'PROCUREMENT_MANAGER',
  APPROVING_MANAGER = 'APPROVING_MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  CUSTOMER = 'CUSTOMER',
  SUPPLIER = 'SUPPLIER',
  DELIVERY_AGENT = 'DELIVERY_AGENT',
}

export const USER_ROLE_DETAILS: Record<UserRole, { displayName: string; badgeColor: string; description: string }> = {
  [UserRole.ADMIN]: {
    displayName: 'Administrator',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-950 dark:text-purple-200',
    description: 'Universal administrative rights and overrides',
  },
  [UserRole.PROCUREMENT_MANAGER]: {
    displayName: 'Procurement Manager',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-950 dark:text-blue-200',
    description: 'PO authoring, supplier evaluations, mid-level approvals',
  },
  [UserRole.APPROVING_MANAGER]: {
    displayName: 'Approving Manager',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200',
    description: 'Departmental budget holder & Level 1 approvals',
  },
  [UserRole.EMPLOYEE]: {
    displayName: 'Requisitioner',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200',
    description: 'Purchase request author & department staff',
  },
  [UserRole.CUSTOMER]: {
    displayName: 'Internal Client',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-200',
    description: 'Project initiator and delivery recipient',
  },
  [UserRole.SUPPLIER]: {
    displayName: 'Supplier / Vendor',
    badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-200',
    description: 'Order fulfillment, quotation & dispatch manifest',
  },
  [UserRole.DELIVERY_AGENT]: {
    displayName: 'Delivery Agent',
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-200 dark:bg-orange-950 dark:text-orange-200',
    description: 'Logistics tracking, transit checkpoints & dock delivery',
  },
};

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum RequestStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CONVERTED_TO_PO = 'CONVERTED_TO_PO',
}

export enum OrderStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  SENT_TO_SUPPLIER = 'SENT_TO_SUPPLIER',
  SUPPLIER_ACCEPTED = 'SUPPLIER_ACCEPTED',
  SUPPLIER_REJECTED = 'SUPPLIER_REJECTED',
  DISPATCHED = 'DISPATCHED',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum DeliveryStatus {
  PENDING = 'PENDING',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  RETURNED = 'RETURNED',
}

export enum TransactionType {
  PURCHASE_RECEIPT = 'PURCHASE_RECEIPT',
  ISSUE = 'ISSUE',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
  RESERVATION = 'RESERVATION',
}

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export enum NotificationEventType {
  SYSTEM = 'SYSTEM',
  REQUEST_SUBMITTED = 'REQUEST_SUBMITTED',
  REQUEST_APPROVED = 'REQUEST_APPROVED',
  REQUEST_REJECTED = 'REQUEST_REJECTED',
  PO_APPROVAL_REQUIRED = 'PO_APPROVAL_REQUIRED',
  PO_FULLY_APPROVED = 'PO_FULLY_APPROVED',
  PO_REJECTED = 'PO_REJECTED',
  SUPPLIER_ACCEPTED = 'SUPPLIER_ACCEPTED',
  SUPPLIER_REJECTED = 'SUPPLIER_REJECTED',
  ORDER_DISPATCHED = 'ORDER_DISPATCHED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  LOW_STOCK_ALERT = 'LOW_STOCK_ALERT',
}

export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  SIGN_UP = 'SIGN_UP',
  SUBMIT_REQUEST = 'SUBMIT_REQUEST',
  APPROVE_REQUEST = 'APPROVE_REQUEST',
  REJECT_REQUEST = 'REJECT_REQUEST',
  CREATE_PO = 'CREATE_PO',
  APPROVE_PO_LEVEL = 'APPROVE_PO_LEVEL',
  FULLY_APPROVE_PO = 'FULLY_APPROVE_PO',
  REJECT_PO_LEVEL = 'REJECT_PO_LEVEL',
  ACCEPT_PO = 'ACCEPT_PO',
  REJECT_PO = 'REJECT_PO',
  DISPATCH_ORDER = 'DISPATCH_ORDER',
  UPDATE_DELIVERY = 'UPDATE_DELIVERY',
  MARK_DELIVERED = 'MARK_DELIVERED',
  UPDATE_INVENTORY = 'UPDATE_INVENTORY',
  UPGRADE_MEMBERSHIP = 'UPGRADE_MEMBERSHIP',
  RESET_PASSWORD = 'RESET_PASSWORD',
}

export enum MembershipPlan {
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
  SUPPLIER_PARTNER = 'SUPPLIER_PARTNER',
}

export interface MembershipPlanInfo {
  plan: MembershipPlan;
  planName: string;
  badgeText: string;
  monthlyPrice: number;
  yearlyPrice: number;
  poLimitPerMonth: string;
  maxApprovalLevels: number;
  features: string[];
  isPopular?: boolean;
}

export const MEMBERSHIP_PLANS_DATA: Record<MembershipPlan, MembershipPlanInfo> = {
  [MembershipPlan.STARTER]: {
    plan: MembershipPlan.STARTER,
    planName: 'Starter Essentials',
    badgeText: 'Free Starter',
    monthlyPrice: 0,
    yearlyPrice: 0,
    poLimitPerMonth: '25 POs / month',
    maxApprovalLevels: 2,
    features: [
      'Up to 25 Purchase Orders/mo',
      '2-Level Hierarchical Approvals',
      'Basic Supplier Directory',
      'Standard Inventory Tracking',
      'Email Notifications',
    ],
  },
  [MembershipPlan.PROFESSIONAL]: {
    plan: MembershipPlan.PROFESSIONAL,
    planName: 'Professional Growth',
    badgeText: 'Pro Tier',
    monthlyPrice: 2499,
    yearlyPrice: 24990,
    poLimitPerMonth: '250 POs / month',
    maxApprovalLevels: 3,
    isPopular: true,
    features: [
      'Up to 250 Purchase Orders/mo',
      '3-Level Approvals (Finance Director)',
      'Automated Inventory Inwarding',
      'Smart Supplier Scorecard & RFQ Ranking',
      'Digital Certificate Verification',
      'Priority Support',
    ],
  },
  [MembershipPlan.ENTERPRISE]: {
    plan: MembershipPlan.ENTERPRISE,
    planName: 'Enterprise Global',
    badgeText: 'Enterprise Suite',
    monthlyPrice: 7999,
    yearlyPrice: 79990,
    poLimitPerMonth: 'Unlimited POs',
    maxApprovalLevels: 4,
    features: [
      'Unlimited Purchase Orders',
      '4-Tier Approvals (CFO / Board)',
      'Full Immutable Audit Trail Log',
      'Automated ERP Webhooks & REST Console',
      'AI Replenishment Recommendations',
      'Dedicated Account Manager',
    ],
  },
  [MembershipPlan.SUPPLIER_PARTNER]: {
    plan: MembershipPlan.SUPPLIER_PARTNER,
    planName: 'Verified Supplier Partner',
    badgeText: 'Supplier Pro',
    monthlyPrice: 1999,
    yearlyPrice: 19990,
    poLimitPerMonth: 'Unlimited Bids',
    maxApprovalLevels: 2,
    features: [
      'Instant PO Inbound Broadcasts',
      'Dispatch & Carrier Integration (BlueDart)',
      'Performance Rating & Review Badging',
      'Direct Procurement Messaging',
      'Early Payment Acceleration',
    ],
  },
};

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department: string;
  supplierId?: string;
  passwordHash: string;
  membershipPlan: MembershipPlan;
  planBillingCycle: 'MONTHLY' | 'YEARLY';
  planExpiresAt: number;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  code: string;
  description: string;
}

export interface Product {
  id: string;
  productCode: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  category?: string; // alias for categoryName
  supplierId: string;
  unitPrice: number;
  originalPrice?: number;
  discountPercent?: number;
  rating?: number;
  ratingCount?: number;
  imageUrl?: string;
  unitOfMeasure: string;
  unit?: string; // alias for unitOfMeasure
  availableQuantity: number;
  minimumStock: number;
  maximumStock: number;
  reorderQuantity: number;
  isLowStock: boolean;
  status: string;
  assuredBadge?: boolean;
  features?: string[];
  brand?: string;
  deliveryDays?: number;
  warranty?: string;
}

export interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  gstNumber: string;
  gstin?: string; // alias for gstNumber
  category?: string;
  rating: number;
  qualityScore: number;
  onTimeDeliveryRate: number;
  averageLeadDays: number;
  status: string;
}

export interface PurchaseRequestItem {
  id: string;
  purchaseRequestId: string;
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  estimatedUnitPrice: number;
  estimatedTotal: number;
}

export interface PurchaseRequest {
  id: string;
  requestNumber: string;
  requestedByUserId: string;
  requesterName: string;
  requesterRole: UserRole;
  department: string;
  priority: Priority;
  reason: string;
  status: RequestStatus;
  estimatedAmount: number;
  currentApprovalLevel: number;
  requiredApprovalLevel: number;
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: number;
  updatedAt: number;
  items?: PurchaseRequestItem[];
}

export interface PoApprovalStepInfo {
  level: number;
  tierName: string;
  requiredRole: UserRole;
  thresholdAmount: number;
  isSigned: boolean;
  signerUserId?: string;
  signerName?: string;
  signerRole?: string;
  signedAt?: number;
  remarks?: string;
  signatureCertificate?: string;
  stepDescription: string;
  shortRoleTitle: string;
}

export interface PoApprovalTier {
  tierNumber: number;
  title: string;
  minAmount: number;
  maxAmount: number;
  requiredSignatures: number;
  description: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  purchaseRequestId?: string;
  requestNumber?: string;
  supplierId: string;
  supplierName: string;
  createdByUserId: string;
  createdByName: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  shippingCost: number;
  totalAmount: number;
  status: OrderStatus;
  currentApprovalLevel: number;
  requiredApprovalLevel: number;
  approvalTierName: string;
  approvalSignaturesJson: string; // serialized PoApprovalStepInfo[]
  isFullyApproved: boolean;
  pendingRoleName: string;
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
  rejectionReason?: string;
  createdAt: number;
  updatedAt: number;
  items?: PurchaseOrderItem[];
}

export interface DeliveryTrackingCheckpoint {
  id: string;
  deliveryId: string;
  stageName: string;
  location: string;
  timestamp: number;
  isCompleted: boolean;
  notes: string;
}

export interface Delivery {
  id: string;
  purchaseOrderId: string;
  poNumber: string;
  deliveryAgentId: string;
  deliveryAgentName: string;
  trackingNumber: string;
  carrier: string;
  status: DeliveryStatus;
  currentCheckpoint: string;
  estimatedDeliveryDate?: number;
  actualDeliveryDate?: number;
  createdAt: number;
  lastUpdated: number;
  checkpoints?: DeliveryTrackingCheckpoint[];
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  transactionType: TransactionType;
  quantityChanged: number;
  previousStock: number;
  newStock: number;
  referenceId: string;
  notes: string;
  createdAt: number;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  eventType: NotificationEventType;
  channel: NotificationChannel;
  isRead: boolean;
  referenceId?: string;
  createdAt: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: AuditAction;
  entityType: string;
  entityId: string;
  summary: string;
  oldValue?: string;
  newValue?: string;
  timestamp: number;
}

export interface SystemSettings {
  approvalLimitManager: number; // default 15000
  approvalLimitProcurementManager: number; // default 100000
  approvalLimitDirector: number; // default 500000
  approvalLimitFinanceDirector?: number; // alias for approvalLimitDirector
  autoPoGeneration: boolean;
  enableEmailAlerts: boolean;
  weightPrice: number; // 0.35
  weightQuality: number; // 0.20
  weightDelivery: number; // 0.20
  weightRating: number; // 0.15
  weightReliability: number; // 0.10
}

export interface SupplierPerformanceRating {
  id: string;
  supplierId: string;
  supplierName: string;
  purchaseOrderId?: string;
  poNumber?: string;
  ratedByUserId: string;
  ratedByName: string;
  qualityScore: number;
  deliveryScore: number;
  pricingScore: number;
  serviceScore: number;
  overallScore: number;
  ratingStars: number;
  feedbackComments: string;
  ratingCategory: string;
  ratingDate: number;
}

export interface SupplierRecommendation {
  supplier: Supplier;
  scorePercentage: number;
  priceScore: number;
  qualityScore: number;
  deliveryScore: number;
  ratingScore: number;
  reliabilityScore: number;
  reason: string;
}

export interface ReplenishmentRecommendation {
  product: Product;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  recommendedQuantity: number;
  preferredSupplier: Supplier | null;
  estimatedCost: number;
  reason: string;
}

export interface ApiResponseResult {
  success: boolean;
  statusCode: number;
  message: string;
  timestamp: number;
  data?: any;
}

export interface TopSupplierPerformance {
  supplier: Supplier;
  averageOverallScore: number;
  qualityScore: number;
  onTimeDeliveryRate: number;
  pricingScore: number;
  serviceScore: number;
  ratingStars: number;
  totalRatingsCount: number;
  tierBadge: string;
  latestFeedback: string;
  lastRatedDate: number;
}

export interface HighValueOrderAlert {
  order: PurchaseOrder;
  isApproved: boolean;
  message: string;
}

export enum AppTab {
  DASHBOARD = 'DASHBOARD',
  SHOPPING = 'SHOPPING',
  REQUESTS = 'REQUESTS',
  ORDERS = 'ORDERS',
  HISTORY = 'HISTORY',
  SUPPLIERS = 'SUPPLIERS',
  DELIVERY = 'DELIVERY',
  INVENTORY = 'INVENTORY',
  ANALYTICS = 'ANALYTICS',
  MEMBERSHIP = 'MEMBERSHIP',
  API_CONSOLE = 'API_CONSOLE',
  ABOUT = 'ABOUT',
  AUTH = 'AUTH',
}

export interface ProcurementKpiSummary {
  totalSpend: number;
  pendingApprovalsCount: number;
  activeOrdersCount: number;
  lowStockItemsCount: number;
  inTransitDeliveriesCount: number;
  deliveredOrdersCount: number;
  totalSuppliersCount: number;
  poConversionRate: number;
}
