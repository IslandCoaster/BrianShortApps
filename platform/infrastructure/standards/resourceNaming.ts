import type {
  PlatformEnvironmentConfiguration,
} from "../config/platformEnvironment";

export type ResourceNameRequest = {
  application: string;
  component: string;
  environment: PlatformEnvironmentConfiguration;
};

function normalizeSegment(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");

  if (!normalized) {
    throw new Error(
      `Resource name segment "${value}" cannot be normalized.`,
    );
  }

  return normalized;
}

export function buildResourceName({
  application,
  component,
  environment,
}: ResourceNameRequest): string {
  return [
    "bsa",
    normalizeSegment(application),
    normalizeSegment(component),
    environment.abbreviation,
  ].join("-");
}