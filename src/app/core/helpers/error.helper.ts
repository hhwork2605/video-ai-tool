/**
 * Trích message lỗi từ HttpErrorResponse hoặc Error generic, trả string thân thiện.
 */
export function toErrorMessage(e: unknown, fallback = ''): string {
  if (e && typeof e === 'object') {
    const obj = e as { error?: { error?: string }; message?: unknown };
    if (obj.error?.error) return obj.error.error;
    if (typeof obj.message === 'string') return obj.message;
  }
  return fallback;
}
