import { useState, type FormEvent } from "react";
import type {
  PortfolioAccountStatus,
  PortfolioAccountSummary,
  PortfolioDataStatus,
  PortfolioProductType,
} from "./portfolio.types";

type AccountFormProps = {
  account?: PortfolioAccountSummary;
  onCancel: () => void;
  onSubmit: (account: PortfolioAccountSummary) => void;
};

type AccountFormState = {
  institution: string;
  accountName: string;
  productType: PortfolioProductType;
  accountStatus: PortfolioAccountStatus;
  dataStatus: PortfolioDataStatus;
  asOfDate: string;
  currentBalance: string;
  statementBalance: string;
  minimumPaymentDue: string;
  paymentDueDate: string;
  aprPercent: string;
  creditLimit: string;
  originalPrincipal: string;
  notes: string;
};

const initialState: AccountFormState = {
  institution: "",
  accountName: "",
  productType: "credit-card",
  accountStatus: "unknown",
  dataStatus: "manually-entered",
  asOfDate: "",
  currentBalance: "",
  statementBalance: "",
  minimumPaymentDue: "",
  paymentDueDate: "",
  aprPercent: "",
  creditLimit: "",
  originalPrincipal: "",
  notes: "",
};

function createInitialState(
  account?: PortfolioAccountSummary,
): AccountFormState {
  if (!account) {
    return initialState;
  }

  return {
    institution: account.institution,
    accountName: account.accountName,
    productType: account.productType,
    accountStatus: account.accountStatus,
    dataStatus: account.dataStatus,
    asOfDate: account.asOfDate,
    currentBalance: String(account.currentBalance),
    statementBalance:
      account.statementBalance === undefined
        ? ""
        : String(account.statementBalance),
    minimumPaymentDue:
      account.minimumPaymentDue === undefined
        ? ""
        : String(account.minimumPaymentDue),
    paymentDueDate: account.paymentDueDate ?? "",
    aprPercent:
      account.aprPercent === undefined ? "" : String(account.aprPercent),
    creditLimit:
      account.creditLimit === undefined ? "" : String(account.creditLimit),
    originalPrincipal:
      account.originalPrincipal === undefined
        ? ""
        : String(account.originalPrincipal),
    notes: account.notes ?? "",
  };
}

function optionalNumber(value: string) {
  if (value.trim() === "") {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

export function AccountForm({ account, onCancel, onSubmit }: AccountFormProps) {
  const [formState, setFormState] = useState(() => createInitialState(account));
  const [validationMessage, setValidationMessage] = useState("");

  function updateField<K extends keyof AccountFormState>(
    field: K,
    value: AccountFormState[K],
  ) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const currentBalance = Number(formState.currentBalance);

    if (
      !formState.institution.trim() ||
      !formState.accountName.trim() ||
      !formState.asOfDate ||
      !Number.isFinite(currentBalance)
    ) {
      setValidationMessage(
        "Institution, account name, as-of date, and current balance are required.",
      );
      return;
    }

    const submittedAccount: PortfolioAccountSummary = {
      id: account?.id ?? crypto.randomUUID(),
      institution: formState.institution.trim(),
      accountName: formState.accountName.trim(),
      productType: formState.productType,
      accountStatus: formState.accountStatus,
      dataStatus: formState.dataStatus,
      asOfDate: formState.asOfDate,
      currentBalance,
      statementBalance: optionalNumber(formState.statementBalance),
      minimumPaymentDue: optionalNumber(formState.minimumPaymentDue),
      paymentDueDate: formState.paymentDueDate || undefined,
      aprPercent: optionalNumber(formState.aprPercent),
      creditLimit: optionalNumber(formState.creditLimit),
      originalPrincipal: optionalNumber(formState.originalPrincipal),
      notes: formState.notes.trim() || undefined,
    };

    onSubmit(submittedAccount);
  }

  return (
    <section className="finance-workspace__account-form">
      <div className="finance-workspace__section-header">
        <div>
          <p>{account ? "Edit Account" : "Add Account"}</p>
          <span>
            {account
              ? "Update the reviewed financial snapshot"
              : "Enter a reviewed financial snapshot"}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Account identity</legend>

          <label>
            Institution
            <input
              value={formState.institution}
              onChange={(event) =>
                updateField("institution", event.target.value)
              }
              placeholder="Capital One"
            />
          </label>

          <label>
            Account name
            <input
              value={formState.accountName}
              onChange={(event) =>
                updateField("accountName", event.target.value)
              }
              placeholder="QuicksilverOne"
            />
          </label>

          <label>
            Product type
            <select
              value={formState.productType}
              onChange={(event) =>
                updateField(
                  "productType",
                  event.target.value as PortfolioProductType,
                )
              }
            >
              <option value="credit-card">Credit card</option>
              <option value="charge-card">Charge card</option>
              <option value="store-card">Store card</option>
              <option value="student-loan">Student loan</option>
            </select>
          </label>

          <label>
            Account status
            <select
              value={formState.accountStatus}
              onChange={(event) =>
                updateField(
                  "accountStatus",
                  event.target.value as PortfolioAccountStatus,
                )
              }
            >
              <option value="unknown">Unknown</option>
              <option value="current">Current</option>
              <option value="past-due">Past due</option>
              <option value="paid-off">Paid off</option>
            </select>
          </label>
        </fieldset>

        <fieldset>
          <legend>Financial snapshot</legend>

          <label>
            As-of date
            <input
              type="date"
              value={formState.asOfDate}
              onChange={(event) => updateField("asOfDate", event.target.value)}
            />
          </label>

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
            Statement balance
            <input
              type="number"
              min="0"
              step="0.01"
              value={formState.statementBalance}
              onChange={(event) =>
                updateField("statementBalance", event.target.value)
              }
              placeholder="Optional"
            />
          </label>

          <label>
            Minimum payment due
            <input
              type="number"
              min="0"
              step="0.01"
              value={formState.minimumPaymentDue}
              onChange={(event) =>
                updateField("minimumPaymentDue", event.target.value)
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
            Original principal
            <input
              type="number"
              min="0"
              step="0.01"
              value={formState.originalPrincipal}
              onChange={(event) =>
                updateField("originalPrincipal", event.target.value)
              }
              placeholder="Loans only"
            />
          </label>
        </fieldset>

        <label className="finance-workspace__account-form-notes">
          Notes
          <textarea
            value={formState.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            rows={4}
            placeholder="Account rules, repayment phase, promotional details, or other notes."
          />
        </label>

        {validationMessage ? (
          <p className="finance-workspace__account-form-error">
            {validationMessage}
          </p>
        ) : null}

        <div className="finance-workspace__account-form-actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>

          <button type="submit">
            {account ? "Save changes" : "Add account"}
          </button>
        </div>
      </form>
    </section>
  );
}
