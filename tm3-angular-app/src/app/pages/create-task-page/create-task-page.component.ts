import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskCreateComponent } from '../../components/task-create/task-create.component';

@Component({
  selector: 'app-create-task-page',
  standalone: true,
  imports: [CommonModule, TaskCreateComponent],
  templateUrl: './create-task-page.component.html',
  styleUrls: ['./create-task-page.component.scss'],
})
export class CreateTaskPageComponent {}
