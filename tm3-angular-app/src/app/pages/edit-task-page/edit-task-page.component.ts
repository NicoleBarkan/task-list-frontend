import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { CreateTaskPageComponent } from '../../pages/create-task-page/create-task-page.component';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-task-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: '',
  styleUrls: ['./edit-task-page.component.scss']
})
export class EditTaskPageComponent implements OnInit {
  task: Task | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (isNaN(id)) {
        this.router.navigate(['/tasks']);
        return;
      }

      this.taskService.getTaskById(id).subscribe(task => {
        if (task) {
          this.task = task;
          this.openEditDialog();
        } else {
          this.router.navigate(['/tasks']);
        }
      });
    });
  }

  openEditDialog(): void {
    const dialogRef = this.dialog.open(CreateTaskPageComponent, {
      width: '600px',
      disableClose: true,
      data: {
        task: this.task,
        isEditMode: true
      }
    });

    dialogRef.afterClosed().subscribe((updatedTask: Task | undefined) => {
      if (updatedTask && this.task) {
        this.taskService.updateTask(this.task.id, updatedTask).subscribe((updated) => {
          console.log('Updated task from server:', updated);
          this.router.navigate(['/tasks']);
        });
      } else {
        this.router.navigate(['/tasks']);
      }
    });
  }

}
