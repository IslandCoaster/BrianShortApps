import type { ProjectionEntry } from "./projectionEntry";
import { orderProjectionEntries } from "./projectionEntryOrdering";
import { PROJECTION_ENTRY_PRIORITY } from "./projectionEntryPriority";
import {
  assertUniqueProjectionEntryIds,
  assertValidProjectionEntry,
  validateProjectionEntry,
} from "./projectionEntryValidation";

function assertEqual<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(
      `${label}: expected ${String(expected)}, received ${String(actual)}.`,
    );
  }
}

export function verifyProjectionEntryFoundation(): void {
  const settlement: ProjectionEntry = {
    id: "settlement-card-1",
    accountId: "checking-1",
    occurredOn: "2026-07-23",
    entryType: "planned-settlement",
    status: "planned",
    title: "Apple Card Minimum Payment",
    amount: -450,
    sourceType: "debt-account",
    sourceId: "card-1",
    sourceName: "Apple Card",
    priority: PROJECTION_ENTRY_PRIORITY.plannedSettlement,
  };

  const sameDayDeposit: ProjectionEntry = {
    id: "deposit-paycheck-1",
    accountId: "checking-1",
    occurredOn: "2026-07-23",
    entryType: "funding-deposit",
    status: "planned",
    title: "Paycheck",
    amount: 2500,
    sourceType: "funding-source",
    sourceId: "paycheck-1",
    priority: PROJECTION_ENTRY_PRIORITY.fundingDeposit,
  };

  const laterDeposit: ProjectionEntry = {
    id: "deposit-paycheck-2",
    accountId: "checking-1",
    occurredOn: "2026-07-30",
    entryType: "funding-deposit",
    status: "planned",
    title: "Second Paycheck",
    amount: 1200,
    sourceType: "funding-source",
    sourceId: "paycheck-2",
    priority: PROJECTION_ENTRY_PRIORITY.fundingDeposit,
  };

  [settlement, sameDayDeposit, laterDeposit].forEach(
    assertValidProjectionEntry,
  );

  assertUniqueProjectionEntryIds([
    settlement,
    sameDayDeposit,
    laterDeposit,
  ]);

  const ordered = orderProjectionEntries([
    laterDeposit,
    settlement,
    sameDayDeposit,
  ]);

  assertEqual(
    ordered[0]?.id,
    sameDayDeposit.id,
    "Same-day deposit precedes settlement",
  );

  assertEqual(
    ordered[1]?.id,
    settlement.id,
    "Settlement follows same-day deposit",
  );

  assertEqual(
    ordered[2]?.id,
    laterDeposit.id,
    "Later date follows earlier entries",
  );

  assertEqual(
    orderProjectionEntries([settlement, sameDayDeposit]).length,
    2,
    "Ordering does not mutate or remove entries",
  );

  const invalidIssues = validateProjectionEntry({
    ...settlement,
    accountId: "",
    occurredOn: "",
    amount: Number.NaN,
  });

  assertEqual(
    invalidIssues.some((issue) => issue.code === "missing-account"),
    true,
    "Missing account is reported",
  );

  assertEqual(
    invalidIssues.some(
      (issue) => issue.code === "missing-projection-date",
    ),
    true,
    "Missing projection date is reported",
  );

  assertEqual(
    invalidIssues.some((issue) => issue.code === "invalid-amount"),
    true,
    "Invalid amount is reported",
  );
}
