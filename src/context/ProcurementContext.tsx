import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  ApiResponseResult,
  AppTab,
  AuditAction,
  AuditLog,
  Category,
  Delivery,
  DeliveryStatus,
  DeliveryTrackingCheckpoint,
  HighValueOrderAlert,
  InventoryTransaction,
  MembershipPlan,
  NotificationChannel,
  NotificationEventType,
  NotificationItem,
  OrderStatus,
  PoApprovalStepInfo,
  Priority,
  Product,
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseRequest,
  PurchaseRequestItem,
  ReplenishmentRecommendation,
  RequestStatus,
  Supplier,
  SupplierPerformanceRating,
  SupplierRecommendation,
  SystemSettings,
  TopSupplierPerformance,
  TransactionType,
  User,
  UserRole,
} from '../types/procurement';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_CATEGORIES,
  INITIAL_DELIVERIES,
  INITIAL_NOTIFICATIONS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_RATINGS,
  INITIAL_REQUESTS,
  INITIAL_SETTINGS,
  INITIAL_SUPPLIERS,
  INITIAL_TRANSACTIONS,
  INITIAL_USERS,
} from '../data/seedData';
import { PoApprovalWorkflowEngine } from '../services/workflowEngine';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface ProcurementContextType {
  // State
  currentUser: User;
  allUsers: User[];
  allProducts: Product[];
  lowStockProducts: Product[];
  allCategories: Category[];
  allSuppliers: Supplier[];
  allRequests: PurchaseRequest[];
  allOrders: PurchaseOrder[];
  allDeliveries: Delivery[];
  allTransactions: InventoryTransaction[];
  allNotifications: NotificationItem[];
  unreadNotificationCount: number;
  allAuditLogs: AuditLog[];
  allSupplierRatings: SupplierPerformanceRating[];
  settings: SystemSettings;
  topPerformingSupplier: TopSupplierPerformance | null;
  activeTab: AppTab;
  themeMode: 'light' | 'dark';
  highValueAlert: HighValueOrderAlert | null;
  demoLifecycleStep: number;
  toasts: Toast[];

  // Aliases & Modal States
  requests: PurchaseRequest[];
  orders: PurchaseOrder[];
  deliveries: Delivery[];
  suppliers: Supplier[];
  products: Product[];
  transactions: InventoryTransaction[];
  categories: Category[];
  removeToast: (id: string) => void;
  showNotificationsModal: boolean;
  setShowNotificationsModal: (show: boolean) => void;
  showAuthDialog: boolean;
  setShowAuthDialog: (show: boolean) => void;
  showNewRequisitionModal: boolean;
  setShowNewRequisitionModal: (show: boolean) => void;

  // Navigation
  setActiveTab: (tab: AppTab) => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
  toggleTheme: () => void;
  addToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
  dismissToast: (id: string) => void;
  dismissHighValueAlert: () => void;
  triggerTestHighValueAlert: (isApproved: boolean) => void;
  advanceDemoLifecycle: () => Promise<void>;
  resetDemoLifecycle: () => void;

  // User Actions
  switchRole: (role: UserRole) => void;
  switchUserById: (userId: string) => void;
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    department: string;
    role: UserRole;
    membershipPlan: MembershipPlan;
    billingCycle: 'MONTHLY' | 'YEARLY';
  }) => Promise<boolean>;
  logout: () => void;
  upgradeMembership: (plan: MembershipPlan, billingCycle: 'MONTHLY' | 'YEARLY') => void;

  // Purchase Requests
  createPurchaseRequest: (
    priority: Priority,
    department: string,
    reason: string,
    items: { product: Product; quantity: number }[]
  ) => Promise<PurchaseRequest>;
  approvePurchaseRequest: (requestId: string, remarks: string) => Promise<ApiResponseResult>;
  rejectPurchaseRequest: (requestId: string, reason: string) => Promise<ApiResponseResult>;
  convertRequestToPo: (
    requestId: string,
    supplierId: string,
    notes: string
  ) => Promise<ApiResponseResult>;

  // Purchase Orders & Hierarchical Approvals
  approvePurchaseOrderLevel: (orderId: string, remarks: string) => Promise<ApiResponseResult>;
  rejectPurchaseOrder: (orderId: string, reason: string) => Promise<ApiResponseResult>;
  supplierAcceptOrder: (orderId: string) => Promise<ApiResponseResult>;
  supplierRejectOrder: (orderId: string, reason: string) => Promise<ApiResponseResult>;
  supplierDispatchOrder: (
    orderId: string,
    carrier?: string,
    trackingNumber?: string
  ) => Promise<ApiResponseResult>;

  // Delivery & Inwarding
  advanceDeliveryStatus: (
    deliveryId: string,
    nextStatus: DeliveryStatus,
    notes?: string
  ) => Promise<ApiResponseResult>;

  // Inventory
  adjustInventoryManual: (
    productId: string,
    delta: number,
    notes: string
  ) => Promise<ApiResponseResult>;
  getReplenishmentRecommendations: () => ReplenishmentRecommendation[];

  // Suppliers & Ratings
  submitSupplierRating: (data: {
    supplierId: string;
    qualityScore: number;
    deliveryScore: number;
    pricingScore: number;
    serviceScore: number;
    feedback: string;
    purchaseOrderId?: string;
    poNumber?: string;
    category?: string;
  }) => Promise<ApiResponseResult>;
  rankSuppliersForProduct: (product: Product) => SupplierRecommendation[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'rating' | 'qualityScore' | 'onTimeDeliveryRate'>) => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;

  // System & API Console
  executeWorkflowCommand: (
    action: string,
    entityId: string,
    payload?: string
  ) => Promise<ApiResponseResult>;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetAllData: () => void;
}

const ProcurementContext = createContext<ProcurementContextType | null>(null);

const STORAGE_KEYS = {
  USERS: 'sp_users_v2',
  CURRENT_USER_ID: 'sp_current_user_id_v2',
  PRODUCTS: 'sp_products_v2',
  SUPPLIERS: 'sp_suppliers_v2',
  REQUESTS: 'sp_requests_v2',
  ORDERS: 'sp_orders_v2',
  DELIVERIES: 'sp_deliveries_v2',
  TRANSACTIONS: 'sp_transactions_v2',
  NOTIFICATIONS: 'sp_notifications_v2',
  AUDIT_LOGS: 'sp_audit_logs_v2',
  RATINGS: 'sp_ratings_v2',
  SETTINGS: 'sp_settings_v2',
  THEME: 'sp_theme_v2',
};

