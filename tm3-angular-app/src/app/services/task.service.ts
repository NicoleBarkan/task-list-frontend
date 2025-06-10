import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task } from '../models/task.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly baseUrl = 'http://localhost:8080/api';
  private readonly tasksEndpoint = `${this.baseUrl}/tasks`;

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

  getTaskById(id: number): Observable<Task | null> {
    return this.http.get<Task>(`${this.tasksEndpoint}/${id}`);
  }
}