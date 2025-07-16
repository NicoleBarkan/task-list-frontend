import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

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
  ],
})
export class LoginPageComponent implements OnInit {
  form!: FormGroup;
  errorMessage = '';
  loginAttempted = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.form.valueChanges.subscribe(() => {
      this.errorMessage = '';
    });
  }

  onSubmit() {
    this.loginAttempted = true;

    if (this.form.invalid) return;

    const { username, password } = this.form.value;

    this.auth.login(username, password).subscribe({
      next: (res: any) => {
        localStorage.setItem('userId', res.userId);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('firstName', res.firstName);
        localStorage.setItem('lastName', res.lastName);

        this.userService.fetchUserDetails(res.userId);

        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        console.error('Login failed:', err);
        if (err.status === 401) {
          this.errorMessage = 'Invalid username or password';
        } else {
          this.errorMessage = 'Something went wrong. Please try again.';
        }
      }
    });
  }
}
