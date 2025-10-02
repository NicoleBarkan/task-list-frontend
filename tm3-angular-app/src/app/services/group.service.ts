import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GroupDto } from '../models/group.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class GroupService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/groups';

  list(): Observable<GroupDto[]> {
    return this.http.get<GroupDto[]>(this.baseUrl);
  }

  get(id: number): Observable<GroupDto> {
    return this.http.get<GroupDto>(`${this.baseUrl}/${id}`);
  }

  users(id: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/${id}/users`);
  }

  create(dto: GroupDto): Observable<GroupDto> {
    return this.http.post<GroupDto>(this.baseUrl, dto);
  }

  update(id: number, dto: GroupDto): Observable<GroupDto> {
    return this.http.put<GroupDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
