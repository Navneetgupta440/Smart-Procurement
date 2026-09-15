export const generatePostmanCollection = () => {
  return {
    info: {
      name: "Smart Procurement & Purchase Order Management API",
      _postman_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      description:
        "Enterprise-grade REST API collection for Smart Procurement & Purchase Order Management Platform. Includes central workflow orchestration, purchase requisitions, hierarchical approvals, algorithmic supplier scoring, order dispatch, delivery milestone tracking, and inventory reconciliation.",
      schema:
        "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    item: [
      {
        name: "Central Workflow Orchestration",
        item: [
          {
            name: "POST /api/v1/workflow - Execute Command",
            request: {
              method: "POST",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{jwt_token}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify(
                  {
                    action: "APPROVE_REQUEST",
                    entityType: "PURCHASE_REQUEST",
                    entityId: "pr-101",
                    remarks: "Approved via central workflow command"
                  },
                  null,
                  2
                )
              },
              url: {
                raw: "{{base_url}}/api/v1/workflow",
                host: ["{{base_url}}"],
                path: ["api", "v1", "workflow"]
              },
              description:
                "Central workflow state transition engine. Supports APPROVE_REQUEST, REJECT_REQUEST, CREATE_PO, SEND_PO, ACCEPT_ORDER, REJECT_ORDER, START_PROCESSING, DISPATCH_ORDER, UPDATE_DELIVERY, MARK_DELIVERED."
            }
          }
        ]
      },
      {
        name: "Purchase Requisitions (PR)",
        item: [
          {
            name: "GET /api/v1/requests - List Requisitions",
            request: {
              method: "GET",
              header: [{ key: "Authorization", value: "Bearer {{jwt_token}}" }],
              url: {
                raw: "{{base_url}}/api/v1/requests?status=PENDING_APPROVAL",
                host: ["{{base_url}}"],
                path: ["api", "v1", "requests"],
                query: [{ key: "status", value: "PENDING_APPROVAL" }]
              }
            }
          },
          {
            name: "POST /api/v1/requests - Create Requisition",
            request: {
              method: "POST",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{jwt_token}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify(
                  {
                    department: "Engineering & Infrastructure",
                    priority: "HIGH",
                    justification: "Critical server upgrade components for Q4",
                    items: [
                      { productId: "prod-001", quantity: 5 },
                      { productId: "prod-003", quantity: 10 }
                    ]
                  },
                  null,
                  2
                )
              },
              url: {
                raw: "{{base_url}}/api/v1/requests",
                host: ["{{base_url}}"],
                path: ["api", "v1", "requests"]
              }
            }
          },
          {
            name: "POST /api/v1/requests/{id}/approve - Sign Requisition",
            request: {
              method: "POST",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{jwt_token}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify(
                  { comments: "Budget allocated and verified" },
                  null,
                  2
                )
              },
              url: {
                raw: "{{base_url}}/api/v1/requests/pr-101/approve",
                host: ["{{base_url}}"],
                path: ["api", "v1", "requests", "pr-101", "approve"]
              }
            }
          }
        ]
      },
      {
        name: "Purchase Orders (PO)",
        item: [
          {
            name: "GET /api/v1/orders - List Purchase Orders",
            request: {
              method: "GET",
              header: [{ key: "Authorization", value: "Bearer {{jwt_token}}" }],
              url: {
                raw: "{{base_url}}/api/v1/orders",
                host: ["{{base_url}}"],
                path: ["api", "v1", "orders"]
              }
            }
          },
          {
            name: "POST /api/v1/orders/generate - Generate PO from Approved Requisition",
            request: {
              method: "POST",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{jwt_token}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify(
                  {
                    purchaseRequestId: "pr-101",
                    supplierId: "sup-001",
                    terms: "Net 30 with 18% GST and Door Delivery"
                  },
                  null,
                  2
                )
              },
              url: {
                raw: "{{base_url}}/api/v1/orders/generate",
                host: ["{{base_url}}"],
                path: ["api", "v1", "orders", "generate"]
              }
            }
          },
          {
            name: "POST /api/v1/orders/{id}/sign - Hierarchical Tier Digital Signoff",
            request: {
              method: "POST",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{jwt_token}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify(
                  {
                    level: 1,
                    signatureCertHash: "SHA256:7e8a9f0b1c2d3e4f5a6b7c8d9e0f1a2b",
                    remarks: "Department Manager verified"
                  },
                  null,
                  2
                )
              },
              url: {
                raw: "{{base_url}}/api/v1/orders/po-101/sign",
                host: ["{{base_url}}"],
                path: ["api", "v1", "orders", "po-101", "sign"]
              }
            }
          }
        ]
      },
      {
        name: "Supplier Portal & Evaluation",
        item: [
          {
            name: "GET /api/v1/suppliers - List & Rank Suppliers",
            request: {
              method: "GET",
              header: [{ key: "Authorization", value: "Bearer {{jwt_token}}" }],
              url: {
                raw: "{{base_url}}/api/v1/suppliers/evaluate?productId=prod-001",
                host: ["{{base_url}}"],
                path: ["api", "v1", "suppliers", "evaluate"],
                query: [{ key: "productId", value: "prod-001" }]
              }
            }
          },
          {
            name: "POST /api/v1/orders/{id}/accept - Vendor Order Acceptance",
            request: {
              method: "POST",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{jwt_token}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify(
                  {
                    acknowledgementNumber: "ACK-ABC-2026-9941",
                    estimatedDispatchDate: "2026-09-18T10:00:00Z"
                  },
                  null,
                  2
                )
              },
              url: {
                raw: "{{base_url}}/api/v1/orders/po-101/accept",
                host: ["{{base_url}}"],
                path: ["api", "v1", "orders", "po-101", "accept"]
              }
            }
          },
          {
            name: "POST /api/v1/orders/{id}/dispatch - Dispatch with AWB",
            request: {
              method: "POST",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{jwt_token}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify(
                  {
                    carrierName: "SpeedExpress Linehaul",
                    trackingNumber: "TRK-IND-98442",
                    pickupNotes: "Package sealed in tamper-proof container"
                  },
                  null,
                  2
                )
              },
              url: {
                raw: "{{base_url}}/api/v1/orders/po-101/dispatch",
                host: ["{{base_url}}"],
                path: ["api", "v1", "orders", "po-101", "dispatch"]
              }
            }
          }
        ]
      },
      {
        name: "Logistics & Inwarding",
        item: [
          {
            name: "POST /api/v1/deliveries/{id}/checkpoint - Update Milestone",
            request: {
              method: "POST",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{jwt_token}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify(
                  {
                    status: "IN_TRANSIT",
                    location: "Central Hub Sorting Facility, Pune",
                    remarks: "Outbound vehicle dispatched"
                  },
                  null,
                  2
                )
              },
              url: {
                raw: "{{base_url}}/api/v1/deliveries/del-101/checkpoint",
                host: ["{{base_url}}"],
                path: ["api", "v1", "deliveries", "del-101", "checkpoint"]
              }
            }
          },
          {
            name: "POST /api/v1/deliveries/{id}/deliver - Inward Stock to Warehouse",
            request: {
              method: "POST",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{jwt_token}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify(
                  {
                    receivedBy: "Dock Master - Warehouse A",
                    sealIntact: true,
                    reconciliationType: "AUTOMATIC_INWARD"
                  },
                  null,
                  2
                )
              },
              url: {
                raw: "{{base_url}}/api/v1/deliveries/del-101/deliver",
                host: ["{{base_url}}"],
                path: ["api", "v1", "deliveries", "del-101", "deliver"]
              }
            }
          }
        ]
      }
    ],
    variable: [
      { key: "base_url", value: "http://localhost:8080", type: "string" },
      { key: "jwt_token", value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", type: "string" }
    ]
  };
};

export const downloadPostmanCollection = () => {
  const collection = generatePostmanCollection();
  const jsonStr = JSON.stringify(collection, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "smart-procurement.postman_collection.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
