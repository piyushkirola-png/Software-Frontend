import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  userService,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "../services/userService";

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => userService.updateProfile(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) =>
      userService.changePassword(data),
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
}