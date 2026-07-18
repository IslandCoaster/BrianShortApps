import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  type StackProps,
} from "aws-cdk-lib";
import {
  AccountRecovery,
  Mfa,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
} from "aws-cdk-lib/aws-cognito";

import type { Construct } from "constructs";
import type {
  PlatformEnvironmentConfiguration,
} from "../config/platformEnvironment";
import {
  buildResourceName,
} from "../standards/resourceNaming";
import {
  applyPlatformTags,
} from "../standards/platformTags";

export type PlatformIdentityStackProps = StackProps & {
  platformEnvironment: PlatformEnvironmentConfiguration;
};

export class PlatformIdentityStack extends Stack {
  public constructor(
    scope: Construct,
    id: string,
    props: PlatformIdentityStackProps,
  ) {
    super(scope, id, props);

    const application = "platform";
    const component = "identity";

    applyPlatformTags({
      stack: this,
      application,
      component,
      environment: props.platformEnvironment,
      dataClassification: "confidential",
      criticality: "critical",
    });

    const identityName = buildResourceName({
      application,
      component,
      environment: props.platformEnvironment,
    });

    const platformConsoleClientName = buildResourceName({
  application: "platform",
  component: "console-client",
  environment: props.platformEnvironment,
});

    const userPool = new UserPool(this, "PlatformUserPool", {
      userPoolName: `${identityName}-users`,

      selfSignUpEnabled: false,

      signInAliases: {
        email: true,
      },

      signInCaseSensitive: false,

      autoVerify: {
        email: true,
      },

      accountRecovery: AccountRecovery.EMAIL_ONLY,

      mfa: Mfa.OFF,

      passwordPolicy: {
        minLength: 12,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
        tempPasswordValidity: Duration.days(7),
      },

      removalPolicy: RemovalPolicy.RETAIN,
    });

    const platformConsoleClient = new UserPoolClient(
      this,
      "PlatformConsoleClient",
      {
        userPool,
        userPoolClientName: platformConsoleClientName,

        generateSecret: false,

        authFlows: {
          userSrp: true,
        },

        supportedIdentityProviders: [
          UserPoolClientIdentityProvider.COGNITO,
        ],

        preventUserExistenceErrors: true,

        accessTokenValidity: Duration.hours(1),
        idTokenValidity: Duration.hours(1),
        refreshTokenValidity: Duration.days(30),

        enableTokenRevocation: true,

        disableOAuth: true,
      },
    );

    new CfnOutput(this, "IdentityName", {
      value: identityName,
      description:
        "Canonical BrianShortApps platform identity name.",
    });

    new CfnOutput(this, "UserPoolId", {
      value: userPool.userPoolId,
      description:
        "BrianShortApps platform Cognito User Pool ID.",
    });

    new CfnOutput(this, "UserPoolArn", {
      value: userPool.userPoolArn,
      description:
        "BrianShortApps platform Cognito User Pool ARN.",
    });

    new CfnOutput(this, "PlatformConsoleClientId", {
      value: platformConsoleClient.userPoolClientId,
      description:
        "Cognito app client ID for the BrianShortApps Platform Console.",
    });
  }
}