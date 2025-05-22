import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { Observable, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-task-details-page',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './task-details-page.component.html',
  styleUrls: ['./task-details-page.component.scss']
})
export class TaskDetailsPageComponent {
  task$: Observable<Task | undefined> = this.route.paramMap.pipe(
    map(params => {
      const index = Number(params.get('id'));
      return this.taskService.getTaskById(index);
    })
  );

  constructor(private route: ActivatedRoute, private taskService: TaskService) {}
}
