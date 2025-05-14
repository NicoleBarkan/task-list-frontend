import { Component } from '@angular/core';
import { Task } from './models/task.model';
import { TaskCreateComponent } from './components/task-create/task-create.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TaskCreateComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  tasks: Task[] = [];

  addTask(task: Task) {
    this.tasks.push(task);
  }
}
