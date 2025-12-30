import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { TranslateModule, TranslateService } from '@ngx-translate/core';

type MeDto = {
  id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: string | string[];
  roles?: string[];
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, RouterLink,
    HttpClientModule,

    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,

    TranslateModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  selectedLang = this.translate.currentLang || this.translate.defaultLang || 'en';

  isLoggedIn = false;
  firstName = '';
  lastName = '';
  isAdmin = false;

  constructor(
    private translate: TranslateService,
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.refreshAuthHeader();
    window.addEventListener('auth-changed', () => this.refreshAuthHeader());
  }

  refreshAuthHeader() {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;

    if (!this.isLoggedIn) {
      this.firstName = '';
      this.lastName = '';
      this.isAdmin = false;
      return;
    }

    this.http.get<MeDto>('/api/users/me').subscribe({
      next: (me) => {
        this.firstName = me.firstName || '';
        this.lastName = me.lastName || '';

        const rawRoles: string[] = Array.isArray(me.roles)
          ? me.roles
          : Array.isArray(me.role)
            ? me.role
            : typeof me.role === 'string'
              ? me.role.split(/[,\s]+/).filter(Boolean)
              : [];

        const normalized = rawRoles.map(r =>
          r.trim().toUpperCase().replace(/^ROLE_/, '')
        );

        this.isAdmin = normalized.includes('ADMIN');
      },
    });
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth-changed'));
    }
    this.router.navigate(['/welcome']);
  }


  switchLang(lang: string) {
    this.selectedLang = lang;
    this.translate.use(lang);
  }

  readonly year = new Date().getFullYear();
}
