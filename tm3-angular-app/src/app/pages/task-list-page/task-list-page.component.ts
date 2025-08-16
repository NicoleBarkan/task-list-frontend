import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Task } from '../../models/task.model';
import { Router } from '@angular/router';
import { CreateTaskPageComponent } from '../../pages/create-task-page/create-task-page.component';
import { Observable, Subject } from 'rxjs';
import { map,  takeUntil } from 'rxjs/operators';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-task-list-page',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatCardModule, MatButtonModule, RouterModule, TranslateModule ],
  templateUrl: './task-list-page.component.html',
  styleUrls: ['./task-list-page.component.scss']
})
export class TaskListPageComponent implements OnInit, OnDestroy {
  tasks$: Observable<Task[]> | null = null;
  firstName: string = '';
  lastName: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private taskService: TaskService, 
    private dialog: MatDialog, 
    private router: Router,
    private userService: UserService,
    private auth: AuthService
 ) {}

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    this.loadTasks();

    const userId = localStorage.getItem('userId');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (isLoggedIn && userId) {
      this.userService.fetchUserDetails(userId);
    } else {
    this.router.navigate(['/login']);
    return;
  }

    this.userService.getUserDetails()      
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.firstName = user.firstName;
          this.lastName = user.lastName;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTasks(): void {
    this.tasks$ = this.taskService.getTasks().pipe(
      map(tasks => tasks ?? [])
    );
  }

  deleteTask(id: number): void {
    this.taskService.deleteTask(id).subscribe(() => {
      this.loadTasks();
    });
  }
  
  updateTask(id: number, updatedTask: Task) {
    this.taskService.updateTask(id, updatedTask).subscribe(() => {
      this.loadTasks();
      this.router.navigate(['/tasks']);
    });
  }

  openCreateTask() {
    const dialogRef = this.dialog.open(CreateTaskPageComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed()
    .pipe(takeUntil(this.destroy$))
    .subscribe((newTask: Task | undefined) => {
      if (newTask) {
        this.taskService.addTask(newTask).subscribe(() => {
          this.loadTasks();
          this.router.navigate(['/tasks']);
        });
      } else {
        this.router.navigate(['/tasks']);
      }
    });
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }
}
