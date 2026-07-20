import { useEffect, useState } from "react";
import { applicationConfiguration } from "../config/applicationConfiguration";

const PKCE_VERIFIER_STORAGE_KEY = "bsa.auth.pkce.verifier";
const OAUTH_STATE_STORAGE_KEY = "bsa.auth.oauth.state";

type CallbackState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "success";
      email: string;
      name: string;
    };

function decodeJwtPayload(token: string) {
  const payload = token.split(".")[1];

  const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));

  return JSON.parse(json);
}

export function AuthCallbackPage() {
  const [callbackState, setCallbackState] = useState<CallbackState>({
    status: "loading",
  });

  useEffect(() => {
    async function completeLogin() {
      try {
        const url = new URL(window.location.href);

        const code = url.searchParams.get("code");
        const returnedState = url.searchParams.get("state");

        if (!code) {
          throw new Error("Authorization code missing.");
        }

        const expectedState = sessionStorage.getItem(OAUTH_STATE_STORAGE_KEY);

        if (!expectedState || returnedState !== expectedState) {
          throw new Error("OAuth state validation failed.");
        }

        const verifier = sessionStorage.getItem(PKCE_VERIFIER_STORAGE_KEY);

        if (!verifier) {
          throw new Error("PKCE verifier missing.");
        }

        const body = new URLSearchParams({
          grant_type: "authorization_code",
          client_id: applicationConfiguration.platform.clientId,
          code,
          redirect_uri: `${window.location.origin}/auth/callback`,
          code_verifier: verifier,
        });

        const response = await fetch(
          `${applicationConfiguration.platform.hostedUiBaseUrl}/oauth2/token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body,
          },
        );

        if (!response.ok) {
          throw new Error(`Token exchange failed (${response.status})`);
        }

        const tokens = await response.json();

        sessionStorage.setItem("bsa.auth.idToken", tokens.id_token);

        sessionStorage.setItem("bsa.auth.accessToken", tokens.access_token);

        sessionStorage.setItem("bsa.auth.refreshToken", tokens.refresh_token);

        const jwt = decodeJwtPayload(tokens.id_token);

        setCallbackState({
          status: "success",
          email: jwt.email,
          name: jwt.name ?? jwt.email,
        });
      } catch (error) {
        setCallbackState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unknown authentication error.",
        });
      }
    }

    completeLogin();
  }, []);

  return (
    <main className="personal-finance-page">
      <div className="personal-finance-page__container">
        {callbackState.status === "loading" && (
          <>
            <h1>Authentication Callback</h1>
            <p>Processing sign in...</p>
          </>
        )}

        {callbackState.status === "error" && (
          <>
            <h1>Authentication Failed</h1>
            <p>{callbackState.message}</p>
          </>
        )}

        {callbackState.status === "success" && (
          <>
            <h1>✅ Signed In</h1>

            <h2>{callbackState.name}</h2>

            <p>{callbackState.email}</p>
          </>
        )}
      </div>
    </main>
  );
}
