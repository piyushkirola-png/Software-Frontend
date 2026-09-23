import { apiGet, apiPost } from "../../lib/api-client";
import { Payment, PaymentInitiateResponse } from "../../types/payment";

export const paymentService = {
  async initiate(
    orderId: number,
    gateway: string,
  ): Promise<PaymentInitiateResponse> {
    return apiPost<PaymentInitiateResponse>("/payments/initiate", {
      orderId,
      gateway,
    });
  },

  async getById(paymentId: number): Promise<Payment> {
    return apiGet<Payment>(`/payments/${paymentId}`);
  },

  async getForOrder(orderId: number): Promise<Payment[]> {
    return apiGet<Payment[]>(`/payments/order/${orderId}`);
  },

  async simulateSuccess(paymentId: number): Promise<Payment> {
    return apiPost<Payment>(`/payments/${paymentId}/simulate-success`);
  },
};
