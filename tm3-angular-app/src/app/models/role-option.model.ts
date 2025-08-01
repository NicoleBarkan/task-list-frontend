import { Role } from './role.model';

export interface RoleOption {
  name: Role;
  label: string;
  disabled: boolean;
  checked?: boolean;
}
