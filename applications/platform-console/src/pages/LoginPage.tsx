import { applicationConfiguration } from "../config/applicationConfiguration";

const PKCE_VERIFIER_STORAGE_KEY = "bsa.auth.pkce.verifier";
const OAUTH_STATE_STORAGE_KEY = "bsa.auth.oauth.state";

function encodeBase64Url(value: ArrayBuffer): string {
  const bytes = new Uint8Array(value);

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return window
    .btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function generateRandomValue(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);

  window.crypto.getRandomValues(bytes);

  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

async function createCodeChallenge(codeVerifier: string): Promise<string> {
  const encodedVerifier = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", encodedVerifier);

  return encodeBase64Url(digest);
}

export function LoginPage() {
  async function handleSignIn() {
    const { hostedUiBaseUrl, clientId } = applicationConfiguration.platform;

    if (!clientId) {
      throw new Error("VITE_PLATFORM_CLIENT_ID is not configured.");
    }

    const redirectUri = `${window.location.origin}/auth/callback`;

    const codeVerifier = generateRandomValue(64);
    const codeChallenge = await createCodeChallenge(codeVerifier);
    const state = generateRandomValue(32);

    window.sessionStorage.setItem(PKCE_VERIFIER_STORAGE_KEY, codeVerifier);

    window.sessionStorage.setItem(OAUTH_STATE_STORAGE_KEY, state);

    const authorizationUrl = new URL("/oauth2/authorize", hostedUiBaseUrl);

    authorizationUrl.searchParams.set("client_id", clientId);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("scope", "openid email profile");
    authorizationUrl.searchParams.set("redirect_uri", redirectUri);
    authorizationUrl.searchParams.set("state", state);
    authorizationUrl.searchParams.set("code_challenge", codeChallenge);
    authorizationUrl.searchParams.set("code_challenge_method", "S256");

    window.location.assign(authorizationUrl.toString());
  }

  return (
    <main className="personal-finance-page">
      <div className="personal-finance-page__container">
        <h1>BrianShortApps</h1>

        <p>Sign in to continue.</p>

        <button type="button" onClick={handleSignIn}>
          Sign in
        </button>
      </div>
    </main>
  );
}
