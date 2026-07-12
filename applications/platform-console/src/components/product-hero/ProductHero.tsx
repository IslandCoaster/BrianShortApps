import type { ReactNode } from "react";

import "./ProductHero.css";

type ProductHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  status?: ReactNode;
  actions?: ReactNode;
};

export function ProductHero({
  eyebrow,
  title,
  description,
  status,
  actions,
}: ProductHeroProps) {
  const hasSupportingContent = status || actions;

  return (
    <header className="product-hero">
      <div className="product-hero__content">
        <p className="product-hero__eyebrow">{eyebrow}</p>

        <h1>{title}</h1>

        <p className="product-hero__description">{description}</p>
      </div>

      {hasSupportingContent ? (
        <div className="product-hero__support">
          {status ? <div className="product-hero__status">{status}</div> : null}

          {actions ? (
            <div className="product-hero__actions">{actions}</div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
