import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ErrorResponse } from '../../models/error-response.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { AuthResponse } from '../../models/auth-response.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login-page',
  standalone: true,
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule
  ],
})
export class LoginPageComponent implements OnInit, OnDestroy {
  form: FormGroup;
  errorMessage = '';
  loginAttempted = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private userService: UserService
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
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
    this.loginAttempted = true;

    if (this.form.invalid) return;

    const { username, password } = this.form.value;

    this.auth.login(username, password).subscribe({
      next: (res: AuthResponse) => {
        localStorage.setItem('userId', res.userId);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('firstName', res.firstName);
        localStorage.setItem('lastName', res.lastName);

        this.userService.fetchUserDetails(res.userId);

        this.router.navigate(['/tasks']);
      },
      error: (err: HttpErrorResponse) => {
        const error = err.error as ErrorResponse;
        this.errorMessage = error.message ?? 'Login failed. Please try again.';
      }
    });
  }
}