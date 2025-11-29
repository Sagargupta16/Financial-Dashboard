import PropTypes from "prop-types";

/**
 * Skeleton Component - Loading placeholder with shimmer animation
 */
export const Skeleton = ({ className = "", variant = "default", ...props }) => {
  const baseClasses =
    "animate-pulse bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] rounded";

  const variantClasses = {
    default: "h-4 w-full",
    card: "h-48 w-full rounded-2xl",
    circle: "h-12 w-12 rounded-full",
    button: "h-10 w-24 rounded-lg",
    text: "h-3 w-3/4",
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{
        animation: "shimmer 2s infinite",
      }}
      {...props}
    />
  );
};

Skeleton.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(["default", "card", "circle", "button", "text"]),
};

/**
 * SkeletonCard - KPI Card skeleton for loading state
 */
export const SkeletonCard = () => (
  <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-6 rounded-2xl shadow-xl border border-gray-700">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-5 w-32" />
      <Skeleton variant="circle" className="h-12 w-12" />
    </div>
    <Skeleton className="h-10 w-40" />
  </div>
);

/**
 * SmallSkeletonCard - Small KPI Card skeleton for loading state
 */
export const SmallSkeletonCard = () => (
  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg shadow-lg border border-gray-700">
    <div className="flex items-center justify-between mb-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton variant="circle" className="h-6 w-6" />
    </div>
    <Skeleton className="h-8 w-32" />
  </div>
);

/**
 * TableRowSkeleton - Transaction table row skeleton
 */
export const TableRowSkeleton = ({ columns = 6 }) => {
  const columnIds = Array.from(
    { length: columns },
    () => `col-${crypto.randomUUID()}`
  );

  return (
    <tr className="border-b border-gray-700">
      {columnIds.map((id) => (
        <td key={id} className="p-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
};

TableRowSkeleton.propTypes = {
  columns: PropTypes.number,
};

/**
 * Chart Skeleton - Animated loading skeleton for charts
 * Using fixed heights for better visual consistency
 */
export const ChartSkeleton = ({ height = "300px" }) => {
  // Predefined heights for better visual consistency
  const barHeights = ["45%", "70%", "55%", "85%", "60%", "75%", "50%", "65%"];
  const barIds = barHeights.map(() => `bar-${crypto.randomUUID()}`);

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700">
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="flex items-end justify-between gap-2" style={{ height }}>
        {barHeights.map((barHeight, index) => (
          <Skeleton
            key={barIds[index]}
            className="w-full"
            style={{ height: barHeight }}
          />
        ))}
      </div>
    </div>
  );
};

ChartSkeleton.propTypes = {
  height: PropTypes.string,
};

// Add shimmer animation to global styles
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
  document.head.appendChild(style);
}
