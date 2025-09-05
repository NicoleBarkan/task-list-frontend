import { inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { Role } from '../../models/role.model';
import { withHooks } from '@ngrx/signals';

interface UsersState {
  list: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  list: [],
  selectedUser: null,
  loading: false,
  error: null,
};

export const UsersStore = signalStore(
  { providedIn: 'root' },
  withState<UsersState>(initialState),
  withComputed((s) => ({
    users: computed(() => s.list()),
    selectedUser: computed(() => s.selectedUser()),
    loading: computed(() => s.loading()),
    error: computed(() => s.error()),
  })),
  withMethods((store, userService = inject(UserService)) => {
    const loadUsers = rxMethod<void>(
      pipe(
        switchMap(() => {
          patchState(store, { loading: true, error: null });
          return userService.getUsers().pipe(
            tap({
              next: (users: User[]) =>
                patchState(store, { list: users, loading: false }),
              error: (e: any) =>
                patchState(store, {
                  loading: false,
                  error: e?.error?.message ?? 'Failed to load users',
                }),
            })
          );
        })
      )
    );

    const loadUserById = rxMethod<number>(
      pipe(
        switchMap((id) => {
          patchState(store, { loading: true, error: null });
          return userService.getUserById(id).pipe(
            tap({
              next: (user: User) =>
                patchState(store, { selectedUser: user, loading: false }),
              error: (e: any) =>
                patchState(store, {
                  loading: false,
                  error: e?.error?.message ?? 'Failed to load user',
                }),
            })
          );
        })
      )
    );

    const updateUserRole = rxMethod<{ id: number; role: Role[] }>(
      pipe(
        switchMap(({ id, role }) => {
          patchState(store, { loading: true, error: null });
          return userService.updateUserRole(id, role).pipe(
            tap({
              next: (user: User) =>
                patchState(store, {
                  list: store.list().map((u) =>
                    u.id === user.id ? user : u
                  ),
                  selectedUser: user,
                  loading: false,
                }),
              error: (e: any) =>
                patchState(store, {
                  loading: false,
                  error: e?.error?.message ?? 'Failed to update role',
                }),
            })
          );
        })
      )
    );

    return { loadUsers, loadUserById, updateUserRole };
  }),
  withHooks({
    onInit(store) {
      store.loadUsers(); 
    },
  })
);
