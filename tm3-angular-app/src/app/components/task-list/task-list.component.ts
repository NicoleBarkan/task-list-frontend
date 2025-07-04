import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Task } from '../../models/task.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent {
  @Input() tasks: Task[] = [];
  @Output() taskDeleted = new EventEmitter<number>();
  @Output() createTaskClicked = new EventEmitter<void>();

  deleteTask(id: number) {
    this.taskDeleted.emit(id);
  }

  onCreateTaskClick() {
    this.createTaskClicked.emit();
  }
}

