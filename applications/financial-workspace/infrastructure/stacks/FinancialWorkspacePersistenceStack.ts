import {
  RemovalPolicy,
  Stack,
  type StackProps,
} from "aws-cdk-lib";
import {
  AttributeType,
  BillingMode,
  Table,
} from "aws-cdk-lib/aws-dynamodb";
import {
  applyFinancialWorkspaceTags,
} from "../standards/applicationTags";
import type { Construct } from "constructs";

export type FinancialWorkspacePersistenceStackProps =
  StackProps & {
    environmentName: "development" | "production";
    environmentAbbreviation: "dev" | "prod";
  };

export class FinancialWorkspacePersistenceStack extends Stack {
  public constructor(
    scope: Construct,
    id: string,
    props: FinancialWorkspacePersistenceStackProps,
  ) {
    super(scope, id, props);
    applyFinancialWorkspaceTags({
  stack: this,
  environment: props.environmentName,
});

    new Table(this, "FinancialWorkspaceDataTable", {
      tableName:
        `bsa-financial-workspace-data-` +
        props.environmentAbbreviation,
      partitionKey: {
        name: "PK",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "SK",
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
      },
      removalPolicy:
        props.environmentName === "production"
          ? RemovalPolicy.RETAIN
          : RemovalPolicy.DESTROY,
    });
  }
}