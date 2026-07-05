export type PlatformInventoryItem = {
  id: string;
  label: string;
  value: string;
};

export const platformInventoryItems: PlatformInventoryItem[] = [
  { id: "shared-packages", label: "Shared Packages", value: "8" },
  { id: "platform-areas", label: "Platform Areas", value: "5" },
  { id: "product-applications", label: "Product Applications", value: "3" },
  { id: "engineering-experiences", label: "Engineering Experiences", value: "3" },
];

export function listPlatformInventoryItems() {
  return platformInventoryItems;
}
