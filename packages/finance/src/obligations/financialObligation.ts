export type FinancialObligationType = "utility";

export type FinancialObligationStatus =
  | "active"
  | "past-due"
  | "satisfied"
  | "cancelled";

export type ObligationCadence =
  | "one-time"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "annually";

export type BaseFinancialObligation = {
  id: string;
  obligationType: FinancialObligationType;
  name: string;
  status: FinancialObligationStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
};

export type UtilityObligation = BaseFinancialObligation & {
  obligationType: "utility";
  provider: string;
  amountDue: number;
  /**
   * Next known due date, when one has been established.
   *
   * Cadence does not imply a fixed calendar date and must not be used to
   * generate future due dates automatically.
   */
  dueDate?: string;
  cadence: ObligationCadence;
  referenceNumber?: string;
};

export type FinancialObligation = UtilityObligation;
