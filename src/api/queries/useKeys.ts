import { useQuery } from "@tanstack/react-query";
import { keyService } from "../services/keyService";
import { useAuthContext } from "../../lib/AuthContext";

export function useMyKeys() {
  const { isAuthenticated } = useAuthContext();
  return useQuery({
    queryKey: ["keys", "my"],
    queryFn: () => keyService.getMyKeys(),
    enabled: isAuthenticated,
  });
}