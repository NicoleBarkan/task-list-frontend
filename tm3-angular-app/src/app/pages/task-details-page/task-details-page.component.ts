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
  private groupsApi = inject(GroupService);             

  task: Signal<Task | null> = this.store.selectSignal(selectSelectedTask);
  users: Signal<ReadonlyArray<User>> = this.usersStore.users;

  assignedToId = computed(() => this.task()?.assignedTo ?? null);

  groups: GroupDto[] = [];                                 
  groupId = computed(() => this.task()?.groupId ?? null);  

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id)) {
      this.store.dispatch(TasksActions.loadTaskById({ id }));
    }
    this.usersStore.loadUsers();

    if (this.IsAdminOrManager()) {
      this.groupsApi.list().subscribe({
        next: gs => this.groups = gs,
        error: () => this.groups = []
      });
    }
  }

  onAssignedToChange(newUserId: number | null) {
    const task = this.task();
    if (!task) return;
    const updated: Task = { ...task, assignedTo: newUserId ?? undefined };
    this.store.dispatch(TasksActions.updateTask({ id: task.id, updatedTask: updated }));
  }

  onGroupChange(newGroupId: number | null) {
    const task = this.task();
    if (!task || newGroupId == null) return;
    const updated: any = { group: { id: newGroupId } };
    this.store.dispatch(TasksActions.updateTask({ id: task.id, updatedTask: updated }));
  }

  IsAdminOrManager(): boolean {
    return this.authStore.hasRole(Role.MANAGER) || this.authStore.hasRole(Role.ADMIN);
  }

  get assignedUserName(): string {
    const currentId = this.assignedToId();
    if (!currentId) return 'Unassigned';
    const user = this.users().find((u) => u.id === currentId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unassigned';
  }

  groupNameById(id: number | null): string {
    if (!id) return '';
    const g = this.groups.find(x => x.id === id);
    return g?.name ?? String(id);
  }

  trackById = (_: number, u: User) => u.id;
}
