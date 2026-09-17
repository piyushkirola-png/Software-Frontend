import { useMutation } from "@tanstack/react-query";
import { paymentService } from "../services/paymentService";

export function useInitiatePayment() {
  return useMutation({
    mutationFn: ({ orderId, gateway }: { orderId: number; gateway: string }) =>
      paymentService.initiate(orderId, gateway),
  });
}

export function useSimulateSuccess() {
  return useMutation({
    mutationFn: (paymentId: number) => paymentService.simulateSuccess(paymentId),
  });
}