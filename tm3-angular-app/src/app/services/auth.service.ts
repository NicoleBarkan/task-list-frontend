import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthResponse } from '../models/auth-response.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiBaseUrl + '/auth';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { username, password });
  }

  register(user: { username: string, password: string, firstName: string, lastName: string }) {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  logout(): void {
    localStorage.clear();
  }

  getUserDetails(userId: number) {
    return this.http.get(`${this.apiUrl}/user/${userId}`);
  }

  getCurrentUser(): any {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role?.includes(role);
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }
}
