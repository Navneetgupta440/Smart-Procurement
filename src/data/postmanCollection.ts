/**
 * Multi-Handler API Postman Collection (v2.1.0)
 * Collection ID: eb10583e-5adb-4606-8f8d-4f5b12bfe5a6
 * Exporter ID: 36971552
 */

export interface PostmanHeader {
  key: string;
  value: string;
}

export interface PostmanBody {
  mode: string;
  raw?: string;
  formdata?: Array<{ key: string; type: string; value: string }>;
  options?: {
    raw?: {
      language: string;
    };
  };
}

export interface PostmanRequestItem {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  rawUrl: string;
  headers: PostmanHeader[];
  body?: PostmanBody;
  folderName: string;
  description?: string;
  testScript?: string;
}

export interface PostmanFolder {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  items: PostmanRequestItem[];
}

export interface PostmanEnvironment {
  base_url: string;
  token: string;
  refresh_token: string;
  user_id: string;
  request_id: string;
  product_id: string;
  order_id: string;
  cart_id: string;
  payment_id: string;
  approval_id: string;
  booking_id: string;
  admin_id: string;
  file_id: string;
}

export const DEFAULT_POSTMAN_ENVIRONMENT: PostmanEnvironment = {
  base_url: 'https://api.procure-enterprise.internal',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3ItMTAxIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6ImFkbWluIn0.c2lnbmF0dXJlX2tleQ',
  refresh_token: 'rf_99a81e55b40c21ad879',
  user_id: 'usr-101',
  request_id: 'pr-101',
  product_id: 'prod-001',
  order_id: 'po-2026-000501',
  cart_id: 'cart-session-902',
  payment_id: 'pay_99481726a',
  approval_id: 'appr-501',
  booking_id: 'bk-8821',
  admin_id: 'usr-admin-01',
  file_id: 'file-doc-001',
};

export const RAW_POSTMAN_COLLECTION_METADATA = {
  id: 'eb10583e-5adb-4606-8f8d-4f5b12bfe5a6',
  name: 'Multi-Handler API',
  schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  exporterId: '36971552',
  totalEndpoints: 55,
  categoriesCount: 7,
};

