import React from "react";
import { createRoot } from "react-dom/client";
import "./legacy.css";
import "./index.css";
import App from "./App";

try {
  document.documentElement.dataset.theme = localStorage.getItem("losbasados-theme") === "light" ? "light" : "dark";
} catch {
  document.documentElement.dataset.theme = "dark";
}

createRoot(document.getElementById("root")!).render(<App />);
