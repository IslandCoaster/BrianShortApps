import type { ProjectionEntry } from "../entries/projectionEntry";
import { PROJECTION_ENTRY_PRIORITY } from "../entries/projectionEntryPriority";
import { replayProjectionEntries } from "./projectionReplay";

function assertEqual<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(
      `${label}: expected ${String(expected)}, received ${String(actual)}.`,
    );
  }
}

export function verifyProjectionReplay(): void {
  const deposit: ProjectionEntry = {
    id: "deposit-1",
    accountId: "checking-1",
    occurredOn: "2026-07-23",
    entryType: "funding-deposit",
    status: "planned",
    title: "Paycheck",
    amount: 900,
    sourceType: "funding-source",
    sourceId: "paycheck-1",
    priority: PROJECTION_ENTRY_PRIORITY.fundingDeposit,
  };

  const settlement: ProjectionEntry = {
    id: "settlement-1",
    accountId: "checking-1",
    occurredOn: "2026-07-23",
    entryType: "planned-settlement",
    status: "planned",
    title: "Apple Card Minimum Payment",
    amount: -450,
    sourceType: "debt-account",
    sourceId: "card-1",
    priority: PROJECTION_ENTRY_PRIORITY.plannedSettlement,
  };

  const refund: ProjectionEntry = {
    id: "refund-1",
    accountId: "checking-1",
    occurredOn: "2026-07-25",
    entryType: "projected-refund",
    status: "planned",
    title: "Expected Refund",
    amount: 25.15,
    sourceType: "funding-source",
    sourceId: "refund-source-1",
    priority: PROJECTION_ENTRY_PRIORITY.projectedRefund,
  };

  const result = replayProjectionEntries({
    openingBalance: 100,
    entries: [refund, settlement, deposit],
  });

  assertEqual(result.openingBalance, 100, "Opening balance");

  assertEqual(
    result.entries[0]?.id,
    deposit.id,
    "Same-day deposit occurs before settlement",
  );

  assertEqual(
    result.entries[0]?.runningBalance,
    1000,
    "Running balance after deposit",
  );

  assertEqual(
    result.entries[1]?.id,
    settlement.id,
    "Settlement follows same-day deposit",
  );

  assertEqual(
    result.entries[1]?.runningBalance,
    550,
    "Running balance after settlement",
  );

  assertEqual(
    result.entries[2]?.runningBalance,
    575.15,
    "Running balance after refund",
  );

  assertEqual(result.totalInflows, 925.15, "Total inflows");

  assertEqual(result.totalOutflows, 450, "Total outflows");

  assertEqual(result.lowestBalance, 100, "Lowest balance");

  assertEqual(result.closingBalance, 575.15, "Closing balance");

  const negativeResult = replayProjectionEntries({
    openingBalance: 100,
    entries: [
      {
        id: "settlement-overdraft",
        accountId: "checking-1",
        occurredOn: "2026-07-24",
        entryType: "planned-settlement",
        status: "planned",
        title: "Large Settlement",
        amount: -300,
        sourceType: "debt-account",
        sourceId: "debt-2",
        priority: PROJECTION_ENTRY_PRIORITY.plannedSettlement,
      },
    ],
  });

  assertEqual(
    negativeResult.lowestBalance,
    -200,
    "Negative lowest balance",
  );

  assertEqual(
    negativeResult.closingBalance,
    -200,
    "Negative closing balance",
  );

  const emptyResult = replayProjectionEntries({
    openingBalance: 47.15,
    entries: [],
  });

  assertEqual(
    emptyResult.openingBalance,
    47.15,
    "Empty replay opening balance",
  );

  assertEqual(emptyResult.totalInflows, 0, "Empty replay inflows");

  assertEqual(emptyResult.totalOutflows, 0, "Empty replay outflows");

  assertEqual(
    emptyResult.lowestBalance,
    47.15,
    "Empty replay lowest balance",
  );

  assertEqual(
    emptyResult.closingBalance,
    47.15,
    "Empty replay closing balance",
  );

  assertEqual(emptyResult.entries.length, 0, "Empty replay entries");
}
