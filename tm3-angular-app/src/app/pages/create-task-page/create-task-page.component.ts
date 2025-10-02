import { Component, OnInit, inject, Signal, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
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
import { take } from 'rxjs/operators';

import { GroupService } from '../../services/group.service';
import { GroupDto } from '../../models/group.model';
import { AuthStore } from '../../store/auth/auth.store';
import { Role } from '../../models/role.model';

type DialogData = { task?: Task; isEditMode?: boolean };
type TaskPayload = Pick<Task, 'title' | 'description' | 'type' | 'status' | 'assignedTo'> & {
  id?: number;
  group?: { id: number };
};

type TaskForm = FormGroup<{
  title: FormControl<string>;
  description: FormControl<string>;
  type: FormControl<Task['type'] | null>;
  status: FormControl<Task['status'] | null>;
  assignedTo: FormControl<number | null>;
  groupId: FormControl<number | null>;
}>;


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

  taskForm: TaskForm = this.fb.group({
    title: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]),
    description: this.fb.nonNullable.control('', [Validators.maxLength(200)]),
    type: this.fb.control<Task['type'] | null>(null, { validators: Validators.required }),
    status: this.fb.control<Task['status'] | null>(null, { validators: Validators.required }),
    assignedTo: this.fb.control<number | null>(null),
    groupId: this.fb.control<number | null>(null)
  });
  trackById = (_: number, u: { id: number }) => u.id;

  ngOnInit() {
    this.task.set(this.data?.task ?? null);
    this.isEditMode.set(this.data?.isEditMode ?? false);

    const groupCtrl = this.groupIdCtrl;
    if (this.isAdminOrManager() && groupCtrl) {
      groupCtrl.addValidators(Validators.required);
      groupCtrl.updateValueAndValidity({ emitEvent: false });
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
      this.groupService.list().pipe(take(1)).subscribe({
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
    const existing = this.task();

    const effectiveGroupId =
      this.isAdminOrManager() ? formValue.groupId : this.authStore.user()?.groupId;

    if (this.isAdminOrManager() && (effectiveGroupId == null)) {
      this.groupIdCtrl?.setErrors({ required: true });
      this.taskForm.markAllAsTouched();
      return;
    }

    const base: Pick<Task, 'title' | 'description' | 'type' | 'status' | 'assignedTo'> = {
      title: String(formValue.title),
      description: formValue.description ?? '',
      type: formValue.type as Task['type'],
      status: formValue.status as Task['status'],
      assignedTo: formValue.assignedTo ?? null
    };

    const result: TaskPayload = {
      ...(existing?.id ? { id: existing.id } : {}),
      ...base,
      ...(this.isAdminOrManager() ? { group: { id: effectiveGroupId as number } } : {})
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
