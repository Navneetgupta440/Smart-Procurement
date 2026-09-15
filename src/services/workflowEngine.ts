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
    return totalAmount < 25000.0
      ? {
          tierNumber: 1,
          title: 'Tier 1 - Standard Order',
          minAmount: 0.0,
          maxAmount: 25000.0,
          requiredSignatures: 1,
          description: 'Requires Department Approving Manager digital sign-off.',
        }
      : totalAmount <= 100000.0
      ? {
          tierNumber: 2,
          title: 'Tier 2 - Mid-Value Expenditure',
          minAmount: 25000.0,
          maxAmount: 100000.0,
          requiredSignatures: 2,
          description: 'Requires Department Manager + Procurement Manager sign-off.',
        }
      : totalAmount <= 500000.0
      ? {
          tierNumber: 3,
          title: 'Tier 3 - High-Value Capital',
          minAmount: 100000.0,
          maxAmount: 500000.0,
          requiredSignatures: 3,
          description: 'Requires Dept Manager + Procurement Manager + Finance Director sign-off.',
        }
      : {
          tierNumber: 4,
          title: 'Tier 4 - Strategic Enterprise Spend',
          minAmount: 500000.0,
          maxAmount: 99999999.0,
          requiredSignatures: 4,
          description: 'Requires Dept Mgr + Procurement Mgr + Finance Director + CFO / Board sign-off.',
        };
  }

  public static buildApprovalChain(
    totalAmount: number,
    settings: SystemSettings = this.DEFAULT_SETTINGS
  ): PoApprovalStepInfo[] {
    const steps: PoApprovalStepInfo[] = [];

    // Level 1: Always required
    steps.push({
      level: 1,
      tierName: 'Tier 1 - Department Authorization',
      requiredRole: UserRole.APPROVING_MANAGER,
      thresholdAmount: Math.min(totalAmount, 25000.0),
      isSigned: false,
      stepDescription: 'Department Approving Manager verification of project requisition and budget allocation.',
      shortRoleTitle: 'Approving Manager',
    });

    // Level 2: For amounts >= 25,000
    if (totalAmount >= 25000.0) {
      steps.push({
        level: 2,
        tierName: 'Tier 2 - Commercial Audit',
        requiredRole: UserRole.PROCUREMENT_MANAGER,
        thresholdAmount: Math.min(totalAmount, 100000.0),
        isSigned: false,
        stepDescription: 'Procurement Manager verification of vendor quote competitiveness and lead time terms.',
        shortRoleTitle: 'Procurement Manager',
      });
    }

    // Level 3: For amounts >= 100,000
    if (totalAmount >= 100000.0) {
      steps.push({
        level: 3,
        tierName: 'Tier 3 - Executive Financial Sign-Off',
        requiredRole: UserRole.ADMIN,
        thresholdAmount: Math.min(totalAmount, 500000.0),
        isSigned: false,
        stepDescription: 'Finance Director review of quarterly fiscal runway and risk exposure.',
        shortRoleTitle: 'Finance Director',
      });
    }

    // Level 4: For amounts >= 500,000
    if (totalAmount >= 500000.0) {
      steps.push({
        level: 4,
        tierName: 'Tier 4 - Board & CFO Ratification',
        requiredRole: UserRole.ADMIN,
        thresholdAmount: totalAmount,
        isSigned: false,
        stepDescription: 'CFO / Enterprise Board of Directors final authorization for major capital procurement.',
        shortRoleTitle: 'CFO / Board',
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
