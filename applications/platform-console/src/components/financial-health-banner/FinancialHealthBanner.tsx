import "./FinancialHealthBanner.css";

export type FinancialHealthStatus = "attention" | "incomplete" | "ready";

type FinancialHealthBannerProps = {
  status: FinancialHealthStatus;
  title: string;
  description: string;

  knownRequiredPayments: number;
  pastDueAccounts: number;
  nextObligationDate?: string;
  unknownPaymentAmounts: number;
};

function formatAmount(amount: number) {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatStatusLabel(status: FinancialHealthStatus) {
  switch (status) {
    case "attention":
      return "Attention required";

    case "incomplete":
      return "Planning data incomplete";

    case "ready":
      return "Ready to plan";
  }
}

export function FinancialHealthBanner({
  status,
  title,
  description,
  knownRequiredPayments,
  pastDueAccounts,
  nextObligationDate,
  unknownPaymentAmounts,
}: FinancialHealthBannerProps) {
  return (
    <section
      className={`financial-health-banner financial-health-banner--${status}`}
    >
      <div className="financial-health-banner__message">
        <span className="financial-health-banner__status">
          {formatStatusLabel(status)}
        </span>

        <h2>{title}</h2>

        <p>{description}</p>
      </div>

      <dl className="financial-health-banner__metrics">
        <div>
          <dt>Known required payments</dt>
          <dd>{formatAmount(knownRequiredPayments)}</dd>
        </div>

        <div>
          <dt>Past-due accounts</dt>
          <dd>{pastDueAccounts}</dd>
        </div>

        <div>
          <dt>Next known obligation</dt>
          <dd>{nextObligationDate ?? "Not entered"}</dd>
        </div>

        <div>
          <dt>Unknown payment amounts</dt>
          <dd>{unknownPaymentAmounts}</dd>
        </div>
      </dl>
    </section>
  );
}
