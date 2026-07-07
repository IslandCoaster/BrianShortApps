import { useState } from "react";
import {
  getDefaultFinancialScenario,
  listFinancialScenarios,
  runFinancialScenario,
} from "@bsa/finance";

import "./FinanceWorkspace.css";

const scenarios = listFinancialScenarios();

export function FinanceWorkspace() {
  const [selectedScenarioId, setSelectedScenarioId] = useState(getDefaultFinancialScenario().id);
  const selectedScenario =
    scenarios.find((scenario) => scenario.id === selectedScenarioId) ?? getDefaultFinancialScenario();

  const { scenario, state } = runFinancialScenario(selectedScenario);
  const latestPaycheck = state.income.paychecks.at(-1);

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
      </div>

      {latestPaycheck ? (
        <section className="finance-workspace__paycheck">
          <p>Latest Paycheck</p>
          <h3>${latestPaycheck.netPay.toLocaleString()}</h3>
          <span>
            Pay period {latestPaycheck.payPeriodStart} through {latestPaycheck.payPeriodEnd}
          </span>
        </section>
      ) : null}

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
