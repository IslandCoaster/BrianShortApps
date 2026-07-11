import type { PortfolioAccountSummary } from "./portfolio.types";

type UpcomingObligationsViewProps = {
  accounts: PortfolioAccountSummary[];
};

type UpcomingObligation = {
  accountId: string;
  accountName: string;
  institution: string;
  dueDate: string;
  amount?: number;
  accountStatus: PortfolioAccountSummary["accountStatus"];
};

function formatAmount(amount?: number) {
  if (amount === undefined) {
    return "Amount not entered";
  }

  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function createUpcomingObligations(
  accounts: PortfolioAccountSummary[],
): UpcomingObligation[] {
  return accounts
    .filter(
      (account) =>
        account.accountStatus !== "paid-off" && account.paymentDueDate,
    )
    .map((account) => ({
      accountId: account.id,
      accountName: account.accountName,
      institution: account.institution,
      dueDate: account.paymentDueDate as string,
      amount: account.minimumPaymentDue,
      accountStatus: account.accountStatus,
    }))
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate));
}

export function UpcomingObligationsView({
  accounts,
}: UpcomingObligationsViewProps) {
  const obligations = createUpcomingObligations(accounts);

  return (
    <section className="finance-workspace__upcoming-obligations">
      <div className="finance-workspace__section-header">
        <div>
          <p>Upcoming Obligations</p>
          <span>Known payments ordered by due date</span>
        </div>

        <span>{obligations.length} payments tracked</span>
      </div>

      {obligations.length === 0 ? (
        <div className="finance-workspace__empty-state">
          <strong>No payment obligations entered</strong>
          <p>Add due dates and payment amounts to begin building your schedule.</p>
        </div>
      ) : (
        <div className="finance-workspace__obligation-schedule">
          {obligations.map((obligation) => (
            <article key={obligation.accountId}>
              <time dateTime={obligation.dueDate}>
                {obligation.dueDate}
              </time>

              <div>
                <strong>{obligation.accountName}</strong>
                <span>{obligation.institution}</span>
              </div>

              <div>
                <strong>{formatAmount(obligation.amount)}</strong>
                <span>
                  {obligation.accountStatus === "past-due"
                    ? "Past-due account"
                    : "Required payment"}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
