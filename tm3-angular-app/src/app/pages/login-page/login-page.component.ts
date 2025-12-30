import { Component, inject, signal, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthStore } from '../../store/auth/auth.store';

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
    RouterModule,
    TranslateModule
  ],
})
export class LoginPageComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthStore);

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  loading = this.auth.loading;
  errorMessage = this.auth.error;
  loginAttempted = signal(false);

  constructor() {
    effect(() => {
      const err = this.errorMessage();
      if (err) console.warn('Login error:', err);

      if (this.auth.user()) {
        this.router.navigate(['/tasks']).then(() => {
          window.dispatchEvent(new Event('auth-changed'));
        });
      }
    });
  }

  onSubmit() {
    this.loginAttempted.set(true);

    if (this.form.invalid) return;

    const { username, password } = this.form.value;
    if (!username || !password) return;

    this.auth.login({ username, password });
  }
}
