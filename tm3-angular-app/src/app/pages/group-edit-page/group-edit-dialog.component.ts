import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GroupService } from '../../services/group.service';
import { GroupDto } from '../../models/group.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

type DialogData = { mode: 'create' | 'edit'; group?: GroupDto };

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

  form: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private ref: MatDialogRef<GroupEditDialogComponent>,
  ) {
    this.form = this.fb.group({
      name: [data.group?.name ?? '', [Validators.required, Validators.maxLength(255)]],
      description: [data.group?.description ?? '', [Validators.maxLength(2000)]],
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload: GroupDto = {
      id: this.data.group?.id,
      name: (this.form.value.name as string).trim(),
      description: (this.form.value.description as string) ?? ''
    };

    const req = this.data.mode === 'create'
      ? this.service.create(payload)
      : this.service.update(payload.id!, payload);

    req.subscribe({
      next: () => this.ref.close(true), 
      error: (err) => {
        const msg = err?.status === 409
          ? this.i18n.instant('nameUnique')
          : (err?.error?.message ?? this.i18n.instant('saveFailed'));
        this.snack.open(msg, this.i18n.instant('Close'), { duration: 4000 });
      }
    });
  }

  cancel() {
    this.ref.close(false);
  }
}
