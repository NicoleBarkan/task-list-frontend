import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskCreateComponent } from '../../components/task-create/task-create.component';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-create-task-page',
  standalone: true,
  imports: [CommonModule, TaskCreateComponent],
  templateUrl: './create-task-page.component.html',
  styleUrls: ['./create-task-page.component.scss'],
  providers: []
})
export class CreateTaskPageComponent {
  constructor(private taskService: TaskService) {}

  addTask(task: Task) {
    this.taskService.addTask(task);
  }
}
