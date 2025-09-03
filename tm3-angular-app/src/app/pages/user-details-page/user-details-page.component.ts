import { Component, OnInit, inject, effect } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Role } from '../../models/role.model';
import { RoleOption } from '../../models/role-option.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { UsersStore } from '../../store/users/users.store';

@Component({
  standalone: true,
  selector: 'app-user-details-page',
  templateUrl: './user-details-page.component.html',
  styleUrls: ['./user-details-page.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    RouterModule,
    TranslateModule
  ]
})
export class UserDetailsPageComponent implements OnInit {
  private usersStore = inject(UsersStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  user = this.usersStore.selectedUser;
  roleOptions: RoleOption[] = [];

  syncEffect = effect(() => {
    const u = this.user();
    if (u) {
      this.roleOptions = this.buildRoleOptions(u.role);
    }
  });

  ngOnInit(): void {
    const userId = Number(this.route.snapshot.paramMap.get('id'));
    this.usersStore.loadUserById(userId);   
  }

  buildRoleOptions(userRole: Role[]): RoleOption[] {
    const allRole: RoleOption[] = [
      { name: Role.USER, label: 'User (default)', disabled: true },
      { name: Role.MANAGER, label: 'Manager', disabled: false }
    ];

    return allRole.map(role => ({
      ...role,
      checked: userRole.includes(role.name as Role)
    }));
  }

  saveRole(): void {
    const u = this.user();
    if (!u) return;

    const selectedRole = Array.from(new Set(
      this.roleOptions
        .filter(r => r.checked || r.name === Role.USER)
        .map(r => r.name as Role)
    ));

    this.usersStore.updateUserRole({ id: u.id, role: selectedRole });
    this.router.navigate(['/users']); 
  }

  toggleRole(role: RoleOption): void {
    role.checked = !role.checked;
  }

  get canSave(): boolean {
    const u = this.user();
    if (!u) return false;
    const selected = new Set(
      this.roleOptions.filter(r => r.checked || r.name === Role.USER).map(r => r.name)
    );
    const original = new Set(u.role ?? []);
    if (!original.has(Role.USER)) original.add(Role.USER);

    if (selected.size !== original.size) return true;
    for (const r of selected) if (!original.has(r)) return true;
    return false;
  }

}
