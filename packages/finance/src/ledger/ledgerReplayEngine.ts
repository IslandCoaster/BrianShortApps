import type { FinancialEvent } from "../events/financialEvent";
import type { FinancialJournal } from "../journal/financialJournal";
import {
  isFinancialLedgerEvent,
  type FinancialLedgerEvent,
} from "./financialLedgerEvent";
import { sortFinancialLedgerEvents } from "./financialLedgerOrdering";
import { assertValidFinancialLedgerEvent } from "./financialLedgerValidation";
import {
  createEmptyFinancialLedgerReplayState,
  type FinancialLedgerReplayEntry,
  type FinancialLedgerReplayState,
} from "./ledgerReplayState";

function assertUniqueEventIds(events: readonly FinancialLedgerEvent[]): void {
  const knownIds = new Set<string>();

  for (const event of events) {
    if (knownIds.has(event.id)) {
      throw new Error(
        `Financial ledger replay contains duplicate event id "${event.id}".`,
      );
    }

    knownIds.add(event.id);
  }
}

function assertSingleOpeningCashEvent(
  events: readonly FinancialLedgerEvent[],
): void {
  const openingCashEvents = events.filter(
    (event) => event.ledgerCategory === "opening-cash",
  );

  if (openingCashEvents.length > 1) {
    throw new Error(
      "Financial ledger replay cannot contain more than one opening-cash event.",
    );
  }
}

function assertValidCorrectionReferences(
  events: readonly FinancialLedgerEvent[],
): void {
  const eventById = new Map(events.map((event) => [event.id, event] as const));

  for (const event of events) {
    if (event.ledgerCategory !== "correction") {
      continue;
    }

    const correctedEventId = event.correctionOfEventId;

    if (!correctedEventId) {
      continue;
    }

    const correctedEvent = eventById.get(correctedEventId);

    if (!correctedEvent) {
      throw new Error(
        `Correction event "${event.id}" references missing event "${correctedEventId}".`,
      );
    }

    if (correctedEvent.ledgerCategory === "correction") {
      throw new Error(
        `Correction event "${event.id}" cannot reference another correction event.`,
      );
    }
  }
}

function validateReplayDataset(events: readonly FinancialLedgerEvent[]): void {
  for (const event of events) {
    assertValidFinancialLedgerEvent(event);
  }

  assertUniqueEventIds(events);
  assertSingleOpeningCashEvent(events);
  assertValidCorrectionReferences(events);
}

function extractLedgerEvents(
  events: readonly FinancialEvent[],
): FinancialLedgerEvent[] {
  return events.filter(isFinancialLedgerEvent);
}

export function replayFinancialLedgerEvents(
  events: readonly FinancialLedgerEvent[],
): FinancialLedgerReplayState {
  const orderedEvents = sortFinancialLedgerEvents(events);

  validateReplayDataset(orderedEvents);

  let openingCash = 0;
  let postedNetChange = 0;
  let plannedNetChange = 0;
  let currentCash = 0;
  let projectedCash = 0;

  const entries: FinancialLedgerReplayEntry[] = [];

  for (const event of orderedEvents) {
    if (event.status === "posted") {
      currentCash += event.amount;
      projectedCash += event.amount;

      if (event.ledgerCategory === "opening-cash") {
        openingCash += event.amount;
      } else {
        postedNetChange += event.amount;
      }
    } else {
      plannedNetChange += event.amount;
      projectedCash += event.amount;
    }

    entries.push({
      event,
      runningPostedCash: currentCash,
      runningProjectedCash: projectedCash,
    });
  }

  return {
    openingCash,
    postedNetChange,
    plannedNetChange,
    currentCash,
    projectedCash,
    entries,
  };
}

export function replayFinancialLedger(
  journal: FinancialJournal,
): FinancialLedgerReplayState {
  return replayFinancialLedgerEvents(extractLedgerEvents(journal.events));
}

export function replayFinancialLedgerWithTemporaryEvents(
  journal: FinancialJournal,
  temporaryEvents: readonly FinancialEvent[] = [],
): FinancialLedgerReplayState {
  return replayFinancialLedgerEvents(
    extractLedgerEvents([...journal.events, ...temporaryEvents]),
  );
}

export function replayEmptyFinancialLedger(): FinancialLedgerReplayState {
  return createEmptyFinancialLedgerReplayState();
}
