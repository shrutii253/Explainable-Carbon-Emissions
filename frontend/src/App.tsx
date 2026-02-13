import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/Dashboard";
import { PredictionPage } from "./pages/Prediction";
import { PolicyInsightsPage } from "./pages/PolicyInsights";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="predict" element={<PredictionPage />} />
        <Route path="policy" element={<PolicyInsightsPage />} />
      </Route>
    </Routes>
  );
}

export default App;

