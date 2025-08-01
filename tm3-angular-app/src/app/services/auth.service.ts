import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthResponse } from '../models/auth-response.model';
import { User } from '../models/user.model';
import { Role } from '../models/role.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiBaseUrl + '/auth';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { username, password });
  }

  register(user: { username: string, password: string, firstName: string, lastName: string }): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/register`, user);
  }

  logout(): void {
    localStorage.clear();
  }

  getUserDetails(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user/${userId}`);
  }

  getCurrentUserRole(): Role[] {
    const roleJson = localStorage.getItem('role');
    if (!roleJson) return [];
    try {
      return JSON.parse(roleJson) as Role[];
    } catch {
      return [];
    }
  }

  hasRole(role: Role): boolean {
    return this.getCurrentUserRole().includes(role);
  }

  isAdmin(): boolean {
    return this.hasRole(Role.ADMIN);
  }
}
