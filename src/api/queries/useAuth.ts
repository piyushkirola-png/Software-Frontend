import { useQuery } from "@tanstack/react-query";
import { authService } from "../services/authService";
import { useAuthContext } from "../../lib/AuthContext";

/** Get current authenticated user's profile (fresh from server). */
export function useProfile() {
  const { isAuthenticated } = useAuthContext();
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => authService.me(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}
