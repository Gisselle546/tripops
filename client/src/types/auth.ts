export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}
