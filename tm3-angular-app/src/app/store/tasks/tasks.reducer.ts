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

    on(TasksActions.loadTasks, (s: TasksState): TasksState => ({ ...s, loading: true, error: null })),
    on(TasksActions.loadTasksSuccess, (s: TasksState, { tasks }: { tasks: Task[] }): TasksState => ({ ...s, list: tasks, loading: false })),
    on(TasksActions.loadTasksFailure, (s: TasksState, { error }: { error: string }): TasksState => ({ ...s, loading: false, error })),

    on(TasksActions.loadTaskById, (s) => ({ ...s, loading: true, error: null, selectedTask: null })),
    on(TasksActions.loadTaskByIdSuccess, (s, { task }) => ({ ...s, selectedTask: task, loading: false })),

    on(TasksActions.loadTaskByIdFailure, (s: TasksState, { error }: { error: string }): TasksState => ({ ...s, loading: false, error })),

    on(TasksActions.addTaskSuccess, (s: TasksState, { task }: { task: Task }): TasksState => ({ ...s, list: [task, ...s.list] })),
    on(TasksActions.addTaskFailure, (s: TasksState, { error }: { error: string }): TasksState => ({ ...s, error })),

    on(TasksActions.updateTaskSuccess, (s: TasksState, { task }: { task: Task }): TasksState => ({
      ...s,
      list: s.list.map(t => (t.id === task.id ? task : t)),
      selectedTask: s.selectedTask && s.selectedTask.id === task.id ? task : s.selectedTask,
    })),
    on(TasksActions.updateTaskFailure, (s: TasksState, { error }: { error: string }): TasksState => ({ ...s, error })),

    on(TasksActions.deleteTaskSuccess, (s: TasksState, { id }: { id: number }): TasksState => ({
      ...s,
      list: s.list.filter(t => t.id !== id),
      selectedTask: s.selectedTask && s.selectedTask.id === id ? null : s.selectedTask,
    })),
    on(TasksActions.deleteTaskFailure, (s: TasksState, { error }: { error: string }): TasksState => ({ ...s, error }))
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
