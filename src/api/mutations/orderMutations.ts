import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../services/orderService";
import { paymentService } from "../services/paymentService";
import { CheckoutRequest } from "../../types/order";

export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CheckoutRequest) => orderService.checkout(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useInitiatePayment() {
  return useMutation({
    mutationFn: ({ orderId, gateway }: { orderId: number; gateway: string }) =>
      paymentService.initiate(orderId, gateway),
  });
}

export function useSimulateSuccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: number) => paymentService.simulateSuccess(paymentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}