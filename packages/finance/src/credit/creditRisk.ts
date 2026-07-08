export type CreditRiskLevel =
  | "excellent"
  | "healthy"
  | "elevated"
  | "high"
  | "critical";

export type CreditRisk = {
  level: CreditRiskLevel;
  color: "success" | "info" | "warning" | "danger";
  description: string;
};

export function calculateCreditRisk(utilizationPercent: number): CreditRisk {
  if (utilizationPercent < 10) {
    return {
      level: "excellent",
      color: "success",
      description: "Excellent utilization.",
    };
  }

  if (utilizationPercent < 30) {
    return {
      level: "healthy",
      color: "info",
      description: "Within operational target.",
    };
  }

  if (utilizationPercent < 50) {
    return {
      level: "elevated",
      color: "warning",
      description: "Above operational target.",
    };
  }

  if (utilizationPercent < 75) {
    return {
      level: "high",
      color: "danger",
      description: "High utilization detected.",
    };
  }

  return {
    level: "critical",
    color: "danger",
    description: "Critical utilization.",
  };
}
