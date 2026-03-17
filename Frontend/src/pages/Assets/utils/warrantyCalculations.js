/**
 * Frontend Warranty Calculation Utility
 * Mirrors backend logic for warranty till date and remaining warranty
 */

/**
 * Calculate warranty till date based on warranty mode
 * @param {Object} formData - form data object
 * @param {string} invoiceDate - invoice date (YYYY-MM-DD format)
 * @returns {string|null} warranty till date in YYYY-MM-DD format or null
 */
export const calculateWarrantyTillDate = (formData, invoiceDate) => {
  const warrantyAvailable = String(formData.warrantyAvailable || "").toLowerCase();
  
  if (warrantyAvailable !== "yes") {
    return null;
  }

  const warrantyMode = String(formData.warrantyMode || "").toLowerCase();

  // If mode is EndDate, use warrantyEndDate directly but subtract 1 day
  if (warrantyMode === "enddate") {
    if (!formData.warrantyEndDate) return null;
    try {
      const endDate = new Date(formData.warrantyEndDate);
      endDate.setDate(endDate.getDate() - 1); // Warranty till date is 1 day before end date
      const month = String(endDate.getMonth() + 1).padStart(2, "0");
      const day = String(endDate.getDate()).padStart(2, "0");
      return `${endDate.getFullYear()}-${month}-${day}`;
    } catch (e) {
      console.error("Error calculating warranty till date:", e);
      return null;
    }
  }

  // If mode is Duration, calculate from invoiceDate + duration, then subtract 1 day
  if (warrantyMode === "duration") {
    if (!invoiceDate) return null;

    try {
      const startDate = new Date(invoiceDate);
      const inYear = Number(formData.inYear) || 0;
      const inMonth = Number(formData.inMonth) || 0;

      // Create new date and add years and months
      const result = new Date(startDate);
      result.setFullYear(result.getFullYear() + inYear);
      result.setMonth(result.getMonth() + inMonth);
      
      // Subtract 1 day - warranty lasts until the day before
      result.setDate(result.getDate() - 1);

      // Format to YYYY-MM-DD
      const month = String(result.getMonth() + 1).padStart(2, "0");
      const day = String(result.getDate()).padStart(2, "0");
      return `${result.getFullYear()}-${month}-${day}`;
    } catch (e) {
      console.error("Error calculating warranty till date:", e);
      return null;
    }
  }

  return null;
};

/**
 * Calculate warranty status based on warranty till date
 * Industrial Standard: If today's date > warrantyTillDate, warranty is expired
 * @param {string} warrantyTillDate - warranty till date (YYYY-MM-DD format)
 * @returns {string|null} "Under Warranty" or "Expired" or null
 */
export const calculateWarrantyStatus = (warrantyTillDate) => {
  if (!warrantyTillDate) return null;

  try {
    const tillDate = new Date(warrantyTillDate);
    const today = new Date();

    // Set time to start of day for accurate comparison
    tillDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // If today is after warranty till date, warranty is expired
    if (today > tillDate) {
      return "Expired";
    }

    // Otherwise warranty is still under coverage
    return "Under Warranty";
  } catch (e) {
    console.error("Error calculating warranty status:", e);
    return null;
  }
};

