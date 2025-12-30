import { HttpErrorResponse } from '@angular/common/http';

export function isHttpError(e: unknown): e is HttpErrorResponse {
  return !!e &&
    typeof e === 'object' &&
    'status' in (e as Record<string, unknown>) &&
    'error' in (e as Record<string, unknown>);
}

export function getHttpErrorMessage(
  e: unknown,
  fallback = 'Something went wrong'
): string {
  if (isHttpError(e)) {
    const data = e.error;

    if (typeof data === 'string' && data.trim()) {
      return data;
    }

    if (data && typeof data === 'object') {
      const anyData = data as any;

      if (typeof anyData.error === 'string' && anyData.error.trim()) {
        return anyData.error;
      }

      if (typeof anyData.message === 'string' && anyData.message.trim()) {
        return anyData.message;
      }
    }

    if (typeof e.message === 'string' && e.message.trim()) {
      return e.message;
    }
  }

  if (e instanceof Error && e.message) {
    return e.message;
  }

  return fallback;
}
