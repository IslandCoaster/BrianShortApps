import type { FinancialEvent } from "../events/financialEvent";
import type { FinancialJournal } from "../journal/financialJournal";
import {
  createEmptyFinancialState,
  type FinancialState,
  type PaycheckSummary,
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
  return {
    id: event.id,
    occurredOn: event.occurredOn,
    accountId: getMetadataString(event, "accountId"),
    accountName: getMetadataString(event, "accountName"),
    statementDate: getMetadataString(event, "statementDate"),
    closingDate: getMetadataString(event, "closingDate"),
    dueDate: getMetadataString(event, "dueDate"),
    statementBalance: getMetadataNumber(event, "statementBalance"),
    minimumPayment: getMetadataNumber(event, "minimumPayment"),
  };
}

function applyPaycheckReceivedEvent(state: FinancialState, event: FinancialEvent): FinancialState {
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

function applyStatementGeneratedEvent(state: FinancialState, event: FinancialEvent): FinancialState {
  const statement = createStatementSummary(event);

  return {
    ...state,
    obligations: {
      statementBalanceTotal: state.obligations.statementBalanceTotal + statement.statementBalance,
      minimumPaymentTotal: state.obligations.minimumPaymentTotal + statement.minimumPayment,
      statements: [...state.obligations.statements, statement],
    },
  };
}

function generateRecommendations(state: FinancialState) {
  const recommendations: FinancialState["recommendations"] = [];

  if (state.income.paychecks.length > 0) {
    recommendations.push({
      id: "review-paycheck-allocation",
      title: "Review paycheck allocation",
      rationale:
        "A paycheck has been received. Review upcoming obligations before allocating surplus.",
      priority: "medium",
    });
  }

  if (state.obligations.statements.length > 0) {
    recommendations.push({
      id: "review-statement-obligations",
      title: "Review statement obligations",
      rationale:
        "New statements are available. Review balances, due dates, and minimum payments before making allocation decisions.",
      priority: "high",
    });
  }

  return recommendations;
}

export function calculateFinancialState(journal: FinancialJournal): FinancialState {
  const state = journal.events.reduce((currentState, event) => {
    if (event.type === "paycheck.received") {
      return applyPaycheckReceivedEvent(currentState, event);
    }

    if (event.type === "statement.generated") {
      return applyStatementGeneratedEvent(currentState, event);
    }

    return currentState;
  }, createEmptyFinancialState());

  return {
    ...state,
    recommendations: generateRecommendations(state),
  };
}
