import { Component, OnInit, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

import { Store } from '@ngrx/store';
import * as TasksActions from '../../store/tasks/tasks.actions';
import { selectTasks, selectTasksLoading } from '../../store/tasks/tasks.reducer';

import { Task } from '../../models/task.model';
import { Role } from '../../models/role.model';
import { TaskCreateDto } from '../../models/TaskCreateDto';
import { AuthStore } from '../../store/auth/auth.store';
import { CreateTaskPageComponent } from '../../pages/create-task-page/create-task-page.component';

type UserLite = { id: number; firstName: string; lastName: string };

@Component({
  selector: 'app-task-list-page',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatCardModule, MatButtonModule, RouterModule, TranslateModule],
  templateUrl: './task-list-page.component.html',
  styleUrls: ['./task-list-page.component.scss']
})
export class TaskListPageComponent implements OnInit {
  private store = inject(Store);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private authStore = inject(AuthStore);
  private http = inject(HttpClient);

  tasks: Signal<ReadonlyArray<Task>> = this.store.selectSignal(selectTasks);
  loading: Signal<boolean> = this.store.selectSignal(selectTasksLoading);

  users: UserLite[] = [];

  ngOnInit(): void {
    this.store.dispatch(TasksActions.loadTasks());
    this.loadUsers();
  }

  private loadUsers() {
    this.http.get<UserLite[]>('/api/users').subscribe({
      next: (users) => (this.users = users ?? []),
      error: () => (this.users = []),
    });
  }

  getAssignedUserName(assignedToId: number | null | undefined): string {
    if (!assignedToId) return 'Unassigned';
    const u = this.users.find(x => x.id === assignedToId);
    return u ? `${u.firstName} ${u.lastName}` : 'Unassigned';
  }

  deleteTask(id: number): void {
    this.store.dispatch(TasksActions.deleteTask({ id }));
  }

  openCreateTask() {
    const dialogRef = this.dialog.open(CreateTaskPageComponent, {
      width: '600px',
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
      data: { mode: 'create' },
    });

    dialogRef.afterClosed().subscribe((newTask: TaskCreateDto | undefined) => {
      if (newTask) {
        this.store.dispatch(TasksActions.addTask({ task: newTask }));
      }
    });
  }

  openUpdateTask(task: Task) {
    const dialogRef = this.dialog.open(CreateTaskPageComponent, {
      width: '600px',
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
      data: { mode: 'edit', task },
    });

    dialogRef.afterClosed().subscribe((updatedTask: TaskCreateDto | undefined) => {
      if (updatedTask) {
        this.store.dispatch(TasksActions.updateTask({ id: task.id, updatedTask }));
      }
    });
  }


  isAdmin(): boolean {
    return this.authStore.hasRole(Role.ADMIN);
  }

  get openTasks() {
    return this.tasks().filter(t => t.status === 'OPEN');
  }

  get progressTasks() {
    return this.tasks().filter(t => t.status === 'IN_PROGRESS');
  }

  get doneTasks() {
    return this.tasks().filter(t => t.status === 'DONE');
  }
}
