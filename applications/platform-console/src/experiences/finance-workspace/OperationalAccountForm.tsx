import { useState, type FormEvent } from "react";
import type { FinancialAccountType } from "@bsa/finance";

import "./OperationalAccountForm.css";

export type OperationalAccountDraft =
  | {
      accountType: "checking";
      name: string;
      institutionName: string;
      currentBalance: number;
      accountSuffix?: string;
      notes?: string;
    }
  | {
      accountType: "savings";
      name: string;
      institutionName: string;
      currentBalance: number;
      accountSuffix?: string;
      notes?: string;
    }
  | {
      accountType: "credit-card";
      name: string;
      institutionName: string;
      currentBalance: number;
      creditLimit?: number;
      minimumPayment?: number;
      paymentDueDate?: string;
      statementDate?: string;
      aprPercent?: number;
      accountSuffix?: string;
      notes?: string;
    }
  | {
      accountType: "loan";
      name: string;
      institutionName: string;
      currentPrincipal: number;
      originalPrincipal?: number;
      minimumPayment?: number;
      paymentDueDate?: string;
      interestRatePercent?: number;
      maturityDate?: string;
      accountSuffix?: string;
      notes?: string;
    };

type OperationalAccountFormProps = {
  accountType: FinancialAccountType;
  onBack: () => void;
  onCancel: () => void;
  onSubmit: (draft: OperationalAccountDraft) => void;
};

type AccountFormState = {
  name: string;
  institutionName: string;
  currentBalance: string;
  currentPrincipal: string;
  creditLimit: string;
  originalPrincipal: string;
  minimumPayment: string;
  paymentDueDate: string;
  statementDate: string;
  aprPercent: string;
  interestRatePercent: string;
  maturityDate: string;
  accountSuffix: string;
  notes: string;
};

const initialState: AccountFormState = {
  name: "",
  institutionName: "",
  currentBalance: "",
  currentPrincipal: "",
  creditLimit: "",
  originalPrincipal: "",
  minimumPayment: "",
  paymentDueDate: "",
  statementDate: "",
  aprPercent: "",
  interestRatePercent: "",
  maturityDate: "",
  accountSuffix: "",
  notes: "",
};

function formatAccountType(accountType: FinancialAccountType) {
  switch (accountType) {
    case "checking":
      return "Checking Account";

    case "savings":
      return "Savings Account";

    case "credit-card":
      return "Credit Card";

    case "loan":
      return "Loan";
  }
}

