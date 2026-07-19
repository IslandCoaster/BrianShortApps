import {
  Tags,
  type Stack,
} from "aws-cdk-lib";

export type FinancialWorkspaceTagRequest = {
  stack: Stack;
  environment: "development" | "production";
};

export function applyFinancialWorkspaceTags({
  stack,
  environment,
}: FinancialWorkspaceTagRequest): void {
  const tags = Tags.of(stack);

  tags.add("bsa:platform", "brianshortapps");
  tags.add("bsa:application", "financial-workspace");
  tags.add("bsa:environment", environment);
  tags.add("bsa:component", "persistence");
  tags.add("bsa:managed-by", "cdk");
  tags.add("bsa:repository", "BrianShortApps");
  tags.add("bsa:data-classification", "restricted");
  tags.add("bsa:criticality", "high");
  tags.add("bsa:owner", "financial-workspace");
}