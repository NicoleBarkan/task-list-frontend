import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { TaskListPageComponent } from './pages/task-list-page/task-list-page.component';
import { CreateTaskPageComponent } from './pages/create-task-page/create-task-page.component';
import { TaskDetailsPageComponent } from './pages/task-details-page/task-details-page.component';
import { EditTaskPageComponent } from './pages/edit-task-page/edit-task-page.component';
import { UserListPageComponent } from './pages/user-list-page/user-list-page.component';
import { UserDetailsPageComponent } from './pages/user-details-page/user-details-page.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { GroupsPageComponent } from './pages/groups-page/groups-page.component';
import { GroupDetailsPageComponent } from './pages/group-details-page/group-details-page.component';


export const routes: Routes = [
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'login', component: LoginPageComponent},
  { path: 'register', component: RegisterPageComponent },
  { path: 'tasks', component: TaskListPageComponent, canActivate: [AuthGuard] },
  { path: 'create', component: CreateTaskPageComponent, canActivate: [AuthGuard] },
  { path: 'details/:id', component: TaskDetailsPageComponent, canActivate: [AuthGuard] },
  { path: 'edit/:id', component: EditTaskPageComponent, canActivate: [AuthGuard] },
  { path: 'users', component: UserListPageComponent, canActivate: [AdminGuard] },
  { path: 'users/:id', component: UserDetailsPageComponent, canActivate: [AdminGuard] },
  { path: 'groups', component: GroupsPageComponent, canActivate: [AdminGuard] },
  { path: 'groups/:id', component: GroupDetailsPageComponent, canActivate: [AdminGuard] },
];
