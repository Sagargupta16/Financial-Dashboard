import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import App from "./app/App";
import EnhancedErrorBoundary from "./components/errors/EnhancedErrorBoundary";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <EnhancedErrorBoundary>
      <App />
    </EnhancedErrorBoundary>
  </StrictMode>
);
