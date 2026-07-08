export type GracePeriodStatus = "active" | "lost" | "restored" | "unknown";

export type GracePeriodState = {
  accountId: string;
  accountName: string;
  status: GracePeriodStatus;
  rule: string;
  reason: string;
  evaluatedOn: string;
};

export function createEmptyGracePeriodState(
  accountId: string,
  accountName: string,
): GracePeriodState {
  return {
    accountId,
    accountName,
    status: "unknown",
    rule: "",
    reason: "Grace period status has not been evaluated.",
    evaluatedOn: "",
  };
}
