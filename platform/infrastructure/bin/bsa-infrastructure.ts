import {
  App,
} from "aws-cdk-lib";

import {
  resolvePlatformEnvironment,
} from "../config/platformEnvironment";
import {
  PlatformFoundationStack,
} from "../stacks/PlatformFoundationStack";
import {
  buildResourceName,
} from "../standards/resourceNaming";

const app = new App();

const platformEnvironment = resolvePlatformEnvironment(
  app.node.tryGetContext("environment"),
);

const stackName = buildResourceName({
  application: "platform",
  component: "foundation",
  environment: platformEnvironment,
});

new PlatformFoundationStack(
  app,
  stackName,
  {
    stackName,
    description:
      `BrianShortApps ${platformEnvironment.environment} ` +
      "cloud foundation.",
    platformEnvironment,
    env: {
      account: platformEnvironment.account,
      region: platformEnvironment.region,
    },
  },
);