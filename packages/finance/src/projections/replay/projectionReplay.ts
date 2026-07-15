import type { ProjectionEntry } from "../entries/projectionEntry";
import { orderProjectionEntries } from "../entries/projectionEntryOrdering";
import {
  assertUniqueProjectionEntryIds,
  assertValidProjectionEntry,
} from "../entries/projectionEntryValidation";

export type ProjectionReplayRequest = {
  openingBalance: number;
  entries: readonly ProjectionEntry[];
};

export type ProjectionReplayEntry = ProjectionEntry & {
  runningBalance: number;
};

export type ProjectionReplayResult = {
  openingBalance: number;
  totalInflows: number;
  totalOutflows: number;
  lowestBalance: number;
  closingBalance: number;
  entries: ProjectionReplayEntry[];
};

function toCents(amount: number): number {
  if (!Number.isFinite(amount)) {
    throw new Error("Projection replay amount must be finite.");
  }

  return Math.round(amount * 100);
}

function fromCents(amountInCents: number): number {
  return amountInCents / 100;
}

export function replayProjectionEntries({
  openingBalance,
  entries,
}: ProjectionReplayRequest): ProjectionReplayResult {
  if (!Number.isFinite(openingBalance)) {
    throw new Error("Projection replay opening balance must be finite.");
  }

  entries.forEach(assertValidProjectionEntry);
  assertUniqueProjectionEntryIds(entries);

  const orderedEntries = orderProjectionEntries(entries);

  const openingBalanceInCents = toCents(openingBalance);

  let runningBalanceInCents = openingBalanceInCents;
  let totalInflowsInCents = 0;
  let totalOutflowsInCents = 0;
  let lowestBalanceInCents = openingBalanceInCents;

  const replayedEntries = orderedEntries.map(
    (entry): ProjectionReplayEntry => {
      const amountInCents = toCents(entry.amount);

      runningBalanceInCents += amountInCents;

      if (amountInCents > 0) {
        totalInflowsInCents += amountInCents;
      }

      if (amountInCents < 0) {
        totalOutflowsInCents += Math.abs(amountInCents);
      }

      lowestBalanceInCents = Math.min(
        lowestBalanceInCents,
        runningBalanceInCents,
      );

      return {
        ...entry,
        runningBalance: fromCents(runningBalanceInCents),
      };
    },
  );

  return {
    openingBalance: fromCents(openingBalanceInCents),
    totalInflows: fromCents(totalInflowsInCents),
    totalOutflows: fromCents(totalOutflowsInCents),
    lowestBalance: fromCents(lowestBalanceInCents),
    closingBalance: fromCents(runningBalanceInCents),
    entries: replayedEntries,
  };
}
