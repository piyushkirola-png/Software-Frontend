import { useQuery } from "@tanstack/react-query";
import { userService } from "../services/userService";
import { useAuthContext } from "../../lib/AuthContext";

export function useUserProfile() {
  const { isAuthenticated } = useAuthContext();
  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: () => userService.getProfile(),
    enabled: isAuthenticated,
  });
}