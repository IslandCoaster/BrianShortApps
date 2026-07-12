import { useState } from "react";
import { Link } from "react-router";
import {
  getDefaultFinancialScenario,
  listFinancialScenarios,
  runFinancialScenario,
} from "@bsa/finance";

import "./FinanceWorkspace.css";

import { FinancialModelLab } from "./FinancialModelLab";

const scenarios = listFinancialScenarios();

export function FinanceWorkspace() {
  const [selectedScenarioId, setSelectedScenarioId] = useState(
    getDefaultFinancialScenario().id,
  );

  const selectedScenario =
    scenarios.find((scenario) => scenario.id === selectedScenarioId) ??
    getDefaultFinancialScenario();

  const scenarioResult = runFinancialScenario(selectedScenario);

  return (
    <section className="finance-workspace">
      <header className="finance-workspace__header">
        <p>Finance Engineering</p>

        <h2>Financial Model Lab</h2>

        <span>
          Inspect deterministic financial scenarios, replay results, and
          domain-engine behavior.
        </span>

        <Link to="/personal-finance">Open Personal Finance</Link>
      </header>

      <FinancialModelLab
        selectedScenarioId={selectedScenarioId}
        scenarios={scenarios}
        onScenarioChange={setSelectedScenarioId}
        result={scenarioResult}
      />
    </section>
  );
}
