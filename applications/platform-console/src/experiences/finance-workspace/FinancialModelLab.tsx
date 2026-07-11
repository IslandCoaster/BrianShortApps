import { listFinancialScenarios, runFinancialScenario } from "@bsa/finance";

import { AccountProfileView } from "./AccountProfileView";
import { AccountStateView } from "./AccountStateView";
import { CreditPositionView } from "./CreditPositionView";
import { DailyBalanceView } from "./DailyBalanceView";
import { DailyInterestTimelineView } from "./DailyInterestTimelineView";
import { FinancialJournalView } from "./FinancialJournalView";
import { FinancialPositionsView } from "./FinancialPositionsView";
import { GracePeriodStateView } from "./GracePeriodStateView";
import { InterestStateView } from "./InterestStateView";
import { ObligationStateView } from "./ObligationStateView";
import { SimulationView } from "./SimulationView";

type FinancialScenarioOption = ReturnType<
  typeof listFinancialScenarios
>[number];

type FinancialScenarioResult = ReturnType<typeof runFinancialScenario>;

type FinancialModelLabProps = {
  selectedScenarioId: string;
  scenarios: FinancialScenarioOption[];
  onScenarioChange: (scenarioId: string) => void;
  result: FinancialScenarioResult;
};

function formatAmount(amount: number) {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function FinancialModelLab({
  selectedScenarioId,
  scenarios,
  onScenarioChange,
  result,
}: FinancialModelLabProps) {
  const {
    accountProfiles,
    accountStates,
    creditPosition,
    dailyBalances,
    dailyInterestTimeline,
    gracePeriodStates,
    interestStates,
    journal,
    obligationStates,
    positions,
    scenario,
    state,
  } = result;

  const latestPaycheck = state.income.paychecks.at(-1);
  const latestStatement = state.obligations.statements.at(-1);
  const latestPayment = state.obligations.payments.at(-1);

  return (
    <section className="finance-workspace__model-lab">
      <div className="finance-workspace__model-lab-header">
        <div>
          <p>Financial Model Lab</p>
          <h2>{scenario.title}</h2>
          <span>{scenario.description}</span>
        </div>

        <div className="finance-workspace__scenario-picker">
          <label htmlFor="financial-scenario">Financial Scenario</label>

          <select
            id="financial-scenario"
            value={selectedScenarioId}
            onChange={(event) => onScenarioChange(event.target.value)}
          >
            {scenarios.map((scenarioOption) => (
              <option key={scenarioOption.id} value={scenarioOption.id}>
                {scenarioOption.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="finance-workspace__metrics">
        <article>
          <span>Cash Available</span>
          <strong>{formatAmount(state.liquidity.cashAvailable)}</strong>
        </article>

        <article>
          <span>Income Received</span>
          <strong>{formatAmount(state.income.receivedIncome)}</strong>
        </article>

        <article>
          <span>Paychecks Recorded</span>
          <strong>{state.income.paychecks.length}</strong>
        </article>

        <article>
          <span>Statement Balance</span>
          <strong>
            {formatAmount(state.obligations.statementBalanceTotal)}
          </strong>
        </article>

        <article>
          <span>Current Balance</span>
          <strong>{formatAmount(state.obligations.currentBalanceTotal)}</strong>
        </article>

        <article>
          <span>Projected Statement Balance</span>
          <strong>
            {formatAmount(state.obligations.projectedStatementBalanceTotal)}
          </strong>
        </article>

        <article>
          <span>Minimum Payments</span>
          <strong>{formatAmount(state.obligations.minimumPaymentTotal)}</strong>
        </article>

        <article>
          <span>Payments Completed</span>
          <strong>{state.obligations.payments.length}</strong>
        </article>

        <article>
          <span>Statements Recorded</span>
          <strong>{state.obligations.statements.length}</strong>
        </article>
      </div>

      <div className="finance-workspace__detail-grid">
        {latestPaycheck ? (
          <section className="finance-workspace__paycheck">
            <p>Latest Paycheck</p>
            <h3>{formatAmount(latestPaycheck.netPay)}</h3>
            <span>
              Pay period {latestPaycheck.payPeriodStart} through{" "}
              {latestPaycheck.payPeriodEnd}
            </span>
          </section>
        ) : null}

        {latestStatement ? (
          <section className="finance-workspace__paycheck">
            <p>Latest Statement</p>
            <h3>{latestStatement.accountName}</h3>
            <span>
              Statement {formatAmount(latestStatement.statementBalance)} due{" "}
              {latestStatement.paymentDueDate}
            </span>
          </section>
        ) : null}

        {latestPayment ? (
          <section className="finance-workspace__paycheck">
            <p>Latest Payment</p>
            <h3>{formatAmount(latestPayment.amount)}</h3>
            <span>
              {latestPayment.sourceAccountName} to{" "}
              {latestPayment.destinationAccountName}
            </span>
          </section>
        ) : null}
      </div>

      <CreditPositionView creditPosition={creditPosition} />

      <FinancialPositionsView positions={positions} />

      <ObligationStateView obligationStates={obligationStates} />

      <AccountStateView accountStates={accountStates} />

      <GracePeriodStateView gracePeriodStates={gracePeriodStates} />

      <DailyBalanceView dailyBalances={dailyBalances} />

      <DailyInterestTimelineView
        dailyInterestTimeline={dailyInterestTimeline}
      />

      <SimulationView
        journal={journal}
        currentInterestStates={interestStates}
      />

      <InterestStateView interestStates={interestStates} />

      <AccountProfileView accountProfiles={accountProfiles} />

      <FinancialJournalView journal={journal} />

      <section className="finance-workspace__recommendations">
        <p>Recommended Next Actions</p>

        {state.recommendations.map((recommendation) => (
          <article key={recommendation.id}>
            <span>{recommendation.priority}</span>
            <h3>{recommendation.title}</h3>
            <p>{recommendation.rationale}</p>
          </article>
        ))}
      </section>
    </section>
  );
}
