import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import FraudDetection from "./pages/FraudDetection";
import VerificationCases from "./pages/VerificationCases";
import FieldInspections from "./pages/FieldInspections";

export default function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-10 py-10 max-w-5xl">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/fraud" element={<FraudDetection />} />
          <Route path="/cases" element={<VerificationCases />} />
          <Route path="/inspections" element={<FieldInspections />} />
        </Routes>
      </main>
    </div>
  );
}
