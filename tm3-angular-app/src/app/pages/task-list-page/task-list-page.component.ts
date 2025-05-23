import { Component } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-list-page',
  standalone: true,
  imports: [],
  templateUrl: './task-list-page.component.html',
  styleUrls: ['./task-list-page.component.scss']
})

export class TaskListPageComponent {
  tasks: Task[] = this.taskService.getTasks();

  constructor(private taskService: TaskService) {}

  deleteTask(index: number) {
    this.taskService.deleteTask(index);
  }
}
