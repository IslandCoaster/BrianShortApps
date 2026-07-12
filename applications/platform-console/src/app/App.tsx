import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import { PersonalFinancePage } from "../pages/PersonalFinancePage";
import { EngineeringApp } from "./EngineeringApp";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EngineeringApp />} />

        <Route path="/personal-finance" element={<PersonalFinancePage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
