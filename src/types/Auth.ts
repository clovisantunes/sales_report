// src/types/Auth.ts
export interface LoginData {
  email: string; 
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  initials: string;
}