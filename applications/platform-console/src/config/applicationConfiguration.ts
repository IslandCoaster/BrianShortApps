export const applicationConfiguration = {
  financialWorkspace: {
    apiBaseUrl:
      import.meta.env.VITE_FINANCIAL_WORKSPACE_API ??
      "https://7kftyfdu58.execute-api.us-east-1.amazonaws.com",
  },
} as const;