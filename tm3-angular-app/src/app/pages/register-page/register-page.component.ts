import { Component, inject, signal, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthStore } from '../../store/auth/auth.store';

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
    TranslateModule
  ],
})
export class RegisterPageComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthStore);

  form = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
    });

  errorMessage = this.auth.error;
  loading = this.auth.loading;
  registrationAttempted = signal(false);

  constructor() {
  effect(() => {
    const err = this.errorMessage();
    if (err) console.warn('Register error:', err);
    if (this.auth.user()) {
      this.router.navigate(['/tasks']);
    }
  });
}

  onSubmit() {
    this.registrationAttempted.set(true);

    if (this.form.invalid) return;

    const { username, password, firstName, lastName } = this.form.value;

    if (!username || !password || !firstName || !lastName) return;

    this.auth.register({ username, password, firstName, lastName });
  }
}
