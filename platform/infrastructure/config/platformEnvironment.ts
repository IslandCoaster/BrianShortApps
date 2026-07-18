export const PLATFORM_ENVIRONMENTS = [
  "development",
  "production",
] as const;

export type PlatformEnvironment =
  (typeof PLATFORM_ENVIRONMENTS)[number];

export type PlatformEnvironmentConfiguration = {
  environment: PlatformEnvironment;
  abbreviation: "dev" | "prod";
  account: string;
  region: string;
};

function isPlatformEnvironment(
  value: string,
): value is PlatformEnvironment {
  return PLATFORM_ENVIRONMENTS.some(
    (environment) => environment === value,
  );
}

export function resolvePlatformEnvironment(
  requestedEnvironment: unknown,
): PlatformEnvironmentConfiguration {
  if (
    typeof requestedEnvironment !== "string" ||
    !isPlatformEnvironment(requestedEnvironment)
  ) {
    throw new Error(
      'CDK context "environment" must be "development" or "production".',
    );
  }

  const account = process.env.CDK_DEFAULT_ACCOUNT;
  const region = process.env.CDK_DEFAULT_REGION ?? "us-east-1";

  if (!account) {
    throw new Error(
      "CDK_DEFAULT_ACCOUNT is unavailable. Authenticate with the intended AWS profile before synthesis or deployment.",
    );
  }

  return {
    environment: requestedEnvironment,
    abbreviation:
      requestedEnvironment === "development" ? "dev" : "prod",
    account,
    region,
  };
}