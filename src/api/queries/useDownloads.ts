import { useQuery } from "@tanstack/react-query";
import { downloadService } from "../services/downloadService";
import { useAuthContext } from "../../lib/AuthContext";

export function useMyDownloads() {
  const { isAuthenticated } = useAuthContext();
  return useQuery({
    queryKey: ["downloads"],
    queryFn: () => downloadService.getMyDownloads(),
    enabled: isAuthenticated,
  });
}
