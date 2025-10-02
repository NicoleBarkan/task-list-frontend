import { Role } from './role.model';

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  role: Role[];
  groupId: number;
  groupName: string;
}
