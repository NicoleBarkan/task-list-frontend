import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post(`${this.apiUrl}/login`, { username, password });
  }

  logout(): void {
    localStorage.clear();
  }

  getUserDetails(userId: number) {
    return this.http.get(`${this.apiUrl}/user/${userId}`);
  }
}
