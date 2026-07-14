export type GracePeriodStatus = "active" | "lost" | "restored" | "unknown";

export type GracePeriodState = {
  accountId: string;
  accountName: string;
  status: GracePeriodStatus;
  rule: string;
  reason: string;
  evaluatedOn: string;
  paymentDueDate: string;
  paymentPostingCutoff: string;
  qualifyingPaymentTotal: number;
  requiredPaymentAmount: number;
  remainingAmountToPreserveGracePeriod: number;
  restorationEligible: boolean;
  restorationReason: string;
};

export function createEmptyGracePeriodState(
  accountId: string,
  accountName: string,
): GracePeriodState {
  return {
    accountId,
    accountName,
    status: "unknown",
    rule: "",
    reason: "Grace period status has not been evaluated.",
    evaluatedOn: "",
    paymentDueDate: "",
    paymentPostingCutoff: "",
    qualifyingPaymentTotal: 0,
    requiredPaymentAmount: 0,
    remainingAmountToPreserveGracePeriod: 0,
    restorationEligible: false,
    restorationReason: "",
  };
}
