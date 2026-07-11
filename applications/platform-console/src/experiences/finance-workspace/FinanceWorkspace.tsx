import { useState } from "react";
import {
  getDefaultFinancialScenario,
  listFinancialScenarios,
  runFinancialScenario,
} from "@bsa/finance";

import "./FinanceWorkspace.css";

import { AccountForm } from "./AccountForm";
import { AccountPortfolioView } from "./AccountPortfolioView";
import { FinancialModelLab } from "./FinancialModelLab";
import { portfolioAccountSnapshots } from "./portfolio.snapshots";
import type { PortfolioAccountSummary } from "./portfolio.types";

import { PaycheckPlanningView } from "./PaycheckPlanningView";

const scenarios = listFinancialScenarios();

export function FinanceWorkspace() {
  const [selectedScenarioId, setSelectedScenarioId] = useState(
    getDefaultFinancialScenario().id,
  );

  const [portfolioAccounts, setPortfolioAccounts] = useState<
    PortfolioAccountSummary[]
  >(portfolioAccountSnapshots);

  const [isAddingAccount, setIsAddingAccount] = useState(false);

  const [editingAccount, setEditingAccount] =
    useState<PortfolioAccountSummary | null>(null);

  const selectedScenario =
    scenarios.find((scenario) => scenario.id === selectedScenarioId) ??
    getDefaultFinancialScenario();

  const scenarioResult = runFinancialScenario(selectedScenario);

  function handleSaveAccount(account: PortfolioAccountSummary) {
    setPortfolioAccounts((current) => {
      const accountExists = current.some(
        (existingAccount) => existingAccount.id === account.id,
      );

      if (accountExists) {
        return current.map((existingAccount) =>
          existingAccount.id === account.id ? account : existingAccount,
        );
      }

      return [...current, account];
    });

    setIsAddingAccount(false);
    setEditingAccount(null);
  }

  function handleRemoveAccount(accountId: string) {
    setPortfolioAccounts((current) =>
      current.filter((account) => account.id !== accountId),
    );

    if (editingAccount?.id === accountId) {
      setEditingAccount(null);
    }
  }

  function handleCancelAccountForm() {
    setIsAddingAccount(false);
    setEditingAccount(null);
  }

  return (
    <section className="finance-workspace">
      <header className="finance-workspace__header">
        <p>Personal Finance</p>
        <h2>Financial Snapshot</h2>
        <span>
          Review your account portfolio, required payments, and financial
          priorities.
        </span>
      </header>

      {isAddingAccount || editingAccount ? (
        <AccountForm
          account={editingAccount ?? undefined}
          onCancel={handleCancelAccountForm}
          onSubmit={handleSaveAccount}
        />
      ) : (
        <AccountPortfolioView
          accounts={portfolioAccounts}
          onAddAccount={() => {
            setEditingAccount(null);
            setIsAddingAccount(true);
          }}
          onEditAccount={(account) => {
            setIsAddingAccount(false);
            setEditingAccount(account);
          }}
          onRemoveAccount={handleRemoveAccount}
        />
      )}

      <PaycheckPlanningView accounts={portfolioAccounts} />

      <FinancialModelLab
        selectedScenarioId={selectedScenarioId}
        scenarios={scenarios}
        onScenarioChange={setSelectedScenarioId}
        result={scenarioResult}
      />

      <FinancialModelLab
        selectedScenarioId={selectedScenarioId}
        scenarios={scenarios}
        onScenarioChange={setSelectedScenarioId}
        result={scenarioResult}
      />
    </section>
  );
}
