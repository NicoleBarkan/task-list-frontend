import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task } from '../models/task.model';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = environment.apiBaseUrl + '/tasks';

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.tasksEndpoint);
  }

  addTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.tasksEndpoint, task);
  }

  deleteTask(id: number): Observable<Task[]> {
    return this.http.delete<Task[]>(`${this.tasksEndpoint}/${id}`);
  }

  updateTask(id: number, updatedTask: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, updatedTask);
  }

  getTaskById(id: number): Observable<Task | null> {
    return this.http.get<Task>(`${this.tasksEndpoint}/${id}`);
  }
}