import {
  isAssetFinancialAccount,
  type AssetFinancialAccount,
  type FinancialAccount,
} from "../accounts/financialAccount";
import {
  buildFundingAllocationProjection,
  type FundingAllocationIssue,
  type FundingAllocationStatus,
} from "../funding/fundingAllocationProjection";
import type { FundingDepositAllocation } from "../funding/fundingDepositAllocation";
import type { FundingSource } from "../funding/fundingSource";

export type AssetAccountProjectionEntryType =
  "funding-deposit";

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

function toCents(amount: number): number {
  if (!Number.isFinite(amount)) {
    return 0;
  }

  return Math.round(amount * 100);
}

function fromCents(amountInCents: number): number {
  return amountInCents / 100;
}

function orderProjectionEntries(
  entries: readonly Omit<
    AssetAccountProjectionEntry,
    "runningBalance"
  >[],
): Omit<
  AssetAccountProjectionEntry,
  "runningBalance"
>[] {
  return [...entries].sort((left, right) => {
    const dateComparison =
      left.occurredOn.localeCompare(
        right.occurredOn,
      );

    if (dateComparison !== 0) {
      return dateComparison;
    }

    const sourceComparison =
      left.fundingSourceId.localeCompare(
        right.fundingSourceId,
      );

    if (sourceComparison !== 0) {
      return sourceComparison;
    }

    return left.id.localeCompare(right.id);
  });
}

export function buildAssetAccountProjection({
  accounts,
  fundingSources,
  allocations,
}: AssetAccountProjectionRequest): AssetAccountProjectionResult {
  const plannedFundingSources =
    fundingSources.filter(
      (fundingSource) =>
        fundingSource.status === "planned",
    );

  const allocationProjection =
    buildFundingAllocationProjection({
      accounts,
      fundingSources:
        plannedFundingSources,
      allocations,
    });

  const fullyAllocatedSourceIds =
    new Set(
      allocationProjection.sources
        .filter(
          (source) =>
            source.status ===
            "fully-allocated",
        )
        .map(
          (source) =>
            source.fundingSourceId,
        ),
    );

  const blockedFundingSources =
    allocationProjection.sources
      .filter(
        (source) =>
          source.status !==
          "fully-allocated",
      )
      .map(
        (
          source,
        ): BlockedFundingSourceProjection => ({
          fundingSourceId:
            source.fundingSourceId,
          fundingSourceTitle:
            source.fundingSourceTitle,
          fundingSourceAmount:
            source.fundingSourceAmount,
          status: source.status,
          remainingAmount:
            source.remainingAmount,
          issues: source.issues,
        }),
      );

  const accountEntries = new Map<
    string,
    Omit<
      AssetAccountProjectionEntry,
      "runningBalance"
    >[]
  >();

  allocationProjection.accounts.forEach(
    (accountProjection) => {
      const validDeposits =
        accountProjection.deposits.filter(
          (deposit) =>
            fullyAllocatedSourceIds.has(
              deposit.fundingSourceId,
            ),
        );

      accountEntries.set(
        accountProjection.accountId,
        validDeposits.map(
          (
            deposit,
          ): Omit<
            AssetAccountProjectionEntry,
            "runningBalance"
          > => ({
            id: `funding-deposit-${deposit.allocationId}`,
            accountId:
              deposit.destinationAccountId,
            occurredOn:
              deposit.expectedOn,
            entryType:
              "funding-deposit",
            title:
              deposit.fundingSourceTitle,
            amount: fromCents(
              toCents(deposit.amount),
            ),
            fundingSourceId:
              deposit.fundingSourceId,
            fundingSourceTitle:
              deposit.fundingSourceTitle,
          }),
        ),
      );
    },
  );

  const accountProjections =
    accounts
      .filter(
        (
          account,
        ): account is AssetFinancialAccount =>
          account.status === "active" &&
          isAssetFinancialAccount(account),
      )
      .map(
        (
          account,
        ): AssetAccountProjection => {
          const openingBalanceInCents =
            toCents(
              account.currentBalance,
            );

          const orderedEntries =
            orderProjectionEntries(
              accountEntries.get(
                account.id,
              ) ?? [],
            );

          let runningBalanceInCents =
            openingBalanceInCents;

          let lowestBalanceInCents =
            openingBalanceInCents;

          const entries =
            orderedEntries.map(
              (
                entry,
              ): AssetAccountProjectionEntry => {
                runningBalanceInCents +=
                  toCents(entry.amount);

                lowestBalanceInCents =
                  Math.min(
                    lowestBalanceInCents,
                    runningBalanceInCents,
                  );

                return {
                  ...entry,
                  runningBalance:
                    fromCents(
                      runningBalanceInCents,
                    ),
                };
              },
            );

          const totalPlannedDepositsInCents =
            entries.reduce(
              (total, entry) =>
                total +
                toCents(entry.amount),
              0,
            );

          return {
            accountId: account.id,
            accountName: account.name,
            institutionName:
              account.institutionName,
            accountType:
              account.accountType,
            openingBalance:
              fromCents(
                openingBalanceInCents,
              ),
            totalPlannedDeposits:
              fromCents(
                totalPlannedDepositsInCents,
              ),
            closingBalance:
              fromCents(
                openingBalanceInCents +
                  totalPlannedDepositsInCents,
              ),
            lowestBalance:
              fromCents(
                lowestBalanceInCents,
              ),
            entries,
          };
        },
      )
      .sort((left, right) =>
        left.accountName.localeCompare(
          right.accountName,
        ),
      );

  return {
    accounts: accountProjections,
    blockedFundingSources,
    orphanedIssues:
      allocationProjection.orphanedIssues,
    canProjectAllPlannedFunding:
      blockedFundingSources.length === 0 &&
      allocationProjection.orphanedIssues
        .length === 0,
  };
}