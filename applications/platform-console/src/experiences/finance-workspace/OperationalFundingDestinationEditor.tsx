import {
  buildFundingAllocationProjection,
  isAssetFinancialAccount,
  type FinancialAccount,
  type FundingDepositAllocation,
  type FundingSource,
} from "@bsa/finance";
import { useMemo, useState, type FormEvent } from "react";

import "./OperationalFundingDestinationEditor.css";

export type FundingDestinationDraft = {
  destinationAccountId: string;
  amount: number;
};

type EditableAllocationRow = {
  destinationAccountId: string;
  amount: string;
};

type OperationalFundingDestinationEditorProps = {
  fundingSource: FundingSource;
  accounts: FinancialAccount[];
  existingAllocations: FundingDepositAllocation[];
  isSaving: boolean;
  operationError?: string;
  onCancel: () => void;
  onSave: (drafts: FundingDestinationDraft[]) => void;
};

function formatAmount(amount: number) {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function toCents(amount: number): number {
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

function fromCents(cents: number): number {
  return cents / 100;
}

function parsePositiveAmount(value: string): number | undefined {
  if (value.trim() === "") {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return fromCents(toCents(parsed));
}

function createInitialRows(
  existingAllocations: FundingDepositAllocation[],
): EditableAllocationRow[] {
  if (existingAllocations.length === 0) {
    return [
      {
        destinationAccountId: "",
        amount: "",
      },
    ];
  }

  return existingAllocations.map((allocation) => ({
    destinationAccountId: allocation.destinationAccountId,
    amount: allocation.amount.toFixed(2),
  }));
}

export function OperationalFundingDestinationEditor({
  fundingSource,
  accounts,
  existingAllocations,
  isSaving,
  operationError,
  onCancel,
  onSave,
}: OperationalFundingDestinationEditorProps) {
  const [rows, setRows] = useState<EditableAllocationRow[]>(() =>
    createInitialRows(existingAllocations),
  );

  const [validationMessage, setValidationMessage] = useState("");

  const destinationAccounts = useMemo(
    () =>
      accounts
        .filter(
          (account) =>
            account.status === "active" && isAssetFinancialAccount(account),
        )
        .sort((left, right) => left.name.localeCompare(right.name)),
    [accounts],
  );

  const validDrafts = useMemo(
    () =>
      rows.flatMap((row): FundingDestinationDraft[] => {
        const amount = parsePositiveAmount(row.amount);

        if (!row.destinationAccountId || amount === undefined) {
          return [];
        }

        return [
          {
            destinationAccountId: row.destinationAccountId,
            amount,
          },
        ];
      }),
    [rows],
  );

  const previewAllocations = useMemo<FundingDepositAllocation[]>(
    () =>
      validDrafts.map((draft, index) => ({
        id: `preview-${index}`,
        fundingSourceId: fundingSource.id,
        destinationAccountId: draft.destinationAccountId,
        amount: draft.amount,
        createdAt: "preview-created-at",
        updatedAt: "preview-updated-at",
      })),
    [fundingSource.id, validDrafts],
  );

  const projection = useMemo(
    () =>
      buildFundingAllocationProjection({
        accounts,
        fundingSources: [fundingSource],
        allocations: previewAllocations,
      }),
    [accounts, fundingSource, previewAllocations],
  );

  const sourceProjection = projection.sources[0];

  const allocatedAmount = sourceProjection?.allocatedAmount ?? 0;

  const remainingAmount =
    sourceProjection?.remainingAmount ?? fundingSource.amount;

  const isOverallocated = remainingAmount < 0;

  const isFullyAllocated = sourceProjection?.status === "fully-allocated";

  function updateRow(rowIndex: number, update: Partial<EditableAllocationRow>) {
    setRows((current) =>
      current.map((row, index) =>
        index === rowIndex
          ? {
              ...row,
              ...update,
            }
          : row,
      ),
    );

    setValidationMessage("");
  }

  function addRow() {
    setRows((current) => [
      ...current,
      {
        destinationAccountId: "",
        amount: "",
      },
    ]);

    setValidationMessage("");
  }

  function removeRow(rowIndex: number) {
    setRows((current) => {
      const remainingRows = current.filter((_, index) => index !== rowIndex);

      return remainingRows.length > 0
        ? remainingRows
        : [
            {
              destinationAccountId: "",
              amount: "",
            },
          ];
    });

    setValidationMessage("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const incompleteRows = rows.filter(
      (row) => Boolean(row.destinationAccountId) !== Boolean(row.amount.trim()),
    );

    if (incompleteRows.length > 0) {
      setValidationMessage(
        "Each destination row must include both an account and an amount.",
      );

      return;
    }

    const invalidAmountExists = rows.some(
      (row) =>
        row.amount.trim() !== "" &&
        parsePositiveAmount(row.amount) === undefined,
    );

    if (invalidAmountExists) {
      setValidationMessage(
        "Every entered allocation must be greater than zero.",
      );

      return;
    }

    const destinationAccountIds = validDrafts.map(
      (draft) => draft.destinationAccountId,
    );

    if (new Set(destinationAccountIds).size !== destinationAccountIds.length) {
      setValidationMessage(
        "Each destination account may only be used once for this funding source.",
      );

      return;
    }

    if (isOverallocated) {
      setValidationMessage(
        "Allocated destinations exceed the total funding source amount.",
      );

      return;
    }

    onSave(validDrafts);
  }

  return (
    <section className="operational-funding-destination-editor">
      <div className="operational-funding-destination-editor__header">
        <div>
          <span>Incoming cash destinations</span>

          <h3>Assign {fundingSource.title}</h3>

          <p>
            Direct every cent of this funding source into one or more active
            checking or savings accounts.
          </p>
        </div>

        <div className="operational-funding-destination-editor__source-total">
          <span>Total Expected Cash</span>

          <strong>{formatAmount(fundingSource.amount)}</strong>

          <small>Available {fundingSource.expectedOn}</small>
        </div>
      </div>

      {destinationAccounts.length === 0 ? (
        <div className="operational-funding-destination-editor__empty">
          <strong>No active asset accounts available</strong>

          <p>
            Add an active checking or savings account before assigning this
            funding source.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="operational-funding-destination-editor__rows">
            {rows.map((row, rowIndex) => (
              <div
                className="operational-funding-destination-editor__row"
                key={rowIndex}
              >
                <label>
                  Destination account
                  <select
                    value={row.destinationAccountId}
                    onChange={(event) =>
                      updateRow(rowIndex, {
                        destinationAccountId: event.target.value,
                      })
                    }
                  >
                    <option value="">Select an asset account</option>

                    {destinationAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name} · {account.institutionName}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Allocation amount
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={row.amount}
                    onChange={(event) =>
                      updateRow(rowIndex, {
                        amount: event.target.value,
                      })
                    }
                    placeholder="0.00"
                  />
                </label>

                <button
                  type="button"
                  className="operational-funding-destination-editor__remove-row"
                  onClick={() => removeRow(rowIndex)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="operational-funding-destination-editor__add-row"
            onClick={addRow}
          >
            Add another destination
          </button>

          <div className="operational-funding-destination-editor__summary">
            <article>
              <span>Funding Source Total</span>

              <strong>{formatAmount(fundingSource.amount)}</strong>
            </article>

            <article>
              <span>Allocated</span>

              <strong>{formatAmount(allocatedAmount)}</strong>
            </article>

            <article
              className={
                isOverallocated
                  ? "operational-funding-destination-editor__summary--error"
                  : remainingAmount === 0
                    ? "operational-funding-destination-editor__summary--complete"
                    : ""
              }
            >
              <span>{isOverallocated ? "Overallocated" : "Remaining"}</span>

              <strong>{formatAmount(Math.abs(remainingAmount))}</strong>
            </article>

            <article>
              <span>Routing Status</span>

              <strong>
                {isFullyAllocated
                  ? "Fully allocated"
                  : isOverallocated
                    ? "Overallocated"
                    : allocatedAmount > 0
                      ? "Partially allocated"
                      : "Unallocated"}
              </strong>
            </article>
          </div>

          {!isFullyAllocated ? (
            <p className="operational-funding-destination-editor__notice">
              Draft routing may be saved, but account-aware planning remains
              blocked until the remaining amount is exactly $0.00.
            </p>
          ) : (
            <p className="operational-funding-destination-editor__success">
              Every cent has a valid destination. Account-aware planning may
              continue.
            </p>
          )}

          {validationMessage ? (
            <p className="operational-funding-destination-editor__error">
              {validationMessage}
            </p>
          ) : null}

          {operationError ? (
            <p className="operational-funding-destination-editor__error">
              {operationError}
            </p>
          ) : null}

          <div className="operational-funding-destination-editor__actions">
            <button type="button" onClick={onCancel} disabled={isSaving}>
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSaving || destinationAccounts.length === 0 || isOverallocated
              }
            >
              {isSaving
                ? "Saving routing…"
                : isFullyAllocated
                  ? "Save completed routing"
                  : "Save routing draft"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
