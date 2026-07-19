import { App } from "aws-cdk-lib";

import {
  FinancialWorkspacePersistenceStack,
} from "../stacks/FinancialWorkspacePersistenceStack";

import {
  FinancialWorkspaceServiceStack,
} from "../stacks/FinancialWorkspaceServiceStack";

const app = new App();

const requestedEnvironment =
  app.node.tryGetContext("environment");

if (
  requestedEnvironment !== "development" &&
  requestedEnvironment !== "production"
) {
  throw new Error(
    'CDK context "environment" must be "development" or "production".',
  );
}

const environmentAbbreviation =
  requestedEnvironment === "development"
    ? "dev"
    : "prod";

const account =
  process.env.CDK_DEFAULT_ACCOUNT ??
  process.env.AWS_ACCOUNT_ID;

const region =
  process.env.CDK_DEFAULT_REGION ??
  process.env.AWS_REGION ??
  "us-east-1";

if (!account) {
  throw new Error(
    "AWS account context is unavailable. Export AWS_ACCOUNT_ID or provide CDK_DEFAULT_ACCOUNT before synthesis or deployment.",
  );
}

const stackName =
  `bsa-financial-workspace-persistence-` +
  environmentAbbreviation;

const persistenceStack =
  new FinancialWorkspacePersistenceStack(
  app,
  stackName,
  {
    stackName,
    description:
      `BrianShortApps Financial Workspace ` +
      `${requestedEnvironment} persistence.`,
    environmentName: requestedEnvironment,
    environmentAbbreviation,
    env: {
      account,
      region,
    },
  },
);
const serviceStackName =
  `bsa-financial-workspace-service-` +
  environmentAbbreviation;

const serviceStack = new FinancialWorkspaceServiceStack(
  app,
  serviceStackName,
  {
    stackName: serviceStackName,
    description:
      `BrianShortApps Financial Workspace ` +
      `${requestedEnvironment} application services.`,
    environmentName: requestedEnvironment,
    dataTable: persistenceStack.dataTable,
    env: {
      account,
      region,
    },
  },
);

serviceStack.addDependency(persistenceStack);