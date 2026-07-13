import { useState, type FormEvent } from "react";
import type { ObligationCadence } from "@bsa/finance";

import "./OperationalObligationForm.css";

export type OperationalUtilityObligationDraft = {
  obligationType: "utility";
  name: string;
  provider: string;
  amountDue: number;
  dueDate?: string;
  cadence: ObligationCadence;
  referenceNumber?: string;
  notes?: string;
};

type OperationalObligationFormProps = {
  onCancel: () => void;
  onSubmit: (draft: OperationalUtilityObligationDraft) => void;
};

type OperationalObligationFormState = {
  name: string;
  provider: string;
  amountDue: string;
  dueDate?: string;
  cadence: ObligationCadence;
  referenceNumber: string;
  notes: string;
};

const initialState: OperationalObligationFormState = {
  name: "",
  provider: "",
  amountDue: "",
  dueDate: "",
  cadence: "monthly",
  referenceNumber: "",
  notes: "",
};

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

function optionalTrimmedString(value: string): string | undefined {
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

export function OperationalObligationForm({
  onCancel,
  onSubmit,
}: OperationalObligationFormProps) {
  const [formState, setFormState] =
    useState<OperationalObligationFormState>(initialState);

  const [validationMessage, setValidationMessage] = useState("");

  function updateField<K extends keyof OperationalObligationFormState>(
    field: K,
    value: OperationalObligationFormState[K],
  ) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));

    setValidationMessage("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amountDue = parseRequiredNonNegativeNumber(formState.amountDue);

    if (formState.name.trim() === "" || formState.provider.trim() === "") {
      setValidationMessage("Obligation name and provider are required.");

      return;
    }

    if (amountDue === undefined) {
      setValidationMessage(
        "Amount due is required and must be zero or greater.",
      );

      return;
    }

    onSubmit({
      obligationType: "utility",
      name: formState.name.trim(),
      provider: formState.provider.trim(),
      amountDue,
      dueDate: formState.dueDate || undefined,
      cadence: formState.cadence,
      referenceNumber: optionalTrimmedString(formState.referenceNumber),
      notes: optionalTrimmedString(formState.notes),
    });
  }

  return (
    <section className="operational-obligation-form">
      <div className="operational-obligation-form__header">
        <div>
          <span>Operational obligation intake</span>

          <h3>Add Utility Obligation</h3>

          <p>
            Enter the current known amount and billing cadence. Add the next due
            date only when the provider has established it.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Obligation identity</legend>

          <div className="operational-obligation-form__grid">
            <label>
              Obligation name
              <input
                value={formState.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Electric Service"
              />
            </label>

            <label>
              Provider
              <input
                value={formState.provider}
                onChange={(event) =>
                  updateField("provider", event.target.value)
                }
                placeholder="Utility provider"
              />
            </label>

            <label>
              Account or reference number
              <input
                value={formState.referenceNumber}
                onChange={(event) =>
                  updateField("referenceNumber", event.target.value)
                }
                placeholder="Optional"
              />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Payment requirement</legend>

          <div className="operational-obligation-form__grid">
            <label>
              Amount due
              <input
                type="number"
                min="0"
                step="0.01"
                value={formState.amountDue}
                onChange={(event) =>
                  updateField("amountDue", event.target.value)
                }
                placeholder="0.00"
              />
            </label>

            <label>
              Next known due date
              <input
                type="date"
                value={formState.dueDate}
                onChange={(event) => updateField("dueDate", event.target.value)}
              />
              <small>
                Optional. Leave blank when the provider has not yet established
                the next exact due date or when the billing date varies.
              </small>
            </label>

            <label>
              Recurring cadence
              <select
                value={formState.cadence}
                onChange={(event) =>
                  updateField(
                    "cadence",
                    event.target.value as ObligationCadence,
                  )
                }
              >
                <option value="one-time">One time</option>

                <option value="weekly">Weekly</option>

                <option value="biweekly">Every two weeks</option>

                <option value="monthly">Monthly</option>

                <option value="quarterly">Quarterly</option>

                <option value="annually">Annually</option>
              </select>
            </label>
          </div>
        </fieldset>

        <label className="operational-obligation-form__notes">
          Notes
          <textarea
            value={formState.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            rows={4}
            placeholder="Optional billing details or reminders."
          />
        </label>

        {validationMessage ? (
          <p className="operational-obligation-form__error">
            {validationMessage}
          </p>
        ) : null}

        <div className="operational-obligation-form__actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>

          <button type="submit">Review obligation</button>
        </div>
      </form>
    </section>
  );
}
