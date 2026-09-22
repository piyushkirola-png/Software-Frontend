export type Role = "USER" | "ADMIN";
export type Gender = "MALE" | "FEMALE";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: Role;
  isActive: boolean;
  createdAt?: string;
  gender?: Gender | null;
  currentAddress?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
}
