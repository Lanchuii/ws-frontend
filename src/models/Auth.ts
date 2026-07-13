export type UserRole = 'admin' | 'member';

export interface AuthUser {
  _id: string;
  email: string;
  username?: string;
  role: UserRole;
  is_active: boolean;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}
