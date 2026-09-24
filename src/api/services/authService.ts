import { apiClient, apiGet, apiPost, ApiResponse } from "../../lib/api-client";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  SendOtpRequest,
  VerifyOtpRequest,
} from "../../types/auth";
import { User } from "../../types/user";

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    return apiPost<AuthResponse>("/auth/login", data);
  },

  async register(data: RegisterRequest): Promise<{ email: string }> {
    return apiPost<{ email: string }>("/auth/register", data);
  },

  async verifySignup(data: VerifyOtpRequest): Promise<AuthResponse> {
    return apiPost<AuthResponse>("/auth/verify-signup", data);
  },

  async sendOtp(data: SendOtpRequest): Promise<void> {
    return apiPost<void>("/auth/otp/send", data);
  },

  async verifyOtp(data: VerifyOtpRequest): Promise<void> {
    return apiPost<void>("/auth/otp/verify", data);
  },

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    return apiPost<void>("/auth/password/reset", data);
  },

  async logout(): Promise<void> {
    try {
      await apiPost<void>("/auth/logout");
    } catch {
      // Even if server rejects, clear local token
    }
  },

  async me(): Promise<User> {
    return apiGet<User>("/users/me");
  },
};
