import type { FinancialEvent } from "../events/financialEvent";
import type { FinancialJournal } from "../journal/financialJournal";
import { createEmptyFinancialState, type FinancialState, type PaycheckSummary } from "../state/financialState";

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

export function calculateFinancialState(journal: FinancialJournal): FinancialState {
  const state = journal.events.reduce((currentState, event) => {
    if (event.type === "paycheck.received") {
      return applyPaycheckReceivedEvent(currentState, event);
    }

    return currentState;
  }, createEmptyFinancialState());

  const recommendations = state.income.paychecks.length > 0
    ? [
        {
          id: "review-paycheck-allocation",
          title: "Review paycheck allocation",
          rationale:
            "A paycheck has been received. Review upcoming obligations before allocating surplus.",
          priority: "medium" as const,
        },
      ]
    : [];

  return {
    ...state,
    recommendations,
  };
}
