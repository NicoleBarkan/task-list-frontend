import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { UserDetails } from '../models/user-details.model';
import { Role } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiBaseUrl;
  private userDetailsSubject = new BehaviorSubject<UserDetails | null>(null);

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  updateUserRole(userId: number, role: Role[]): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${userId}/role`, role);
  }

  fetchUserDetails(userId: string | null): void {
    if (!userId) return;
    this.http.get<UserDetails>(`${this.apiUrl}/auth/user/${userId}`)
      .subscribe({
        next: u => this.userDetailsSubject.next(u),
        error: () => this.userDetailsSubject.next(null)
      });
  }

  getUserDetails(): Observable<UserDetails | null> {
    return this.userDetailsSubject.asObservable();
  }

  list(filter?: { groupId?: number }) {
    let params = new HttpParams();
    if (filter?.groupId != null) params = params.set('groupId', String(filter.groupId));
    return this.http.get<User[]>(`${this.apiUrl}/users`, { params });
  }

  assignGroup(userId: number, groupId: number) {
    return this.http.put<User>(`${this.apiUrl}/users/${userId}/group/${groupId}`, {});
  }

}
