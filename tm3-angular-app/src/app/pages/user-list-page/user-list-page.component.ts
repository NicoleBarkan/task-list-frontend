import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../../services/user.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-user-list-page',
  standalone: true,
  imports: [CommonModule, MatCardModule], 
  templateUrl: './user-list-page.component.html',
  styleUrls: ['./user-list-page.component.scss']
})
export class UserListPageComponent implements OnInit {
  users$!: Observable<User[]>;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.users$ = this.userService.getUsers();
  }
}
