import { Component, OnInit, inject, Signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';

import { Task } from '../../models/task.model';
import * as TasksActions from '../../store/tasks/tasks.actions';
import { selectSelectedTask } from '../../store/tasks/tasks.reducer';
import { CreateTaskPageComponent } from '../create-task-page/create-task-page.component';
import { TaskCreateDto } from '../../models/TaskCreateDto';

@Component({
  selector: 'app-edit-task-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: '',
})
export class EditTaskPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private store = inject(Store);

  task: Signal<Task | null> = this.store.selectSignal(selectSelectedTask);
  private dialogOpened = false;
  private currentId: number | null = null;

  constructor() {
    effect(() => {
      const t = this.task();
      if (!t || this.dialogOpened) return;

      this.dialogOpened = true;
      this.openEditDialog(t);
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id)) {
      this.router.navigate(['/tasks']);
      return;
    }

    this.currentId = id;
    this.store.dispatch(TasksActions.loadTaskById({ id }));
  }

  private openEditDialog(task: Task): void {
    const ref = this.dialog.open(CreateTaskPageComponent, {
      width: '600px',
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
      data: { mode: 'edit', task }
    });

    ref.afterClosed().subscribe((updatedTask: TaskCreateDto | undefined) => {
      if (updatedTask) {
        this.store.dispatch(TasksActions.updateTask({ id: task.id, updatedTask }));
      }
      this.router.navigate(['/tasks']);
    });
  }
}
