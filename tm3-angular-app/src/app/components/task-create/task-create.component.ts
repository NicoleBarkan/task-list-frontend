import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
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
    MatButtonModule,
  ],
  templateUrl: './task-create.component.html',
  styleUrls: ['./task-create.component.scss']
})
export class TaskCreateComponent implements OnChanges {
  @Input() task?: Task;
  @Output() taskCreated = new EventEmitter<Task>();

  taskForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(200)]],
      type: ['', Validators.required],
      status: ['', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task) {
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description,
        type: this.task.type,
        status: this.task.status
      });
    }
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const updatedTask: Task = {
        ...(this.task || {}),
        ...this.taskForm.value,
        createdOn: this.task?.createdOn || new Date().toISOString()
      };

      this.taskCreated.emit(updatedTask);
      this.taskForm.reset();
    } else {
      this.taskForm.markAllAsTouched();
    }
  }

  get title() {
    return this.taskForm.get('title');
  }

  get description() {
    return this.taskForm.get('description');
  }

  get type() {
    return this.taskForm.get('type');
  }

  get status() {
    return this.taskForm.get('status');
  }
}
