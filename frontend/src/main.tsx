import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { PredictionHistoryProvider } from "./context/PredictionHistoryContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <PredictionHistoryProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PredictionHistoryProvider>
  </React.StrictMode>
);

