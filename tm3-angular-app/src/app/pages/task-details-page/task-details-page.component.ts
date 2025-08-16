import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { Role } from '../../models/role.model';
import { AuthService } from '../../services/auth.service';
import { Observable, switchMap, of, Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

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
export class TaskDetailsPageComponent implements OnDestroy {
  task$: Observable<Task | null>;
  task: Task | null = null;
  users: User[] = [];
  assignedToId: number | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private userService: UserService,
    private auth: AuthService
  ) {
    this.task$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        return isNaN(id) ? of(null) : this.taskService.getTaskById(id);
      })
    );

    this.task$.subscribe(task => {
      this.task = task;
      this.assignedToId = task?.assignedTo ?? null;
    });

    this.userService.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe(users => {
        this.users = users;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onAssignedToChange() {
    if (!this.task) return;

    const updatedTask: Task = {
      ...this.task,
      assignedTo: this.assignedToId ?? undefined
    };

    this.taskService.updateTask(updatedTask.id!, updatedTask).subscribe(updated => {
      this.task = updated;
    });
  }

  canAssign(): boolean {
    return this.auth.hasRole(Role.MANAGER);
  }

  get assignedUserName(): string {
    if (!this.assignedToId) return 'Unassigned';
    const user = this.users.find(u => u.id === this.assignedToId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unassigned';
  }
}
