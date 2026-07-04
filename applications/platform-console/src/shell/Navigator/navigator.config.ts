import type { NavigatorItem } from "./navigator.types";

export const navigatorPrimaryItems: NavigatorItem[] = [
  {
    id: "engineering-workspace",
    label: "Engineering Workspace",
    description: "The current operating environment.",
    status: "active",
  },
  {
    id: "platform",
    label: "Platform",
    description: "Identity, registries, infrastructure, and shared services.",
    status: "available",
  },
  {
    id: "knowledge",
    label: "Knowledge",
    description: "Architecture, standards, ADRs, and documentation.",
    status: "available",
  },
  {
    id: "sdk",
    label: "SDK",
    description: "Shared BrianShortApps packages.",
    status: "available",
  },
  {
    id: "diagnostics",
    label: "Diagnostics",
    description: "Operational intelligence and system health.",
    status: "planned",
  },
  {
    id: "applications",
    label: "Applications",
    description: "Engineering and product applications.",
    status: "available",
  },
];
