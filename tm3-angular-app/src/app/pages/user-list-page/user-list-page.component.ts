import { Component, inject, effect } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { UsersStore } from '../../store/users/users.store';

@Component({
  selector: 'app-user-list-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, RouterModule, TranslateModule ], 
  templateUrl: './user-list-page.component.html',
  styleUrls: ['./user-list-page.component.scss']
})
export class UserListPageComponent{
  store = inject(UsersStore);

  users = this.store.users;
  loading = this.store.loading;
  error = this.store.error;

  constructor() {
    effect(() => {
      if (this.error()) {
        console.error('Ошибка загрузки пользователей:', this.error());
      }
    });
  }
}
