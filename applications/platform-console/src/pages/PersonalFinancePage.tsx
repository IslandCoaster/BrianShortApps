import { useState } from "react";
import { Link } from "react-router";

import { AccountForm } from "../experiences/finance-workspace/AccountForm";
import { AccountPortfolioView } from "../experiences/finance-workspace/AccountPortfolioView";
import { PaycheckPlanningView } from "../experiences/finance-workspace/PaycheckPlanningView";
import { portfolioAccountSnapshots } from "../experiences/finance-workspace/portfolio.snapshots";
import type { PortfolioAccountSummary } from "../experiences/finance-workspace/portfolio.types";

import "../experiences/finance-workspace/FinanceWorkspace.css";

export function PersonalFinancePage() {
  <Link to="/">Return to Engineering Workspace</Link>;
  const [portfolioAccounts, setPortfolioAccounts] = useState<
    PortfolioAccountSummary[]
  >(portfolioAccountSnapshots);

  const [isAddingAccount, setIsAddingAccount] = useState(false);

  const [editingAccount, setEditingAccount] =
    useState<PortfolioAccountSummary | null>(null);

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
    <main className="finance-workspace">
      <header className="finance-workspace__header">
        <p>BrianShortApps Personal Finance</p>
        <h1>Your Financial Plan</h1>
        <span>
          Review your accounts, protect your cash reserve, and build a
          timing-aware plan for upcoming payments.
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
    </main>
  );
}
