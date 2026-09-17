import { apiGet, apiPost, apiPut } from "../../lib/api-client";
import { User } from "../../types/user";

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const userService = {
  async getProfile(): Promise<User> {
    return apiGet<User>("/users/me");
  },

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    return apiPut<User>("/users/me", data);
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    return apiPost<void>("/users/me/change-password", data);
  },
};