import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ErrorResponse } from '../../models/error-response.model';
import { HttpErrorResponse } from '@angular/common/http'; 
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-page',
  standalone: true,
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
})
export class RegisterPageComponent implements OnInit, OnDestroy {
  form: FormGroup;
  errorMessage = '';
  registrationAttempted = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.errorMessage = '';
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit() {
    this.registrationAttempted = true;

    if (this.form.invalid) return;

    const { username, password, firstName, lastName } = this.form.value;

    this.auth.register({ username, password, firstName, lastName }).subscribe({
      next: () => {
        this.auth.login(username, password).subscribe({
          next: (res) => {
            localStorage.setItem('userId', res.userId);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('firstName', res.firstName);
            localStorage.setItem('lastName', res.lastName);

            this.router.navigate(['/tasks']);
          },
          error: () => this.errorMessage = 'Login failed after registration.'
        });
      },
      error: (err: HttpErrorResponse) => {
        const error = err.error as ErrorResponse;
        this.errorMessage = error.message ?? 'Registration failed.';
      }
    });
  }
}
