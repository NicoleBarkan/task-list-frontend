import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task } from '../models/task.model';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private baseApiUrl = environment.apiBaseUrl;
  private tasksEndpoint = `${this.baseApiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.tasksEndpoint);
  }

  addTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.tasksEndpoint, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.tasksEndpoint}/${id}`);
  }

  updateTask(id: number, updatedTask: Task): Observable<Task> {
    return this.http.put<Task>(`${this.tasksEndpoint}/${id}`, updatedTask);
  }

  getTaskById(id: number): Observable<Task | null> {
    return this.http.get<Task>(`${this.tasksEndpoint}/${id}`);
  }
}
