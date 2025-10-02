import { createFeature, createReducer, on } from '@ngrx/store';
import * as TasksActions from './tasks.actions';
import { Task } from '../../models/task.model';

export interface TasksState {
  list: Task[];
  selectedTask: Task | null;
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  list: [],
  selectedTask: null,
  loading: false,
  error: null,
};

export const tasksFeature = createFeature({
  name: 'tasks',
  reducer: createReducer(
    initialState,

    on(TasksActions.loadTasks, (state): TasksState => ({ ...state, loading: true, error: null })),
    on(TasksActions.loadTasksSuccess, (state: TasksState, { tasks }: { tasks: Task[] }): TasksState => ({ ...state, list: tasks, loading: false })),
    on(TasksActions.loadTasksFailure, (state: TasksState, { error }: { error: string }): TasksState => ({ ...state, loading: false, error })),

    on(TasksActions.loadTaskById, (state): TasksState => ({ ...state, loading: true, error: null, selectedTask: null })),
    on(TasksActions.loadTaskByIdSuccess, (state, { task }): TasksState => ({ ...state, selectedTask: task, loading: false })),
    on(TasksActions.loadTaskByIdFailure, (state: TasksState, { error }: { error: string }): TasksState => ({ ...state, loading: false, error })),

    on(TasksActions.addTaskSuccess, (state: TasksState, { task }: { task: Task }): TasksState => ({ ...state, list: [task, ...state.list] })),
    on(TasksActions.addTaskFailure, (state: TasksState, { error }: { error: string }): TasksState => ({ ...state, error })),

    on(TasksActions.updateTaskSuccess, (state: TasksState, { task }: { task: Task }): TasksState => ({
      ...state,
      list: state.list.map(t => (t.id === task.id ? task : t)),
      selectedTask: state.selectedTask && state.selectedTask.id === task.id ? task : state.selectedTask,
    })),
    on(TasksActions.updateTaskFailure, (state: TasksState, { error }: { error: string }): TasksState => ({ ...state, error })),

    on(TasksActions.deleteTaskSuccess, (state: TasksState, { id }: { id: number }): TasksState => ({
      ...state,
      list: state.list.filter(t => t.id !== id),
      selectedTask: state.selectedTask && state.selectedTask.id === id ? null : state.selectedTask,
    })),
    on(TasksActions.deleteTaskFailure, (state: TasksState, { error }: { error: string }): TasksState => ({ ...state, error }))
  ),
});

export const {
  name: tasksFeatureKey,
  selectTasksState,
  selectList: selectTasks,
  selectSelectedTask,
  selectLoading: selectTasksLoading,
  selectError: selectTasksError,
} = tasksFeature;
