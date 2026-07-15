import type { ProjectionEntry } from "./projectionEntry";

export function compareProjectionEntries(
  left: ProjectionEntry,
  right: ProjectionEntry,
): number {
  const dateComparison = left.occurredOn.localeCompare(right.occurredOn);

  if (dateComparison !== 0) {
    return dateComparison;
  }

  const priorityComparison = left.priority - right.priority;

  if (priorityComparison !== 0) {
    return priorityComparison;
  }

  const sourceComparison = left.sourceId.localeCompare(right.sourceId);

  if (sourceComparison !== 0) {
    return sourceComparison;
  }

  return left.id.localeCompare(right.id);
}

export function orderProjectionEntries(
  entries: readonly ProjectionEntry[],
): ProjectionEntry[] {
  return [...entries].sort(compareProjectionEntries);
}
