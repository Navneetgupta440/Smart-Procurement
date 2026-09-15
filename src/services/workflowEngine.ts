import {
  PoApprovalStepInfo,
  PoApprovalTier,
  PurchaseOrder,
  SystemSettings,
  User,
  UserRole,
} from '../types/procurement';

export class PoApprovalWorkflowEngine {
  public static readonly DEFAULT_SETTINGS: SystemSettings = {
    approvalLimitManager: 15000.0,
    approvalLimitProcurementManager: 100000.0,
    approvalLimitDirector: 500000.0,
    autoPoGeneration: true,
    enableEmailAlerts: true,
    weightPrice: 0.35,
    weightQuality: 0.2,
    weightDelivery: 0.2,
    weightRating: 0.15,
    weightReliability: 0.1,
  };

  public static determineTier(
    totalAmount: number,
    settings: SystemSettings = this.DEFAULT_SETTINGS
  ): PoApprovalTier {
    const t1Limit = settings.approvalLimitManager || 15000.0;
    const t2Limit = settings.approvalLimitProcurementManager || 100000.0;

    return totalAmount < t1Limit
      ? {
          tierNumber: 1,
          title: 'Tier 1 (< ₹15,000)',
          minAmount: 0.0,
          maxAmount: t1Limit,
          requiredSignatures: 1,
          description: 'Department Manager authorization within local operating budget.',
        }
      : totalAmount <= t2Limit
      ? {
          tierNumber: 2,
          title: 'Tier 2 (₹15,000 – ₹1,00,000)',
          minAmount: t1Limit,
          maxAmount: t2Limit,
          requiredSignatures: 2,
          description: 'Department Manager → Procurement Officer authorization.',
        }
      : {
          tierNumber: 3,
          title: 'Tier 3 (> ₹1,00,000)',
          minAmount: t2Limit,
          maxAmount: 99999999.0,
          requiredSignatures: 3,
          description: 'Department Manager → Procurement Officer → Executive Admin authorization.',
        };
  }

  public static buildApprovalChain(
    totalAmount: number,
    settings: SystemSettings = this.DEFAULT_SETTINGS
  ): PoApprovalStepInfo[] {
    const steps: PoApprovalStepInfo[] = [];
    const t1Limit = settings.approvalLimitManager || 15000.0;
    const t2Limit = settings.approvalLimitProcurementManager || 100000.0;

    // Level 1: Always required (Department Manager)
    steps.push({
      level: 1,
      tierName: 'Tier 1 - Department Manager',
      requiredRole: UserRole.APPROVING_MANAGER,
      thresholdAmount: Math.min(totalAmount, t1Limit),
      isSigned: false,
      stepDescription: 'Department Manager authorization of project scope and departmental budget.',
      shortRoleTitle: 'Department Manager',
    });

    // Level 2: For amounts >= 15,000 (Procurement Officer)
    if (totalAmount >= t1Limit) {
      steps.push({
        level: 2,
        tierName: 'Tier 2 - Procurement Officer',
        requiredRole: UserRole.PROCUREMENT_MANAGER,
        thresholdAmount: Math.min(totalAmount, t2Limit),
        isSigned: false,
        stepDescription: 'Procurement Officer review of vendor scoring, lead times, and tax compliance.',
        shortRoleTitle: 'Procurement Officer',
      });
    }

    // Level 3: For amounts > 100,000 (Executive Admin)
    if (totalAmount > t2Limit) {
      steps.push({
        level: 3,
        tierName: 'Tier 3 - Executive Admin',
        requiredRole: UserRole.ADMIN,
        thresholdAmount: totalAmount,
        isSigned: false,
        stepDescription: 'Executive Admin governance sign-off and risk exposure verification.',
        shortRoleTitle: 'Executive Admin',
      });
    }

    return steps;
  }

  public static canUserSignCurrentLevel(
    order: PurchaseOrder,
    user: User,
    currentStep: PoApprovalStepInfo
  ): boolean {
    if (user.role === UserRole.ADMIN) return true; // Universal authority

    switch (currentStep.level) {
      case 1:
        return (
          user.role === UserRole.APPROVING_MANAGER ||
          user.role === UserRole.PROCUREMENT_MANAGER
        );
      case 2:
        return user.role === UserRole.PROCUREMENT_MANAGER;
      case 3:
      case 4:
        return false; // Levels 3 and 4 (Finance Director & Board) require Admin override in demo
      default:
        return false;
    }
  }

  public static generateDigitalCertificate(
    poNumber: string,
    level: number,
    approver: User,
    timestamp: number
  ): string {
    const raw = `${poNumber}|LVL${level}|${approver.id}|${approver.email}|${timestamp}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    const dateStr = new Date(timestamp).toISOString().slice(0, 10).replace(/-/g, '');
    return `CERT-${dateStr}-${poNumber}-L${level}-${hex}`;
  }

  public static parseSignatures(
    json: string,
    totalAmount: number,
    settings: SystemSettings = this.DEFAULT_SETTINGS
  ): PoApprovalStepInfo[] {
    if (!json || json.trim().length === 0) {
      return this.buildApprovalChain(totalAmount, settings);
    }
    try {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse approval signatures JSON', e);
    }
    return this.buildApprovalChain(totalAmount, settings);
  }

  public static serializeSignatures(steps: PoApprovalStepInfo[]): string {
    return JSON.stringify(steps);
  }
}
