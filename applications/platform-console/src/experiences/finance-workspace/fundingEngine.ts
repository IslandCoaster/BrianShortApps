import type { FundingPolicy } from "./fundingPolicy";
import type { FundingSource } from "./fundingSource";
import type { PortfolioAccountSummary } from "./portfolio.types";

export type PaymentFundingStatus =
  | "funded-by-due-date"
  | "funded-after-due-date"
  | "partially-funded"
  | "unfunded";

export type PaymentAllocation = {
  fundedOn: string;
  paymentDate: string;
  amount: number;
};

export type PaymentPlanItem = {
  accountId: string;
  accountName: string;
  institution: string;
  dueDate: string;
  requestedAmount: number;
  allocatedAmount: number;
  fundedAmountByDueDate: number;
  reason: "past-due" | "required-payment";
  fullyFunded: boolean;
  fundingStatus: PaymentFundingStatus;
  fundedDate?: string;
  allocations: PaymentAllocation[];
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

export type FundingPlanRequest = {
  planningDate: string;
  accounts: PortfolioAccountSummary[];
  fundingSources: FundingSource[];
  policy: FundingPolicy;
};

type WorkingPaymentPlanItem = {
  account: PortfolioAccountSummary;
  requestedAmount: number;
  allocatedAmount: number;
  allocations: PaymentAllocation[];
};

function normalizeAmount(amount: number) {
  return Number.isFinite(amount) ? Math.max(amount, 0) : 0;
}

function getFundingSourcePriority(source: FundingSource) {
  switch (source.type) {
    case "opening-cash":
      return 0;

    case "paycheck":
      return 1;
  }
}

export function orderFundingSources(
  fundingSources: FundingSource[],
): FundingSource[] {
  return [...fundingSources].sort((left, right) => {
    const dateComparison = left.date.localeCompare(right.date);

    if (dateComparison !== 0) {
      return dateComparison;
    }

    return getFundingSourcePriority(left) - getFundingSourcePriority(right);
  });
}

export function getGrossAvailableCash(fundingSources: FundingSource[]): number {
  return fundingSources.reduce(
    (total, source) => total + normalizeAmount(source.amount),
    0,
  );
}

function orderEligibleAccounts(
  accounts: PortfolioAccountSummary[],
): PortfolioAccountSummary[] {
  return accounts
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
}

function getPaymentDate(
  planningDate: string,
  dueDate: string,
  fundedOn: string,
) {
  const effectiveDueDate = dueDate < planningDate ? planningDate : dueDate;

  return fundedOn <= effectiveDueDate ? effectiveDueDate : fundedOn;
}

function getFundingStatus(
  dueDate: string,
  requestedAmount: number,
  allocatedAmount: number,
  fundedDate: string | undefined,
): PaymentFundingStatus {
  if (allocatedAmount <= 0) {
    return "unfunded";
  }

  if (allocatedAmount < requestedAmount || !fundedDate) {
    return "partially-funded";
  }

  return fundedDate <= dueDate ? "funded-by-due-date" : "funded-after-due-date";
}

export function buildFundingPlan({
  planningDate,
  accounts,
  fundingSources,
  policy,
}: FundingPlanRequest): PaymentPlan {
  const orderedSources = orderFundingSources(fundingSources);
  const eligibleAccounts = orderEligibleAccounts(accounts);

  const grossAvailableCash = getGrossAvailableCash(orderedSources);

  const requestedReserve = normalizeAmount(policy.minimumCashReserve);

  const protectedCash = Math.min(requestedReserve, grossAvailableCash);

  const deployableCash = Math.max(grossAvailableCash - protectedCash, 0);

  const workingItems: WorkingPaymentPlanItem[] = eligibleAccounts.map(
    (account) => ({
      account,
      requestedAmount: account.minimumPaymentDue ?? 0,
      allocatedAmount: 0,
      allocations: [],
    }),
  );

  let receivedCash = 0;
  let totalAllocated = 0;

  orderedSources.forEach((source) => {
    receivedCash += normalizeAmount(source.amount);

    let availableToAllocate = Math.max(
      receivedCash - protectedCash - totalAllocated,
      0,
    );

    if (availableToAllocate <= 0) {
      return;
    }

    workingItems.forEach((item) => {
      if (availableToAllocate <= 0) {
        return;
      }

      const unresolvedAmount = Math.max(
        item.requestedAmount - item.allocatedAmount,
        0,
      );

      if (unresolvedAmount <= 0) {
        return;
      }

      const allocationAmount = Math.min(unresolvedAmount, availableToAllocate);

      const dueDate = item.account.paymentDueDate as string;

      item.allocations.push({
        fundedOn: source.date,
        paymentDate: getPaymentDate(planningDate, dueDate, source.date),
        amount: allocationAmount,
      });

      item.allocatedAmount += allocationAmount;
      totalAllocated += allocationAmount;
      availableToAllocate -= allocationAmount;
    });
  });

  const items = workingItems.map((workingItem): PaymentPlanItem => {
    const account = workingItem.account;
    const dueDate = account.paymentDueDate as string;

    const fundedDate =
      workingItem.allocatedAmount >= workingItem.requestedAmount
        ? workingItem.allocations.at(-1)?.fundedOn
        : undefined;

    const fundedAmountByDueDate = workingItem.allocations.reduce(
      (total, allocation) =>
        allocation.fundedOn <= dueDate ? total + allocation.amount : total,
      0,
    );

    return {
      accountId: account.id,
      accountName: account.accountName,
      institution: account.institution,
      dueDate,
      requestedAmount: workingItem.requestedAmount,
      allocatedAmount: workingItem.allocatedAmount,
      fundedAmountByDueDate,
      reason:
        account.accountStatus === "past-due" ? "past-due" : "required-payment",
      fullyFunded: workingItem.allocatedAmount >= workingItem.requestedAmount,
      fundingStatus: getFundingStatus(
        dueDate,
        workingItem.requestedAmount,
        workingItem.allocatedAmount,
        fundedDate,
      ),
      fundedDate,
      allocations: workingItem.allocations,
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
      grossAvailableCash,
      protectedCash,
      deployableCash,
      allocatedCash,
      fundingBuffer: Math.max(deployableCash - allocatedCash, 0),
      unresolvedObligations,
    },
    items,
  };
}
