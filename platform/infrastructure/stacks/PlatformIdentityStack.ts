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
  OAuthScope,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
} from "aws-cdk-lib/aws-cognito";
import {
  StringParameter,
} from "aws-cdk-lib/aws-ssm";

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

    const hostedUiDomain = userPool.addDomain(
  "PlatformHostedUiDomain",
  {
    cognitoDomain: {
      domainPrefix: "bsa-development",
    },
  },
);

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

        oAuth: {
  flows: {
    authorizationCodeGrant: true,
  },

  scopes: [
    OAuthScope.OPENID,
    OAuthScope.EMAIL,
    OAuthScope.PROFILE,
  ],

  callbackUrls: [
    "http://localhost:5173/auth/callback",
  ],

  logoutUrls: [
    "http://localhost:5173/",
  ],
},
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

    new StringParameter(
  this,
  "PlatformUserPoolIdParameter",
  {
    parameterName:
      `/bsa/platform/${props.platformEnvironment.environment}` +
      "/identity/user-pool-id",
    stringValue: userPool.userPoolId,
    description:
      "BrianShortApps Platform Cognito User Pool ID.",
  },
);

new StringParameter(
  this,
  "PlatformConsoleClientIdParameter",
  {
    parameterName:
      `/bsa/platform/${props.platformEnvironment.environment}` +
      "/identity/platform-console-client-id",
    stringValue: platformConsoleClient.userPoolClientId,
    description:
      "BrianShortApps Platform Console Cognito app client ID.",
  },
);

new StringParameter(
  this,
  "PlatformHostedUiDomainParameter",
  {
    parameterName:
      `/bsa/platform/${props.platformEnvironment.environment}` +
      "/identity/hosted-ui-domain",

    stringValue:
      `https://${hostedUiDomain.domainName}.auth.${this.region}.amazoncognito.com`,

    description:
      "BrianShortApps Platform Cognito Hosted UI base URL.",
  },
);

new CfnOutput(this, "PlatformHostedUiDomain", {
  value:
    `https://${hostedUiDomain.domainName}.auth.${this.region}.amazoncognito.com`,

  description:
    "BrianShortApps Platform Cognito Hosted UI base URL.",
});
  }
}