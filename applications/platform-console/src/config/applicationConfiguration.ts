export const applicationConfiguration = {
  platform: {
    hostedUiBaseUrl:
        import.meta.env.VITE_PLATFORM_HOSTED_UI ??
        "https://bsa-development.auth.us-east-1.amazoncognito.com",

    clientId:
        import.meta.env.VITE_PLATFORM_CLIENT_ID ??
        "",
},

  financialWorkspace: {
    apiBaseUrl:
      import.meta.env.VITE_FINANCIAL_WORKSPACE_API ??
      "https://7kftyfdu58.execute-api.us-east-1.amazonaws.com",
  },
} as const;