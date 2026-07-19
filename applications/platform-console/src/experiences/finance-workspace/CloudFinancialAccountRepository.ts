import type {
  FinancialAccount,
  FinancialAccountRepository,
} from "@bsa/finance";

import { applicationConfiguration } from "../../config/applicationConfiguration";

export class CloudFinancialAccountRepository
  implements FinancialAccountRepository
{
  private readonly baseUrl =
    applicationConfiguration.financialWorkspace.apiBaseUrl;

  async load(): Promise<FinancialAccount[]> {
    return this.request<FinancialAccount[]>("GET", "/accounts");
  }

  async save(accounts: readonly FinancialAccount[]): Promise<void> {
    await this.request("PUT", "/accounts", accounts);
  }

  async clear(): Promise<void> {
    await this.request("DELETE", "/accounts");
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",

        // FIN-003:
        // Replace with Cognito ID token.
        // Authorization: `Bearer ${token}`,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(
        `${method} ${path} failed (${response.status})`,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }
}