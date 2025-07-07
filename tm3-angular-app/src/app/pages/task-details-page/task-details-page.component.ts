import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { Observable, switchMap, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

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
  ],
  templateUrl: './task-details-page.component.html',
  styleUrls: ['./task-details-page.component.scss']
})
export class TaskDetailsPageComponent {
  task$: Observable<Task | null>;
  task: Task | null = null;
  users: User[] = [];
  assignedToId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private userService: UserService
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

    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
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
}
