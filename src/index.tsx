import { StrictMode, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./styles/index.css";
import App from "./app/App";
import EnhancedErrorBoundary from "./components/errors/EnhancedErrorBoundary";
import { LoadingSpinner } from "./components/ui/Loading";

// Create router configuration
const router = createBrowserRouter(
  [
    {
      path: "/Financial-Dashboard",
      element: (
        <EnhancedErrorBoundary>
          <App />
        </EnhancedErrorBoundary>
      ),
      errorElement: (
        <EnhancedErrorBoundary>
          <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p className="text-gray-400">Page not found</p>
              <a
                href="/Financial-Dashboard"
                className="text-blue-500 hover:text-blue-400 mt-4 inline-block"
              >
                Go back home
              </a>
            </div>
          </div>
        </EnhancedErrorBoundary>
      ),
    },
    {
      path: "/",
      element: (
        <EnhancedErrorBoundary>
          <App />
        </EnhancedErrorBoundary>
      ),
    },
  ],
  {
    basename: "/",
  }
);

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <StrictMode>
    <Suspense fallback={<LoadingSpinner />}>
      <RouterProvider router={router} />
    </Suspense>
  </StrictMode>
);
