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
    return this.http.post(`${this.apiUrl}/register`, user, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  logout(): void {
    localStorage.clear();
  }

  getUserDetails(userId: number) {
    return this.http.get(`${this.apiUrl}/user/${userId}`);
  }
}
