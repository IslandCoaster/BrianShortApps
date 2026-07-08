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
  interestCharged: number;
  projectedInterest: number;
  interestAvoided: number;
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
    interestCharged: 0,
    projectedInterest: 0,
    interestAvoided: 0,
  };
}
