import type { FinancialEvent } from "../events/financialEvent";
import type { FinancialJournal } from "../journal/financialJournal";
import {
  createEmptyObligationState,
  type ObligationState,
} from "./obligationState";

function getMetadataString(event: FinancialEvent, key: string) {
  const value = event.metadata?.[key];

  return typeof value === "string" ? value : "";
}

function getMetadataNumber(event: FinancialEvent, key: string) {
  const value = event.metadata?.[key];

  return typeof value === "number" ? value : 0;
}

function getObligationIdForEvent(event: FinancialEvent) {
  if (event.type === "statement.generated") {
    return event.id;
  }

  if (event.type === "payment.completed") {
    return getMetadataString(event, "destinationAccountId");
  }

  return "";
}

function calculateStatus(
  remainingAmount: number,
  originalAmount: number,
): ObligationState["status"] {
  if (remainingAmount <= 0) {
    return "satisfied";
  }

  if (remainingAmount < originalAmount) {
    return "partially-satisfied";
  }

  return "open";
}

function calculateSatisfactionPercent(
  originalAmount: number,
  remainingAmount: number,
) {
  if (originalAmount <= 0) {
    return 0;
  }

  return (
    Math.round(((originalAmount - remainingAmount) / originalAmount) * 10000) /
    100
  );
}

function applyStatementGeneratedEvent(event: FinancialEvent): ObligationState {
  const accountId = getMetadataString(event, "accountId");
  const accountName = getMetadataString(event, "accountName");
  const originalAmount = getMetadataNumber(event, "statementBalance");

  return {
    ...createEmptyObligationState(event.id, accountId, accountName),
    originalAmount,
    remainingAmount: originalAmount,
    minimumPayment: getMetadataNumber(event, "minimumPayment"),
    paymentDueDate: getMetadataString(event, "paymentDueDate"),
    events: [event],
  };
}

function applyPaymentCompletedEvent(
  state: ObligationState,
  event: FinancialEvent,
): ObligationState {
  const paymentAmount = event.amount ?? 0;
  const remainingAmount = Math.max(0, state.remainingAmount - paymentAmount);

  return {
    ...state,
    remainingAmount,
    paymentsApplied: state.paymentsApplied + 1,
    paymentTotal: state.paymentTotal + paymentAmount,
    satisfactionPercent: calculateSatisfactionPercent(
      state.originalAmount,
      remainingAmount,
    ),
    status: calculateStatus(remainingAmount, state.originalAmount),
    events: [...state.events, event],
  };
}

export function calculateObligationStates(
  journal: FinancialJournal,
): ObligationState[] {
  const obligationStateMap = new Map<string, ObligationState>();

  journal.events.forEach((event) => {
    if (event.type === "statement.generated") {
      const obligation = applyStatementGeneratedEvent(event);
      obligationStateMap.set(obligation.accountId, obligation);
      return;
    }

    if (event.type === "payment.completed") {
      const obligationId = getObligationIdForEvent(event);
      const currentState = obligationStateMap.get(obligationId);

      if (!currentState) {
        return;
      }

      obligationStateMap.set(
        obligationId,
        applyPaymentCompletedEvent(currentState, event),
      );
    }
  });

  return Array.from(obligationStateMap.values()).sort((a, b) =>
    a.paymentDueDate.localeCompare(b.paymentDueDate),
  );
}
