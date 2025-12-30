import { Component, Inject, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpStatusCode } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { GroupService } from '../../services/group.service';
import { GroupDto } from '../../models/group.model';

type CreateData = { mode: 'create' };
type EditData = { mode: 'edit'; group: GroupDto };
type DialogData = CreateData | EditData;

type GroupForm = FormGroup<{
  title: FormControl<string>;
  description: FormControl<string>;
}>;

@Component({
  standalone: true,
  selector: 'app-group-edit-dialog',
  templateUrl: './group-edit-dialog.component.html',
  styleUrls: ['./group-edit-dialog.component.scss'],
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule,
    MatButtonModule, TranslateModule
  ]
})
export class GroupEditDialogComponent {
  private fb = inject(FormBuilder);
  private service = inject(GroupService);
  private i18n = inject(TranslateService);
  private destroyRef = inject(DestroyRef);
  globalError = signal<string | null>(null);
  submitAttempted = signal(false);

  form: GroupForm = this.fb.group({
    title: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
    description: this.fb.control('', { nonNullable: true, validators: [Validators.maxLength(2000)] }),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private ref: MatDialogRef<GroupEditDialogComponent>,
  ) {
    if (data.mode === 'edit') {
      this.form.patchValue({
        title: data.group.title ?? '',
        description: data.group.description ?? '',
      }, { emitEvent: false });
    }
  }

  submit(): void {
    this.submitAttempted.set(true);
    this.globalError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, description } = this.form.getRawValue();

    const payload: GroupDto = {
      id: this.data.mode === 'edit' ? this.data.group.id : undefined,
      title: title.trim(),
      description: description?.trim() ?? ''
    };

    const request$ = this.data.mode === 'create'
      ? this.service.create(payload)
      : this.service.update(payload.id as number, payload);

    request$.pipe(
      tap(() => this.ref.close(true)),
      catchError(err => {
        const msg =
          err?.error?.error ??
          err?.error?.message

        this.globalError.set(msg);
        return of(null);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  cancel(): void {
    this.ref.close(false);
  }

  private removeControlError(
    errors: Record<string, any> | null,
    key: string
  ): Record<string, any> | null {
    if (!errors || !errors[key]) return errors;
    const { [key]: _, ...rest } = errors;
    return Object.keys(rest).length ? rest : null;
  }
}
