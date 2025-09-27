import { Role } from '../models/role.model';

export interface AuthResponse {
  token: string;
  userId: number;
  firstName: string;
  lastName: string;
  role: Role[];
}
