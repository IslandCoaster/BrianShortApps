import type { FinancialAccount } from "../../accounts/financialAccount";
import {
  buildFundingAllocationProjection,
  type FundingAllocationIssue,
  type FundingAllocationStatus,
} from "../../funding/fundingAllocationProjection";
import type { FundingDepositAllocation } from "../../funding/fundingDepositAllocation";
import type { FundingSource } from "../../funding/fundingSource";
import type {
  ProjectionEntry,
  ProjectionIssue,
} from "./projectionEntry";
import { PROJECTION_ENTRY_PRIORITY } from "./projectionEntryPriority";
import {
  assertUniqueProjectionEntryIds,
  assertValidProjectionEntry,
} from "./projectionEntryValidation";

export type BlockedFundingDepositSource = {
  fundingSourceId: string;
  fundingSourceTitle: string;
  fundingSourceAmount: number;
  allocatedAmount: number;
  remainingAmount: number;
  status: FundingAllocationStatus;
  issues: FundingAllocationIssue[];
};

export type FundingDepositProjectionResult = {
  entries: ProjectionEntry[];
  issues: ProjectionIssue[];
  blockedSources: BlockedFundingDepositSource[];
  orphanedAllocationIssues: FundingAllocationIssue[];
  canProjectAllPlannedFunding: boolean;
};

export type FundingDepositProjectionRequest = {
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

function buildBlockedSourceIssue(
  source: BlockedFundingDepositSource,
): ProjectionIssue {
  return {
    code: "blocked-funding-source",
    sourceType: "funding-source",
    sourceId: source.fundingSourceId,
    sourceName: source.fundingSourceTitle,
    message:
      `Funding source "${source.fundingSourceTitle}" cannot be projected ` +
      `because its destination routing is ${source.status}.`,
  };
}

export function buildFundingDepositProjection({
  accounts,
  fundingSources,
  allocations,
}: FundingDepositProjectionRequest): FundingDepositProjectionResult {
  const plannedFundingSources = fundingSources.filter(
  (source) => source.status === "planned",
);

const plannedFundingSourceIds = new Set(
  plannedFundingSources.map((source) => source.id),
);

const plannedAllocations = allocations.filter(
  (allocation) =>
    plannedFundingSourceIds.has(allocation.fundingSourceId),
);

const allocationProjection = buildFundingAllocationProjection({
  accounts,
  fundingSources: plannedFundingSources,
  allocations: plannedAllocations,
});

  const fullyAllocatedSourceIds = new Set(
    allocationProjection.sources
      .filter((source) => source.status === "fully-allocated")
      .map((source) => source.fundingSourceId),
  );

  const blockedSources = allocationProjection.sources
    .filter((source) => source.status !== "fully-allocated")
    .map(
      (source): BlockedFundingDepositSource => ({
        fundingSourceId: source.fundingSourceId,
        fundingSourceTitle: source.fundingSourceTitle,
        fundingSourceAmount: source.fundingSourceAmount,
        allocatedAmount: source.allocatedAmount,
        remainingAmount: source.remainingAmount,
        status: source.status,
        issues: source.issues,
      }),
    );

  const entries = allocationProjection.accounts.flatMap((accountProjection) =>
    accountProjection.deposits
      .filter((deposit) =>
        fullyAllocatedSourceIds.has(deposit.fundingSourceId),
      )
      .map(
        (deposit): ProjectionEntry => ({
          id: `funding-deposit-${deposit.allocationId}`,
          accountId: deposit.destinationAccountId,
          occurredOn: deposit.expectedOn,
          entryType: "funding-deposit",
          status: "planned",
          title: deposit.fundingSourceTitle,
          description: `Planned deposit into ${deposit.destinationAccountName}`,
          amount: fromCents(toCents(deposit.amount)),
          sourceType: "funding-source",
          sourceId: deposit.fundingSourceId,
          sourceName: deposit.fundingSourceTitle,
          priority: PROJECTION_ENTRY_PRIORITY.fundingDeposit,
          metadata: {
            allocationId: deposit.allocationId,
            destinationAccountName: deposit.destinationAccountName,
          },
        }),
      ),
  );

  entries.forEach(assertValidProjectionEntry);
  assertUniqueProjectionEntryIds(entries);

  const issues = blockedSources.map(buildBlockedSourceIssue);

  return {
    entries,
    issues,
    blockedSources,
    orphanedAllocationIssues: allocationProjection.orphanedIssues,
    canProjectAllPlannedFunding:
      blockedSources.length === 0 &&
      allocationProjection.orphanedIssues.length === 0,
  };
}
