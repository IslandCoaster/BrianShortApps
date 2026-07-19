import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import type { FinancialAccount } from "@bsa/finance";

import {
  DynamoDbFinancialAccountRepository,
} from "./DynamoDbFinancialAccountRepository";

type AccountServiceEvent = {
  body?: string | null;
  requestContext?: {
    authorizer?: {
      jwt?: {
        claims?: Record<string, unknown>;
      };
    };
    http?: {
      method?: string;
    };
  };
};

type AccountServiceResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

function requireEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new Error(
      `${name} environment variable is required.`,
    );
  }

  return value;
}

const tableName = requireEnvironmentVariable(
  "FINANCIAL_WORKSPACE_DATA_TABLE",
);

const documentClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({}),
  {
    marshallOptions: {
      removeUndefinedValues: true,
    },
  },
);

function response(
  statusCode: number,
  body: unknown,
): AccountServiceResponse {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

function getAuthenticatedUserId(
  event: AccountServiceEvent,
): string {
  const subject =
    event.requestContext?.authorizer?.jwt?.claims?.sub;

  if (typeof subject !== "string" || subject.trim() === "") {
    throw new Error("Authenticated user identity is unavailable.");
  }

  return subject;
}

function parseAccountCollection(
  body: string | null | undefined,
): FinancialAccount[] {
  if (!body) {
    throw new Error("Request body is required.");
  }

  const parsed: unknown = JSON.parse(body);

  if (!Array.isArray(parsed)) {
    throw new Error(
      "Financial account payload must be an array.",
    );
  }

  return parsed as FinancialAccount[];
}

export async function handler(
  event: AccountServiceEvent,
): Promise<AccountServiceResponse> {
  try {
    const userId = getAuthenticatedUserId(event);

    const repository =
      new DynamoDbFinancialAccountRepository(
        documentClient,
        tableName,
        userId,
      );

    switch (event.requestContext?.http?.method) {
      case "GET":
        return response(200, await repository.load());

      case "PUT": {
        const accounts = parseAccountCollection(event.body);

        await repository.save(accounts);

        return response(200, accounts);
      }

      case "DELETE":
        await repository.clear();

        return {
          statusCode: 204,
          headers: {},
          body: "",
        };

      default:
        return response(405, {
          message: "Method not allowed.",
        });
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected account-service error.";

    return response(400, {
      message,
    });
  }
}