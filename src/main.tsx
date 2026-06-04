import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { SurveyApp } from "./survey/SurveyApp.tsx";
import { ResultsApp } from "./results/ResultsApp.tsx";
import "./styles/index.css";

const path = window.location.pathname;
let element: React.ReactElement;
if (path.startsWith("/survey")) element = <SurveyApp />;
else if (path.startsWith("/results")) element = <ResultsApp />;
else element = <App />;

createRoot(document.getElementById("root")!).render(
  <StrictMode>{element}</StrictMode>
);
