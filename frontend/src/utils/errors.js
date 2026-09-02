/**
 * Turns an axios error into something worth showing the user.
 *
 * Covers the three shapes the backend actually produces:
 * - no response at all (server down, wrong port, request blocked)
 * - a DRF payload, either { detail: "..." } or { email: ["..."] }
 * - Django's DEBUG error page, which is HTML and carries no usable fields
 */
export function getErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  if (!err.response) {
    return "Cannot reach the server. Check that the backend is running, then try again.";
  }

  const { status, data } = err.response;

  if (data && typeof data === "object") {
    if (typeof data.detail === "string") return data.detail;

    for (const value of Object.values(data)) {
      if (Array.isArray(value) && typeof value[0] === "string") return value[0];
      if (typeof value === "string") return value;
    }
  }

  if (status >= 500) {
    return `Server error (${status}). Check the backend logs for details.`;
  }

  return fallback;
}
