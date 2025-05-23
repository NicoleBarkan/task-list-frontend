import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { Observable, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-task-details-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule],
  templateUrl: './task-details-page.component.html',
  styleUrls: ['./task-details-page.component.scss']
})
export class TaskDetailsPageComponent {
  constructor(private route: ActivatedRoute, private taskService: TaskService) {}

  get task$(): Observable<Task | null> {
    return this.route.paramMap.pipe(
      map(params => {
        const index = Number(params.get('id'));
        return this.taskService.getTaskById(index);
      })
    );
  }
}
