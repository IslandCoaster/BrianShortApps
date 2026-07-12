import { useState, type FormEvent } from "react";
import { Link } from "react-router";

import { ProductHero } from "../../components/product-hero/ProductHero";

type FirstRunExperienceProps = {
  onEstablishCurrentCashPosition: (amount: number) => Promise<void>;
};

function parseCurrencyAmount(value: string): number | null {
  const normalizedValue = value.replaceAll(",", "").trim();

  if (normalizedValue.length === 0) {
    return null;
  }

  const amount = Number(normalizedValue);

  if (!Number.isFinite(amount) || amount < 0) {
    return null;
  }

  return Math.round(amount * 100) / 100;
}

export function FirstRunExperience({
  onEstablishCurrentCashPosition,
}: FirstRunExperienceProps) {
  const [amount, setAmount] = useState("");
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedAmount = parseCurrencyAmount(amount);

    if (parsedAmount === null) {
      setValidationMessage(
        "Enter a valid current cash position of zero or greater.",
      );
      return;
    }

    setValidationMessage(null);
    setIsSubmitting(true);

    try {
      await onEstablishCurrentCashPosition(parsedAmount);
    } catch (error) {
      setValidationMessage(
        error instanceof Error
          ? error.message
          : "Your current cash position could not be saved.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <main className="personal-finance-page">
      <div className="personal-finance-page__container">
        <ProductHero
          eyebrow="BrianShortApps Personal Finance"
          title="Welcome to Personal Finance"
          description="Let's establish your current financial position."
          actions={<Link to="/">Engineering workspace</Link>}
        />

        <section
          className="personal-finance-page__first-run"
          aria-labelledby="personal-finance-first-run-title"
        >
          <div className="personal-finance-page__first-run-copy">
            <span>First step</span>

            <h2 id="personal-finance-first-run-title">
              Current Cash Position
            </h2>

            <p>
              Enter the cash currently available to you. This becomes the first
              immutable event in your operational financial history.
            </p>

            <p>
              Use zero if you are beginning without available cash. You can
              still add accounts and record future activity afterward.
            </p>
          </div>

          <form
            className="personal-finance-page__current-cash-form"
            onSubmit={handleSubmit}
          >
            <label htmlFor="current-cash-position">
              Current Cash Position
            </label>

            <div className="personal-finance-page__currency-input">
              <span aria-hidden="true">$</span>

              <input
                id="current-cash-position"
                name="currentCashPosition"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.00"
                value={amount}
                disabled={isSubmitting}
                aria-describedby={
                  validationMessage ? "current-cash-position-error" : undefined
                }
                aria-invalid={validationMessage ? true : undefined}
                onChange={(event) => {
                  setAmount(event.target.value);

                  if (validationMessage) {
                    setValidationMessage(null);
                  }
                }}
              />
            </div>

            {validationMessage ? (
              <p
                id="current-cash-position-error"
                className="personal-finance-page__current-cash-error"
                role="alert"
              >
                {validationMessage}
              </p>
            ) : null}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Establishing position..."
                : "Establish current cash position"}
            </button>

            <small>
              After this step, you can add financial accounts and begin daily
              financial tracking.
            </small>
          </form>
        </section>
      </div>
    </main>
  );
}
