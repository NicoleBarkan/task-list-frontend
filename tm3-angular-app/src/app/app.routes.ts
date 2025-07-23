import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { TaskListPageComponent } from './pages/task-list-page/task-list-page.component';
import { CreateTaskPageComponent } from './pages/create-task-page/create-task-page.component';
import { TaskDetailsPageComponent } from './pages/task-details-page/task-details-page.component';
import { EditTaskPageComponent } from './pages/edit-task-page/edit-task-page.component';
import { UserListPageComponent } from './pages/user-list-page/user-list-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent},
  { path: 'register', component: RegisterPageComponent },
  { path: 'tasks', component: TaskListPageComponent, canActivate: [AuthGuard] },
  { path: 'create', component: CreateTaskPageComponent, canActivate: [AuthGuard] },
  { path: 'details/:id', component: TaskDetailsPageComponent, canActivate: [AuthGuard] },
  { path: 'edit/:id', component: EditTaskPageComponent, canActivate: [AuthGuard] },
  { path: 'users', component: UserListPageComponent, canActivate: [AuthGuard] },
];