function parseRequiredNonNegativeNumber(value: string): number | undefined {
  if (value.trim() === "") {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

function parseOptionalNonNegativeNumber(value: string): number | undefined {
  if (value.trim() === "") {
    return undefined;
  }

  return parseRequiredNonNegativeNumber(value);
}

function optionalTrimmedString(value: string): string | undefined {
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

export function OperationalAccountForm({
  accountType,
  onBack,
  onCancel,
  onSubmit,
}: OperationalAccountFormProps) {
  const [formState, setFormState] = useState<AccountFormState>(initialState);

  const [validationMessage, setValidationMessage] = useState("");

  function updateField<K extends keyof AccountFormState>(
    field: K,
    value: AccountFormState[K],
  ) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));

    setValidationMessage("");
  }

  function validateIdentity(): boolean {
    if (
      formState.name.trim() === "" ||
      formState.institutionName.trim() === ""
    ) {
      setValidationMessage(
        "Account name and financial institution are required.",
      );

      return false;
    }

    return true;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateIdentity()) {
      return;
    }

    const commonFields = {
      name: formState.name.trim(),
      institutionName: formState.institutionName.trim(),
      accountSuffix: optionalTrimmedString(formState.accountSuffix),
      notes: optionalTrimmedString(formState.notes),
    };

    switch (accountType) {
      case "checking":
      case "savings": {
        const currentBalance = parseRequiredNonNegativeNumber(
          formState.currentBalance,
        );

        if (currentBalance === undefined) {
          setValidationMessage(
            "Current balance is required and must be zero or greater.",
          );

          return;
        }

        onSubmit({
          ...commonFields,
          accountType,
          currentBalance,
        });

        return;
      }

      case "credit-card": {
        const currentBalance = parseRequiredNonNegativeNumber(
          formState.currentBalance,
        );

        if (currentBalance === undefined) {
          setValidationMessage(
            "Current balance is required and must be zero or greater.",
          );

          return;
        }

        onSubmit({
          ...commonFields,
          accountType: "credit-card",
          currentBalance,
          creditLimit: parseOptionalNonNegativeNumber(formState.creditLimit),
          minimumPayment: parseOptionalNonNegativeNumber(
            formState.minimumPayment,
          ),
          paymentDueDate: formState.paymentDueDate || undefined,
          statementDate: formState.statementDate || undefined,
          aprPercent: parseOptionalNonNegativeNumber(formState.aprPercent),
        });

        return;
      }

      case "loan": {
        const currentPrincipal = parseRequiredNonNegativeNumber(
          formState.currentPrincipal,
        );

        if (currentPrincipal === undefined) {
          setValidationMessage(
            "Current principal is required and must be zero or greater.",
          );

          return;
        }

        onSubmit({
          ...commonFields,
          accountType: "loan",
          currentPrincipal,
          originalPrincipal: parseOptionalNonNegativeNumber(
            formState.originalPrincipal,
          ),
          minimumPayment: parseOptionalNonNegativeNumber(
            formState.minimumPayment,
          ),
          paymentDueDate: formState.paymentDueDate || undefined,
          interestRatePercent: parseOptionalNonNegativeNumber(
            formState.interestRatePercent,
          ),
          maturityDate: formState.maturityDate || undefined,
        });

        return;
      }
    }
  }

  const isAssetAccount =
    accountType === "checking" || accountType === "savings";

  return (
    <section className="operational-account-form">
      <div className="operational-account-form__header">
        <div>
          <span>Operational account intake</span>

          <h3>Add {formatAccountType(accountType)}</h3>

          <p>
            Enter the current operational information for this account. Only
            fields relevant to this account type are shown.
          </p>
        </div>

        <button type="button" onClick={onBack}>
          Change account type
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Account identity</legend>

          <div className="operational-account-form__grid">
            <label>
              Financial institution
              <input
                value={formState.institutionName}
                onChange={(event) =>
                  updateField("institutionName", event.target.value)
                }
                placeholder="Example Bank"
              />
            </label>

            <label>
              Account name
              <input
                value={formState.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder={
                  isAssetAccount
                    ? "Primary Checking"
                    : accountType === "credit-card"
                      ? "Rewards Card"
                      : "Personal Loan"
                }
              />
            </label>

            <label>
              Account suffix
              <input
                value={formState.accountSuffix}
                onChange={(event) =>
                  updateField("accountSuffix", event.target.value)
                }
                placeholder="Last four digits, optional"
                maxLength={8}
              />
            </label>
          </div>
        </fieldset>

        {isAssetAccount ? (
          <fieldset>
            <legend>Current account position</legend>

            <div className="operational-account-form__grid">
              <label>
                Current balance
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.currentBalance}
                  onChange={(event) =>
                    updateField("currentBalance", event.target.value)
                  }
                  placeholder="0.00"
                />
              </label>
            </div>
          </fieldset>
        ) : null}

        {accountType === "credit-card" ? (
          <fieldset>
            <legend>Credit account details</legend>

            <div className="operational-account-form__grid">
              <label>
                Current balance
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.currentBalance}
                  onChange={(event) =>
                    updateField("currentBalance", event.target.value)
                  }
                  placeholder="0.00"
                />
              </label>

              <label>
                Credit limit
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.creditLimit}
                  onChange={(event) =>
                    updateField("creditLimit", event.target.value)
                  }
                  placeholder="Optional"
                />
              </label>

              <label>
                Minimum payment
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.minimumPayment}
                  onChange={(event) =>
                    updateField("minimumPayment", event.target.value)
                  }
                  placeholder="Optional"
                />
              </label>

              <label>
                Payment due date
                <input
                  type="date"
                  value={formState.paymentDueDate}
                  onChange={(event) =>
                    updateField("paymentDueDate", event.target.value)
                  }
                />
              </label>

              <label>
                Statement date
                <input
                  type="date"
                  value={formState.statementDate}
                  onChange={(event) =>
                    updateField("statementDate", event.target.value)
                  }
                />
              </label>

              <label>
                APR
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.aprPercent}
                  onChange={(event) =>
                    updateField("aprPercent", event.target.value)
                  }
                  placeholder="Optional"
                />
              </label>
            </div>
          </fieldset>
        ) : null}

        {accountType === "loan" ? (
          <fieldset>
            <legend>Loan details</legend>

            <div className="operational-account-form__grid">
              <label>
                Current principal
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.currentPrincipal}
                  onChange={(event) =>
                    updateField("currentPrincipal", event.target.value)
                  }
                  placeholder="0.00"
                />
              </label>

              <label>
                Original principal
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.originalPrincipal}
                  onChange={(event) =>
                    updateField("originalPrincipal", event.target.value)
                  }
                  placeholder="Optional"
                />
              </label>

              <label>
                Minimum payment
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.minimumPayment}
                  onChange={(event) =>
                    updateField("minimumPayment", event.target.value)
                  }
                  placeholder="Optional"
                />
              </label>

              <label>
                Payment due date
                <input
                  type="date"
                  value={formState.paymentDueDate}
                  onChange={(event) =>
                    updateField("paymentDueDate", event.target.value)
                  }
                />
              </label>

              <label>
                Interest rate
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.interestRatePercent}
                  onChange={(event) =>
                    updateField("interestRatePercent", event.target.value)
                  }
                  placeholder="Optional"
                />
              </label>

              <label>
                Maturity date
                <input
                  type="date"
                  value={formState.maturityDate}
                  onChange={(event) =>
                    updateField("maturityDate", event.target.value)
                  }
                />
              </label>
            </div>
          </fieldset>
        ) : null}

        <label className="operational-account-form__notes">
          Notes
          <textarea
            value={formState.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            rows={4}
            placeholder="Optional account details or reminders."
          />
        </label>

        {validationMessage ? (
          <p className="operational-account-form__error">{validationMessage}</p>
        ) : null}

        <div className="operational-account-form__actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>

          <button type="submit">Review account</button>
        </div>
      </form>
    </section>
  );
}
