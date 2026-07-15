import {
  isAssetFinancialAccount,
  type FinancialAccount,
} from "../../accounts/financialAccount";
import type {
  OperationalFundingPlan,
  OperationalFundingPlanItem,
} from "../../funding/operationalFundingEngine";
import type {
  ProjectionEntry,
  ProjectionEntryStatus,
  ProjectionIssue,
} from "./projectionEntry";
import { PROJECTION_ENTRY_PRIORITY } from "./projectionEntryPriority";
import {
  assertUniqueProjectionEntryIds,
  assertValidProjectionEntry,
} from "./projectionEntryValidation";

export type SettlementProjectionResult = {
  entries: ProjectionEntry[];
  issues: ProjectionIssue[];
  canProjectAllDebtSettlements: boolean;
};

export type SettlementProjectionRequest = {
  accounts: readonly FinancialAccount[];
  fundingPlan: OperationalFundingPlan;
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

function getProjectionEntryStatus(
  item: OperationalFundingPlanItem,
): ProjectionEntryStatus {
  return item.fundingStatus === "partially-funded"
    ? "partially-funded"
    : "planned";
}

function createIssue(
  item: OperationalFundingPlanItem,
  code: ProjectionIssue["code"],
  message: string,
  accountId?: string,
): ProjectionIssue {
  return {
    code,
    sourceType: "debt-account",
    sourceId: item.requirementId,
    sourceName: item.name,
    message,
    accountId,
  };
}

export function buildSettlementProjection({
  accounts,
  fundingPlan,
}: SettlementProjectionRequest): SettlementProjectionResult {
  const accountById = new Map(
    accounts.map((account) => [account.id, account]),
  );

  const entries: ProjectionEntry[] = [];
  const issues: ProjectionIssue[] = [];

  fundingPlan.items.forEach((item) => {
    if (item.requirementType !== "debt-account") {
      return;
    }

    if (item.allocatedAmount <= 0 || item.allocations.length === 0) {
      return;
    }

    const debtAccount = accountById.get(item.requirementId);

    if (!debtAccount) {
      issues.push(
        createIssue(
          item,
          "missing-account",
          `Debt account "${item.name}" no longer exists.`,
        ),
      );

      return;
    }

    if (
      debtAccount.accountType !== "credit-card" &&
      debtAccount.accountType !== "loan"
    ) {
      issues.push(
        createIssue(
          item,
          "invalid-account-type",
          `Funding requirement "${item.name}" does not reference a debt account.`,
          debtAccount.id,
        ),
      );

      return;
    }

    if (!debtAccount.settlementAccountId) {
      issues.push(
        createIssue(
          item,
          "missing-routing",
          `Debt account "${item.name}" does not have a settlement account assigned.`,
        ),
      );

      return;
    }

    const settlementAccount = accountById.get(
      debtAccount.settlementAccountId,
    );

    if (!settlementAccount) {
      issues.push(
        createIssue(
          item,
          "invalid-routing",
          `Debt account "${item.name}" references a settlement account that no longer exists.`,
          debtAccount.settlementAccountId,
        ),
      );

      return;
    }

    if (!isAssetFinancialAccount(settlementAccount)) {
      issues.push(
        createIssue(
          item,
          "invalid-account-type",
          `Settlement account for "${item.name}" must be checking or savings.`,
          settlementAccount.id,
        ),
      );

      return;
    }

    if (settlementAccount.status !== "active") {
      issues.push(
        createIssue(
          item,
          "inactive-account",
          `Settlement account "${settlementAccount.name}" must be active before "${item.name}" can be projected.`,
          settlementAccount.id,
        ),
      );

      return;
    }

    item.allocations.forEach((allocation, allocationIndex) => {
      if (allocation.amount <= 0) {
        return;
      }

      const amount = fromCents(toCents(allocation.amount));

      const entry: ProjectionEntry = {
        id:
          `planned-settlement-${item.requirementId}-` +
          `${allocation.fundingSourceId}-${allocationIndex}`,
        accountId: settlementAccount.id,
        occurredOn: allocation.paymentDate,
        entryType: "planned-settlement",
        status: getProjectionEntryStatus(item),
        title: `${item.name} Payment`,
        description:
          `Planned settlement to ${item.counterparty} from ` +
          `${settlementAccount.name}`,
        amount: -amount,
        sourceType: "debt-account",
        sourceId: item.requirementId,
        sourceName: item.name,
        priority: PROJECTION_ENTRY_PRIORITY.plannedSettlement,
        metadata: {
          fundingSourceId: allocation.fundingSourceId,
          availableOn: allocation.availableOn,
          paymentDueDate: item.dueDate,
          requestedAmount: item.requestedAmount,
          fundingStatus: item.fundingStatus,
          settlementAccountName: settlementAccount.name,
        },
      };

      entries.push(entry);
    });
  });

  entries.forEach(assertValidProjectionEntry);
  assertUniqueProjectionEntryIds(entries);

  return {
    entries,
    issues,
    canProjectAllDebtSettlements: issues.length === 0,
  };
}
