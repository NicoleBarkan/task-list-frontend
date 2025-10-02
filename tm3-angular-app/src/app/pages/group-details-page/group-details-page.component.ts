import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GroupService } from '../../services/group.service';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { MatTableModule } from '@angular/material/table';
import { GroupDto } from '../../models/group.model';
import { Task } from '../../models/task.model';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { signal } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-group-details',
  templateUrl: './group-details-page.component.html',
  styleUrls: ['./group-details-page.component.scss'],
  imports: [
    CommonModule, RouterModule,
    MatCardModule, MatTableModule, MatChipsModule, MatDividerModule, MatButtonModule, MatIconModule, TranslateModule
  ]
})
export class GroupDetailsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private groupService = inject(GroupService);
  private taskService = inject(TaskService);
  private userService = inject(UserService);

  users = signal<User[]>([]);
  userColumns = ['id', 'username', 'firstName', 'lastName', 'role'];

  group = signal<GroupDto | null>(null);
  loading = signal(false);
  tasks = signal<Task[]>([]);
  displayedColumns = ['id', 'title', 'type', 'status', 'assignedTo', 'updatedOn'];

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigateByUrl('/groups'); return; }
    this.loading.set(true);

    this.groupService.get(id).subscribe({
      next: g => this.group.set(g),
      error: () => {},
    });

    this.taskService.getTasksByGroup(id).subscribe({
      next: list => this.tasks.set(list),
      error: () => {},
      complete: () => this.loading.set(false)
    });

    this.userService.list({ groupId: id }).subscribe({
      next: list => this.users.set(list),
      error: () => {},
    });

  }
}
