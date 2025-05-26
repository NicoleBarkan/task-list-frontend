import { Component } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { TaskListComponent } from '../../components/task-list/task-list.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-list-page',
  standalone: true,
  imports: [CommonModule, TaskListComponent],
  templateUrl: './task-list-page.component.html',
  styleUrls: ['./task-list-page.component.scss']
})

export class TaskListPageComponent {
  constructor(private taskService: TaskService) {}

  get tasks(): Task[] {
    return this.taskService.getTasks();
  }

  deleteTask(index: number) {
    this.taskService.deleteTask(index);
  }
}
