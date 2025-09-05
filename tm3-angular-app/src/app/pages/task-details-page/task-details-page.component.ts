import { Component, OnInit, inject, Signal, computed } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Task } from '../../models/task.model';
import { User } from '../../models/user.model';
import { Role } from '../../models/role.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { Store } from '@ngrx/store';
import * as TasksActions from '../../store/tasks/tasks.actions';
import { selectSelectedTask } from '../../store/tasks/tasks.reducer';
import { UsersStore } from '../../store/users/users.store';
import { AuthStore } from '../../store/auth/auth.store';

@Component({
  selector: 'app-task-details-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    TranslateModule
  ],
  templateUrl: './task-details-page.component.html',
  styleUrls: ['./task-details-page.component.scss']
})
export class TaskDetailsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private store = inject(Store);
  private usersStore = inject(UsersStore);
  private authStore = inject(AuthStore);

  task: Signal<Task | null> = this.store.selectSignal(selectSelectedTask);
  users: Signal<ReadonlyArray<User>> = this.usersStore.users;

  assignedToId = computed(() => this.task()?.assignedTo ?? null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id)) {
      this.store.dispatch(TasksActions.loadTaskById({ id }));
    }
    this.usersStore.loadUsers();
  }

  onAssignedToChange(newUserId: number | null) {
    const task = this.task();
    if (!task) return;
    const updated: Task = { ...task, assignedTo: newUserId ?? undefined };
    this.store.dispatch(TasksActions.updateTask({ id: task.id, updatedTask: updated }));
  }

  canAssign(): boolean {
    return this.authStore.user()?.role?.includes(Role.MANAGER) ?? false;
  }

  get assignedUserName(): string {
    const currentId = this.assignedToId();
    if (!currentId) return 'Unassigned';
    const user = this.users().find((u) => u.id === currentId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unassigned';
  }

  trackById = (_: number, u: User) => u.id;
}
