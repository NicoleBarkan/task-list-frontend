import { Component, inject, effect, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { TranslateModule } from '@ngx-translate/core';

import * as TasksActions from '../../store/tasks/tasks.actions';
import { Store } from '@ngrx/store';
import { UsersStore } from '../../store/users/users.store';
import { GroupService } from '../../services/group.service';
import { UserService } from '../../services/user.service';
import { GroupDto } from '../../models/group.model';
import { User } from '../../models/user.model';
import { getGroupNameById } from '../../utils/display.utils';

@Component({
  selector: 'app-user-list-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, MatButtonModule,
    MatFormFieldModule, MatSelectModule, MatOptionModule,
    RouterModule, TranslateModule
  ],
  templateUrl: './user-list-page.component.html',
  styleUrls: ['./user-list-page.component.scss']
})

export class UserListPageComponent implements OnInit {
  store = inject(UsersStore);
  private groupService = inject(GroupService);
  private userService  = inject(UserService);

  users = this.store.users;
  loading = this.store.loading;
  error = this.store.error;

  groups = signal<GroupDto[]>([]);
  saving = signal<Record<number, boolean>>({});
  private pendingUserId = signal<number | null>(null);

  constructor() {
    effect(() => {
      if (this.error()) console.error('Error loading users:', this.error());
    });

    effect(() => {
      const pending = this.pendingUserId();
      const isLoading = this.loading();

      if (pending != null && !isLoading) {
        const s = { ...this.saving() };
        delete s[pending];
        this.saving.set(s);
        this.pendingUserId.set(null);
      }
    });
  }

  ngOnInit(): void {
    this.groupService.list().subscribe({
      next: groups => this.groups.set(groups),
      error: () => this.groups.set([])
    });
  }

  currentGroupName(user: User): string {
    return getGroupNameById(this.groups(), user.groupId ?? null);
  }

  changeGroup(user: User, groupId: number) {
      this.saving.set({ ...this.saving(), [user.id]: true });
      this.pendingUserId.set(user.id);

      this.store.assignGroup({ id: user.id, groupId });
    }
}
