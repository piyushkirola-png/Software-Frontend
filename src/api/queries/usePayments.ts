import { useQuery } from "@tanstack/react-query";
import { paymentService } from "../services/paymentService";
import { useAuthContext } from "../../lib/AuthContext";

export function usePayment(paymentId: number) {
  const { isAuthenticated } = useAuthContext();
  return useQuery({
    queryKey: ["payment", paymentId],
    queryFn: () => paymentService.getById(paymentId),
    enabled: isAuthenticated && !!paymentId,
  });
}

export function usePaymentsForOrder(orderId: number) {
  const { isAuthenticated } = useAuthContext();
  return useQuery({
    queryKey: ["payments", "order", orderId],
    queryFn: () => paymentService.getForOrder(orderId),
    enabled: isAuthenticated && !!orderId,
  });
}