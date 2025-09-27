import { Component, OnInit, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { Task } from '../../models/task.model';
import { User } from '../../models/user.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { UsersStore } from '../../store/users/users.store';

import { GroupService } from '../../services/group.service';
import { GroupDto } from '../../models/group.model';
import { AuthStore } from '../../store/auth/auth.store';
import { Role } from '../../models/role.model';

type newTask = Omit<Task, 'id'> & { id?: number };

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
    TranslateModule
  ],
  templateUrl: './create-task-page.component.html',
  styleUrls: ['./create-task-page.component.scss']
})
export class CreateTaskPageComponent implements OnInit {
  task?: Task;
  isEditMode = false;

  private usersStore = inject(UsersStore);
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateTaskPageComponent>);
  data = inject(MAT_DIALOG_DATA) as { task?: Task; isEditMode?: boolean };
  private groupService = inject(GroupService);
  private authStore = inject(AuthStore);

  users: Signal<ReadonlyArray<User>> = this.usersStore.users;

  taskForm!: FormGroup;

  isAdminOrManager = false;
  groups: GroupDto[] = [];

  trackById = (_: number, u: { id: number }) => u.id;

  ngOnInit() {
    this.task = this.data?.task;
    this.isEditMode = this.data?.isEditMode ?? false;
    this.isAdminOrManager = this.authStore.hasRole(Role.ADMIN) || this.authStore.hasRole(Role.MANAGER);

    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(200)]],
      type: ['', Validators.required],
      status: ['', Validators.required],
      assignedTo: [null],
      groupId: [null, this.isAdminOrManager ? Validators.required : []],
    });

    if (this.task) {
      this.taskForm.patchValue({
        ...this.task,
        groupId: (this.task as any).groupId ?? null
      });
    }

    this.usersStore.loadUsers();

    if (this.isAdminOrManager) {
      this.groupService.list().subscribe({
        next: (gs) => (this.groups = gs),
        error: () => (this.groups = [])
      });
    }
  }

  onSubmit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const v = this.taskForm.value;
    const nowISO = new Date().toISOString();

    const newTask: any = {
      title: v.title,
      description: v.description ?? '',
      type: String(v.type).toUpperCase(),
      status: String(v.status).toUpperCase(),
      assignedTo: v.assignedTo ?? -1,
      createdOn: this.task?.createdOn || nowISO,
      updatedOn: this.isEditMode ? nowISO : undefined,
      id: this.task?.id
    };

    if (this.isAdminOrManager) {
      newTask.group = { id: v.groupId };
    }

    this.dialogRef.close(newTask);
  }

  onCancel() {
    this.dialogRef.close();
  }

  get title() { return this.taskForm.get('title'); }
  get description() { return this.taskForm.get('description'); }
  get type() { return this.taskForm.get('type'); }
  get status() { return this.taskForm.get('status'); }
  get groupId() { return this.taskForm.get('groupId'); } 
}