export const ProcurementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load or initialize state
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        return parsed.map((u) => {
          if (u.id === 'usr-admin' || u.name === 'Vikram Malhotra') {
            return {
              ...u,
              id: 'usr-admin',
              name: 'Navneet Gupta',
              email: 'indianavneetgupta33@gmail.com',
            };
          }
          return u;
        });
      } catch {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'usr-admin';
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      try {
        const parsed: Product[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_PRODUCTS.length) {
          return parsed;
        }
        // Merge missing initial products
        const existingIds = new Set(parsed.map((p) => p.id));
        const missing = INITIAL_PRODUCTS.filter((p) => !existingIds.has(p.id));
        const merged = [...parsed, ...missing];
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(merged));
        return merged;
      } catch {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [requests, setRequests] = useState<PurchaseRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  const [orders, setOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (saved) {
      try {
        const parsed: PurchaseOrder[] = JSON.parse(saved);
        return parsed.map((order) => ({
          ...order,
          approvalSignaturesJson: order.approvalSignaturesJson
            ? order.approvalSignaturesJson.replace(/Vikram Malhotra/g, 'Navneet Gupta')
            : order.approvalSignaturesJson,
        }));
      } catch {
        return INITIAL_ORDERS;
      }
    }
    return INITIAL_ORDERS;
  });

  const [deliveries, setDeliveries] = useState<Delivery[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DELIVERIES);
    return saved ? JSON.parse(saved) : INITIAL_DELIVERIES;
  });

  const [transactions, setTransactions] = useState<InventoryTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (saved) {
      try {
        const parsed: AuditLog[] = JSON.parse(saved);
        return parsed.map((log) =>
          log.userName === 'Vikram Malhotra' ? { ...log, userName: 'Navneet Gupta' } : log
        );
      } catch {
        return INITIAL_AUDIT_LOGS;
      }
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [ratings, setRatings] = useState<SupplierPerformanceRating[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RATINGS);
    return saved ? JSON.parse(saved) : INITIAL_RATINGS;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [themeMode, setThemeModeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return saved === 'dark' ? 'dark' : 'light';
  });

  const [highValueAlert, setHighValueAlert] = useState<HighValueOrderAlert | null>(null);
  const [demoLifecycleStep, setDemoLifecycleStep] = useState<number>(1);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showNewRequisitionModal, setShowNewRequisitionModal] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  }, [suppliers]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  }, [requests]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DELIVERIES, JSON.stringify(deliveries));
  }, [deliveries]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(ratings));
  }, [ratings]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, themeMode);
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  const currentUser = useMemo(() => {
    return users.find((u) => u.id === currentUserId) || users[0] || INITIAL_USERS[0];
  }, [users, currentUserId]);

  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.availableQuantity <= p.minimumStock);
  }, [products]);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead && (n.userId === currentUser.id || n.userId === 'usr-admin')).length;
  }, [notifications, currentUser]);

  const topPerformingSupplier = useMemo<TopSupplierPerformance | null>(() => {
    if (suppliers.length === 0) return null;
    const sorted = [...suppliers].sort((a, b) => b.rating - a.rating || b.qualityScore - a.qualityScore);
    const top = sorted[0];
    const topRatings = ratings.filter((r) => r.supplierId === top.id);
    const latestFeedback = topRatings[0]?.feedbackComments || 'Consistently superior enterprise delivery performance and SLA compliance.';
    const lastRatedDate = topRatings[0]?.ratingDate || Date.now() - 2 * 86400000;

    return {
      supplier: top,
      averageOverallScore: top.qualityScore,
      qualityScore: top.qualityScore,
      onTimeDeliveryRate: top.onTimeDeliveryRate,
      pricingScore: 94.0,
      serviceScore: 96.0,
      ratingStars: top.rating,
      totalRatingsCount: topRatings.length || 18,
      tierBadge: top.rating >= 4.8 ? 'Apex Platinum Partner' : 'Certified Gold Supplier',
      latestFeedback,
      lastRatedDate,
    };
  }, [suppliers, ratings]);

  // Toast Helpers
  const addToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    const id = 'toast-' + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const dismissHighValueAlert = () => setHighValueAlert(null);

  const setThemeMode = (mode: 'light' | 'dark') => {
    setThemeModeState(mode);
  };

  const toggleTheme = () => {
    setThemeModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Internal log audit helper
  const logAudit = (
    user: User,
    action: AuditAction,
    entityType: string,
    entityId: string,
    summary: string,
    oldValue?: string,
    newValue?: string
  ) => {
    const newLog: AuditLog = {
      id: 'aud-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      entityType,
      entityId,
      summary,
      oldValue,
      newValue,
      timestamp: Date.now(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Internal notification sender
  const sendNotification = (
    userId: string,
    title: string,
    message: string,
    eventType: NotificationEventType,
    refId: string = ''
  ) => {
    const notif: NotificationItem = {
      id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      userId,
      title,
      message,
      eventType,
      channel: NotificationChannel.IN_APP,
      isRead: false,
      referenceId: refId,
      createdAt: Date.now(),
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Persona / User management
  const switchRole = (role: UserRole) => {
    const target = users.find((u) => u.role === role);
    if (target) {
      setCurrentUserId(target.id);
      logAudit(
        target,
        AuditAction.LOGIN,
        'USER',
        target.id,
        `Active persona switched to ${target.name} (${role})`
      );
      addToast('info', 'Switched Persona', `Active profile: ${target.name} (${role})`);
    }
  };

  const switchUserById = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUserId(target.id);
      logAudit(
        target,
        AuditAction.LOGIN,
        'USER',
        target.id,
        `Active user switched to ${target.name}`
      );
      addToast('info', 'Active Account Switched', `Logged in as ${target.name}`);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const trimmed = email.trim();
    const found = users.find((u) => u.email.toLowerCase() === trimmed.toLowerCase());
    if (!found) {
      addToast('error', 'Login Failed', `No user found for ${trimmed}`);
      return false;
    }
    if (found.passwordHash !== password && password !== 'password123') {
      addToast('error', 'Login Failed', 'Invalid password. Try password123 or user default.');
      return false;
    }
    setCurrentUserId(found.id);
    logAudit(found, AuditAction.LOGIN, 'USER', found.id, `User ${found.name} logged in`);
    addToast('success', 'Welcome Back', `Logged in as ${found.name}`);
    return true;
  };

  const signUp = async (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    department: string;
    role: UserRole;
    membershipPlan: MembershipPlan;
    billingCycle: 'MONTHLY' | 'YEARLY';
  }): Promise<boolean> => {
    const trimmed = data.email.trim();
    if (users.some((u) => u.email.toLowerCase() === trimmed.toLowerCase())) {
      addToast('error', 'Registration Error', `An account with ${trimmed} already exists.`);
      return false;
    }
    const newUser: User = {
      id: 'usr-' + Date.now().toString(36),
      name: data.name.trim(),
      email: trimmed,
      phone: data.phone.trim(),
      role: data.role,
      department: data.department.trim() || 'Procurement & Operations',
      passwordHash: data.password || 'password123',
      membershipPlan: data.membershipPlan,
      planBillingCycle: data.billingCycle,
      planExpiresAt: Date.now() + 365 * 86400000,
      createdAt: Date.now(),
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    logAudit(newUser, AuditAction.SIGN_UP, 'USER', newUser.id, `New account registered: ${newUser.name}`);
    sendNotification(
      newUser.id,
      'Welcome to SmartProcure',
      `Your account has been created with ${data.membershipPlan} plan.`,
      NotificationEventType.SYSTEM
    );
    addToast('success', 'Account Registered', `Welcome to SmartProcure, ${newUser.name}!`);
    return true;
  };

  const logout = () => {
    logAudit(currentUser, AuditAction.LOGOUT, 'USER', currentUser.id, `User ${currentUser.name} logged out`);
    const admin = users.find((u) => u.role === UserRole.ADMIN) || users[0];
    setCurrentUserId(admin.id);
    addToast('info', 'Logged Out', `Switched to default administrator`);
  };

  const upgradeMembership = (plan: MembershipPlan, billingCycle: 'MONTHLY' | 'YEARLY') => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              membershipPlan: plan,
              planBillingCycle: billingCycle,
              planExpiresAt: Date.now() + (billingCycle === 'YEARLY' ? 365 : 30) * 86400000,
            }
          : u
      )
    );
    logAudit(
      currentUser,
      AuditAction.UPGRADE_MEMBERSHIP,
      'MEMBERSHIP',
      currentUser.id,
      `Upgraded membership to ${plan} (${billingCycle})`
    );
    sendNotification(
      currentUser.id,
      `Plan Upgraded: ${plan}`,
      `You are now on the ${plan} plan with expanded PO volume and enhanced capabilities.`,
      NotificationEventType.SYSTEM
    );
    addToast('success', 'Plan Upgraded', `Successfully activated ${plan} tier!`);
  };

  // Purchase Request operations
  const createPurchaseRequest = async (
    priority: Priority,
    department: string,
    reason: string,
    items: { product: Product; quantity: number }[]
  ): Promise<PurchaseRequest> => {
    const count = requests.length + 101;
    const reqNumber = `PR-2026-000${count}`;
    const totalAmount = items.reduce((acc, curr) => acc + curr.product.unitPrice * curr.quantity, 0);

    const requiredLevel =
      totalAmount < settings.approvalLimitManager
        ? 1
        : totalAmount <= settings.approvalLimitProcurementManager
        ? 2
        : 3;

    const reqId = 'pr-' + count;
    const requestItems: PurchaseRequestItem[] = items.map((item, idx) => ({
      id: `pri-${count}-${idx + 1}`,
      purchaseRequestId: reqId,
      productId: item.product.id,
      productCode: item.product.productCode,
      productName: item.product.name,
      quantity: item.quantity,
      estimatedUnitPrice: item.product.unitPrice,
      estimatedTotal: item.product.unitPrice * item.quantity,
    }));

    const newRequest: PurchaseRequest = {
      id: reqId,
      requestNumber: reqNumber,
      requestedByUserId: currentUser.id,
      requesterName: currentUser.name,
      requesterRole: currentUser.role,
      department: department || currentUser.department,
      priority,
      reason,
      status: RequestStatus.PENDING_APPROVAL,
      estimatedAmount: totalAmount,
      currentApprovalLevel: 1,
      requiredApprovalLevel: requiredLevel,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      items: requestItems,
    };

    setRequests((prev) => [newRequest, ...prev]);

    // Send notification to approver
    sendNotification(
      'usr-mgr',
      `New Requisition: ${reqNumber}`,
      `${currentUser.name} submitted request for ₹${totalAmount.toLocaleString('en-IN')} (${priority} Priority).`,
      NotificationEventType.REQUEST_SUBMITTED,
      reqId
    );

    logAudit(
      currentUser,
      AuditAction.SUBMIT_REQUEST,
      'PURCHASE_REQUEST',
      reqNumber,
      `Submitted requisition ${reqNumber} with ${items.length} line items (₹${totalAmount.toLocaleString('en-IN')})`
    );

    addToast('success', 'Request Created', `Requisition ${reqNumber} submitted for approval.`);
    return newRequest;
  };

  const approvePurchaseRequest = async (requestId: string, remarks: string): Promise<ApiResponseResult> => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return { success: false, statusCode: 404, message: 'Request not found', timestamp: Date.now() };

    const isFinal = req.currentApprovalLevel >= req.requiredApprovalLevel;
    const nextLevel = isFinal ? req.currentApprovalLevel : req.currentApprovalLevel + 1;
    const newStatus = isFinal ? RequestStatus.APPROVED : RequestStatus.PENDING_APPROVAL;
    const approverTag = `${currentUser.name} (${currentUser.role})`;
    const updatedApprovedBy = req.approvedBy ? `${req.approvedBy}, ${approverTag}` : approverTag;

    const updated: PurchaseRequest = {
      ...req,
      currentApprovalLevel: nextLevel,
      status: newStatus,
      approvedBy: updatedApprovedBy,
      updatedAt: Date.now(),
    };

    setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));

    const stageText = isFinal
      ? 'Fully Approved'
      : `Approved Level ${req.currentApprovalLevel} of ${req.requiredApprovalLevel}`;

    sendNotification(
      req.requestedByUserId,
      `Request ${req.requestNumber} ${stageText}`,
      `Signed off by ${currentUser.name}. Remarks: ${remarks || 'Approved'}`,
      NotificationEventType.REQUEST_APPROVED,
      req.id
    );

    logAudit(
      currentUser,
      AuditAction.APPROVE_REQUEST,
      'PURCHASE_REQUEST',
      req.requestNumber,
      `${stageText} by ${currentUser.name}. Remarks: ${remarks || 'Approved'}`
    );

    addToast('success', 'Request Approved', `Requisition ${req.requestNumber} ${stageText}.`);

    // Auto-PO Generation if fully approved and enabled
    if (isFinal && settings.autoPoGeneration && req.items && req.items.length > 0) {
      const firstProduct = products.find((p) => p.id === req.items![0].productId);
      const supplierId = firstProduct?.supplierId || suppliers[0].id;
      setTimeout(() => {
        convertRequestToPo(req.id, supplierId, 'Auto-generated PO from approved requisition');
      }, 500);
    }

    return {
      success: true,
      statusCode: 200,
      message: `Purchase request ${stageText} successfully`,
      timestamp: Date.now(),
      data: updated,
    };
  };

  const rejectPurchaseRequest = async (requestId: string, reason: string): Promise<ApiResponseResult> => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return { success: false, statusCode: 404, message: 'Request not found', timestamp: Date.now() };

    const updated: PurchaseRequest = {
      ...req,
      status: RequestStatus.REJECTED,
      rejectionReason: reason || 'Declined during review',
      updatedAt: Date.now(),
    };

    setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));

    sendNotification(
      req.requestedByUserId,
      `Request ${req.requestNumber} Rejected`,
      `Rejected by ${currentUser.name}. Reason: ${reason}`,
      NotificationEventType.REQUEST_REJECTED,
      req.id
    );

    logAudit(
      currentUser,
      AuditAction.REJECT_REQUEST,
      'PURCHASE_REQUEST',
      req.requestNumber,
      `Rejected by ${currentUser.name}. Reason: ${reason}`
    );

    addToast('warning', 'Request Rejected', `Requisition ${req.requestNumber} has been rejected.`);

    return {
      success: true,
      statusCode: 200,
      message: 'Purchase request rejected',
      timestamp: Date.now(),
      data: updated,
    };
  };

  const convertRequestToPo = async (
    requestId: string,
    supplierId: string,
    notes: string
  ): Promise<ApiResponseResult> => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return { success: false, statusCode: 404, message: 'Request not found', timestamp: Date.now() };

    const supplier = suppliers.find((s) => s.id === supplierId) || suppliers[0];
    const items = req.items || [];
    if (items.length === 0) {
      return { success: false, statusCode: 400, message: 'No items in request to order', timestamp: Date.now() };
    }

    const count = orders.length + 501;
    const poNumber = `PO-2026-000${count}`;

    const subtotal = items.reduce((acc, curr) => acc + curr.estimatedTotal, 0);
    const taxRate = 18.0;
    const taxAmount = subtotal * (taxRate / 100.0);
    const discountAmount = subtotal > 50000 ? 1500.0 : 0.0;
    const shippingCost = 600.0;
    const totalAmount = subtotal + taxAmount - discountAmount + shippingCost;

    const tier = PoApprovalWorkflowEngine.determineTier(totalAmount, settings);
    const steps = PoApprovalWorkflowEngine.buildApprovalChain(totalAmount, settings);

    const poId = `po-${poNumber.toLowerCase()}`;
    const poItems: PurchaseOrderItem[] = items.map((it, idx) => ({
      id: `poi-${count}-${idx + 1}`,
      purchaseOrderId: poId,
      productId: it.productId,
      productCode: it.productCode,
      productName: it.productName,
      quantity: it.quantity,
      unitPrice: it.estimatedUnitPrice,
      totalPrice: it.estimatedTotal,
    }));

    const newOrder: PurchaseOrder = {
      id: poId,
      poNumber,
      purchaseRequestId: req.id,
      requestNumber: req.requestNumber,
      supplierId: supplier.id,
      supplierName: supplier.companyName,
      createdByUserId: currentUser.id,
      createdByName: currentUser.name,
      subtotal,
      taxRate,
      taxAmount,
      discountAmount,
      shippingCost,
      totalAmount,
      status: OrderStatus.PENDING_APPROVAL,
      currentApprovalLevel: 1,
      requiredApprovalLevel: steps.length,
      approvalTierName: `${tier.title} (${steps.length} Signatures)`,
      approvalSignaturesJson: PoApprovalWorkflowEngine.serializeSignatures(steps),
      isFullyApproved: false,
      pendingRoleName: steps[0]?.shortRoleTitle || 'Approving Manager',
      notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      items: poItems,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Mark PR as converted
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status: RequestStatus.CONVERTED_TO_PO, updatedAt: Date.now() } : r
      )
    );

    // High value alert check
    if (totalAmount >= 100000) {
      setHighValueAlert({
        order: newOrder,
        isApproved: false,
        message: `High-value capital order (${tier.title}) initialized. Total: ₹${totalAmount.toLocaleString(
          'en-IN'
        )}. Requires multi-tier executive approval.`,
      });
    }

    sendNotification(
      'usr-mgr',
      `PO Approval Required: ${poNumber}`,
      `New PO for ₹${totalAmount.toLocaleString('en-IN')} requires Level 1 (${steps[0]?.shortRoleTitle}) sign-off.`,
      NotificationEventType.PO_APPROVAL_REQUIRED,
      poId
    );

    logAudit(
      currentUser,
      AuditAction.CREATE_PO,
      'PURCHASE_ORDER',
      poNumber,
      `Created Purchase Order ${poNumber} from requisition ${req.requestNumber}. Initiated ${tier.title} workflow.`
    );

    addToast('success', 'PO Initiated', `Purchase Order ${poNumber} created and entered into approval chain.`);

    return {
      success: true,
      statusCode: 201,
      message: `Purchase Order ${poNumber} created successfully`,
      timestamp: Date.now(),
      data: newOrder,
    };
  };

  // Purchase Order Approval Workflow
  const approvePurchaseOrderLevel = async (orderId: string, remarks: string): Promise<ApiResponseResult> => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, statusCode: 404, message: 'Order not found', timestamp: Date.now() };

    if (order.status !== OrderStatus.PENDING_APPROVAL) {
      return {
        success: false,
        statusCode: 400,
        message: `Order is not pending approval (Current: ${order.status})`,
        timestamp: Date.now(),
      };
    }

    const steps = PoApprovalWorkflowEngine.parseSignatures(order.approvalSignaturesJson, order.totalAmount, settings);
    const stepIdx = Math.min(order.currentApprovalLevel - 1, steps.length - 1);
    const currentStep = steps[stepIdx];

    if (!currentStep) {
      return { success: false, statusCode: 400, message: 'Invalid approval step', timestamp: Date.now() };
    }

    if (currentStep.isSigned) {
      return { success: false, statusCode: 400, message: `Level ${order.currentApprovalLevel} is already signed`, timestamp: Date.now() };
    }

    // Role verification
    if (!PoApprovalWorkflowEngine.canUserSignCurrentLevel(order, currentUser, currentStep)) {
      addToast(
        'error',
        'Authorization Denied',
        `Level ${currentStep.level} requires ${currentStep.shortRoleTitle} authority. You are logged in as ${currentUser.role}.`
      );
      return {
        success: false,
        statusCode: 403,
        message: `Unauthorized: Level ${currentStep.level} requires ${currentStep.shortRoleTitle} authority.`,
        timestamp: Date.now(),
      };
    }

    const now = Date.now();
    const certificate = PoApprovalWorkflowEngine.generateDigitalCertificate(
      order.poNumber,
      currentStep.level,
      currentUser,
      now
    );

    // Sign current step
    const signedStep: PoApprovalStepInfo = {
      ...currentStep,
      isSigned: true,
      signerUserId: currentUser.id,
      signerName: currentUser.name,
      signerRole: currentUser.role,
      signedAt: now,
      remarks: remarks || 'Approved & authorized as per procurement delegation of authority.',
      signatureCertificate: certificate,
    };

    steps[stepIdx] = signedStep;

    const isFinalLevel = order.currentApprovalLevel >= order.requiredApprovalLevel;
    const nextLevel = isFinalLevel ? order.currentApprovalLevel : order.currentApprovalLevel + 1;
    const nextStep = isFinalLevel ? null : steps[stepIdx + 1];
    const nextPendingRole = nextStep ? nextStep.shortRoleTitle : 'Fully Authorized';

    const updatedOrder: PurchaseOrder = {
      ...order,
      currentApprovalLevel: nextLevel,
      approvalSignaturesJson: PoApprovalWorkflowEngine.serializeSignatures(steps),
      isFullyApproved: isFinalLevel,
      status: isFinalLevel ? OrderStatus.SENT_TO_SUPPLIER : OrderStatus.PENDING_APPROVAL,
      pendingRoleName: nextPendingRole,
      updatedAt: now,
    };

    setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));

    if (isFinalLevel) {
      // High value alert check
      if (order.totalAmount >= 100000) {
        setHighValueAlert({
          order: updatedOrder,
          isApproved: true,
          message: `PO ${order.poNumber} (₹${order.totalAmount.toLocaleString('en-IN')}) is now FULLY AUTHORIZED with cryptographic certificate stamps and released to ${order.supplierName}!`,
        });
      }

      sendNotification(
        'usr-sup',
        `New Order Released: ${order.poNumber}`,
        `Order for ₹${order.totalAmount.toLocaleString('en-IN')} has cleared all signature levels and is ready for fulfillment.`,
        NotificationEventType.PO_FULLY_APPROVED,
        order.id
      );
      sendNotification(
        order.createdByUserId,
        `PO ${order.poNumber} Fully Approved`,
        `All ${order.requiredApprovalLevel} signature levels completed. Order released to ${order.supplierName}.`,
        NotificationEventType.PO_FULLY_APPROVED,
        order.id
      );

      logAudit(
        currentUser,
        AuditAction.FULLY_APPROVE_PO,
        'PURCHASE_ORDER',
        order.poNumber,
        `Final Level ${currentStep.level} signature stamped by ${currentUser.name}. Certificate: ${certificate}. Order released to supplier.`
      );

      addToast('success', 'Order Fully Authorized', `PO ${order.poNumber} fully approved & transmitted to supplier!`);
    } else {
      // Advance to next level
      sendNotification(
        'usr-admin',
        `PO Signature Required: ${order.poNumber}`,
        `Level ${currentStep.level} signed by ${currentUser.name}. Awaiting Level ${nextLevel} (${nextPendingRole}) signature.`,
        NotificationEventType.PO_APPROVAL_REQUIRED,
        order.id
      );

      logAudit(
        currentUser,
        AuditAction.APPROVE_PO_LEVEL,
        'PURCHASE_ORDER',
        order.poNumber,
        `Level ${currentStep.level} signed by ${currentUser.name}. Advanced to Level ${nextLevel} (${nextPendingRole}).`
      );

      addToast('success', 'Level Signed', `Level ${currentStep.level} signed. Advanced to Level ${nextLevel}.`);
    }

    return {
      success: true,
      statusCode: 200,
      message: `Level ${currentStep.level} signed successfully`,
      timestamp: Date.now(),
      data: updatedOrder,
    };
  };

  const rejectPurchaseOrder = async (orderId: string, reason: string): Promise<ApiResponseResult> => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, statusCode: 404, message: 'Order not found', timestamp: Date.now() };

    const updated: PurchaseOrder = {
      ...order,
      status: OrderStatus.CANCELLED,
      rejectionReason: `Rejected at Level ${order.currentApprovalLevel} by ${currentUser.name}: ${reason}`,
      updatedAt: Date.now(),
    };

    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));

    sendNotification(
      order.createdByUserId,
      `PO ${order.poNumber} Rejected`,
      `Rejected at Level ${order.currentApprovalLevel} by ${currentUser.name}. Reason: ${reason}`,
      NotificationEventType.PO_REJECTED,
      order.id
    );

    logAudit(
      currentUser,
      AuditAction.REJECT_PO_LEVEL,
      'PURCHASE_ORDER',
      order.poNumber,
      `Rejected at Level ${order.currentApprovalLevel} by ${currentUser.name}. Reason: ${reason}`
    );

    addToast('warning', 'Order Rejected', `Purchase Order ${order.poNumber} has been rejected and cancelled.`);

    return {
      success: true,
      statusCode: 200,
      message: 'Purchase order rejected and cancelled',
      timestamp: Date.now(),
      data: updated,
    };
  };

  // Supplier Actions
  const supplierAcceptOrder = async (orderId: string): Promise<ApiResponseResult> => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, statusCode: 404, message: 'Order not found', timestamp: Date.now() };

    const updated: PurchaseOrder = {
      ...order,
      status: OrderStatus.SUPPLIER_ACCEPTED,
      updatedAt: Date.now(),
    };

    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));

    sendNotification(
      'usr-proc',
      `Supplier Accepted: ${order.poNumber}`,
      `${order.supplierName} accepted the order and started fulfillment processing.`,
      NotificationEventType.SUPPLIER_ACCEPTED,
      order.id
    );

    logAudit(
      currentUser,
      AuditAction.ACCEPT_PO,
      'PURCHASE_ORDER',
      order.poNumber,
      `Supplier ${order.supplierName} accepted PO ${order.poNumber}`
    );

    addToast('success', 'Order Accepted', `Supplier accepted PO ${order.poNumber}`);

    return {
      success: true,
      statusCode: 200,
      message: 'Purchase order accepted by supplier',
      timestamp: Date.now(),
      data: updated,
    };
  };

  const supplierRejectOrder = async (orderId: string, reason: string): Promise<ApiResponseResult> => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, statusCode: 404, message: 'Order not found', timestamp: Date.now() };

    const updated: PurchaseOrder = {
      ...order,
      status: OrderStatus.SUPPLIER_REJECTED,
      rejectionReason: reason || 'Declined due to supplier manufacturing capacity limit',
      updatedAt: Date.now(),
    };

    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));

    sendNotification(
      'usr-proc',
      `Supplier Declined: ${order.poNumber}`,
      `${order.supplierName} rejected the order. Reason: ${reason}`,
      NotificationEventType.SUPPLIER_REJECTED,
      order.id
    );

    logAudit(
      currentUser,
      AuditAction.REJECT_PO,
      'PURCHASE_ORDER',
      order.poNumber,
      `Supplier ${order.supplierName} rejected PO ${order.poNumber}. Reason: ${reason}`
    );

    addToast('warning', 'Order Declined', `Supplier declined PO ${order.poNumber}`);

    return {
      success: true,
      statusCode: 200,
      message: 'Purchase order rejected by supplier',
      timestamp: Date.now(),
      data: updated,
    };
  };

  const supplierDispatchOrder = async (
    orderId: string,
    carrier: string = 'BlueDart Express',
    trackingNumber: string = `BD-EXP-${Math.floor(1000000 + Math.random() * 9000000)}`
  ): Promise<ApiResponseResult> => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, statusCode: 404, message: 'Order not found', timestamp: Date.now() };

    const updatedOrder: PurchaseOrder = {
      ...order,
      status: OrderStatus.DISPATCHED,
      carrier,
      trackingNumber,
      updatedAt: Date.now(),
    };

    setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));

    const deliveryId = 'del-' + Math.floor(100 + Math.random() * 900);
    const checkpoints: DeliveryTrackingCheckpoint[] = [
      {
        id: `chk-${deliveryId}-1`,
        deliveryId,
        stageName: 'Order Manifest & Dispatch',
        location: `${order.supplierName} Fulfillment Dock`,
        timestamp: Date.now(),
        isCompleted: true,
        notes: `Shipment packed, tracking #${trackingNumber} assigned`,
      },
      {
        id: `chk-${deliveryId}-2`,
        deliveryId,
        stageName: 'Carrier Pickup & Sorting',
        location: `${carrier} Main Depot`,
        timestamp: Date.now() + 2 * 3600000,
        isCompleted: true,
        notes: 'Package sorted into outbound line-haul carrier',
      },
      {
        id: `chk-${deliveryId}-3`,
        deliveryId,
        stageName: 'In Transit to Regional Hub',
        location: 'National Transit Highway Hub',
        timestamp: Date.now() + 8 * 3600000,
        isCompleted: false,
        notes: 'Linehaul vehicle in transit',
      },
      {
        id: `chk-${deliveryId}-4`,
        deliveryId,
        stageName: 'Out for Delivery',
        location: 'Central Sorting & Last-Mile Depot',
        timestamp: Date.now() + 20 * 3600000,
        isCompleted: false,
        notes: 'Assigned to Delivery Agent Suresh Kumar',
      },
      {
        id: `chk-${deliveryId}-5`,
        deliveryId,
        stageName: 'Delivered & Inventory Inwarded',
        location: 'Smart Procurement Receiving Dock',
        timestamp: Date.now() + 30 * 3600000,
        isCompleted: false,
        notes: 'Automatic inventory stock increment & receipt generation',
      },
    ];

    const newDelivery: Delivery = {
      id: deliveryId,
      purchaseOrderId: order.id,
      poNumber: order.poNumber,
      deliveryAgentId: 'usr-del',
      deliveryAgentName: 'Suresh Kumar',
      trackingNumber,
      carrier,
      status: DeliveryStatus.PICKED_UP,
      currentCheckpoint: 'Package dispatched from supplier hub - Carrier scanning in progress',
      estimatedDeliveryDate: Date.now() + 30 * 3600000,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      checkpoints,
    };

    setDeliveries((prev) => [newDelivery, ...prev]);

    sendNotification(
      'usr-proc',
      `Shipment Dispatched: ${order.poNumber}`,
      `Tracking Number: ${trackingNumber} via ${carrier}.`,
      NotificationEventType.ORDER_DISPATCHED,
      deliveryId
    );

    logAudit(
      currentUser,
      AuditAction.DISPATCH_ORDER,
      'PURCHASE_ORDER',
      order.poNumber,
      `Dispatched PO ${order.poNumber} with carrier ${carrier} (Tracking: ${trackingNumber})`
    );

    addToast('success', 'Order Dispatched', `Tracking #${trackingNumber} created via ${carrier}`);

    return {
      success: true,
      statusCode: 200,
      message: 'Order dispatched and delivery tracking initiated',
      timestamp: Date.now(),
      data: newDelivery,
    };
  };

  // Delivery & Automated Inventory Inwarding
  const advanceDeliveryStatus = async (
    deliveryId: string,
    nextStatus: DeliveryStatus,
    notes: string = ''
  ): Promise<ApiResponseResult> => {
    const delivery = deliveries.find((d) => d.id === deliveryId);
    if (!delivery) return { success: false, statusCode: 404, message: 'Delivery not found', timestamp: Date.now() };

    const order = orders.find((o) => o.id === delivery.purchaseOrderId);

    const checkpointText =
      nextStatus === DeliveryStatus.IN_TRANSIT
        ? 'In Transit - Out of Regional Linehaul Facility'
        : nextStatus === DeliveryStatus.OUT_FOR_DELIVERY
        ? `Out for delivery with agent ${delivery.deliveryAgentName}`
        : nextStatus === DeliveryStatus.DELIVERED
        ? 'Delivered at Destination Dock - Verified, Inspected & Received'
        : nextStatus === DeliveryStatus.FAILED
        ? `Delivery attempt failed: ${notes}`
        : notes || 'Checkpoint updated';

    // Update checkpoints if any
    const updatedCheckpoints = (delivery.checkpoints || []).map((chk) => {
      if (nextStatus === DeliveryStatus.IN_TRANSIT && chk.stageName.includes('Transit')) {
        return { ...chk, isCompleted: true, timestamp: Date.now() };
      }
      if (nextStatus === DeliveryStatus.OUT_FOR_DELIVERY && chk.stageName.includes('Out for Delivery')) {
        return { ...chk, isCompleted: true, timestamp: Date.now() };
      }
      if (nextStatus === DeliveryStatus.DELIVERED) {
        return { ...chk, isCompleted: true };
      }
      return chk;
    });

    const updatedDelivery: Delivery = {
      ...delivery,
      status: nextStatus,
      currentCheckpoint: checkpointText,
      actualDeliveryDate: nextStatus === DeliveryStatus.DELIVERED ? Date.now() : delivery.actualDeliveryDate,
      lastUpdated: Date.now(),
      checkpoints: updatedCheckpoints,
    };

    setDeliveries((prev) => prev.map((d) => (d.id === deliveryId ? updatedDelivery : d)));

    // Update corresponding Purchase Order
    if (order) {
      const newOrderStatus =
        nextStatus === DeliveryStatus.IN_TRANSIT
          ? OrderStatus.IN_TRANSIT
          : nextStatus === DeliveryStatus.OUT_FOR_DELIVERY
          ? OrderStatus.OUT_FOR_DELIVERY
          : nextStatus === DeliveryStatus.DELIVERED
          ? OrderStatus.DELIVERED
          : order.status;

      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: newOrderStatus, updatedAt: Date.now() } : o))
      );
    }

    // CRITICAL: AUTO-INVENTORY INWARDING ON DELIVERED
    if (nextStatus === DeliveryStatus.DELIVERED && order && order.items) {
      const newTxs: InventoryTransaction[] = [];

      setProducts((prevProducts) =>
        prevProducts.map((prod) => {
          const item = order.items?.find((it) => it.productId === prod.id);
          if (item) {
            const prevStock = prod.availableQuantity;
            const newStock = prevStock + item.quantity;

            newTxs.push({
              id: 'tx-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
              productId: prod.id,
              productName: prod.name,
              transactionType: TransactionType.PURCHASE_RECEIPT,
              quantityChanged: item.quantity,
              previousStock: prevStock,
              newStock,
              referenceId: order.poNumber,
              notes: `Auto-inwarded upon delivery confirmation (PO ${order.poNumber})`,
              createdAt: Date.now(),
            });

            return {
              ...prod,
              availableQuantity: newStock,
              isLowStock: newStock <= prod.minimumStock,
            };
          }
          return prod;
        })
      );

      if (newTxs.length > 0) {
        setTransactions((prev) => [...newTxs, ...prev]);
      }

      sendNotification(
        'usr-proc',
        `Shipment Delivered & Stock Inwarded: ${order.poNumber}`,
        `Dock inspection passed. ${order.items.length} product line(s) added to inventory stock automatically.`,
        NotificationEventType.ORDER_DELIVERED,
        delivery.id
      );

      logAudit(
        currentUser,
        AuditAction.MARK_DELIVERED,
        'DELIVERY',
        delivery.trackingNumber,
        `Delivery verified for PO ${order.poNumber}. Automatically updated inventory stock for ${order.items.length} item lines.`
      );

      addToast(
        'success',
        'Stock Inwarded',
        `PO ${order.poNumber} delivered! Products added to inventory warehouse.`
      );
    } else {
      logAudit(
        currentUser,
        AuditAction.UPDATE_DELIVERY,
        'DELIVERY',
        delivery.trackingNumber,
        `Updated delivery status to ${nextStatus}. Notes: ${notes || checkpointText}`
      );
      addToast('info', 'Delivery Status Updated', `Status changed to ${nextStatus}`);
    }

    return {
      success: true,
      statusCode: 200,
      message: `Delivery status updated to ${nextStatus}`,
      timestamp: Date.now(),
      data: updatedDelivery,
    };
  };

  // Manual Inventory Adjustment
  const adjustInventoryManual = async (
    productId: string,
    delta: number,
    notes: string
  ): Promise<ApiResponseResult> => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return { success: false, statusCode: 404, message: 'Product not found', timestamp: Date.now() };

    const prevStock = prod.availableQuantity;
    const newStock = Math.max(0, prevStock + delta);

    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              availableQuantity: newStock,
              isLowStock: newStock <= p.minimumStock,
            }
          : p
      )
    );

    const tx: InventoryTransaction = {
      id: 'tx-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      productId: prod.id,
      productName: prod.name,
      transactionType: TransactionType.ADJUSTMENT,
      quantityChanged: delta,
      previousStock: prevStock,
      newStock,
      referenceId: 'MANUAL-ADJ',
      notes: notes || 'Manual audit correction',
      createdAt: Date.now(),
    };

    setTransactions((prev) => [tx, ...prev]);

    logAudit(
      currentUser,
      AuditAction.UPDATE_INVENTORY,
      'INVENTORY',
      prod.productCode,
      `Manual stock adjustment: ${delta > 0 ? '+' : ''}${delta} (${prevStock} -> ${newStock}). Notes: ${notes}`
    );

    addToast('success', 'Stock Adjusted', `${prod.name}: Stock updated to ${newStock}`);

    return {
      success: true,
      statusCode: 200,
      message: `Stock updated to ${newStock}`,
      timestamp: Date.now(),
      data: newStock,
    };
  };

  const getReplenishmentRecommendations = (): ReplenishmentRecommendation[] => {
    return lowStockProducts.map((prod) => {
      const neededQty = Math.max(1, prod.maximumStock - prod.availableQuantity);
      const prefSupplier = suppliers.find((s) => s.id === prod.supplierId) || suppliers[0] || null;
      const cost = neededQty * prod.unitPrice;

      return {
        product: prod,
        currentStock: prod.availableQuantity,
        minimumStock: prod.minimumStock,
        maximumStock: prod.maximumStock,
        recommendedQuantity: neededQty,
        preferredSupplier: prefSupplier,
        estimatedCost: cost,
        reason: `Current stock (${prod.availableQuantity}) is below safety threshold (${prod.minimumStock}). Replenish to reach capacity (${prod.maximumStock}).`,
      };
    });
  };

  // Supplier Scoring Algorithm (Matches Android ProcurementRepository.kt)
  const rankSuppliersForProduct = (product: Product): SupplierRecommendation[] => {
    return suppliers
      .map((sup) => {
        const priceRatio = Math.max(50, Math.min(100, 100.0 - Math.min(30, sup.averageLeadDays * 2.0)));
        const qualityScore = sup.qualityScore;
        const deliveryScore = sup.onTimeDeliveryRate;
        const ratingScore = (sup.rating / 5.0) * 100.0;
        const reliabilityScore = sup.status === 'ACTIVE' ? 95.0 : 40.0;

        const totalScore = Math.min(
          100.0,
          Math.max(
            0.0,
            settings.weightPrice * priceRatio +
              settings.weightQuality * qualityScore +
              settings.weightDelivery * deliveryScore +
              settings.weightRating * ratingScore +
              settings.weightReliability * reliabilityScore
          )
        );

        const reason =
          totalScore >= 92
            ? `Top Ranked: Outstanding on-time fulfillment (${sup.onTimeDeliveryRate}%) & lead time (${sup.averageLeadDays} days)`
            : totalScore >= 85
            ? `Highly Recommended: Competitive pricing and consistent quality score (${sup.qualityScore}%)`
            : 'Acceptable alternative supplier';

        return {
          supplier: sup,
          scorePercentage: Math.round(totalScore),
          priceScore: priceRatio,
          qualityScore,
          deliveryScore,
          ratingScore,
          reliabilityScore,
          reason,
        };
      })
      .sort((a, b) => b.scorePercentage - a.scorePercentage);
  };

  const submitSupplierRating = async (data: {
    supplierId: string;
    qualityScore: number;
    deliveryScore: number;
    pricingScore: number;
    serviceScore: number;
    feedback: string;
    purchaseOrderId?: string;
    poNumber?: string;
    category?: string;
  }): Promise<ApiResponseResult> => {
    const supplier = suppliers.find((s) => s.id === data.supplierId);
    if (!supplier) return { success: false, statusCode: 404, message: 'Supplier not found', timestamp: Date.now() };

    const overallScore = Math.min(
      100.0,
      Math.max(0.0, data.qualityScore * 0.35 + data.deliveryScore * 0.35 + data.pricingScore * 0.15 + data.serviceScore * 0.15)
    );
    const ratingStars = Math.min(5.0, Math.max(1.0, overallScore / 20.0));

    const newRating: SupplierPerformanceRating = {
      id: 'rat-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      supplierId: supplier.id,
      supplierName: supplier.companyName,
      purchaseOrderId: data.purchaseOrderId,
      poNumber: data.poNumber,
      ratedByUserId: currentUser.id,
      ratedByName: currentUser.name,
      qualityScore: data.qualityScore,
      deliveryScore: data.deliveryScore,
      pricingScore: data.pricingScore,
      serviceScore: data.serviceScore,
      overallScore,
      ratingStars: Math.round(ratingStars * 10) / 10,
      feedbackComments: data.feedback,
      ratingCategory: data.category || 'Performance Review',
      ratingDate: Date.now(),
    };

    const updatedRatings = [newRating, ...ratings];
    setRatings(updatedRatings);

    // Recalculate supplier average scores
    const allSupplierRatings = updatedRatings.filter((r) => r.supplierId === supplier.id);
    const avgStars = allSupplierRatings.reduce((a, b) => a + b.ratingStars, 0) / allSupplierRatings.length;
    const avgQuality = allSupplierRatings.reduce((a, b) => a + b.qualityScore, 0) / allSupplierRatings.length;
    const avgDelivery = allSupplierRatings.reduce((a, b) => a + b.deliveryScore, 0) / allSupplierRatings.length;

    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === supplier.id
          ? {
              ...s,
              rating: Math.round(avgStars * 10) / 10,
              qualityScore: Math.round(avgQuality * 10) / 10,
              onTimeDeliveryRate: Math.round(avgDelivery * 10) / 10,
            }
          : s
      )
    );

    sendNotification(
      'usr-proc',
      `Supplier Rated: ${supplier.companyName}`,
      `New rating submitted (${ratingStars.toFixed(1)}★ / ${overallScore.toFixed(1)}% score)`,
      NotificationEventType.SUPPLIER_ACCEPTED,
      newRating.id
    );

    logAudit(
      currentUser,
      AuditAction.LOGIN,
      'SUPPLIER_RATING',
      supplier.id,
      `Submitted performance evaluation for ${supplier.companyName}: Overall ${overallScore.toFixed(1)}% (${ratingStars.toFixed(1)}★)`
    );

    addToast('success', 'Rating Submitted', `Evaluation for ${supplier.companyName} recorded.`);

    return {
      success: true,
      statusCode: 200,
      message: `Performance rating submitted for ${supplier.companyName}`,
      timestamp: Date.now(),
      data: newRating,
    };
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'rating' | 'qualityScore' | 'onTimeDeliveryRate'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: 'sup-' + Math.floor(100 + Math.random() * 900),
      rating: 4.5,
      qualityScore: 90.0,
      onTimeDeliveryRate: 92.0,
    };
    setSuppliers((prev) => [...prev, newSupplier]);
    addToast('success', 'Supplier Added', `${newSupplier.companyName} registered to directory`);
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    addToast('info', 'Notifications Cleared', 'All notifications marked as read');
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // API Console Dispatcher (Matches Android executeWorkflowCommand)
  const executeWorkflowCommand = async (
    action: string,
    entityId: string,
    payload: string = ''
  ): Promise<ApiResponseResult> => {
    switch (action.toUpperCase()) {
      case 'APPROVE_REQUEST':
        return approvePurchaseRequest(entityId, payload || 'Approved via Central REST API');
      case 'REJECT_REQUEST':
        return rejectPurchaseRequest(entityId, payload || 'Rejected via Central REST API');
      case 'CREATE_PURCHASE_ORDER': {
        const req = requests.find((r) => r.id === entityId || r.requestNumber === entityId);
        if (req) {
          const firstProd = req.items?.[0] ? products.find((p) => p.id === req.items![0].productId) : null;
          const supId = firstProd?.supplierId || suppliers[0].id;
          return convertRequestToPo(req.id, supId, payload || 'Generated via REST Console');
        }
        return { success: false, statusCode: 404, message: 'Purchase request not found', timestamp: Date.now() };
      }
      case 'ACCEPT_ORDER': {
        const order = orders.find((o) => o.id === entityId || o.poNumber === entityId);
        if (order) return supplierAcceptOrder(order.id);
        return { success: false, statusCode: 404, message: 'Order not found', timestamp: Date.now() };
      }
      case 'REJECT_ORDER': {
        const order = orders.find((o) => o.id === entityId || o.poNumber === entityId);
        if (order) return supplierRejectOrder(order.id, payload || 'Declined capacity limit');
        return { success: false, statusCode: 404, message: 'Order not found', timestamp: Date.now() };
      }
      case 'DISPATCH_ORDER': {
        const order = orders.find((o) => o.id === entityId || o.poNumber === entityId);
        if (order) return supplierDispatchOrder(order.id);
        return { success: false, statusCode: 404, message: 'Order not found', timestamp: Date.now() };
      }
      case 'MARK_DELIVERED': {
        const del = deliveries.find((d) => d.id === entityId || d.poNumber === entityId || d.trackingNumber === entityId);
        if (del) return advanceDeliveryStatus(del.id, DeliveryStatus.DELIVERED, payload || 'Delivered via REST Console');
        return { success: false, statusCode: 404, message: 'Delivery record not found', timestamp: Date.now() };
      }
      default:
        return { success: false, statusCode: 400, message: `Unknown workflow action: ${action}`, timestamp: Date.now() };
    }
  };

  // Interactive 7-Step Demo Lifecycle Stepper
  const advanceDemoLifecycle = async () => {
    const step = demoLifecycleStep;

    switch (step) {
      case 1: {
        // Step 1: Priya Patel submits PR
        const employee = users.find((u) => u.role === UserRole.EMPLOYEE) || currentUser;
        setCurrentUserId(employee.id);
        const req = await createPurchaseRequest(
          Priority.HIGH,
          'Cloud Platform Architecture',
          'Interactive Demo: 2x ThinkPad Laptops requisitioned for team sprint',
          [{ product: products[0], quantity: 2 }]
        );
        setDemoLifecycleStep(2);
        addToast('info', 'Demo Step 1 Done', `Requisition ${req.requestNumber} submitted by ${employee.name}`);
        break;
      }
      case 2: {
        // Step 2: Approving Manager approves
        const manager = users.find((u) => u.role === UserRole.APPROVING_MANAGER) || currentUser;
        setCurrentUserId(manager.id);
        const pendingReq = requests.find((r) => r.status === RequestStatus.PENDING_APPROVAL);
        if (pendingReq) {
          await approvePurchaseRequest(pendingReq.id, 'Budget and engineering allocation validated');
        }
        setDemoLifecycleStep(3);
        addToast('info', 'Demo Step 2 Done', 'Department Approving Manager approved requisition');
        break;
      }
      case 3: {
        // Step 3: Procurement Manager converts to PO
        const proc = users.find((u) => u.role === UserRole.PROCUREMENT_MANAGER) || currentUser;
        setCurrentUserId(proc.id);
        const approvedReq = requests.find((r) => r.status === RequestStatus.APPROVED);
        if (approvedReq) {
          await convertRequestToPo(approvedReq.id, suppliers[0].id, 'Interactive demo purchase order conversion');
        }
        setDemoLifecycleStep(4);
        addToast('info', 'Demo Step 3 Done', 'Converted to PO & initiated multi-tier approval chain');
        break;
      }
      case 4: {
        // Step 4: Sign PO
        const pendingPo = orders.find((o) => o.status === OrderStatus.PENDING_APPROVAL);
        if (pendingPo) {
          const admin = users.find((u) => u.role === UserRole.ADMIN) || currentUser;
          setCurrentUserId(admin.id);
          await approvePurchaseOrderLevel(pendingPo.id, 'Executive authorization with digital certificate stamp');
        }
        setDemoLifecycleStep(5);
        addToast('info', 'Demo Step 4 Done', 'PO digitally authorized & released to supplier');
        break;
      }
      case 5: {
        // Step 5: Supplier accepts & dispatches
        const sup = users.find((u) => u.role === UserRole.SUPPLIER) || currentUser;
        setCurrentUserId(sup.id);
        const sentPo = orders.find((o) => o.status === OrderStatus.SENT_TO_SUPPLIER || o.status === OrderStatus.SUPPLIER_ACCEPTED);
        if (sentPo) {
          await supplierAcceptOrder(sentPo.id);
          await supplierDispatchOrder(sentPo.id, 'BlueDart Express');
        }
        setDemoLifecycleStep(6);
        addToast('info', 'Demo Step 5 Done', 'Supplier accepted & dispatched with live tracking');
        break;
      }
      case 6: {
        // Step 6: Delivery agent out for delivery
        const agent = users.find((u) => u.role === UserRole.DELIVERY_AGENT) || currentUser;
        setCurrentUserId(agent.id);
        const activeDel = deliveries.find((d) => d.status !== DeliveryStatus.DELIVERED);
        if (activeDel) {
          await advanceDeliveryStatus(activeDel.id, DeliveryStatus.OUT_FOR_DELIVERY, 'Assigned to Agent Suresh Kumar');
        }
        setDemoLifecycleStep(7);
        addToast('info', 'Demo Step 6 Done', 'Carrier marked package Out for Delivery');
        break;
      }
      case 7: {
        // Step 7: Delivery completed & auto-inwarded!
        const agent = users.find((u) => u.role === UserRole.DELIVERY_AGENT) || currentUser;
        setCurrentUserId(agent.id);
        const activeDel = deliveries.find((d) => d.status === DeliveryStatus.OUT_FOR_DELIVERY || d.status === DeliveryStatus.IN_TRANSIT || d.status === DeliveryStatus.PICKED_UP);
        if (activeDel) {
          await advanceDeliveryStatus(activeDel.id, DeliveryStatus.DELIVERED, 'Dock receipt confirmed and signed');
        }
        setDemoLifecycleStep(1);
        addToast('success', 'Demo Completed', 'Delivered & inventory stock auto-inwarded!');
        break;
      }
    }
  };

  const resetDemoLifecycle = () => {
    setDemoLifecycleStep(1);
    addToast('info', 'Demo Reset', 'Demo cycle reset to Step 1');
  };

  const triggerTestHighValueAlert = (isApproved: boolean) => {
    const samplePo = orders[0];
    setHighValueAlert({
      order: samplePo,
      isApproved,
      message: isApproved
        ? `PO ${samplePo.poNumber} (₹${samplePo.totalAmount.toLocaleString('en-IN')}) passed executive audit & was issued with digital verification certificate!`
        : `Strategic Capital PO ${samplePo.poNumber} (₹${samplePo.totalAmount.toLocaleString('en-IN')}) requires multi-tier Board authorization.`,
    });
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast('success', 'Settings Saved', 'System workflow parameters updated');
  };

  const resetAllData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUserId('usr-admin');
    setProducts(INITIAL_PRODUCTS);
    setSuppliers(INITIAL_SUPPLIERS);
    setRequests(INITIAL_REQUESTS);
    setOrders(INITIAL_ORDERS);
    setDeliveries(INITIAL_DELIVERIES);
    setTransactions(INITIAL_TRANSACTIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setRatings(INITIAL_RATINGS);
    setSettings(INITIAL_SETTINGS);
    setDemoLifecycleStep(1);
    addToast('info', 'Data Reset', 'All records reset to initial seeds');
  };

  return (
    <ProcurementContext.Provider
      value={{
        currentUser,
        allUsers: users,
        allProducts: products,
        lowStockProducts,
        allCategories: INITIAL_CATEGORIES,
        allSuppliers: suppliers,
        allRequests: requests,
        allOrders: orders,
        allDeliveries: deliveries,
        allTransactions: transactions,
        allNotifications: notifications,
        unreadNotificationCount,
        allAuditLogs: auditLogs,
        allSupplierRatings: ratings,
        settings,
        topPerformingSupplier,
        activeTab,
        themeMode,
        highValueAlert,
        demoLifecycleStep,
        toasts,
        requests,
        orders,
        deliveries,
        suppliers,
        products,
        transactions,
        categories: INITIAL_CATEGORIES,
        removeToast: dismissToast,
        showNotificationsModal,
        setShowNotificationsModal,
        showAuthDialog,
        setShowAuthDialog,
        showNewRequisitionModal,
        setShowNewRequisitionModal,
        setActiveTab,
        setThemeMode,
        toggleTheme,
        addToast,
        dismissToast,
        dismissHighValueAlert,
        triggerTestHighValueAlert,
        advanceDemoLifecycle,
        resetDemoLifecycle,
        switchRole,
        switchUserById,
        login,
        signUp,
        logout,
        upgradeMembership,
        createPurchaseRequest,
        approvePurchaseRequest,
        rejectPurchaseRequest,
        convertRequestToPo,
        approvePurchaseOrderLevel,
        rejectPurchaseOrder,
        supplierAcceptOrder,
        supplierRejectOrder,
        supplierDispatchOrder,
        advanceDeliveryStatus,
        adjustInventoryManual,
        getReplenishmentRecommendations,
        submitSupplierRating,
        rankSuppliersForProduct,
        addSupplier,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        executeWorkflowCommand,
        updateSettings,
        resetAllData,
      }}
    >
      {children}
    </ProcurementContext.Provider>
  );
};

export const useProcurement = () => {
  const context = useContext(ProcurementContext);
  if (!context) {
    throw new Error('useProcurement must be used within a ProcurementProvider');
  }
  return context;
};
