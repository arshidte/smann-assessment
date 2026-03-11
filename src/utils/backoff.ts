/**
 * Calculates exponential backoff delay for reconnection attempts.
 *
 * @param attempt - 1-based attempt number (first attempt = 1)
 * @returns delay in milliseconds: min(2^(attempt-1) * 1000, 30000)
 */
export function calculateBackoff(attempt: number): number {
  return Math.min(Math.pow(2, attempt - 1) * 1000, 30000);
}
