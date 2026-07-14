import type { FinancialEvent } from "../events/financialEvent";
import type { FinancialJournal } from "../journal/financialJournal";
import {
  createEmptyFinancialState,
  type FinancialState,
  type PaycheckSummary,
  type PaymentSummary,
  type StatementSummary,
} from "../state/financialState";

function getMetadataNumber(event: FinancialEvent, key: string) {
  const value = event.metadata?.[key];

  return typeof value === "number" ? value : 0;
}

function getMetadataString(event: FinancialEvent, key: string) {
  const value = event.metadata?.[key];

  return typeof value === "string" ? value : "";
}

function createPaycheckSummary(event: FinancialEvent): PaycheckSummary {
  return {
    id: event.id,
    occurredOn: event.occurredOn,
    netPay: getMetadataNumber(event, "netPay"),
    grossPay: getMetadataNumber(event, "grossPay"),
    payPeriodStart: getMetadataString(event, "payPeriodStart"),
    payPeriodEnd: getMetadataString(event, "payPeriodEnd"),
  };
}

function createStatementSummary(event: FinancialEvent): StatementSummary {
  const statementBalance = getMetadataNumber(event, "statementBalance");

  return {
    id: event.id,
    occurredOn: event.occurredOn,
    accountId: getMetadataString(event, "accountId"),
    accountName: getMetadataString(event, "accountName"),
    statementPeriodStart: getMetadataString(event, "statementPeriodStart"),
    statementPeriodEnd: getMetadataString(event, "statementPeriodEnd"),
    statementClosingDate: getMetadataString(event, "statementClosingDate"),
    paymentDueDate: getMetadataString(event, "paymentDueDate"),
    statementBalance,
    currentBalance: statementBalance,
    projectedStatementBalance: statementBalance,
    minimumPayment: getMetadataNumber(event, "minimumPayment"),
  };
}

function createPaymentSummary(event: FinancialEvent): PaymentSummary {
  return {
    id: event.id,
    occurredOn: event.occurredOn,
    sourceAccountId: getMetadataString(event, "sourceAccountId"),
    sourceAccountName: getMetadataString(event, "sourceAccountName"),
    destinationAccountId: getMetadataString(event, "destinationAccountId"),
    destinationAccountName: getMetadataString(event, "destinationAccountName"),
    amount: event.amount ?? 0,
    strategy: getMetadataString(event, "strategy"),
  };
}

function applyPaycheckReceivedEvent(
  state: FinancialState,
  event: FinancialEvent,
): FinancialState {
  const amount = event.amount ?? 0;

  return {
    ...state,
    liquidity: {
      cashAvailable: state.liquidity.cashAvailable + amount,
    },
    income: {
      receivedIncome: state.income.receivedIncome + amount,
      paychecks: [...state.income.paychecks, createPaycheckSummary(event)],
    },
  };
}

function applyStatementGeneratedEvent(
  state: FinancialState,
  event: FinancialEvent,
): FinancialState {
  const statement = createStatementSummary(event);

  return {
    ...state,
    obligations: {
      ...state.obligations,
      statementBalanceTotal:
        state.obligations.statementBalanceTotal + statement.statementBalance,
      currentBalanceTotal:
        state.obligations.currentBalanceTotal + statement.currentBalance,
      projectedStatementBalanceTotal:
        state.obligations.projectedStatementBalanceTotal +
        statement.projectedStatementBalance,
      minimumPaymentTotal:
        state.obligations.minimumPaymentTotal + statement.minimumPayment,
      statements: [...state.obligations.statements, statement],
    },
  };
}

function applyPaymentCompletedEvent(
  state: FinancialState,
  event: FinancialEvent,
): FinancialState {
  const payment = createPaymentSummary(event);
  const paymentAmount = payment.amount;

  return {
    ...state,
    liquidity: {
      cashAvailable: state.liquidity.cashAvailable - paymentAmount,
    },
    obligations: {
      ...state.obligations,
      currentBalanceTotal: Math.max(
        0,
        state.obligations.currentBalanceTotal - paymentAmount,
      ),
      projectedStatementBalanceTotal: Math.max(
        0,
        state.obligations.projectedStatementBalanceTotal - paymentAmount,
      ),
      payments: [...state.obligations.payments, payment],
    },
  };
}

export function calculateFinancialState(
  journal: FinancialJournal,
): FinancialState {
  return journal.events.reduce((currentState, event) => {
    if (event.type === "paycheck.received") {
      return applyPaycheckReceivedEvent(currentState, event);
    }

    if (event.type === "statement.generated") {
      return applyStatementGeneratedEvent(currentState, event);
    }

    if (event.type === "payment.completed") {
      return applyPaymentCompletedEvent(currentState, event);
    }

    return currentState;
  }, createEmptyFinancialState());
}
