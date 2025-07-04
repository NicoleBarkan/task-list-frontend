import { Component } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { Router } from '@angular/router';
import { TaskListComponent } from '../../components/task-list/task-list.component';
import { CreateTaskPageComponent } from '../../pages/create-task-page/create-task-page.component';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-task-list-page',
  standalone: true,
  imports: [CommonModule, TaskListComponent, MatDialogModule ],
  templateUrl: './task-list-page.component.html',
  styleUrls: ['./task-list-page.component.scss']
})
export class TaskListPageComponent {
  tasks$!: Observable<Task[]>;

  constructor(private taskService: TaskService, private dialog: MatDialog, private router: Router ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.tasks$ = this.taskService.getTasks().pipe(
      map(tasks => tasks ?? [])
    );
  }

  deleteTask(id: number): void {
    this.taskService.deleteTask(id).subscribe(() => {
      this.loadTasks();
    });
  }
  
  updateTask(id: number, updatedTask: Task) {
    this.taskService.updateTask(id, updatedTask).subscribe(updated => {
      console.log('Updated task:', updated);
      this.loadTasks();
      this.router.navigate(['/tasks']);
    });
  }

  openCreateTask() {
    const dialogRef = this.dialog.open(CreateTaskPageComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((newTask: Task | undefined) => {
      if (newTask) {
        this.taskService.addTask(newTask).subscribe(() => {
          this.loadTasks();
          this.router.navigate(['/tasks']);
        });
      } else {
        this.router.navigate(['/tasks']);
      }
    });
  }


}
