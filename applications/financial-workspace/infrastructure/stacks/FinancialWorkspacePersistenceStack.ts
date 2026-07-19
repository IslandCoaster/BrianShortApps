import {
  CfnOutput,
  RemovalPolicy,
  Stack,
  type StackProps,
} from "aws-cdk-lib";
import {
  AttributeType,
  BillingMode,
  type ITable,
  Table,
} from "aws-cdk-lib/aws-dynamodb";
import type { Construct } from "constructs";

import {
  applyFinancialWorkspaceTags,
} from "../standards/applicationTags";

export type FinancialWorkspacePersistenceStackProps =
  StackProps & {
    environmentName: "development" | "production";
    environmentAbbreviation: "dev" | "prod";
  };

export class FinancialWorkspacePersistenceStack extends Stack {
  public readonly dataTable: ITable;

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

    this.dataTable = new Table(
      this,
      "FinancialWorkspaceDataTable",
      {
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
      },
    );

    new CfnOutput(
      this,
      "FinancialWorkspaceDataTableName",
      {
        value: this.dataTable.tableName,
        description:
          "DynamoDB table containing Financial Workspace application data.",
      },
    );

    new CfnOutput(
      this,
      "FinancialWorkspaceDataTableArn",
      {
        value: this.dataTable.tableArn,
        description:
          "ARN of the Financial Workspace application data table.",
      },
    );
  }
}