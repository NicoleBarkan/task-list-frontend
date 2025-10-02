import { HttpErrorResponse } from '@angular/common/http';

export function isHttpError(e: unknown): e is HttpErrorResponse {
  return !!e && typeof e === 'object'
    && 'status' in (e as Record<string, unknown>)
    && 'error' in (e as Record<string, unknown>);
}

export function getHttpErrorMessage(e: unknown, fallback = 'Something went wrong'): string {
  if (isHttpError(e)) {
    const data = e.error;
    if (typeof data === 'string' && data.trim()) return data;
    if (data && typeof data === 'object' && 'message' in (data as any)) {
      const m = (data as any).message;
      if (typeof m === 'string' && m.trim()) return m;
    }
    if (typeof e.message === 'string' && e.message.trim()) return e.message;
  }
  if (e instanceof Error && e.message) return e.message;
  return fallback;
}
