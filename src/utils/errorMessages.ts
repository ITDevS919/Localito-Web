/**
 * Centralized error message utility
 * Maps technical errors to user-friendly messages with actionable recovery steps
 */

export interface ErrorMessage {
  message: string;
  recovery?: string;
}

/**
 * Converts technical error messages to user-friendly ones
 * @param error - The error message or error object
 * @returns User-friendly error message with optional recovery steps
 */
export function getUserFriendlyError(error: string | Error | unknown): ErrorMessage {
  // Extract message from error object
  let errorMessage = "";
  if (typeof error === "string") {
    errorMessage = error;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (error && typeof error === "object" && "message" in error) {
    errorMessage = String(error.message);
  } else {
    errorMessage = "An unexpected error occurred";
  }

  // Normalize error message for matching
  const normalizedError = errorMessage.toLowerCase().trim();

  // Network/Connection errors
  if (
    normalizedError.includes("failed to fetch") ||
    normalizedError.includes("networkerror") ||
    normalizedError.includes("econnrefused") ||
    normalizedError.includes("network request failed")
  ) {
    return {
      message: "Unable to connect to the server. Please check your internet connection.",
      recovery: "Try refreshing the page or check if you're connected to the internet.",
    };
  }

  // Authentication errors
  if (
    normalizedError.includes("401") ||
    normalizedError.includes("unauthorized") ||
    normalizedError.includes("not authenticated")
  ) {
    return {
      message: "Please log in to continue.",
      recovery: "You may need to log in again. Click here to go to the login page.",
    };
  }

  // Permission errors
  if (
    normalizedError.includes("403") ||
    normalizedError.includes("forbidden") ||
    normalizedError.includes("permission denied")
  ) {
    return {
      message: "You don't have permission to perform this action.",
      recovery: "If you believe this is an error, please contact support.",
    };
  }

  // Not found errors
  if (
    normalizedError.includes("404") ||
    normalizedError.includes("not found")
  ) {
    return {
      message: "The requested item was not found.",
      recovery: "The item may have been removed or the link may be incorrect.",
    };
  }

  // Server errors
  if (
    normalizedError.includes("500") ||
    normalizedError.includes("internal server error") ||
    normalizedError.includes("server error")
  ) {
    return {
      message: "Something went wrong on our end. Please try again later.",
      recovery: "If the problem persists, please contact support.",
    };
  }

  // Stock/availability errors
  if (
    normalizedError.includes("out of stock") ||
    normalizedError.includes("insufficient stock") ||
    normalizedError.includes("stock")
  ) {
    return {
      message: errorMessage, // Keep original message for stock errors as they're usually clear
      recovery: "Try reducing the quantity or selecting a different item.",
    };
  }

  // Payment errors
  if (
    normalizedError.includes("payment") ||
    normalizedError.includes("stripe") ||
    normalizedError.includes("checkout")
  ) {
    return {
      message: "There was an issue processing your payment.",
      recovery: "Please try again or use a different payment method.",
    };
  }

  // Cart errors
  if (normalizedError.includes("cart")) {
    return {
      message: errorMessage, // Cart errors are usually clear
      recovery: "Try refreshing the page or clearing your cart and starting over.",
    };
  }

  // Validation errors
  if (
    normalizedError.includes("validation") ||
    normalizedError.includes("invalid") ||
    normalizedError.includes("required")
  ) {
    return {
      message: errorMessage, // Validation errors are usually clear
      recovery: "Please check your input and try again.",
    };
  }

  // Default: return original message if no mapping found
  return {
    message: errorMessage || "An unexpected error occurred. Please try again.",
    recovery: "If the problem persists, please contact support.",
  };
}

/**
 * Formats error message for display in UI
 * @param error - The error message or error object
 * @param showRecovery - Whether to include recovery steps
 * @returns Formatted error message string
 */
export function formatErrorForDisplay(
  error: string | Error | unknown,
  showRecovery: boolean = false
): string {
  const friendlyError = getUserFriendlyError(error);
  if (showRecovery && friendlyError.recovery) {
    return `${friendlyError.message} ${friendlyError.recovery}`;
  }
  return friendlyError.message;
}
