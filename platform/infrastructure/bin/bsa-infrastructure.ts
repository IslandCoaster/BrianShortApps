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
  PlatformIdentityStack,
} from "../stacks/PlatformIdentityStack";
import {
  buildResourceName,
} from "../standards/resourceNaming";

const app = new App();

const platformEnvironment = resolvePlatformEnvironment(
  app.node.tryGetContext("environment"),
);

const sharedStackProps = {
  platformEnvironment,
  env: {
    account: platformEnvironment.account,
    region: platformEnvironment.region,
  },
};

const foundationStackName = buildResourceName({
  application: "platform",
  component: "foundation",
  environment: platformEnvironment,
});

const foundationStack = new PlatformFoundationStack(
  app,
  foundationStackName,
  {
    ...sharedStackProps,
    stackName: foundationStackName,
    description:
      `BrianShortApps ${platformEnvironment.environment} ` +
      "cloud foundation.",
  },
);

const identityStackName = buildResourceName({
  application: "platform",
  component: "identity",
  environment: platformEnvironment,
});

const identityStack = new PlatformIdentityStack(
  app,
  identityStackName,
  {
    ...sharedStackProps,
    stackName: identityStackName,
    description:
      `BrianShortApps ${platformEnvironment.environment} ` +
      "platform identity.",
  },
);

identityStack.addDependency(foundationStack);