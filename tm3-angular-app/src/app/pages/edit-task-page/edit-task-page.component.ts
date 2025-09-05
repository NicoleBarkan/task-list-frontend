import { Component, OnInit, inject, Signal, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Task } from '../../models/task.model';
import { CreateTaskPageComponent } from '../../pages/create-task-page/create-task-page.component';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import * as TasksActions from '../../store/tasks/tasks.actions';
import { selectSelectedTask } from '../../store/tasks/tasks.reducer';

@Component({
  selector: 'app-edit-task-page',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: '<p>Waiting task for editing...</p>',
  styleUrls: ['./edit-task-page.component.scss']
})
export class EditTaskPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private store = inject(Store);
  
  task: Signal<Task | null> = this.store.selectSignal(selectSelectedTask);
  private dialogOpened = false;
  
  constructor() {
    effect(() => {
      const current = this.task();
      if (current && !this.dialogOpened) {
        this.dialogOpened = true;
        this.openEditDialog(current);
      }
    });
  }

  ngOnInit(): void {
      const id = Number( this.route.snapshot.paramMap.get('id'));
      if (isNaN(id)) {
        this.router.navigate(['/tasks']);
        return;
      }

    this.store.dispatch(TasksActions.loadTaskById({ id }));
  }

  openEditDialog(task: Task): void {
    const dialogRef = this.dialog.open(CreateTaskPageComponent, {
      width: '600px',
      disableClose: true,
      data: {
        task,
        isEditMode: true
      }
    });

    dialogRef.afterClosed().subscribe((updatedTask: Task | undefined) => {
      if (updatedTask) {
        this.store.dispatch(TasksActions.updateTask({ id: task.id, updatedTask }));
      }
      this.router.navigate(['/tasks']);
    });
  }
}
