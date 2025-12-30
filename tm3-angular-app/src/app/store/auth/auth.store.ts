import { signalStore, withState, withMethods, withComputed, withHooks, patchState } from '@ngrx/signals';
import { inject, PLATFORM_ID, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { Role } from '../../models/role.model';
import { User } from '../../models/user.model';
import { getHttpErrorMessage } from '../../utils/http-error.utils';
import { EMPTY } from 'rxjs';

interface AuthState {
  user: User | null;
  roles: Role[];
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}
const initial: AuthState = { user:null, roles:[], isLoggedIn:false, loading:false, error:null };

interface LoginResponse { token: string; role?: string | string[]; roles?: string[]; }
type MeResponse = User & { role?: string | string[]; roles?: string[] };

function normalizeRoles(raw?: Array<string|Role>|string|null): Role[] {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  const known = new Set([Role.ADMIN, Role.MANAGER, Role.USER]);
    const canonical = arr
    .map(r => String(r).replace(/^ROLE_/i, '').toUpperCase())
    .filter(r => known.has(r as Role)) as Role[];
  return Array.from(new Set(canonical));
}

function readStoredRoles(isBrowser: boolean): Role[] {
  if (!isBrowser) return [];
  try {
    const raw = localStorage.getItem('roles');
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return normalizeRoles(parsed);
  } catch { return []; }
}

function writeStoredTokenAndRoles(isBrowser: boolean, token: string, roles: Role[] | string[] | string | null | undefined) {
  if (!isBrowser) return;
  localStorage.setItem('token', token);
  localStorage.setItem('roles', JSON.stringify(Array.isArray(roles) ? roles : roles ? [roles] : []));
}

function extractRoles(from: { role?: string | string[]; roles?: string[] } | null | undefined, isBrowser: boolean): Role[] {
  const incoming = from?.roles ?? from?.role ?? readStoredRoles(isBrowser);
  return normalizeRoles(incoming);
}

export const AuthStore = signalStore(
  { providedIn:'root' },
  withState<AuthState>(initial),
  withComputed(store => ({
    fullName: computed(() => [store.user()?.firstName, store.user()?.lastName].filter(Boolean).join(' ').trim()),
    username: computed(() => store.user()?.username ?? ''),
    rolesComputed: computed(() => store.roles()),
  })),
  withMethods((store, http = inject(HttpClient), platformId = inject(PLATFORM_ID)) => {
    const isBrowser = isPlatformBrowser(platformId);

    const setLoggedOut = () => {
      if (isBrowser) { localStorage.removeItem('token'); localStorage.removeItem('roles'); }
      patchState(store, { user:null, roles:[], isLoggedIn:false, loading:false, error:null });
    };

    const login = rxMethod<{ username: string; password: string }>(params$ =>
      params$.pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ username, password }) =>
          http.post<LoginResponse>('/api/auth/login', { username, password }).pipe(
            tap(res => writeStoredTokenAndRoles(isBrowser, res.token, res.roles ?? res.role ?? [])),
            switchMap(() => http.get<MeResponse>('/api/users/me')),
            tap((u) => {
              const roles = extractRoles(u, isBrowser);
              patchState(store, { user: u, roles, isLoggedIn: true, loading: false });
            }),
            catchError((e: unknown) => {
              patchState(store, {
                loading: false,
                error: getHttpErrorMessage(e, 'LOGIN.INVALID_CREDENTIALS'),
              });
              return EMPTY;
            })
          )
        )
      )
    );


    const register = rxMethod<{ username: string; password: string; firstName: string; lastName: string }>(params$ =>
      params$.pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(p =>
          http.post<void>('/api/auth/register', p).pipe(
            switchMap(() => http.post<LoginResponse>('/api/auth/login', { username: p.username, password: p.password })),
            tap(res => writeStoredTokenAndRoles(isBrowser, res.token, res.roles ?? res.role ?? [])),
            switchMap(() => http.get<MeResponse>('/api/users/me')),
            tap((u) => {
              const roles = extractRoles(u, isBrowser);
              patchState(store, { user: u, roles, isLoggedIn: true, loading: false });
            }),
            catchError((e: unknown) => {
              patchState(store, {
                loading: false,
                error: getHttpErrorMessage(e, 'REGISTER.REGISTRATION_FAILED'),
              });
              return EMPTY;
            })
          )
        )
      )
    );

    const logout = () => setLoggedOut();

    const hydrate = () => {
      if (!isBrowser) return;
      const token = localStorage.getItem('token');
      if (!token) return;
      http.get<MeResponse>('/api/users/me').subscribe({
        next: (u) => {
          const roles = extractRoles(u, isBrowser);
          patchState(store, { user: u, roles, isLoggedIn: true, loading: false });
        },
        error: () => setLoggedOut()
      });
    };

    const hasRole = (role: Role) => store.roles().includes(role);
    return { login, register, logout, hydrate, hasRole };
  }),
  withHooks({ onInit(store){ store.hydrate(); } })
);
