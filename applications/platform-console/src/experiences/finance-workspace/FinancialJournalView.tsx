import type { FinancialJournal } from "@bsa/finance";

type FinancialJournalViewProps = {
  journal: FinancialJournal;
};

function formatAmount(amount?: number) {
  if (typeof amount !== "number") {
    return "—";
  }

  return `$${amount.toLocaleString()}`;
}

export function FinancialJournalView({ journal }: FinancialJournalViewProps) {
  return (
    <section className="finance-workspace__journal">
      <div className="finance-workspace__section-header">
        <p>Financial Journal</p>
        <span>{journal.events.length} events recorded</span>
      </div>

      <div className="finance-workspace__journal-list">
        {journal.events.map((event) => (
          <article className="finance-workspace__journal-event" key={event.id}>
            <div>
              <span>{event.occurredOn}</span>
              <strong>{event.description}</strong>
            </div>

            <div>
              <span>{event.category}</span>
              <strong>{formatAmount(event.amount)}</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
