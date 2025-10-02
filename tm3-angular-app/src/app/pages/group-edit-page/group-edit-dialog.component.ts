import { Component, Inject, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GroupService } from '../../services/group.service';
import { GroupDto } from '../../models/group.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpStatusCode } from '@angular/common/http';
import { catchError, finalize, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type CreateData = { mode: 'create' };
type EditData = { mode: 'edit'; group: GroupDto };
type DialogData = CreateData | EditData;

type GroupForm = FormGroup<{
  name: FormControl<string>;
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
    MatButtonModule, MatSnackBarModule, TranslateModule
  ]
})
export class GroupEditDialogComponent {
  private fb = inject(FormBuilder);
  private service = inject(GroupService);
  private snack = inject(MatSnackBar);
  private i18n = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  form: GroupForm = this.fb.group({
    name: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(255)] }),
    description: this.fb.control('', { nonNullable: true, validators: [Validators.maxLength(2000)] }),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private ref: MatDialogRef<GroupEditDialogComponent>,
  ) {
    if (data.mode === 'edit') {
      this.form.patchValue({
        name: data.group.name ?? '',
        description: data.group.description ?? '',
      }, { emitEvent: false });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, description } = this.form.getRawValue();

    const payload: GroupDto = {
      id: this.data.mode === 'edit' ? this.data.group.id : undefined,
      name: name.trim(),
      description: description?.trim() ?? ''
    };

    const request$ = this.data.mode === 'create'
      ? this.service.create(payload)
      : this.service.update(payload.id as number, payload);

    request$.pipe(
      tap(() => this.ref.close(true)),
      catchError(err => {
        const msg =
          err?.status === HttpStatusCode.Conflict
            ? this.i18n.instant('nameUnique')
            : (err?.error?.message ?? this.i18n.instant('saveFailed'));
        this.snack.open(msg, this.i18n.instant('Close'), { duration: 4000 });
        return of(null);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  cancel(): void {
    this.ref.close(false);
  }
}
