import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import type {
  FinancialAccount,
  FinancialAccountRepository,
} from "@bsa/finance";
import {
  assertUniqueFinancialAccountIds,
  assertValidFinancialAccount,
} from "@bsa/finance";

type FinancialAccountSnapshotItem = {
  PK: string;
  SK: "FINANCIAL_ACCOUNTS";
  entityType: "financial-account-snapshot";
  schemaVersion: 1;
  accounts: FinancialAccount[];
  updatedAt: string;
};

export class DynamoDbFinancialAccountRepository
  implements FinancialAccountRepository
{
  private readonly documentClient: DynamoDBDocumentClient;
  private readonly tableName: string;
  private readonly partitionKey: string;

  public constructor(
    documentClient: DynamoDBDocumentClient,
    tableName: string,
    userId: string,
  ) {
    if (tableName.trim() === "") {
      throw new Error("Financial Workspace table name is required.");
    }

    if (userId.trim() === "") {
      throw new Error("Authenticated user ID is required.");
    }

    this.documentClient = documentClient;
    this.tableName = tableName;
    this.partitionKey = `USER#${userId}`;
  }

  public async load(): Promise<FinancialAccount[]> {
    const result = await this.documentClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          PK: this.partitionKey,
          SK: "FINANCIAL_ACCOUNTS",
        },
        ConsistentRead: true,
      }),
    );

    if (!result.Item) {
      return [];
    }

    const item = result.Item as Partial<FinancialAccountSnapshotItem>;

    if (!Array.isArray(item.accounts)) {
      throw new Error(
        "Persisted Financial Workspace account snapshot is invalid.",
      );
    }

    const accounts = item.accounts as FinancialAccount[];

    accounts.forEach(assertValidFinancialAccount);
    assertUniqueFinancialAccountIds(accounts);

    return accounts;
  }

  public async save(
    accounts: readonly FinancialAccount[],
  ): Promise<void> {
    accounts.forEach(assertValidFinancialAccount);
    assertUniqueFinancialAccountIds(accounts);

    const item: FinancialAccountSnapshotItem = {
      PK: this.partitionKey,
      SK: "FINANCIAL_ACCOUNTS",
      entityType: "financial-account-snapshot",
      schemaVersion: 1,
      accounts: [...accounts],
      updatedAt: new Date().toISOString(),
    };

    await this.documentClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: item,
      }),
    );
  }

  public async clear(): Promise<void> {
    await this.documentClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: {
          PK: this.partitionKey,
          SK: "FINANCIAL_ACCOUNTS",
        },
      }),
    );
  }
}