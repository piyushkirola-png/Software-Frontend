import { apiGet, apiPost, apiPut, apiClient, ApiResponse } from "../../lib/api-client";
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

const BACKEND_ROOT = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api"
).replace(/\/api\/?$/, "");

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

  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.post<ApiResponse<User>>(
      "/users/me/avatar",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data.data;
  },

  absoluteAvatarUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${BACKEND_ROOT}${path}`;
  },
};

export default userService;