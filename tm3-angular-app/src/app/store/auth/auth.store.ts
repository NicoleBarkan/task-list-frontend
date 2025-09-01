import { computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  signalStore,
  withState,
  withMethods,
  withComputed,
  withHooks,
  patchState
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tap, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user.model';
import { AuthResponse } from '../../models/auth-response.model';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoggedIn: false,
  loading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },

  withState<AuthState>(initialState),

  withComputed((s) => ({
    fullName: computed(() =>
      s.user() ? `${s.user()!.firstName} ${s.user()!.lastName}` : ''
    ),
    role: computed(() => s.user()?.role ?? null),
  })),

  withMethods((store, http = inject(HttpClient), platformId = inject(PLATFORM_ID)) => {
    const isBrowser = isPlatformBrowser(platformId);

    const login = rxMethod<{ username: string; password: string }>(
      (params$) =>
        params$.pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(({ username, password }) =>
            http.post<AuthResponse>('/api/auth/login', { username, password }).pipe(
              tap({
                next: (res) => {
                  if (isBrowser) {
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userId', String(res.userId));
                  }

                  http.get<User>(`/api/users/${res.userId}`).subscribe({
                    next: (user) => {
                      if (user.role) {
                        localStorage.setItem('role', JSON.stringify(user.role));
                      }

                      patchState(store, {
                        user,
                        isLoggedIn: true,
                        loading: false,
                      });
                    },
                    error: () =>
                      patchState(store, {
                        loading: false,
                        error: 'Failed to fetch user details',
                      }),
                  });
                },
                error: (e: any) =>
                  patchState(store, {
                    loading: false,
                    error: e?.error?.message ?? 'Login failed',
                  }),
              })
            )
          )
        )
    );

    const register = rxMethod<{ username: string; password: string; firstName: string; lastName: string }>(
      (params$) =>
        params$.pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((payload) =>
            http.post<void>('/api/auth/register', payload).pipe(
              tap({
                next: () => {
                  login({ username: payload.username, password: payload.password });
                },
                error: (e: any) =>
                  patchState(store, {
                    loading: false,
                    error: e?.error?.message ?? 'Registration failed',
                  }),
              })
            )
          )
        )
    );

    const logout = () => {
      if (isBrowser) {
        localStorage.clear();
      }
      patchState(store, { user: null, isLoggedIn: false });
    };

    const hydrate = () => {
      if (!isBrowser) return;
      
      const logged = localStorage.getItem('isLoggedIn') === 'true';
      if (!logged) return;

      const userId = Number(localStorage.getItem('userId'));
      const role = localStorage.getItem('role');

      if (userId) {
        http.get<User>(`/api/users/${userId}`).subscribe({
          next: (user) => {
            patchState(store, {
              user: { ...user, role: user.role ?? (role ? JSON.parse(role) : []) },
              isLoggedIn: true,
            });
          },
          error: () => patchState(store, { user: null, isLoggedIn: false }),
        });
      }
    };

    return { login, register, logout, hydrate };
  }),

  withHooks({
    onInit(store) {
      store.hydrate();
    },
  })
);