export const POSTMAN_COLLECTION_FOLDERS: PostmanFolder[] = [
  {
    id: 'auth-user',
    name: 'Auth & User Management',
    icon: 'ShieldCheck',
    color: 'emerald',
    description: 'Registration, JWT token authentication, OTP validation, user profile & security',
    items: [
      {
        id: 'auth-reg',
        name: 'Register User',
        method: 'POST',
        path: '/api/auth/register',
        rawUrl: '{{base_url}}/api/auth/register',
        folderName: 'Auth & User Management',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            phone: '+1234567890',
          }, null, 2),
        },
      },
      {
        id: 'auth-login',
        name: 'Login',
        method: 'POST',
        path: '/api/auth/login',
        rawUrl: '{{base_url}}/api/auth/login',
        folderName: 'Auth & User Management',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            email: 'john@example.com',
            password: 'password123',
          }, null, 2),
        },
        testScript: `const res = pm.response.json();
const token = res.token || res.accessToken || res.access_token || (res.data && (res.data.token || res.data.accessToken)) || "";
if (token) {
    pm.environment.set("token", token);
    console.log("✅ token set:", token);
}
const refreshToken = res.refreshToken || res.refresh_token || (res.data && (res.data.refreshToken || res.data.refresh_token)) || "";
if (refreshToken) {
    pm.environment.set("refresh_token", refreshToken);
    console.log("✅ refresh_token set:", refreshToken);
}
const userId = res.userId || res.user_id || res.id || (res.user && (res.user.id || res.user._id || res.user.userId)) || "";
if (userId) {
    pm.environment.set("user_id", userId);
    console.log("✅ user_id set:", userId);
}
pm.test("Login successful - Status 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Response contains token", function () {
    pm.expect(token).to.not.be.empty;
});
pm.test("Response time is acceptable", function () {
    pm.expect(pm.response.responseTime).to.be.below(3000);
});`,
      },
      {
        id: 'auth-otp',
        name: 'Verify OTP',
        method: 'POST',
        path: '/api/auth/verify-otp',
        rawUrl: '{{base_url}}/api/auth/verify-otp',
        folderName: 'Auth & User Management',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            email: 'john@example.com',
            otp: '123456',
          }, null, 2),
        },
      },
      {
        id: 'auth-profile-get',
        name: 'Get User Profile',
        method: 'GET',
        path: '/api/users/profile',
        rawUrl: '{{base_url}}/api/users/profile',
        folderName: 'Auth & User Management',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
      {
        id: 'auth-profile-put',
        name: 'Update User Profile',
        method: 'PUT',
        path: '/api/users/profile',
        rawUrl: '{{base_url}}/api/users/profile',
        folderName: 'Auth & User Management',
        headers: [
          { key: 'Authorization', value: 'Bearer {{token}}' },
          { key: 'Content-Type', value: 'application/json' },
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            name: 'John Updated',
            phone: '+9876543210',
          }, null, 2),
        },
      },
      {
        id: 'auth-pwd',
        name: 'Change Password',
        method: 'PUT',
        path: '/api/auth/change-password',
        rawUrl: '{{base_url}}/api/auth/change-password',
        folderName: 'Auth & User Management',
        headers: [
          { key: 'Authorization', value: 'Bearer {{token}}' },
          { key: 'Content-Type', value: 'application/json' },
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            oldPassword: 'password123',
            newPassword: 'newpassword456',
          }, null, 2),
        },
      },
      {
        id: 'auth-logout',
        name: 'Logout',
        method: 'POST',
        path: '/api/auth/logout',
        rawUrl: '{{base_url}}/api/auth/logout',
        folderName: 'Auth & User Management',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
    ],
  },
  {
    id: 'admin',
    name: 'Admin',
    icon: 'Sliders',
    color: 'purple',
    description: 'System administration, user RBAC role assignment, system configs & immutable audit logs',
    items: [
      {
        id: 'admin-dash',
        name: 'Admin Dashboard Stats',
        method: 'GET',
        path: '/api/admin/dashboard',
        rawUrl: '{{base_url}}/api/admin/dashboard',
        folderName: 'Admin',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
      {
        id: 'admin-users-get',
        name: 'Get All Users (Admin)',
        method: 'GET',
        path: '/api/admin/users',
        rawUrl: '{{base_url}}/api/admin/users',
        folderName: 'Admin',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
      {
        id: 'admin-user-id',
        name: 'Get User by ID (Admin)',
        method: 'GET',
        path: '/api/admin/users/{{user_id}}',
        rawUrl: '{{base_url}}/api/admin/users/{{user_id}}',
        folderName: 'Admin',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
      {
        id: 'admin-role',
        name: 'Update User Role (Admin)',
        method: 'PUT',
        path: '/api/admin/users/{{user_id}}/role',
        rawUrl: '{{base_url}}/api/admin/users/{{user_id}}/role',
        folderName: 'Admin',
        headers: [
          { key: 'Authorization', value: 'Bearer {{token}}' },
          { key: 'Content-Type', value: 'application/json' },
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({ role: 'moderator' }, null, 2),
        },
      },
      {
        id: 'admin-deactivate',
        name: 'Deactivate User (Admin)',
        method: 'DELETE',
        path: '/api/admin/users/{{user_id}}',
        rawUrl: '{{base_url}}/api/admin/users/{{user_id}}',
        folderName: 'Admin',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
      {
        id: 'admin-settings-get',
        name: 'Get System Settings (Admin)',
        method: 'GET',
        path: '/api/admin/settings',
        rawUrl: '{{base_url}}/api/admin/settings',
        folderName: 'Admin',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
      {
        id: 'admin-settings-put',
        name: 'Update System Settings (Admin)',
        method: 'PUT',
        path: '/api/admin/settings',
        rawUrl: '{{base_url}}/api/admin/settings',
        folderName: 'Admin',
        headers: [
          { key: 'Authorization', value: 'Bearer {{token}}' },
          { key: 'Content-Type', value: 'application/json' },
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            maintenanceMode: false,
            maxUploadSizeMB: 50,
            allowRegistrations: true,
          }, null, 2),
        },
      },
      {
        id: 'admin-audit',
        name: 'Get Audit Logs (Admin)',
        method: 'GET',
        path: '/api/admin/audit-logs',
        rawUrl: '{{base_url}}/api/admin/audit-logs',
        folderName: 'Admin',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
    ],
  },
  {
    id: 'requests-responses',
    name: 'Requests & Responses',
    icon: 'FileText',
    color: 'blue',
    description: 'Procurement & requisition ticketing, request life-cycle, resolution responses and status flows',
    items: [
      {
        id: 'req-submit',
        name: 'Submit Request',
        method: 'POST',
        path: '/api/requests',
        rawUrl: '{{base_url}}/api/requests',
        folderName: 'Requests & Responses',
        headers: [
          { key: 'Authorization', value: 'Bearer {{token}}' },
          { key: 'Content-Type', value: 'application/json' },
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            type: 'general',
            title: 'My Request',
            description: 'Details of the request',
            priority: 'medium',
            metadata: {},
          }, null, 2),
        },
      },
      {
        id: 'req-get-all',
        name: 'Get All Requests',
        method: 'GET',
        path: '/api/requests',
        rawUrl: '{{base_url}}/api/requests',
        folderName: 'Requests & Responses',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
      {
        id: 'req-get-id',
        name: 'Get Request by ID',
        method: 'GET',
        path: '/api/requests/{{request_id}}',
        rawUrl: '{{base_url}}/api/requests/{{request_id}}',
        folderName: 'Requests & Responses',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
      {
        id: 'req-update',
        name: 'Update Request',
        method: 'PUT',
        path: '/api/requests/{{request_id}}',
        rawUrl: '{{base_url}}/api/requests/{{request_id}}',
        folderName: 'Requests & Responses',
        headers: [
          { key: 'Authorization', value: 'Bearer {{token}}' },
          { key: 'Content-Type', value: 'application/json' },
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            title: 'Updated Title',
            description: 'Updated description',
            priority: 'high',
          }, null, 2),
        },
      },
      {
        id: 'req-delete',
        name: 'Delete Request',
        method: 'DELETE',
        path: '/api/requests/{{request_id}}',
        rawUrl: '{{base_url}}/api/requests/{{request_id}}',
        folderName: 'Requests & Responses',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
      {
        id: 'req-get-resp',
        name: 'Get Response for Request',
        method: 'GET',
        path: '/api/requests/{{request_id}}/response',
        rawUrl: '{{base_url}}/api/requests/{{request_id}}/response',
        folderName: 'Requests & Responses',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
      {
        id: 'req-submit-resp',
        name: 'Submit Response to Request',
        method: 'POST',
        path: '/api/requests/{{request_id}}/response',
        rawUrl: '{{base_url}}/api/requests/{{request_id}}/response',
        folderName: 'Requests & Responses',
        headers: [
          { key: 'Authorization', value: 'Bearer {{token}}' },
          { key: 'Content-Type', value: 'application/json' },
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            message: 'Your request has been processed.',
            status: 'resolved',
            attachments: [],
          }, null, 2),
        },
      },
    ],
  },
  {
    id: 'payments',
    name: 'Payments (Paid)',
    icon: 'CreditCard',
    color: 'amber',
    description: 'Transaction initiation, signature verification, payment history & refund processing',
    items: [
      {
        id: 'pay-init',
        name: 'Initiate Payment',
        method: 'POST',
        path: '/api/payments/initiate',
        rawUrl: '{{base_url}}/api/payments/initiate',
        folderName: 'Payments (Paid)',
        headers: [
          { key: 'Authorization', value: 'Bearer {{token}}' },
          { key: 'Content-Type', value: 'application/json' },
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            orderId: '{{order_id}}',
            amount: 499.99,
            currency: 'USD',
            method: 'card',
            returnUrl: 'https://example.com/payment/callback',
          }, null, 2),
        },
      },
      {
        id: 'pay-verify',
        name: 'Verify Payment',
        method: 'POST',
        path: '/api/payments/verify',
        rawUrl: '{{base_url}}/api/payments/verify',
        folderName: 'Payments (Paid)',
        headers: [
          { key: 'Authorization', value: 'Bearer {{token}}' },
          { key: 'Content-Type', value: 'application/json' },
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            paymentId: '{{payment_id}}',
            transactionId: 'txn_abc123',
            signature: 'sig_xyz',
          }, null, 2),
        },
      },
      {
        id: 'pay-status',
        name: 'Get Payment Status',
        method: 'GET',
        path: '/api/payments/{{payment_id}}/status',
        rawUrl: '{{base_url}}/api/payments/{{payment_id}}/status',
        folderName: 'Payments (Paid)',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
      {
        id: 'pay-history',
        name: 'Get Payment History',
        method: 'GET',
        path: '/api/payments/history',
        rawUrl: '{{base_url}}/api/payments/history',
        folderName: 'Payments (Paid)',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
      {
        id: 'pay-refund',
        name: 'Request Refund',
        method: 'POST',
        path: '/api/payments/{{payment_id}}/refund',
        rawUrl: '{{base_url}}/api/payments/{{payment_id}}/refund',
        folderName: 'Payments (Paid)',
        headers: [
          { key: 'Authorization', value: 'Bearer {{token}}' },
          { key: 'Content-Type', value: 'application/json' },
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            reason: 'Item not received',
            amount: 499.99,
          }, null, 2),
        },
      },
      {
        id: 'pay-refund-status',
        name: 'Get Refund Status',
        method: 'GET',
        path: '/api/payments/{{payment_id}}/refund/status',
        rawUrl: '{{base_url}}/api/payments/{{payment_id}}/refund/status',
        folderName: 'Payments (Paid)',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
    ],
  },
  {
    id: 'shop',
    name: 'Shop',
    icon: 'ShoppingBag',
    color: 'teal',
    description: 'E-commerce catalog, shopping cart manipulation, order checkout & cancellation lifecycle',
    items: [
      {
        id: 'shop-products-all',
        name: 'Get All Products',
        method: 'GET',
        path: '/api/shop/products',
        rawUrl: '{{base_url}}/api/shop/products',
        folderName: 'Shop',
        headers: [],
      },
      {
        id: 'shop-product-id',
        name: 'Get Product by ID',
        method: 'GET',
        path: '/api/shop/products/{{product_id}}',
        rawUrl: '{{base_url}}/api/shop/products/{{product_id}}',
        folderName: 'Shop',
        headers: [],
      },
      {
        id: 'shop-create-product',
        name: 'Create Product (Admin)',
        method: 'POST',
        path: '/api/shop/products',
        rawUrl: '{{base_url}}/api/shop/products',
        folderName: 'Shop',
        headers: [
          { key: 'Authorization', value: 'Bearer {{token}}' },
          { key: 'Content-Type', value: 'application/json' },
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            name: 'Product Name',
            description: 'Product description',
            price: 29.99,
            stock: 100,
            category: 'electronics',
            images: [],
          }, null, 2),
        },
      },
      {
        id: 'shop-update-product',
        name: 'Update Product (Admin)',
        method: 'PUT',
        path: '/api/shop/products/{{product_id}}',
        rawUrl: '{{base_url}}/api/shop/products/{{product_id}}',
        folderName: 'Shop',
        headers: [
          { key: 'Authorization', value: 'Bearer {{token}}' },
          { key: 'Content-Type', value: 'application/json' },
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            price: 24.99,
            stock: 80,
          }, null, 2),
        },
      },
      {
        id: 'shop-delete-product',
        name: 'Delete Product (Admin)',
        method: 'DELETE',
        path: '/api/shop/products/{{product_id}}',
        rawUrl: '{{base_url}}/api/shop/products/{{product_id}}',
        folderName: 'Shop',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
      {
        id: 'shop-cart-add',
        name: 'Add to Cart',
        method: 'POST',
        path: '/api/shop/cart',
        rawUrl: '{{base_url}}/api/shop/cart',
        folderName: 'Shop',
        headers: [
          { key: 'Authorization', value: 'Bearer {{token}}' },
          { key: 'Content-Type', value: 'application/json' },
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            productId: '{{product_id}}',
            quantity: 2,
          }, null, 2),
        },
      },
      {
        id: 'shop-cart-get',
        name: 'Get Cart',
        method: 'GET',
        path: '/api/shop/cart',
        rawUrl: '{{base_url}}/api/shop/cart',
        folderName: 'Shop',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
      {
        id: 'shop-cart-del',
        name: 'Remove from Cart',
        method: 'DELETE',
        path: '/api/shop/cart/{{product_id}}',
        rawUrl: '{{base_url}}/api/shop/cart/{{product_id}}',
        folderName: 'Shop',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
      {
        id: 'shop-order-place',
        name: 'Place Order',
        method: 'POST',
        path: '/api/shop/orders',
        rawUrl: '{{base_url}}/api/shop/orders',
        folderName: 'Shop',
        headers: [
          { key: 'Authorization', value: 'Bearer {{token}}' },
          { key: 'Content-Type', value: 'application/json' },
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            cartId: '{{cart_id}}',
            shippingAddress: {
              street: '123 Main St',
              city: 'New York',
              zip: '10001',
              country: 'US',
            },
            paymentMethod: 'card',
          }, null, 2),
        },
      },
      {
        id: 'shop-orders-my',
        name: 'Get My Orders',
        method: 'GET',
        path: '/api/shop/orders/my',
        rawUrl: '{{base_url}}/api/shop/orders/my',
        folderName: 'Shop',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
      {
        id: 'shop-order-id',
        name: 'Get Order by ID',
        method: 'GET',
        path: '/api/shop/orders/{{order_id}}',
        rawUrl: '{{base_url}}/api/shop/orders/{{order_id}}',
        folderName: 'Shop',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
      {
        id: 'shop-order-cancel',
        name: 'Cancel Order',
        method: 'PUT',
        path: '/api/shop/orders/{{order_id}}/cancel',
        rawUrl: '{{base_url}}/api/shop/orders/{{order_id}}/cancel',
        folderName: 'Shop',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
    ],
  },
  {
    id: 'storage',
    name: 'Storage',
    icon: 'HardDrive',
    color: 'indigo',
    description: 'Document & attachment file uploads, file downloads, storage quotas & bucket metrics',
    items: [
      {
        id: 'storage-upload',
        name: 'Upload File',
        method: 'POST',
        path: '/api/storage/upload',
        rawUrl: '{{base_url}}/api/storage/upload',
        folderName: 'Storage',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
        body: {
          mode: 'formdata',
          formdata: [
            { key: 'file', type: 'file', value: 'invoice_march.pdf' },
            { key: 'folder', type: 'text', value: 'uploads' },
          ],
        },
      },
      {
        id: 'storage-get-id',
        name: 'Get File by ID',
        method: 'GET',
        path: '/api/storage/files/{{file_id}}',
        rawUrl: '{{base_url}}/api/storage/files/{{file_id}}',
        folderName: 'Storage',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
      {
        id: 'storage-list',
        name: 'List Files',
        method: 'GET',
        path: '/api/storage/files',
        rawUrl: '{{base_url}}/api/storage/files',
        folderName: 'Storage',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
      {
        id: 'storage-download',
        name: 'Download File',
        method: 'GET',
        path: '/api/storage/files/{{file_id}}/download',
        rawUrl: '{{base_url}}/api/storage/files/{{file_id}}/download',
        folderName: 'Storage',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
      {
        id: 'storage-delete',
        name: 'Delete File',
        method: 'DELETE',
        path: '/api/storage/files/{{file_id}}',
        rawUrl: '{{base_url}}/api/storage/files/{{file_id}}',
        folderName: 'Storage',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
      {
        id: 'storage-usage',
        name: 'Get Storage Usage',
        method: 'GET',
        path: '/api/storage/usage',
        rawUrl: '{{base_url}}/api/storage/usage',
        folderName: 'Storage',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
    ],
  },
  {
    id: 'approvals',
    name: 'Approval & Rejection',
    icon: 'CheckSquare',
    color: 'rose',
    description: 'Multi-stage approval workflows, managerial sign-offs, rejection rationales & bulk actions',
    items: [
      {
        id: 'appr-submit',
        name: 'Submit for Approval',
        method: 'POST',
        path: '/api/approvals',
        rawUrl: '{{base_url}}/api/approvals',
        folderName: 'Approval & Rejection',
        headers: [
          { key: 'Authorization', value: 'Bearer {{token}}' },
          { key: 'Content-Type', value: 'application/json' },
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            entityType: 'booking',
            entityId: '{{booking_id}}',
            requestedBy: '{{user_id}}',
            notes: 'Please review and approve this booking.',
          }, null, 2),
        },
      },
      {
        id: 'appr-pending',
        name: 'Get All Pending Approvals (Admin)',
        method: 'GET',
        path: '/api/approvals/pending',
        rawUrl: '{{base_url}}/api/approvals/pending',
        folderName: 'Approval & Rejection',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
      {
        id: 'appr-get-id',
        name: 'Get Approval by ID',
        method: 'GET',
        path: '/api/approvals/{{approval_id}}',
        rawUrl: '{{base_url}}/api/approvals/{{approval_id}}',
        folderName: 'Approval & Rejection',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
      {
        id: 'appr-approve',
        name: 'Approve Request',
        method: 'PUT',
        path: '/api/approvals/{{approval_id}}/approve',
        rawUrl: '{{base_url}}/api/approvals/{{approval_id}}/approve',
        folderName: 'Approval & Rejection',
        headers: [
          { key: 'Authorization', value: 'Bearer {{token}}' },
          { key: 'Content-Type', value: 'application/json' },
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            comments: 'Approved after review.',
            approvedBy: '{{admin_id}}',
          }, null, 2),
        },
      },
      {
        id: 'appr-reject',
        name: 'Reject Request',
        method: 'PUT',
        path: '/api/approvals/{{approval_id}}/reject',
        rawUrl: '{{base_url}}/api/approvals/{{approval_id}}/reject',
        folderName: 'Approval & Rejection',
        headers: [
          { key: 'Authorization', value: 'Bearer {{token}}' },
          { key: 'Content-Type', value: 'application/json' },
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            reason: 'Insufficient documentation provided.',
            rejectedBy: '{{admin_id}}',
          }, null, 2),
        },
      },
      {
        id: 'appr-history',
        name: 'Get Approval History',
        method: 'GET',
        path: '/api/approvals/history',
        rawUrl: '{{base_url}}/api/approvals/history',
        folderName: 'Approval & Rejection',
        headers: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
      },
      {
        id: 'appr-revoke',
        name: 'Revoke Approval',
        method: 'PUT',
        path: '/api/approvals/{{approval_id}}/revoke',
        rawUrl: '{{base_url}}/api/approvals/{{approval_id}}/revoke',
        folderName: 'Approval & Rejection',
        headers: [
          { key: 'Authorization', value: 'Bearer {{token}}' },
          { key: 'Content-Type', value: 'application/json' },
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            reason: 'Approval revoked due to policy change.',
          }, null, 2),
        },
      },
      {
        id: 'appr-bulk-approve',
        name: 'Bulk Approve',
        method: 'POST',
        path: '/api/approvals/bulk-approve',
        rawUrl: '{{base_url}}/api/approvals/bulk-approve',
        folderName: 'Approval & Rejection',
        headers: [
          { key: 'Authorization', value: 'Bearer {{token}}' },
          { key: 'Content-Type', value: 'application/json' },
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            approvalIds: ['id1', 'id2', 'id3'],
            comments: 'Bulk approved',
          }, null, 2),
        },
      },
      {
        id: 'appr-bulk-reject',
        name: 'Bulk Reject',
        method: 'POST',
        path: '/api/approvals/bulk-reject',
        rawUrl: '{{base_url}}/api/approvals/bulk-reject',
        folderName: 'Approval & Rejection',
        headers: [
          { key: 'Authorization', value: 'Bearer {{token}}' },
          { key: 'Content-Type', value: 'application/json' },
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            approvalIds: ['id1', 'id2', 'id3'],
            reason: 'Bulk rejected due to policy violation',
          }, null, 2),
        },
      },
    ],
  },
];

/**
 * Replaces {{variable}} placeholders with values from environment
 */
export function substituteVariables(template: string, env: PostmanEnvironment): string {
  return template.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key) => {
    return (env as any)[key] !== undefined ? String((env as any)[key]) : `{{${key}}}`;
  });
}
