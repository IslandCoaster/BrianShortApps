import { createFinancialJournal } from "../journal/financialJournal";
import { createFinancialLedgerEvent } from "./financialLedgerEvent";
import { replayFinancialLedger } from "./ledgerReplayEngine";

function assertEqual(actual: number, expected: number, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, received ${actual}.`);
  }
}

export function verifyFinancialLedgerReplay(): void {
  const journal = createFinancialJournal([
    createFinancialLedgerEvent({
      id: "ledger-opening-cash",
      ledgerCategory: "opening-cash",
      occurredOn: "2026-07-01",
      recordedAt: "2026-07-01T08:00:00.000Z",
      status: "posted",
      amount: 2000,
      description: "Opening operational cash",
    }),

    createFinancialLedgerEvent({
      id: "ledger-income",
      ledgerCategory: "income",
      occurredOn: "2026-07-02",
      recordedAt: "2026-07-02T09:00:00.000Z",
      status: "posted",
      amount: 1500,
      description: "Paycheck received",
    }),

    createFinancialLedgerEvent({
      id: "ledger-payment",
      ledgerCategory: "payment",
      occurredOn: "2026-07-03",
      recordedAt: "2026-07-03T10:00:00.000Z",
      status: "posted",
      amount: -1200,
      description: "Rent payment",
    }),

    createFinancialLedgerEvent({
      id: "ledger-planned-expense",
      ledgerCategory: "expense",
      occurredOn: "2026-07-05",
      recordedAt: "2026-07-03T11:00:00.000Z",
      status: "planned",
      amount: -150,
      description: "Planned utility payment",
    }),

    createFinancialLedgerEvent({
      id: "ledger-planned-deposit",
      ledgerCategory: "deposit",
      occurredOn: "2026-07-06",
      recordedAt: "2026-07-03T11:05:00.000Z",
      status: "planned",
      amount: 300,
      description: "Planned reimbursement",
    }),
  ]);

  const replay = replayFinancialLedger(journal);

  assertEqual(replay.openingCash, 2000, "Opening cash");
  assertEqual(replay.postedNetChange, 300, "Posted net change");
  assertEqual(replay.currentCash, 2300, "Current cash");
  assertEqual(replay.plannedNetChange, 150, "Planned net change");
  assertEqual(replay.projectedCash, 2450, "Projected cash");
  assertEqual(replay.entries.length, 5, "Replay entry count");

  assertEqual(
    replay.entries[0]?.runningPostedCash ?? Number.NaN,
    2000,
    "Opening running posted cash",
  );

  assertEqual(
    replay.entries[2]?.runningPostedCash ?? Number.NaN,
    2300,
    "Posted cash after rent",
  );

  assertEqual(
    replay.entries[3]?.runningPostedCash ?? Number.NaN,
    2300,
    "Posted cash after planned expense",
  );

  assertEqual(
    replay.entries[3]?.runningProjectedCash ?? Number.NaN,
    2150,
    "Projected cash after planned expense",
  );

  assertEqual(
    replay.entries[4]?.runningProjectedCash ?? Number.NaN,
    2450,
    "Final projected cash",
  );
}
