import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { Role } from '../../models/role.model';
import { RoleOption } from '../../models/role-option.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

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
  ]
})
export class UserDetailsPageComponent implements OnInit {
  user!: User;
  roleOptions: RoleOption[] = [];

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = Number(this.route.snapshot.paramMap.get('id'));

    this.userService.getUserById(userId).subscribe(user => {
      this.user = user;
      this.roleOptions = this.buildRoleOptions(user.role);
    });
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
    const selectedRole = this.roleOptions
      .filter(r => r.checked || r.name === 'USER')
      .map(r => r.name);

    this.userService.updateUserRole(this.user.id, selectedRole).subscribe(() => {
      this.router.navigate(['/users']); 
    });
  }

  toggleRole(role: RoleOption): void {
    role.checked = !role.checked;
  }
}
