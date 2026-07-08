import { useState } from "react";
import {
  getDefaultFinancialScenario,
  listFinancialScenarios,
  runFinancialScenario,
} from "@bsa/finance";

import { AccountProfileView } from "./AccountProfileView";
import { AccountStateView } from "./AccountStateView";
import { CreditPositionView } from "./CreditPositionView";
import "./FinanceWorkspace.css";
import { FinancialJournalView } from "./FinancialJournalView";
import { FinancialPositionsView } from "./FinancialPositionsView";
import { InterestStateView } from "./InterestStateView";
import { ObligationStateView } from "./ObligationStateView";
import { GracePeriodStateView } from "./GracePeriodStateView";

const scenarios = listFinancialScenarios();

export function FinanceWorkspace() {
  const [selectedScenarioId, setSelectedScenarioId] = useState(
    getDefaultFinancialScenario().id,
  );
  const selectedScenario =
    scenarios.find((scenario) => scenario.id === selectedScenarioId) ??
    getDefaultFinancialScenario();

  const {
    accountProfiles,
    accountStates,
    creditPosition,
    gracePeriodStates,
    interestStates,
    journal,
    obligationStates,
    positions,
    scenario,
    state,
  } = runFinancialScenario(selectedScenario);

  const latestPaycheck = state.income.paychecks.at(-1);
  const latestStatement = state.obligations.statements.at(-1);
  const latestPayment = state.obligations.payments.at(-1);

  return (
    <section className="finance-workspace">
      <div className="finance-workspace__header">
        <p>Personal Finance</p>
        <h2>Financial Snapshot</h2>
        <span>
          Scenario: {scenario.title} - {scenario.description}
        </span>
      </div>
      <div className="finance-workspace__scenario-picker">
        <label htmlFor="financial-scenario">Financial Scenario</label>
        <select
          id="financial-scenario"
          value={selectedScenarioId}
          onChange={(event) => setSelectedScenarioId(event.target.value)}
        >
          {scenarios.map((scenarioOption) => (
            <option key={scenarioOption.id} value={scenarioOption.id}>
              {scenarioOption.title}
            </option>
          ))}
        </select>
      </div>
      <div className="finance-workspace__metrics">
        <article>
          <span>Cash Available</span>
          <strong>${state.liquidity.cashAvailable.toLocaleString()}</strong>
        </article>

        <article>
          <span>Income Received</span>
          <strong>${state.income.receivedIncome.toLocaleString()}</strong>
        </article>

        <article>
          <span>Paychecks Recorded</span>
          <strong>{state.income.paychecks.length}</strong>
        </article>

        <article>
          <span>Statement Balance</span>
          <strong>
            ${state.obligations.statementBalanceTotal.toLocaleString()}
          </strong>
        </article>

        <article>
          <span>Current Balance</span>
          <strong>
            ${state.obligations.currentBalanceTotal.toLocaleString()}
          </strong>
        </article>

        <article>
          <span>Projected Statement Balance</span>
          <strong>
            ${state.obligations.projectedStatementBalanceTotal.toLocaleString()}
          </strong>
        </article>

        <article>
          <span>Minimum Payments</span>
          <strong>
            ${state.obligations.minimumPaymentTotal.toLocaleString()}
          </strong>
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
            <h3>${latestPaycheck.netPay.toLocaleString()}</h3>
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
              Statement ${latestStatement.statementBalance.toLocaleString()} due{" "}
              {latestStatement.paymentDueDate}
            </span>
          </section>
        ) : null}

        {latestPayment ? (
          <section className="finance-workspace__paycheck">
            <p>Latest Payment</p>
            <h3>${latestPayment.amount.toLocaleString()}</h3>
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
