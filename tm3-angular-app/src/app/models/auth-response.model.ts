import { User } from './user.model';

export interface AuthResponse {
  userId: string;
  firstName: string;
  lastName: string;
}
