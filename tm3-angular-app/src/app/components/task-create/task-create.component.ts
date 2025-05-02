import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { Task } from '../../models/task.model'; 


@Component({
  selector: 'app-task-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule
  ],
  templateUrl: './task-create.component.html',
  styleUrls: ['./task-create.component.scss']
})
export class TaskCreateComponent {
  taskForm: FormGroup;

  @Output() taskCreated = new EventEmitter<Task>();

  constructor(private fb: FormBuilder) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      type: ['', Validators.required],
      status: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const newTask = {
        ...this.taskForm.value,
        createdOn: new Date().toISOString()
      };
      this.taskCreated.emit(newTask);
      this.taskForm.reset();
    }
  }
}
