/**
 * Minimal synchronous key-value storage contract required by the finance
 * persistence adapters.
 *
 * Browser localStorage satisfies this interface, but the finance package does
 * not depend directly on browser globals.
 */
export interface StorageLike {
  getItem(key: string): string | null;

  setItem(key: string, value: string): void;

  removeItem(key: string): void;
}
