export type Role = "USER" | "ADMIN";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: Role;
  isActive: boolean;
  createdAt?: string;
}