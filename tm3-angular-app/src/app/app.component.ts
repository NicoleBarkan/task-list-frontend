import { Component } from '@angular/core';
import { TaskService } from './services/task.service';
import { Task } from './models/task.model';
import { TaskCreateComponent } from './components/task-create/task-create.component';
import { TaskListComponent } from './components/task-list/task-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TaskCreateComponent, TaskListComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public taskService: TaskService) {}

  get tasks(): Task[] {
    return this.taskService.getTasks();
  }

  addTask(task: Task) {
    this.taskService.addTask(task);
  }

  deleteTask(index: number) {
    this.taskService.deleteTask(index);
  }
}
