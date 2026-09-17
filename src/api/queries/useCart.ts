import { useQuery } from "@tanstack/react-query";
import { cartService } from "../services/cartService";
import { useAuthContext } from "../../lib/AuthContext";

export function useCart() {
  const { isAuthenticated } = useAuthContext();
  return useQuery({
    queryKey: ["cart"],
    queryFn: () => cartService.get(),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });
}

export function useCartCount() {
  const { isAuthenticated } = useAuthContext();
  return useQuery({
    queryKey: ["cart", "count"],
    queryFn: () => cartService.getCount(),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });
}