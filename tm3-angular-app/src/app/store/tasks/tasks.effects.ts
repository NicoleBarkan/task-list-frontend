import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as TasksActions from './tasks.actions';
import { TaskService } from '../../services/task.service';
import { catchError, map, of, switchMap } from 'rxjs';
import { Task } from '../../models/task.model';

@Injectable()
export class TasksEffects {
  private actions$ = inject(Actions);
  private taskService = inject(TaskService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.loadTasks),
      switchMap(() =>
        this.taskService.getTasks().pipe(
          map((tasks: Task[]) => TasksActions.loadTasksSuccess({ tasks })),
          catchError(err =>
            of(TasksActions.loadTasksFailure({ error: err?.error?.message ?? 'Failed to load tasks' }))
          )
        )
      )
    )
  );

  loadById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.loadTaskById),
      switchMap(({ id }) =>
        this.taskService.getTaskById(id).pipe(
          map((task: Task | null) => TasksActions.loadTaskByIdSuccess({ task })),
          catchError(err =>
            of(TasksActions.loadTaskByIdFailure({ error: err?.error?.message ?? 'Failed to load task' }))
          )
        )
      )
    )
  );

  add$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.addTask),
      switchMap(({ task }) =>
        this.taskService.addTask(task).pipe(
          map((created: Task) => TasksActions.addTaskSuccess({ task: created })),
          catchError(err =>
            of(TasksActions.addTaskFailure({ error: err?.error?.message ?? 'Failed to add task' }))
          )
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.updateTask),
      switchMap(({ id, updatedTask }) =>
        this.taskService.updateTask(id, updatedTask).pipe(
          map((saved: Task) => TasksActions.updateTaskSuccess({ task: saved })),
          catchError(err =>
            of(TasksActions.updateTaskFailure({ error: err?.error?.message ?? 'Failed to update task' }))
          )
        )
      )
    )
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.deleteTask),
      switchMap(({ id }) =>
        this.taskService.deleteTask(id).pipe(
          map(() => TasksActions.deleteTaskSuccess({ id })),
          catchError(err =>
            of(TasksActions.deleteTaskFailure({ error: err?.error?.message ?? 'Failed to delete task' }))
          )
        )
      )
    )
  );
}
