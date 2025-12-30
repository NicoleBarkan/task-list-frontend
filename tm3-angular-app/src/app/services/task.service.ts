import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Task } from '../models/task.model';
import { TaskUpdateDto } from '../models/TaskUpdateDto';
import { TaskCreateDto } from '../models/TaskCreateDto';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly baseApiUrl = environment.apiBaseUrl;
  private readonly tasksEndpoint = `${this.baseApiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getTasks(params?: { groupId?: number }): Observable<Task[]> {
    let httpParams = new HttpParams();
    if (params?.groupId != null) {
      httpParams = httpParams.set('groupId', String(params.groupId));
    }
    return this.http.get<Task[]>(this.tasksEndpoint, { params: httpParams });
  }

  getTasksByGroup(groupId: number): Observable<Task[]> {
    return this.getTasks({ groupId });
  }

  addTask(dto: TaskCreateDto): Observable<Task> {
    return this.http.post<Task>(this.tasksEndpoint, dto);
  }

  updateTask(id: number, dto: TaskUpdateDto | TaskCreateDto): Observable<Task> {
    return this.http.put<Task>(`${this.tasksEndpoint}/${id}`, dto);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.tasksEndpoint}/${id}`);
  }

  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.tasksEndpoint}/${id}`);
  }
}
