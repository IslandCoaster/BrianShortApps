import {
  isAssetFinancialAccount,
  type AssetFinancialAccount,
  type FinancialAccount,
} from "../accounts/financialAccount";
import type {
  FundingAllocationIssue,
  FundingAllocationStatus,
} from "../funding/fundingAllocationProjection";
import type { FundingDepositAllocation } from "../funding/fundingDepositAllocation";
import type { FundingSource } from "../funding/fundingSource";
import type { OperationalFundingPlan } from "../funding/operationalFundingEngine";
import {
  buildFundingDepositProjection,
  type BlockedFundingDepositSource,
} from "./entries/fundingDepositProjection";
import type {
  ProjectionEntry,
  ProjectionIssue,
} from "./entries/projectionEntry";
import { buildSettlementProjection } from "./entries/settlementProjection";
import type { ProjectionReplayEntry } from "./replay/projectionReplay";
import { replayProjectionEntries } from "./replay/projectionReplay";

export type AssetAccountProjectionEntryType =
  | "funding-deposit"
  | "planned-settlement";

export type AssetAccountProjectionEntry = {
  id: string;
  accountId: string;
  occurredOn: string;
  entryType: AssetAccountProjectionEntryType;
  status: ProjectionEntry["status"];
  title: string;
  description?: string;
  amount: number;
  runningBalance: number;
  sourceType: ProjectionEntry["sourceType"];
  sourceId: string;
  sourceName?: string;

  /**
   * Retained temporarily for compatibility with the existing deposit-only UI
   * and verification contract.
   */
  fundingSourceId?: string;
  fundingSourceTitle?: string;
};

export type AssetAccountProjection = {
  accountId: string;
  accountName: string;
  institutionName: string;
  accountType: AssetFinancialAccount["accountType"];
  openingBalance: number;
  totalPlannedDeposits: number;
  totalPlannedSettlements: number;
  closingBalance: number;
  lowestBalance: number;
  entries: AssetAccountProjectionEntry[];
};

export type BlockedFundingSourceProjection = {
  fundingSourceId: string;
  fundingSourceTitle: string;
  fundingSourceAmount: number;
  status: FundingAllocationStatus;
  remainingAmount: number;
  issues: FundingAllocationIssue[];
};

export type AssetAccountProjectionResult = {
  accounts: AssetAccountProjection[];
  blockedFundingSources: BlockedFundingSourceProjection[];
  orphanedIssues: FundingAllocationIssue[];
  settlementIssues: ProjectionIssue[];
  canProjectAllPlannedFunding: boolean;
  canProjectAllDebtSettlements: boolean;
};

export type AssetAccountProjectionRequest = {
  accounts: readonly FinancialAccount[];
  fundingSources: readonly FundingSource[];
  allocations: readonly FundingDepositAllocation[];
  fundingPlan: OperationalFundingPlan;
};

function mapBlockedFundingSource(
  source: BlockedFundingDepositSource,
): BlockedFundingSourceProjection {
  return {
    fundingSourceId: source.fundingSourceId,
    fundingSourceTitle: source.fundingSourceTitle,
    fundingSourceAmount: source.fundingSourceAmount,
    status: source.status,
    remainingAmount: source.remainingAmount,
    issues: source.issues,
  };
}

function mapProjectionEntry(
  entry: ProjectionReplayEntry,
): AssetAccountProjectionEntry {
  if (
    entry.entryType !== "funding-deposit" &&
    entry.entryType !== "planned-settlement"
  ) {
    throw new Error(
      `Asset account projection received unsupported entry type "${entry.entryType}".`,
    );
  }

  return {
    id: entry.id,
    accountId: entry.accountId,
    occurredOn: entry.occurredOn,
    entryType: entry.entryType,
    status: entry.status,
    title: entry.title,
    description: entry.description,
    amount: entry.amount,
    runningBalance: entry.runningBalance,
    sourceType: entry.sourceType,
    sourceId: entry.sourceId,
    sourceName: entry.sourceName,
    fundingSourceId:
      entry.entryType === "funding-deposit" ? entry.sourceId : undefined,
    fundingSourceTitle:
      entry.entryType === "funding-deposit"
        ? entry.sourceName ?? entry.title
        : undefined,
  };
}

export function buildAssetAccountProjection({
  accounts,
  fundingSources,
  allocations,
  fundingPlan,
}: AssetAccountProjectionRequest): AssetAccountProjectionResult {
  const fundingDepositProjection = buildFundingDepositProjection({
    accounts,
    fundingSources,
    allocations,
  });

  const settlementProjection = buildSettlementProjection({
    accounts,
    fundingPlan,
  });

  const projectionEntries: ProjectionEntry[] = [
    ...fundingDepositProjection.entries,
    ...settlementProjection.entries,
  ];

  const entriesByAccountId = new Map<string, ProjectionEntry[]>();

  projectionEntries.forEach((entry) => {
    const accountEntries = entriesByAccountId.get(entry.accountId) ?? [];

    accountEntries.push(entry);

    entriesByAccountId.set(entry.accountId, accountEntries);
  });

  const accountProjections = accounts
    .filter(
      (account): account is AssetFinancialAccount =>
        account.status === "active" && isAssetFinancialAccount(account),
    )
    .map((account): AssetAccountProjection => {
      const replay = replayProjectionEntries({
        openingBalance: account.currentBalance,
        entries: entriesByAccountId.get(account.id) ?? [],
      });

      return {
        accountId: account.id,
        accountName: account.name,
        institutionName: account.institutionName,
        accountType: account.accountType,
        openingBalance: replay.openingBalance,
        totalPlannedDeposits: replay.totalInflows,
        totalPlannedSettlements: replay.totalOutflows,
        closingBalance: replay.closingBalance,
        lowestBalance: replay.lowestBalance,
        entries: replay.entries.map(mapProjectionEntry),
      };
    })
    .sort((left, right) =>
      left.accountName.localeCompare(right.accountName),
    );

  return {
    accounts: accountProjections,
    blockedFundingSources:
      fundingDepositProjection.blockedSources.map(mapBlockedFundingSource),
    orphanedIssues: fundingDepositProjection.orphanedAllocationIssues,
    settlementIssues: settlementProjection.issues,
    canProjectAllPlannedFunding:
      fundingDepositProjection.canProjectAllPlannedFunding,
    canProjectAllDebtSettlements:
      settlementProjection.canProjectAllDebtSettlements,
  };
}
