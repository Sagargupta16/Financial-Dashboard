import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext();

/**
 * Hook to use toast notifications
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

/**
 * Toast Provider Component
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = "info", duration = 3000) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const value = useMemo(
    () => ({
      addToast,
      removeToast,
      success: (message, duration) => addToast(message, "success", duration),
      error: (message, duration) => addToast(message, "error", duration),
      info: (message, duration) => addToast(message, "info", duration),
    }),
    [addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Toast Container Component
 */
const ToastContainer = ({ toasts, onClose }) => {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <section
      className="fixed top-4 right-4 z-50 flex flex-col gap-2"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onClose(toast.id)}
        />
      ))}
    </section>
  );
};

ToastContainer.propTypes = {
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      message: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired,
};

/**
 * Individual Toast Component
 */
const Toast = ({ message, type, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} />;
      case "error":
        return <AlertCircle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-600 text-white";
      case "error":
        return "bg-red-600 text-white";
      default:
        return "bg-blue-600 text-white";
    }
  };

  return (
    <div
      className={`${getStyles()} px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md animate-slide-in`}
      role="alert"
    >
      {getIcon()}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="hover:bg-white/20 rounded p-1 transition-colors"
        aria-label="Close notification"
      >
        <X size={18} />
      </button>
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["success", "error", "info"]).isRequired,
  onClose: PropTypes.func.isRequired,
};
