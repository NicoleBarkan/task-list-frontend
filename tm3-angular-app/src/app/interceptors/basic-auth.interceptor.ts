import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

function getTokenSafe(): string | null {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      return localStorage.getItem('token');
    }
  } catch {}
  return null;
}

function getBasicSafe(): string | null {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      return localStorage.getItem('basicAuth');
    }
  } catch {}
  return null;
}

@Injectable()
export class BasicAuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.startsWith('/api')) {
      const bearer = getTokenSafe();
      const basic  = getBasicSafe();

      if (bearer) {
        req = req.clone({ setHeaders: { Authorization: `Bearer ${bearer}` } });
      } else if (basic) {
        req = req.clone({ setHeaders: { Authorization: basic } });
      }
    }

    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          try {
            if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
              localStorage.removeItem('token');
              localStorage.removeItem('role');
              localStorage.removeItem('userId');
              localStorage.removeItem('basicAuth');
              localStorage.removeItem('isLoggedIn');
              localStorage.removeItem('roles');
            }
          } catch {}
        }
        return throwError(() => err);
      })
    );
  }
}
