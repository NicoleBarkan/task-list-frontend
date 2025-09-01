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

    on(TasksActions.loadTasks, (s) => ({ ...s, loading: true, error: null })),
    on(TasksActions.loadTasksSuccess, (s, { tasks }) => ({ ...s, list: tasks, loading: false })),
    on(TasksActions.loadTasksFailure, (s, { error }) => ({ ...s, loading: false, error })),

    on(TasksActions.loadTaskById, (s) => ({ ...s, loading: true, error: null, selectedTask: null })),
    on(TasksActions.loadTaskByIdSuccess, (s, { task }) => ({ ...s, selectedTask: task, loading: false })),
    on(TasksActions.loadTaskByIdFailure, (s, { error }) => ({ ...s, loading: false, error })),

    on(TasksActions.addTaskSuccess, (s, { task }) => ({ ...s, list: [task, ...s.list] })),
    on(TasksActions.addTaskFailure, (s, { error }) => ({ ...s, error })),

    on(TasksActions.updateTaskSuccess, (s, { task }) => ({
      ...s,
      list: s.list.map(t => (t.id === task.id ? task : t)),
      selectedTask: s.selectedTask && s.selectedTask.id === task.id ? task : s.selectedTask,
    })),
    on(TasksActions.updateTaskFailure, (s, { error }) => ({ ...s, error })),

    on(TasksActions.deleteTaskSuccess, (s, { id }) => ({
      ...s,
      list: s.list.filter(t => t.id !== id),
      selectedTask: s.selectedTask && s.selectedTask.id === id ? null : s.selectedTask,
    })),
    on(TasksActions.deleteTaskFailure, (s, { error }) => ({ ...s, error }))
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
