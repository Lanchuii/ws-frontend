export type UserRole = 'super_admin' | 'admin' | 'member';

export interface AuthUser {
  _id: string;
  email: string;
  username?: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  password_reset_required: boolean;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface SignupResult {
  user: AuthUser;
  verificationRequired: boolean;
}
