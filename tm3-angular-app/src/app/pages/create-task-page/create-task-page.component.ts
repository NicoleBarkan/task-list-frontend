import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { Task } from '../../models/task.model';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-task-page',
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
  templateUrl: './create-task-page.component.html',
  styleUrls: ['./create-task-page.component.scss']
})
export class CreateTaskPageComponent implements OnInit {
  task?: Task;
  users: User[] = [];
  isEditMode = false;

  taskForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private dialogRef: MatDialogRef<CreateTaskPageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { task?: Task; isEditMode?: boolean },
    private userService: UserService
  ) {}

  ngOnInit() {
    this.task = this.data?.task;
    this.isEditMode = this.data?.isEditMode ?? false;

    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(200)]],
      type: ['', Validators.required],
      status: ['', Validators.required],
      assignedTo: [null],
    });

    if (this.task) {
      this.taskForm.patchValue(this.task);
    }

    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const nowISO = new Date().toISOString();
      const newTask: Task = {
        ...this.taskForm.value,
        createdOn: this.task?.createdOn || nowISO,
        updatedOn: this.isEditMode ? nowISO : undefined,
        id: this.task?.id
      };
      this.dialogRef.close(newTask);
    } else {
      this.taskForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.dialogRef.close();
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
