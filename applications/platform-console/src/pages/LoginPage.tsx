import { applicationConfiguration } from "../config/applicationConfiguration";

export function LoginPage() {
  function handleSignIn() {
    const clientId = import.meta.env.VITE_PLATFORM_CLIENT_ID;

    const redirectUri = encodeURIComponent(
      "http://localhost:5173/auth/callback",
    );

    const scope = encodeURIComponent("openid email profile");

    const loginUrl =
      `${applicationConfiguration.platform.hostedUiBaseUrl}` +
      `/login` +
      `?client_id=${clientId}` +
      `&response_type=code` +
      `&scope=${scope}` +
      `&redirect_uri=${redirectUri}`;

    window.location.assign(loginUrl);
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
