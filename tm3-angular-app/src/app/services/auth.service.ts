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

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) as User : null;
  }

  hasRole(role: Role): boolean {
    const user = this.getCurrentUser();
    return user?.role?.includes(role) ?? false;
  }

  isAdmin(): boolean {
    return this.hasRole(Role.ADMIN);
  }
}
