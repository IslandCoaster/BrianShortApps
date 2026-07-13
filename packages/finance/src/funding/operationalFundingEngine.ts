import type { FinancialAccount } from "../accounts/financialAccount";
import type { FundingSource } from "./fundingSource";
import type { FinancialObligation } from "../obligations/financialObligation";

export type OperationalFundingRequirementType =
  | "debt-account"
  | "financial-obligation";

export type OperationalFundingRequirement = {
  id: string;
  requirementType: OperationalFundingRequirementType;
  name: string;
  counterparty: string;
  dueDate: string;
  amount: number;
  isPastDue: boolean;
};

export type ExcludedFundingRequirementReason =
  | "missing-payment-amount"
  | "missing-due-date";

export type ExcludedFundingRequirement = {
  id: string;
  requirementType: OperationalFundingRequirementType;
  name: string;
  reason: ExcludedFundingRequirementReason;
};

export type OperationalFundingAllocation = {
  availableOn: string;
  paymentDate: string;
  amount: number;
  fundingSourceId: string;
};

export type OperationalFundingStatus =
  | "funded-by-due-date"
  | "funded-after-due-date"
  | "partially-funded"
  | "unfunded";

export type OperationalFundingPlanItem = {
  requirementId: string;
  requirementType: OperationalFundingRequirementType;
  name: string;
  counterparty: string;
  dueDate: string;
  requestedAmount: number;
  allocatedAmount: number;
  fundedAmountByDueDate: number;
  fundingStatus: OperationalFundingStatus;
  fullyFundedOn?: string;
  isPastDue: boolean;
  allocations: OperationalFundingAllocation[];
};

export type OperationalFundingPosition = {
  currentCash: number;
  plannedFutureCash: number;
  grossAvailableCash: number;
  protectedCash: number;
  deployableCash: number;
  allocatedCash: number;
  fundingBuffer: number;
  unresolvedAmount: number;
};

export type OperationalFundingPlan = {
  planningDate: string;
  position: OperationalFundingPosition;
  items: OperationalFundingPlanItem[];
  excludedRequirements: ExcludedFundingRequirement[];
};

export type OperationalFundingPlanRequest = {
  planningDate: string;
  currentCash: number;
  minimumCashReserve: number;
  accounts: readonly FinancialAccount[];
  obligations: readonly FinancialObligation[];
  fundingSources: readonly FundingSource[];
};

type AvailableFundingEvent = {
  id: string;
  availableOn: string;
  amount: number;
  priority: number;
};

type WorkingFundingItem = {
  requirement: OperationalFundingRequirement;
  allocatedAmount: number;
  allocations: OperationalFundingAllocation[];
};

function normalizeNonNegativeAmount(amount: number): number {
  return Number.isFinite(amount) ? Math.max(amount, 0) : 0;
}

function getEffectivePaymentDate(
  planningDate: string,
  dueDate: string,
  availableOn: string,
): string {
  const earliestPaymentDate = dueDate < planningDate ? planningDate : dueDate;

  return availableOn <= earliestPaymentDate ? earliestPaymentDate : availableOn;
}

function getFundingStatus(
  dueDate: string,
  requestedAmount: number,
  allocatedAmount: number,
  fullyFundedOn: string | undefined,
): OperationalFundingStatus {
  if (allocatedAmount <= 0) {
    return "unfunded";
  }

  if (allocatedAmount < requestedAmount || fullyFundedOn === undefined) {
    return "partially-funded";
  }

  return fullyFundedOn <= dueDate
    ? "funded-by-due-date"
    : "funded-after-due-date";
}

