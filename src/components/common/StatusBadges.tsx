import React from 'react';
import {
  DeliveryStatus,
  MembershipPlan,
  OrderStatus,
  Priority,
  RequestStatus,
  UserRole,
  USER_ROLE_DETAILS,
} from '../../types/procurement';

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const styles: Record<Priority, string> = {
    [Priority.LOW]: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    [Priority.MEDIUM]: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    [Priority.HIGH]: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    [Priority.URGENT]: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800 animate-pulse',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[priority]}`}
    >
      {priority}
    </span>
  );
};

export const RequestStatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => {
  const config: Record<RequestStatus, { label: string; style: string }> = {
    [RequestStatus.DRAFT]: { label: 'Draft', style: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    [RequestStatus.SUBMITTED]: { label: 'Submitted', style: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' },
    [RequestStatus.PENDING_APPROVAL]: { label: 'Pending Approval', style: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
    [RequestStatus.APPROVED]: { label: 'Approved', style: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
    [RequestStatus.REJECTED]: { label: 'Rejected', style: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' },
    [RequestStatus.CONVERTED_TO_PO]: { label: 'Converted to PO', style: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300' },
  };

  const item = config[status] || { label: status, style: 'bg-slate-100 text-slate-700' };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-current/10 ${item.style}`}
    >
      {item.label}
    </span>
  );
};

export const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const config: Record<OrderStatus, { label: string; style: string }> = {
    [OrderStatus.DRAFT]: { label: 'Draft', style: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    [OrderStatus.PENDING_APPROVAL]: { label: 'Pending Approval', style: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
    [OrderStatus.APPROVED]: { label: 'Authorized', style: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
    [OrderStatus.SENT_TO_SUPPLIER]: { label: 'Sent to Supplier', style: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300' },
    [OrderStatus.SUPPLIER_ACCEPTED]: { label: 'Supplier Accepted', style: 'bg-cyan-50 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300' },
    [OrderStatus.SUPPLIER_REJECTED]: { label: 'Supplier Declined', style: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' },
    [OrderStatus.DISPATCHED]: { label: 'Dispatched', style: 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' },
    [OrderStatus.IN_TRANSIT]: { label: 'In Transit', style: 'bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' },
    [OrderStatus.OUT_FOR_DELIVERY]: { label: 'Out for Delivery', style: 'bg-orange-50 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300' },
    [OrderStatus.DELIVERED]: { label: 'Delivered & Inwarded', style: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200' },
    [OrderStatus.COMPLETED]: { label: 'Completed', style: 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300' },
    [OrderStatus.CANCELLED]: { label: 'Cancelled', style: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
  };

  const item = config[status] || { label: status, style: 'bg-slate-100 text-slate-700' };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-current/15 ${item.style}`}
    >
      {item.label}
    </span>
  );
};

export const DeliveryStatusBadge: React.FC<{ status: DeliveryStatus }> = ({ status }) => {
  const config: Record<DeliveryStatus, { label: string; style: string }> = {
    [DeliveryStatus.PENDING]: { label: 'Manifested', style: 'bg-slate-100 text-slate-700' },
    [DeliveryStatus.PICKED_UP]: { label: 'Picked Up', style: 'bg-blue-50 text-blue-700' },
    [DeliveryStatus.IN_TRANSIT]: { label: 'In Transit', style: 'bg-purple-50 text-purple-700' },
    [DeliveryStatus.OUT_FOR_DELIVERY]: { label: 'Out for Delivery', style: 'bg-orange-50 text-orange-800' },
    [DeliveryStatus.DELIVERED]: { label: 'Delivered', style: 'bg-emerald-100 text-emerald-900' },
    [DeliveryStatus.FAILED]: { label: 'Failed Attempt', style: 'bg-rose-100 text-rose-800' },
    [DeliveryStatus.RETURNED]: { label: 'Returned', style: 'bg-amber-100 text-amber-900' },
  };

  const item = config[status] || { label: status, style: 'bg-slate-100 text-slate-700' };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-current/15 ${item.style}`}
    >
      {item.label}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  const detail = USER_ROLE_DETAILS[role] || { displayName: role, badgeColor: 'bg-slate-100 text-slate-800' };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${detail.badgeColor}`}
    >
      {detail.displayName}
    </span>
  );
};

export const PlanBadge: React.FC<{ plan: MembershipPlan }> = ({ plan }) => {
  const styles: Record<MembershipPlan, string> = {
    [MembershipPlan.STARTER]: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
    [MembershipPlan.PROFESSIONAL]: 'bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-950 dark:text-blue-200',
    [MembershipPlan.ENTERPRISE]: 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-200',
    [MembershipPlan.SUPPLIER_PARTNER]: 'bg-cyan-100 text-cyan-900 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border ${styles[plan]}`}
    >
      {plan.replace('_', ' ')}
    </span>
  );
};
