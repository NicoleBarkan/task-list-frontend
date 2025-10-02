import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthStore } from '../store/auth/auth.store';
import { Role } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  private auth = inject(AuthStore);
  private router = inject(Router);

  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const loggedIn = this.auth.isLoggedIn();      
    const isAdmin  = this.auth.hasRole(Role.ADMIN)    

    if (!loggedIn || !isAdmin) {
      return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }
    return true;
  }
}
