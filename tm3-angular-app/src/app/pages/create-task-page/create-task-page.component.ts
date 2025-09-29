import { Component, OnInit, inject, Signal, signal, computed } from '@angular/core';
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

type DialogData = { task?: Task; isEditMode?: boolean };
type TaskPayload = Omit<Task, 'id'> & { id?: number };

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
  private usersStore = inject(UsersStore);
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CreateTaskPageComponent>);
  private groupService = inject(GroupService);
  private authStore = inject(AuthStore);
  private data = inject(MAT_DIALOG_DATA) as DialogData;

  users: Signal<ReadonlyArray<User>> = this.usersStore.users;

  task = signal<Task | null>(null);
  isEditMode = signal(false);
  isAdminOrManager = computed(
    () => this.authStore.hasRole(Role.ADMIN) || this.authStore.hasRole(Role.MANAGER)
  );
  groups = signal<GroupDto[]>([]);

  taskForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
    description: ['', [Validators.maxLength(200)]],
    type: ['', Validators.required],
    status: ['', Validators.required],
    assignedTo: [null as number | null],
    groupId: [null as number | null]
  });

  trackById = (_: number, u: { id: number }) => u.id;

  ngOnInit() {
    this.task.set(this.data?.task ?? null);
    this.isEditMode.set(this.data?.isEditMode ?? false);

    if (this.isAdminOrManager()) {
      this.taskForm.get('groupId')!.addValidators(Validators.required);
      this.taskForm.get('groupId')!.updateValueAndValidity({ emitEvent: false });
    }

    const currentTask = this.task();
    if (currentTask) {
      this.taskForm.patchValue({
        title: currentTask.title,
        description: currentTask.description ?? '',
        type: currentTask.type,
        status: currentTask.status,
        assignedTo: currentTask.assignedTo ?? null,
        groupId: currentTask.groupId  
      }, { emitEvent: false });
    }

    this.usersStore.loadUsers();

    if (this.isAdminOrManager()) {
      this.groupService.list().subscribe({
        next: list => this.groups.set(list),
        error: () => this.groups.set([])
      });
    }
  }

  onSubmit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const formValue = this.taskForm.getRawValue();
    const nowISO = new Date().toISOString();
    const existing = this.task();

    const effectiveGroupId =
      this.isAdminOrManager() ? formValue.groupId : this.authStore.user()?.groupId;

    if (effectiveGroupId == null) {
      this.taskForm.get('groupId')?.setErrors({ required: true });
      this.taskForm.markAllAsTouched();
      return;
    }

    const result: TaskPayload = {
      ...(existing?.id ? { id: existing.id } : {}),
      title: String(formValue.title),
      description: formValue.description ?? '',
      type: formValue.type as Task['type'],
      status: formValue.status as Task['status'],
      assignedTo: (formValue.assignedTo ?? null) as number | null,
      createdOn: existing?.createdOn ?? nowISO,
      updatedOn: this.isEditMode() ? nowISO : undefined,
      groupId: effectiveGroupId 
    };

    this.dialogRef.close(result);
  }


  onCancel() {
    this.dialogRef.close();
  }

  get titleCtrl() { return this.taskForm.get('title'); }
  get descriptionCtrl() { return this.taskForm.get('description'); }
  get typeCtrl() { return this.taskForm.get('type'); }
  get statusCtrl() { return this.taskForm.get('status'); }
  get groupIdCtrl() { return this.taskForm.get('groupId'); }
}
