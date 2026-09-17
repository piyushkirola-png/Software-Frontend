import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { LoginRequest, RegisterRequest, ResetPasswordRequest } from "../../types/auth";

export function useLoginMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useRegisterMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useSendOtpMutation() {
  return useMutation({
    mutationFn: (email: string) => authService.sendOtp({ email }),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authService.resetPassword(data),
  });
}