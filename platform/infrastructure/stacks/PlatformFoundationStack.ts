import {
  CfnOutput,
  Stack,
  type StackProps,
} from "aws-cdk-lib";
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

export type PlatformFoundationStackProps = StackProps & {
  platformEnvironment: PlatformEnvironmentConfiguration;
};

export class PlatformFoundationStack extends Stack {
  public constructor(
    scope: Construct,
    id: string,
    props: PlatformFoundationStackProps,
  ) {
    super(scope, id, props);

    const component = "foundation";

    applyPlatformTags({
      stack: this,
      application: "platform",
      component,
      environment: props.platformEnvironment,
      dataClassification: "internal",
      criticality: "high",
    });

    const foundationName = buildResourceName({
      application: "platform",
      component,
      environment: props.platformEnvironment,
    });

    const foundationVersionParameter = new StringParameter(
      this,
      "FoundationVersionParameter",
      {
        parameterName:
          `/bsa/platform/${props.platformEnvironment.environment}` +
          "/foundation/version",
        stringValue: "1",
        description:
          "BrianShortApps cloud foundation schema version.",
      },
    );

    new CfnOutput(this, "FoundationName", {
      value: foundationName,
      description:
        "Canonical BrianShortApps platform foundation name.",
    });

    new CfnOutput(this, "FoundationVersionParameterName", {
      value: foundationVersionParameter.parameterName,
      description:
        "SSM parameter containing the platform foundation version.",
    });
  }
}