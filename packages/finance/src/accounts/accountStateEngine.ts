import type { FinancialEvent } from "../events/financialEvent";
import type { FinancialJournal } from "../journal/financialJournal";
import { createEmptyAccountState, type AccountState } from "./accountState";

function getMetadataString(event: FinancialEvent, key: string) {
  const value = event.metadata?.[key];

  return typeof value === "string" ? value : "";
}

function getMetadataNumber(event: FinancialEvent, key: string) {
  const value = event.metadata?.[key];

  return typeof value === "number" ? value : 0;
}

function getAccountIdForEvent(event: FinancialEvent) {
  if (event.type === "statement.generated") {
    return getMetadataString(event, "accountId");
  }

  if (event.type === "payment.completed") {
    return getMetadataString(event, "destinationAccountId");
  }

  return "";
}

function getAccountNameForEvent(event: FinancialEvent) {
  if (event.type === "statement.generated") {
    return getMetadataString(event, "accountName");
  }

  if (event.type === "payment.completed") {
    return getMetadataString(event, "destinationAccountName");
  }

  return "";
}

function applyStatementGeneratedEvent(state: AccountState, event: FinancialEvent): AccountState {
  const statementBalance = getMetadataNumber(event, "statementBalance");
  const minimumPayment = getMetadataNumber(event, "minimumPayment");
  const creditLimit = getMetadataNumber(event, "creditLimit");

  return {
    ...state,
    creditLimit,
    statementBalance,
    currentBalance: statementBalance,
    projectedStatementBalance: statementBalance,
    minimumPayment,
    lastActivityOn: event.occurredOn,
    events: [...state.events, event],
  };
}

function applyPaymentCompletedEvent(state: AccountState, event: FinancialEvent): AccountState {
  const paymentAmount = event.amount ?? 0;

  return {
    ...state,
    currentBalance: Math.max(0, state.currentBalance - paymentAmount),
    projectedStatementBalance: Math.max(0, state.projectedStatementBalance - paymentAmount),
    paymentsCompleted: state.paymentsCompleted + 1,
    paymentTotal: state.paymentTotal + paymentAmount,
    lastActivityOn: event.occurredOn,
    events: [...state.events, event],
  };
}

function applyAccountEvent(state: AccountState, event: FinancialEvent): AccountState {
  if (event.type === "statement.generated") {
    return applyStatementGeneratedEvent(state, event);
  }

  if (event.type === "payment.completed") {
    return applyPaymentCompletedEvent(state, event);
  }

  return state;
}

export function calculateAccountStates(journal: FinancialJournal): AccountState[] {
  const accountStateMap = new Map<string, AccountState>();

  journal.events.forEach((event) => {
    const accountId = getAccountIdForEvent(event);

    if (!accountId) {
      return;
    }

    const accountName = getAccountNameForEvent(event);
    const currentState =
      accountStateMap.get(accountId) ?? createEmptyAccountState(accountId, accountName);

    accountStateMap.set(accountId, applyAccountEvent(currentState, event));
  });

  return Array.from(accountStateMap.values()).sort((a, b) =>
    a.accountName.localeCompare(b.accountName),
  );
}
