import { createAction, props } from '@ngrx/store';
import { Task } from '../../models/task.model';

export const loadTasks = createAction('[Tasks] Load');
export const loadTasksSuccess = createAction('[Tasks] Load Success', props<{ tasks: Task[] }>());
export const loadTasksFailure = createAction('[Tasks] Load Failure', props<{ error: string }>());

export const loadTaskById = createAction('[Tasks] Load By Id', props<{ id: number }>());
export const loadTaskByIdSuccess = createAction('[Tasks] Load By Id Success', props<{ task: Task | null }>());
export const loadTaskByIdFailure = createAction('[Tasks] Load By Id Failure', props<{ error: string }>());

export const addTask = createAction('[Tasks] Add', props<{ task: Task }>());
export const addTaskSuccess = createAction('[Tasks] Add Success', props<{ task: Task }>());
export const addTaskFailure = createAction('[Tasks] Add Failure', props<{ error: string }>());

export const updateTask = createAction('[Tasks] Update', props<{ id: number; updatedTask: Partial<Task> }>());
export const updateTaskSuccess = createAction('[Tasks] Update Success', props<{ task: Task }>());
export const updateTaskFailure = createAction('[Tasks] Update Failure', props<{ error: string }>());

export const deleteTask = createAction('[Tasks] Delete', props<{ id: number }>());
export const deleteTaskSuccess = createAction('[Tasks] Delete Success', props<{ id: number }>());
export const deleteTaskFailure = createAction('[Tasks] Delete Failure', props<{ error: string }>());
