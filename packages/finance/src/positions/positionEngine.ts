import type { AccountState } from "../accounts/accountState";
import type { FinancialState } from "../state/financialState";
import type { FinancialPositions } from "./financialPositions";

export function calculateFinancialPositions(
  state: FinancialState,
  accountStates: AccountState[],
): FinancialPositions {
  return {
    cash: {
      cashAvailable: state.liquidity.cashAvailable,
    },
    credit: {
      statementBalanceTotal: accountStates.reduce(
        (total, account) => total + account.statementBalance,
        0,
      ),
      currentBalanceTotal: accountStates.reduce(
        (total, account) => total + account.currentBalance,
        0,
      ),
      projectedStatementBalanceTotal: accountStates.reduce(
        (total, account) => total + account.projectedStatementBalance,
        0,
      ),
      minimumPaymentTotal: accountStates.reduce(
        (total, account) => total + account.minimumPayment,
        0,
      ),
      paymentsCompleted: accountStates.reduce(
        (total, account) => total + account.paymentsCompleted,
        0,
      ),
      paymentTotal: accountStates.reduce((total, account) => total + account.paymentTotal, 0),
    },
  };
}
