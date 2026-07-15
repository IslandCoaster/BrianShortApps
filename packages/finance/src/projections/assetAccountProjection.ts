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
import {
  buildFundingDepositProjection,
  type BlockedFundingDepositSource,
} from "./entries/fundingDepositProjection";
import type { ProjectionEntry } from "./entries/projectionEntry";
import { replayProjectionEntries } from "./replay/projectionReplay";

export type AssetAccountProjectionEntryType = "funding-deposit";

export type AssetAccountProjectionEntry = {
  id: string;
  accountId: string;
  occurredOn: string;
  entryType: AssetAccountProjectionEntryType;
  title: string;
  amount: number;
  runningBalance: number;
  fundingSourceId: string;
  fundingSourceTitle: string;
};

export type AssetAccountProjection = {
  accountId: string;
  accountName: string;
  institutionName: string;
  accountType: AssetFinancialAccount["accountType"];
  openingBalance: number;
  totalPlannedDeposits: number;
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
  canProjectAllPlannedFunding: boolean;
};

export type AssetAccountProjectionRequest = {
  accounts: readonly FinancialAccount[];
  fundingSources: readonly FundingSource[];
  allocations: readonly FundingDepositAllocation[];
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
  entry: ProjectionEntry & { runningBalance: number },
): AssetAccountProjectionEntry {
  if (entry.entryType !== "funding-deposit") {
    throw new Error(
      `Asset funding projection received unsupported entry type "${entry.entryType}".`,
    );
  }

  return {
    id: entry.id,
    accountId: entry.accountId,
    occurredOn: entry.occurredOn,
    entryType: "funding-deposit",
    title: entry.title,
    amount: entry.amount,
    runningBalance: entry.runningBalance,
    fundingSourceId: entry.sourceId,
    fundingSourceTitle: entry.sourceName ?? entry.title,
  };
}

export function buildAssetAccountProjection({
  accounts,
  fundingSources,
  allocations,
}: AssetAccountProjectionRequest): AssetAccountProjectionResult {
  const fundingDepositProjection = buildFundingDepositProjection({
    accounts,
    fundingSources,
    allocations,
  });

  const entriesByAccountId = new Map<string, ProjectionEntry[]>();

  fundingDepositProjection.entries.forEach((entry) => {
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
    canProjectAllPlannedFunding:
      fundingDepositProjection.canProjectAllPlannedFunding,
  };
}
