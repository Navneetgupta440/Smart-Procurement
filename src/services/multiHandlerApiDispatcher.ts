import { PostmanRequestItem, PostmanEnvironment, substituteVariables } from '../data/postmanCollection';

export interface PostmanExecutionTestResult {
  title: string;
  passed: boolean;
  error?: string;
}

export interface PostmanExecutionResponse {
  statusCode: number;
  statusText: string;
  responseTimeMs: number;
  headers: Record<string, string>;
  body: any;
  testResults: PostmanExecutionTestResult[];
  environmentUpdates?: Partial<PostmanEnvironment>;
}

export async function executePostmanRequest(
  item: PostmanRequestItem,
  env: PostmanEnvironment,
  payloadString?: string,
  appContextData?: any
): Promise<PostmanExecutionResponse> {
  const startTime = performance.now();
  await new Promise((resolve) => setTimeout(resolve, 180 + Math.floor(Math.random() * 140)));
  const responseTimeMs = Math.round(performance.now() - startTime);

  let parsedPayload: any = {};
  if (payloadString && payloadString.trim()) {
    try {
      const substituted = substituteVariables(payloadString, env);
      parsedPayload = JSON.parse(substituted);
    } catch {
      parsedPayload = { raw: payloadString };
    }
  }

  let statusCode = 200;
  let statusText = 'OK';
  let responseBody: any = {};
  const environmentUpdates: Partial<PostmanEnvironment> = {};
  const testResults: PostmanExecutionTestResult[] = [];

  // Route Dispatcher based on item.path
  const path = item.path;

  // 1. AUTH & USER MANAGEMENT
  if (path === '/api/auth/register') {
    statusCode = 201;
    statusText = 'Created';
    const newUserId = `usr-${Date.now().toString().slice(-4)}`;
    const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIke25ld1VzZXJJZH0iLCJuYW1lIjoiSm9obiBEb2UiLCJyb2xlIjoiZW1wbG95ZWUifQ.${Math.random().toString(36).slice(2)}`;
    responseBody = {
      success: true,
      message: 'User registered successfully and onboarding activated',
      userId: newUserId,
      token,
      refreshToken: `rf_${Math.random().toString(36).slice(2)}`,
      user: {
        id: newUserId,
        name: parsedPayload.name || 'John Doe',
        email: parsedPayload.email || 'john@example.com',
        phone: parsedPayload.phone || '+1234567890',
        role: 'EMPLOYEE',
        department: 'Operations',
        createdAt: new Date().toISOString(),
      },
    };
    environmentUpdates.user_id = newUserId;
    environmentUpdates.token = token;
  } else if (path === '/api/auth/login') {
    statusCode = 200;
    statusText = 'OK';
    const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3ItMTAxIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6ImFkbWluIiwiZXhwIjoyMDE2MDM4NDAwfQ.${Math.random().toString(36).slice(2)}`;
    const refreshToken = `rf_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    const userId = 'usr-101';

    responseBody = {
      success: true,
      message: 'Authentication successful. Bearer session established.',
      token,
      refreshToken,
      userId,
      user: {
        id: userId,
        name: 'John Doe',
        email: parsedPayload.email || 'john@example.com',
        role: 'ADMIN',
        department: 'Corporate Procurement & Supply',
      },
      expiresIn: 86400,
    };

    // Environment updates as required by the Postman collection script
    environmentUpdates.token = token;
    environmentUpdates.refresh_token = refreshToken;
    environmentUpdates.user_id = userId;

    // Run Postman script tests
    testResults.push({
      title: 'Login successful - Status 200',
      passed: statusCode === 200,
    });
    testResults.push({
      title: 'Response contains token',
      passed: Boolean(token && token.length > 0),
    });
    testResults.push({
      title: 'Response time is acceptable (< 3000ms)',
      passed: responseTimeMs < 3000,
    });
  } else if (path === '/api/auth/verify-otp') {
    statusCode = 200;
    responseBody = {
      success: true,
      message: 'OTP 2-Factor Authentication verified successfully',
      email: parsedPayload.email || 'john@example.com',
      verified: true,
      deviceTrustScore: 99.4,
    };
  } else if (path === '/api/users/profile') {
    if (item.method === 'GET') {
      responseBody = {
        userId: env.user_id,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        role: 'ADMIN',
        organization: 'Enterprise Procurement Corp',
        permissions: ['read', 'write', 'approve', 'admin', 'billing'],
        lastLogin: new Date(Date.now() - 3600000).toISOString(),
      };
    } else {
      responseBody = {
        success: true,
        message: 'User profile updated successfully',
        updatedFields: parsedPayload,
        updatedAt: new Date().toISOString(),
      };
    }
  } else if (path === '/api/auth/change-password') {
    responseBody = {
      success: true,
      message: 'Password changed successfully across all active sessions.',
      passwordUpdatedAt: new Date().toISOString(),
    };
  } else if (path === '/api/auth/logout') {
    responseBody = {
      success: true,
      message: 'User logged out. Access token and refresh token revoked from Redis session store.',
    };
  }

  // 2. ADMIN
  else if (path === '/api/admin/dashboard') {
    responseBody = {
      status: 'active',
      environment: 'production',
      metrics: {
        totalUsers: 48,
        activeRequisitions: appContextData?.requests?.length || 18,
        activePurchaseOrders: appContextData?.orders?.length || 12,
        totalSpendYtd: appContextData?.kpis?.totalSpend || 284000,
        averageCycleTimeHours: 4.8,
        systemHealth: 'HEALTHY',
        databaseLatencyMs: 12,
        cacheHitRatio: '98.4%',
      },
      auditCount24h: 312,
    };
  } else if (path === '/api/admin/users') {
    responseBody = {
      total: 6,
      users: [
        { id: 'usr-101', name: 'John Doe', email: 'john@example.com', role: 'ADMIN', status: 'ACTIVE' },
        { id: 'usr-102', name: 'Sarah Jenkins', email: 'sarah.j@enterprise.com', role: 'PROCUREMENT_MANAGER', status: 'ACTIVE' },
        { id: 'usr-103', name: 'Marcus Vance', email: 'marcus.v@enterprise.com', role: 'APPROVING_MANAGER', status: 'ACTIVE' },
        { id: 'usr-104', name: 'Elena Rostova', email: 'elena.r@enterprise.com', role: 'EMPLOYEE', status: 'ACTIVE' },
        { id: 'usr-105', name: 'TechGlobal Logistics', email: 'vendor@techglobal.com', role: 'SUPPLIER', status: 'ACTIVE' },
        { id: 'usr-106', name: 'Apex Express Cargo', email: 'dispatch@apex.com', role: 'DELIVERY_AGENT', status: 'ACTIVE' },
      ],
    };
  } else if (path.includes('/api/admin/users/') && path.endsWith('/role')) {
    responseBody = {
      success: true,
      message: `User ${env.user_id} role changed to ${parsedPayload.role || 'moderator'}`,
      updatedBy: 'usr-101 (Admin)',
      effectiveImmediately: true,
    };
  } else if (path.includes('/api/admin/users/')) {
    if (item.method === 'DELETE') {
      responseBody = {
        success: true,
        message: `User ${env.user_id} deactivated and access tokens invalidated`,
        deactivatedAt: new Date().toISOString(),
      };
    } else {
      responseBody = {
        userId: env.user_id,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'ADMIN',
        accountStatus: 'ACTIVE',
        createdOn: '2026-01-15T09:00:00.000Z',
      };
    }
  } else if (path === '/api/admin/settings') {
    if (item.method === 'PUT') {
      responseBody = {
        success: true,
        message: 'System settings updated successfully in cluster registry',
        settings: parsedPayload,
      };
    } else {
      responseBody = {
        maintenanceMode: false,
        maxUploadSizeMB: 50,
        allowRegistrations: true,
        auditLogRetentionDays: 365,
        defaultCurrency: 'USD',
        twoFactorEnforced: true,
      };
    }
  } else if (path === '/api/admin/audit-logs') {
    responseBody = {
      total: 5,
      logs: [
        { id: 'aud-901', action: 'ROLE_MODIFIED', performedBy: 'usr-101', target: 'usr-104', timestamp: Date.now() - 7200000 },
        { id: 'aud-902', action: 'SETTING_CHANGE', performedBy: 'usr-101', detail: 'maxUploadSizeMB -> 50', timestamp: Date.now() - 14400000 },
        { id: 'aud-903', action: 'PO_APPROVED', performedBy: 'usr-103', entityId: 'po-2026-000501', timestamp: Date.now() - 28800000 },
        { id: 'aud-904', action: 'PAYMENT_INITIATED', performedBy: 'usr-101', entityId: 'pay_99481726a', timestamp: Date.now() - 43200000 },
        { id: 'aud-905', action: 'USER_LOGIN', performedBy: 'usr-101', ip: '192.168.1.1', timestamp: Date.now() - 86400000 },
      ],
    };
  }

  // 3. REQUESTS & RESPONSES
  else if (path === '/api/requests') {
    if (item.method === 'POST') {
      statusCode = 201;
      const newReqId = `pr-${Math.floor(Math.random() * 900 + 100)}`;
      environmentUpdates.request_id = newReqId;
      responseBody = {
        success: true,
        message: 'Procurement Request submitted to approval pipeline',
        requestId: newReqId,
        type: parsedPayload.type || 'general',
        title: parsedPayload.title || 'My Request',
        description: parsedPayload.description || 'Details of the request',
        priority: parsedPayload.priority || 'medium',
        status: 'PENDING_APPROVAL',
        submittedAt: new Date().toISOString(),
      };
    } else {
      // GET All
      const reqList = appContextData?.requests || [
        { id: 'pr-101', requestNumber: 'PR-2026-000101', title: 'Workstation Upgrades', priority: 'HIGH', status: 'PENDING_APPROVAL' },
        { id: 'pr-102', requestNumber: 'PR-2026-000102', title: 'Cloud Infrastructure Server', priority: 'URGENT', status: 'APPROVED' },
      ];
      responseBody = {
        total: reqList.length,
        requests: reqList,
      };
    }
  } else if (path.includes('/api/requests/') && path.endsWith('/response')) {
    if (item.method === 'POST') {
      responseBody = {
        success: true,
        message: 'Response posted and notified to requester',
        requestId: env.request_id,
        status: parsedPayload.status || 'resolved',
        resolutionNote: parsedPayload.message || 'Your request has been processed.',
        resolvedAt: new Date().toISOString(),
      };
    } else {
      responseBody = {
        requestId: env.request_id,
        status: 'RESOLVED',
        resolutionMessage: 'Procurement verified. Approved for purchase order generation.',
        respondedBy: 'Procurement Desk Level 2',
        respondedAt: new Date(Date.now() - 1800000).toISOString(),
      };
    }
  } else if (path.includes('/api/requests/')) {
    if (item.method === 'DELETE') {
      responseBody = {
        success: true,
        message: `Request ${env.request_id} has been permanently removed`,
      };
    } else if (item.method === 'PUT') {
      responseBody = {
        success: true,
        message: `Request ${env.request_id} modified successfully`,
        updatedData: parsedPayload,
      };
    } else {
      responseBody = {
        requestId: env.request_id,
        title: 'Workstation Upgrades & GPU Compute',
        description: 'Procuring 5 high-spec workstations for simulation workloads',
        priority: 'HIGH',
        status: 'PENDING_APPROVAL',
        estimatedCost: 14500.0,
      };
    }
  }

  // 4. PAYMENTS (PAID)
  else if (path === '/api/payments/initiate') {
    statusCode = 201;
    const paymentId = `pay_${Math.random().toString(36).slice(2, 9)}`;
    environmentUpdates.payment_id = paymentId;
    responseBody = {
      success: true,
      paymentId,
      orderId: parsedPayload.orderId || env.order_id,
      amount: parsedPayload.amount || 499.99,
      currency: parsedPayload.currency || 'USD',
      method: parsedPayload.method || 'card',
      status: 'INITIATED',
      gateway: 'Stripe Corporate B2B Gateway',
      checkoutUrl: `https://checkout.stripe.com/c/pay/${paymentId}`,
      expiresAt: new Date(Date.now() + 1800000).toISOString(),
    };
  } else if (path === '/api/payments/verify') {
    responseBody = {
      success: true,
      paymentId: parsedPayload.paymentId || env.payment_id,
      transactionId: parsedPayload.transactionId || 'txn_abc123',
      status: 'COMPLETED',
      amountReceived: 499.99,
      settlementDate: new Date().toISOString(),
      receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
    };
  } else if (path.includes('/api/payments/') && path.endsWith('/refund/status')) {
    responseBody = {
      paymentId: env.payment_id,
      refundStatus: 'PROCESSED',
      refundedAmount: 499.99,
      originalMethod: 'Corporate Card ending 4242',
      estimatedArrivalDays: '2-3 business days',
    };
  } else if (path.includes('/api/payments/') && path.endsWith('/refund')) {
    responseBody = {
      success: true,
      message: 'Refund request registered and queued for merchant clearance',
      paymentId: env.payment_id,
      refundId: `ref_${Date.now().toString().slice(-6)}`,
      amountRefunded: parsedPayload.amount || 499.99,
      reason: parsedPayload.reason || 'Item not received',
      status: 'PENDING_BANK_SETTLEMENT',
    };
  } else if (path.includes('/api/payments/') && path.endsWith('/status')) {
    responseBody = {
      paymentId: env.payment_id,
      status: 'PAID',
      amount: 499.99,
      currency: 'USD',
      settledAt: new Date(Date.now() - 86400000).toISOString(),
    };
  } else if (path === '/api/payments/history') {
    responseBody = {
      total: 3,
      history: [
        { paymentId: 'pay_99481726a', orderId: 'po-2026-000501', amount: 499.99, currency: 'USD', status: 'PAID', date: '2026-09-12' },
        { paymentId: 'pay_88319200b', orderId: 'po-2026-000499', amount: 3450.00, currency: 'USD', status: 'PAID', date: '2026-09-08' },
        { paymentId: 'pay_77209115c', orderId: 'po-2026-000482', amount: 1200.00, currency: 'USD', status: 'REFUNDED', date: '2026-09-01' },
      ],
    };
  }

  // 5. SHOP
  else if (path === '/api/shop/products') {
    if (item.method === 'POST') {
      statusCode = 201;
      const newProdId = `prod-${Math.floor(Math.random() * 900 + 100)}`;
      environmentUpdates.product_id = newProdId;
      responseBody = {
        success: true,
        message: 'Product listed successfully in catalog',
        productId: newProdId,
        product: {
          id: newProdId,
          name: parsedPayload.name || 'Product Name',
          description: parsedPayload.description || 'Product description',
          price: parsedPayload.price || 29.99,
          stock: parsedPayload.stock || 100,
          category: parsedPayload.category || 'electronics',
        },
      };
    } else {
      const catalog = appContextData?.products || [
        { id: 'prod-001', name: 'Industrial Ergonomic Mesh Task Chair', price: 289.99, stock: 45, category: 'Furniture' },
        { id: 'prod-002', name: 'Enterprise 4K UltraWide Display 34-inch', price: 649.00, stock: 22, category: 'Electronics' },
        { id: 'prod-003', name: 'High-Speed Thermal Receipt & Label Printer', price: 199.50, stock: 68, category: 'Hardware' },
        { id: 'prod-004', name: 'Smart RFID Warehouse Scanner Gun', price: 340.00, stock: 15, category: 'Logistics' },
      ];
      responseBody = {
        total: catalog.length,
        products: catalog,
      };
    }
  } else if (path.includes('/api/shop/products/')) {
    if (item.method === 'DELETE') {
      responseBody = {
        success: true,
        message: `Product ${env.product_id} deleted from catalog`,
      };
    } else if (item.method === 'PUT') {
      responseBody = {
        success: true,
        message: `Product ${env.product_id} updated`,
        updatedFields: parsedPayload,
      };
    } else {
      responseBody = {
        productId: env.product_id,
        name: 'Enterprise 4K UltraWide Display 34-inch',
        description: 'IPS curved panel with USB-C 90W Power Delivery and KVM switch',
        price: 649.00,
        stock: 22,
        category: 'Electronics',
        sku: 'SKU-DISP-4K34',
      };
    }
  } else if (path === '/api/shop/cart') {
    if (item.method === 'POST') {
      responseBody = {
        success: true,
        message: `Added product ${parsedPayload.productId || env.product_id} (qty: ${parsedPayload.quantity || 2}) to cart`,
        cartCount: 4,
        cartSubtotal: 828.98,
      };
    } else if (item.method === 'GET') {
      responseBody = {
        cartId: env.cart_id,
        items: [
          { productId: 'prod-001', name: 'Industrial Ergonomic Mesh Task Chair', quantity: 2, unitPrice: 289.99, total: 579.98 },
          { productId: 'prod-003', name: 'High-Speed Thermal Receipt Printer', quantity: 1, unitPrice: 199.50, total: 199.50 },
        ],
        subtotal: 779.48,
        tax: 62.36,
        shipping: 0.0,
        total: 841.84,
      };
    }
  } else if (path.includes('/api/shop/cart/')) {
    responseBody = {
      success: true,
      message: `Product ${env.product_id} removed from cart`,
      cartCount: 2,
    };
  } else if (path === '/api/shop/orders') {
    statusCode = 201;
    const newOrderId = `po-2026-${Math.floor(Math.random() * 9000 + 1000)}`;
    environmentUpdates.order_id = newOrderId;
    responseBody = {
      success: true,
      message: 'Order created and dispatched to supplier network',
      orderId: newOrderId,
      paymentMethod: parsedPayload.paymentMethod || 'card',
      shippingAddress: parsedPayload.shippingAddress || { street: '123 Main St', city: 'New York', zip: '10001' },
      status: 'SUBMITTED',
      estimatedDelivery: new Date(Date.now() + 86400000 * 3).toISOString(),
    };
  } else if (path === '/api/shop/orders/my') {
    responseBody = {
      total: 2,
      orders: [
        { orderId: 'po-2026-000501', status: 'IN_TRANSIT', total: 499.99, date: '2026-09-14' },
        { orderId: 'po-2026-000489', status: 'DELIVERED', total: 1250.00, date: '2026-09-02' },
      ],
    };
  } else if (path.includes('/api/shop/orders/') && path.endsWith('/cancel')) {
    responseBody = {
      success: true,
      message: `Order ${env.order_id} cancelled. Reversal sequence triggered.`,
      cancelledAt: new Date().toISOString(),
    };
  } else if (path.includes('/api/shop/orders/')) {
    responseBody = {
      orderId: env.order_id,
      status: 'CONFIRMED',
      supplier: 'Apex Global Technologies',
      totalAmount: 499.99,
      lineItemsCount: 2,
      placedAt: '2026-09-14T10:15:00.000Z',
    };
  }

  // 6. STORAGE
  else if (path === '/api/storage/upload') {
    statusCode = 201;
    const fileId = `file-${Math.random().toString(36).slice(2, 8)}`;
    environmentUpdates.file_id = fileId;
    responseBody = {
      success: true,
      message: 'File encrypted and stored in secure procurement bucket',
      fileId,
      filename: 'invoice_march.pdf',
      sizeBytes: 245120,
      contentType: 'application/pdf',
      folder: 'uploads',
      downloadUrl: `https://api.procure-enterprise.internal/api/storage/files/${fileId}/download`,
    };
  } else if (path === '/api/storage/files') {
    responseBody = {
      total: 3,
      files: [
        { fileId: 'file-doc-001', name: 'vendor_compliance_iso27001.pdf', sizeBytes: 1048576, uploadedAt: '2026-09-10' },
        { fileId: 'file-doc-002', name: 'po_501_signed_agreement.pdf', sizeBytes: 524288, uploadedAt: '2026-09-12' },
        { fileId: 'file-doc-003', name: 'dock_receiving_slip_pack.zip', sizeBytes: 3145728, uploadedAt: '2026-09-14' },
      ],
    };
  } else if (path.includes('/api/storage/files/') && path.endsWith('/download')) {
    responseBody = {
      fileId: env.file_id,
      downloadUrl: `https://storage.googleapis.com/procure-vault-storage/${env.file_id}?signature=val9982x`,
      expiresInSeconds: 3600,
    };
  } else if (path.includes('/api/storage/files/')) {
    if (item.method === 'DELETE') {
      responseBody = {
        success: true,
        message: `File ${env.file_id} purged from persistent storage`,
      };
    } else {
      responseBody = {
        fileId: env.file_id,
        name: 'po_501_signed_agreement.pdf',
        sizeBytes: 524288,
        checksumSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        folder: 'contracts',
        uploadedBy: 'usr-101',
      };
    }
  } else if (path === '/api/storage/usage') {
    responseBody = {
      storageTier: 'Enterprise 50GB',
      usedBytes: 14885888,
      usedMB: 14.2,
      maxQuotaBytes: 52428800,
      maxQuotaMB: 50.0,
      percentageUsed: 28.4,
      totalFileCount: 42,
    };
  }

  // 7. APPROVAL & REJECTION
  else if (path === '/api/approvals') {
    statusCode = 201;
    const approvalId = `appr-${Math.floor(Math.random() * 9000 + 1000)}`;
    environmentUpdates.approval_id = approvalId;
    responseBody = {
      success: true,
      approvalId,
      entityType: parsedPayload.entityType || 'booking',
      entityId: parsedPayload.entityId || env.booking_id,
      requestedBy: parsedPayload.requestedBy || env.user_id,
      status: 'PENDING_APPROVAL',
      notes: parsedPayload.notes || 'Please review and approve this booking.',
      createdAt: new Date().toISOString(),
    };
  } else if (path === '/api/approvals/pending') {
    responseBody = {
      total: 3,
      approvals: [
        { approvalId: 'appr-501', entityType: 'purchase_order', entityId: 'po-2026-000501', amount: 18500, requestedBy: 'Sarah Jenkins', priority: 'HIGH' },
        { approvalId: 'appr-502', entityType: 'purchase_request', entityId: 'pr-101', amount: 4200, requestedBy: 'Elena Rostova', priority: 'MEDIUM' },
        { approvalId: 'appr-503', entityType: 'vendor_onboarding', entityId: 'sup-tech-01', amount: 0, requestedBy: 'Marcus Vance', priority: 'LOW' },
      ],
    };
  } else if (path.includes('/api/approvals/') && path.endsWith('/approve')) {
    responseBody = {
      success: true,
      message: 'Request approved successfully and advanced to PO issuance stage',
      approvalId: env.approval_id,
      status: 'APPROVED',
      approvedBy: parsedPayload.approvedBy || env.admin_id,
      comments: parsedPayload.comments || 'Approved after review.',
      approvedAt: new Date().toISOString(),
    };
  } else if (path.includes('/api/approvals/') && path.endsWith('/reject')) {
    responseBody = {
      success: true,
      message: 'Request rejected and returned to requester with rationale',
      approvalId: env.approval_id,
      status: 'REJECTED',
      rejectedBy: parsedPayload.rejectedBy || env.admin_id,
      reason: parsedPayload.reason || 'Insufficient documentation provided.',
      rejectedAt: new Date().toISOString(),
    };
  } else if (path === '/api/approvals/history') {
    responseBody = {
      total: 4,
      history: [
        { approvalId: 'appr-498', entityId: 'po-2026-000498', decision: 'APPROVED', decidedBy: 'Marcus Vance', timestamp: '2026-09-14' },
        { approvalId: 'appr-495', entityId: 'pr-099', decision: 'REJECTED', reason: 'Budget limit exceeded', decidedBy: 'Sarah Jenkins', timestamp: '2026-09-13' },
        { approvalId: 'appr-490', entityId: 'po-2026-000490', decision: 'APPROVED', decidedBy: 'Marcus Vance', timestamp: '2026-09-10' },
      ],
    };
  } else if (path.includes('/api/approvals/') && path.endsWith('/revoke')) {
    responseBody = {
      success: true,
      message: `Approval ${env.approval_id} revoked due to policy change. Entity reset to PENDING state.`,
      revokedAt: new Date().toISOString(),
    };
  } else if (path === '/api/approvals/bulk-approve') {
    const ids = parsedPayload.approvalIds || ['id1', 'id2', 'id3'];
    responseBody = {
      success: true,
      message: `Successfully bulk approved ${ids.length} requests in transaction lock`,
      approvedIds: ids,
      comments: parsedPayload.comments || 'Bulk approved',
      processedAt: new Date().toISOString(),
    };
  } else if (path === '/api/approvals/bulk-reject') {
    const ids = parsedPayload.approvalIds || ['id1', 'id2', 'id3'];
    responseBody = {
      success: true,
      message: `Successfully bulk rejected ${ids.length} requests`,
      rejectedIds: ids,
      reason: parsedPayload.reason || 'Bulk rejected due to policy violation',
      processedAt: new Date().toISOString(),
    };
  } else if (path.includes('/api/approvals/')) {
    responseBody = {
      approvalId: env.approval_id,
      entityType: 'purchase_order',
      entityId: env.order_id,
      status: 'PENDING_APPROVAL',
      notes: 'Please review and approve this booking / procurement order.',
      submittedAt: '2026-09-14T11:00:00.000Z',
    };
  }

  // Fallback if none matched
  else {
    responseBody = {
      success: true,
      message: `Dispatched ${item.method} to ${item.path}`,
      echoPayload: parsedPayload,
      timestamp: Date.now(),
    };
  }

  // Add standard status test if not already present
  if (testResults.length === 0) {
    testResults.push({
      title: `Status code is ${statusCode}`,
      passed: statusCode >= 200 && statusCode < 300,
    });
    testResults.push({
      title: 'Response payload is valid JSON',
      passed: typeof responseBody === 'object',
    });
    testResults.push({
      title: 'Response time is under 2000ms',
      passed: responseTimeMs < 2000,
    });
  }

  return {
    statusCode,
    statusText,
    responseTimeMs,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'x-powered-by': 'Procure-Enterprise-MultiHandler/2.1',
      'x-request-id': `req_${Math.random().toString(36).slice(2, 10)}`,
      date: new Date().toUTCString(),
    },
    body: responseBody,
    testResults,
    environmentUpdates,
  };
}
