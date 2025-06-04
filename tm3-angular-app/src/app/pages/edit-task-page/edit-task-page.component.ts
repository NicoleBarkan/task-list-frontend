import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { TaskCreateComponent } from '../../components/task-create/task-create.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-task-page',
  standalone: true,
  imports: [CommonModule, TaskCreateComponent, RouterModule],
  templateUrl: './edit-task-page.component.html',
  styleUrls: ['./edit-task-page.component.scss']
})
export class EditTaskPageComponent implements OnInit {
  task!: Task;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.taskService.getTaskById(id).subscribe(task => {
      if (task) this.task = task;
    });
  }

  updateTask(updatedTask: Task) {
    if (!this.task?.id) return;
    this.taskService.updateTask(this.task.id, updatedTask).subscribe(() => {
      this.router.navigate(['/tasks']);
    });
  }
}
