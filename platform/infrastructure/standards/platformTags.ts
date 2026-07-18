import {
  Tags,
  type Stack,
} from "aws-cdk-lib";

import type {
  PlatformEnvironmentConfiguration,
} from "../config/platformEnvironment";

export type DataClassification =
  | "public"
  | "internal"
  | "confidential"
  | "restricted";

export type ResourceCriticality =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type PlatformTagRequest = {
  stack: Stack;
  application: string;
  component: string;
  environment: PlatformEnvironmentConfiguration;
  dataClassification: DataClassification;
  criticality: ResourceCriticality;
  owner?: string;
};

export function applyPlatformTags({
  stack,
  application,
  component,
  environment,
  dataClassification,
  criticality,
  owner = "platform",
}: PlatformTagRequest): void {
  const tags = Tags.of(stack);

  tags.add("bsa:platform", "brianshortapps");
  tags.add("bsa:application", application);
  tags.add("bsa:environment", environment.environment);
  tags.add("bsa:component", component);
  tags.add("bsa:managed-by", "cdk");
  tags.add("bsa:repository", "BrianShortApps");
  tags.add("bsa:data-classification", dataClassification);
  tags.add("bsa:criticality", criticality);
  tags.add("bsa:owner", owner);
}