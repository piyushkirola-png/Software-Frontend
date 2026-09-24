import { useQuery } from "@tanstack/react-query";
import { orderService } from "../services/orderService";
import { useAuthContext } from "../../lib/AuthContext";

export function useMyOrders() {
  const { isAuthenticated } = useAuthContext();
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => orderService.getMyOrders(),
    enabled: isAuthenticated,
  });
}

export function useMyOrdersPaginated(page = 0, size = 10) {
  const { isAuthenticated } = useAuthContext();
  return useQuery({
    queryKey: ["orders", "paginated", page, size],
    queryFn: () => orderService.getMyOrdersPaginated(page, size),
    enabled: isAuthenticated,
  });
}

export function useMyOrdersFiltered(
  page = 0,
  size = 10,
  orderNumber?: string,
  status?: string,
  minTotal?: number,
  maxTotal?: number,
) {
  const { isAuthenticated } = useAuthContext();
  return useQuery({
    queryKey: [
      "orders",
      "filtered",
      page,
      size,
      orderNumber,
      status,
      minTotal,
      maxTotal,
    ],
    queryFn: () =>
      orderService.getMyOrdersFiltered(
        page,
        size,
        orderNumber,
        status,
        minTotal,
        maxTotal,
      ),
    enabled: isAuthenticated,
  });
}

export function useOrder(orderId: number) {
  const { isAuthenticated } = useAuthContext();
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getById(orderId),
    enabled: isAuthenticated && !!orderId,
  });
}
