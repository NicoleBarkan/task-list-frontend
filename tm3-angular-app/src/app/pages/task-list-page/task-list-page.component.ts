import { Component, OnInit, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { Role } from '../../models/role.model';
import { Router, RouterModule } from '@angular/router';
import { CreateTaskPageComponent } from '../../pages/create-task-page/create-task-page.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import * as TasksActions from '../../store/tasks/tasks.actions';
import { selectTasks, selectTasksLoading } from '../../store/tasks/tasks.reducer';
import { AuthStore } from '../../store/auth/auth.store';


@Component({
  selector: 'app-task-list-page',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatCardModule, MatButtonModule, RouterModule, TranslateModule ],
  templateUrl: './task-list-page.component.html',
  styleUrls: ['./task-list-page.component.scss']
})
export class TaskListPageComponent implements OnInit {
  private store = inject(Store);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private authStore = inject(AuthStore);

  tasks: Signal<ReadonlyArray<Task>> = this.store.selectSignal(selectTasks);
  loading: Signal<boolean> = this.store.selectSignal(selectTasksLoading);

  firstName = '';
  lastName = '';

  logout(): void {
    this.authStore.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    this.store.dispatch(TasksActions.loadTasks());

    const user = this.authStore.user();
    if (user) {
      this.firstName = user.firstName;
      this.lastName = user.lastName;
    } else {
      this.router.navigate(['/login']);
    }
  }

  deleteTask(id: number): void {
    this.store.dispatch(TasksActions.deleteTask({ id }));
  }
  
  updateTask(id: number, updatedTask: Task) {
    this.store.dispatch(TasksActions.updateTask({ id, updatedTask }));
  }

  openCreateTask() {
    const dialogRef = this.dialog.open(CreateTaskPageComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((newTask: Task | undefined) => {
      if (newTask) {
        this.store.dispatch(TasksActions.addTask({ task: newTask }));
      }
    });
  }

  isAdmin(): boolean {
    return this.authStore.user()?.role?.includes(Role.ADMIN) ?? false;
  }

  trackById = (_: number, task: Task) => task.id;
}
