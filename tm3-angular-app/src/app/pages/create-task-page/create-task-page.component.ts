import { Component, Inject, OnInit, Signal, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { take } from 'rxjs/operators';

import { Task } from '../../models/task.model';
import { User } from '../../models/user.model';
import { UsersStore } from '../../store/users/users.store';
import { GroupService } from '../../services/group.service';
import { GroupDto } from '../../models/group.model';
import { AuthStore } from '../../store/auth/auth.store';
import { Role } from '../../models/role.model';
import { TaskCreateDto } from '../../models/TaskCreateDto';

type CreateData = { mode: 'create' };
type EditData = { mode: 'edit'; task: Task };
type DialogData = CreateData | EditData;

type TaskForm = FormGroup<{
  title: FormControl<string>;
  description: FormControl<string>;
  type: FormControl<Task['type'] | null>;
  status: FormControl<Task['status'] | null>;
  assignedTo: FormControl<number | null>;
  groupId: FormControl<number | null>;
}>;

@Component({
  selector: 'app-task-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
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

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  readonly UNASSIGNED_GROUP_ID = 1;

  allUsers: Signal<ReadonlyArray<User>> = this.usersStore.users;

  users = computed(() =>
    this.allUsers().filter(u => u.groupId !== this.UNASSIGNED_GROUP_ID)
  );

  isAdminOrManager = computed(
    () => this.authStore.hasRole(Role.ADMIN) || this.authStore.hasRole(Role.MANAGER)
  );

  groups = signal<GroupDto[]>([]);
  visibleGroups = signal<GroupDto[]>([]);

  taskForm: TaskForm = this.fb.group({
    title: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(50)]),
    description: this.fb.nonNullable.control('', [Validators.maxLength(2000)]),
    type: this.fb.control<Task['type'] | null>(null, { validators: Validators.required }),
    status: this.fb.control<Task['status'] | null>(null, { validators: Validators.required }),
    assignedTo: this.fb.control<number | null>(null),
    groupId: this.fb.control<number | null>(null)
  });

  trackById = (_: number, u: { id: number }) => u.id;

  get titleCtrl() { return this.taskForm.get('title'); }
  get descriptionCtrl() { return this.taskForm.get('description'); }
  get typeCtrl() { return this.taskForm.get('type'); }
  get statusCtrl() { return this.taskForm.get('status'); }
  get groupIdCtrl() { return this.taskForm.get('groupId'); }

  isEditMode(): boolean {
    return this.data.mode === 'edit';
  }

ngOnInit(): void {
  this.usersStore.loadUsers();

  if (this.data.mode === 'edit') {
    const t = this.data.task;
    this.taskForm.patchValue({
      title: t.title,
      description: t.description ?? '',
      type: t.type,
      status: t.status,
      assignedTo: t.assignedTo ?? null,
      groupId: t.groupId ?? null
    }, { emitEvent: false });
  }

  if (this.isAdminOrManager() && this.groupIdCtrl) {
    this.groupIdCtrl.addValidators(Validators.required);
    this.groupIdCtrl.updateValueAndValidity({ emitEvent: false });
  }

  if (this.isAdminOrManager()) {
    this.groupService.list().pipe(take(1)).subscribe({
      next: list => {
        this.groups.set(list);
        this.visibleGroups.set(list);

        if (this.data.mode === 'create' && !this.groupIdCtrl?.value) {
          const unassigned = list.find(g => g.id === this.UNASSIGNED_GROUP_ID);
          if (unassigned?.id != null) {
            this.groupIdCtrl?.setValue(unassigned.id, { emitEvent: false });
          }
        }

        const assigneeId = this.taskForm.get('assignedTo')?.value ?? null;
        this.syncGroupWithAssignee(assigneeId);
      },
      error: () => this.groups.set([])
    });
  }

  this.setupAssignedToGroupSync();
  this.setupGroupChangeUnassign();
}

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const v = this.taskForm.getRawValue();

    if (v.type == null || v.status == null) return;

    const effectiveGroupId =
      this.isAdminOrManager()
        ? v.groupId
        : this.authStore.user()?.groupId ?? null;

    if (this.isAdminOrManager() && effectiveGroupId == null) {
      this.groupIdCtrl?.setErrors({ required: true });
      return;
    }

    const result: TaskCreateDto = {
      title: String(v.title),
      description: v.description ?? '',
      type: v.type,
      status: v.status,
      groupId: effectiveGroupId,
      assignedToId: v.assignedTo ?? null
    };

    this.dialogRef.close(result);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private setupAssignedToGroupSync(): void {
    if (!this.isAdminOrManager()) return;

    this.taskForm.get('assignedTo')?.valueChanges.subscribe((userId: number | null) => {
      this.syncGroupWithAssignee(userId);
    });
  }

  private setupGroupChangeUnassign(): void {
    if (!this.isAdminOrManager()) return;

    const groupCtrl = this.groupIdCtrl;
    const assignedCtrl = this.taskForm.get('assignedTo');
    if (!groupCtrl || !assignedCtrl) return;

    groupCtrl.valueChanges.subscribe((groupId: number | null) => {
      const assigneeId = assignedCtrl.value;
      if (!assigneeId || groupId == null) return;

      const user = this.users().find(u => u.id === assigneeId);
      const userGroupId = user?.groupId ?? null;

      if (userGroupId && userGroupId !== groupId) {
        assignedCtrl.setValue(null, { emitEvent: false });
      }
    });
  }

  private syncGroupWithAssignee(userId: number | null): void {
    if (!this.isAdminOrManager()) return;

    const groupCtrl = this.groupIdCtrl;
    if (!groupCtrl) return;

    this.visibleGroups.set(this.groups());

    if (this.data.mode === 'edit' && groupCtrl.value != null) return;

    if (userId) {
      const user = this.users().find(u => u.id === userId);
      const userGroupId = user?.groupId ?? null;
      if (userGroupId) {
        groupCtrl.setValue(userGroupId, { emitEvent: false });
      }
    }
  }
}
