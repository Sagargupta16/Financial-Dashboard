// Helper Functions for Data Processing

export const parseCurrency = (value) => {
  if (typeof value !== "string") return 0;
  return parseFloat(value.replace(/[₹,]/g, "")) || 0;
};

export const parseDate = (dateString, timeString) => {
  if (!dateString || !timeString) return null;
  const dateParts = dateString.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  const timeParts = timeString.match(/(\d{2}):(\d{2}):(\d{2})/);
  if (!dateParts || !timeParts) return null;
  return new Date(
    dateParts[3],
    dateParts[2] - 1,
    dateParts[1],
    timeParts[1],
    timeParts[2],
    timeParts[3]
  );
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const downloadChart = (ref, fileName) => {
  if (ref.current) {
    Object.assign(document.createElement("a"), {
      href: ref.current.toBase64Image(),
      download: fileName,
    }).click();
  }
};
