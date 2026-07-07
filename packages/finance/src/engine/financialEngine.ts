import type { FinancialEvent } from "../events/financialEvent";
import type { FinancialJournal } from "../journal/financialJournal";
import { createEmptyFinancialState, type FinancialState } from "../state/financialState";

function applyIncomeEvent(state: FinancialState, event: FinancialEvent): FinancialState {
  const amount = event.amount ?? 0;

  return {
    ...state,
    liquidity: {
      cashAvailable: state.liquidity.cashAvailable + amount,
    },
    income: {
      receivedIncome: state.income.receivedIncome + amount,
    },
  };
}

export function calculateFinancialState(journal: FinancialJournal): FinancialState {
  const state = journal.events.reduce((currentState, event) => {
    if (event.category === "income") {
      return applyIncomeEvent(currentState, event);
    }

    return currentState;
  }, createEmptyFinancialState());

  const recommendations = state.liquidity.cashAvailable > 0
    ? [
        {
          id: "review-paycheck-allocation",
          title: "Review paycheck allocation",
          rationale:
            "New income has increased available cash. Review upcoming obligations before allocating surplus.",
          priority: "medium" as const,
        },
      ]
    : [];

  return {
    ...state,
    recommendations,
  };
}
