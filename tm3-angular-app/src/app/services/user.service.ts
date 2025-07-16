import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model'; 
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

interface UserDetails {
  firstName: string;
  lastName: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = environment.apiBaseUrl;
  private userDetails$ = new BehaviorSubject<UserDetails | null>(null);

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl + '/users');
  }
  
  fetchUserDetails(userId: string | null): void {
    if (!userId) {
      console.warn('[UserService] No userId provided. Skipping fetch.');
      return;
    }

    this.http.get<UserDetails>(`${this.apiUrl}/auth/user/${userId}`)
      .subscribe({
        next: user => this.userDetails$.next(user),
        error: err => {
          console.error('[UserService] Failed to fetch user details:', err);
          this.userDetails$.next(null);
        }
      });
  }

  getUserDetails(): Observable<UserDetails | null> {
    return this.userDetails$.asObservable();
  }
}
