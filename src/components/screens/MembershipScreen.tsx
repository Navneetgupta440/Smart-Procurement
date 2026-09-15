import React, { useState } from 'react';
import { useProcurement } from '../../context/ProcurementContext';
import { MembershipPlan } from '../../types/procurement';
import {
  Award,
  Check,
  Zap,
  ShieldCheck,
  Building,
  Crown,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const MembershipScreen: React.FC = () => {
  const { currentUser, upgradeMembership } = useProcurement();
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  const plans = [
    {
      id: MembershipPlan.STARTER,
      name: 'Starter Plan',
      tagline: 'For boutique operations & department pilots',
      priceMonthly: 0,
      priceYearly: 0,
      badge: 'Free Tier',
      features: [
        'Up to 10 Purchase Orders / month',
        'Single-Tier Manager Sign-off',
        'Standard Email Notifications',
        'Basic Inventory Ledger',
        'Community Support',
      ],
      popular: false,
    },
    {
      id: MembershipPlan.PROFESSIONAL,
      name: 'Professional Tier',
      tagline: 'For mid-size enterprises & growing supply chains',
      priceMonthly: 4999,
      priceYearly: 3999,
      badge: 'Most Popular',
      features: [
        'Up to 250 Purchase Orders / month',
        '2-Tier Approval Chains (Manager + Procurement)',
        'Carrier Tracking & Delivery Checkpoints',
        'Supplier Performance Rating Engine',
        'Automated Inwarding & Stock Alerts',
        'Priority Business Support',
      ],
      popular: true,
    },
    {
      id: MembershipPlan.ENTERPRISE,
      name: 'Enterprise Apex',
      tagline: 'For large conglomerates & strategic capital procurement',
      priceMonthly: 14999,
      priceYearly: 11999,
      badge: 'Executive SLA',
      features: [
        'Unlimited Purchase Orders & Requisitions',
        'Full 4-Tier Cryptographic Approval Matrix',
        'High-Value Capital Order Alerts (> ₹1,00,000)',
        'Direct REST API & Central Console Dispatch',
        'Immutable Audit Trail Non-Repudiation',
        'Dedicated 24/7 Enterprise Account Director',
      ],
      popular: false,
    },
    {
      id: MembershipPlan.SUPPLIER_PARTNER,
      name: 'Supplier Partner Hub',
      tagline: 'For accredited vendor manufacturers & distributors',
      priceMonthly: 2999,
      priceYearly: 2399,
      badge: 'Vendor Network',
      features: [
        'Direct PO Order Acceptance & Rejection Interface',
        'Integrated Waybill & Carrier Dispatch Controls',
        'Real-time SLA & Rating Scorecards',
        'Product Catalog Management',
        'Multi-Plant Fulfillment Scheduling',
      ],
      popular: false,
    },
  ];

  const handleSelectPlan = (plan: MembershipPlan) => {
    upgradeMembership(plan, billingCycle);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-[#00639A] dark:text-sky-300 px-3 py-1 rounded-full">
          Enterprise Licensing & Capacity
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">
          Scalable Procurement Plans for Every Organization
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Unlock higher purchase order throughput, multi-tier approval chains, and automated inwarding.
        </p>

        {/* Monthly / Yearly Toggle */}
        <div className="mt-5 inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setBillingCycle('MONTHLY')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              billingCycle === 'MONTHLY'
                ? 'bg-white dark:bg-[#191C20] text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('YEARLY')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              billingCycle === 'YEARLY'
                ? 'bg-white dark:bg-[#191C20] text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>Yearly Billing</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((p) => {
          const isCurrent = currentUser.membershipPlan === p.id;
          const price = billingCycle === 'YEARLY' ? p.priceYearly : p.priceMonthly;

          return (
            <div
              key={p.id}
              className={`rounded-3xl p-5 border flex flex-col justify-between transition-all relative ${
                isCurrent
                  ? 'bg-blue-50/50 dark:bg-blue-950/20 border-2 border-[#00639A] dark:border-sky-500 shadow-md ring-4 ring-blue-100 dark:ring-blue-950'
                  : p.popular
                  ? 'bg-white dark:bg-[#191C20] border-2 border-indigo-400 shadow-sm'
                  : 'bg-white dark:bg-[#191C20] border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    isCurrent
                      ? 'bg-[#00639A] text-white'
                      : p.popular
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {isCurrent ? 'Active Plan' : p.badge}
                </span>
                {isCurrent && <Crown className="w-4 h-4 text-[#00639A]" />}
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  {p.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{p.tagline}</p>

                {/* Price */}
                <div className="mt-4 mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                      {price === 0 ? '₹0' : `₹${price.toLocaleString('en-IN')}`}
                    </span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>
                  {billingCycle === 'YEARLY' && price > 0 && (
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      Billed annually (₹{(price * 12).toLocaleString('en-IN')}/yr)
                    </span>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {p.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  disabled={isCurrent}
                  onClick={() => handleSelectPlan(p.id)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default'
                      : p.popular
                      ? 'bg-[#00639A] hover:bg-[#004B76] text-white shadow-xs'
                      : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90'
                  }`}
                >
                  {isCurrent ? 'Current Subscription' : `Upgrade to ${p.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
