export type PortfolioProductType =
  | "credit-card"
  | "charge-card"
  | "store-card"
  | "student-loan";

export type PortfolioAccountStatus =
  | "current"
  | "past-due"
  | "paid-off"
  | "unknown";

export type PortfolioDataStatus =
  | "statement-snapshot"
  | "manually-entered"
  | "live";

export type PortfolioAccountSummary = {
  id: string;
  institution: string;
  accountName: string;
  productType: PortfolioProductType;
  accountStatus: PortfolioAccountStatus;
  dataStatus: PortfolioDataStatus;
  asOfDate: string;

  currentBalance: number;
  statementBalance?: number;
  minimumPaymentDue?: number;
  paymentDueDate?: string;
  aprPercent?: number;
  creditLimit?: number;
  originalPrincipal?: number;

  notes?: string;
};
