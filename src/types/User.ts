export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  lastName: string;
  profilePhoto?: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginHistory {
  id: string;
  userId: string;
  loginAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export type CreateUserData = {
  email: string;
  password: string;
  name: string;
  lastName: string;
  profilePhoto?: string;
  isAdmin: boolean;
}

export type UpdateUserData = {
  email?: string;
  name?: string;
  lastName?: string;
  profilePhoto?: string;
  isAdmin?: boolean;
}