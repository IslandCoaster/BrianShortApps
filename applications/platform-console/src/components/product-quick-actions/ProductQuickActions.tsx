import type { ReactNode } from "react";

import "./ProductQuickActions.css";

type ProductQuickAction = {
  id: string;
  label: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  emphasis?: "primary" | "secondary";
};

type ProductQuickActionsProps = {
  title?: string;
  description?: string;
  actions: ProductQuickAction[];
};

export function ProductQuickActions({
  title = "Quick actions",
  description = "Start with the next task that needs your attention.",
  actions,
}: ProductQuickActionsProps) {
  return (
    <section className="product-quick-actions">
      <div className="product-quick-actions__header">
        <div>
          <p>{title}</p>
          <span>{description}</span>
        </div>
      </div>

      <div className="product-quick-actions__grid">
        {actions.map((action) => (
          <button
            className={`product-quick-actions__action product-quick-actions__action--${
              action.emphasis ?? "secondary"
            }`}
            disabled={action.disabled}
            key={action.id}
            onClick={action.onClick}
            type="button"
          >
            {action.icon ? (
              <span className="product-quick-actions__icon">{action.icon}</span>
            ) : null}

            <span className="product-quick-actions__content">
              <strong>{action.label}</strong>
              <small>{action.description}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
