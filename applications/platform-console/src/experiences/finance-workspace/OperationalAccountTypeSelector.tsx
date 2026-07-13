import { useState } from "react";
import type { FinancialAccountType } from "@bsa/finance";

import "./OperationalAccountTypeSelector.css";

type OperationalAccountTypeSelectorProps = {
  onBack: () => void;
  onContinue: (accountType: FinancialAccountType) => void;
};

type AccountTypeOption = {
  accountType: FinancialAccountType;
  title: string;
  description: string;
  category: string;
};

const accountTypeOptions: readonly AccountTypeOption[] = [
  {
    accountType: "checking",
    title: "Checking Account",
    description: "Track cash held in an everyday transaction account.",
    category: "Asset account",
  },
  {
    accountType: "savings",
    title: "Savings Account",
    description: "Track cash held for reserves, goals, or future use.",
    category: "Asset account",
  },
  {
    accountType: "credit-card",
    title: "Credit Card",
    description:
      "Track a revolving balance, payment requirements, limit, and APR.",
    category: "Debt account",
  },
  {
    accountType: "loan",
    title: "Loan",
    description:
      "Track outstanding principal, payment requirements, and loan terms.",
    category: "Debt account",
  },
];

export function OperationalAccountTypeSelector({
  onBack,
  onContinue,
}: OperationalAccountTypeSelectorProps) {
  const [selectedAccountType, setSelectedAccountType] =
    useState<FinancialAccountType | null>(null);

  function handleContinue() {
    if (!selectedAccountType) {
      return;
    }

    onContinue(selectedAccountType);
  }

  return (
    <section className="operational-account-type-selector">
      <div className="operational-account-type-selector__header">
        <div>
          <span>Operational account intake</span>
          <h3>Add Financial Account</h3>
          <p>
            Choose the type of account you want to add. The next step will show
            only the fields that belong to that account type.
          </p>
        </div>
      </div>

      <div
        className="operational-account-type-selector__options"
        role="radiogroup"
        aria-label="Financial account type"
      >
        {accountTypeOptions.map((option) => {
          const isSelected = selectedAccountType === option.accountType;

          return (
            <label
              key={option.accountType}
              className={
                isSelected
                  ? "operational-account-type-selector__option operational-account-type-selector__option--selected"
                  : "operational-account-type-selector__option"
              }
            >
              <input
                type="radio"
                name="financial-account-type"
                value={option.accountType}
                checked={isSelected}
                onChange={() => setSelectedAccountType(option.accountType)}
              />

              <span className="operational-account-type-selector__control">
                <span
                  className="operational-account-type-selector__radio"
                  aria-hidden="true"
                />

                <span className="operational-account-type-selector__content">
                  <small>{option.category}</small>
                  <strong>{option.title}</strong>
                  <span>{option.description}</span>
                </span>
              </span>
            </label>
          );
        })}
      </div>

      <div className="operational-account-type-selector__actions">
        <button type="button" onClick={onBack}>
          Back
        </button>

        <button
          type="button"
          disabled={!selectedAccountType}
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </section>
  );
}
