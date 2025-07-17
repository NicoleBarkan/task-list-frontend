import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model'; 
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserDetails } from '../models/user-details.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = environment.apiBaseUrl;
  private userDetailsSubject = new BehaviorSubject<UserDetails | null>(null);

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
        next: user => this.userDetailsSubject.next(user),
        error: err => {
          console.error('[UserService] Failed to fetch user details:', err);
          this.userDetailsSubject.next(null);
        }
      });
  }

  getUserDetails(): Observable<UserDetails | null> {
    return this.userDetailsSubject.asObservable();
  }
}