function buildAccountRequirements(accounts: readonly FinancialAccount[]): {
  requirements: OperationalFundingRequirement[];
  excluded: ExcludedFundingRequirement[];
} {
  const requirements: OperationalFundingRequirement[] = [];
  const excluded: ExcludedFundingRequirement[] = [];

  accounts.forEach((account) => {
    if (account.status === "closed" || account.status === "paid-off") {
      return;
    }

    if (
      account.accountType !== "credit-card" &&
      account.accountType !== "loan"
    ) {
      return;
    }

    if (account.minimumPayment === undefined || account.minimumPayment <= 0) {
      excluded.push({
        id: account.id,
        requirementType: "debt-account",
        name: account.name,
        reason: "missing-payment-amount",
      });

      return;
    }

    if (!account.paymentDueDate) {
      excluded.push({
        id: account.id,
        requirementType: "debt-account",
        name: account.name,
        reason: "missing-due-date",
      });

      return;
    }

    requirements.push({
      id: account.id,
      requirementType: "debt-account",
      name: account.name,
      counterparty: account.institutionName,
      dueDate: account.paymentDueDate,
      amount: account.minimumPayment,
      isPastDue: account.status === "past-due",
    });
  });

  return {
    requirements,
    excluded,
  };
}

function buildObligationRequirements(
  obligations: readonly FinancialObligation[],
): {
  requirements: OperationalFundingRequirement[];
  excluded: ExcludedFundingRequirement[];
} {
  const requirements: OperationalFundingRequirement[] = [];
  const excluded: ExcludedFundingRequirement[] = [];

  obligations.forEach((obligation) => {
    if (
      obligation.status === "cancelled" ||
      obligation.status === "satisfied"
    ) {
      return;
    }

    if (!obligation.dueDate) {
      excluded.push({
        id: obligation.id,
        requirementType: "financial-obligation",
        name: obligation.name,
        reason: "missing-due-date",
      });

      return;
    }

    if (obligation.amountDue <= 0) {
      excluded.push({
        id: obligation.id,
        requirementType: "financial-obligation",
        name: obligation.name,
        reason: "missing-payment-amount",
      });

      return;
    }

    requirements.push({
      id: obligation.id,
      requirementType: "financial-obligation",
      name: obligation.name,
      counterparty: obligation.provider,
      dueDate: obligation.dueDate,
      amount: obligation.amountDue,
      isPastDue: obligation.status === "past-due",
    });
  });

  return {
    requirements,
    excluded,
  };
}

export function buildOperationalFundingRequirements(
  accounts: readonly FinancialAccount[],
  obligations: readonly FinancialObligation[],
): {
  requirements: OperationalFundingRequirement[];
  excludedRequirements: ExcludedFundingRequirement[];
} {
  const accountResult = buildAccountRequirements(accounts);

  const obligationResult = buildObligationRequirements(obligations);

  const requirements = [
    ...accountResult.requirements,
    ...obligationResult.requirements,
  ].sort((left, right) => {
    if (left.isPastDue && !right.isPastDue) {
      return -1;
    }

    if (right.isPastDue && !left.isPastDue) {
      return 1;
    }

    const dueDateComparison = left.dueDate.localeCompare(right.dueDate);

    if (dueDateComparison !== 0) {
      return dueDateComparison;
    }

    return left.id.localeCompare(right.id);
  });

  return {
    requirements,
    excludedRequirements: [
      ...accountResult.excluded,
      ...obligationResult.excluded,
    ],
  };
}

function buildAvailableFundingEvents(
  planningDate: string,
  currentCash: number,
  fundingSources: readonly FundingSource[],
): AvailableFundingEvent[] {
  const events: AvailableFundingEvent[] = [];

  const normalizedCurrentCash = normalizeNonNegativeAmount(currentCash);

  if (normalizedCurrentCash > 0) {
    events.push({
      id: "replay-current-cash",
      availableOn: planningDate,
      amount: normalizedCurrentCash,
      priority: 0,
    });
  }

  fundingSources.forEach((fundingSource) => {
    if (fundingSource.status !== "planned") {
      return;
    }

    events.push({
      id: fundingSource.id,
      availableOn: fundingSource.expectedOn,
      amount: normalizeNonNegativeAmount(fundingSource.amount),
      priority: 1,
    });
  });

  return events.sort((left, right) => {
    const dateComparison = left.availableOn.localeCompare(right.availableOn);

    if (dateComparison !== 0) {
      return dateComparison;
    }

    const priorityComparison = left.priority - right.priority;

    if (priorityComparison !== 0) {
      return priorityComparison;
    }

    return left.id.localeCompare(right.id);
  });
}

