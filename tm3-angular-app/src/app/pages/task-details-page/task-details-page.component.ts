import { Component, OnInit, inject, Signal, computed, signal } from '@angular/core';
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
import { MatOptionModule } from '@angular/material/core'; 
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { Store } from '@ngrx/store';
import * as TasksActions from '../../store/tasks/tasks.actions';
import { selectSelectedTask } from '../../store/tasks/tasks.reducer';
import { UsersStore } from '../../store/users/users.store';
import { AuthStore } from '../../store/auth/auth.store';

import { GroupService } from '../../services/group.service';
import { GroupDto } from '../../models/group.model';
import { getGroupNameById } from '../../utils/display.utils';
import { TaskUpdateDto } from '../../models/TaskUpdateDto';

type TaskUpdatePayload = Partial<Task> & {
  group?: { id: number };
};

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
    MatOptionModule,            
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
  private groupsService = inject(GroupService);             

  readonly UNASSIGNED_GROUP_ID = 1;

  task: Signal<Task | null> = this.store.selectSignal(selectSelectedTask);
  allUsers: Signal<ReadonlyArray<User>> = this.usersStore.users;
  users = computed(() =>
    this.allUsers().filter(u => u.groupId !== this.UNASSIGNED_GROUP_ID)
  );

  assignedToId = computed(() => this.task()?.assignedTo ?? null);

  groups = signal<GroupDto[]>([]);                                 
  groupId = computed(() => this.task()?.groupId ?? null);  

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id)) {
      this.store.dispatch(TasksActions.loadTaskById({ id }));
    }
    this.usersStore.loadUsers();

    if (this.isAdminOrManager()) {
      this.groupsService.list().subscribe({
        next: groups => this.groups.set(groups),
        error: () => this.groups.set([])
      });
    }
  }

  onAssignedToChange(newUserId: number | null) {
    const task = this.task();
    if (!task) return;
    const payload: TaskUpdateDto = {
      assignedToId: newUserId ?? null
    };

    this.store.dispatch(
      TasksActions.updateTask({ id: task.id, updatedTask: payload })
    );
  }

  onGroupChange(newGroupId: number | null) {
    const task = this.task();
    if (!task || newGroupId == null) return;

    const assigneeId = task.assignedTo ?? null;

    const shouldUnassign =
      newGroupId === this.UNASSIGNED_GROUP_ID ||
      (assigneeId != null && (() => {
        const user = this.users().find(u => u.id === assigneeId);
        const userGroupId = user?.groupId ?? null;
        return userGroupId != null && userGroupId !== newGroupId;
      })());

    const payload: TaskUpdateDto = {
      groupId: newGroupId,
      assignedToId: shouldUnassign ? null : assigneeId
    };

    this.store.dispatch(
      TasksActions.updateTask({ id: task.id, updatedTask: payload })
    );
  }

  isAdminOrManager(): boolean {
    return this.authStore.hasRole(Role.MANAGER) || this.authStore.hasRole(Role.ADMIN);
  }

  get assignedUserName(): string {
    const currentId = this.assignedToId();
    if (!currentId) return 'Unassigned';
    const user = this.allUsers().find((u) => u.id === currentId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unassigned';
  }

  currentGroupNameById(id: number | null): string {
    return getGroupNameById(this.groups(), id);
  }

  trackById = (_: number, u: User) => u.id;

}
