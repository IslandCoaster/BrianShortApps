export type FinancialStrategy =
  | "survival"
  | "balanced"
  | "debt-elimination"
  | "interest-reduction"
  | "reward-optimization";

type StrategyOption = {
  id: FinancialStrategy;
  title: string;
  description: string;
  available: boolean;
};

type PaycheckStrategySelectorProps = {
  selectedStrategy: FinancialStrategy;
  onStrategyChange: (strategy: FinancialStrategy) => void;
};

const strategyOptions: StrategyOption[] = [
  {
    id: "survival",
    title: "Survival",
    description:
      "Prioritize urgent obligations and preserve as much available cash as possible.",
    available: false,
  },
  {
    id: "balanced",
    title: "Balanced",
    description:
      "Protect the configured cash reserve, fund required obligations, and preserve any funding buffer for future decisions.",
    available: true,
  },
  {
    id: "debt-elimination",
    title: "Debt Elimination",
    description:
      "Direct available funding buffer toward reducing outstanding debt as quickly as possible.",
    available: false,
  },
  {
    id: "interest-reduction",
    title: "Interest Reduction",
    description:
      "Prioritize balances expected to create the greatest borrowing cost.",
    available: false,
  },
  {
    id: "reward-optimization",
    title: "Reward Optimization",
    description:
      "Coordinate account benefits, rewards, and payment requirements.",
    available: false,
  },
];

export function PaycheckStrategySelector({
  selectedStrategy,
  onStrategyChange,
}: PaycheckStrategySelectorProps) {
  return (
    <section className="finance-workspace__strategy-selector">
      <div className="finance-workspace__section-header">
        <div>
          <p>Financial Strategy</p>
          <span>Choose what this paycheck should accomplish</span>
        </div>
      </div>

      <div
        className="finance-workspace__strategy-grid"
        role="radiogroup"
        aria-label="Financial strategy"
      >
        {strategyOptions.map((strategy) => {
          const isSelected = selectedStrategy === strategy.id;

          return (
            <button
              key={strategy.id}
              type="button"
              className={[
                "finance-workspace__strategy-card",
                isSelected ? "finance-workspace__strategy-card--selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              role="radio"
              aria-checked={isSelected}
              disabled={!strategy.available}
              onClick={() => onStrategyChange(strategy.id)}
            >
              <div>
                <span
                  className="finance-workspace__strategy-indicator"
                  aria-hidden="true"
                >
                  {isSelected ? "●" : "○"}
                </span>

                <strong>{strategy.title}</strong>
              </div>

              <p>{strategy.description}</p>

              {!strategy.available ? <small>Coming soon</small> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
