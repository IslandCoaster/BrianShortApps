import path from "node:path";

import {
  CfnOutput,
  Duration,
  Stack,
  type StackProps,
} from "aws-cdk-lib";
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from "aws-cdk-lib/aws-apigatewayv2";
import {
  HttpJwtAuthorizer,
} from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import {
  HttpLambdaIntegration,
} from "aws-cdk-lib/aws-apigatewayv2-integrations";
import type { ITable } from "aws-cdk-lib/aws-dynamodb";
import {
  Architecture,
  Runtime,
} from "aws-cdk-lib/aws-lambda";
import {
  NodejsFunction,
} from "aws-cdk-lib/aws-lambda-nodejs";
import {
  StringParameter,
} from "aws-cdk-lib/aws-ssm";
import type { Construct } from "constructs";

import {
  applyFinancialWorkspaceTags,
} from "../standards/applicationTags";

export type FinancialWorkspaceServiceStackProps =
  StackProps & {
    environmentName: "development" | "production";
    dataTable: ITable;
  };

export class FinancialWorkspaceServiceStack extends Stack {
  public constructor(
    scope: Construct,
    id: string,
    props: FinancialWorkspaceServiceStackProps,
  ) {
    super(scope, id, props);

    const environmentAbbreviation =
      props.environmentName === "development"
        ? "dev"
        : "prod";

    applyFinancialWorkspaceTags({
      stack: this,
      environment: props.environmentName,
    });

    const accountService = new NodejsFunction(
      this,
      "AccountService",
      {
        functionName:
          `bsa-financial-workspace-account-service-` +
          environmentAbbreviation,
        description:
          "Persists Financial Workspace account collections.",
        runtime: Runtime.NODEJS_22_X,
        architecture: Architecture.ARM_64,
        entry: path.resolve(
          __dirname,
          "../../api/accounts/src/handler.ts",
        ),
        handler: "handler",
        timeout: Duration.seconds(10),
        memorySize: 256,
        environment: {
          FINANCIAL_WORKSPACE_DATA_TABLE:
            props.dataTable.tableName,
        },
        bundling: {
          minify: false,
          sourceMap: true,
          target: "node22",
        },
      },
    );

    props.dataTable.grantReadWriteData(accountService);

    const platformUserPoolId =
      StringParameter.valueForStringParameter(
        this,
        `/bsa/platform/${props.environmentName}` +
          "/identity/user-pool-id",
      );

    const platformConsoleClientId =
      StringParameter.valueForStringParameter(
        this,
        `/bsa/platform/${props.environmentName}` +
          "/identity/platform-console-client-id",
      );

    const jwtIssuer =
      `https://cognito-idp.${this.region}.amazonaws.com/` +
      platformUserPoolId;

    const accountAuthorizer = new HttpJwtAuthorizer(
      "FinancialWorkspaceJwtAuthorizer",
      jwtIssuer,
      {
        authorizerName:
          `bsa-financial-workspace-authorizer-` +
          environmentAbbreviation,
        jwtAudience: [
          platformConsoleClientId,
        ],
      },
    );

    const accountIntegration =
      new HttpLambdaIntegration(
        "AccountServiceIntegration",
        accountService,
      );

    const accountApi = new HttpApi(
      this,
      "FinancialWorkspaceApi",
      {
        apiName:
          `bsa-financial-workspace-api-` +
          environmentAbbreviation,
        description:
          "Authenticated API for Financial Workspace.",
        corsPreflight: {
          allowHeaders: [
            "Authorization",
            "Content-Type",
          ],
          allowMethods: [
            CorsHttpMethod.GET,
            CorsHttpMethod.PUT,
            CorsHttpMethod.DELETE,
            CorsHttpMethod.OPTIONS,
          ],
          allowOrigins: [
            "http://localhost:5173",
            "https://finance.brianshortapps.com",
          ],
          maxAge: Duration.hours(1),
        },
      },
    );

    accountApi.addRoutes({
      path: "/accounts",
      methods: [
        HttpMethod.GET,
        HttpMethod.PUT,
        HttpMethod.DELETE,
      ],
      integration: accountIntegration,
      authorizer: accountAuthorizer,
    });

    new CfnOutput(
      this,
      "AccountServiceFunctionName",
      {
        value: accountService.functionName,
        description:
          "Lambda function providing Financial Workspace account persistence.",
      },
    );

    new CfnOutput(
      this,
      "FinancialWorkspaceApiUrl",
      {
        value: accountApi.apiEndpoint,
        description:
          "Authenticated Financial Workspace HTTP API endpoint.",
      },
    );
  }
}