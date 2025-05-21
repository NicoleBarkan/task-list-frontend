import { Routes } from '@angular/router';
import { TaskListPageComponent } from './pages/task-list-page/task-list-page.component';
import { CreateTaskPageComponent } from './pages/create-task-page/create-task-page.component';
import { TaskDetailsPageComponent } from './pages/task-details-page/task-details-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'tasks', pathMatch: 'full' },
  { path: 'tasks', component: TaskListPageComponent },
  { path: 'create', component: CreateTaskPageComponent },
  { path: 'details/:id', component: TaskDetailsPageComponent }
];
