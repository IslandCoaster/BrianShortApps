import { App } from "aws-cdk-lib";

import { PlatformFoundationStack } from "../stacks/PlatformFoundationStack";

const app = new App();

new PlatformFoundationStack(app, "bsa-platform-foundation-dev", {
  description: "BrianShortApps development cloud foundation.",
});
