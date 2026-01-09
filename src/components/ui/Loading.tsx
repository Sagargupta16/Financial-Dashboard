import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  message?: string;
}

/**
 * Loading Spinner Component
 */
export const LoadingSpinner = ({ size = "md", message = "" }: LoadingSpinnerProps) => {
  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "w-4 h-4";
      case "lg":
        return "w-12 h-12";
      case "xl":
        return "w-16 h-16";
      default:
        return "w-8 h-8";
    }
  };

  return (
    <output className="flex flex-col items-center justify-center gap-3" aria-live="polite">
      <Loader2 className={`${getSizeClass()} animate-spin text-blue-500`} />
      {message && <p className="text-gray-400 text-sm">{message}</p>}
      <span className="sr-only">Loading...</span>
    </output>
  );
};

interface LoadingOverlayProps {
  message?: string;
}

/**
 * Full Page Loading Overlay
 */
export const LoadingOverlay = ({ message = "Loading..." }: LoadingOverlayProps) => {
  return (
    <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl">
        <LoadingSpinner size="xl" message={message} />
      </div>
    </div>
  );
};

/**
 * Loading Card Skeleton
 */
export const LoadingSkeleton = () => {
  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg p-6 animate-pulse">
      <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-700 rounded w-4/6"></div>
      </div>
    </div>
  );
};
