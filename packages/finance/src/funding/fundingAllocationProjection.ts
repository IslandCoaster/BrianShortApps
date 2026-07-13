import {
  isAssetFinancialAccount,
  type FinancialAccount,
} from "../accounts/financialAccount";
import type { FundingDepositAllocation } from "./fundingDepositAllocation";
import type { FundingSource } from "./fundingSource";

export type FundingAllocationStatus =
  | "unallocated"
  | "partially-allocated"
  | "fully-allocated"
  | "overallocated"
  | "invalid";

export type FundingAllocationIssueCode =
  | "missing-funding-source"
  | "missing-destination-account"
  | "inactive-destination-account"
  | "non-asset-destination-account"
  | "duplicate-destination-allocation";

export type FundingAllocationIssue = {
  allocationId?: string;
  fundingSourceId: string;
  code: FundingAllocationIssueCode;
  message: string;
};

export type ProjectedFundingDeposit = {
  allocationId: string;
  fundingSourceId: string;
  fundingSourceTitle: string;
  expectedOn: string;
  destinationAccountId: string;
  destinationAccountName: string;
  amount: number;
};

export type FundingSourceAllocationProjection = {
  fundingSourceId: string;
  fundingSourceTitle: string;
  fundingSourceAmount: number;
  allocatedAmount: number;
  remainingAmount: number;
  status: FundingAllocationStatus;
  deposits: ProjectedFundingDeposit[];
  issues: FundingAllocationIssue[];
};

export type AccountFundingProjection = {
  accountId: string;
  accountName: string;
  openingBalance: number;
  plannedDeposits: number;
  projectedBalance: number;
  deposits: ProjectedFundingDeposit[];
};

export type FundingAllocationProjection = {
  sources: FundingSourceAllocationProjection[];
  accounts: AccountFundingProjection[];
  orphanedIssues: FundingAllocationIssue[];
  canContinue: boolean;
};

export type FundingAllocationProjectionRequest = {
  accounts: readonly FinancialAccount[];
  fundingSources: readonly FundingSource[];
  allocations: readonly FundingDepositAllocation[];
};

function toCents(amount: number): number {
  if (!Number.isFinite(amount)) {
    return 0;
  }

  return Math.round(amount * 100);
}

function fromCents(amountInCents: number): number {
  return amountInCents / 100;
}

function getAssetAccountOpeningBalance(account: FinancialAccount): number {
  switch (account.accountType) {
    case "checking":
    case "savings":
      return account.currentBalance;

    case "credit-card":
    case "loan":
      return 0;
  }
}

function getAllocationStatus(
  sourceAmountInCents: number,
  allocatedAmountInCents: number,
  hasIssues: boolean,
): FundingAllocationStatus {
  if (hasIssues) {
    return "invalid";
  }

  if (allocatedAmountInCents === 0) {
    return "unallocated";
  }

  if (allocatedAmountInCents < sourceAmountInCents) {
    return "partially-allocated";
  }

  if (allocatedAmountInCents > sourceAmountInCents) {
    return "overallocated";
  }

  return "fully-allocated";
}

