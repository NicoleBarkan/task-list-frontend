import { Component, Input } from '@angular/core';
import { CommonModule, NgFor, DatePipe, TitleCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    NgFor,
    DatePipe,
    TitleCasePipe
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent {
  @Input() tasks: Task[] = [];

  deleteTask(index: number) {
    this.tasks.splice(index, 1);
    // здесь можно также вызвать Output, если хочешь сохранить изменения в родителе
  }
}
