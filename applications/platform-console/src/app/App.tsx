import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import { LoginPage } from "../pages/LoginPage";
import { AuthCallbackPage } from "../pages/AuthCallbackPage";
import { PersonalFinancePage } from "../pages/PersonalFinancePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        <Route path="/personal-finance" element={<PersonalFinancePage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