export function buildFundingAllocationProjection({
  accounts,
  fundingSources,
  allocations,
}: FundingAllocationProjectionRequest): FundingAllocationProjection {
  const accountById = new Map(accounts.map((account) => [account.id, account]));

  const fundingSourceById = new Map(
    fundingSources.map((fundingSource) => [fundingSource.id, fundingSource]),
  );

  const depositsByAccountId = new Map<string, ProjectedFundingDeposit[]>();

  const sourceIssues = new Map<string, FundingAllocationIssue[]>();

  const sourceDeposits = new Map<string, ProjectedFundingDeposit[]>();

  const orphanedIssues: FundingAllocationIssue[] = [];

  const destinationKeysBySource = new Map<string, Set<string>>();

  allocations.forEach((allocation) => {
    const fundingSource = fundingSourceById.get(allocation.fundingSourceId);

    if (!fundingSource) {
      orphanedIssues.push({
        allocationId: allocation.id,
        fundingSourceId: allocation.fundingSourceId,
        code: "missing-funding-source",
        message: "The referenced funding source does not exist.",
      });

      return;
    }

    const issues = sourceIssues.get(fundingSource.id) ?? [];

    const destinationAccount = accountById.get(allocation.destinationAccountId);

    if (!destinationAccount) {
      issues.push({
        allocationId: allocation.id,
        fundingSourceId: fundingSource.id,
        code: "missing-destination-account",
        message: "The destination account does not exist.",
      });

      sourceIssues.set(fundingSource.id, issues);

      return;
    }

    if (destinationAccount.status !== "active") {
      issues.push({
        allocationId: allocation.id,
        fundingSourceId: fundingSource.id,
        code: "inactive-destination-account",
        message: "The destination account must be active.",
      });
    }

    if (!isAssetFinancialAccount(destinationAccount)) {
      issues.push({
        allocationId: allocation.id,
        fundingSourceId: fundingSource.id,
        code: "non-asset-destination-account",
        message:
          "Funding may only be deposited into checking or savings accounts.",
      });
    }

    const destinationKeys =
      destinationKeysBySource.get(fundingSource.id) ?? new Set<string>();

    if (destinationKeys.has(destinationAccount.id)) {
      issues.push({
        allocationId: allocation.id,
        fundingSourceId: fundingSource.id,
        code: "duplicate-destination-allocation",
        message:
          "A funding source may only have one allocation for each destination account.",
      });
    } else {
      destinationKeys.add(destinationAccount.id);
    }

    destinationKeysBySource.set(fundingSource.id, destinationKeys);

    sourceIssues.set(fundingSource.id, issues);

    if (issues.some((issue) => issue.allocationId === allocation.id)) {
      return;
    }

    const deposit: ProjectedFundingDeposit = {
      allocationId: allocation.id,
      fundingSourceId: fundingSource.id,
      fundingSourceTitle: fundingSource.title,
      expectedOn: fundingSource.expectedOn,
      destinationAccountId: destinationAccount.id,
      destinationAccountName: destinationAccount.name,
      amount: fromCents(toCents(allocation.amount)),
    };

    const currentSourceDeposits = sourceDeposits.get(fundingSource.id) ?? [];

    currentSourceDeposits.push(deposit);

    sourceDeposits.set(fundingSource.id, currentSourceDeposits);

    const currentAccountDeposits =
      depositsByAccountId.get(destinationAccount.id) ?? [];

    currentAccountDeposits.push(deposit);

    depositsByAccountId.set(destinationAccount.id, currentAccountDeposits);
  });

  const sources = fundingSources.map(
    (fundingSource): FundingSourceAllocationProjection => {
      const deposits = sourceDeposits.get(fundingSource.id) ?? [];

      const issues = sourceIssues.get(fundingSource.id) ?? [];

      const sourceAmountInCents = toCents(fundingSource.amount);

      const allocatedAmountInCents = deposits.reduce(
        (total, deposit) => total + toCents(deposit.amount),
        0,
      );

      const remainingAmountInCents =
        sourceAmountInCents - allocatedAmountInCents;

      return {
        fundingSourceId: fundingSource.id,
        fundingSourceTitle: fundingSource.title,
        fundingSourceAmount: fromCents(sourceAmountInCents),
        allocatedAmount: fromCents(allocatedAmountInCents),
        remainingAmount: fromCents(remainingAmountInCents),
        status: getAllocationStatus(
          sourceAmountInCents,
          allocatedAmountInCents,
          issues.length > 0,
        ),
        deposits: [...deposits].sort((left, right) =>
          left.destinationAccountName.localeCompare(
            right.destinationAccountName,
          ),
        ),
        issues,
      };
    },
  );

  const accountsProjection = accounts
    .filter(
      (account) =>
        account.status === "active" && isAssetFinancialAccount(account),
    )
    .map((account): AccountFundingProjection => {
      const deposits = depositsByAccountId.get(account.id) ?? [];

      const openingBalanceInCents = toCents(
        getAssetAccountOpeningBalance(account),
      );

      const plannedDepositsInCents = deposits.reduce(
        (total, deposit) => total + toCents(deposit.amount),
        0,
      );

      return {
        accountId: account.id,
        accountName: account.name,
        openingBalance: fromCents(openingBalanceInCents),
        plannedDeposits: fromCents(plannedDepositsInCents),
        projectedBalance: fromCents(
          openingBalanceInCents + plannedDepositsInCents,
        ),
        deposits: [...deposits].sort((left, right) => {
          const dateComparison = left.expectedOn.localeCompare(
            right.expectedOn,
          );

          if (dateComparison !== 0) {
            return dateComparison;
          }

          return left.allocationId.localeCompare(right.allocationId);
        }),
      };
    });

  const canContinue =
    orphanedIssues.length === 0 &&
    sources.every((source) => source.status === "fully-allocated");

  return {
    sources,
    accounts: accountsProjection,
    orphanedIssues,
    canContinue,
  };
}
