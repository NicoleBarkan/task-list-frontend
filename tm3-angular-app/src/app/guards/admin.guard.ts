import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthStore } from '../store/auth/auth.store';
import { Role } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  private auth = inject(AuthStore);
  private router = inject(Router);

  canActivate(): boolean {
    const isLoggedIn = this.auth.isLoggedIn();
    const role = this.auth.role();

    if (!isLoggedIn || !role || !role.includes(Role.ADMIN)) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}