export type FinancialAccountType =
  | "checking"
  | "savings"
  | "credit-card"
  | "loan";

export type FinancialAccountStatus =
  | "active"
  | "past-due"
  | "paid-off"
  | "closed";

export type BaseFinancialAccount = {
  id: string;
  accountType: FinancialAccountType;
  name: string;

  /**
   * Optional at the base-domain level so future account types such as cash,
   * wallets, or non-institutional holdings are not forced to provide one.
   *
   * The currently supported institutional account types require this field
   * through their concrete account definitions.
   */
  institutionName?: string;

  status: FinancialAccountStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
};

export type CheckingAccount = BaseFinancialAccount & {
  accountType: "checking";
  institutionName: string;
  currentBalance: number;
  recommendedMinimumBuffer?: number;
  accountSuffix?: string;
};

export type SavingsAccount = BaseFinancialAccount & {
  accountType: "savings";
  institutionName: string;
  currentBalance: number;
  recommendedMinimumBuffer?: number;
  accountSuffix?: string;
};

export type CreditCardAccount = BaseFinancialAccount & {
  accountType: "credit-card";
  institutionName: string;
  currentBalance: number;
  creditLimit?: number;
  minimumPayment?: number;
  paymentDueDate?: string;
  settlementAccountId?: string;
  statementDate?: string;
  aprPercent?: number;
  accountSuffix?: string;
};

export type LoanAccount = BaseFinancialAccount & {
  accountType: "loan";
  institutionName: string;
  currentPrincipal: number;
  originalPrincipal?: number;
  minimumPayment?: number;
  paymentDueDate?: string;
  settlementAccountId?: string;
  interestRatePercent?: number;
  maturityDate?: string;
  accountSuffix?: string;
};

export type AssetFinancialAccount = CheckingAccount | SavingsAccount;

export type DebtFinancialAccount = CreditCardAccount | LoanAccount;

export type FinancialAccount = AssetFinancialAccount | DebtFinancialAccount;

export function isAssetFinancialAccount(
  account: FinancialAccount,
): account is AssetFinancialAccount {
  return (
    account.accountType === "checking" || account.accountType === "savings"
  );
}

export function isDebtFinancialAccount(
  account: FinancialAccount,
): account is DebtFinancialAccount {
  return (
    account.accountType === "credit-card" || account.accountType === "loan"
  );
}

export function getFinancialAccountBalance(account: FinancialAccount): number {
  switch (account.accountType) {
    case "checking":
    case "savings":
    case "credit-card":
      return account.currentBalance;

    case "loan":
      return account.currentPrincipal;
  }
}
