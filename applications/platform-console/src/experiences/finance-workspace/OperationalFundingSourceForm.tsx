import { useState, type FormEvent } from "react";

import "./OperationalFundingSourceForm.css";

export type OperationalPaycheckFundingSourceDraft = {
  fundingSourceType: "paycheck";
  title: string;
  employerName: string;
  amount: number;
  expectedOn: string;
  notes?: string;
};

type OperationalFundingSourceFormProps = {
  onCancel: () => void;
  onSubmit: (draft: OperationalPaycheckFundingSourceDraft) => void;
};

type FundingSourceFormState = {
  title: string;
  employerName: string;
  amount: string;
  expectedOn: string;
  notes: string;
};

const initialState: FundingSourceFormState = {
  title: "",
  employerName: "",
  amount: "",
  expectedOn: "",
  notes: "",
};

function parseRequiredPositiveNumber(value: string): number | undefined {
  if (value.trim() === "") {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

function optionalTrimmedString(value: string): string | undefined {
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

export function OperationalFundingSourceForm({
  onCancel,
  onSubmit,
}: OperationalFundingSourceFormProps) {
  const [formState, setFormState] =
    useState<FundingSourceFormState>(initialState);

  const [validationMessage, setValidationMessage] = useState("");

  function updateField<K extends keyof FundingSourceFormState>(
    field: K,
    value: FundingSourceFormState[K],
  ) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));

    setValidationMessage("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amount = parseRequiredPositiveNumber(formState.amount);

    if (formState.title.trim() === "" || formState.employerName.trim() === "") {
      setValidationMessage("Paycheck title and employer are required.");

      return;
    }

    if (amount === undefined) {
      setValidationMessage(
        "Expected net pay is required and must be greater than zero.",
      );

      return;
    }

    if (!formState.expectedOn) {
      setValidationMessage("Expected availability date is required.");

      return;
    }

    onSubmit({
      fundingSourceType: "paycheck",
      title: formState.title.trim(),
      employerName: formState.employerName.trim(),
      amount,
      expectedOn: formState.expectedOn,
      notes: optionalTrimmedString(formState.notes),
    });
  }

  return (
    <section className="operational-funding-source-form">
      <div className="operational-funding-source-form__header">
        <div>
          <span>Operational future cash intake</span>

          <h3>Add Expected Paycheck</h3>

          <p>
            Record incoming net pay that is expected to become available for
            future funding decisions.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Paycheck identity</legend>

          <div className="operational-funding-source-form__grid">
            <label>
              Funding source title
              <input
                value={formState.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="American Airlines Paycheck"
              />
            </label>

            <label>
              Employer
              <input
                value={formState.employerName}
                onChange={(event) =>
                  updateField("employerName", event.target.value)
                }
                placeholder="American Airlines"
              />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Expected cash</legend>

          <div className="operational-funding-source-form__grid">
            <label>
              Expected net pay
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={formState.amount}
                onChange={(event) => updateField("amount", event.target.value)}
                placeholder="0.00"
              />
            </label>

            <label>
              Expected availability date
              <input
                type="date"
                value={formState.expectedOn}
                onChange={(event) =>
                  updateField("expectedOn", event.target.value)
                }
              />
              <small>
                The date the net funds are expected to become available for
                allocation.
              </small>
            </label>
          </div>
        </fieldset>

        <label className="operational-funding-source-form__notes">
          Notes
          <textarea
            value={formState.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            rows={4}
            placeholder="Optional paycheck details or planning notes."
          />
        </label>

        {validationMessage ? (
          <p className="operational-funding-source-form__error">
            {validationMessage}
          </p>
        ) : null}

        <div className="operational-funding-source-form__actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>

          <button type="submit">Add paycheck</button>
        </div>
      </form>
    </section>
  );
}
