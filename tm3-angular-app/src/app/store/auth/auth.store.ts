import { signalStore, withState, withMethods, withComputed, withHooks, patchState } from '@ngrx/signals';
import { inject, PLATFORM_ID, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tap, switchMap } from 'rxjs/operators';
import { Role } from '../../models/role.model';
import { User } from '../../models/user.model';

interface AuthState {
  user: User | null;
  roles: Role[];
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}
const initial: AuthState = { user:null, roles:[], isLoggedIn:false, loading:false, error:null };

function normalizeRoles(raw?: Array<string|Role>|string|null): Role[] {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  const known = new Set([Role.ADMIN, Role.MANAGER, Role.USER]);
  return Array.from(new Set(arr.map(r => String(r).replace(/^ROLE_/i,'').toUpperCase()))).filter(r => known.has(r as Role)) as Role[];
}

export const AuthStore = signalStore(
  { providedIn:'root' },
  withState<AuthState>(initial),
  withComputed(s => ({
    fullName: computed(() => [s.user()?.firstName, s.user()?.lastName].filter(Boolean).join(' ').trim()),
    username: computed(() => s.user()?.username ?? ''),
    rolesComputed: computed(() => s.roles()),
  })),
  withMethods((store, http = inject(HttpClient), platformId = inject(PLATFORM_ID)) => {
    const isBrowser = isPlatformBrowser(platformId);

    const setLoggedOut = () => {
      if (isBrowser) { localStorage.removeItem('token'); localStorage.removeItem('roles'); }
      patchState(store, { user:null, roles:[], isLoggedIn:false, loading:false, error:null });
    };

    const login = rxMethod<{ username:string; password:string }>(params$ =>
      params$.pipe(
        tap(() => patchState(store, { loading:true, error:null })),
        switchMap(({ username, password }) =>
          http.post<any>('/api/auth/login', { username, password }).pipe( 
            switchMap(res => {
              if (isBrowser) {
                localStorage.setItem('token', res.token);
                localStorage.setItem('roles', JSON.stringify(res.role ?? []));
              }
              return http.get<User>('/api/users/me');
            }),
            tap({
              next: (u) => {
                const roles = normalizeRoles((u as any).role ?? (u as any).roles ?? JSON.parse(localStorage.getItem('roles') || '[]'));
                patchState(store, { user:u, roles, isLoggedIn:true, loading:false });
              },
              error: (e:any) => patchState(store, { loading:false, error: e?.error?.message ?? 'Login failed' })
            })
          )
        )
      )
    );

    const register = rxMethod<{ username:string; password:string; firstName:string; lastName:string }>(params$ =>
      params$.pipe(
        tap(() => patchState(store, { loading:true, error:null })),
        switchMap(p => http.post<void>('/api/auth/register', p).pipe(
          switchMap(() => http.post<any>('/api/auth/login', { username:p.username, password:p.password })),
          switchMap(res => {
            if (isBrowser) { localStorage.setItem('token', res.token); localStorage.setItem('roles', JSON.stringify(res.role ?? [])); }
            return http.get<User>('/api/users/me');
          }),
          tap({
            next: (u) => {
              const roles = normalizeRoles((u as any).role ?? (u as any).roles ?? JSON.parse(localStorage.getItem('roles') || '[]'));
              patchState(store, { user:u, roles, isLoggedIn:true, loading:false });
            },
            error: (e:any) => patchState(store, { loading:false, error: e?.error?.message ?? 'Registration failed' })
          })
        ))
      )
    );

    const logout = () => setLoggedOut();

    const hydrate = () => {
      if (!isBrowser) return;
      const token = localStorage.getItem('token');
      if (!token) return;
      http.get<User>('/api/users/me').subscribe({
        next: u => {
          const roles = normalizeRoles((u as any).role ?? (u as any).roles ?? JSON.parse(localStorage.getItem('roles') || '[]'));
          patchState(store, { user:u, roles, isLoggedIn:true, loading:false });
        },
        error: () => setLoggedOut()
      });
    };

    const hasRole = (role: Role) => store.roles().includes(role);
    return { login, register, logout, hydrate, hasRole };
  }),
  withHooks({ onInit(store){ store.hydrate(); } })
);
