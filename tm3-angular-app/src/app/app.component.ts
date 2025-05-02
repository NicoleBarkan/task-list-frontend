import { Component, OnInit } from '@angular/core';
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
export class AppComponent implements OnInit {
  tasks: Task[] = [];

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tasks');
      this.tasks = saved ? JSON.parse(saved) : [];
    }
  }

  addTask(task: Task) {
    this.tasks.push(task);
    this.saveTasks();
  }

  deleteTask(index: number) {
    this.tasks.splice(index, 1);
    this.saveTasks();
  }

  private saveTasks() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
  }
}