export function buildOperationalFundingPlan({
  planningDate,
  currentCash,
  minimumCashReserve,
  accounts,
  obligations,
  fundingSources,
}: OperationalFundingPlanRequest): OperationalFundingPlan {
  const { requirements, excludedRequirements } =
    buildOperationalFundingRequirements(accounts, obligations);

  const fundingEvents = buildAvailableFundingEvents(
    planningDate,
    currentCash,
    fundingSources,
  );

  const normalizedCurrentCash = normalizeNonNegativeAmount(currentCash);

  const plannedFutureCash = fundingSources
    .filter((fundingSource) => fundingSource.status === "planned")
    .reduce(
      (total, fundingSource) =>
        total + normalizeNonNegativeAmount(fundingSource.amount),
      0,
    );

  const grossAvailableCash = normalizedCurrentCash + plannedFutureCash;

  const requestedReserve = normalizeNonNegativeAmount(minimumCashReserve);

  const protectedCash = Math.min(requestedReserve, grossAvailableCash);

  const deployableCash = Math.max(grossAvailableCash - protectedCash, 0);

  const workingItems: WorkingFundingItem[] = requirements.map(
    (requirement) => ({
      requirement,
      allocatedAmount: 0,
      allocations: [],
    }),
  );

  let receivedCash = 0;
  let totalAllocated = 0;

  fundingEvents.forEach((fundingEvent) => {
    receivedCash += fundingEvent.amount;

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
        item.requirement.amount - item.allocatedAmount,
        0,
      );

      if (unresolvedAmount <= 0) {
        return;
      }

      const allocationAmount = Math.min(unresolvedAmount, availableToAllocate);

      item.allocations.push({
        availableOn: fundingEvent.availableOn,
        paymentDate: getEffectivePaymentDate(
          planningDate,
          item.requirement.dueDate,
          fundingEvent.availableOn,
        ),
        amount: allocationAmount,
        fundingSourceId: fundingEvent.id,
      });

      item.allocatedAmount += allocationAmount;

      totalAllocated += allocationAmount;

      availableToAllocate -= allocationAmount;
    });
  });

  const items = workingItems.map((workingItem): OperationalFundingPlanItem => {
    const requirement = workingItem.requirement;

    const fullyFundedOn =
      workingItem.allocatedAmount >= requirement.amount
        ? workingItem.allocations.at(-1)?.availableOn
        : undefined;

    const fundedAmountByDueDate = workingItem.allocations.reduce(
      (total, allocation) =>
        allocation.availableOn <= requirement.dueDate
          ? total + allocation.amount
          : total,
      0,
    );

    return {
      requirementId: requirement.id,
      requirementType: requirement.requirementType,
      name: requirement.name,
      counterparty: requirement.counterparty,
      dueDate: requirement.dueDate,
      requestedAmount: requirement.amount,
      allocatedAmount: workingItem.allocatedAmount,
      fundedAmountByDueDate,
      fundingStatus: getFundingStatus(
        requirement.dueDate,
        requirement.amount,
        workingItem.allocatedAmount,
        fullyFundedOn,
      ),
      fullyFundedOn,
      isPastDue: requirement.isPastDue,
      allocations: workingItem.allocations,
    };
  });

  const allocatedCash = items.reduce(
    (total, item) => total + item.allocatedAmount,
    0,
  );

  const unresolvedAmount = items.reduce(
    (total, item) =>
      total + Math.max(item.requestedAmount - item.allocatedAmount, 0),
    0,
  );

  return {
    planningDate,
    position: {
      currentCash: normalizedCurrentCash,
      plannedFutureCash,
      grossAvailableCash,
      protectedCash,
      deployableCash,
      allocatedCash,
      fundingBuffer: Math.max(deployableCash - allocatedCash, 0),
      unresolvedAmount,
    },
    items,
    excludedRequirements,
  };
}
