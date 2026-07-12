import type { FundingPolicy } from "./fundingPolicy";
import type { PortfolioAccountSummary } from "./portfolio.types";

export type PaymentPlanItem = {
  accountId: string;
  accountName: string;
  institution: string;
  dueDate: string;
  requestedAmount: number;
  allocatedAmount: number;
  reason: "past-due" | "required-payment";
  fullyFunded: boolean;
};

export type FundingPosition = {
  grossAvailableCash: number;
  protectedCash: number;
  deployableCash: number;
  allocatedCash: number;
  fundingBuffer: number;
  unresolvedObligations: number;
};

export type PaymentPlan = {
  position: FundingPosition;
  items: PaymentPlanItem[];
};

function normalizeAmount(amount: number) {
  return Number.isFinite(amount) ? Math.max(amount, 0) : 0;
}

export function buildFundingPlan(
  accounts: PortfolioAccountSummary[],
  grossAvailableCash: number,
  policy: FundingPolicy,
): PaymentPlan {
  const normalizedAvailableCash = normalizeAmount(grossAvailableCash);
  const requestedReserve = normalizeAmount(policy.minimumCashReserve);

  const protectedCash = Math.min(requestedReserve, normalizedAvailableCash);

  const deployableCash = Math.max(normalizedAvailableCash - protectedCash, 0);

  const eligibleAccounts = accounts
    .filter(
      (account) =>
        account.accountStatus !== "paid-off" &&
        account.paymentDueDate &&
        account.minimumPaymentDue !== undefined &&
        account.minimumPaymentDue > 0,
    )
    .sort((left, right) => {
      if (
        left.accountStatus === "past-due" &&
        right.accountStatus !== "past-due"
      ) {
        return -1;
      }

      if (
        right.accountStatus === "past-due" &&
        left.accountStatus !== "past-due"
      ) {
        return 1;
      }

      return (left.paymentDueDate ?? "").localeCompare(
        right.paymentDueDate ?? "",
      );
    });

  let fundingBuffer = deployableCash;

  const items = eligibleAccounts.map((account): PaymentPlanItem => {
    const requestedAmount = account.minimumPaymentDue ?? 0;
    const allocatedAmount = Math.min(requestedAmount, fundingBuffer);

    fundingBuffer -= allocatedAmount;

    return {
      accountId: account.id,
      accountName: account.accountName,
      institution: account.institution,
      dueDate: account.paymentDueDate as string,
      requestedAmount,
      allocatedAmount,
      reason:
        account.accountStatus === "past-due" ? "past-due" : "required-payment",
      fullyFunded: allocatedAmount >= requestedAmount,
    };
  });

  const allocatedCash = items.reduce(
    (total, item) => total + item.allocatedAmount,
    0,
  );

  const unresolvedObligations = items.reduce(
    (total, item) =>
      total + Math.max(item.requestedAmount - item.allocatedAmount, 0),
    0,
  );

  return {
    position: {
      grossAvailableCash: normalizedAvailableCash,
      protectedCash,
      deployableCash,
      allocatedCash,
      fundingBuffer,
      unresolvedObligations,
    },
    items,
  };
}
