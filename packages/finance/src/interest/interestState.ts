export type InterestLifecycleStatus =
  | "grace-period-preserved"
  | "grace-period-lost"
  | "interest-accruing"
  | "interest-charged"
  | "interest-paid"
  | "interest-avoided"
  | "unknown";

export type InterestState = {
  accountId: string;
  accountName: string;
  aprPercent: number;
  isVariableApr: boolean;
  calculationMethod: string;
  lifecycleStatus: InterestLifecycleStatus;
  balanceSubjectToInterest: number;
  statementCycleDays: number;
  calculatedInterest: number;
  interestCharged: number;
  interestVariance: number;
  projectedInterest: number;
  interestAvoided: number;
  dailyInterestAccrued: number;
  remainingStatementDays: number;
  projectionReason: string;
  projectionConfidence: "measured" | "estimated" | "forecast";
};

export function createEmptyInterestState(
  accountId: string,
  accountName: string,
): InterestState {
  return {
    accountId,
    accountName,
    aprPercent: 0,
    isVariableApr: false,
    calculationMethod: "unknown",
    lifecycleStatus: "unknown",
    balanceSubjectToInterest: 0,
    statementCycleDays: 0,
    calculatedInterest: 0,
    interestCharged: 0,
    interestVariance: 0,
    projectedInterest: 0,
    projectionReason: "",
    projectionConfidence: "measured",
    interestAvoided: 0,
    dailyInterestAccrued: 0,
    remainingStatementDays: 0,
  };
}
